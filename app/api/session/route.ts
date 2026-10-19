import { requireUser } from "@/lib/auth";
export async function GET(request: Request) {
  const { user } = await requireUser(request);
  return Response.json({ user }, { headers: { "Cache-Control": "no-store" } });
}
