import { requireUser } from "@/lib/auth";
import { DATA_UPDATED_AT, signals as curatedSignals } from "@/lib/data";
import {
  checkAiRateLimit,
  generateStrategy,
  IntelligenceError,
  validateCompanyProfile,
  type StrategyEvidence,
} from "@/lib/zenmux";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  const { user, error, client } = await requireUser(request);
  if (!user)
    return (
      error ??
      Response.json({ error: "请先登录后生成企业策略。" }, { status: 401 })
    );
  try {
    if (Number(request.headers.get("content-length")) > 24_000)
      return Response.json({ error: "企业档案内容过大。" }, { status: 413 });
    const text = await request.text();
    if (text.length > 24_000)
      return Response.json({ error: "企业档案内容过大。" }, { status: 413 });
    const body = JSON.parse(text);
    if (!body || typeof body !== "object")
      return Response.json({ error: "请提供企业档案。" }, { status: 400 });
    const profile = validateCompanyProfile(body.profile ?? body);
    checkAiRateLimit(user.id, "strategy");
    const geography = [
      ...(profile.markets ?? []),
      profile.headquarters ?? "",
    ].join(" ");
    const allRegions = /全球|global|world/i.test(geography);
    const codes = [
      ...(/中国|China|CN/i.test(geography) ? ["CN"] : []),
      ...(/美国|United States|US/i.test(geography) ? ["US"] : []),
      ...(/欧盟|欧洲|EU|Europe/i.test(geography) ? ["EU"] : []),
      ...(/新加坡|Singapore|SG/i.test(geography) ? ["SG"] : []),
    ];
    const ranked = curatedSignals
      .filter((signal) => signal.status === "已核实")
      .map((signal) => ({
        signal,
        score:
          (signal.impact === "高" ? 2 : 0) +
          (codes.includes(signal.country) || allRegions ? 3 : 0) +
          (signal.category === "市场准入" ? 2 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .map(({ signal }) => signal);
    const selected: typeof curatedSignals = [];
    for (const code of allRegions ? ["CN", "US", "EU", "SG"] : codes) {
      const regional = ranked.find((signal) => signal.country === code);
      if (regional && !selected.some((signal) => signal.id === regional.id))
        selected.push(regional);
    }
    const openWeights = ranked.find((signal) => signal.id === "qwen3-open");
    if (openWeights && !selected.some((signal) => signal.id === openWeights.id))
      selected.push(openWeights);
    for (const signal of ranked) {
      if (selected.length >= 6) break;
      if (!selected.some((entry) => entry.id === signal.id))
        selected.push(signal);
    }
    const evidence: StrategyEvidence[] = selected.map((signal) => ({
      title: `${signal.source} · ${signal.title}`,
      url: signal.sourceUrl,
      summary: `${signal.summary} 企业含义：${signal.implication}`,
      date: signal.date,
      sourceType: "official_snapshot",
      checkedAt: DATA_UPDATED_AT,
    }));
    // User-created history remains social evidence, never promoted to official status.
    try {
      if (client) {
        const recent = await client
          .from("windinsight_searches")
          .select("payload,created_at")
          .eq("user_id", user.id)
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 86_400_000).toISOString(),
          )
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        const payload = recent.data?.payload;
        if (
          payload &&
          typeof payload === "object" &&
          Array.isArray(payload.signals)
        ) {
          for (const signal of payload.signals.slice(0, 3)) {
            if (
              typeof signal?.sourceUrl !== "string" ||
              !/^https:\/\//.test(signal.sourceUrl)
            )
              continue;
            evidence.push({
              title: String(signal.title ?? "近期社媒线索").slice(0, 200),
              url: signal.sourceUrl,
              summary: String(signal.summary ?? "").slice(0, 1200),
              date:
                typeof signal.publishedAt === "string"
                  ? signal.publishedAt
                  : recent.data?.created_at,
              sourceType: "social_signal",
            });
          }
        }
      }
    } catch {
      /* Source snapshots remain usable when history is unavailable. */
    }
    const report = await generateStrategy(
      profile,
      Array.isArray(body.signals) ? body.signals.slice(0, 8) : [],
      evidence,
    );
    let persistence = "unavailable";
    try {
      if (client) {
        const saved = await client
          .from("windinsight_reports")
          .insert({ user_id: user.id, payload: report });
        persistence = saved.error ? "failed" : "saved";
      }
    } catch {
      persistence = "failed";
    }
    return Response.json(
      { ...report, persistence },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof SyntaxError)
      return Response.json(
        { error: "请求必须是有效的 JSON。" },
        { status: 400 },
      );
    if (error instanceof IntelligenceError)
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    return Response.json(
      { error: "策略生成暂时不可用，请重试。" },
      { status: 500 },
    );
  }
}
