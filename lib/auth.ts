import { cookies } from "next/headers";
import { createClient, type Session } from "@supabase/supabase-js";

export function supabaseClient(token?: string) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase 尚未配置");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    ...(token
      ? { global: { headers: { Authorization: `Bearer ${token}` } } }
      : {}),
  });
}

export async function saveSession(session: Session) {
  const jar = await cookies();
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  jar.set("wi-access", session.access_token, {
    ...options,
    maxAge: session.expires_in,
  });
  jar.set("wi-refresh", session.refresh_token, {
    ...options,
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete("wi-access");
  jar.delete("wi-refresh");
}

export function checkOrigin(request: Request): Response | undefined {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json({ error: "请求来源不匹配" }, { status: 403 });
}

export async function requireUser(request: Request) {
  const originError =
    request.method !== "GET" ? checkOrigin(request) : undefined;
  if (originError) return { user: null, error: originError };
  try {
    const jar = await cookies();
    let token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      jar.get("wi-access")?.value;
    const client = supabaseClient();
    if (token) {
      const { data, error } = await client.auth.getUser(token);
      if (!error && data.user)
        return {
          user: { id: data.user.id, email: data.user.email },
          token,
          client: supabaseClient(token),
        };
    }
    const refresh = jar.get("wi-refresh")?.value;
    if (refresh) {
      const { data, error } = await client.auth.refreshSession({
        refresh_token: refresh,
      });
      if (!error && data.session && data.user) {
        await saveSession(data.session);
        token = data.session.access_token;
        return {
          user: { id: data.user.id, email: data.user.email },
          token,
          client: supabaseClient(token),
        };
      }
    }
    return {
      user: null,
      error: Response.json(
        { error: "请先登录以保存企业档案和使用实时 AI 服务" },
        { status: 401 },
      ),
    };
  } catch {
    return {
      user: null,
      error: Response.json(
        { error: "账号服务暂不可用，请稍后重试" },
        { status: 503 },
      ),
    };
  }
}
