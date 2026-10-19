# 治理数据研究与来源说明

人工核验日期：2026-10-19。数据入口：`lib/data.ts`。这是可追溯的人工种子资料集，不是已完成自动化更新的实时数据库。

## 组织资料与成员边界

- [GPAI 官方介绍及完整成员名单](https://oecd.ai/en/about-what-we-do)：当前页面为 46 个成员国与欧盟。不要继续沿用 2024 整合伙伴关系启动时“44”的旧数。
- [2026-02-20 GPAI 联合主席声明](https://oecd.ai/en/gpai-council-meeting-co-chairs-summary-statement-2026)：确认欢迎马耳他与沙特阿拉伯加入。
- [外交部：2026-07-16 成立 WAICO 协定签署](https://www.fmprc.gov.cn/wjbzhd/202607/t20260716_11984399.shtml)：首批 29 国签署，总部上海，直接列出中国、哈萨克斯坦、老挝、巴基斯坦、俄罗斯、印尼等。
- [驻阿塞拜疆大使署名文章，2026-07-27](https://www.fmprc.gov.cn/zwbd_673032/wjzs/202607/t20260727_11992693.shtml)：补充明确列举乌兹别克斯坦、吉尔吉斯斯坦、塔吉克斯坦、白俄罗斯、塞尔维亚、巴西等创始签署成员。
- [外交部 2026-08-12 讲话](https://www.fmprc.gov.cn/wjbzhd/202608/t20260812_12002547.shtml)：官方称 38 个国家成为创始成员国。
- [外交部 2026-09-07 驻伊朗大使文章](https://www.fmprc.gov.cn/wjdt_674879/zwbd_674895/202609/t20260907_12017244.shtml)：再次记载 38 国规模。

GPAI 与 WAICO 不是互斥军事/政治同盟。成员关系不能直接推出供应商可用性、数据合法性、出口管制适用性或某模型的商业许可。

## 旧项目只读复用

用户提供项目：`appgprj_6a5e4a271f1081919abefccc3c42d7a9`，标题《全球 AI 治理版图》。

- Sites 只读工具确认最新版本为 6，版本 ID `appgprj_6a5e4a271f1081919abefccc3c42d7a9~appgver_5f8e9ec42c508191a5cb33a2623943df`，源提交 `1c0b14216467b51849371d818dbaf503397af0bc`。
- 读取[在线页面](https://ai-governance-atlas-2026.thinkthinking.chatgpt.site)及公开构建产物 `/assets/page-iiGO9NLF.js`，没有修改原站点、访问权限或部署。
- 页面明确截至 2026-07-21；代码存有 GPAI 46 国、WAICO 首批 29 国、交叉 3 国（巴西、塞内加尔、塞尔维亚）的清单。
- 本项目将旧名单作为历史快照复用；WAICO 中尚未逐国找到现行官方证据的记录标记为“WAICO 历史快照待复核”。不能把地图 29 国展示成今天完整的 38 国名单；不能默认另 9 国身份。

`countries` 共 72 条，为 GPAI 46 国与 WAICO 历史 29 国并集。欧盟组织参与单独说明，不把欧盟计为国家。国家风险标签只是展示关注级别，不是经验证的风险指数；没有编造风险评分。企业名称为代表性生态观察对象，不代表已完成企业级实时情报采集。

## 政策与模型资料

15 条情报逐条包含发布日期、官方来源链接、状态、企业含义和标签。日期是事件/文件日期，不是爬取时刻；旧政策不应伪装成最近 24 小时新闻。

主要来源包括欧盟委员会 AI Act/通用模型实践准则、美国 BIS 与白宫、国家网信办、IMDA、日本 METI。法条、政策计划、软法指引、供应商合同各有效力边界，系统不能混为同一层面的“法律要求”。

模型库收录 10 个代表性候选/许可对照记录，并不声称是最新性能榜单。DeepSeek-R1、Qwen3、Gemma 3、Llama 4 等保留具体版本，避免将某版本的许可证泛化至全品牌。Gemma 3 自定义条款与 Gemma 4 Apache 2.0 的差异是一个重要示例。权重许可、托管 API 商业条款、部署地域和数据流向应分别审查。

- [Qwen3 官方仓库](https://github.com/QwenLM/Qwen3)
- [DeepSeek-R1 官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-R1)
- [Mistral Small 4 官方发布](https://mistral.ai/news/mistral-small-4/)
- [Gemma 4 官方模型卡](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Gemma 3 官方模型卡](https://huggingface.co/google/gemma-3-27b-it)
- [Llama 4 官方许可证](https://dev.meta.ai/llama/llama4/license)
- [OpenAI API 支持区域](https://help.openai.com/en/articles/5347006-openai-api-supported-countries-and-territories)
- [Anthropic 支持区域](https://www.anthropic.com/supported-countries)
- [Anthropic 所有权相关限制说明](https://www.anthropic.com/news/updating-restrictions-of-sales-to-unsupported-regions)
- [Gemini API 支持区域](https://ai.google.dev/gemini-api/docs/available-regions)
- [ZenMux 官方网络检索文档](https://docs.zenmux.ai/zh/guide/advanced/web-search)

## 可复现与当前局限

- 组织扩容的总数与逐国名录可能更新不同步；程序必须保留版本、来源和核验状态。
- 社媒检索结果是线索；官方来源未确认时应显示待核实，不混入官方事实库。
- 模型能力使用“候选”描述，必须通过企业自己的数据与任务评测后选型。
- 当前没有系统性覆盖各国全部法律，也没有作任何公司在具体交易中合规的判断。
- 检索失败、证据不足、企业信息缺失或政策冲突应触发人工确认，不补造法律结论。


## 地图几何来源与归属

世界其他区域使用 Natural Earth；中国整体范围使用 [DataV GeoAtlas 中国全域几何](https://geo.datav.aliyun.com/areas_v3/bound/100000.json)。[阿里云文档](https://help.aliyun.com/zh/datav/datav-6-0/user-guide/datav-geoatlas-widget/)说明 GeoAtlas 行政区域数据来自高德。中国全域几何保留全部277个组成部分，台湾、香港、澳门均归入统一的 CN 国家对象；西藏、新疆包含在中国整体范围内，不增加特别地区标签。替换后移除旧底图的独立台湾/香港/澳门以及对应重复岛礁对象，中国几何置于上层避免旧边线穿透。

重建脚本：`node scripts/update-china-map.mjs`；回归验证：`node --test tests/map-integrity.test.mjs`。此来源不是自然资源部直接发布的标准地图文件，不编造或套用审图号。
