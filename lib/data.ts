/** Curated evidence snapshots. Governance membership is not a legal market-access decision. */
export const DATA_UPDATED_AT = "2026-10-19";
export const DATA_NOTE =
  "人工核验种子资料，非持续实时数据；组织归属不代表军事同盟、模型可用性或合规结论。WAICO 地图沿用 2026-07-21 的 29 国历史名单，新增成员名单待逐项核实。";
export type Source = { title: string; url: string };
export type Bloc = "GPAI" | "WAICO" | "共同成员" | "观察";
export type Country = {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  flag: string;
  region: string;
  bloc: Bloc;
  organizations: string[];
  summary: string;
  policy: string;
  companies: string[];
  riskLevel: string;
  evidenceStatus: string;
  sources: Source[];
  updatedAt: string;
};
export type Signal = {
  id: string;
  title: string;
  summary: string;
  date: string;
  country: string;
  countryName: string;
  category: "政策监管" | "技术模型" | "国际合作" | "市场准入" | "数据安全";
  impact: "高" | "中" | "低";
  source: string;
  sourceUrl: string;
  tags: string[];
  status: "已核实" | "待核实";
  implication: string;
};
export type AIModel = {
  id: string;
  name: string;
  company: string;
  country: string;
  countryCode: string;
  bloc: Bloc;
  openness: "开放权重" | "闭源";
  deployment: string;
  license: string;
  regions: string;
  strengths: string[];
  considerations: string[];
  sourceUrl: string;
  updatedAt: string;
};
export type Organization = {
  id: "GPAI" | "WAICO";
  name: string;
  fullName: string;
  description: string;
  memberCount: number;
  memberCountLabel: string;
  sourceUrl: string;
  updatedAt: string;
  note: string;
};
const gpaiSource: Source = {
  title: "OECD.AI · GPAI 官方成员名单",
  url: "https://oecd.ai/en/about-what-we-do",
};
const waicoExpansion: Source = {
  title: "外交部 · 2026-08-12 讲话（38 国）",
  url: "https://www.fmprc.gov.cn/wjbzhd/202608/t20260812_12002547.shtml",
};
export const organizations: Organization[] = [
  {
    id: "GPAI",
    name: "全球人工智能伙伴关系",
    fullName: "Global Partnership on Artificial Intelligence",
    description:
      "以 OECD AI 原则为基础，连接政府、产业、学术与公民社会，推动以人为本、可信赖的 AI。2024 年与 OECD 形成整合伙伴关系。",
    memberCount: 46,
    memberCountLabel: "46 个成员国 + 欧盟",
    sourceUrl: gpaiSource.url,
    updatedAt: DATA_UPDATED_AT,
    note: "欧盟参与相关工作；成员在平等基础上参与。这里的 GPAI 指组织，不是欧盟法律中的通用人工智能模型缩写。",
  },
  {
    id: "WAICO",
    name: "世界人工智能合作组织",
    fullName: "World Artificial Intelligence Cooperation Organization",
    description:
      "2026 年 7 月在上海签署成立协定，以国际合作、能力建设、规则与标准衔接为核心，关注全球南方的发展机会。",
    memberCount: 38,
    memberCountLabel: "38 个创始成员国",
    sourceUrl: waicoExpansion.url,
    updatedAt: "2026-08-12",
    note: "7 月 16 日首批 29 国签署协定；8 月外交部资料更新为 38 国。地图仍显示旧项目的 29 国历史名单，新增 9 国未逐项核实；不推定所有已签约条款均已完成国内生效程序。",
  },
];

