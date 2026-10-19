import { requireUser } from "@/lib/auth";
import { IntelligenceError, validateCompanyProfile } from "@/lib/zenmux";

export async function GET(request: Request) {
  const { user, error, client } = await requireUser(request);
  if (!user || !client) return error!;
  const { data, error: dbError } = await client
    .from("windinsight_companies")
    .select("profile,updated_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (dbError)
    return Response.json(
      { error: "企业档案读取失败，请稍后重试" },
      { status: 503 },
    );
  return Response.json(
    { profile: data?.profile ?? null, updatedAt: data?.updated_at },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const { user, error, client } = await requireUser(request);
  if (!user || !client) return error!;
  try {
    if (Number(request.headers.get("content-length")) > 64_000)
      return Response.json(
        { error: "企业档案内容不超过 64000 字符。" },
        { status: 413 },
      );
    const text = await request.text();
    if (text.length > 64_000)
      return Response.json(
        { error: "企业档案内容不超过 64000 字符。" },
        { status: 413 },
      );
    const body = JSON.parse(text);
    const clean = validateCompanyProfile(body?.profile);
    const { error: dbError } = await client
      .from("windinsight_companies")
      .upsert(
        {
          user_id: user.id,
          profile: clean,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    if (dbError)
      return Response.json(
        { error: "企业档案保存失败，请稍后重试" },
        { status: 503 },
      );
    return Response.json({ profile: clean, message: "企业档案已安全保存" });
  } catch (error) {
    if (error instanceof IntelligenceError)
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    return Response.json({ error: "档案格式无效" }, { status: 400 });
  }
}
