import { requireUser } from "@/lib/auth";
import { DATA_UPDATED_AT, signals as curatedSignals } from "@/lib/data";
import {
  checkAiRateLimit,
  generateStrategy,
  IntelligenceError,
  validateCompanyProfile,
  selectStrategyProfile,
  strategyMarketCodes,
  publicEvidenceSnapshot,
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
    if (Number(request.headers.get("content-length")) > 64_000)
      return Response.json({ error: "企业档案内容过大。" }, { status: 413 });
    const text = await request.text();
    if (text.length > 64_000)
      return Response.json({ error: "企业档案内容过大。" }, { status: 413 });
    const body = JSON.parse(text);
    if (!body || typeof body !== "object")
      return Response.json({ error: "请提供企业档案。" }, { status: 400 });
    const profile = validateCompanyProfile(body.profile ?? body);
    if (
      body.selectedBusinessId != null &&
      typeof body.selectedBusinessId !== "string"
    )
      return Response.json({ error: "业务标识格式无效。" }, { status: 400 });
    const selectedBusinessId =
      typeof body.selectedBusinessId === "string"
        ? body.selectedBusinessId.trim().slice(0, 120)
        : undefined;
    const analysisProfile = selectStrategyProfile(profile, selectedBusinessId);
    checkAiRateLimit(user.id, "strategy");
    const codes = strategyMarketCodes(analysisProfile);
    // Use the same owner-published records as the public feed; readers cannot publish here.
    const publicEvidence: { evidence: StrategyEvidence; country: string }[] =
      [];
    try {
      if (client) {
        const recent = await client
          .from("windinsight_public_events")
          .select("payload,updated_at")
          .order("published_at", { ascending: false })
          .limit(24);
        if (Array.isArray(recent.data)) {
          for (const row of recent.data) {
            const item = row.payload;
            const snapshot = publicEvidenceSnapshot(item, row.updated_at);
            if (snapshot)
              publicEvidence.push({
                evidence: snapshot,
                country: typeof item?.country === "string" ? item.country : "",
              });
          }
        }
      }
    } catch {
      /* Static official snapshots remain usable when the public store is unavailable. */
    }
    const publicOfficial = publicEvidence
      .filter((entry) => entry.evidence.sourceType === "official_snapshot")
      .sort(
        (a, b) =>
          Number(codes.includes(b.country)) -
            Number(codes.includes(a.country)) ||
          (b.evidence.date ?? "").localeCompare(a.evidence.date ?? ""),
      )
      .slice(0, 3)
      .map((entry) => entry.evidence);
    const ranked = curatedSignals
      .filter((signal) => signal.status === "已核实")
      .map((signal) => ({
        signal,
        score:
          (signal.impact === "高" ? 2 : 0) +
          (codes.includes(signal.country) ? 3 : 0) +
          (signal.category === "市场准入" ? 2 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .map(({ signal }) => signal);
    const selected: typeof curatedSignals = [];
    for (const code of codes) {
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
    const curatedEvidence: StrategyEvidence[] = selected
      .slice(0, 6)
      .map((signal) => ({
        title: `${signal.source} · ${signal.title}`,
        url: signal.sourceUrl,
        summary: `${signal.summary} 企业含义：${signal.implication}`,
        date: signal.date,
        sourceType: "official_snapshot",
        checkedAt: DATA_UPDATED_AT,
      }));
    const evidence: StrategyEvidence[] = [];
    function addEvidence(item: StrategyEvidence, limit: number) {
      if (
        evidence.length < limit &&
        !evidence.some(
          (existing) =>
            existing.url.replace(/\/$/, "") === item.url.replace(/\/$/, ""),
        )
      )
        evidence.push(item);
    }
    for (const item of [...publicOfficial, ...curatedEvidence])
      addEvidence(item, 6);
    for (const entry of publicEvidence
      .filter((entry) => entry.evidence.sourceType === "social_signal")
      .slice(0, 3))
      addEvidence(entry.evidence, 9);
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
            addEvidence(
              {
                title: String(signal.title ?? "近期社媒线索").slice(0, 200),
                url: signal.sourceUrl,
                summary: String(signal.summary ?? "").slice(0, 1200),
                date:
                  typeof signal.publishedAt === "string"
                    ? signal.publishedAt
                    : recent.data?.created_at,
                sourceType: "social_signal",
              },
              9,
            );
          }
        }
      }
    } catch {
      /* Source snapshots remain usable when history is unavailable. */
    }
    const report = await generateStrategy(
      analysisProfile,
      Array.isArray(body.signals) ? body.signals.slice(0, 8) : [],
      evidence,
    );
    const reportWithProfile = {
      ...report,
      profileSnapshot: profile,
      selectedBusinessId: selectedBusinessId || null,
    };
    let persistence = "unavailable";
    try {
      if (client) {
        const saved = await client
          .from("windinsight_reports")
          .insert({ user_id: user.id, payload: reportWithProfile });
        persistence = saved.error ? "failed" : "saved";
      }
    } catch {
      persistence = "failed";
    }
    return Response.json(
      { ...reportWithProfile, persistence },
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
