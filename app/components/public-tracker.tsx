"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Info,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  countries as initialCountries,
  signals as initialSignals,
  organizations as initialOrganizations,
  DATA_UPDATED_AT,
  type Country,
  type Signal,
  type Organization,
} from "@/lib/data";
import {
  AtlasMap,
  countryTone,
  type MapFocus,
  type OrgTone,
} from "./atlas-map";
import { ViewSwitch } from "./view-switch";
import { WindLogo } from "./insight-icons";
import {
  CountryDetail,
  EventDetail,
  EventList,
  Kpi,
  Segmented,
  TimeStrip,
  checkedTime,
  dateParts,
  eventOrganizations,
  hasDate,
  isTyping,
  monthLabel,
  toneOfOrgs,
} from "./atlas-ui";
import "./public-tracker.css";
import latestEvents from "@/docs/latest-ai-events.json";

/* ------------------------------------------------------------------ *
 * Data & helpers
 * ------------------------------------------------------------------ */

type Feed = {
  signals: Signal[];
  countries: Country[];
  organizations: Organization[];
  updatedAt: string;
  checkedAt?: string;
  mode?: string;
  storage?: string;
};
const initialFeed: Feed = {
  signals: [...initialSignals, ...(latestEvents as Signal[])],
  countries: initialCountries,
  organizations: initialOrganizations,
  updatedAt: DATA_UPDATED_AT,
  mode: "curated_snapshot",
};

const ORG_OPTIONS = [
  { key: "全部", label: "全部组织" },
  { key: "GPAI", label: "GPAI", tone: "gpai" },
  { key: "WAICO", label: "WAICO", tone: "waico" },
] as const;
const CATEGORY_OPTIONS = [
  { key: "全部动态", label: "全部动态" },
  { key: "政策与治理", label: "政策与治理" },
  { key: "模型与开源", label: "模型与开源" },
] as const;
type CategoryFilter = (typeof CATEGORY_OPTIONS)[number]["key"];

type View =
  | { kind: "list" }
  | { kind: "event"; id: string }
  | { kind: "country"; code: string };