export const countries: Country[] = [
  {
    id: "cn",
    code: "CN",
    name: "中国",
    nameEn: "China",
    flag: "🇨🇳",
    region: "亚洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "关注跨境数据、面向公众的生成式 AI 服务与内容标识。开放权重与托管 API 应分别评估。",
    policy:
      "生成式 AI 内容标识办法自 2025-09-01 施行；评估业务是否进入适用范围。",
    companies: ["阿里巴巴 · Qwen", "DeepSeek", "智谱 · GLM", "百度 · ERNIE"],
    riskLevel: "重点关注",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
      {
        title: "外交部 · 2026-07-16 协定签署",
        url: "https://www.fmprc.gov.cn/wjbzhd/202607/t20260716_11984399.shtml",
      },
      {
        title: "国家网信办 · AI 内容标识办法",
        url: "https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "us",
    code: "US",
    name: "美国",
    nameEn: "United States of America",
    flag: "🇺🇸",
    region: "北美洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "全球 AI 模型与算力供应的重要节点。服务区域、最终用户与出口条件需要独立核验。",
    policy:
      "2025-07-23 发布 AI 行动计划；政策方向不能替代具体出口与服务条款审查。",
    companies: ["OpenAI", "Anthropic", "Google DeepMind", "Meta", "xAI"],
    riskLevel: "重点关注",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "白宫 · AI 行动计划",
        url: "https://www.whitehouse.gov/releases/2025/07/white-house-unveils-americas-ai-action-plan/",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "dz",
    code: "DZ",
    name: "阿尔及利亚",
    nameEn: "Algeria",
    flag: "🇩🇿",
    region: "非洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "ar",
    code: "AR",
    name: "阿根廷",
    nameEn: "Argentina",
    flag: "🇦🇷",
    region: "南美洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "au",
    code: "AU",
    name: "澳大利亚",
    nameEn: "Australia",
    flag: "🇦🇺",
    region: "大洋洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "at",
    code: "AT",
    name: "奥地利",
    nameEn: "Austria",
    flag: "🇦🇹",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "by",
    code: "BY",
    name: "白俄罗斯",
    nameEn: "Belarus",
    flag: "🇧🇾",
    region: "欧洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
      {
        title: "外交部 · 创始成员相关报道",
        url: "https://www.fmprc.gov.cn/zwbd_673032/wjzs/202607/t20260727_11992693.shtml",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "be",
    code: "BE",
    name: "比利时",
    nameEn: "Belgium",
    flag: "🇧🇪",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "br",
    code: "BR",
    name: "巴西",
    nameEn: "Brazil",
    flag: "🇧🇷",
    region: "南美洲",
    bloc: "共同成员",
    organizations: ["GPAI", "WAICO"],
    summary: "跨组织参与说明治理网络存在交叉，企业不能只按阵营选型。",
    policy:
      "旧地图记录为 GPAI 与 WAICO 共同成员；WAICO 归属仍需按新官方名录复核。",
    companies: [],
    riskLevel: "重点关注",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
      {
        title: "外交部 · 创始成员相关报道",
        url: "https://www.fmprc.gov.cn/zwbd_673032/wjzs/202607/t20260727_11992693.shtml",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "kh",
    code: "KH",
    name: "柬埔寨",
    nameEn: "Cambodia",
    flag: "🇰🇭",
    region: "亚洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "cm",
    code: "CM",
    name: "喀麦隆",
    nameEn: "Cameroon",
    flag: "🇨🇲",
    region: "非洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "ca",
    code: "CA",
    name: "加拿大",
    nameEn: "Canada",
    flag: "🇨🇦",
    region: "北美洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary: "关注企业 AI、隐私保护与模型商业许可的差异。",
    policy: "开放权重研究许可与商业使用授权不可混用。",
    companies: ["Cohere", "Mila"],
    riskLevel: "重点关注",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "cl",
    code: "CL",
    name: "智利",
    nameEn: "Chile",
    flag: "🇨🇱",
    region: "南美洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "co",
    code: "CO",
    name: "哥伦比亚",
    nameEn: "Colombia",
    flag: "🇨🇴",
    region: "南美洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "cg",
    code: "CG",
    name: "刚果共和国",
    nameEn: "Congo",
    flag: "🇨🇬",
    region: "非洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "cr",
    code: "CR",
    name: "哥斯达黎加",
    nameEn: "Costa Rica",
    flag: "🇨🇷",
    region: "北美洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "cu",
    code: "CU",
    name: "古巴",
    nameEn: "Cuba",
    flag: "🇨🇺",
    region: "北美洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "cz",
    code: "CZ",
    name: "捷克",
    nameEn: "Czechia",
    flag: "🇨🇿",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "dk",
    code: "DK",
    name: "丹麦",
    nameEn: "Denmark",
    flag: "🇩🇰",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "ee",
    code: "EE",
    name: "爱沙尼亚",
    nameEn: "Estonia",
    flag: "🇪🇪",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "et",
    code: "ET",
    name: "埃塞俄比亚",
    nameEn: "Ethiopia",
    flag: "🇪🇹",
    region: "非洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "fi",
    code: "FI",
    name: "芬兰",
    nameEn: "Finland",
    flag: "🇫🇮",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "fr",
    code: "FR",
    name: "法国",
    nameEn: "France",
    flag: "🇫🇷",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "法国兼具欧盟监管场景与本土开放模型生态。可评估区域托管及开放权重方案。",
    policy:
      "欧盟 AI Act 对通用 AI 模型供应者义务自 2025-08-02 开始适用，具体过渡规则需逐项核对。",
    companies: ["Mistral AI", "Inria"],
    riskLevel: "重点关注",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "de",
    code: "DE",
    name: "德国",
    nameEn: "Germany",
    flag: "🇩🇪",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary: "工业 AI、数据主权和欧盟市场准入是企业关注重点。",
    policy: "需要区分模型供应者、部署者角色及具体系统风险类别。",
    companies: ["Aleph Alpha", "SAP"],
    riskLevel: "重点关注",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "gr",
    code: "GR",
    name: "希腊",
    nameEn: "Greece",
    flag: "🇬🇷",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "hu",
    code: "HU",
    name: "匈牙利",
    nameEn: "Hungary",
    flag: "🇭🇺",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "is",
    code: "IS",
    name: "冰岛",
    nameEn: "Iceland",
    flag: "🇮🇸",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "in",
    code: "IN",
    name: "印度",
    nameEn: "India",
    flag: "🇮🇳",
    region: "亚洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary: "具有本土多语言模型、AI 能力建设与国际治理参与场景。",
    policy: "GPAI 成员身份不构成对任何模型的自动市场许可。",
    companies: ["Sarvam AI", "Krutrim"],
    riskLevel: "重点关注",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "id",
    code: "ID",
    name: "印度尼西亚",
    nameEn: "Indonesia",
    flag: "🇮🇩",
    region: "亚洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
      {
        title: "外交部 · 2026-07-16 协定签署",
        url: "https://www.fmprc.gov.cn/wjbzhd/202607/t20260716_11984399.shtml",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "ie",
    code: "IE",
    name: "爱尔兰",
    nameEn: "Ireland",
    flag: "🇮🇪",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "il",
    code: "IL",
    name: "以色列",
    nameEn: "Israel",
    flag: "🇮🇱",
    region: "亚洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "it",
    code: "IT",
    name: "意大利",
    nameEn: "Italy",
    flag: "🇮🇹",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "jp",
    code: "JP",
    name: "日本",
    nameEn: "Japan",
    flag: "🇯🇵",
    region: "亚洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary: "产业 AI 与企业治理指引构成本地落地的重要参考。",
    policy:
      "METI/MIC 企业 AI 指南为非强制指引；不能直接当作行政许可或法律合规证明。",
    companies: ["Preferred Networks", "Sakana AI"],
    riskLevel: "重点关注",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "日本经济产业省 · AI 事業者ガイドライン 2026",
        url: "https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/20260331_report.html",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "kz",
    code: "KZ",
    name: "哈萨克斯坦",
    nameEn: "Kazakhstan",
    flag: "🇰🇿",
    region: "亚洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
      {
        title: "外交部 · 2026-07-16 协定签署",
        url: "https://www.fmprc.gov.cn/wjbzhd/202607/t20260716_11984399.shtml",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "ke",
    code: "KE",
    name: "肯尼亚",
    nameEn: "Kenya",
    flag: "🇰🇪",
    region: "非洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "kg",
    code: "KG",
    name: "吉尔吉斯斯坦",
    nameEn: "Kyrgyzstan",
    flag: "🇰🇬",
    region: "亚洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
      {
        title: "外交部 · 创始成员相关报道",
        url: "https://www.fmprc.gov.cn/zwbd_673032/wjzs/202607/t20260727_11992693.shtml",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "la",
    code: "LA",
    name: "老挝",
    nameEn: "Laos",
    flag: "🇱🇦",
    region: "亚洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
      {
        title: "外交部 · 2026-07-16 协定签署",
        url: "https://www.fmprc.gov.cn/wjbzhd/202607/t20260716_11984399.shtml",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "lv",
    code: "LV",
    name: "拉脱维亚",
    nameEn: "Latvia",
    flag: "🇱🇻",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "ls",
    code: "LS",
    name: "莱索托",
    nameEn: "Lesotho",
    flag: "🇱🇸",
    region: "非洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "lt",
    code: "LT",
    name: "立陶宛",
    nameEn: "Lithuania",
    flag: "🇱🇹",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "lu",
    code: "LU",
    name: "卢森堡",
    nameEn: "Luxembourg",
    flag: "🇱🇺",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "my",
    code: "MY",
    name: "马来西亚",
    nameEn: "Malaysia",
    flag: "🇲🇾",
    region: "亚洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "mt",
    code: "MT",
    name: "马耳他",
    nameEn: "Malta",
    flag: "🇲🇹",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "mx",
    code: "MX",
    name: "墨西哥",
    nameEn: "Mexico",
    flag: "🇲🇽",
    region: "北美洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "mz",
    code: "MZ",
    name: "莫桑比克",
    nameEn: "Mozambique",
    flag: "🇲🇿",
    region: "非洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "mm",
    code: "MM",
    name: "缅甸",
    nameEn: "Myanmar",
    flag: "🇲🇲",
    region: "亚洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "nl",
    code: "NL",
    name: "荷兰",
    nameEn: "Netherlands",
    flag: "🇳🇱",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "nz",
    code: "NZ",
    name: "新西兰",
    nameEn: "New Zealand",
    flag: "🇳🇿",
    region: "大洋洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "ni",
    code: "NI",
    name: "尼加拉瓜",
    nameEn: "Nicaragua",
    flag: "🇳🇮",
    region: "北美洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "no",
    code: "NO",
    name: "挪威",
    nameEn: "Norway",
    flag: "🇳🇴",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "om",
    code: "OM",
    name: "阿曼",
    nameEn: "Oman",
    flag: "🇴🇲",
    region: "亚洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "pk",
    code: "PK",
    name: "巴基斯坦",
    nameEn: "Pakistan",
    flag: "🇵🇰",
    region: "亚洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
      {
        title: "外交部 · 2026-07-16 协定签署",
        url: "https://www.fmprc.gov.cn/wjbzhd/202607/t20260716_11984399.shtml",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "pl",
    code: "PL",
    name: "波兰",
    nameEn: "Poland",
    flag: "🇵🇱",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "pt",
    code: "PT",
    name: "葡萄牙",
    nameEn: "Portugal",
    flag: "🇵🇹",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "ru",
    code: "RU",
    name: "俄罗斯",
    nameEn: "Russia",
    flag: "🇷🇺",
    region: "欧洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
      {
        title: "外交部 · 2026-07-16 协定签署",
        url: "https://www.fmprc.gov.cn/wjbzhd/202607/t20260716_11984399.shtml",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "sa",
    code: "SA",
    name: "沙特阿拉伯",
    nameEn: "Saudi Arabia",
    flag: "🇸🇦",
    region: "亚洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "GPAI 于 2026 年 2 月欢迎沙特加入，关注区域 AI 基础设施与商业使用条件。",
    policy: "组织成员身份不能用来判断任一模型 API 在当地的服务承诺。",
    companies: [],
    riskLevel: "重点关注",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "GPAI · 2026-02-20 联合主席声明",
        url: "https://oecd.ai/en/gpai-council-meeting-co-chairs-summary-statement-2026",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "sn",
    code: "SN",
    name: "塞内加尔",
    nameEn: "Senegal",
    flag: "🇸🇳",
    region: "非洲",
    bloc: "共同成员",
    organizations: ["GPAI", "WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "rs",
    code: "RS",
    name: "塞尔维亚",
    nameEn: "Serbia",
    flag: "🇷🇸",
    region: "欧洲",
    bloc: "共同成员",
    organizations: ["GPAI", "WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
      {
        title: "外交部 · 创始成员相关报道",
        url: "https://www.fmprc.gov.cn/zwbd_673032/wjzs/202607/t20260727_11992693.shtml",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "sg",
    code: "SG",
    name: "新加坡",
    nameEn: "Singapore",
    flag: "🇸🇬",
    region: "亚洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary: "东南亚 AI 治理与跨境业务节点，关注代理系统的权限与问责。",
    policy:
      "IMDA 2026 年发布 Agentic AI 治理框架；实施前应核对适用场景及现行版本。",
    companies: ["AI Singapore", "SEA-LION"],
    riskLevel: "重点关注",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "IMDA · Agentic AI 治理框架",
        url: "https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/new-model-ai-governance-framework-for-agentic-ai",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "sk",
    code: "SK",
    name: "斯洛伐克",
    nameEn: "Slovakia",
    flag: "🇸🇰",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "si",
    code: "SI",
    name: "斯洛文尼亚",
    nameEn: "Slovenia",
    flag: "🇸🇮",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "za",
    code: "ZA",
    name: "南非",
    nameEn: "South Africa",
    flag: "🇿🇦",
    region: "非洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "kr",
    code: "KR",
    name: "韩国",
    nameEn: "South Korea",
    flag: "🇰🇷",
    region: "亚洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary: "关注本土模型与全球供应商并行布局。",
    policy: "部署前核对本地数据、模型服务和行业义务。",
    companies: ["NAVER · HyperCLOVA X", "LG AI Research"],
    riskLevel: "重点关注",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "es",
    code: "ES",
    name: "西班牙",
    nameEn: "Spain",
    flag: "🇪🇸",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "se",
    code: "SE",
    name: "瑞典",
    nameEn: "Sweden",
    flag: "🇸🇪",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
      {
        title: "欧盟委员会 · 通用 AI 模型义务",
        url: "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "ch",
    code: "CH",
    name: "瑞士",
    nameEn: "Switzerland",
    flag: "🇨🇭",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "tj",
    code: "TJ",
    name: "塔吉克斯坦",
    nameEn: "Tajikistan",
    flag: "🇹🇯",
    region: "亚洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
      {
        title: "外交部 · 创始成员相关报道",
        url: "https://www.fmprc.gov.cn/zwbd_673032/wjzs/202607/t20260727_11992693.shtml",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "tr",
    code: "TR",
    name: "土耳其",
    nameEn: "Turkey",
    flag: "🇹🇷",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "gb",
    code: "GB",
    name: "英国",
    nameEn: "United Kingdom",
    flag: "🇬🇧",
    region: "欧洲",
    bloc: "GPAI",
    organizations: ["GPAI"],
    summary: "关注 AI 安全评估、模型服务条件与数据治理。",
    policy: "不同供应商的英国服务区域与数据驻留配置需分别确认。",
    companies: ["Google DeepMind", "Stability AI"],
    riskLevel: "重点关注",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "OECD.AI · GPAI 官方成员名单",
        url: "https://oecd.ai/en/about-what-we-do",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "uz",
    code: "UZ",
    name: "乌兹别克斯坦",
    nameEn: "Uzbekistan",
    flag: "🇺🇿",
    region: "亚洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "官方已核实",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
      {
        title: "外交部 · 创始成员相关报道",
        url: "https://www.fmprc.gov.cn/zwbd_673032/wjzs/202607/t20260727_11992693.shtml",
      },
    ],
    updatedAt: "2026-10-19",
  },
  {
    id: "ve",
    code: "VE",
    name: "委内瑞拉",
    nameEn: "Venezuela",
    flag: "🇻🇪",
    region: "南美洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
  {
    id: "zm",
    code: "ZM",
    name: "赞比亚",
    nameEn: "Zambia",
    flag: "🇿🇲",
    region: "非洲",
    bloc: "WAICO",
    organizations: ["WAICO"],
    summary:
      "纳入全球 AI 治理观察网络，关注本地政策、模型供应链与区域服务条件。",
    policy: "成员身份与具体 AI 法规、数据传输要求及模型许可证分开核查。",
    companies: [],
    riskLevel: "持续观察",
    evidenceStatus: "WAICO 历史快照待复核",
    sources: [
      {
        title: "全球 AI 治理版图 · 2026-07-21 历史快照",
        url: "https://ai-governance-atlas-2026.thinkthinking.chatgpt.site",
      },
    ],
    updatedAt: "2026-07-21",
  },
];

export const signals: Signal[] = [
  {
    id: "waico-expansion",
    title: "WAICO 成员规模从首批 29 国扩展至 38 国",
    summary:
      "外交部 8 月讲话提到 38 个国家成为创始成员，较 7 月首批 29 国的资料已有变化。新增逐国名录尚未完成核验。",
    date: "2026-08-12",
    country: "CN",
    countryName: "中国",
    category: "国际合作",
    impact: "中",
    source: "中国外交部",
    sourceUrl:
      "https://www.fmprc.gov.cn/wjbzhd/202608/t20260812_12002547.shtml",
    tags: ["WAICO", "成员扩容", "证据更新"],
    implication:
      "应更新组织规模，但不能用不完整名录推断新增国家身份或模型市场准入。",
    status: "已核实",
  },
  {
    id: "waico-founding",
    title: "29 国在上海签署 WAICO 成立协定",
    summary:
      "7 月 16 日签署成立协定，总部设在上海。官方报道直接列出中国、哈萨克斯坦、老挝、巴基斯坦、俄罗斯与印尼等签署方。",
    date: "2026-07-16",
    country: "CN",
    countryName: "中国",
    category: "国际合作",
    impact: "中",
    source: "中国外交部",
    sourceUrl:
      "https://www.fmprc.gov.cn/wjbzhd/202607/t20260716_11984399.shtml",
    tags: ["WAICO", "国际治理", "能力建设"],
    implication:
      "关注合作项目和标准衔接的后续实施；成员身份本身不改变企业现有法定义务。",
    status: "已核实",
  },
  {
    id: "jp-business-guidelines",
    title: "日本更新企业 AI 治理指南",
    summary:
      "METI 发布的企业 AI 指南 1.2 页面与材料，将治理建议连接到开发、提供、使用等不同角色。",
    date: "2026-03-31",
    country: "JP",
    countryName: "日本",
    category: "政策监管",
    impact: "中",
    source: "日本经济产业省",
    sourceUrl:
      "https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/20260331_report.html",
    tags: ["企业治理", "日本", "软法"],
    implication: "将其作为治理流程参考，避免把非强制指引表述成统一许可门槛。",
    status: "已核实",
  },
  {
    id: "mistral-small4",
    title: "Mistral Small 4 以 Apache 2.0 开放权重",
    summary:
      "Mistral 于 3 月发布统一指令、推理与多模态能力的 Small 4，提供可自托管权重。",
    date: "2026-03-16",
    country: "FR",
    countryName: "法国",
    category: "技术模型",
    impact: "中",
    source: "Mistral AI",
    sourceUrl: "https://mistral.ai/news/mistral-small-4/",
    tags: ["开放权重", "Apache 2.0", "本地部署"],
    implication:
      "可纳入区域化自部署候选；仍需评估基础设施成本、质量、数据和行业限制。",
    status: "已核实",
  },
  {
    id: "gpai-members-2026",
    title: "GPAI 欢迎马耳他与沙特阿拉伯加入",
    summary:
      "2026 年 2 月理事会联合主席声明确认两国加入；现行官方介绍为 46 个成员国与欧盟。",
    date: "2026-02-20",
    country: "IN",
    countryName: "印度",
    category: "国际合作",
    impact: "中",
    source: "OECD.AI",
    sourceUrl:
      "https://oecd.ai/en/gpai-council-meeting-co-chairs-summary-statement-2026",
    tags: ["GPAI", "成员扩容", "可信AI"],
    implication:
      "治理关系呈交叉网络，不宜把 GPAI 与 WAICO 解释为互斥的技术同盟。",
    status: "已核实",
  },
  {
    id: "sg-agentic",
    title: "新加坡发布 Agentic AI 治理框架",
    summary:
      "IMDA 的框架面向能推理和执行行动的 AI 智能体，强调部署组织的治理与问责。",
    date: "2026-01-22",
    country: "SG",
    countryName: "新加坡",
    category: "政策监管",
    impact: "中",
    source: "IMDA",
    sourceUrl:
      "https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/new-model-ai-governance-framework-for-agentic-ai",
    tags: ["Agent", "权限管理", "人机协作"],
    implication:
      "企业 Agent 应设计权限边界、过程日志和人工介入点；框架属于治理参考，需结合适用法律。",
    status: "已核实",
  },
  {
    id: "anthropic-regions",
    title: "Claude 服务限制不仅涉及服务器地理位置",
    summary:
      "Anthropic 官方支持区域政策说明，可对未受支持地区拥有多数直接或间接所有权的实体限制服务。",
    date: "2025-09-04",
    country: "US",
    countryName: "美国",
    category: "市场准入",
    impact: "高",
    source: "Anthropic",
    sourceUrl:
      "https://www.anthropic.com/news/updating-restrictions-of-sales-to-unsupported-regions",
    tags: ["模型可用性", "所有权", "供应商条款"],
    implication:
      "海外子公司注册地并非充分条件；采购前核对所有权、签约实体及当前供应商政策。",
    status: "已核实",
  },
  {
    id: "cn-content-label",
    title: "中国 AI 生成合成内容标识办法施行",
    summary:
      "办法规定生成合成内容的显式、隐式标识及传播平台相关义务，自 2025 年 9 月 1 日施行。",
    date: "2025-09-01",
    country: "CN",
    countryName: "中国",
    category: "政策监管",
    impact: "高",
    source: "国家网信办",
    sourceUrl: "https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm",
    tags: ["内容标识", "生成式AI", "平台责任"],
    implication:
      "面向境内公众的内容产品应核对标识链路；内部工具与公众服务需要区分。",
    status: "已核实",
  },
  {
    id: "eu-gpai-obligations",
    title: "欧盟通用 AI 模型供应者义务开始适用",
    summary:
      "欧委会说明通用 AI 模型义务自 2025 年 8 月 2 日开始适用；此前投放市场模型有单独过渡安排。",
    date: "2025-08-02",
    country: "EU",
    countryName: "欧盟",
    category: "政策监管",
    impact: "高",
    source: "欧盟委员会",
    sourceUrl:
      "https://digital-strategy.ec.europa.eu/en/faqs/general-purpose-ai-models-ai-act-questions-answers",
    tags: ["AI Act", "过渡期", "合规"],
    implication:
      "采购时保留模型版本、投放日期、技术文档与供应商材料；具体适用时间交由专业人员确认。",
    status: "已核实",
  },
  {
    id: "us-ai-plan",
    title: "美国 AI 行动计划强调创新、基础设施和国际部署",
    summary:
      "白宫发布 AI 行动计划，提出扩大美国 AI 技术全球部署的政策方向。行动计划与具体法律、许可证或服务合同具有不同效力。",
    date: "2025-07-23",
    country: "US",
    countryName: "美国",
    category: "国际合作",
    impact: "高",
    source: "美国白宫",
    sourceUrl:
      "https://www.whitehouse.gov/releases/2025/07/white-house-unveils-americas-ai-action-plan/",
    tags: ["AI供应链", "算力", "国际竞争"],
    implication: "企业应分别审查芯片、云服务与模型服务的约束，保留替代路径。",
    status: "已核实",
  },
  {
    id: "eu-gpai-code",
    title: "欧盟公布通用 AI 模型实践准则",
    summary:
      "准则用于帮助模型供应者落实透明度、版权与安全义务。自愿加入准则不等于豁免适用的 AI Act 法定义务。",
    date: "2025-07-10",
    country: "EU",
    countryName: "欧盟",
    category: "政策监管",
    impact: "高",
    source: "欧盟委员会",
    sourceUrl:
      "https://digital-strategy.ec.europa.eu/en/news/general-purpose-ai-code-practice-now-available",
    tags: ["AI Act", "模型供应者", "版权"],
    implication:
      "先判定企业是供应者、修改者还是部署者，再评估义务，不能对所有企业套用相同要求。",
    status: "已核实",
  },
  {
    id: "us-diffusion-rescission",
    title: "美国宣布撤销此前 AI 扩散规则",
    summary:
      "BIS 在 2025 年 5 月宣布撤销此前扩散规则，同时加强若干芯片相关出口管制。不能沿用旧规则的分层地图作为当前结论。",
    date: "2025-05-13",
    country: "US",
    countryName: "美国",
    category: "市场准入",
    impact: "高",
    source: "美国商务部 BIS",
    sourceUrl:
      "https://www.bis.gov/press-release/department-commerce-rescinds-biden-era-artificial-intelligence-diffusion-rule-strengthens-chip-related",
    tags: ["出口管制", "历史规则", "需动态复核"],
    implication:
      "具体交易仍应核验当期 EAR、最终用户、用途、硬件与许可证，系统不自动判定合法性。",
    status: "已核实",
  },
  {
    id: "qwen3-open",
    title: "Qwen3 开放权重提供 Apache 2.0 候选",
    summary:
      "Qwen 官方仓库说明其开放权重模型采用 Apache 2.0，适合评估自托管、微调与区域部署。",
    date: "2025-04-29",
    country: "CN",
    countryName: "中国",
    category: "技术模型",
    impact: "中",
    source: "Qwen 官方仓库",
    sourceUrl: "https://github.com/QwenLM/Qwen3",
    tags: ["Qwen", "Apache 2.0", "自主部署"],
    implication:
      "限定到具体模型版本和仓库许可证；不能推广至所有 Qwen API 或未来产品。",
    status: "已核实",
  },
  {
    id: "llama4-license",
    title: "Llama 4 开放权重仍有定制许可边界",
    summary:
      "Llama 4 采用社区许可证与可接受使用政策；开放下载并不等于无条件商业许可。",
    date: "2025-04-05",
    country: "US",
    countryName: "美国",
    category: "技术模型",
    impact: "高",
    source: "Meta",
    sourceUrl: "https://dev.meta.ai/llama/llama4/license",
    tags: ["开放权重", "许可证", "多模态"],
    implication:
      "核对具体版本的地域、规模、再分发与使用限制，尤其不能将许可证简单标成 Apache 或 MIT。",
    status: "已核实",
  },
  {
    id: "deepseek-r1-open",
    title: "DeepSeek-R1 代码与模型权重采用 MIT",
    summary:
      "官方发布说明和模型卡明确 MIT 许可；蒸馏版本仍应检查其基础模型的附加许可。",
    date: "2025-01-20",
    country: "CN",
    countryName: "中国",
    category: "技术模型",
    impact: "中",
    source: "DeepSeek 官方模型卡",
    sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1",
    tags: ["DeepSeek", "MIT", "推理"],
    implication:
      "权重许可与托管 API 的数据政策、地区政策、服务生命周期是三个独立问题。",
    status: "已核实",
  },
];

/** Representative selection records, including license-comparison historical versions; not a benchmark ranking. */
export const aiModels: AIModel[] = [
  {
    id: "qwen3",
    name: "Qwen3",
    company: "阿里巴巴 · Qwen",
    country: "中国",
    countryCode: "CN",
    bloc: "WAICO",
    openness: "开放权重",
    deployment: "私有化 / 自托管 / 合规托管服务",
    license: "Apache 2.0",
    regions: "自部署地域依适用法律与基础设施确定",
    strengths: ["多语言", "代码与推理", "区域化部署"],
    considerations: [
      "仅指 Qwen3 开放权重系列",
      "托管 API 条款须另行检查",
      "自主部署仍须落实数据与内容责任",
    ],
    sourceUrl: "https://github.com/QwenLM/Qwen3",
    updatedAt: "2026-10-19",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek-R1",
    company: "DeepSeek",
    country: "中国",
    countryCode: "CN",
    bloc: "WAICO",
    openness: "开放权重",
    deployment: "私有化 / 自托管",
    license: "MIT",
    regions: "权重部署与官方 API 支持区域分别核验",
    strengths: ["推理任务", "本地知识分析", "许可灵活"],
    considerations: [
      "代表性历史版本，非最新能力排名",
      "蒸馏版本需核对底座许可",
      "自部署算力与运维成本需评估",
    ],
    sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-R1",
    updatedAt: "2026-10-19",
  },
  {
    id: "mistral-small-4",
    name: "Mistral Small 4",
    company: "Mistral AI",
    country: "法国",
    countryCode: "FR",
    bloc: "GPAI",
    openness: "开放权重",
    deployment: "私有化 / 自托管 / Mistral API",
    license: "Apache 2.0",
    regions: "可评估欧盟区域部署；实际数据路径以服务配置为准",
    strengths: ["多模态", "推理与编程", "企业部署"],
    considerations: [
      "开放权重不豁免行业和数据义务",
      "权重托管与供应商 API 条款不同",
      "按业务实测质量与基础设施成本",
    ],
    sourceUrl: "https://mistral.ai/news/mistral-small-4/",
    updatedAt: "2026-10-19",
  },
  {
    id: "gemma-4",
    name: "Gemma 4",
    company: "Google DeepMind",
    country: "美国",
    countryCode: "US",
    bloc: "GPAI",
    openness: "开放权重",
    deployment: "本地 / 边缘 / 自托管",
    license: "Apache 2.0",
    regions: "自部署；具体模型文件与依赖需逐项核验",
    strengths: ["多尺寸", "多语言", "多模态"],
    considerations: [
      "不可把 Gemma 4 许可套用于 Gemma 3",
      "不同尺寸输入模态不同",
      "实际质量需按企业数据测试",
    ],
    sourceUrl: "https://ai.google.dev/gemma/docs/core/model_card_4",
    updatedAt: "2026-10-19",
  },
  {
    id: "gemma-3",
    name: "Gemma 3 · 许可对照",
    company: "Google DeepMind",
    country: "美国",
    countryCode: "US",
    bloc: "GPAI",
    openness: "开放权重",
    deployment: "本地 / 自托管",
    license: "Gemma 自定义使用条款",
    regions: "下载须接受许可；地域与用途按具体条款审核",
    strengths: ["多语言", "图文理解", "本地实验"],
    considerations: [
      "历史版本，用于展示同系列许可变化",
      "不是 Apache 2.0",
      "开放权重不等于无条件开源许可",
    ],
    sourceUrl: "https://huggingface.co/google/gemma-3-27b-it",
    updatedAt: "2026-10-19",
  },
  {
    id: "llama-4",
    name: "Llama 4",
    company: "Meta",
    country: "美国",
    countryCode: "US",
    bloc: "GPAI",
    openness: "开放权重",
    deployment: "自托管 / 经授权第三方托管",
    license: "Llama 4 Community License",
    regions: "存在定制许可条件；多模态授权需特别核验欧盟相关条款",
    strengths: ["多模态", "生态集成", "自托管"],
    considerations: [
      "社区许可证并非 Apache / MIT",
      "核对地域、用户规模与再分发要求",
      "服务最终用户与模型被许可人需区分",
    ],
    sourceUrl: "https://dev.meta.ai/llama/llama4/license",
    updatedAt: "2026-10-19",
  },
  {
    id: "gpt-api",
    name: "GPT · API 系列",
    company: "OpenAI",
    country: "美国",
    countryCode: "US",
    bloc: "GPAI",
    openness: "闭源",
    deployment: "官方或经授权云 API",
    license: "供应商商业服务条款",
    regions: "以官方支持国家和地区名单为准",
    strengths: ["通用任务候选", "工具调用候选", "多模态候选"],
    considerations: [
      "具体能力随版本变化，选型前核验",
      "不支持的地区可能导致账户受限",
      "数据驻留与服务支持范围分开确认",
    ],
    sourceUrl:
      "https://help.openai.com/en/articles/5347006-openai-api-supported-countries-and-territories",
    updatedAt: "2026-10-19",
  },
  {
    id: "claude-api",
    name: "Claude · API 系列",
    company: "Anthropic",
    country: "美国",
    countryCode: "US",
    bloc: "GPAI",
    openness: "闭源",
    deployment: "官方 API / 经授权云平台",
    license: "供应商商业服务条款",
    regions: "按支持区域、签约实体及所有权政策核验",
    strengths: ["文档任务候选", "编程候选", "工具调用候选"],
    considerations: [
      "多数直接或间接所有权也可能影响资格",
      "海外子公司不自动满足支持条件",
      "云平台、区域与具体版本条款分别审查",
    ],
    sourceUrl: "https://www.anthropic.com/supported-countries",
    updatedAt: "2026-10-19",
  },
  {
    id: "gemini-api",
    name: "Gemini · API 系列",
    company: "Google DeepMind",
    country: "美国",
    countryCode: "US",
    bloc: "GPAI",
    openness: "闭源",
    deployment: "Gemini API / 企业云服务",
    license: "供应商商业服务条款",
    regions: "AI Studio、Gemini API 与企业云的支持范围分别核验",
    strengths: ["多模态候选", "长文档候选", "云集成候选"],
    considerations: [
      "能力以具体版本为准",
      "免费与付费层的数据使用条款应分别检查",
      "访问地域不等于数据驻留承诺",
    ],
    sourceUrl: "https://ai.google.dev/gemini-api/docs/available-regions",
    updatedAt: "2026-10-19",
  },
  {
    id: "grok-api",
    name: "Grok · 检索模型",
    company: "xAI / ZenMux 接入",
    country: "美国",
    countryCode: "US",
    bloc: "GPAI",
    openness: "闭源",
    deployment: "ZenMux API / 供应商 API",
    license: "供应商及聚合服务条款",
    regions: "由当前路由、账号和供应商服务范围决定",
    strengths: ["X 社媒检索", "事件线索发现", "新闻交叉核验"],
    considerations: [
      "本项目检索配置 x-ai/grok-4.7",
      "社媒线索必须与官方来源交叉验证",
      "工具和模型可用性以实时调用结果为准",
    ],
    sourceUrl: "https://docs.zenmux.ai/zh/guide/advanced/web-search",
    updatedAt: "2026-10-19",
  },
];
