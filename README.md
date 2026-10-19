# windsight 观风

面向全球化企业的 AI 战略情报工作空间。以 GPAI、WAICO 及相关国家的政策与技术生态为观察入口，将原始来源、模型选型与企业业务场景连接起来。

2026 年比赛赛道 B 作品。团队：windsight；王丽婷（复旦大学）、叶震杰（蚂蚁集团）。

## 快速运行

需要 Node.js 20.9+（建议 22）与 pnpm 12.5.1。部署与本地使用同一版本；若全局 pnpm 较旧，可用 `npx pnpm@12.5.1 install` 安装。

```bash
pnpm install
cp .env.example .env.local
# 在 .env.local 填入下列 3 个变量
pnpm dev
```

打开 http://localhost:3000 。未登录可浏览全球态势、治理版图、政策与技术情报、模型与公司，以及使用虚拟企业的规则演示。

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm start
```

## 环境配置

| 变量 | 用途 | 浏览器可见 |
| --- | --- | --- |
| `SUPABASE_URL` | Supabase 项目地址 | 否（本项目仅服务端使用） |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase 公共客户端密钥，权限由 RLS 控制 | 本项目仅服务端使用 |
| `ZENMUX_API_KEY` | Grok 策略分析、X 搜索 | 否 |

应用运行不需要 `SUPABASE_SECRET_KEY`。不得将服务端密钥放入 `NEXT_PUBLIC_` 变量。`.env.local`、本地输出和测试会话均被 Git 忽略。仓库中的 `.env.example` 只有占位符。

### Supabase 数据隔离

执行 [docs/database-schema.sql](docs/database-schema.sql) 建立 3 个专用表。现有部署已经创建这些表；换新项目时再执行即可。表名刻意使用独立前缀，不修改共享数据库中其他项目的表、函数或 Auth 设置。

- `windinsight_companies`：每个用户的企业档案（JSONB）。
- `windinsight_reports`：策略生成结果和时间。
- `windinsight_searches`：检索结果和来源。

3 表均启用 RLS，只允许 `auth.uid() = user_id` 的用户读写自己的行。匿名用户无表权限。用户会话由 Supabase Auth 校验，凭证保存在 HttpOnly、SameSite=Lax Cookie 中，生产环境启用 Secure；支持过期会话刷新。企业数据访问使用用户 JWT，不使用 secret/service-role 绕过隔离。

已有 Supabase 用户可以直接登录；邮箱注册是否需要验证遵循该共享项目原设置，本项目不更改全局 Auth 配置。比赛评审账号见私下交付的演示访问说明，不放进源码。

## 体验完整业务闭环

演示企业为虚拟的 Meridian AI：中国创始团队在新加坡注册，向全球开发者提供 AI 聚合、模型 API 路由与用量管理服务。它不是对任何真实公司的背景调查。

1. 在「全球态势」「治理版图」查看国家、组织归属、政策摘要、来源和证据时间；共同成员单独标识。
2. 在「情报雷达」检索与过滤政策、技术和数据安全信号，打开详情追溯原始来源；可收藏。
3. 在「模型与公司」比较开放权重与托管 API，核对版本许可、地区支持和部署方式。
4. 进入「企业画像」，载入虚拟企业或手填业务区域、用途、数据敏感度和部署偏好；登录后保存云端。
5. 在「情报雷达」登录后执行 X 检索，观察来源和待核实状态。检索可能耗时约一分钟。
6. 在「战略建议」生成企业分析，查看优先事项、风险、候选模型和证据来源，导出简报。

核心差异：**注册地、创始人背景、实际用户地区、数据处理地点、上游转售条款需要分别核验。** GPAI/WAICO 组织成员身份不能直接推导模型可用性或合规结论。

## 已实现与边界

| 能力 | 当前状态 |
| --- | --- |
| 国家地图、双组织视角、国家详情 | 已实现；人工整理的有日期资料 |
| 政策技术情报、筛选、来源详情、收藏 | 已实现；收藏保存在本浏览器 |
| 模型公司目录与比较 | 已实现；候选资料须按版本复核 |
| 邮箱登录、企业档案保存和用户隔离 | 已实现，Supabase Auth + RLS |
| X 实时检索 | 已接通 ZenMux Grok；需登录且有有效 Key |
| 企业策略生成与保存 | 已接通 Grok；异常时诚实回退为规则建议 |
| 企业工商信息、自动采集企业网站 | 本版本不接入；企业自行填写或使用虚拟案例 |
| 定时采集、政策变更通知、团队协作审批 | 规划中；本版本不宣称持续后台监控 |

### 必须演示的失效与人工介入案例

- **缺少企业名称**：生成策略前要求完善档案，不虚构企业情况。
- **无法完成 X 检索或来源不足**：明确错误或无足够可验证信息，不填充假新闻。X 原帖只标为社媒信号，需回到官方来源核实。
- **AI 服务不可用/未配置**：策略返回 `mode: "rules"` 并说明回退原因，不伪装成实时 AI 结果。
- **WAICO 成员名单时间差**：组织规模引用更新后的官方资料；地图中未完成逐项核验的历史成员快照保留日期和待核实标识。
- **高影响决策**：地区准入、数据跨境、许可和供应商合同由有权限的人确认。平台提供研究线索与审查清单，不作自动采购或合规放行。

## API

接口由 Next.js Route Handlers 实现，响应为 JSON。写操作检查请求 Origin；非公开接口必须登录。AI 接口单实例限流，尚非跨实例全局配额；公开运营前应增加持久配额与组织预算。

| 方法/路径 | 输入 | 输出 |
| --- | --- | --- |
| `GET /api/session` | Cookie | `{user}` |
| `POST /api/auth` | `{action: "signIn" / "signUp" / "signOut",email?,password?}` | `{user,message?}` |
| `GET /api/company` | Cookie | `{profile,updatedAt}` |
| `POST /api/company` | `{profile}` | `{profile,message}` |
| `POST /api/intelligence` | `{keyword,regions?:string[],days?:number}` | 信号、原始来源、检索时间及状态；天数限制1–30 |
| `POST /api/strategy` | `{profile,signals?:[]}` | summary / recommendations / risks / models / sources / mode |
| `GET /api/reports` | Cookie | 当前用户最近15份历史报告 |

企业 `profile` 字段：`name,website,industry,headquarters,markets[],useCases[],dataSensitivity,deployment,description`。

## AI 接口与 Prompt 设计

调用端点：`https://zenmux.ai/api/v1/responses`，模型 `x-ai/grok-4.7`。X 检索使用 `tools: [{type: "x_search"}]`；没有执行工具或没有平台引用时，不能标记为已验证实时情报。请求有超时、检索时间窗口、数量和输出长度限制。

