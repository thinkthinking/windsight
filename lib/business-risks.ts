/** Source review: 2026-10-19. These are scoped screening prompts, not entity-level legal determinations. */
export type BusinessRisk = {
  id: string;
  title: string;
  summary: string;
  markets: string[];
  providers: string[];
  severity: "high" | "medium";
  status: "供应商限制" | "适用性核验" | "监管义务";
  effectiveDate?: string;
  sources: { title: string; url: string }[];
  action: string;
};

export const businessRisks: BusinessRisk[] = [
  {
    id: "openai-unsupported-cn-ru",
    title: "中国大陆与俄罗斯不在 OpenAI API 支持地区名单",
    summary:
      "截至 2026-10-19，OpenAI 官方 API 支持名单未列中国大陆和俄罗斯。官方说明，在名单以外地区访问或提供访问可能导致账户封禁或暂停。这是供应商服务地区限制，不能归为中国的外部模型进口禁令。",
    markets: ["中国", "中国大陆", "俄罗斯"],
    providers: ["OpenAI", "GPT", "ChatGPT"],
    severity: "high",
    status: "供应商限制",
    sources: [
      {
        title: "OpenAI API 官方支持国家和地区（2026-10-19 核验）",
        url: "https://help.openai.com/en/articles/5347006-openai-api-supported-countries-and-territories",
      },
    ],
    action:
      "核对终端用户实际使用地与供应商合同。不要用新加坡注册地或备用线路自动放行中国大陆、俄罗斯请求；评估获得明确授权且适用的替代服务。",
  },
  {
    id: "anthropic-regions-control",
    title: "Claude 同时核验使用地区与多数所有权或控制关系",
    summary:
      "Anthropic 已公布的地区政策更新于 2026-11-12 生效，涉及地区、设立/总部及多数拥有或控制关系。当前资格仍需依据现行合同与供应商支持信息核验，不能将尚未生效条款直接当作今日结论。新加坡注册或团队国籍均不足以单独判断。",
    markets: ["中国", "中国大陆", "俄罗斯", "新加坡", "全球"],
    providers: ["Anthropic", "Claude"],
    severity: "high",
    status: "供应商限制",
    effectiveDate: "2026-11-12",
    sources: [
      {
        title: "Anthropic 当前 Supported Regions Policy",
        url: "https://www.anthropic.com/legal/supported-regions",
      },
      {
        title: "2026-10-08 公告：更新使用政策于 11-12 生效",
        url: "https://www.anthropic.com/news/2026-usage-policy-update",
      },
    ],
    action:
      "立即按现行政策整理签约主体、实际控制与多数权益、人员及客户使用地区，向供应商书面确认资格；把 11 月 12 日记录为本次公告政策更新日期，不推定此前没有限制。",
  },
  {
    id: "aggregator-resale-authorization",
    title: "API 聚合、应用集成与账户转售需要分别核对",
    summary:
      "Anthropic 商业条款 D.4 限制未经其明确批准的服务转售。OpenAI 协议允许客户应用集成 API，同时禁止转售账户访问和买卖、转移 API Key。不能把一般应用集成权理解为任何聚合转售模式都已获授权。",
    markets: ["全球", "新加坡", "美国", "欧盟", "中国", "俄罗斯"],
    providers: ["OpenAI", "GPT", "Anthropic", "Claude"],
    severity: "high",
    status: "适用性核验",
    sources: [
      {
        title: "Anthropic Commercial Terms · D.4",
        url: "https://www.anthropic.com/legal/commercial-terms",
      },
      {
        title: "OpenAI Services Agreement · 2.2 / 3.1 / 3.3",
        url: "https://openai.com/policies/services-agreement/",
      },
    ],
    action:
      "向上游明确展示 API 聚合、计费和终端用户模式，核对订单与书面转售授权、地区和用途限制。不要向客户交付上游账户或 API Key，不以其他路由规避限制。",
  },
  {
    id: "china-public-generative-ai",
    title: "面向中国境内公众的生成式 AI 服务需核验适用义务",
    summary:
      "《生成式人工智能服务管理暂行办法》自 2023-08-15 施行，第二条针对面向境内公众的生成式服务。未向境内公众提供服务的研发、内部应用不适用本办法。该文件不能概括为对全部境外模型的统一进口禁令。",
    markets: ["中国", "中国大陆"],
    providers: ["OpenAI", "GPT", "Anthropic", "Claude", "其他模型"],
    severity: "high",
    status: "监管义务",
    effectiveDate: "2023-08-15",
    sources: [
      {
        title: "国家网信办 · 生成式人工智能服务管理暂行办法（2023-07-13 发布）",
        url: "https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm",
      },
    ],
    action:
      "先区分内部工具、企业客户与面向境内公众的服务，核验提供者角色、内容与个人信息责任；具舆论属性或社会动员能力等条件时，再判断安全评估和算法备案要求。",
  },
  {
    id: "china-data-transfer",
    title: "向境外模型传输数据应按实际数据流判断",
    summary:
      "2024-03-22《促进和规范数据跨境流动规定》区分个人信息、敏感个人信息、重要数据、数量门槛和豁免。调用海外模型或跨境研发可能形成数据流，但不应把所有调用一律认定为须申报，也不能把豁免特定机制当作免除全部保护义务。",
    markets: ["中国", "中国大陆", "新加坡", "全球"],
    providers: ["OpenAI", "GPT", "Anthropic", "Claude", "其他模型"],
    severity: "high",
    status: "适用性核验",
    effectiveDate: "2024-03-22",
    sources: [
      {
        title: "国家网信办 · 促进和规范数据跨境流动规定",
        url: "https://www.cac.gov.cn/2024-03/22/c_1712776611775634.htm",
      },
    ],
    action:
      "盘点请求、日志、检索库与研发访问中的数据来源和处理地点，确认主体、敏感性、规模、重要数据及豁免条件，再由专业人员判断适用传输机制。",
  },
  {
    id: "eu-ai-role-and-supply-chain",
    title: "欧盟业务需先明确模型与系统链条中的角色",
    summary:
      "欧委会说明，AI Act 通用模型供应者义务自 2025-08-02 开始适用，既有模型另有过渡安排。企业采购 API、集成系统、修改模型或以自己名义提供服务可能对应不同角色，不能把模型供应者义务统一套给所有聚合平台。",
    markets: ["欧盟", "欧洲", "德国", "法国"],
    providers: ["OpenAI", "GPT", "Anthropic", "Claude", "其他模型"],
    severity: "medium",
    status: "适用性核验",
    effectiveDate: "2025-08-02",
    sources: [
      {
        title: "欧盟委员会 · 通用 AI 模型 AI Act 问答",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    action:
      "记录业务所用模型、版本、上线日期和合同链，判断平台与客户的具体角色，向上游取得适用文档；个人数据与跨境传输问题另外核验，不能只凭模型来源国判断。",
  },
];
