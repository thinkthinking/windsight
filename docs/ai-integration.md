# windsight AI 接入与证据边界

实时检索采用 ZenMux 的 `POST /api/v1/responses`、`x-ai/grok-4.7` 与 `tools: [{ type: "x_search" }]`。检索有日期窗口、一次检索提示与最大工具调用限制；每个实例按用户设置基本频率限制。所有付费入口要求真实登录会话，服务端保存密钥。单次上游请求最多等待 75 秒，超时返回明确错误。

`POST /api/intelligence` 接收 `{ keyword, regions?, days? }`。`signals` 仅包含与模型供应商返回的 URL 引用匹配的社媒线索，仍标记为 `social_signal`，不表示完成官方交叉核验。未匹配引用的候选摘要保留在 `candidates`，标记为 `unverified`。没有实际搜索活动、结果不完整、超时和服务故障均不会伪装成成功检索。`GET /api/intelligence` 读取当前用户最近一次已保存结果，不触发新的付费请求。

`POST /api/strategy` 接收 `{ profile, signals? }`。服务端按企业市场、注册地挑选最多 6 条人工核验的官方历史快照，并读取用户最近 7 天内最后一次搜索的最多 3 条社媒线索。来源保留日期、快照核验日期与身份。用户提交的观察线索不升级为官方来源。本次策略生成不联网；模型只根据提供的证据快照给出分析，法律适用与供应商条款需按当前实际业务复核。

AI 服务故障、缺少密钥、结构化内容不完整时，企业报告返回 `mode: "rules"` 与明确提示，保留可用的来源快照。规则覆盖数据分级、跨区域处理、供应商限制、开放权重许可和替代路线。对中国团队、新加坡注册、服务全球的虚拟 AI 聚合平台，特别提示注册地不能自动解除上游限制，隐私规则按实际业务触发判断。

报告和检索分别保存至 `windinsight_reports`、`windinsight_searches`；存储故障不使已经完成的分析丢失，响应的 `persistence` 明确告知是否保存。频率限制目前为单实例内存计数；跨实例统一配额与定时采集属于后续工作。

验证命令：`node --test tests/ai-boundaries.test.mjs`。真实小额 X 搜索探针见 [live-search-proof.json](./live-search-proof.json)，仅保留模型、工具计数、最终文本与引用，不含密钥或账户信息。

协议参考：[ZenMux 网络搜索](https://docs.zenmux.ai/zh/guide/advanced/web-search)、[Responses API](https://docs.zenmux.ai/zh/api/openai/openai-responses)、[结构化输出](https://docs.zenmux.ai/zh/guide/advanced/structured-output)、[xAI X Search](https://docs.x.ai/developers/tools/x-search)。
