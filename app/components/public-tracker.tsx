"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  countries as initialCountries,
  signals as initialSignals,
  organizations as initialOrganizations,
  DATA_UPDATED_AT,
  type Country,
  type Signal,
  type Organization,
} from "@/lib/data";
import { InsightMap } from "./insight-map";
import { ViewSwitch } from "./view-switch";
import { I, WindLogo } from "./insight-icons";
import "./public-tracker.css";
import latestEvents from "@/docs/latest-ai-events.json";

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
const categoryOptions = ["全部动态", "政策与治理", "模型与开源"] as const;
type CategoryFilter = (typeof categoryOptions)[number];

function eventOrganizations(event: Signal, countryMap: Map<string, Country>) {
  if (event.country === "EU") return ["GPAI"];
  return (
    countryMap.get(event.country)?.organizations ??
    event.tags.filter((tag) => tag === "GPAI" || tag === "WAICO")
  );
}
function dateParts(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value))
    return { year: "日期待核实", month: "", day: "", full: "日期待核实" };
  const date = value.slice(0, 10).split("-");
  return {
    year: date[0] || "",
    month: date[1] || "",
    day: date[2] || "",
    full:
      date.length === 3
        ? `${date[0]} 年 ${Number(date[1])} 月 ${Number(date[2])} 日`
        : value,
  };
}
function checkedTime(value?: string) {
  if (!value) return "尚未刷新";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
    hour12: false,
  }).format(new Date(value));
}