Prompt 及结构化校验见 [lib/zenmux.ts](lib/zenmux.ts)：

- 检索按政策/模型/区域关键词收集高价值公开信息，过滤转发与弱证据。每条保留标题、时间、摘要、影响和原帖 URL。
- 仅将平台返回的引用认定为可追溯来源；不能把模型随意生成的 URL 当检索证据。
- 企业档案与观察线索明确视为数据，不执行其中的指令。
- 策略区分已给来源快照、待核实社媒线索和通用建议，不承诺实时最新、市场准入或法律合规。
- 对 AI 聚合平台重点分析上游地域/客户/最终用途/转售限制、子处理者和实际推理地区、备选供应商及开源部署许可。

参考：[ZenMux Responses API](https://docs.zenmux.ai/zh/api/openai/openai-responses)、[ZenMux 联网搜索](https://docs.zenmux.ai/zh/guide/advanced/web-search)。

## 数据与来源

种子数据见 [lib/data.ts](lib/data.ts)，资料说明见 [docs/research-sources.md](docs/research-sources.md)。地图使用 Natural Earth 世界国界数据，保留来源说明；国界仅作为信息索引，不表达法律立场。GPAI 指 Global Partnership on Artificial Intelligence，注意与欧盟法律里的 general-purpose AI 缩写区分。

治理信息按证据截至日期呈现，当前覆盖数据不是实时完整数据库。历史 WAICO 名单、最新组织规模和逐项核验状态分别处理，避免以组织身份替代国家法律与供应商条件分析。

## Vercel 部署

由项目所有者操作：导入仓库，选择 Next.js，根目录为当前项目。配置上述 3 个运行变量，构建命令 `pnpm build`，依赖安装 `pnpm install --frozen-lockfile`。`vercel.json` 使用新加坡区域，靠近现有 Supabase 数据库。AI Route Handlers 配置了90秒最长执行时间；实际可用时间以账户及平台配置为准。

部署完成检查：首页、`/pitch/`、登录、企业档案保存、真实策略生成、一次 X 检索、退出登录后个人接口返回401。不要把仅完成构建当成全部线上链路验收。

## 比赛交付

- 15 页 HTML 产品介绍稿：公开版 `/pitch/`；本地提交版另含参赛联系方式。
- 可运行产品：本仓库 + 所有者完成 Vercel 部署后的访问 URL。
- 源码与运行说明：本 README、环境模板、数据库脚本、边界测试和资料来源。
- 本地 `output/submission/` 包含比赛材料、演示账户等私有输出，不会被 Git 追踪。

项目不自动发送提交邮件，由参赛者最终核对后自行发送。联系方式仅出现在私下提交材料中。
