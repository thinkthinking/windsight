"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  CircleCheck,
  Download,
  Info,
  Search,
  ShieldAlert,
} from "lucide-react";
import {
  countries,
  signals as seeds,
  type Signal,
  type Country,
} from "@/lib/data";
import latestEvents from "@/docs/latest-ai-events.json";
import { businessRisks, type BusinessRisk } from "@/lib/business-risks";
import { AtlasMap, type MapFocus, type MapTone } from "./atlas-map";
import {
  CountryDetail,
  EventDetail,
  EventList,
  Kpi,
  Segmented,
  SheetBar,
  SourceLinks,
  TimeStrip,
  dateParts,
  eventOrganizations,
  isTyping,
  monthLabel,
  toneOfOrgs,
} from "./atlas-ui";
import { I, WindLogo } from "./insight-icons";
import { BrandLogo } from "./brand-logo";
import { ViewSwitch } from "./view-switch";
import "./public-tracker.css";
import "./enterprise-atlas.css";

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
type Enterprise = {
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
const PROFILE_KEY = "windsight-demo-profile-v1";
const marketOptions = [
  "中国",
  "俄罗斯",
  "新加坡",
  "欧盟",
  "美国",
  "东南亚",
  "日本",
  "中东",
];
const marketCodes: Record<string, string[]> = {
  中国: ["CN"],
  俄罗斯: ["RU"],
  新加坡: ["SG"],
  欧盟: ["EU", "DE", "FR", "IT", "ES"],
  美国: ["US"],
  东南亚: ["SG", "ID", "MY"],
  日本: ["JP"],
  中东: ["SA", "AE"],
};
const initialFeed = Array.from(
  new Map(
    [...seeds, ...(latestEvents as Signal[])].map((event) => [event.id, event]),
  ).values(),
).sort((a, b) => b.date.localeCompare(a.date));
const defaultEnterprise: Enterprise = {
  name: "Meridian AI",
  website: "",
  industry: "AI 聚合平台",
  headquarters: "新加坡",
  markets: ["中国", "俄罗斯", "新加坡", "欧盟", "美国"],
  useCases: ["模型 API 路由", "企业私有 AI 网关"],
  dataSensitivity: "个人信息",
  deployment: "混合部署",
  description:
    "中国团队在新加坡注册的虚拟 AI 聚合平台，为全球开发者提供多模型 API 接入、智能路由与区域化私有网关。",
  businesses: [
    {
      id: "model-api",
      name: "全球模型 API 聚合",
      description:
        "面向全球开发者提供模型 API 路由与统一计费，按客户、地区与供应商服务资格匹配模型池。",
      markets: ["中国", "俄罗斯", "美国", "欧盟", "新加坡"],
      useCases: ["模型 API 路由", "跨境 AI 服务"],
      dataTypes: ["个人信息", "API 密钥", "日志与调用记录"],
      models: ["GPT", "Claude", "Qwen", "DeepSeek"],
      stage: "试点中",
    },
    {
      id: "private-gateway",
      name: "企业私有 AI 网关",
      description: "为企业客户提供区域内网关、开放权重私有部署与请求审计。",
      markets: ["中国", "新加坡", "欧盟"],
      useCases: ["私有化部署", "知识检索"],
      dataTypes: ["商业秘密", "个人信息"],
      models: ["Qwen", "DeepSeek"],
      stage: "规划中",
    },
  ],
};
function readDemo(): Enterprise {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    if (!saved || typeof saved.name !== "string")
      return structuredClone(defaultEnterprise);
    const merged = { ...defaultEnterprise, ...saved };
    if (!Array.isArray(merged.markets))
      merged.markets = defaultEnterprise.markets;
    if (!Array.isArray(merged.businesses))
      merged.businesses = defaultEnterprise.businesses;
    merged.businesses = merged.businesses
      .filter((b: Business) => b && typeof b.name === "string")
      .map((b: Business) => ({
        ...b,
        markets: Array.isArray(b.markets) ? b.markets : [],
        useCases: Array.isArray(b.useCases) ? b.useCases : [],
        dataTypes: Array.isArray(b.dataTypes) ? b.dataTypes : [],
        models: Array.isArray(b.models) ? b.models : [],
      }));
    if (merged.name.includes("Meridian") && !merged.markets.includes("俄罗斯"))
      merged.markets = [...merged.markets, "俄罗斯"];
    return merged;
  } catch {
    return structuredClone(defaultEnterprise);
  }
}
async function api(path: string, body?: unknown) {
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
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "暂时无法完成，请稍后重试");
  return data;
}