type DetailView = Exclude<View, { kind: "list" }>;
type NavDir = "forward" | "back" | "next" | "prev";

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export function PublicTracker() {
  const [feed, setFeed] = useState<Feed>(initialFeed);
  const [bloc, setBloc] = useState("全部");
  const [category, setCategory] = useState<CategoryFilter>("全部动态");
  const [keyword, setKeyword] = useState("");
  const [month, setMonth] = useState<string | null>(null);
  const [stack, setStack] = useState<View[]>([{ kind: "list" }]);
  const [closing, setClosing] = useState<DetailView | null>(null);
  const [navDir, setNavDir] = useState<NavDir>("forward");
  const [focus, setFocus] = useState<MapFocus>(null);
  const [hotCode, setHotCode] = useState<string | null>(null);
  const [emphasis, setEmphasis] = useState<OrgTone | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [checkedAt, setCheckedAt] = useState<string | undefined>();
  const [aboutOpen, setAboutOpen] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const focusSeq = useRef(0);

  /* ---------- feed ---------- */

  const refresh = useCallback(async () => {
    if (requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setRefreshing(true);
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch("/api/feed", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("feed unavailable");
      const next = await response.json();
      if (
        !Array.isArray(next.signals) ||
        !Array.isArray(next.countries) ||
        !Array.isArray(next.organizations)
      )
        throw new Error("invalid feed");
      setFeed(next);
      setCheckedAt(next.checkedAt || new Date().toISOString());
      setRefreshError("");
    } catch {
      setRefreshError(
        controller.signal.aborted
          ? "刷新超时，继续显示已收录资料"
          : "刷新暂不可用，继续显示已收录资料",
      );
    } finally {
      window.clearTimeout(timeout);
      requestRef.current = null;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 60_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
      requestRef.current?.abort();
    };
  }, [refresh]);

  /* ---------- derived data ---------- */

  const countryMap = useMemo(
    () => new Map(feed.countries.map((country) => [country.code, country])),
    [feed.countries],
  );
  const orgsOf = useCallback(
    (event: Signal) => eventOrganizations(event, countryMap),
    [countryMap],
  );
  const eventTone = useCallback(
    (event: Signal) => toneOfOrgs(orgsOf(event)),
    [orgsOf],
  );

  // Everything except the month filter: drives the time histogram.
  const scoped = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    return feed.signals
      .filter((event) => {
        if (bloc !== "全部" && !orgsOf(event).includes(bloc)) return false;
        if (category === "模型与开源" && event.category !== "技术模型")
          return false;
        if (category === "政策与治理" && event.category === "技术模型")
          return false;
        return (
          !term ||
          `${event.title} ${event.summary} ${event.countryName} ${event.source} ${event.tags.join(" ")}`
            .toLowerCase()
            .includes(term)
        );
      })
      .sort((a, b) =>
        (hasDate(b.date) ? b.date : "").localeCompare(
          hasDate(a.date) ? a.date : "",
        ),
      );
  }, [feed.signals, bloc, category, keyword, orgsOf]);

  const visible = useMemo(
    () =>
      month ? scoped.filter((e) => dateParts(e.date).ym === month) : scoped,
    [scoped, month],
  );

  const stats = useMemo(() => {
    const latest = visible.find((e) => hasDate(e.date))?.date;
    const recentFrom = latest
      ? new Date(new Date(latest).getTime() - 30 * 86_400_000)
          .toISOString()
          .slice(0, 10)
      : "";
    return {
      total: visible.length,
      places: new Set(visible.map((e) => e.country)).size,
      recent: visible.filter((e) => hasDate(e.date) && e.date >= recentFrom)
        .length,
      pending: visible.filter((e) => e.status !== "已核实").length,
    };
  }, [visible]);

  const legend = useMemo(() => {
    const count = (tone: OrgTone) =>
      feed.countries.filter((c) => countryTone(c) === tone).length;
    return [
      { tone: "gpai" as const, label: "GPAI", n: count("gpai") },
      { tone: "waico" as const, label: "WAICO", n: count("waico") },
      { tone: "joint" as const, label: "共同成员", n: count("joint") },
    ];
  }, [feed.countries]);

  /* ---------- navigation ---------- */

  const top = stack[stack.length - 1];
  const sheetView: DetailView | null = top.kind !== "list" ? top : closing;
  const sheetOpen = top.kind !== "list";
  const eventById = useMemo(
    () => new Map(feed.signals.map((e) => [e.id, e])),
    [feed.signals],
  );
  const activeEvent =
    top.kind === "event" ? eventById.get(top.id) : undefined;
  const parentCountry = (() => {
    const below = stack[stack.length - 2];
    return top.kind === "event" && below?.kind === "country"
      ? below.code
      : null;
  })();
  // Prev/next stays inside the list the reader came from.
  const sequence = useMemo(
    () =>
      parentCountry
        ? visible.filter((e) => e.country === parentCountry)
        : visible,
    [visible, parentCountry],
  );
  const position = activeEvent
    ? sequence.findIndex((e) => e.id === activeEvent.id)
    : -1;

  const selectedCode =
    top.kind === "event"
      ? (activeEvent?.country ?? null)
      : top.kind === "country"
        ? top.code
        : null;
  const highlightedId =
    top.kind === "event" ? top.id : closing?.kind === "event" ? closing.id : "";

  const flyTo = (code: string, intent: "event" | "country") => {
    focusSeq.current += 1;
    setFocus({ code, intent, seq: focusSeq.current });
  };

  const openEvent = (event: Signal, from: "list" | "country" = "list") => {
    setClosing(null);
    setNavDir("forward");
    setStack((prev) =>
      from === "country" && prev[prev.length - 1]?.kind === "country"
        ? [...prev, { kind: "event", id: event.id }]
        : [{ kind: "list" }, { kind: "event", id: event.id }],
    );
    flyTo(event.country, "event");
  };
  const openCountry = (code: string) => {
    setClosing(null);
    setNavDir("forward");
    setStack([{ kind: "list" }, { kind: "country", code }]);
    flyTo(code, "country");
  };
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
      setFocus(null);
      const id = top.kind === "event" ? top.id : null;
      if (id)
        requestAnimationFrame(() =>
          document
            .getElementById(`pt-row-${id}`)
            ?.scrollIntoView({ block: "nearest" }),
        );
    } else if (nextTop.kind === "country") {
      flyTo(nextTop.code, "country");
    }
    setStack(nextStack);
  };

  // Shareable deep links: ?event=<id> or ?country=<code>.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("event");
    const code = params.get("country");
    const timer = window.setTimeout(() => {
      const event = id ? eventById.get(id) : undefined;
      if (event) openEvent(event);
      else if (code) openCountry(code.toUpperCase());
    }, 0);
    return () => window.clearTimeout(timer);
    // Only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("event");
    url.searchParams.delete("country");
    if (top.kind === "event") url.searchParams.set("event", top.id);
    if (top.kind === "country") url.searchParams.set("country", top.code);
    window.history.replaceState(null, "", url);
  }, [top]);

  // Keyboard: "/" search · Esc back · ←/→ or J/K step through events.
  const keyHandler = useRef<(event: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keyHandler.current = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape") {
        if (aboutOpen) setAboutOpen(false);
        else if (isTyping(event.target) && keyword)
          setKeyword("");
        else if (sheetOpen) back();
        return;
      }
      if (isTyping(event.target)) return;
      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (top.kind === "event" && ["ArrowRight", "j"].includes(event.key)) {
        event.preventDefault();
        step(1);
      } else if (top.kind === "event" && ["ArrowLeft", "k"].includes(event.key)) {
        event.preventDefault();
        step(-1);
      }
    };
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => keyHandler.current(event);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const resetFilters = () => {
    setBloc("全部");
    setCategory("全部动态");
    setKeyword("");
    setMonth(null);
  };
  const filterKey = `${bloc}|${category}|${keyword.trim()}|${month ?? ""}`;
  const filtered =
    bloc !== "全部" || category !== "全部动态" || !!keyword.trim() || !!month;

  /* ---------- render ---------- */

  return (
    <div className="pt" data-sheet={sheetOpen ? "open" : "closed"}>
      <a className="pt-skip" href="#pt-rail">
        跳到动态时间轴
      </a>

      <header className="pt-header">
        <Link href="/" className="pt-brand" aria-label="windsight 观风首页">
          <WindLogo />
          <strong>
            windsight<span>观风</span>
          </strong>
        </Link>
        <div className="pt-header-title">
          <h1>全球 AI 政策风向</h1>
          <span>GPAI 与 WAICO 成员国的政策、模型与合作动向</span>
        </div>
        <ViewSwitch active="public" />
      </header>

      <div className="pt-toolbar" role="toolbar" aria-label="筛选动态">
        <Segmented
          label="组织筛选"
          value={bloc}
          options={ORG_OPTIONS}
          onChange={setBloc}
        />
        <Segmented
          label="动态类别"
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={setCategory}
        />
        {month ? (
          <button
            className="pt-chip"
            onClick={() => setMonth(null)}
            aria-label={`清除月份筛选 ${monthLabel(month)}`}
          >
            <CalendarDays size={13} aria-hidden />
            {monthLabel(month)}
            <X size={12} aria-hidden />
          </button>
        ) : null}
        <label className="pt-search">
          <Search size={15} aria-hidden />
          <input
            ref={searchRef}
            aria-label="搜索国家、政策或模型"
            placeholder="搜索国家、政策或模型"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          {keyword ? (
            <button onClick={() => setKeyword("")} aria-label="清空搜索">
              <X size={13} aria-hidden />
            </button>
          ) : (
            <kbd aria-hidden>/</kbd>
          )}
        </label>
        <div className="pt-sync" aria-live="polite">
          <span className={`pt-sync-dot ${refreshError ? "is-warn" : ""}`} />
          <span className="pt-sync-text">
            {refreshError
              ? refreshError
              : checkedAt
                ? `已核对 ${checkedTime(checkedAt)}`
                : "公开资料快照"}
          </span>
          <button
            onClick={() => void refresh()}
            disabled={refreshing}
            aria-label="刷新已入库动态"
            title="刷新已入库动态"
          >
            <RefreshCw
              size={14}
              aria-hidden
              className={refreshing ? "pt-spin" : ""}
            />
          </button>
        </div>
      </div>

      <main className="pt-body">
        {/* ---------------- Map stage ---------------- */}
        <section className="pt-stage" aria-label="全球动态地图">
          <div className="pt-stage-legend" onPointerLeave={() => setEmphasis(null)}>
            {legend.map((item) => (
              <button
                key={item.tone}
                type="button"
                className={emphasis === item.tone ? "is-on" : ""}
                onPointerEnter={() => setEmphasis(item.tone)}
                onFocus={() => setEmphasis(item.tone)}
                onBlur={() => setEmphasis(null)}
                aria-label={`高亮 ${item.label} 成员，${item.n} 个国家或地区`}
              >
                <i className={`pt-dot tone-${item.tone}`} />
                {item.label}
                <span>{item.n}</span>
              </button>
            ))}
          </div>

          <AtlasMap
            countries={feed.countries}
            events={visible}
            bloc={bloc}
            emphasis={emphasis}
            focus={focus}
            selectedCode={selectedCode}
            hotCode={hotCode}
            onCountry={(code) => {
              const list = visible.filter((e) => e.country === code);
              if (list.length === 1 && !countryMap.has(code))
                openEvent(list[0]);
              else openCountry(code);
            }}
            onHoverCode={setHotCode}
            eventOrgTone={eventTone}
          />

          <div className="pt-stage-foot">
            <button
              className="pt-about-toggle"
              onClick={() => setAboutOpen((v) => !v)}
              aria-expanded={aboutOpen}
            >
              <Info size={14} aria-hidden />
              数据与来源说明
            </button>
            <span>地理示意 · Natural Earth / GeoAtlas</span>
          </div>

          <TimeStrip
            events={scoped}
            toneOf={eventTone}
            month={month}
            onMonth={setMonth}
            markMonth={activeEvent ? dateParts(activeEvent.date).ym : null}
          />

          {aboutOpen ? (
            <div className="pt-about" role="dialog" aria-label="数据与来源说明">
              <div>
                <strong>以原始证据记录变化</strong>
                <button onClick={() => setAboutOpen(false)} aria-label="关闭">
                  <X size={15} aria-hidden />
                </button>
              </div>
              <p>
                时间轴按事件和来源日期排序，历史资料不会被标成今日新闻。官方资料为已核验的来源快照；X
                等社媒线索单独标注待核实。页面每分钟读取一次已入库动态，目前未启用自动持续采集。
              </p>
              <p>
                WAICO 着色基于 2026-07-21 的 29 国历史名单；官方规模已更新为 38
                国，新增成员待逐项核验。组织关系可以交叉，成员身份不等于模型市场准入或合规结论。
              </p>
              <div className="pt-about-links">
                {feed.organizations.map((organization) => (
                  <a
                    key={organization.id}
                    href={organization.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {organization.id} 官方来源
                    <ArrowUpRight size={13} aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {/* ---------------- Rail ---------------- */}
        <aside className="pt-rail" id="pt-rail" aria-label="动态概要与时间轴">
          <div className="pt-rail-base" aria-hidden={sheetOpen || undefined} inert={sheetOpen || undefined}>
            <div className="pt-kpis">
              <Kpi label="动态" value={stats.total} />
              <Kpi label="国家 / 地区" value={stats.places} />
              <Kpi label="近 30 天" value={stats.recent} />
              <Kpi label="待核实" value={stats.pending} tone="warn" />
            </div>
            <div className="pt-rail-head">
              <h2>动态时间轴</h2>
              <span>{filtered ? "已筛选 · " : ""}按来源日期，新到旧</span>
              {filtered ? (
                <button onClick={resetFilters}>清除筛选</button>
              ) : null}
            </div>
            <div className="pt-list" ref={listRef} key={filterKey}>
              {visible.length ? (
                <EventList
                  events={visible}
                  orgsOf={orgsOf}
                  highlightedId={highlightedId}
                  onOpen={(event) => openEvent(event)}
                  onHover={setHotCode}
                />
              ) : (
                <div className="pt-empty">
                  <Search size={22} aria-hidden />
                  <h3>没有匹配的动态</h3>
                  <p>调整组织、类别或月份，或换一个关键词。</p>
                  <button onClick={resetFilters}>清除筛选</button>
                </div>
              )}
            </div>
          </div>

          <div
            className={`pt-sheet ${sheetOpen ? "is-open" : ""}`}
            aria-hidden={!sheetOpen}
            inert={!sheetOpen || undefined}
            onTransitionEnd={(event) => {
              if (event.target === event.currentTarget && !sheetOpen)
                setClosing(null);
            }}
          >
            {sheetView ? (
              <div
                className="pt-sheet-inner"
                key={
                  sheetView.kind === "event"
                    ? `e-${sheetView.id}`
                    : `c-${sheetView.code}`
                }
                data-dir={navDir}
              >
                {sheetView.kind === "event" ? (
                  <EventDetail
                    event={eventById.get(sheetView.id)}
                    country={countryMap.get(
                      eventById.get(sheetView.id)?.country ?? "",
                    )}
                    orgs={
                      eventById.get(sheetView.id)
                        ? orgsOf(eventById.get(sheetView.id)!)
                        : []
                    }
                    backLabel={
                      parentCountry
                        ? (countryMap.get(parentCountry)?.name ?? "国家")
                        : "时间轴"
                    }
                    position={position}
                    total={sequence.length}
                    onBack={back}
                    onStep={step}
                    onCountry={(code) => openCountry(code)}
                    related={visible
                      .filter(
                        (e) =>
                          e.country === eventById.get(sheetView.id)?.country &&
                          e.id !== sheetView.id,
                      )
                      .slice(0, 3)}
                    onOpenRelated={(event) => {
                      setNavDir("next");
                      setStack((prev) => [
                        ...prev.slice(0, -1),
                        { kind: "event", id: event.id },
                      ]);
                    }}
                  />
                ) : (
                  <CountryDetail
                    code={sheetView.code}
                    country={countryMap.get(sheetView.code)}
                    events={visible.filter(
                      (e) => e.country === sheetView.code,
                    )}
                    orgsOf={orgsOf}
                    onBack={back}
                    onOpen={(event) => openEvent(event, "country")}
                    onHover={setHotCode}
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
    </div>
  );
}

export default PublicTracker;
