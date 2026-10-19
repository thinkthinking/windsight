"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  countries,
  signals as seedSignals,
  aiModels,
  organizations,
  DATA_UPDATED_AT,
  DATA_NOTE,
  type Signal,
} from "@/lib/data";
import { I, WindLogo, type IconName } from "./insight-icons";
import { BrandLogo } from "./brand-logo";
import Link from "next/link";
import capturedSearch from "@/docs/live-search-example.json";
import latestEvents from "@/docs/latest-ai-events.json";
const initialPolicyFeed: Signal[] = Array.from(
  new Map(
    [...seedSignals, ...(latestEvents as Signal[])].map((signal) => [
      signal.id,
      signal,
    ]),
  ).values(),
).sort((a, b) => b.date.localeCompare(a.date));

type View =
  | "overview"
  | "radar"
  | "company"
  | "businesses"
  | "strategy"
  | "sources";
type Business = {
  id: string;
  name: string;
  description: string;
  markets: string[];
  useCases: string[];
  dataTypes: string[];
  models: string[];
  stage: "规划中" | "试点中" | "已上线";
};
type Profile = {
  name: string;
  website: string;
  industry: string;
  headquarters: string;
  markets: string[];
  useCases: string[];
  dataSensitivity: string;
  deployment: string;
  description: string;
  businesses: Business[];
};
type SessionUser = { id?: string; email?: string };
type StrategyResult = {
  summary?: string;
  recommendations?: unknown[];
  risks?: unknown[];
  models?: unknown[];
  sources?: unknown[];
  generatedAt?: string;
  mode?: string;
  notice?: string;
  profileSnapshot?: Profile;
  businessInsights?: {
    businessId: string;
    businessName: string;
    exposure: string;
    opportunity: string;
    actions: string[];
    sourceUrls: string[];
  }[];
};
const navigation: {
  id: View;
  label: string;
  icon: IconName;
  description: string;
}[] = [
  {
    id: "overview",
    label: "企业概览",
    icon: "overview",
    description: "从业务场景出发，看清政策变化与你的关系",
  },
  {
    id: "company",
    label: "企业画像",
    icon: "building",
    description: "维护企业信息，建立专属的决策背景",
  },
  {
    id: "businesses",
    label: "业务场景",
    icon: "models",
    description: "按业务维护市场、AI用途、数据与模型依赖",
  },
  {
    id: "radar",
    label: "政策风向",
    icon: "radar",
    description: "连接业务地区与政策信号，发现需要采取的行动",
  },
  {
    id: "strategy",
    label: "战略建议",
    icon: "spark",
    description: "针对具体业务生成有来源的战略与行动建议",
  },
  {
    id: "sources",
    label: "数据来源",
    icon: "source",
    description: "追溯政策事实、社交线索与报告判断的来源",
  },
];
const demoBusinesses: Business[] = [
  {
    id: "model-api",
    name: "全球模型 API 聚合",
    description:
      "向全球开发者提供多供应商模型API、智能路由与统一计费；中国团队、新加坡注册主体，终端客户分布在多个地区。",
    markets: ["中国", "欧盟", "美国", "东南亚"],
    useCases: ["模型 API 路由", "开发者平台", "跨境 AI 服务"],
    dataTypes: ["个人信息", "API 密钥", "日志与调用记录"],
    models: ["GPT-5", "Claude Sonnet 4", "Qwen3"],
    stage: "试点中",
  },
  {
    id: "private-gateway",
    name: "企业私有 AI 网关",
    description:
      "为企业客户提供区域内模型接入网关、私有化开放权重部署与请求审计，支持企业内部知识与自动化场景。",
    markets: ["中国", "东南亚", "欧盟"],
    useCases: ["知识检索", "业务自动化", "私有化部署"],
    dataTypes: ["商业秘密", "个人信息", "日志与调用记录"],
    models: ["Qwen3", "DeepSeek-R1", "Mistral Small 4"],
    stage: "规划中",
  },
];
function businessPolicies(
  businesses: Business[],
  events: Signal[] = initialPolicyFeed,
): Signal[] {
  const text = businesses
    .map((b) =>
      [...b.markets, ...b.dataTypes, ...b.useCases, b.description].join(" "),
    )
    .join(" ");
  const regionCodes = [
    ...(/中国/.test(text) ? ["CN"] : []),
    ...(/美国/.test(text) ? ["US"] : []),
    ...(/欧盟/.test(text) ? ["EU"] : []),
    ...(/东南亚|新加坡/.test(text) ? ["SG"] : []),
  ];
  return events
    .map((signal) => ({
      signal,
      score:
        (regionCodes.includes(signal.country) ? 4 : 0) +
        (signal.category === "市场准入" ? 3 : 0) +
        (signal.category === "数据安全" && /个人|秘密/.test(text) ? 3 : 0) +
        (signal.category === "技术模型" && /私有|开放|路由/.test(text) ? 2 : 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.signal);
}
const exampleProfile: Profile = {
  name: "Meridian AI（虚拟企业）",
  businesses: demoBusinesses,
  website: "",
  industry: "AI 聚合平台",
  headquarters: "新加坡",
  markets: ["中国", "欧盟", "美国", "东南亚"],
  useCases: ["模型 API 路由", "开发者平台", "跨境 AI 服务"],
  dataSensitivity: "个人信息",
  deployment: "混合部署",
  description:
    "中国团队在新加坡注册的全球化 AI 聚合平台，为开发者和企业提供多供应商模型 API 接入、智能路由与统一计费。计划覆盖中国、欧盟、美国和东南亚市场。此为虚拟案例，不代表任何真实企业。",
};
const emptyProfile: Profile = {
  name: "",
  businesses: [],
  website: "",
  industry: "跨境电商",
  headquarters: "中国",
  markets: [],
  useCases: [],
  dataSensitivity: "一般业务数据",
  deployment: "公有云 API",
  description: "",
};
const suggestionGroups = [
  {
    title: "先按业务区域拆分 AI 服务",
    icon: "globe" as IconName,
    detail:
      "为中国、欧盟与美国业务分别建立模型接入清单；逐项核对供应商服务地区、合同主体和数据处理区域。",
    label: "区域准入",
    tone: "blue",
  },
  {
    title: "个人信息先分类，再调用模型",
    icon: "shield" as IconName,
    detail:
      "客服与分析场景先执行最小化采集和脱敏。涉及跨境传输时，确认适用法律、传输机制及供应商的数据处理条款。",
    label: "优先处理",
    tone: "amber",
  },
  {
    title: "保留开放权重与私有化路径",
    icon: "models" as IconName,
    detail:
      "对敏感业务评估本地或区域内部署；开放权重不代表没有许可条件，仍需核查商用范围、使用政策与安全责任。",
    label: "架构建议",
    tone: "green",
  },
];
function ruleStrategy(
  profile: Profile,
  selectedBusinessId = "all",
  events: Signal[] = initialPolicyFeed,
): StrategyResult {
  const scope = (profile.businesses || []).filter(
    (b) => selectedBusinessId === "all" || b.id === selectedBusinessId,
  );

  const markets = profile.markets.length
    ? profile.markets.join("、")
    : profile.headquarters;
  const aggregation = /聚合|路由|开发者平台|跨境 AI/.test(
    [profile.industry, ...profile.useCases, profile.description].join(" "),
  );
  const sensitive = profile.dataSensitivity !== "一般业务数据";
  const privateDeploy = profile.deployment !== "公有云 API";
  const recommendations = [
    {
      title: `建立面向${markets}的独立服务矩阵`,
      detail: `以${profile.headquarters}注册实体和实际团队、客户、受益所有人信息逐项核查供应商服务资格。针对${markets}分别记录合同主体、服务地区、处理区域及终端用户限制；不能仅凭注册地推断可用性。`,
      priority: "高",
    },
    {
      title: sensitive
        ? `为${profile.dataSensitivity}设置独立处理路径`
        : "为一般业务数据建立最小化边界",
      detail: sensitive
        ? `在${profile.useCases.join("、") || "计划的 AI 场景"}中识别个人信息和商业秘密，先脱敏、限制日志留存，再核查跨境传输机制与供应商训练使用条款。`
        : "仅传入业务必需字段，配置日志留存、访问控制和删除周期；若后续引入个人信息，重新开展数据与跨境评估。",
      priority: sensitive ? "高" : "中",
    },
    {
      title: privateDeploy
        ? "评估区域化开放权重与混合部署"
        : "为公有云 API 设计可切换方案",
      detail: privateDeploy
        ? `针对${profile.deployment}，优先评估区域内托管与自部署边界，比较 Qwen、DeepSeek、Mistral 等代表模型的实际许可、安全维护和算力成本。`
        : "选择有适用服务区域与数据处理条款的供应商，保留替代模型并测试能力降级。迁移前复核许可、客户承诺和数据流变化。",
      priority: "中",
    },
    ...(aggregation
      ? [
          {
            title: "将模型路由资格与计费隔离落实到每次请求",
            detail:
              "建立租户、终端用户、来源地区和供应商资格校验；路由fallback仅在已获准的模型池内执行。向客户披露真实处理方、数据区域、日志策略及故障切换行为，避免把技术可调用等同于有权转售。",
            priority: "高",
          },
        ]
      : [
          {
            title: `为${profile.industry}制定场景上线门槛`,
            detail: `针对${profile.useCases.join("、") || "业务场景"}建立人工复核、质量评测与回滚流程，先在低风险数据和有限用户中试点。`,
            priority: "中",
          },
        ]),
    ...(profile.markets.includes("欧盟")
      ? [
          {
            title: "单独核查欧盟业务角色与责任",
            detail:
              "区分企业是模型使用者、系统提供者还是通用AI模型提供者，结合实际功能、客户与用途核对适用义务；不因采用开放权重而自动豁免。",
            priority: "高",
          },
        ]
      : []),
  ];
  const selectedModels = aiModels
    .filter((m) =>
      privateDeploy ? m.openness === "开放权重" : m.openness === "闭源",
    )
    .slice(0, 3);
  const relevant = events
    .filter((signal) => signal.status === "已核实")
    .filter(
      (signal) =>
        signal.category === "市场准入" ||
        (profile.markets.includes("欧盟") && signal.country === "EU") ||
        (profile.markets.includes("中国") && signal.country === "CN") ||
        signal.category === "技术模型",
    )
    .slice(0, 5);
  return {
    mode: "rules",
    businessInsights: scope.map((b) => ({
      businessId: b.id,
      businessName: b.name,
      exposure: `${b.stage}业务覆盖${b.markets.join("、")}，涉及${b.dataTypes.join("、")}。${b.models.length ? `依赖${b.models.join("、")}，需逐项核查供应商服务资格、许可及终端用户条件。` : "尚未登记模型依赖，请先补充技术栈。"}`,
      opportunity:
        b.useCases.includes("私有化部署") || b.name.includes("私有")
          ? "以区域内私有部署承接企业敏感数据场景，形成可审计、可切换的模型接入能力。"
          : "通过多模型池和按地区路由提高服务韧性，同时为客户披露真实处理方与限制。",
      actions: [
        `为${b.name}维护「市场—客户—模型—数据处理方」准入清单。`,
        b.dataTypes.includes("个人信息")
          ? "拆分个人信息与API调用日志，配置脱敏、留存期限及跨境传输核查。"
          : "按业务需要最小化采集并设置访问与留存控制。",
        b.stage === "规划中"
          ? "上线前完成许可、服务地区与数据处理条款复核。"
          : "将政策变化与供应商条款更新加入变更审批及回滚流程。",
      ],
      sourceUrls: businessPolicies([b], events)
        .filter((policy) => policy.status === "已核实")
        .slice(0, 3)
        .map((policy) => policy.sourceUrl),
    })),
    summary: `这是为${profile.name || "当前企业"}的${scope.length ? scope.map((b) => b.name).join("、") : "企业整体"}生成的本地规则演示：企业位于${profile.headquarters}，业务覆盖${markets}，计划采用${profile.deployment}处理${profile.dataSensitivity}。${aggregation ? "AI 聚合平台应优先核查供应商转售与终端用户资格，并建立按租户和区域隔离的路由策略。" : "建议先建立区域准入和场景上线门槛，再逐步扩大 AI 使用。"}这些方向依据已填写档案匹配，未调用实时 AI。`,
    recommendations,
    risks: [
      {
        title: "服务资格需复核",
        detail:
          "组织成员关系、公司注册地与服务器位置均不能单独证明供应商服务资格或免除法律义务。",
        level: "高",
      },
      {
        title: sensitive ? "敏感信息与跨境风险" : "业务边界变化",
        detail: sensitive
          ? "敏感数据、客户内容与调用日志可能流经多个处理方，必须确认完整数据链路。"
          : "引入个人信息、监管行业客户或新的市场时，应重新评估控制措施。",
        level: sensitive ? "高" : "中",
      },
    ],
    models: selectedModels.map((m) => ({
      name: m.name,
      fit: `${m.openness} · ${m.deployment}`,
      caution: m.considerations.join("；"),
    })),
    sources: relevant.map((signal) => ({
      title: signal.title,
      url: signal.sourceUrl,
      date: signal.date,
      sourceType: "official_snapshot",
    })),
    generatedAt: new Date().toISOString(),
    profileSnapshot: { ...profile },
    notice: "本地规则演示，未调用实时 AI；候选模型不代表已获得使用或转售资格。",
  };
}
function featureSignals(events: Signal[]) {
  return [
    events.find((s) => s.category === "市场准入"),
    events.find((s) => s.country === "EU" && s.category === "政策监管"),
    events.find((s) => s.category === "技术模型"),
  ].filter((signal): signal is Signal => Boolean(signal));
}
const DEMO_PROFILE_KEY = "windsight-demo-profile-v1";
const DEMO_REPORT_KEY = "windsight-demo-report-v1";
function readDemoProfile(): Profile {
  try {
    const value = JSON.parse(localStorage.getItem(DEMO_PROFILE_KEY) || "null");
    if (!value || typeof value !== "object" || typeof value.name !== "string")
      return { ...exampleProfile };
    const profile = { ...exampleProfile };
    for (const key of [
      "name",
      "website",
      "industry",
      "headquarters",
      "dataSensitivity",
      "deployment",
      "description",
    ] as const)
      if (typeof value[key] === "string")
        profile[key] = value[key].slice(0, key === "description" ? 5000 : 300);
    for (const key of ["markets", "useCases"] as const)
      if (Array.isArray(value[key]))
        profile[key] = value[key]
          .filter((item: unknown) => typeof item === "string")
          .slice(0, 20);
    if (Array.isArray(value.businesses))
      profile.businesses = value.businesses
        .filter(
          (b: unknown) =>
            b &&
            typeof b === "object" &&
            typeof (b as Business).id === "string" &&
            typeof (b as Business).name === "string",
        )
        .slice(0, 20)
        .map((b: Business) => ({
          ...b,
          description: typeof b.description === "string" ? b.description : "",
          markets: Array.isArray(b.markets)
            ? b.markets.filter((v) => typeof v === "string")
            : [],
          useCases: Array.isArray(b.useCases)
            ? b.useCases.filter((v) => typeof v === "string")
            : [],
          dataTypes: Array.isArray(b.dataTypes)
            ? b.dataTypes.filter((v) => typeof v === "string")
            : [],
          models: Array.isArray(b.models)
            ? b.models.filter((v) => typeof v === "string")
            : [],
          stage: ["规划中", "试点中", "已上线"].includes(b.stage)
            ? b.stage
            : "规划中",
        }));
    return profile;
  } catch {
    return { ...exampleProfile };
  }
}
function readDemoReport(): StrategyResult | null {
  try {
    const report = JSON.parse(localStorage.getItem(DEMO_REPORT_KEY) || "null");
    return report &&
      report.mode === "rules" &&
      typeof report.summary === "string" &&
      Array.isArray(report.recommendations)
      ? report
      : null;
  } catch {
    return null;
  }
}
function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function SourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="source-link"
    >
      {children}
      <I name="external" size={12} />
    </a>
  );
}
function normalizeSignals(
  items: unknown[],
  candidate = false,
  snapshot = false,
): Signal[] {
  return items
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object",
    )
    .map((item, index) => {
      const region = String(item.region || "全球");
      const country = countries.find(
        (c) => c.code === region || c.name === region || c.nameEn === region,
      );
      const category = String(item.category || "技术模型");
      return {
        id: String(item.id || `live-${index}-${Date.now()}`),
        title: String(item.title || "待核实情报"),
        summary: String(item.summary || ""),
        date:
          typeof item.publishedAt === "string" &&
          !Number.isNaN(Date.parse(item.publishedAt))
            ? item.publishedAt.slice(0, 10)
            : "日期待核实",
        country: country?.code || "",
        countryName: country?.name || region,
        category: ([
          "政策监管",
          "技术模型",
          "国际合作",
          "市场准入",
          "数据安全",
        ].includes(category)
          ? category
          : "技术模型") as Signal["category"],
        impact: (["高", "中", "低"].includes(String(item.impact))
          ? String(item.impact)
          : "中") as Signal["impact"],
        source:
          String(item.sourceName || "X / 联网检索") +
          (snapshot ? " · 已捕获快照" : ""),
        sourceUrl: String(item.sourceUrl || ""),
        tags: [
          String(item.organization || "全球 AI"),
          candidate ? "未核实候选" : "社交媒体信号",
          ...(snapshot ? ["已捕获检索快照，非当前重新检索"] : []),
        ],
        status: "待核实",
        implication:
          (snapshot
            ? "这是已捕获的历史检索快照，非当前重新检索。"
            : "此信息来自实时检索。") +
          "尚未完成官方交叉核验。请查看原始来源，确认发布日期、适用区域和政策文本后再用于企业决策。",
      };
    });
}
function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    return [
      v.title ?? v.name ?? v.action ?? v.model,
      v.description ?? v.reason ?? v.detail ?? v.rationale ?? v.fit,
      v.caution,
    ]
      .filter(Boolean)
      .map(String)
      .join("：");
  }
  return String(value ?? "");
}
async function request(path: string, body?: unknown) {
  const response = await fetch(
    path,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : undefined,
  );
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.error || result.message || "暂时无法完成，请稍后重试",
    );
  return result;
}