type View =
  | { kind: "list" }
  | { kind: "event"; id: string }
  | { kind: "country"; code: string }
  | { kind: "risk"; id: string };
type DetailView = Exclude<View, { kind: "list" }>;
type NavDir = "forward" | "back" | "next" | "prev";
type RailTab = "risks" | "events";

const ALL_MARKETS = "全部市场";
const ALL_BUSINESS = "all";
/** Map focus for a market (EU has no single country geometry). */
const marketFocus: Record<string, string> = { 欧盟: "DE", 东南亚: "SG", 中东: "SA" };

function providerName(name: string) {
  return /gpt|openai/i.test(name)
    ? "GPT"
    : /claude|anthropic/i.test(name)
      ? "Claude"
      : /qwen/i.test(name)
        ? "Qwen"
        : /deepseek/i.test(name)
          ? "DeepSeek"
          : /gemini/i.test(name)
            ? "Gemini"
            : /mistral/i.test(name)
              ? "Mistral"
              : name;
}

export function EnterpriseAtlas() {
  const [enterprise, setEnterprise] = useState<Enterprise>(defaultEnterprise);
  const [draft, setDraft] = useState<Enterprise>(defaultEnterprise);
  const [feed, setFeed] = useState<Signal[]>(initialFeed);
  const [settings, setSettings] = useState(false);
  const [activeBusiness, setActiveBusiness] = useState("model-api");
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [login, setLogin] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const [scope, setScope] = useState<string>(ALL_BUSINESS);
  const [activeMarket, setActiveMarket] = useState(ALL_MARKETS);
  const [month, setMonth] = useState<string | null>(null);
  const [tab, setTab] = useState<RailTab>("risks");
  const [stack, setStack] = useState<View[]>([{ kind: "list" }]);
  const [closing, setClosing] = useState<DetailView | null>(null);
  const [navDir, setNavDir] = useState<NavDir>("forward");
  const [focus, setFocus] = useState<MapFocus>(null);
  const [hotCode, setHotCode] = useState<string | null>(null);
  const focusSeq = useRef(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        const profile = readDemo();
        setEnterprise(profile);
        setDraft(profile);
      }
    });
    api("/api/session")
      .then((r) => {
        if (cancelled || !r.user) return;
        setUser(r.user);
        api("/api/company")
          .then((c) => {
            if (!cancelled && c.profile) {
              const profile = {
                ...defaultEnterprise,
                ...c.profile,
                businesses: Array.isArray(c.profile.businesses)
                  ? c.profile.businesses
                  : [],
              };
              setEnterprise(profile);
              setDraft(profile);
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
    async function refresh() {
      try {
        const data = await api("/api/feed");
        if (!cancelled && Array.isArray(data.signals)) setFeed(data.signals);
      } catch {}
    }
    void refresh();
    const timer = setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  /* ---------- derived ---------- */

  const markets = Array.from(
    new Set([
      ...enterprise.markets,
      ...enterprise.businesses.flatMap((b) => b.markets),
    ]),
  );
  const providers = Array.from(
    new Set(enterprise.businesses.flatMap((b) => b.models).map(providerName)),
  ).slice(0, 6);
  const scopeBusiness =
    scope === ALL_BUSINESS
      ? undefined
      : enterprise.businesses.find((b) => b.id === scope);
  const scopeMarkets = scopeBusiness ? scopeBusiness.markets : markets;
  const scopeProviders = scopeBusiness
    ? Array.from(new Set(scopeBusiness.models.map(providerName)))
    : providers;
  const market = scopeMarkets.includes(activeMarket) ? activeMarket : ALL_MARKETS;
  const marketCodeList = useMemo(
    () =>
      market === ALL_MARKETS
        ? scopeMarkets.flatMap((m) => marketCodes[m] || [])
        : marketCodes[market] || [],
    [market, scopeMarkets],
  );
  const scopeCodeSet = useMemo(
    () => new Set(scopeMarkets.flatMap((m) => marketCodes[m] || [])),
    [scopeMarkets],
  );
  const homeCodes = marketCodes[enterprise.headquarters] || [];
  const homeCode =
    enterprise.headquarters === "欧盟" ? undefined : homeCodes[0];

  const countryMap = useMemo(
    () => new Map(countries.map((c) => [c.code, c])),
    [],
  );
  const orgsOf = (item: Signal) => eventOrganizations(item, countryMap);
  const eventTone = (item: Signal) => toneOfOrgs(orgsOf(item));

  const scopedEvents = useMemo(
    () =>
      feed
        .filter((item) => marketCodeList.includes(item.country))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [feed, marketCodeList],
  );
  const visibleEvents = month
    ? scopedEvents.filter((item) => dateParts(item.date).ym === month)
    : scopedEvents;
  const displayedEvents = visibleEvents.slice(0, 7);

  const riskMarkets = market === ALL_MARKETS ? scopeMarkets : [market];
  const risks = businessRisks
    .filter(
      (risk) =>
        risk.markets.some(
          (m) => riskMarkets.includes(m) || m === "全球",
        ) &&
        risk.providers.some(
          (provider) =>
            provider === "其他模型" ||
            scopeProviders.some(
              (name) =>
                name.toLowerCase().includes(provider.toLowerCase()) ||
                (provider === "OpenAI" && name === "GPT") ||
                (provider === "Anthropic" && name === "Claude"),
            ),
        ),
    )
    .sort((a, b) =>
      a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1,
    );
  const highRisks = risks.filter((risk) => risk.severity === "high").length;

  const toneFor = (country: Country): MapTone | null =>
    homeCodes.includes(country.code)
      ? "home"
      : scopeCodeSet.has(country.code)
        ? "market"
        : null;

  /* ---------- navigation ---------- */

  const top = stack[stack.length - 1];
  const sheetView: DetailView | null = top.kind !== "list" ? top : closing;
  const sheetOpen = top.kind !== "list";
  const eventById = new Map(feed.map((item) => [item.id, item]));
  const riskById = new Map(businessRisks.map((risk) => [risk.id, risk]));
  const activeEvent = top.kind === "event" ? eventById.get(top.id) : undefined;
  const below = stack[stack.length - 2];
  const parentCountry =
    top.kind === "event" && below?.kind === "country" ? below.code : null;
  const sequence = parentCountry
    ? visibleEvents.filter((item) => item.country === parentCountry)
    : visibleEvents;
  const position = activeEvent
    ? sequence.findIndex((item) => item.id === activeEvent.id)
    : -1;
  const selectedCode =
    top.kind === "event"
      ? (activeEvent?.country ?? null)
      : top.kind === "country"
        ? top.code
        : null;
  const highlightedId =
    top.kind === "event" ? top.id : closing?.kind === "event" ? closing.id : "";
  const highlightedRisk =
    top.kind === "risk" ? top.id : closing?.kind === "risk" ? closing.id : "";

  const flyTo = (code: string, intent: "event" | "country") => {
    focusSeq.current += 1;
    setFocus({ code, intent, seq: focusSeq.current });
  };
  const openDetail = (view: DetailView, keepParent = false) => {
    setClosing(null);
    setNavDir("forward");
    setStack((prev) =>
      keepParent && prev[prev.length - 1]?.kind === "country"
        ? [...prev, view]
        : [{ kind: "list" }, view],
    );
  };
  const openEvent = (item: Signal, fromCountry = false) => {
    openDetail({ kind: "event", id: item.id }, fromCountry);
    flyTo(item.country, "event");
  };
  const openCountry = (code: string) => {
    openDetail({ kind: "country", code });
    flyTo(code, "country");
  };
  const openRisk = (risk: BusinessRisk) => openDetail({ kind: "risk", id: risk.id });
  const step = (delta: 1 | -1) => {
    const next = sequence[position + delta];
    if (!next) return;
    setNavDir(delta > 0 ? "next" : "prev");
    setStack((prev) => [...prev.slice(0, -1), { kind: "event", id: next.id }]);
    flyTo(next.country, "event");
  };
  const back = () => {
    if (stack.length <= 1) return;
    const nextStack = stack.slice(0, -1);
    const nextTop = nextStack[nextStack.length - 1];
    setNavDir("back");
    if (nextTop.kind === "list" && top.kind !== "list") {
      setClosing(top);
      if (top.kind !== "risk") setFocus(marketFocusFor(market));
    } else if (nextTop.kind === "country") {
      flyTo(nextTop.code, "country");
    }
    setStack(nextStack);
  };
  function marketFocusFor(next: string): MapFocus {
    if (next === ALL_MARKETS) return null;
    const code = marketFocus[next] ?? marketCodes[next]?.[0];
    focusSeq.current += 1;
    return code ? { code, intent: "country", seq: focusSeq.current } : null;
  }
  function selectMarket(next: string) {
    setActiveMarket(next);
    setMonth(null);
    setStack([{ kind: "list" }]);
    setClosing(null);
    setFocus(marketFocusFor(next));
  }
  function selectScope(next: string) {
    setScope(next);
    setActiveMarket(ALL_MARKETS);
    setMonth(null);
    setStack([{ kind: "list" }]);
    setClosing(null);
    setFocus(null);
  }

  // Esc closes details; ←/→ steps through events.
  const keyHandler = useRef<(event: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keyHandler.current = (event) => {
      if (settings || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape" && sheetOpen) back();
      if (isTyping(event.target) || top.kind !== "event") return;
      if (["ArrowRight", "j"].includes(event.key)) step(1);
      if (["ArrowLeft", "k"].includes(event.key)) step(-1);
    };
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => keyHandler.current(event);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const draftBusiness =
    draft.businesses.find((b) => b.id === activeBusiness) ||
    draft.businesses[0];
  function openSettings() {
    setDraft(structuredClone(enterprise));
    setActiveBusiness(enterprise.businesses[0]?.id || "");
    setSettings(true);
    setLogin(false);
  }
  function updateBusiness(patch: Partial<Business>) {
    if (!draftBusiness) return;
    setDraft((p) => ({
      ...p,
      businesses: p.businesses.map((b) =>
        b.id === draftBusiness.id ? { ...b, ...patch } : b,
      ),
    }));
  }
  function addBusiness() {
    const id = `business-${Date.now()}`;
    setDraft((p) => ({
      ...p,
      businesses: [
        ...p.businesses,
        {
          id,
          name: "新业务场景",
          description: "",
          markets: [],
          useCases: [],
          dataTypes: [],
          models: [],
          stage: "规划中",
        },
      ],
    }));
    setActiveBusiness(id);
  }
  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (user) await api("/api/company", { profile: draft });
      else localStorage.setItem(PROFILE_KEY, JSON.stringify(draft));
      setEnterprise(draft);
      setSettings(false);
      setMessage(user ? "企业设置已同步云端" : "演示企业设置已保存至本浏览器");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function authenticate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = new FormData(e.currentTarget);
    setBusy(true);
    setAuthMessage("");
    try {
      const data = await api("/api/auth", {
        action: "signIn",
        email: values.get("email"),
        password: values.get("password"),
      });
      if (data.user) {
        setUser(data.user);
        const company = await api("/api/company");
        const profile = company.profile
          ? {
              ...defaultEnterprise,
              ...company.profile,
              businesses: company.profile.businesses || [],
            }
          : structuredClone(defaultEnterprise);
        setEnterprise(profile);
        setDraft(profile);
        setLogin(false);
        setMessage("已切换到真实企业账号");
      }
    } catch (error) {
      setAuthMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    try {
      await api("/api/auth", { action: "signOut" });
      setUser(null);
      const profile = readDemo();
      setEnterprise(profile);
      setDraft(profile);
      setSettings(false);
      setMessage("已返回本地演示企业");
    } catch (error) {
      setMessage((error as Error).message);
    }
  }
  function exportBrief() {
    const content = [
      `windsight · ${enterprise.name} 企业决策简报`,
      `身份：${user ? "真实企业账户" : "虚拟企业演示"}`,
      `注册地：${enterprise.headquarters}；市场：${markets.join("、")}`,
      "",
      ...risks.map(
        (r) =>
          `${r.title}\n${r.summary}\n建议行动：${r.action}\n${r.sources.map((s) => `${s.title} ${s.url}`).join("\n")}`,
      ),
      "",
      "市场信号",
      ...displayedEvents.map(
        (item) =>
          `${item.date} ${item.title}\n${item.status} · ${item.sourceUrl}`,
      ),
      "规则辅助研究，未调用实时AI；请核查实际服务资格和法律适用性。",
    ].join("\n\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "windsight-企业决策简报.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  const businessOptions = [
    { key: ALL_BUSINESS, label: "全部业务" },
    ...enterprise.businesses.map((b) => ({ key: b.id, label: b.name })),
  ];
  const marketOptions_ = [
    { key: ALL_MARKETS, label: ALL_MARKETS },
    ...scopeMarkets.map((m) => ({
      key: m,
      label: m,
      tone: homeCodes.some((c) => (marketCodes[m] || []).includes(c))
        ? "home"
        : undefined,
    })),
  ];
  const name = enterprise.name.replace("（虚拟企业）", "");

  return (
    <div className="pt pt-enterprise" data-sheet={sheetOpen ? "open" : "closed"}>
      <header className="pt-header">
        <Link href="/" className="pt-brand" aria-label="windsight 观风首页">
          <WindLogo />
          <strong>
            windsight<span>观风</span>
          </strong>
        </Link>
        <div className="pt-header-title">
          <h1>企业视角</h1>
          <span>
            {name} · 注册地 {enterprise.headquarters} ·{" "}
            {user ? "企业工作空间" : "虚拟企业演示"}
          </span>
        </div>
        <div className="pt-header-actions">
          <button
            className="ea-account"
            onClick={openSettings}
            aria-label="企业设置"
            title="企业设置"
          >
            <span className="ea-account-copy">
              <strong>{name}</strong>
              <small>{user ? "企业账号" : "演示企业 · 免注册"}</small>
            </span>
            <span className="ea-avatar">
              M<span />
            </span>
          </button>
          <ViewSwitch active="enterprise" />
        </div>
      </header>

      <div className="pt-toolbar" role="toolbar" aria-label="业务与市场">
        {enterprise.businesses.length > 1 ? (
          <Segmented
            label="业务场景"
            value={scopeBusiness ? scope : ALL_BUSINESS}
            options={businessOptions}
            onChange={selectScope}
          />
        ) : null}
        <Segmented
          label="关注市场"
          value={market}
          options={marketOptions_}
          onChange={selectMarket}
        />
        {month ? (
          <button
            className="pt-chip"
            onClick={() => setMonth(null)}
            aria-label={`清除月份筛选 ${monthLabel(month)}`}
          >
            {monthLabel(month)} ×
          </button>
        ) : null}
        <div className="pt-models" aria-label="模型依赖">
          <span>模型依赖</span>
          {scopeProviders.map((provider) => (
            <span key={provider} title={provider} className="pt-model">
              <BrandLogo name={provider} size={17} />
            </span>
          ))}
        </div>
        <button className="pt-action" onClick={exportBrief}>
          <Download size={14} aria-hidden />
          导出简报
        </button>
      </div>

      <main className="pt-body">
        <section className="pt-stage" aria-label="企业业务版图">
          <div className="pt-stage-legend pt-stage-legend--static">
            <span>
              <i className="pt-dot tone-market" />
              关注市场 <b>{scopeMarkets.length}</b>
            </span>
            <span>
              <i className="pt-dot tone-home" />
              注册地
            </span>
            <span>
              <i className="pt-dot tone-gpai" />
              政策信号 · 数字为条数
            </span>
          </div>
          <AtlasMap
            countries={countries}
            events={visibleEvents}
            bloc="全部"
            emphasis={null}
            focus={focus}
            selectedCode={selectedCode}
            hotCode={hotCode}
            onCountry={(code) => {
              const list = visibleEvents.filter((e) => e.country === code);
              if (list.length === 1 && !countryMap.has(code)) openEvent(list[0]);
              else openCountry(code);
              setTab("events");
            }}
            onHoverCode={setHotCode}
            eventOrgTone={eventTone}
            toneFor={toneFor}
            homeCode={homeCode}
          />
          <div className="pt-stage-foot">
            <span className="pt-stage-note">
              <Info size={13} aria-hidden />
              服务可用性按供应商地区、所有权、终端用户和合同条件单独核验
            </span>
          </div>
          <TimeStrip
            events={scopedEvents}
            toneOf={eventTone}
            month={month}
            onMonth={(ym) => {
              setMonth(ym);
              setTab("events");
            }}
            markMonth={activeEvent ? dateParts(activeEvent.date).ym : null}
          />
        </section>

        <aside className="pt-rail" aria-label="业务暴露与决策提示">
          <div
            className="pt-rail-base"
            aria-hidden={sheetOpen || undefined}
            inert={sheetOpen || undefined}
          >
            <div className="pt-kpis">
              <Kpi label="关联动态" value={visibleEvents.length} />
              <Kpi label="关注市场" value={scopeMarkets.length} />
              <Kpi label="决策提示" value={risks.length} />
              <Kpi label="高优先级" value={highRisks} tone="warn" />
            </div>
            <div className="pt-scope">
              <div className="pt-scope-head">
                <strong>{scopeBusiness ? scopeBusiness.name : name}</strong>
                {scopeBusiness ? (
                  <em className="pt-neutral">{scopeBusiness.stage}</em>
                ) : (
                  <em className="pt-neutral">
                    {enterprise.businesses.length} 项业务
                  </em>
                )}
                <button onClick={openSettings}>编辑</button>
              </div>
              <p>
                {scopeBusiness
                  ? scopeBusiness.description || "尚未填写业务描述。"
                  : enterprise.description}
              </p>
              {scopeBusiness?.dataTypes.length ? (
                <div className="pt-tags">
                  {scopeBusiness.dataTypes.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="pt-rail-tabs">
              <Segmented
                label="右侧内容"
                value={tab}
                options={[
                  {
                    key: "risks",
                    label: "决策提示",
                    badge: <em className="pt-badge">{risks.length}</em>,
                  },
                  {
                    key: "events",
                    label: "市场风向",
                    badge: (
                      <em className="pt-badge">{visibleEvents.length}</em>
                    ),
                  },
                ]}
                onChange={setTab}
              />
            </div>
            <div className="pt-list" key={`${tab}|${scope}|${market}|${month ?? ""}`}>
              {tab === "risks" ? (
                risks.length ? (
                  <ol className="pt-risks">
                    {risks.map((risk, index) => (
                      <li key={risk.id} style={{ "--i": index } as CSSProperties}>
                        <button
                          className={`pt-risk ${risk.severity === "high" ? "is-high" : ""} ${highlightedRisk === risk.id ? "is-active" : ""}`}
                          onClick={() => openRisk(risk)}
                        >
                          <span className="pt-risk-meta">
                            <em
                              className={
                                risk.severity === "high"
                                  ? "pt-pending"
                                  : "pt-neutral"
                              }
                            >
                              {risk.status}
                            </em>
                            <span>
                              {risk.markets
                                .filter((m) => markets.includes(m))
                                .slice(0, 3)
                                .join(" · ") || "全球"}
                            </span>
                          </span>
                          <strong>{risk.title}</strong>
                          <span className="pt-row-summary">
                            {risk.action}
                          </span>
                        </button>
                      </li>
                    ))}
                    <li className="pt-boundary">
                      供应商限制与政府法规分别判断；当前视图采用规则匹配，不构成法律意见。
                    </li>
                  </ol>
                ) : (
                  <div className="pt-empty">
                    <CircleCheck size={22} aria-hidden />
                    <h3>当前范围暂无匹配提示</h3>
                    <p>没有匹配不代表没有风险，请结合合同与供应商条款复核。</p>
                  </div>
                )
              ) : visibleEvents.length ? (
                <EventList
                  events={visibleEvents}
                  orgsOf={orgsOf}
                  highlightedId={highlightedId}
                  onOpen={(item) => openEvent(item)}
                  onHover={setHotCode}
                />
              ) : (
                <div className="pt-empty">
                  <Search size={22} aria-hidden />
                  <h3>该市场暂未收录信号</h3>
                  <p>没有新资料不代表没有变化。</p>
                </div>
              )}
            </div>
          </div>

          <div
            className={`pt-sheet ${sheetOpen ? "is-open" : ""}`}
            aria-hidden={!sheetOpen}
            inert={!sheetOpen || undefined}
            onTransitionEnd={(e) => {
              if (e.target === e.currentTarget && !sheetOpen) setClosing(null);
            }}
          >
            {sheetView ? (
              <div
                className="pt-sheet-inner"
                key={`${sheetView.kind}-${"id" in sheetView ? sheetView.id : sheetView.code}`}
                data-dir={navDir}
              >
                {sheetView.kind === "event" ? (
                  (() => {
                    const item = eventById.get(sheetView.id);
                    return (
                      <EventDetail
                        event={item}
                        country={countryMap.get(item?.country ?? "")}
                        orgs={item ? orgsOf(item) : []}
                        backLabel={
                          parentCountry
                            ? (countryMap.get(parentCountry)?.name ?? "国家")
                            : "市场风向"
                        }
                        position={position}
                        total={sequence.length}
                        onBack={back}
                        onStep={step}
                        onCountry={openCountry}
                        related={visibleEvents
                          .filter(
                            (e) => e.country === item?.country && e.id !== item?.id,
                          )
                          .slice(0, 3)}
                        onOpenRelated={(next) => {
                          setNavDir("next");
                          setStack((prev) => [
                            ...prev.slice(0, -1),
                            { kind: "event", id: next.id },
                          ]);
                        }}
                      />
                    );
                  })()
                ) : sheetView.kind === "country" ? (
                  <CountryDetail
                    code={sheetView.code}
                    country={countryMap.get(sheetView.code)}
                    events={visibleEvents.filter((e) => e.country === sheetView.code)}
                    orgsOf={orgsOf}
                    onBack={back}
                    onOpen={(item) => openEvent(item, true)}
                    onHover={setHotCode}
                  />
                ) : (
                  <RiskDetail
                    risk={riskById.get(sheetView.id)}
                    enterpriseMarkets={markets}
                    onBack={back}
                  />
                )}
              </div>
            ) : null}
          </div>
        </aside>
        <button
          className="pt-scrim"
          aria-label="关闭详情"
          tabIndex={sheetOpen ? 0 : -1}
          onClick={back}
        />
      </main>
      {message && (
        <div className="ea-toast" role="status">
          <I name="check" size={16} />
          {message}
        </div>
      )}
      {settings && (
        <div
          className="ea-settings-backdrop"
          onClick={() => setSettings(false)}
        >
          <aside
            className="ea-settings"
            role="dialog"
            aria-modal="true"
            aria-label="企业设置"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ea-settings-heading">
              <div>
                <p>企业工作空间</p>
                <h2>企业设置</h2>
              </div>
              <button
                aria-label="关闭企业设置"
                onClick={() => setSettings(false)}
              >
                <I name="close" size={21} />
              </button>
            </div>
            <div className="ea-settings-account">
              <span className="ea-avatar">M</span>
              <div>
                <strong>{user ? user.email : "演示企业 · Meridian AI"}</strong>
                <p>
                  {user
                    ? "企业数据与当前账号关联"
                    : "无需注册；修改保存在当前浏览器"}
                </p>
              </div>
              <button onClick={() => (user ? signOut() : setLogin((v) => !v))}>
                {user ? "退出账号" : "真实账号"}
              </button>
            </div>
            {login ? (
              <form className="ea-login-form" onSubmit={authenticate}>
                <h3>切换真实企业账号</h3>
                <label>
                  邮箱
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                  />
                </label>
                <label>
                  密码
                  <input
                    required
                    type="password"
                    minLength={8}
                    name="password"
                    autoComplete="current-password"
                  />
                </label>
                {authMessage && <p>{authMessage}</p>}
                <button className="ea-save" disabled={busy}>
                  {busy ? "正在登录…" : "登录"}
                </button>
                <button type="button" onClick={() => setLogin(false)}>
                  返回演示企业设置
                </button>
              </form>
            ) : (
              <form className="ea-settings-form" onSubmit={saveSettings}>
                <section>
                  <h3>企业基本信息</h3>
                  <label>
                    企业名称
                    <input
                      required
                      maxLength={200}
                      value={draft.name}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </label>
                  <div className="ea-form-grid">
                    <label>
                      注册地
                      <select
                        value={draft.headquarters}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...p,
                            headquarters: e.target.value,
                          }))
                        }
                      >
                        {marketOptions.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      行业
                      <input
                        value={draft.industry}
                        onChange={(e) =>
                          setDraft((p) => ({ ...p, industry: e.target.value }))
                        }
                      />
                    </label>
                  </div>
                  <label>
                    业务描述
                    <textarea
                      rows={3}
                      value={draft.description}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, description: e.target.value }))
                      }
                    />
                  </label>
                  <fieldset>
                    <legend>关注市场</legend>
                    <div className="ea-choice-list">
                      {marketOptions.map((m) => (
                        <button
                          type="button"
                          className={
                            draft.markets.includes(m) ? "selected" : ""
                          }
                          key={m}
                          onClick={() =>
                            setDraft((p) => ({
                              ...p,
                              markets: p.markets.includes(m)
                                ? p.markets.filter((x) => x !== m)
                                : [...p.markets, m],
                            }))
                          }
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </section>
                <section>
                  <p className="ea-settings-rule-note">
                    聚合服务另需核验转售授权、终端用户条件与实际数据流。新加坡注册不自动满足所有权、控制关系或数据跨境要求。
                  </p>
                  <div className="ea-settings-section-title">
                    <h3>业务场景</h3>
                    <button type="button" onClick={addBusiness}>
                      <I name="plus" size={13} />
                      新增业务
                    </button>
                  </div>
                  <div className="ea-business-tabs">
                    {draft.businesses.map((b) => (
                      <button
                        type="button"
                        className={draftBusiness?.id === b.id ? "active" : ""}
                        key={b.id}
                        onClick={() => setActiveBusiness(b.id)}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                  {draftBusiness ? (
                    <>
                      <div className="ea-form-grid">
                        <label>
                          业务名称
                          <input
                            required
                            value={draftBusiness.name}
                            onChange={(e) =>
                              updateBusiness({ name: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          业务阶段
                          <select
                            value={draftBusiness.stage}
                            onChange={(e) =>
                              updateBusiness({
                                stage: e.target.value as Business["stage"],
                              })
                            }
                          >
                            <option>规划中</option>
                            <option>试点中</option>
                            <option>已上线</option>
                          </select>
                        </label>
                      </div>
                      <label>
                        业务描述
                        <textarea
                          rows={3}
                          value={draftBusiness.description}
                          onChange={(e) =>
                            updateBusiness({ description: e.target.value })
                          }
                        />
                      </label>
                      {[
                        {
                          field: "markets" as const,
                          title: "业务市场",
                          options: marketOptions,
                        },
                        {
                          field: "models" as const,
                          title: "模型依赖",
                          options: [
                            "GPT",
                            "Claude",
                            "Qwen",
                            "DeepSeek",
                            "Gemini",
                            "Mistral",
                          ],
                        },
                        {
                          field: "dataTypes" as const,
                          title: "涉及数据",
                          options: [
                            "个人信息",
                            "API 密钥",
                            "商业秘密",
                            "日志与调用记录",
                            "一般业务数据",
                          ],
                        },
                        {
                          field: "useCases" as const,
                          title: "AI 使用场景",
                          options: [
                            "模型 API 路由",
                            "跨境 AI 服务",
                            "私有化部署",
                            "知识检索",
                            "智能客服",
                            "内容生成",
                          ],
                        },
                      ].map((field) => (
                        <fieldset key={field.field}>
                          <legend>{field.title}</legend>
                          <div className="ea-choice-list">
                            {field.options.map((option) => (
                              <button
                                type="button"
                                key={option}
                                className={
                                  draftBusiness[field.field].includes(option)
                                    ? "selected"
                                    : ""
                                }
                                onClick={() =>
                                  updateBusiness({
                                    [field.field]: draftBusiness[
                                      field.field
                                    ].includes(option)
                                      ? draftBusiness[field.field].filter(
                                          (x) => x !== option,
                                        )
                                      : [...draftBusiness[field.field], option],
                                  })
                                }
                              >
                                {field.field === "models" && (
                                  <BrandLogo name={option} size={15} />
                                )}{" "}
                                {option}
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      ))}
                      <button
                        type="button"
                        className="ea-remove-business"
                        onClick={() =>
                          setDraft((p) => ({
                            ...p,
                            businesses: p.businesses.filter(
                              (b) => b.id !== draftBusiness.id,
                            ),
                          }))
                        }
                      >
                        删除当前业务
                      </button>
                    </>
                  ) : (
                    <p className="ea-empty-business">
                      暂无业务场景。点击“新增业务”添加。
                    </p>
                  )}
                </section>
                <div className="ea-settings-save">
                  <span>
                    <I name="shield" size={13} />
                    {user ? "保存至企业账号" : "仅保存到本浏览器"}
                  </span>
                  <button className="ea-save" disabled={busy}>
                    {busy ? "正在保存…" : "保存企业设置"}
                  </button>
                </div>
              </form>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function RiskDetail({
  risk,
  enterpriseMarkets,
  onBack,
}: {
  risk?: BusinessRisk;
  enterpriseMarkets: string[];
  onBack: () => void;
}) {
  if (!risk)
    return (
      <>
        <SheetBar label="决策提示" onBack={onBack} />
        <div className="pt-empty">
          <h3>该提示已不在当前规则中</h3>
        </div>
      </>
    );
  return (
    <>
      <SheetBar label="决策提示" onBack={onBack} />
      <article className="pt-detail">
        <div className="pt-detail-date">
          <span className="pt-risk-level">
            <ShieldAlert size={16} aria-hidden />
            {risk.severity === "high" ? "高优先级" : "需关注"}
          </span>
          <span className="pt-detail-cat">{risk.status}</span>
        </div>
        <h2>{risk.title}</h2>
        <div className="pt-detail-meta">
          {risk.markets.map((m) => (
            <span key={m} className={enterpriseMarkets.includes(m) ? "is-match" : ""}>
              {m}
            </span>
          ))}
        </div>
        <p className="pt-detail-summary">{risk.summary}</p>
        <div className="pt-implication">
          <h3>
            <CircleCheck size={14} aria-hidden />
            建议行动
          </h3>
          <p>{risk.action}</p>
        </div>
        <h3 className="pt-detail-h">涉及供应商</h3>
        <div className="pt-tags">
          {risk.providers.map((provider) => (
            <span key={provider} className="pt-provider">
              {provider !== "其他模型" ? (
                <BrandLogo name={provider} size={13} />
              ) : null}
              {provider}
            </span>
          ))}
        </div>
        <h3 className="pt-detail-h">来源</h3>
        <SourceLinks links={risk.sources} />
        <p className="pt-detail-quiet">
          以上为规则辅助筛查，请以供应商现行条款与法律意见为准。
        </p>
      </article>
    </>
  );
}