export function PublicTracker() {
  const [feed, setFeed] = useState<Feed>(initialFeed);
  const [bloc, setBloc] = useState("全部");
  const [category, setCategory] = useState<CategoryFilter>("全部动态");
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [countryOverride, setCountryOverride] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [checkedAt, setCheckedAt] = useState<string | undefined>();
  const [sourceOpen, setSourceOpen] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

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
      if (!controller.signal.aborted)
        setRefreshError("刷新暂不可用，继续显示已收录资料");
      else setRefreshError("刷新超时，继续显示已收录资料");
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

  const countryMap = useMemo(
    () => new Map(feed.countries.map((country) => [country.code, country])),
    [feed.countries],
  );
  const visible = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    return feed.signals
      .filter((event) => {
        if (
          bloc !== "全部" &&
          !eventOrganizations(event, countryMap).includes(bloc)
        )
          return false;
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
      .sort((a, b) => {
        const aDate = /^\d{4}-\d{2}-\d{2}/.test(a.date) ? a.date : "";
        const bDate = /^\d{4}-\d{2}-\d{2}/.test(b.date) ? b.date : "";
        return bDate.localeCompare(aDate);
      });
  }, [feed.signals, bloc, category, keyword, countryMap]);
  const selected =
    visible.find((event) => event.id === selectedId) ?? visible[0];
  const selectedCountry =
    countryMap.get(
      countryOverride ??
        (selected?.country === "EU" ? "FR" : (selected?.country ?? "CN")),
    ) ?? feed.countries[0];
  const countryHasEvents = selectedCountry
    ? visible.some((event) => event.country === selectedCountry.code)
    : false;

  const selectEvent = (event: Signal, scroll = false) => {
    setSelectedId(event.id);
    setCountryOverride(null);
    if (scroll) {
      requestAnimationFrame(() =>
        document.getElementById(`public-event-${event.id}`)?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "nearest",
        }),
      );
    }
  };
  const selectCountry = (country: Country) => {
    const event = visible.find((item) => item.country === country.code);
    if (event) selectEvent(event, true);
    else setCountryOverride(country.code);
  };

  return (
    <div className="wi-public">
      <a className="wi-public-skip" href="#public-timeline">
        跳到动态时间轴
      </a>
      <header className="wi-public-header">
        <div className="wi-public-header-inner">
          <Link
            href="/"
            className="wi-public-brand"
            aria-label="windsight 观风首页"
          >
            <WindLogo />
            <strong>
              windsight<span>观风</span>
            </strong>
          </Link>
          <ViewSwitch active="public" />
          <span className="wi-public-header-status" aria-live="polite">
            {checkedAt ? `资料核对 ${checkedTime(checkedAt)}` : "公开资料快照"}
          </span>
        </div>
      </header>

      <main className="wi-public-main">
        <div className="wi-public-content">
          <section className="wi-public-map-section" aria-label="全球动态地图">
            <div className="wi-public-map-heading">
              <div className="wi-public-map-title">
                <h1>全球 AI 政策风向</h1>
                <span>GPAI 与 WAICO · 政策、模型与合作动向</span>
              </div>
              <button
                className="wi-public-map-refresh"
                onClick={() => void refresh()}
                disabled={refreshing}
                aria-label="刷新已入库动态"
              >
                <I
                  name="refresh"
                  size={14}
                  className={refreshing ? "wi-public-spinning" : ""}
                />
                <span>{refreshing ? "刷新中" : "刷新动态"}</span>
              </button>
            </div>
            <InsightMap
              countries={feed.countries}
              selected={selectedCountry}
              onSelect={selectCountry}
              bloc={bloc}
              onBloc={setBloc}
              events={visible}
              selectedEvent={countryOverride ? undefined : selected?.id}
              onSelectEvent={(event) => selectEvent(event, true)}
            />
            {countryOverride && selectedCountry ? (
              <div className="wi-public-map-focus">
                <div className="wi-public-focus-meta">
                  <span>{selectedCountry.name}</span>
                  <span>
                    {selectedCountry.organizations.join(" / ") || "持续观察"}
                  </span>
                </div>
                <h3>
                  {countryHasEvents
                    ? "查看这一地区的变化"
                    : "当前筛选下暂无该国已收录动态"}
                </h3>
                <p>{selectedCountry.summary}</p>
                <button onClick={() => setCountryOverride(null)}>
                  返回事件视角
                  <I name="arrow" size={13} />
                </button>
              </div>
            ) : selected ? (
              <div className="wi-public-map-focus">
                <div className="wi-public-focus-meta">
                  <span>
                    <i />
                    已选动态
                  </span>
                  <time dateTime={selected.date}>
                    {dateParts(selected.date).full}
                  </time>
                </div>
                <h3>{selected.title}</h3>
                <p>
                  <span>企业含义</span>
                  {selected.implication}
                </p>
                <a
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  查看{selected.source}原文
                  <I name="external" size={12} />
                </a>
                {selected.relatedSources?.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.title}
                    <I name="external" size={12} />
                  </a>
                ))}
              </div>
            ) : (
              <div className="wi-public-map-focus">
                <h3>当前筛选没有匹配动态</h3>
                <p>试试其他组织、类别或搜索关键词。</p>
              </div>
            )}
            <p className="wi-public-map-note">
              组织关系可以交叉；成员身份不等于模型市场准入或合规结论。
            </p>
          </section>

          <section
            className="wi-public-timeline"
            id="public-timeline"
            aria-label="AI 政策与技术动态时间轴"
          >
            <div className="wi-public-filters">
              <div
                className="wi-public-org-filter"
                role="group"
                aria-label="组织筛选"
              >
                {["全部", "GPAI", "WAICO"].map((item) => (
                  <button
                    key={item}
                    aria-pressed={bloc === item}
                    className={bloc === item ? "is-active" : ""}
                    onClick={() => {
                      setBloc(item);
                      setCountryOverride(null);
                    }}
                  >
                    {item === "全部" ? (
                      "全部组织"
                    ) : (
                      <>
                        <i className={item.toLowerCase()} />
                        {item}
                      </>
                    )}
                  </button>
                ))}
              </div>
              <div
                className="wi-public-category-filter"
                role="group"
                aria-label="动态类别"
              >
                {categoryOptions.map((item) => (
                  <button
                    key={item}
                    aria-pressed={category === item}
                    className={category === item ? "is-active" : ""}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <label className="wi-public-search">
                <I name="search" size={15} />
                <input
                  aria-label="搜索国家、政策或模型"
                  placeholder="搜索国家、政策或模型"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
                {keyword ? (
                  <button onClick={() => setKeyword("")} aria-label="清空搜索">
                    <I name="close" size={13} />
                  </button>
                ) : null}
              </label>
            </div>
            {refreshError ? (
              <p className="wi-public-feed-error" role="status">
                {refreshError}
                <button onClick={() => void refresh()}>重试</button>
              </p>
            ) : null}

            <div className="wi-public-timeline-heading">
              <h2>
                动态时间轴<span>{visible.length} 条</span>
              </h2>
              <span>
                <i />
                按来源日期
              </span>
            </div>
            {visible.length ? (
              <div className="wi-public-events">
                {visible.map((event, index) => {
                  const parts = dateParts(event.date);
                  const previousYear =
                    index > 0 ? dateParts(visible[index - 1].date).year : "";
                  const memberships = eventOrganizations(event, countryMap);
                  const active = !countryOverride && event.id === selected?.id;
                  return (
                    <div key={event.id}>
                      {parts.year !== previousYear ? (
                        <div className="wi-public-year">
                          {parts.year}
                          {/^\d{4}$/.test(parts.year) ? <span>年</span> : null}
                        </div>
                      ) : null}
                      <article
                        className={`wi-public-event ${active ? "is-selected" : ""}`}
                        id={`public-event-${event.id}`}
                      >
                        <div className="wi-public-event-date">
                          <time dateTime={parts.month ? event.date : undefined}>
                            <strong>
                              {parts.month
                                ? `${parts.month}.${parts.day}`
                                : "待核实"}
                            </strong>
                          </time>
                          <span className="wi-public-event-dot" />
                        </div>
                        <div className="wi-public-event-body">
                          <div className="wi-public-event-meta">
                            <span>{event.countryName}</span>
                            {memberships.map((membership) => (
                              <span
                                key={membership}
                                className={`wi-public-membership ${membership.toLowerCase()}`}
                              >
                                {membership}
                              </span>
                            ))}
                            <span className="wi-public-event-category">
                              {event.category}
                            </span>
                            {event.status !== "已核实" ? (
                              <span className="wi-public-unverified">
                                待核实
                              </span>
                            ) : null}
                          </div>
                          <button
                            className="wi-public-event-title"
                            aria-pressed={active}
                            onClick={() => selectEvent(event)}
                          >
                            <h3>{event.title}</h3>
                            <I name="arrow" size={15} />
                          </button>
                          <p className="wi-public-event-summary">
                            {event.summary}
                          </p>
                          <p className="wi-public-event-implication">
                            <span>企业含义</span>
                            {event.implication}
                          </p>
                          <div className="wi-public-event-source">
                            <a
                              href={event.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <I name="source" size={12} />
                              {event.source}
                              <I name="external" size={11} />
                            </a>
                            <span>
                              {event.status === "已核实"
                                ? "官方资料快照"
                                : "社媒线索 · 待交叉核验"}
                            </span>
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="wi-public-empty">
                <I name="search" size={25} />
                <h3>没有匹配的动态</h3>
                <p>调整组织、动态类别，或换一个关键词。</p>
                <button
                  onClick={() => {
                    setBloc("全部");
                    setCategory("全部动态");
                    setKeyword("");
                  }}
                >
                  清除筛选
                </button>
              </div>
            )}
            <div className="wi-public-timeline-end">
              <span />
              已展示全部已收录动态
              <span />
            </div>
          </section>
        </div>
        {sourceOpen ? (
          <section className="wi-public-source-note" aria-label="来源说明">
            <I name="source" size={18} />
            <div>
              <strong>以原始证据记录变化</strong>
              <p>
                时间轴按事件和来源日期排序，历史资料不会被标成今日新闻。官方资料为已核验的来源快照；X
                等社媒线索单独标注待核实。页面每分钟读取一次已入库动态，目前未启用自动持续采集。
              </p>
              <div>
                {feed.organizations.map((organization) => (
                  <a
                    key={organization.id}
                    href={organization.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {organization.id} 官方来源
                    <I name="external" size={11} />
                  </a>
                ))}
              </div>
            </div>
            <button
              onClick={() => setSourceOpen(false)}
              aria-label="关闭来源说明"
            >
              <I name="close" size={17} />
            </button>
          </section>
        ) : null}

        <footer className="wi-public-footer">
          <span>windsight 观风 · 让全球 AI 决策有据可循</span>
          <button
            onClick={() => {
              setSourceOpen((open) => !open);
            }}
          >
            数据与来源说明
            <I name="external" size={11} />
          </button>
          <span>政策与供应商条件请以当前原文为准</span>
        </footer>
      </main>
    </div>
  );
}

export default PublicTracker;
