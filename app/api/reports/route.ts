import { requireUser } from "@/lib/auth";
export async function GET(request: Request) {
  const { user, error, client } = await requireUser(request);
  if (!user || !client) return error!;
  const { data, error: dbError } = await client
    .from("windinsight_reports")
    .select("id,payload,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(15);
  if (dbError)
    return Response.json({ error: "历史报告读取失败" }, { status: 503 });
  return Response.json(
    { reports: data },
    { headers: { "Cache-Control": "no-store" } },
  );
}
