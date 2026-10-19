import {
  checkOrigin,
  clearSession,
  requireUser,
  saveSession,
  supabaseClient,
} from "@/lib/auth";

export async function POST(request: Request) {
  const rejected = checkOrigin(request);
  if (rejected) return rejected;
  try {
    const body = await request.json();
    if (body.action === "signOut") {
      const session = await requireUser(request);
      if (session.token)
        await supabaseClient().auth.admin.signOut(session.token, "local");
      await clearSession();
      return Response.json({ user: null });
    }
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 8 ||
      password.length > 128
    )
      return Response.json(
        { error: "请输入有效邮箱和至少 8 位密码" },
        { status: 400 },
      );
    if (body.action !== "signIn" && body.action !== "signUp")
      return Response.json({ error: "未知账号操作" }, { status: 400 });
    const client = supabaseClient();
    const { data, error } =
      body.action === "signUp"
        ? await client.auth.signUp({ email, password })
        : await client.auth.signInWithPassword({ email, password });
    if (error)
      return Response.json(
        {
          error:
            error.code === "email_not_confirmed"
              ? "请先在邮件中确认账号，再登录"
              : body.action === "signUp"
                ? "注册未完成，请检查邮箱或稍后重试"
                : "登录失败，请检查邮箱、密码及邮箱确认状态",
        },
        { status: 400 },
      );
    if (data.session) await saveSession(data.session);
    return Response.json({
      user:
        data.session && data.user
          ? { id: data.user.id, email: data.user.email }
          : null,
      message: data.session
        ? "登录成功"
        : "注册申请已提交，请通过确认邮件验证邮箱后登录",
    });
  } catch {
    return Response.json(
      { error: "账号服务暂不可用，请稍后重试" },
      { status: 503 },
    );
  }
}
