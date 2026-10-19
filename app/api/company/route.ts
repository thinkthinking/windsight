import { requireUser } from "@/lib/auth";

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
    const { profile } = await request.json();
    if (
      !profile ||
      typeof profile !== "object" ||
      typeof profile.name !== "string" ||
      !profile.name.trim() ||
      JSON.stringify(profile).length > 20000
    )
      return Response.json(
        { error: "请填写企业名称，档案内容不超过 20000 字符" },
        { status: 400 },
      );
    const strings = [
      "name",
      "website",
      "industry",
      "headquarters",
      "dataSensitivity",
      "deployment",
      "description",
    ];
    const clean: Record<string, string | string[]> = {};
    for (const key of strings)
      clean[key] =
        typeof profile[key] === "string"
          ? profile[key].slice(0, 4000).trim()
          : "";
    for (const key of ["markets", "useCases"])
      clean[key] = Array.isArray(profile[key])
        ? profile[key]
            .filter((v: unknown) => typeof v === "string")
            .slice(0, 30)
            .map((v: string) => v.slice(0, 100))
        : [];
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
  } catch {
    return Response.json({ error: "档案格式无效" }, { status: 400 });
  }
}
