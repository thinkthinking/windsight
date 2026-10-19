"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  countries,
  signals,
  aiModels,
  organizations,
  DATA_UPDATED_AT,
  DATA_NOTE,
  type Country,
  type Signal,
} from "@/lib/data";
import { I, WindLogo, type IconName } from "./insight-icons";
import { InsightMap } from "./insight-map";

type View =
  | "overview"
  | "map"
  | "radar"
  | "models"
  | "company"
  | "strategy"
  | "sources";
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
};
const navigation: {
  id: View;
  label: string;
  icon: IconName;
  description: string;
}[] = [
  {
    id: "overview",
    label: "全球态势",
    icon: "overview",
    description: "把变化，看成下一步",
  },
  {
    id: "map",
    label: "治理版图",
    icon: "globe",
    description: "连接组织、国家与 AI 生态",
  },
  {
    id: "radar",
    label: "情报雷达",
    icon: "radar",
    description: "政策与技术信号，值得你关注的变化",
  },
  {
    id: "models",
    label: "模型与公司",
    icon: "models",
    description: "为业务场景选择合适的 AI 能力",
  },
  {
    id: "company",
    label: "企业画像",
    icon: "building",
    description: "从你的业务出发，理解全球化风险",
  },
  {
    id: "strategy",
    label: "战略建议",
    icon: "spark",
    description: "让全球变化，成为企业的决策依据",
  },
  {
    id: "sources",
    label: "数据与来源",
    icon: "source",
    description: "每一个判断，都能回到原始证据",
  },
];
const exampleProfile: Profile = {
  name: "Meridian AI（虚拟企业）",
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
function normalizeSignals(items: unknown[], candidate = false): Signal[] {
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
        date: String(item.publishedAt || new Date().toISOString()).slice(0, 10),
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
        source: String(item.sourceName || "X / 联网检索"),
        sourceUrl: String(item.sourceUrl || ""),
        tags: [
          String(item.organization || "全球 AI"),
          candidate ? "未核实候选" : "社交媒体信号",
        ],
        status: "待核实",
        implication:
          "此信息来自实时检索，尚未完成官方交叉核验。请查看原始来源，确认发布日期、适用区域和政策文本后再用于企业决策。",
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
  const [view, setView] = useState<View>("overview");
  const [selected, setSelected] = useState<Country>(
    () => countries.find((c) => c.code === "CN") || countries[0],
  );
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
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [strategy, setStrategy] = useState<StrategyResult | null>(null);
  const [strategyError, setStrategyError] = useState("");
  const [liveSignals, setLiveSignals] = useState<Signal[]>([]);
  const [radarMessage, setRadarMessage] = useState("");
  const [modelFilter, setModelFilter] = useState("全部模型");
  const [compared, setCompared] = useState<string[]>([]);
  const [mobileNav, setMobileNav] = useState(false);
  function navigate(next: View) {
    setView(next);
    setQuery("");
    setMobileNav(false);
    window.history.replaceState(null, "", `#${next}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
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
    });
    request("/api/session")
      .then((r) => {
        setUser(r.user || null);
        if (r.user) {
          request("/api/company")
            .then((c) => {
              if (c.profile) {
                setProfile({ ...emptyProfile, ...c.profile });
                setIsDemo(false);
              }
            })
            .catch(() => {});
          request("/api/intelligence")
            .then((r) => {
              if (r.search) {
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
    if (toast) {
      const id = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(id);
    }
  }, [toast]);
  const active = navigation.find((n) => n.id === view)!;
  const allSignals = [...liveSignals, ...signals];
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
  const filteredModels = aiModels.filter(
    (m) =>
      (modelFilter === "全部模型" || m.openness === modelFilter) &&
      (!query ||
        [m.name, m.company, m.country, ...m.strengths]
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
      setAuthOpen(true);
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
    if (!user) {
      if (!profile.name) loadDemo();
      setStrategy({
        mode: "规则演示",
        summary:
          "根据企业业务区域、数据敏感度和部署偏好，建议采用分区域接入、数据分类与多模型备选的组合策略。以下为规则演示，登录后可生成个性化 AI 分析。",
        recommendations: suggestionGroups.map((s) => ({
          title: s.title,
          description: s.detail,
        })),
        risks: [
          "组织成员身份不能直接推断模型可用性。",
          "实际准入、数据出境和许可义务仍需结合业务与现行规则复核。",
        ],
        generatedAt: new Date().toISOString(),
      });
      return;
    }
    setBusy(true);
    try {
      const result = await request("/api/strategy", { profile });
      setStrategy(result);
    } catch (e) {
      setStrategyError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function refreshIntelligence() {
    if (!user) {
      setAuthOpen(true);
      setAuthMessage("登录后可使用实时 X 与网络情报检索。");
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
        setUser(r.user);
        setAuthOpen(false);
        setToast("登录成功");
        const c = await request("/api/company");
        if (c.profile) setProfile({ ...emptyProfile, ...c.profile });
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
      setUser(null);
      setProfile(exampleProfile);
      setIsDemo(true);
      setStrategy(null);
      setToast("已退出登录");
    } catch (e) {
      setToast((e as Error).message);
    }
  }
  function exportReport() {
    const body = [
      "观风 windsight · 企业 AI 战略简报",
      `企业：${profile.name || "尚未建立档案"}`,
      `业务区域：${profile.markets.join("、")}`,
      "",
      strategy?.summary || "请先生成战略建议",
      ...(strategy?.recommendations || []).map(textOf),
      "",
      "内容为辅助研究，具体实施需核实原始来源和适用法律。",
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
  function countryCard(expanded = false) {
    return (
      <aside className="country-panel panel">
        <div className="panel-heading">
          <span>国家观察</span>
          <Badge
            tone={
              selected.bloc === "GPAI"
                ? "blue"
                : selected.bloc === "WAICO"
                  ? "green"
                  : "purple"
            }
          >
            {selected.bloc}
          </Badge>
        </div>
        <div className="country-name">
          <span className="country-flag">{selected.flag}</span>
          <div>
            <h2>{selected.name}</h2>
            <p>{selected.nameEn}</p>
          </div>
          <I name="globe" size={30} />
        </div>
        <p className="country-summary">{selected.summary}</p>
        <div className="country-facts">
          <div>
            <span>所属区域</span>
            <strong>{selected.region}</strong>
          </div>
          <div>
            <span>治理协作</span>
            <strong>{selected.organizations.join(" / ") || "持续观察"}</strong>
          </div>
          <div>
            <span>证据状态</span>
            <strong>{selected.evidenceStatus}</strong>
          </div>
        </div>
        <div className="country-policy">
          <span>
            <I name="shield" size={14} />
            政策关注
          </span>
          <p>{selected.policy}</p>
        </div>
        {selected.companies.length > 0 && (
          <div className="country-companies">
            <span>代表 AI 企业</span>
            <div>
              {selected.companies.map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
          </div>
        )}
        <div className="country-bottom">
          {selected.sources[0] && (
            <SourceLink href={selected.sources[0].url}>查看官方来源</SourceLink>
          )}
          {!expanded && (
            <button className="text-button" onClick={() => navigate("map")}>
              探索版图
              <I name="arrow" size={14} />
            </button>
          )}
        </div>
      </aside>
    );
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        跳转到主要内容
      </a>
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <button
          className="brand"
          onClick={() => navigate("overview")}
          aria-label="观风首页"
        >
          <WindLogo />
          <div>
            <strong>
              观风 <span>windsight</span>
            </strong>
            <small>全球企业 AI 战略情报</small>
          </div>
        </button>
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
            <small>{user ? "我的企业空间" : "访客体验空间"}</small>
          </span>
          <I name="chevron" size={14} />
        </button>
        <nav aria-label="主导航">
          <p className="nav-group-label">全球洞察</p>
          {navigation.slice(0, 4).map((item) => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => navigate(item.id)}
            >
              <I name={item.icon} />
              {item.label}
              {item.id === "radar" && (
                <span className="nav-count">{signals.length}</span>
              )}
            </button>
          ))}
          <p className="nav-group-label second">企业决策</p>
          {navigation.slice(4, 6).map((item) => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => navigate(item.id)}
            >
              <I name={item.icon} />
              {item.label}
              {item.id === "strategy" && <span className="ai-tag">AI</span>}
            </button>
          ))}
          <p className="nav-group-label second">工作空间</p>
          <button
            className={`nav-item ${view === "sources" ? "active" : ""}`}
            onClick={() => navigate("sources")}
          >
            <I name="source" />
            数据与来源
          </button>
          <button
            className="nav-item"
            onClick={() => {
              navigate("radar");
              setOnlySaved(true);
            }}
          >
            <I name="eye" />
            我的关注<span className="nav-count">{bookmarks.length}</span>
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
            onClick={() => (user ? navigate("company") : setAuthOpen(true))}
          >
            <span className="avatar">
              {user?.email?.[0]?.toUpperCase() || <I name="user" size={16} />}
            </span>
            <div>
              <strong>{user ? user.email?.split("@")[0] : "访客模式"}</strong>
              <small>{user ? "企业工作空间" : "登录以保存企业策略"}</small>
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
            <span>工作空间</span>
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
                  if (view !== "models" && view !== "radar") setView("radar");
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
              <button
                className="login-button"
                onClick={() => setAuthOpen(true)}
              >
                <I name="user" size={15} />
                登录 / 注册
              </button>
            )}
          </div>
        </header>
        <main id="main-content" className="main-content">
          <div className="page-heading">
            <div>
              <div className="page-kicker">
                <span className="status-dot" />
                全球 AI 治理与产业观察
              </div>
              <h1>
                {view === "overview" ? "全球风向，尽在掌握。" : active.label}
              </h1>
              <p>
                {view === "overview"
                  ? "连接全球政策与技术信号，为企业的下一步提供依据。"
                  : active.description}
              </p>
            </div>
            <div className="heading-actions">
              {view === "overview" || view === "map" ? (
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
                  {busy ? "正在检索…" : "实时检索"}
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
              <div className="stats-grid">
                {organizations.map((o, i) => (
                  <button
                    key={o.id}
                    className="stat-card"
                    onClick={() => {
                      setBloc(o.id);
                      navigate("map");
                    }}
                  >
                    <div className={`stat-symbol ${i ? "green" : "blue"}`}>
                      <I name="globe" size={21} />
                    </div>
                    <div>
                      <span>
                        {o.id}{" "}
                        {i
                          ? "世界人工智能合作组织"
                          : "全球人工智能合作伙伴关系"}
                      </span>
                      <strong>
                        {o.memberCount}
                        <small>
                          {o.id === "GPAI" ? "国 + 欧盟" : "个成员国"}
                        </small>
                      </strong>
                      <p>
                        <i className={i ? "waico-dot" : "gpai-dot"} />
                        {o.id === "GPAI"
                          ? "以 OECD 为基础的多边协作"
                          : "面向全球的 AI 国际合作"}
                      </p>
                    </div>
                    <I name="chevron" size={15} />
                  </button>
                ))}
                <button className="stat-card" onClick={() => navigate("radar")}>
                  <div className="stat-symbol amber">
                    <I name="radar" size={21} />
                  </div>
                  <div>
                    <span>已收录关键情报</span>
                    <strong>
                      {signals.length}
                      <small>条</small>
                    </strong>
                    <p>
                      <i className="amber-dot" />
                      {signals.filter((s) => s.impact === "高").length}{" "}
                      条重点关注信号
                    </p>
                  </div>
                  <I name="chevron" size={15} />
                </button>
                <button
                  className="stat-card"
                  onClick={() => navigate("models")}
                >
                  <div className="stat-symbol purple">
                    <I name="models" size={21} />
                  </div>
                  <div>
                    <span>代表模型与供应商</span>
                    <strong>
                      {aiModels.length}
                      <small>个模型</small>
                    </strong>
                    <p>
                      <i className="purple-dot" />
                      覆盖闭源与开放权重
                    </p>
                  </div>
                  <I name="chevron" size={15} />
                </button>
              </div>
              <div className="overview-map-grid">
                <InsightMap
                  countries={countries}
                  selected={selected}
                  onSelect={setSelected}
                  bloc={bloc}
                  onBloc={setBloc}
                />
                {countryCard()}
              </div>
              <div className="overview-lower-grid">
                <section className="panel intelligence-panel">
                  <div className="section-top">
                    <div>
                      <h2>
                        <I name="radar" size={18} />
                        值得关注的变化
                        <span className="quiet-tag">精选情报</span>
                      </h2>
                      <p>从政策到技术，追踪影响企业 AI 决策的关键信号</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate("radar")}
                    >
                      全部情报
                      <I name="arrow" size={14} />
                    </button>
                  </div>
                  {signalList(signals.slice(0, 3), true)}
                </section>
                <section className="strategy-prompt panel">
                  <div className="strategy-prompt-icon">
                    <I name="spark" size={23} />
                  </div>
                  <Badge tone="blue">企业专属洞察</Badge>
                  <h2>
                    全球的变化，
                    <br />
                    与你的企业有什么关系？
                  </h2>
                  <p>
                    建立企业画像，让政策、模型和市场动向转化为适合你的 AI 策略。
                  </p>
                  <div className="mini-steps">
                    <span>
                      <I name="check" size={13} />
                      业务与市场
                    </span>
                    <span>
                      <I name="check" size={13} />
                      数据与合规
                    </span>
                    <span>
                      <I name="check" size={13} />
                      模型与部署
                    </span>
                  </div>
                  <button
                    className="btn primary"
                    onClick={() => navigate("company")}
                  >
                    建立企业画像
                    <I name="arrow" size={15} />
                  </button>
                </section>
              </div>
              <div className="context-note">
                <I name="info" size={14} />
                <span>
                  GPAI 与 WAICO
                  是治理协作视角，成员可能重叠。组织关系不直接等同于模型可用性、法律义务或地缘阵营。
                </span>
                <button onClick={() => navigate("sources")}>
                  查看数据说明
                </button>
              </div>
            </>
          )}
          {view === "map" && (
            <>
              <div className="map-view-grid">
                <InsightMap
                  countries={countries}
                  selected={selected}
                  onSelect={setSelected}
                  bloc={bloc}
                  onBloc={setBloc}
                />
                {countryCard(true)}
              </div>
              <section className="panel">
                <div className="section-top">
                  <div>
                    <h2>国家与地区观察清单</h2>
                    <p>
                      已建档 {countries.length} 个国家 /
                      地区；仅展示可核查与历史快照资料
                    </p>
                  </div>
                  <span className="quiet-tag">名单持续核验</span>
                </div>
                <div className="country-directory">
                  {countries
                    .filter(
                      (c) => bloc === "全部" || c.organizations.includes(bloc),
                    )
                    .map((c) => (
                      <button
                        key={c.code}
                        className={`country-tile ${selected.code === c.code ? "active" : ""}`}
                        onClick={() => {
                          setSelected(c);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <span>{c.flag}</span>
                        <div>
                          <strong>{c.name}</strong>
                          <small>{c.region}</small>
                        </div>
                        <Badge
                          tone={
                            c.bloc === "GPAI"
                              ? "blue"
                              : c.bloc === "WAICO"
                                ? "green"
                                : "purple"
                          }
                        >
                          {c.bloc}
                        </Badge>
                      </button>
                    ))}
                </div>
              </section>
            </>
          )}
          {view === "radar" && (
            <>
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
                    {busy ? "检索中…" : "检索最新信号"}
                  </button>
                </div>
                <p>
                  <I name="info" size={13} />
                  精选资料可直接浏览；实时检索通过 ZenMux Grok 联网与 X
                  搜索，结果保留原始来源。
                </p>
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
          {view === "models" && (
            <>
              <div className="models-top">
                <div className="filter-tabs">
                  {["全部模型", "闭源", "开放权重"].map((f) => (
                    <button
                      key={f}
                      className={modelFilter === f ? "active" : ""}
                      onClick={() => setModelFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <label className="model-search">
                  <I name="search" size={15} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索模型、公司、能力…"
                    aria-label="搜索模型"
                  />
                </label>
              </div>
              <div className="model-grid">
                {filteredModels.map((m, i) => (
                  <article key={m.id} className="model-card panel">
                    <div className="model-card-top">
                      <span className={`model-logo model-logo-${i % 5}`}>
                        {m.company.slice(0, 1)}
                      </span>
                      <div>
                        <h2>{m.name}</h2>
                        <span>
                          {m.company} <span className="meta-dot">·</span>{" "}
                          {m.country}
                        </span>
                      </div>
                      <Badge
                        tone={m.openness === "开放权重" ? "green" : "blue"}
                      >
                        {m.openness}
                      </Badge>
                    </div>
                    <div className="model-strengths">
                      {m.strengths.map((s) => (
                        <Badge key={s}>{s}</Badge>
                      ))}
                    </div>
                    <dl className="model-facts">
                      <div>
                        <dt>部署方式</dt>
                        <dd>{m.deployment}</dd>
                      </div>
                      <div>
                        <dt>授权与使用</dt>
                        <dd>{m.license}</dd>
                      </div>
                      <div>
                        <dt>区域范围</dt>
                        <dd>{m.regions}</dd>
                      </div>
                    </dl>
                    <div className="model-caution">
                      <I name="info" size={14} />
                      <p>{m.considerations[0]}</p>
                    </div>
                    <div className="model-card-footer">
                      <SourceLink href={m.sourceUrl}>供应商来源</SourceLink>
                      <label className="compare-check">
                        <input
                          type="checkbox"
                          checked={compared.includes(m.id)}
                          onChange={() =>
                            setCompared((p) =>
                              p.includes(m.id)
                                ? p.filter((id) => id !== m.id)
                                : p.length < 3
                                  ? [...p, m.id]
                                  : p,
                            )
                          }
                        />
                        加入对比
                      </label>
                    </div>
                  </article>
                ))}
              </div>
              {filteredModels.length === 0 && (
                <div className="empty-state panel">
                  <I name="search" size={30} />
                  <h3>暂无匹配模型</h3>
                  <p>试试模型名称或供应商名称。</p>
                </div>
              )}
              {compared.length > 0 && (
                <section className="panel compare-panel">
                  <div className="section-top">
                    <h2>
                      模型对比 <small>{compared.length} / 3</small>
                    </h2>
                    <button
                      className="text-button"
                      onClick={() => setCompared([])}
                    >
                      清空对比
                      <I name="close" size={14} />
                    </button>
                  </div>
                  <div className="comparison-table">
                    <table>
                      <thead>
                        <tr>
                          <th>比较维度</th>
                          {aiModels
                            .filter((m) => compared.includes(m.id))
                            .map((m) => (
                              <th key={m.id}>{m.name}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(
                          [
                            ["供应商", "company"],
                            ["开放程度", "openness"],
                            ["部署方式", "deployment"],
                            ["许可条件", "license"],
                            ["区域范围", "regions"],
                          ] as const
                        ).map(([label, key]) => (
                          <tr key={key}>
                            <th>{label}</th>
                            {aiModels
                              .filter((m) => compared.includes(m.id))
                              .map((m) => (
                                <td key={m.id}>{m[key]}</td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
              <div className="context-note">
                <I name="info" size={15} />
                <span>
                  开放权重不等于无条件开源。模型目录展示代表性产品，正式选型前请复核最新许可、数据条款与服务地区。
                </span>
              </div>
            </>
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
                          : "登录后可保存至企业工作空间"}
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
                            : "登录并保存画像"}
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
                  <Badge tone="blue">AI 战略工作台</Badge>
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
                      : "生成 AI 战略建议"}
                </button>
              </section>
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
                    <h3>建议概览</h3>
                    <p>{strategy.summary}</p>
                  </div>
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
                        const item = s as { url?: string; title?: string };
                        return item?.url ? (
                          <SourceLink key={i} href={item.url}>
                            {item.title || item.url}
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
                    <p>政策事实以官方发布为准；技术产品以供应商文档为准。</p>
                  </div>
                  <Badge>{signals.length} 条收录资料</Badge>
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
                      {signals.map((s) => (
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
                      title: "实时 X 与网络检索",
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
