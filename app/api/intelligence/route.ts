import { requireUser } from "@/lib/auth";
import {
  checkAiRateLimit,
  IntelligenceError,
  searchIntelligence,
} from "@/lib/zenmux";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function GET(request: Request) {
  const { user, error, client } = await requireUser(request);
  if (!user || !client)
    return error ?? Response.json({ error: "请先登录。" }, { status: 401 });
  const { data, error: readError } = await client
    .from("windinsight_searches")
    .select("id,payload,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (readError)
    return Response.json({ error: "暂时无法读取历史检索。" }, { status: 503 });
  return Response.json(
    { search: data?.payload ?? null, createdAt: data?.created_at ?? null },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  const { user, error, client } = await requireUser(request);
  if (!user)
    return (
      error ??
      Response.json({ error: "请先登录后使用实时检索。" }, { status: 401 })
    );
  try {
    if (Number(request.headers.get("content-length")) > 12_000) {
      return Response.json({ error: "请求内容过大。" }, { status: 413 });
    }
    const text = await request.text();
    if (text.length > 12_000)
      return Response.json({ error: "请求内容过大。" }, { status: 413 });
    const body = JSON.parse(text);
    if (
      !body ||
      typeof body !== "object" ||
      (body.keyword !== undefined && typeof body.keyword !== "string")
    ) {
      return Response.json(
        { error: "请输入有效的检索关键词。" },
        { status: 400 },
      );
    }
    const regions = Array.isArray(body.regions)
      ? body.regions
          .filter((item: unknown) => typeof item === "string")
          .slice(0, 10)
          .map((item: string) => item.slice(0, 80))
      : [];
    const days =
      typeof body.days === "number"
        ? Math.max(1, Math.min(30, Math.round(body.days)))
        : 7;
    checkAiRateLimit(user.id, "search");
    const result = await searchIntelligence(body.keyword ?? "", regions, days);
    let persistence = "unavailable";
    try {
      if (client) {
        const saved = await client
          .from("windinsight_searches")
          .insert({ user_id: user.id, payload: result });
        persistence = saved.error ? "failed" : "saved";
      }
    } catch {
      persistence = "failed";
    }
    return Response.json(
      { ...result, persistence },
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
        { error: error.message, code: error.code, mode: "error" },
        { status: error.status },
      );
    return Response.json(
      { error: "检索暂时不可用，请重试。", mode: "error" },
      { status: 500 },
    );
  }
}