export function InsightApp() {
  const sessionIdentity = useRef<string | null>(null);
  const [view, setView] = useState<View>("overview");
  const [policyFeed, setPolicyFeed] = useState<Signal[]>(initialPolicyFeed);
  const [bloc, setBloc] = useState("全部");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部情报");
  const [impact, setImpact] = useState("全部重要性");
  const [detail, setDetail] = useState<Signal | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [onlySaved, setOnlySaved] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authAction, setAuthAction] = useState<"signIn" | "signUp">("signIn");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [profile, setProfile] = useState<Profile>(exampleProfile);
  const [isDemo, setIsDemo] = useState(true);
  const [selectedBusinessId, setSelectedBusinessId] = useState("all");
  const [businessDraft, setBusinessDraft] = useState<Business | null>(null);
  const [businessDeleteId, setBusinessDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [strategy, setStrategy] = useState<StrategyResult | null>(null);
  const [strategyError, setStrategyError] = useState("");
  const [restoredReport, setRestoredReport] = useState(false);
  const [liveSignals, setLiveSignals] = useState<Signal[]>([]);
  const [radarMessage, setRadarMessage] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  function navigate(next: View) {
    setView(next);
    setQuery("");
    setMobileNav(false);
    window.history.replaceState(null, "", `#${next}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  useEffect(() => {
    let cancelled = false;
    async function refreshFeed() {
      try {
        const feed = await request("/api/feed");
        if (!cancelled && Array.isArray(feed.signals)) {
          const accepted = feed.signals.filter(
            (value: unknown): value is Signal =>
              Boolean(
                value &&
                  typeof value === "object" &&
                  typeof (value as Signal).id === "string" &&
                  typeof (value as Signal).title === "string" &&
                  Array.isArray((value as Signal).tags),
              ),
          );
          setPolicyFeed(
            accepted.map((signal: Signal) => ({
              ...signal,
              status: signal.status === "已核实" ? "已核实" : "待核实",
            })),
          );
        }
      } catch {
        /* Keep the latest available source snapshot. */
      }
    }
    void refreshFeed();
    const timer = setInterval(refreshFeed, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    queueMicrotask(() => {
      const hash = window.location.hash.slice(1) as View;
      if (navigation.some((n) => n.id === hash)) setView(hash);
      try {
        const saved = JSON.parse(
          localStorage.getItem("windsight-saved-v1") || "[]",
        );
        if (Array.isArray(saved)) setBookmarks(saved);
      } catch {}
      setProfile(readDemoProfile());
      const demoReport = readDemoReport();
      if (demoReport) {
        setStrategy(demoReport);
        setRestoredReport(true);
      }
    });
    request("/api/session")
      .then((r) => {
        setUser(r.user || null);
        if (r.user) {
          sessionIdentity.current = r.user.id;
          setProfile(emptyProfile);
          setIsDemo(false);
          setStrategy(null);
          setRestoredReport(false);
          request("/api/company")
            .then((c) => {
              if (sessionIdentity.current === r.user.id && c.profile) {
                setProfile({
                  ...emptyProfile,
                  ...c.profile,
                  businesses: Array.isArray(c.profile.businesses)
                    ? c.profile.businesses
                    : [],
                });
                setIsDemo(false);
              }
            })
            .catch(() => {});
          request("/api/intelligence")
            .then((r) => {
              if (sessionIdentity.current && r.search) {
                setLiveSignals([
                  ...normalizeSignals(r.search.signals || []),
                  ...normalizeSignals(r.search.candidates || [], true),
                ]);
                setRadarMessage(
                  "已恢复该账户最近一次保存的检索记录，社交信号仍需核实。",
                );
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    request("/api/reports")
      .then((result) => {
        const latest = result.reports?.[0];
        if (!cancelled && latest?.payload) {
          setStrategy({
            ...latest.payload,
            generatedAt: latest.payload.generatedAt || latest.created_at,
          });
          setRestoredReport(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(id);
    }
  }, [toast]);
  const active = navigation.find((n) => n.id === view) || navigation[0];
  const businesses = profile.businesses || [];
  const focusedBusinesses =
    selectedBusinessId === "all"
      ? businesses
      : businesses.filter((b) => b.id === selectedBusinessId);
  const relatedPolicies = businessPolicies(
    focusedBusinesses.length ? focusedBusinesses : businesses,
    policyFeed,
  );
  const featuredSignals = featureSignals(policyFeed);
  const marketCount = new Set(businesses.flatMap((b) => b.markets)).size;
  async function persistBusinessProfile(next: Profile, message: string) {
    setProfile(next);
    setBusy(true);
    try {
      if (user) {
        await request("/api/company", { profile: next });
        setIsDemo(false);
      } else {
        localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(next));
        setIsDemo(true);
      }
      setToast(message + (user ? "，已同步云端" : "，已保存在本浏览器"));
    } catch (error) {
      setToast((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function newBusiness() {
    setBusinessDraft({
      id: `business-${Date.now()}`,
      name: "",
      description: "",
      markets: [],
      useCases: [],
      dataTypes: [],
      models: [],
      stage: "规划中",
    });
    setBusinessDeleteId(null);
  }
  async function saveBusiness(e: FormEvent) {
    e.preventDefault();
    if (!businessDraft) return;
    const next = {
      ...profile,
      businesses: businesses.some((b) => b.id === businessDraft.id)
        ? businesses.map((b) => (b.id === businessDraft.id ? businessDraft : b))
        : [...businesses, businessDraft],
    };
    await persistBusinessProfile(next, "业务场景已保存");
  }
  async function deleteBusiness(id: string) {
    await persistBusinessProfile(
      { ...profile, businesses: businesses.filter((b) => b.id !== id) },
      "业务场景已删除",
    );
    setBusinessDraft(null);
    if (selectedBusinessId === id) setSelectedBusinessId("all");
    setBusinessDeleteId(null);
  }
  function toggleBusinessField(
    field: "markets" | "useCases" | "dataTypes" | "models",
    value: string,
  ) {
    setBusinessDraft((current) =>
      current
        ? {
            ...current,
            [field]: current[field].includes(value)
              ? current[field].filter((item) => item !== value)
              : [...current[field], value],
          }
        : current,
    );
  }
  const allSignals = Array.from(
    new Map(
      [...policyFeed, ...liveSignals].map((signal) => [signal.id, signal]),
    ).values(),
  ).sort((a, b) => b.date.localeCompare(a.date));
  const filteredSignals = allSignals.filter(
    (s) =>
      (category === "全部情报" || s.category === category) &&
      (impact === "全部重要性" || s.impact === impact) &&
      (bloc === "全部" ||
        countries
          .find((c) => c.code === s.country)
          ?.organizations.includes(bloc)) &&
      (!onlySaved || bookmarks.includes(s.id)) &&
      (!query ||
        [s.title, s.summary, s.countryName, ...s.tags]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  function bookmark(id: string) {
    setBookmarks((previous) => {
      const next = previous.includes(id)
        ? previous.filter((i) => i !== id)
        : [...previous, id];
      localStorage.setItem("windsight-saved-v1", JSON.stringify(next));
      return next;
    });
  }
  function loadDemo() {
    setProfile(exampleProfile);
    setIsDemo(true);
    setToast("已载入演示企业，可修改后保存为你的档案");
  }
  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      try {
        localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
        setIsDemo(true);
        setToast("演示企业画像已保存在当前浏览器");
      } catch {
        setToast("浏览器暂时无法保存，当前填写内容仍可用于生成建议");
      }
      return;
    }
    setBusy(true);
    try {
      await request("/api/company", { profile });
      setIsDemo(false);
      setToast("企业画像已保存至云端");
    } catch (e) {
      setToast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function generateStrategy() {
    setStrategyError("");
    if (!profile.name.trim()) {
      setStrategyError("请先填写企业名称，或在企业画像中载入演示企业。");
      return;
    }
    if (!user) {
      const report = ruleStrategy(
        profile.name ? profile : exampleProfile,
        selectedBusinessId,
        policyFeed,
      );
      setStrategy(report);
      try {
        localStorage.setItem(DEMO_REPORT_KEY, JSON.stringify(report));
        const history = JSON.parse(
          localStorage.getItem("windsight-demo-history-v1") || "[]",
        );
        localStorage.setItem(
          "windsight-demo-history-v1",
          JSON.stringify(
            [report, ...(Array.isArray(history) ? history : [])].slice(0, 10),
          ),
        );
      } catch {}
      setRestoredReport(false);
      setToast("演示分析已生成，报告保存在当前浏览器，可直接导出");
      return;
    }
    setBusy(true);
    try {
      const result = await request("/api/strategy", {
        profile,
        selectedBusinessId:
          selectedBusinessId === "all" ? undefined : selectedBusinessId,
      });
      setStrategy({
        ...result,
        profileSnapshot: result.profileSnapshot || { ...profile },
      });
      setRestoredReport(false);
    } catch (e) {
      setStrategyError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function loadCapturedSnapshot() {
    setLiveSignals([
      ...normalizeSignals(capturedSearch.signals, false, true),
      ...normalizeSignals(capturedSearch.candidates, true, true),
    ]);
    setQuery("");
    setCategory("全部情报");
    setImpact("全部重要性");
    setBloc("全部");
    setOnlySaved(false);
    setRadarMessage(
      `已载入 ${capturedSearch.signals.length} 条已捕获检索快照（捕获时间 ${new Date(capturedSearch.generatedAt).toLocaleString("zh-CN")}），非当前重新检索。所有社交线索均待核实；此操作不会写入数据库。`,
    );
  }
  async function refreshIntelligence() {
    if (!user) {
      loadCapturedSnapshot();
      return;
    }
    setBusy(true);
    setRadarMessage("");
    try {
      const r = await request("/api/intelligence", {
        keyword: query || "GPAI WAICO AI governance policy open source models",
        regions: bloc === "全部" ? [] : [bloc],
      });
      if (Array.isArray(r.signals))
        setLiveSignals([
          ...normalizeSignals(r.signals),
          ...normalizeSignals(r.candidates || [], true),
        ]);
      setRadarMessage(
        r.signals?.length || r.candidates?.length
          ? `检索完成：${r.signals?.length || 0} 条可追溯社交信号，${r.candidates?.length || 0} 条未核实候选。请打开原始来源核实。`
          : r.notice || r.message || "本次检索没有返回可展示的新情报。",
      );
    } catch (e) {
      setRadarMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function authenticate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setAuthBusy(true);
    setAuthMessage("");
    try {
      const r = await request("/api/auth", {
        action: authAction,
        email: data.get("email"),
        password: data.get("password"),
      });
      if (r.user) {
        sessionIdentity.current = r.user.id;
        setUser(r.user);
        setProfile(emptyProfile);
        setIsDemo(false);
        setStrategy(null);
        setRestoredReport(false);
        setLiveSignals([]);
        setRadarMessage("");
        setAuthOpen(false);
        setToast("登录成功");
        const c = await request("/api/company");
        if (sessionIdentity.current === r.user.id && c.profile) {
          setProfile({
            ...emptyProfile,
            ...c.profile,
            businesses: Array.isArray(c.profile.businesses)
              ? c.profile.businesses
              : [],
          });
          setIsDemo(false);
        }
      } else setAuthMessage(r.message || "请前往邮箱确认账户后再登录。");
    } catch (e) {
      setAuthMessage((e as Error).message);
    } finally {
      setAuthBusy(false);
    }
  }
  async function signOut() {
    try {
      await request("/api/auth", { action: "signOut" });
      sessionIdentity.current = null;
      setUser(null);
      setProfile(readDemoProfile());
      setIsDemo(true);
      const demoReport = readDemoReport();
      setStrategy(demoReport);
      setLiveSignals([]);
      setRadarMessage("");
      setRestoredReport(Boolean(demoReport));
      setToast("已退出真实账户，已返回演示账号");
    } catch (e) {
      setToast((e as Error).message);
    }
  }
  function exportReport() {
    if (!strategy) {
      setToast("请先生成战略建议再导出");
      return;
    }
    const reportProfile = strategy.profileSnapshot;
    const numbered = (items: unknown[] = []) =>
      items.map((item, index) => `${index + 1}. ${textOf(item)}`);
    const sourceLines = (strategy.sources || []).map((source, index) => {
      if (!source || typeof source !== "object")
        return `${index + 1}. ${textOf(source)}`;
      const entry = source as Record<string, unknown>;
      return `${index + 1}. ${entry.title || "参考来源"}\n${entry.url || "未提供链接"}\n资料日期：${entry.date || "未注明"}；来源类型：${entry.sourceType === "social_signal" ? "社交信号（待核实）" : entry.sourceType === "official_snapshot" ? "官方资料快照" : "见原始来源"}${entry.checkedAt ? `；核查日期：${entry.checkedAt}` : ""}`;
    });
    const body = [
      "观风 windsight · 企业 AI 战略简报",
      `分析状态：${strategy.mode === "ai" ? "AI 辅助分析" : strategy.mode === "rules" ? "本地规则辅助分析" : strategy.mode || "未注明"}`,
      `生成时间：${strategy.generatedAt || "未注明"}`,
      reportProfile
        ? `企业：${reportProfile.name}\n总部：${reportProfile.headquarters}\n所属行业：${reportProfile.industry}\n业务区域：${reportProfile.markets.join("、")}\nAI场景：${reportProfile.useCases.join("、")}\n数据敏感度：${reportProfile.dataSensitivity}\n部署偏好：${reportProfile.deployment}`
        : "历史报告未记录企业档案快照。下述分析以原报告内容为准，需确认企业信息是否仍然适用。",
      "建议概览",
      strategy.summary || "未提供概览",
      "业务关联洞察",
      ...(strategy.businessInsights || []).map(
        (item) =>
          `${item.businessName}\n风险暴露：${item.exposure}\n机会：${item.opportunity}\n行动：${item.actions.join("；")}\n政策来源：${item.sourceUrls.join("\n")}`,
      ),
      "建议行动",
      ...numbered(strategy.recommendations),
      "需进一步核查",
      ...numbered(strategy.risks),
      "候选模型方向",
      ...numbered(strategy.models),
      "参考来源与资料日期",
      ...sourceLines,
      strategy.notice || "",
      "内容为辅助研究，具体实施需核实原始来源和适用法律。社交信号不自动构成政策事实或合规结论。",
    ].join("\n\n");
    const url = URL.createObjectURL(
      new Blob([body], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "windsight-企业AI战略简报.txt";
    a.click();
    URL.revokeObjectURL(url);
    setToast("战略简报已导出");
  }
  function signalList(items: Signal[], compact = false) {
    return (
      <div className={`signal-list ${compact ? "compact" : ""}`}>
        {items.length ? (
          items.map((s) => (
            <article key={s.id} className="signal-row">
              <div
                className={`signal-icon ${s.category === "技术模型" ? "green" : s.category === "数据安全" ? "amber" : "blue"}`}
              >
                <I
                  name={
                    s.category === "技术模型"
                      ? "models"
                      : s.category === "数据安全"
                        ? "shield"
                        : "source"
                  }
                  size={19}
                />
              </div>
              <button className="signal-body" onClick={() => setDetail(s)}>
                <div className="signal-row-meta">
                  <Badge tone={s.impact === "高" ? "amber" : "neutral"}>
                    {s.impact === "高" ? "重点关注" : s.category}
                  </Badge>
                  <span>{s.countryName}</span>
                  <span>{s.date}</span>
                </div>
                <h3>{s.title}</h3>
                {!compact && <p>{s.summary}</p>}
                <div className="signal-source">
                  {s.source}
                  <span>·</span>
                  {s.status}
                  <I name="chevron" size={12} />
                </div>
              </button>
              <button
                className={`save-button ${bookmarks.includes(s.id) ? "saved" : ""}`}
                aria-label={bookmarks.includes(s.id) ? "取消收藏" : "收藏情报"}
                onClick={() => bookmark(s.id)}
              >
                <svg
                  width="17"
                  height="19"
                  viewBox="0 0 20 22"
                  fill={bookmarks.includes(s.id) ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 2h12v18l-6-4-6 4V2Z" />
                </svg>
              </button>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <I name="search" size={30} />
            <h3>没有匹配的情报</h3>
            <p>换一个关键词或清除筛选，继续探索全球 AI 动向。</p>
            <button
              className="btn secondary"
              onClick={() => {
                setQuery("");
                setCategory("全部情报");
                setImpact("全部重要性");
                setBloc("全部");
                setOnlySaved(false);
              }}
            >
              清除筛选
            </button>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        跳转到主要内容
      </a>
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <Link className="brand" href="/" aria-label="返回观风主站">
          <WindLogo />
          <div>
            <strong>
              观风 <span>windsight</span>
            </strong>
            <small>全球企业 AI 战略情报</small>
          </div>
        </Link>
        <button
          className="workspace-switch"
          onClick={() => navigate("company")}
        >
          <span className="workspace-symbol">
            <I name="building" size={17} />
          </span>
          <span>
            <strong>
              {profile.name
                ? profile.name.replace("（虚拟企业）", "")
                : "企业战略工作空间"}
            </strong>
            <small>{user ? "我的企业空间" : "演示账号 · 本地工作空间"}</small>
          </span>
          <I name="chevron" size={14} />
        </button>
        <nav aria-label="企业后台主导航">
          <p className="nav-group-label">企业工作空间</p>
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => navigate(item.id)}
            >
              <I name={item.icon} />
              {item.label}
              {item.id === "businesses" && (
                <span className="nav-count">{businesses.length}</span>
              )}
              {item.id === "strategy" && <span className="ai-tag">AI</span>}
            </button>
          ))}
          <p className="nav-group-label second">全球视野</p>
          <Link href="/" className="nav-item">
            <I name="globe" />
            返回观风主站
            <I name="external" size={12} />
          </Link>
          <button
            className="nav-item"
            onClick={() => {
              navigate("radar");
              setOnlySaved(true);
            }}
          >
            <I name="eye" />
            已关注的政策<span className="nav-count">{bookmarks.length}</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="small-orbit">
              <I name="globe" size={17} />
            </span>
            <strong>观全球风向，知企业进退。</strong>
            <p>
              让每一次 AI 决策
              <br />
              都有全球视野。
            </p>
            <button onClick={() => navigate("sources")}>
              了解观风
              <I name="arrow" size={13} />
            </button>
          </div>
          <button
            className="sidebar-account"
            onClick={() => navigate("company")}
          >
            <span className="avatar">
              {user?.email?.[0]?.toUpperCase() || <I name="user" size={16} />}
            </span>
            <div>
              <strong>
                {user ? user.email?.split("@")[0] : "演示账号 · Meridian AI"}
              </strong>
              <small>{user ? "企业工作空间" : "无需注册 · 可直接体验"}</small>
            </div>
            <I name="chevron" size={14} />
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="打开导航"
              onClick={() => setMobileNav((v) => !v)}
            >
              <I name="menu" />
            </button>
            <Link href="/" className="console-home-link">
              观风主站
            </Link>
            <I name="chevron" size={12} />
            <span>企业后台</span>
            <I name="chevron" size={12} />
            <strong>{active.label}</strong>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <I name="search" size={15} />
              <input
                aria-label="搜索情报或模型"
                placeholder="搜索政策、模型、国家…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (view !== "radar") setView("radar");
                }}
              />
              <kbd>⌕</kbd>
            </label>
            <span className="top-divider" />
            <button
              className="icon-button notification-button"
              aria-label="查看重点情报"
              onClick={() => {
                navigate("radar");
                setImpact("高");
              }}
            >
              <I name="bell" size={19} />
              <i />
            </button>
            {user ? (
              <button
                className="top-avatar"
                onClick={signOut}
                aria-label="退出登录"
                title="退出登录"
              >
                {user.email?.[0]?.toUpperCase() || "W"}
              </button>
            ) : (
              <>
                <span className="demo-header-identity">
                  演示账号 · Meridian AI
                </span>
                <button
                  className="login-button"
                  onClick={() => setAuthOpen(true)}
                >
                  <I name="user" size={15} />
                  切换真实账号
                </button>
              </>
            )}
          </div>
        </header>
        <main id="main-content" className="main-content">
          {!user && (
            <div className="demo-session-banner">
              <span className="demo-session-icon">
                <I name="building" size={17} />
              </span>
              <div>
                <strong>演示账号 · Meridian AI</strong>
                <p>
                  无需注册即可体验完整流程。企业档案与演示报告仅保存在本浏览器；X
                  展示已捕获快照，战略建议为本地演示分析。
                </p>
              </div>
              <button onClick={() => setAuthOpen(true)}>
                切换真实账号
                <I name="chevron" size={12} />
              </button>
            </div>
          )}
          <div className="page-heading">
            <div>
              <div className="page-kicker">
                <span className="status-dot" />
                企业 AI 战略工作空间
              </div>
              <h1>
                {view === "overview"
                  ? "你的业务，正在怎样的风向里？"
                  : active.label}
              </h1>
              <p>
                {view === "overview"
                  ? "维护业务场景，连接市场政策、数据条件与模型依赖，形成可执行的企业 AI 战略。"
                  : active.description}
              </p>
            </div>
            <div className="heading-actions">
              {view === "overview" ? (
                <>
                  <span className="date-note">
                    <I name="clock" size={14} />
                    {DATA_UPDATED_AT} 资料快照
                  </span>
                  <button
                    className="btn primary"
                    onClick={() => navigate("strategy")}
                  >
                    <I name="spark" size={15} />
                    我的 AI 战略
                    <I name="arrow" size={14} />
                  </button>
                </>
              ) : view === "radar" ? (
                <button
                  className="btn primary"
                  disabled={busy}
                  onClick={refreshIntelligence}
                >
                  <I
                    name="refresh"
                    size={15}
                    className={busy ? "spinning" : ""}
                  />
                  {busy ? "正在检索…" : user ? "实时检索" : "查看 X 情报快照"}
                </button>
              ) : view === "strategy" ? (
                <button className="btn secondary" onClick={exportReport}>
                  <I name="download" size={15} />
                  导出简报
                </button>
              ) : null}
            </div>
          </div>
          {view === "overview" && (
            <>
              <section className="enterprise-summary panel">
                <div className="enterprise-emblem">
                  <I name="building" size={29} />
                </div>
                <div>
                  <div className="enterprise-summary-meta">
                    <Badge tone="blue">
                      {user ? "企业工作空间" : "虚拟企业案例"}
                    </Badge>
                    <span>{profile.headquarters}注册主体</span>
                  </div>
                  <h2>{profile.name || "建立你的企业画像"}</h2>
                  <p>
                    {profile.description ||
                      "先填写企业信息，再维护真实业务与AI使用场景。"}
                  </p>
                </div>
                <button
                  className="btn secondary"
                  onClick={() => navigate("company")}
                >
                  维护企业画像
                  <I name="arrow" size={14} />
                </button>
              </section>
              <div className="stats-grid enterprise-stats">
                {[
                  {
                    label: "已维护业务场景",
                    value: businesses.length,
                    unit: "项",
                    note: "业务是策略分析的最小单元",
                    icon: "models" as IconName,
                    tone: "blue",
                    target: "businesses" as View,
                  },
                  {
                    label: "覆盖业务市场",
                    value: marketCount,
                    unit: "个",
                    note: "按业务拆分区域准入条件",
                    icon: "globe" as IconName,
                    tone: "green",
                    target: "businesses" as View,
                  },
                  {
                    label: "关联政策线索",
                    value: relatedPolicies.length,
                    unit: "条",
                    note: "来自已收录的政策与技术信号",
                    icon: "radar" as IconName,
                    tone: "amber",
                    target: "radar" as View,
                  },
                  {
                    label: "业务已进入试点",
                    value: businesses.filter((b) => b.stage !== "规划中")
                      .length,
                    unit: "项",
                    note: "持续关注上线与变更条件",
                    icon: "shield" as IconName,
                    tone: "purple",
                    target: "strategy" as View,
                  },
                ].map((stat) => (
                  <button
                    className="stat-card"
                    key={stat.label}
                    onClick={() => navigate(stat.target)}
                  >
                    <div className={`stat-symbol ${stat.tone}`}>
                      <I name={stat.icon} size={20} />
                    </div>
                    <div>
                      <span>{stat.label}</span>
                      <strong>
                        {stat.value}
                        <small>{stat.unit}</small>
                      </strong>
                      <p>{stat.note}</p>
                    </div>
                    <I name="chevron" size={14} />
                  </button>
                ))}
              </div>
              <div className="enterprise-overview-grid">
                <section className="panel">
                  <div className="section-top">
                    <div>
                      <h2>
                        <I name="models" size={18} />
                        业务场景概览
                      </h2>
                      <p>不同业务面对不同地区、数据与模型条件</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => {
                        navigate("businesses");
                        newBusiness();
                      }}
                    >
                      <I name="plus" size={14} />
                      新增业务
                    </button>
                  </div>
                  <div className="business-overview-list">
                    {businesses.length ? (
                      businesses.map((b) => (
                        <article key={b.id}>
                          <div className="business-overview-title">
                            <span className="business-mark">
                              <I
                                name={
                                  b.name.includes("私有") ? "shield" : "models"
                                }
                                size={19}
                              />
                            </span>
                            <div>
                              <h3>{b.name}</h3>
                              <p>{b.markets.join(" / ") || "待维护业务市场"}</p>
                            </div>
                            <Badge
                              tone={
                                b.stage === "已上线"
                                  ? "green"
                                  : b.stage === "试点中"
                                    ? "blue"
                                    : "neutral"
                              }
                            >
                              {b.stage}
                            </Badge>
                          </div>
                          <p className="business-overview-description">
                            {b.description}
                          </p>
                          <div className="business-overview-bottom">
                            <span>
                              {b.models.slice(0, 3).map((model) => (
                                <span
                                  className="business-model-logo"
                                  key={model}
                                  title={model}
                                >
                                  <BrandLogo name={model} size={17} />
                                </span>
                              ))}
                              {b.dataTypes.slice(0, 2).join(" · ") ||
                                "数据类型待补充"}
                            </span>
                            <button
                              className="text-button"
                              onClick={() => {
                                setSelectedBusinessId(b.id);
                                navigate("strategy");
                              }}
                            >
                              分析此业务
                              <I name="arrow" size={13} />
                            </button>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="empty-state">
                        <I name="models" size={28} />
                        <h3>从第一项业务开始</h3>
                        <p>描述市场、客户、数据与模型，让政策判断与你相关。</p>
                        <button
                          className="btn primary"
                          onClick={() => {
                            navigate("businesses");
                            newBusiness();
                          }}
                        >
                          新增业务场景
                        </button>
                      </div>
                    )}
                  </div>
                </section>
                <aside className="panel enterprise-next-step">
                  <div className="large-icon blue">
                    <I name="spark" size={25} />
                  </div>
                  <h2>让变化，连接到具体业务。</h2>
                  <p>
                    从企业信息到业务场景，再到有来源的策略建议，形成完整决策链。
                  </p>
                  <ol>
                    <li>
                      <span>1</span>
                      <div>
                        <strong>企业画像</strong>
                        <p>注册主体、总部、整体市场与目标</p>
                      </div>
                      <I name="check" size={15} />
                    </li>
                    <li>
                      <span>2</span>
                      <div>
                        <strong>业务场景</strong>
                        <p>逐项维护产品、数据、模型与阶段</p>
                      </div>
                      {businesses.length > 0 && <I name="check" size={15} />}
                    </li>
                    <li>
                      <span>3</span>
                      <div>
                        <strong>业务政策关联</strong>
                        <p>识别准入、数据跨境与许可核查事项</p>
                      </div>
                    </li>
                    <li>
                      <span>4</span>
                      <div>
                        <strong>战略行动清单</strong>
                        <p>针对具体业务生成可追溯建议</p>
                      </div>
                    </li>
                  </ol>
                  <button
                    className="btn primary full"
                    onClick={() => navigate("strategy")}
                  >
                    进入战略工作台
                    <I name="arrow" size={14} />
                  </button>
                </aside>
              </div>
              <section className="panel enterprise-policy-panel">
                <div className="section-top">
                  <div>
                    <h2>
                      <I name="radar" size={18} />
                      与你的业务相关的政策风向
                    </h2>
                    <p>
                      按业务市场、数据和模型条件匹配；公开资料每 60
                      秒刷新，供进一步复核
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => navigate("radar")}
                  >
                    查看政策风向
                    <I name="arrow" size={14} />
                  </button>
                </div>
                {signalList(
                  (relatedPolicies.length
                    ? relatedPolicies
                    : featuredSignals
                  ).slice(0, 3),
                  true,
                )}
              </section>
            </>
          )}
          {view === "radar" && (
            <>
              <div className="policy-business-context panel">
                <I name="building" size={18} />
                <div>
                  <strong>以业务视角筛选政策</strong>
                  <p>选择业务后，查看按市场、数据和模型匹配的官方线索。</p>
                </div>
                <select
                  aria-label="政策关联业务"
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                >
                  <option value="all">全部业务</option>
                  {businesses.map((b) => (
                    <option value={b.id} key={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              {focusedBusinesses.length > 0 && (
                <section className="panel matched-policies">
                  <div className="section-top">
                    <h2>关联业务的政策与技术信号</h2>
                    <Badge tone="blue">
                      {focusedBusinesses.length}项业务 ·{" "}
                      {relatedPolicies.length}条线索
                    </Badge>
                  </div>
                  {signalList(relatedPolicies.slice(0, 3), true)}
                </section>
              )}
              <div className="radar-search panel">
                <div className="radar-search-main">
                  <I name="search" size={21} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索 AI 政策、模型发布、区域准入…"
                    aria-label="情报关键词"
                  />
                  <button
                    className="btn primary"
                    onClick={refreshIntelligence}
                    disabled={busy}
                  >
                    {busy ? "检索中…" : user ? "检索最新信号" : "载入情报快照"}
                  </button>
                </div>
                <p>
                  <I name="info" size={13} />
                  精选资料可直接浏览；实时检索通过 ZenMux Grok 联网与 X
                  搜索，结果保留原始来源。
                </p>
                <div className="search-snapshot-action">
                  <button
                    className="text-button"
                    onClick={loadCapturedSnapshot}
                  >
                    <I name="clock" size={13} />
                    载入已捕获的 X 检索示例
                  </button>
                  <span>历史快照 · 演示账号可体验</span>
                </div>
              </div>
              {radarMessage && (
                <div className="inline-message">
                  <I name="info" size={16} />
                  {radarMessage}
                </div>
              )}
              <div className="radar-layout">
                <section className="panel">
                  <div className="filter-bar">
                    <div className="filter-tabs">
                      {[
                        "全部情报",
                        "政策监管",
                        "技术模型",
                        "国际合作",
                        "数据安全",
                        "市场准入",
                      ].map((c) => (
                        <button
                          className={category === c ? "active" : ""}
                          key={c}
                          onClick={() => setCategory(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <button
                      className={`text-button ${onlySaved ? "blue-text" : ""}`}
                      onClick={() => setOnlySaved((v) => !v)}
                    >
                      <I name="eye" size={14} />
                      {onlySaved ? "已收藏" : "仅看收藏"}
                    </button>
                  </div>
                  <div className="result-summary">
                    <span>
                      {filteredSignals.length} 条匹配情报{" "}
                      {onlySaved && "· 已收藏"}
                    </span>
                    <div>
                      <select
                        aria-label="组织筛选"
                        value={bloc}
                        onChange={(e) => setBloc(e.target.value)}
                      >
                        <option value="全部">全部组织</option>
                        <option>GPAI</option>
                        <option>WAICO</option>
                      </select>
                      <select
                        aria-label="重要性筛选"
                        value={impact}
                        onChange={(e) => setImpact(e.target.value)}
                      >
                        <option>全部重要性</option>
                        <option value="高">高重要性</option>
                        <option value="中">中重要性</option>
                        <option value="低">低重要性</option>
                      </select>
                    </div>
                  </div>
                  {signalList(filteredSignals)}
                </section>
                <aside className="radar-aside">
                  <section className="panel side-section">
                    <h3>
                      <I name="radar" size={17} />
                      观察主题
                    </h3>
                    {[
                      "全球 AI 治理",
                      "开放权重与商用许可",
                      "模型服务地区",
                      "数据跨境与隐私",
                      "AI 安全与标准",
                    ].map((t, i) => (
                      <button
                        key={t}
                        onClick={() =>
                          setQuery(["AI", "开放", "地区", "数据", "安全"][i])
                        }
                      >
                        <span>{t}</span>
                        <I name="chevron" size={13} />
                      </button>
                    ))}
                  </section>
                  <section className="panel side-section source-status">
                    <h3>情报来源</h3>
                    <p>
                      <span className="status-dot" />
                      官方与权威机构资料
                    </p>
                    <p>
                      <span className="blue-dot" />X / 社交媒体即时搜索
                    </p>
                    <small>
                      社交信息与政策事实分开判断。待核实信号不会被当作正式政策。
                    </small>
                    <button
                      className="text-button"
                      onClick={() => navigate("sources")}
                    >
                      了解证据标准
                      <I name="arrow" size={13} />
                    </button>
                  </section>
                </aside>
              </div>
            </>
          )}
          {view === "businesses" && (
            <div className="business-workspace">
              <aside className="panel business-selection">
                <div className="section-top">
                  <h2>
                    业务场景 <small>{businesses.length}</small>
                  </h2>
                  <button className="text-button" onClick={newBusiness}>
                    <I name="plus" size={14} />
                    新增
                  </button>
                </div>
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    className={`business-selection-item ${businessDraft?.id === b.id ? "active" : ""}`}
                    onClick={() => {
                      setBusinessDraft({ ...b });
                      setBusinessDeleteId(null);
                    }}
                  >
                    <span className="business-mark">
                      <I
                        name={b.name.includes("私有") ? "shield" : "models"}
                        size={18}
                      />
                    </span>
                    <div>
                      <strong>{b.name}</strong>
                      <small>{b.markets.join(" / ") || "市场待填写"}</small>
                      <Badge
                        tone={
                          b.stage === "已上线"
                            ? "green"
                            : b.stage === "试点中"
                              ? "blue"
                              : "neutral"
                        }
                      >
                        {b.stage}
                      </Badge>
                    </div>
                    <I name="chevron" size={13} />
                  </button>
                ))}
                <button className="business-add-button" onClick={newBusiness}>
                  <I name="plus" size={16} />
                  新增业务场景
                </button>
                <p className="business-storage-note">
                  <I name="shield" size={13} />
                  {user
                    ? "业务信息保存至当前账户"
                    : "演示数据仅保存在当前浏览器"}
                </p>
              </aside>
              <section className="panel business-editor">
                {businessDraft ? (
                  <>
                    <div className="section-top">
                      <div>
                        <h2>
                          {businesses.some((b) => b.id === businessDraft.id)
                            ? "维护业务场景"
                            : "新增业务场景"}
                        </h2>
                        <p>
                          描述业务实际运行方式，避免将企业整体情况套用于所有产品。
                        </p>
                      </div>
                      <Badge tone="blue">
                        {user ? "云端企业档案" : "本地演示档案"}
                      </Badge>
                    </div>
                    <form className="company-form" onSubmit={saveBusiness}>
                      <div className="form-grid">
                        <label>
                          业务名称
                          <input
                            required
                            value={businessDraft.name}
                            onChange={(e) =>
                              setBusinessDraft((p) =>
                                p ? { ...p, name: e.target.value } : p,
                              )
                            }
                            placeholder="例如：全球模型 API 聚合"
                          />
                        </label>
                        <label>
                          业务阶段
                          <select
                            value={businessDraft.stage}
                            onChange={(e) =>
                              setBusinessDraft((p) =>
                                p
                                  ? {
                                      ...p,
                                      stage: e.target
                                        .value as Business["stage"],
                                    }
                                  : p,
                              )
                            }
                          >
                            <option>规划中</option>
                            <option>试点中</option>
                            <option>已上线</option>
                          </select>
                        </label>
                      </div>
                      <label>
                        业务描述与客户
                        <textarea
                          rows={4}
                          value={businessDraft.description}
                          onChange={(e) =>
                            setBusinessDraft((p) =>
                              p ? { ...p, description: e.target.value } : p,
                            )
                          }
                          placeholder="说明客户群体、价值、服务链路、运营主体和业务边界…"
                        />
                      </label>
                      {[
                        {
                          key: "markets" as const,
                          title: "业务市场",
                          options: [
                            "中国",
                            "欧盟",
                            "美国",
                            "东南亚",
                            "日本",
                            "中东",
                            "拉美",
                            "非洲",
                          ],
                        },
                        {
                          key: "useCases" as const,
                          title: "AI 使用场景",
                          options: [
                            "模型 API 路由",
                            "开发者平台",
                            "跨境 AI 服务",
                            "知识检索",
                            "业务自动化",
                            "智能客服",
                            "内容生成",
                            "数据分析",
                            "私有化部署",
                          ],
                        },
                        {
                          key: "dataTypes" as const,
                          title: "涉及的数据类型",
                          options: [
                            "一般业务数据",
                            "个人信息",
                            "API 密钥",
                            "商业秘密",
                            "支付信息",
                            "日志与调用记录",
                          ],
                        },
                        {
                          key: "models" as const,
                          title: "使用或计划使用的模型",
                          options: Array.from(
                            new Set([
                              ...aiModels.map((m) => m.name),
                              ...businessDraft.models,
                            ]),
                          ),
                        },
                      ].map((field) => (
                        <fieldset className="business-fieldset" key={field.key}>
                          <legend>
                            {field.title}
                            <small>可多选</small>
                          </legend>
                          <div className="choice-grid">
                            {field.options.map((option) => (
                              <button
                                type="button"
                                key={option}
                                className={`choice ${businessDraft[field.key].includes(option) ? "selected" : ""}`}
                                onClick={() =>
                                  toggleBusinessField(field.key, option)
                                }
                              >
                                {businessDraft[field.key].includes(option) && (
                                  <I name="check" size={13} />
                                )}
                                {field.key === "models" && (
                                  <BrandLogo name={option} size={16} />
                                )}
                                <span>{option}</span>
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      ))}
                      <div className="form-footer business-form-footer">
                        <div>
                          {businesses.some(
                            (b) => b.id === businessDraft.id,
                          ) && (
                            <button
                              type="button"
                              className={`business-delete ${businessDeleteId === businessDraft.id ? "confirm" : ""}`}
                              onClick={() =>
                                businessDeleteId === businessDraft.id
                                  ? deleteBusiness(businessDraft.id)
                                  : setBusinessDeleteId(businessDraft.id)
                              }
                            >
                              <I name="close" size={13} />
                              {businessDeleteId === businessDraft.id
                                ? "确认删除此业务"
                                : "删除业务"}
                            </button>
                          )}
                        </div>
                        <div>
                          <button
                            type="button"
                            className="btn secondary"
                            onClick={() => {
                              setSelectedBusinessId(businessDraft.id);
                              navigate("strategy");
                            }}
                            disabled={
                              !businesses.some((b) => b.id === businessDraft.id)
                            }
                          >
                            分析已保存业务
                          </button>
                          <button className="btn primary" disabled={busy}>
                            {busy ? "正在保存…" : "保存业务场景"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="business-editor-empty">
                    <div className="large-icon blue">
                      <I name="models" size={28} />
                    </div>
                    <h2>从具体业务，看清 AI 战略。</h2>
                    <p>
                      选择左侧业务进行维护，或新增一个业务场景。每项业务分别记录市场、用途、数据类型和模型依赖。
                    </p>
                    <button className="btn primary" onClick={newBusiness}>
                      <I name="plus" size={15} />
                      新增业务场景
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
          {view === "company" && (
            <>
              <div className="company-layout">
                <section className="panel company-form-panel">
                  <div className="section-top">
                    <div>
                      <h2>
                        <I name="building" size={18} />
                        企业基本信息
                      </h2>
                      <p>建立一次画像，让每一条建议与你的业务相关。</p>
                    </div>
                    <button className="text-button" onClick={loadDemo}>
                      载入演示企业
                      <I name="arrow" size={14} />
                    </button>
                  </div>
                  {isDemo && (
                    <div className="demo-notice">
                      <I name="info" size={15} />
                      当前为演示企业资料，你可以直接修改并保存。
                    </div>
                  )}
                  <div className="company-business-link">
                    <I name="models" size={16} />
                    <span>
                      已维护 {businesses.length}{" "}
                      项业务场景，业务数据将随企业档案一同保存。
                    </span>
                    <button
                      className="text-button"
                      onClick={() => navigate("businesses")}
                    >
                      管理业务
                      <I name="arrow" size={13} />
                    </button>
                  </div>
                  <form className="company-form" onSubmit={saveProfile}>
                    <div className="form-grid">
                      <label>
                        企业名称 <span>*</span>
                        <input
                          required
                          value={profile.name}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, name: e.target.value }))
                          }
                          placeholder="输入企业全称"
                        />
                      </label>
                      <label>
                        企业官网
                        <input
                          value={profile.website}
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              website: e.target.value,
                            }))
                          }
                          placeholder="https://example.com"
                        />
                      </label>
                      <label>
                        所属行业
                        <select
                          value={profile.industry}
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              industry: e.target.value,
                            }))
                          }
                        >
                          {[
                            "AI 聚合平台",
                            "跨境电商",
                            "软件与互联网",
                            "智能制造",
                            "金融服务",
                            "医疗健康",
                            "专业服务",
                            "教育科技",
                            "其他行业",
                          ].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        总部所在国家 / 地区
                        <select
                          value={profile.headquarters}
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              headquarters: e.target.value,
                            }))
                          }
                        >
                          {[
                            "中国",
                            "美国",
                            "新加坡",
                            "德国",
                            "法国",
                            "英国",
                            "日本",
                            "印度",
                            "其他",
                          ].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <fieldset>
                      <legend>
                        主要业务市场 <small>可多选</small>
                      </legend>
                      <div className="choice-grid">
                        {[
                          "中国",
                          "欧盟",
                          "美国",
                          "东南亚",
                          "日本",
                          "中东",
                          "拉美",
                          "非洲",
                        ].map((m) => (
                          <button
                            type="button"
                            key={m}
                            className={`choice ${profile.markets.includes(m) ? "selected" : ""}`}
                            onClick={() =>
                              setProfile((p) => ({
                                ...p,
                                markets: p.markets.includes(m)
                                  ? p.markets.filter((v) => v !== m)
                                  : [...p.markets, m],
                              }))
                            }
                          >
                            {profile.markets.includes(m) && (
                              <I name="check" size={13} />
                            )}{" "}
                            {m}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend>
                        计划使用 AI 的场景 <small>可多选</small>
                      </legend>
                      <div className="choice-grid">
                        {[
                          "模型 API 路由",
                          "开发者平台",
                          "跨境 AI 服务",
                          "智能客服",
                          "内容生成",
                          "代码辅助",
                          "数据分析",
                          "知识检索",
                          "图像与视频",
                          "业务自动化",
                          "产品内置 AI",
                        ].map((m) => (
                          <button
                            type="button"
                            key={m}
                            className={`choice ${profile.useCases.includes(m) ? "selected" : ""}`}
                            onClick={() =>
                              setProfile((p) => ({
                                ...p,
                                useCases: p.useCases.includes(m)
                                  ? p.useCases.filter((v) => v !== m)
                                  : [...p.useCases, m],
                              }))
                            }
                          >
                            {profile.useCases.includes(m) && (
                              <I name="check" size={13} />
                            )}{" "}
                            {m}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <div className="form-grid">
                      <label>
                        主要数据敏感度
                        <select
                          value={profile.dataSensitivity}
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              dataSensitivity: e.target.value,
                            }))
                          }
                        >
                          {["一般业务数据", "个人信息", "敏感业务数据"].map(
                            (t) => (
                              <option key={t}>{t}</option>
                            ),
                          )}
                        </select>
                      </label>
                      <label>
                        AI 部署偏好
                        <select
                          value={profile.deployment}
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              deployment: e.target.value,
                            }))
                          }
                        >
                          {["公有云 API", "私有化部署", "混合部署"].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label>
                      企业业务与 AI 目标
                      <textarea
                        rows={4}
                        value={profile.description}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="介绍产品、客户、出海计划和当前希望用 AI 解决的问题…"
                      />
                    </label>
                    <div className="form-footer">
                      <span>
                        <I name="shield" size={14} />
                        {user
                          ? "企业资料仅限当前账户访问"
                          : "演示资料仅保存在当前浏览器，不会写入云端"}
                      </span>
                      <button
                        className="btn primary"
                        type="submit"
                        disabled={busy}
                      >
                        {busy
                          ? "保存中…"
                          : user
                            ? "保存企业画像"
                            : "保存演示企业画像"}
                      </button>
                    </div>
                  </form>
                </section>
                <aside className="company-aside">
                  <section className="panel side-section profile-explain">
                    <span className="large-icon blue">
                      <I name="spark" size={25} />
                    </span>
                    <h2>
                      从“全球发生了什么”
                      <br />
                      到“企业该如何行动”
                    </h2>
                    <p>你的业务信息帮助观风连接三类决策依据。</p>
                    {[
                      {
                        icon: "globe" as IconName,
                        title: "市场与区域",
                        text: "匹配目标市场的治理框架与服务限制",
                      },
                      {
                        icon: "shield" as IconName,
                        title: "数据与风险",
                        text: "识别隐私、跨境与部署的核查事项",
                      },
                      {
                        icon: "models" as IconName,
                        title: "模型与技术",
                        text: "评估闭源 API、开放权重与备选方案",
                      },
                    ].map((c) => (
                      <div className="explain-item" key={c.title}>
                        <I name={c.icon} size={18} />
                        <div>
                          <strong>{c.title}</strong>
                          <p>{c.text}</p>
                        </div>
                      </div>
                    ))}
                    <button
                      className="btn primary full"
                      onClick={() => navigate("strategy")}
                    >
                      查看战略建议
                      <I name="arrow" size={14} />
                    </button>
                  </section>
                  <section className="panel side-section">
                    <div className="coming-title">
                      <h3>企业信息自动补全</h3>
                      <Badge>规划中</Badge>
                    </div>
                    <p>
                      企业官网信息提取与业务画像更新，将在数据渠道接通后开放。
                    </p>
                  </section>
                </aside>
              </div>
            </>
          )}
          {view === "strategy" && (
            <>
              <section className="strategy-banner">
                <div className="strategy-banner-mark">
                  <I name="spark" size={31} />
                </div>
                <div>
                  <Badge tone="blue">
                    {user ? "AI 战略工作台" : "演示账号 · 战略工作台"}
                  </Badge>
                  <h2>把全球风向，转化为你的行动清单。</h2>
                  <p>
                    {profile.name
                      ? `为 ${profile.name} 评估区域准入、数据合规与模型部署策略。`
                      : "先建立企业画像，或使用演示企业体验分析流程。"}
                  </p>
                </div>
                <button
                  className="btn primary"
                  disabled={busy}
                  onClick={generateStrategy}
                >
                  <I
                    name={busy ? "refresh" : "spark"}
                    size={16}
                    className={busy ? "spinning" : ""}
                  />
                  {busy
                    ? "正在分析企业策略…"
                    : strategy
                      ? "重新生成建议"
                      : user
                        ? "生成 AI 战略建议"
                        : "生成演示战略分析"}
                </button>
              </section>
              <div className="strategy-business-selector panel">
                <div>
                  <I name="models" size={19} />
                  <div>
                    <strong>本次分析对象</strong>
                    <p>
                      按业务选择进行分析，建议将结合业务市场、数据类型与模型依赖。
                    </p>
                  </div>
                </div>
                <select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  aria-label="战略分析业务"
                >
                  <option value="all">全部业务（{businesses.length}项）</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <button
                  className="text-button"
                  onClick={() => navigate("businesses")}
                >
                  维护业务
                  <I name="arrow" size={13} />
                </button>
              </div>
              <div className="strategy-context">
                <button onClick={() => navigate("company")}>
                  <I name="building" size={16} />
                  <span>{profile.name || "尚未建立企业画像"}</span>
                  <I name="chevron" size={12} />
                </button>
                <span>{profile.industry}</span>
                <span>{profile.markets.join(" / ") || "业务区域待填写"}</span>
                <span>{profile.deployment}</span>
              </div>
              {restoredReport && (
                <div className="inline-message">
                  <I name="clock" size={15} />
                  已恢复
                  {user ? "最近一次云端历史报告" : "当前浏览器保存的演示报告"}（
                  {strategy?.generatedAt
                    ? new Date(strategy.generatedAt).toLocaleString("zh-CN")
                    : "日期见原报告"}
                  ）。请确认企业档案是否变化，可随时重新生成。
                  <button
                    className="text-button"
                    onClick={() => setRestoredReport(false)}
                  >
                    收起
                  </button>
                </div>
              )}
              {strategyError && (
                <div className="inline-message error">
                  <I name="info" size={16} />
                  {strategyError}
                </div>
              )}
              {busy && (
                <div className="analysis-loading panel">
                  <div className="analysis-orbit">
                    <I name="spark" size={27} />
                  </div>
                  <h3>正在连接你的业务与全球信号</h3>
                  <p>分析区域、模型、数据与部署条件，通常需要片刻时间。</p>
                  <div className="loading-track">
                    <span />
                  </div>
                </div>
              )}
              {strategy && !busy && (
                <section className="panel generated-strategy">
                  <div className="section-top">
                    <h2>
                      <I name="spark" size={18} />
                      企业 AI 战略简报
                    </h2>
                    <Badge
                      tone={
                        strategy.mode?.includes("演示") ||
                        strategy.mode === "rules"
                          ? "amber"
                          : "green"
                      }
                    >
                      {strategy.mode === "ai"
                        ? "AI 辅助分析"
                        : strategy.mode === "rules"
                          ? "规则辅助分析"
                          : strategy.mode || "AI 辅助分析"}
                    </Badge>
                  </div>
                  <div className="strategy-summary">
                    <h3>
                      建议概览
                      {strategy.profileSnapshot?.name
                        ? ` · ${strategy.profileSnapshot.name}`
                        : ""}
                    </h3>
                    <p>{strategy.summary}</p>
                    {strategy.notice && (
                      <p className="strategy-analysis-note">
                        {strategy.notice}
                      </p>
                    )}
                  </div>
                  {strategy.businessInsights &&
                    strategy.businessInsights.length > 0 && (
                      <div className="business-insights">
                        <h3>
                          <I name="models" size={17} />
                          业务与政策关联分析
                        </h3>
                        {strategy.businessInsights.map((item) => (
                          <article
                            className="business-insight-card"
                            key={item.businessId}
                          >
                            <div className="business-insight-heading">
                              <I name="building" size={18} />
                              <h4>{item.businessName}</h4>
                              <Badge tone="blue">业务专属</Badge>
                            </div>
                            <div className="business-insight-columns">
                              <div>
                                <span>风险暴露</span>
                                <p>{item.exposure}</p>
                              </div>
                              <div>
                                <span>潜在机会</span>
                                <p>{item.opportunity}</p>
                              </div>
                            </div>
                            <div className="business-action-list">
                              {item.actions.map((action, index) => (
                                <p key={index}>
                                  <I name="check" size={13} />
                                  {action}
                                </p>
                              ))}
                            </div>
                            <div className="business-policy-evidence">
                              {item.sourceUrls.map((url, index) => (
                                <SourceLink key={index} href={url}>
                                  {policyFeed.find(
                                    (signal) => signal.sourceUrl === url,
                                  )?.title || `关联政策来源 ${index + 1}`}
                                </SourceLink>
                              ))}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  <div className="generated-grid">
                    <div>
                      <h3>建议行动</h3>
                      {(strategy.recommendations || []).map((r, i) => (
                        <div key={i} className="recommendation-line">
                          <span>{i + 1}</span>
                          <p>{textOf(r)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="risk-column">
                      <h3>
                        <I name="shield" size={16} />
                        需进一步核查
                      </h3>
                      {(strategy.risks || []).map((r, i) => (
                        <p key={i}>{textOf(r)}</p>
                      ))}
                      {strategy.models?.length ? (
                        <>
                          <h3>模型方向</h3>
                          {strategy.models.map((m, i) => (
                            <p key={i}>{textOf(m)}</p>
                          ))}
                        </>
                      ) : null}
                    </div>
                  </div>
                  {strategy.sources && strategy.sources.length > 0 && (
                    <div className="strategy-sources">
                      <strong>参考来源</strong>
                      {strategy.sources.map((s, i) => {
                        const item = s as {
                          url?: string;
                          title?: string;
                          date?: string;
                          sourceType?: string;
                        };
                        return item?.url ? (
                          <SourceLink key={i} href={item.url}>
                            {item.title || item.url}
                            {item.date ? ` · ${item.date.slice(0, 10)}` : ""}
                            {item.sourceType === "social_signal"
                              ? " · 社交信号（待核实）"
                              : item.sourceType === "official_snapshot"
                                ? " · 官方资料快照"
                                : ""}
                          </SourceLink>
                        ) : (
                          <span key={i}>{textOf(s)}</span>
                        );
                      })}
                    </div>
                  )}
                  <div className="strategy-report-footer">
                    <span>
                      <I name="clock" size={13} />
                      {strategy.generatedAt
                        ? new Date(strategy.generatedAt).toLocaleString("zh-CN")
                        : "刚刚生成"}
                    </span>
                    <button className="text-button" onClick={exportReport}>
                      <I name="download" size={14} />
                      导出简报
                    </button>
                  </div>
                </section>
              )}
              <div className="strategy-suggestion-grid">
                {suggestionGroups.map((s) => (
                  <article className="panel strategy-suggestion" key={s.title}>
                    <div className={`stat-symbol ${s.tone}`}>
                      <I name={s.icon} size={21} />
                    </div>
                    <Badge tone={s.tone}>{s.label}</Badge>
                    <h3>{s.title}</h3>
                    <p>{s.detail}</p>
                  </article>
                ))}
              </div>
              <div className="context-note">
                <I name="info" size={15} />
                <span>
                  建议用于企业战略研究与技术选型辅助，不构成法律意见。实际应用应核对当前法规、供应商条款及企业自身义务。
                </span>
              </div>
            </>
          )}
          {view === "sources" && (
            <>
              <section className="panel source-intro">
                <span className="large-icon blue">
                  <I name="source" size={25} />
                </span>
                <div>
                  <h2>透明的数据，可信的判断。</h2>
                  <p>{DATA_NOTE}</p>
                  <div className="source-overview">
                    <Badge tone="green">官方来源优先</Badge>
                    <Badge tone="blue">保留原始链接</Badge>
                    <Badge tone="amber">历史快照单独标注</Badge>
                  </div>
                </div>
              </section>
              <div className="organization-grid">
                {organizations.map((o) => (
                  <section className="panel organization-card" key={o.id}>
                    <div className="organization-heading">
                      <span
                        className={`organization-symbol ${o.id === "GPAI" ? "blue" : "green"}`}
                      >
                        <I name="globe" size={24} />
                      </span>
                      <div>
                        <h2>{o.name}</h2>
                        <span>{o.fullName}</span>
                      </div>
                    </div>
                    <p>{o.description}</p>
                    <div className="organization-count">
                      <strong>{o.memberCount}</strong>
                      <span>{o.memberCountLabel}</span>
                    </div>
                    <div className="organization-note">
                      <I name="info" size={15} />
                      <p>{o.note}</p>
                    </div>
                    <SourceLink href={o.sourceUrl}>
                      组织与成员官方信息
                    </SourceLink>
                    <small>资料日期：{o.updatedAt}</small>
                  </section>
                ))}
              </div>
              <section className="panel">
                <div className="section-top">
                  <div>
                    <h2>证据来源清单</h2>
                    <p>
                      与主站共用公开信息源，每 60
                      秒读取最新已收录资料。政策事实以官方发布为准，社交线索保持待核实。
                    </p>
                  </div>
                  <Badge>{policyFeed.length} 条收录资料</Badge>
                </div>
                <div className="source-table">
                  <table>
                    <thead>
                      <tr>
                        <th>资料</th>
                        <th>来源机构</th>
                        <th>日期</th>
                        <th>核查状态</th>
                        <th>原文</th>
                      </tr>
                    </thead>
                    <tbody>
                      {policyFeed.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <button onClick={() => setDetail(s)}>
                              {s.title}
                            </button>
                          </td>
                          <td>{s.source}</td>
                          <td>{s.date}</td>
                          <td>
                            <Badge
                              tone={s.status === "已核实" ? "green" : "amber"}
                            >
                              {s.status}
                            </Badge>
                          </td>
                          <td>
                            <SourceLink href={s.sourceUrl}>查看</SourceLink>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="panel roadmap-panel">
                <div className="section-top">
                  <h2>能力与建设进度</h2>
                  <Badge>产品原型</Badge>
                </div>
                <div className="roadmap-grid">
                  {[
                    {
                      title: "全球治理知识地图",
                      text: "组织、国家、AI 企业与政策来源关联",
                      done: true,
                    },
                    {
                      title: "企业画像与账户",
                      text: "登录、企业信息维护与云端保存",
                      done: true,
                    },
                    {
                      title: "AI 个性化策略",
                      text: "根据企业业务生成可核查的行动方向",
                      done: true,
                    },
                    {
                      title: "实时 X 情报检索",
                      text: "通过 Grok 查询新信号并保留来源",
                      done: true,
                    },
                    {
                      title: "企业官网信息补全",
                      text: "企业工商信息与业务线索自动归并",
                      done: false,
                    },
                    {
                      title: "定时监测与策略更新",
                      text: "持续追踪企业关注国家与政策变化",
                      done: false,
                    },
                  ].map((r) => (
                    <div key={r.title}>
                      <span
                        className={r.done ? "roadmap-done" : "roadmap-planned"}
                      >
                        <I name={r.done ? "check" : "clock"} size={16} />
                      </span>
                      <div>
                        <strong>{r.title}</strong>
                        <p>{r.text}</p>
                      </div>
                      <Badge tone={r.done ? "green" : "neutral"}>
                        {r.done ? "已接入" : "规划中"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
          <footer className="app-footer">
            <span>
              windsight 观风 <span>·</span> 连接全球变化与企业决策
            </span>
            <span>
              <i className="status-dot" />
              比赛产品原型 <span>·</span> 数据有据，决策有界
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <I name="check" size={17} />
          {toast}
          <button aria-label="关闭通知" onClick={() => setToast("")}>
            <I name="close" size={14} />
          </button>
        </div>
      )}
      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="signal-dialog-title"
            className="detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="关闭情报详情"
              onClick={() => setDetail(null)}
            >
              <I name="close" size={20} />
            </button>
            <div className="detail-tags">
              <Badge tone="blue">{detail.category}</Badge>
              <Badge tone={detail.impact === "高" ? "amber" : "neutral"}>
                {detail.impact}重要性
              </Badge>
              <Badge tone={detail.status === "已核实" ? "green" : "amber"}>
                {detail.status}
              </Badge>
            </div>
            <h2 id="signal-dialog-title">{detail.title}</h2>
            <div className="detail-meta">
              {detail.countryName}
              <span>·</span>
              {detail.date}
              <span>·</span>
              {detail.source}
            </div>
            <div className="detail-section">
              <h3>发生了什么</h3>
              <p>{detail.summary}</p>
            </div>
            <div className="detail-implication">
              <h3>
                <I name="building" size={17} />
                对企业意味着什么
              </h3>
              <p>{detail.implication}</p>
            </div>
            <div className="detail-keywords">
              {detail.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
            <div className="detail-footer">
              {detail.sourceUrl ? (
                <SourceLink href={detail.sourceUrl}>查看原始来源</SourceLink>
              ) : (
                <span className="source-link">未提供可核查来源</span>
              )}
              <button
                className="btn secondary"
                onClick={() => bookmark(detail.id)}
              >
                <I name="eye" size={15} />
                {bookmarks.includes(detail.id) ? "已收藏" : "收藏情报"}
              </button>
            </div>
          </section>
        </div>
      )}
      {authOpen && (
        <div className="modal-backdrop" onClick={() => setAuthOpen(false)}>
          <section
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="关闭登录"
              onClick={() => setAuthOpen(false)}
            >
              <I name="close" size={19} />
            </button>
            <WindLogo />
            <h2 id="auth-title">
              {authAction === "signIn"
                ? "欢迎回到观风"
                : "创建你的企业工作空间"}
            </h2>
            <p>保存企业画像，获得与你的业务相关的 AI 战略建议。</p>
            <div className="auth-tabs">
              <button
                className={authAction === "signIn" ? "active" : ""}
                onClick={() => {
                  setAuthAction("signIn");
                  setAuthMessage("");
                }}
              >
                登录
              </button>
              <button
                className={authAction === "signUp" ? "active" : ""}
                onClick={() => {
                  setAuthAction("signUp");
                  setAuthMessage("");
                }}
              >
                注册
              </button>
            </div>
            <form onSubmit={authenticate}>
              <label>
                电子邮箱
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@company.com"
                />
              </label>
              <label>
                密码
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={
                    authAction === "signIn"
                      ? "current-password"
                      : "new-password"
                  }
                  placeholder="至少 8 位字符"
                />
              </label>
              {authMessage && (
                <div className="auth-message" role="status">
                  {authMessage}
                </div>
              )}
              <button className="btn primary full" disabled={authBusy}>
                {authBusy
                  ? "正在处理…"
                  : authAction === "signIn"
                    ? "登录工作空间"
                    : "创建账户"}
              </button>
            </form>
            <small>
              账户由 Supabase 安全管理。注册后可能需要通过邮件确认。
            </small>
          </section>
        </div>
      )}
    </div>
  );
}
