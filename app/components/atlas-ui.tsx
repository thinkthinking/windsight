"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { animate, motion } from "motion/react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  FileText,
  ShieldCheck,
} from "lucide-react";
import type { Country, Signal } from "@/lib/data";
import type { OrgTone } from "./atlas-map";

export const hasDate = (value: string) => /^\d{4}-\d{2}-\d{2}/.test(value);

export function eventOrganizations(event: Signal, countryMap: Map<string, Country>) {
  if (event.country === "EU") return ["GPAI"];
  return (
    countryMap.get(event.country)?.organizations ??
    event.tags.filter((tag) => tag === "GPAI" || tag === "WAICO")
  );
}
export function toneOfOrgs(orgs: string[]): OrgTone {
  const g = orgs.includes("GPAI");
  const w = orgs.includes("WAICO");
  return g && w ? "joint" : g ? "gpai" : w ? "waico" : "other";
}
export function dateParts(value: string) {
  if (!hasDate(value))
    return { year: "", month: "", day: "", ym: "", full: "日期待核实" };
  const [year, month, day] = value.slice(0, 10).split("-");
  return {
    year,
    month,
    day,
    ym: `${year}-${month}`,
    full: `${year} 年 ${Number(month)} 月 ${Number(day)} 日`,
  };
}
export function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  return `${y} 年 ${Number(m)} 月`;
}
export function checkedTime(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
    hour12: false,
  }).format(new Date(value));
}
export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
export function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return (
    !!el &&
    (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
  );
}

/* ------------------------------------------------------------------ *
 * Small motion primitives
 * ------------------------------------------------------------------ */

/** Number that eases to its new value instead of jumping (motion). */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      shown.current = value;
      el.textContent = String(value);
      return;
    }
    const controls = animate(shown.current, value, {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        shown.current = latest;
        el.textContent = String(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value]);
  return <span ref={ref}>{value}</span>;
}

/** Segmented control; the active pill glides between options (motion layoutId). */
export function Segmented<K extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: K;
  options: readonly {
    key: K;
    label: string;
    tone?: string;
    badge?: ReactNode;
  }[];
  onChange: (key: K) => void;
}) {
  const id = useId();
  return (
    <div className="pt-seg" role="group" aria-label={label}>
      {options.map((option) => {
        const active = value === option.key;
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.key)}
          >
            {active ? (
              <motion.span
                layoutId={`seg-pill-${id}`}
                className="pt-seg-pill"
                transition={{ type: "spring", stiffness: 520, damping: 38 }}
                aria-hidden
              />
            ) : null}
            {option.tone ? (
              <i className={`pt-dot tone-${option.tone}`} />
            ) : null}
            <span>{option.label}</span>
            {option.badge}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Rail pieces
 * ------------------------------------------------------------------ */

export function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warn";
}) {
  return (
    <div className={`pt-kpi ${tone === "warn" && value ? "is-warn" : ""}`}>
      <strong>
        <CountUp value={value} />
      </strong>
      <span>{label}</span>
    </div>
  );
}

export function EventList({
  events,
  orgsOf,
  highlightedId,
  onOpen,
  onHover,
}: {
  events: Signal[];
  orgsOf: (event: Signal) => string[];
  highlightedId: string;
  onOpen: (event: Signal) => void;
  onHover: (code: string | null) => void;
}) {
  const groups: { ym: string; items: Signal[] }[] = [];
  for (const event of events) {
    const ym = dateParts(event.date).ym || "pending";
    const last = groups[groups.length - 1];
    if (last?.ym === ym) last.items.push(event);
    else groups.push({ ym, items: [event] });
  }
  let index = 0;
  return (
    <>
      {groups.map((group) => (
        <section key={group.ym} className="pt-month">
          <h3 className="pt-month-head">
            {group.ym === "pending" ? "日期待核实" : monthLabel(group.ym)}
            <span>{group.items.length} 条</span>
          </h3>
          <ol>
            {group.items.map((event) => {
              const parts = dateParts(event.date);
              const orgs = orgsOf(event);
              const active = event.id === highlightedId;
              const i = index++;
              return (
                <li
                  key={event.id}
                  style={{ "--i": Math.min(i, 14) } as CSSProperties}
                >
                  <button
                    id={`pt-row-${event.id}`}
                    className={`pt-row tone-${toneOfOrgs(orgs)} ${active ? "is-active" : ""}`}
                    onClick={() => onOpen(event)}
                    onPointerEnter={() => onHover(event.country)}
                    onPointerLeave={() => onHover(null)}
                    onFocus={() => onHover(event.country)}
                    onBlur={() => onHover(null)}
                    aria-current={active || undefined}
                  >
                    <span className="pt-row-date">
                      {parts.day ? (
                        <b>{Number(parts.day)}</b>
                      ) : (
                        <small>待核实</small>
                      )}
                    </span>
                    <span className="pt-row-rail" aria-hidden>
                      <i />
                    </span>
                    <span className="pt-row-body">
                      <span className="pt-row-meta">
                        <span>{event.countryName}</span>
                        {orgs.map((org) => (
                          <em key={org} className={`pt-org ${org.toLowerCase()}`}>
                            {org}
                          </em>
                        ))}
                        {event.status !== "已核实" ? (
                          <em className="pt-pending">待核实</em>
                        ) : null}
                        <span className="pt-row-cat">{event.category}</span>
                      </span>
                      <strong>{event.title}</strong>
                      <span className="pt-row-summary">{event.summary}</span>
                    </span>
                    <ChevronRight size={15} className="pt-row-go" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      <p className="pt-list-end">已展示全部已收录动态</p>
    </>
  );
}

export function SheetBar({
  label,
  onBack,
  children,
}: {
  label: string;
  onBack: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="pt-sheet-bar">
      <button className="pt-back" onClick={onBack} autoFocus>
        <ChevronLeft size={16} aria-hidden />
        {label}
      </button>
      {children}
    </div>
  );
}

export function SourceLinks({
  links,
}: {
  links: { title: string; url: string }[];
}) {
  return (
    <ul className="pt-sources">
      {links.map((link) => (
        <li key={link.url}>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            <FileText size={15} aria-hidden />
            <span>
              <strong>{link.title}</strong>
              <small>{hostOf(link.url)}</small>
            </span>
            <ArrowUpRight size={14} aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function EventDetail({
  event,
  country,
  orgs,
  backLabel,
  position,
  total,
  onBack,
  onStep,
  onCountry,
  related,
  onOpenRelated,
}: {
  event?: Signal;
  country?: Country;
  orgs: string[];
  backLabel: string;
  position: number;
  total: number;
  onBack: () => void;
  onStep: (delta: 1 | -1) => void;
  onCountry: (code: string) => void;
  related: Signal[];
  onOpenRelated: (event: Signal) => void;
}) {
  if (!event)
    return (
      <>
        <SheetBar label={backLabel} onBack={onBack} />
        <div className="pt-empty">
          <h3>该动态已不在当前资料中</h3>
        </div>
      </>
    );
  const parts = dateParts(event.date);
  return (
    <>
      <SheetBar label={backLabel} onBack={onBack}>
        {position >= 0 ? (
          <div className="pt-stepper">
            <span>
              {position + 1}
              <i>/</i>
              {total}
            </span>
            <button
              onClick={() => onStep(-1)}
              disabled={position <= 0}
              aria-label="上一条（较新）"
              title="上一条 ←"
            >
              <ChevronLeft size={16} aria-hidden />
            </button>
            <button
              onClick={() => onStep(1)}
              disabled={position >= total - 1}
              aria-label="下一条（较早）"
              title="下一条 →"
            >
              <ChevronRight size={16} aria-hidden />
            </button>
          </div>
        ) : null}
      </SheetBar>
      <article className="pt-detail">
        <div className="pt-detail-date">
          <time dateTime={parts.day ? event.date : undefined}>
            {parts.day ? (
              <>
                <b>
                  {parts.month}.{parts.day}
                </b>
                <span>{parts.year}</span>
              </>
            ) : (
              <b>日期待核实</b>
            )}
          </time>
          <span className="pt-detail-cat">{event.category}</span>
        </div>
        <h2>{event.title}</h2>
        <div className="pt-detail-meta">
          {country ? (
            <button onClick={() => onCountry(country.code)}>
              <span aria-hidden>{country.flag}</span>
              {country.name}
              <ChevronRight size={12} aria-hidden />
            </button>
          ) : (
            <span>{event.countryName}</span>
          )}
          {orgs.map((org) => (
            <em key={org} className={`pt-org ${org.toLowerCase()}`}>
              {org}
            </em>
          ))}
          <em className={event.status === "已核实" ? "pt-verified" : "pt-pending"}>
            {event.status === "已核实" ? "官方资料快照" : "社媒线索 · 待交叉核验"}
          </em>
        </div>
        <p className="pt-detail-summary">{event.summary}</p>
        <div className="pt-implication">
          <h3>
            <Building2 size={14} aria-hidden />
            企业含义
          </h3>
          <p>{event.implication}</p>
        </div>
        <h3 className="pt-detail-h">来源</h3>
        <SourceLinks
          links={[
            { title: event.source, url: event.sourceUrl },
            ...(event.relatedSources ?? []),
          ]}
        />
        {event.tags.length ? (
          <div className="pt-tags">
            {event.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
        {related.length ? (
          <>
            <h3 className="pt-detail-h">{event.countryName}的其他动态</h3>
            <ul className="pt-related">
              {related.map((item) => (
                <li key={item.id}>
                  <button onClick={() => onOpenRelated(item)}>
                    <time>{dateParts(item.date).day ? item.date.slice(5, 10).replace("-", ".") : "待核实"}</time>
                    <span>{item.title}</span>
                    <ChevronRight size={13} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="pt-detail-note">
          <kbd>←</kbd>
          <kbd>→</kbd> 切换动态 · <kbd>Esc</kbd> 返回
        </p>
      </article>
    </>
  );
}

export function CountryDetail({
  code,
  country,
  events,
  orgsOf,
  onBack,
  onOpen,
  onHover,
}: {
  code: string;
  country?: Country;
  events: Signal[];
  orgsOf: (event: Signal) => string[];
  onBack: () => void;
  onOpen: (event: Signal) => void;
  onHover: (code: string | null) => void;
}) {
  const name = country?.name ?? events[0]?.countryName ?? code;
  return (
    <>
      <SheetBar label="时间轴" onBack={onBack} />
      <article className="pt-detail">
        <div className="pt-country-head">
          <span className="pt-flag" aria-hidden>
            {country?.flag ?? "🌐"}
          </span>
          <div>
            <h2>{name}</h2>
            <span>
              {country ? `${country.nameEn} · ${country.region}` : "区域组织"}
            </span>
          </div>
        </div>
        <div className="pt-detail-meta">
          {(country?.organizations.length
            ? country.organizations
            : code === "EU"
              ? ["GPAI"]
              : []
          ).map((org) => (
            <em key={org} className={`pt-org ${org.toLowerCase()}`}>
              {org}
            </em>
          ))}
          {country ? <em className="pt-neutral">{country.riskLevel}</em> : null}
          {country ? (
            <em className="pt-neutral">{country.evidenceStatus}</em>
          ) : null}
        </div>
        {country ? (
          <>
            <p className="pt-detail-summary">{country.summary}</p>
            <div className="pt-implication">
              <h3>
                <ShieldCheck size={14} aria-hidden />
                政策要点
              </h3>
              <p>{country.policy}</p>
            </div>
          </>
        ) : null}
        <h3 className="pt-detail-h">
          当前筛选下的动态 <span>{events.length}</span>
        </h3>
        {events.length ? (
          <ol className="pt-country-events">
            {events.map((event) => (
              <li key={event.id}>
                <button
                  className={`pt-row is-compact tone-${toneOfOrgs(orgsOf(event))}`}
                  onClick={() => onOpen(event)}
                  onPointerEnter={() => onHover(event.country)}
                  onPointerLeave={() => onHover(null)}
                >
                  <span className="pt-row-date">
                    {dateParts(event.date).day ? (
                      <b>{event.date.slice(5, 10).replace("-", ".")}</b>
                    ) : (
                      <small>待核实</small>
                    )}
                    <small>{dateParts(event.date).year}</small>
                  </span>
                  <span className="pt-row-body">
                    <strong>{event.title}</strong>
                    <span className="pt-row-summary">{event.summary}</span>
                  </span>
                  <ChevronRight size={15} className="pt-row-go" aria-hidden />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="pt-detail-quiet">
            暂无已收录动态。可以调整顶部筛选，或查看下方来源持续观察。
          </p>
        )}
        {country?.companies.length ? (
          <>
            <h3 className="pt-detail-h">主要模型与企业</h3>
            <div className="pt-tags">
              {country.companies.map((company) => (
                <span key={company}>{company}</span>
              ))}
            </div>
          </>
        ) : null}
        {country?.sources.length ? (
          <>
            <h3 className="pt-detail-h">来源</h3>
            <SourceLinks links={country.sources} />
          </>
        ) : null}
        <p className="pt-detail-quiet">
          组织关系可以交叉；成员身份不等于模型市场准入或合规结论。
        </p>
      </article>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Time strip — monthly density under the map, click to filter
 * ------------------------------------------------------------------ */

const STRIP_TONES: OrgTone[] = ["gpai", "joint", "waico", "other"];

export function TimeStrip({
  events,
  toneOf,
  month,
  onMonth,
  markMonth,
}: {
  events: Signal[];
  toneOf: (event: Signal) => OrgTone;
  month: string | null;
  onMonth: (ym: string | null) => void;
  markMonth: string | null;
}) {
  const months = useMemo(() => {
    const counts = new Map<string, Record<OrgTone, number>>();
    for (const e of events) {
      const ym = dateParts(e.date).ym;
      if (!ym) continue;
      const row = counts.get(ym) ?? { gpai: 0, waico: 0, joint: 0, other: 0 };
      row[toneOf(e)] += 1;
      counts.set(ym, row);
    }
    const keys = [...counts.keys()].sort();
    if (!keys.length) return [];
    const [sy, sm] = keys[0].split("-").map(Number);
    const [ey, em] = keys[keys.length - 1].split("-").map(Number);
    const list: {
      ym: string;
      n: number;
      tones: Record<OrgTone, number>;
      y: number;
      m: number;
    }[] = [];
    for (let y = sy, m = sm; y < ey || (y === ey && m <= em); ) {
      const ym = `${y}-${String(m).padStart(2, "0")}`;
      const tones = counts.get(ym) ?? { gpai: 0, waico: 0, joint: 0, other: 0 };
      const n = tones.gpai + tones.waico + tones.joint + tones.other;
      list.push({ ym, n, tones, y, m });
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    return list;
  }, [events, toneOf]);
  const max = Math.max(1, ...months.map((m) => m.n));
  if (!months.length) return <div className="pt-strip is-empty" />;
  return (
    <div className="pt-strip">
      <div className="pt-strip-head">
        <span>按月分布</span>
        <span className="pt-strip-key">
          <i className="tone-gpai" />
          GPAI
          <i className="tone-waico" />
          WAICO
          <i className="tone-joint" />
          共同
          <i className="tone-other" />
          其他
        </span>
        <small>点击柱条按月份筛选</small>
      </div>
      <div className="pt-strip-bars" role="group" aria-label="按月份筛选动态">
        {months.map((item, i) => {
          const on = month === item.ym;
          return (
            <button
              key={item.ym}
              className={`pt-bar ${on ? "is-on" : ""} ${month && !on ? "is-dim" : ""} ${markMonth === item.ym ? "is-mark" : ""}`}
              disabled={!item.n}
              onClick={() => onMonth(on ? null : item.ym)}
              aria-pressed={on}
              aria-label={`${monthLabel(item.ym)}，${item.n} 条`}
              style={{ "--i": i } as CSSProperties}
            >
              <span className="pt-bar-tip">
                {monthLabel(item.ym)} · {item.n} 条
              </span>
              <span className="pt-bar-track">
                <span
                  className="pt-bar-fill"
                  style={{ height: `${item.n ? 12 + (item.n / max) * 88 : 0}%` }}
                >
                  {STRIP_TONES.map((tone) =>
                    item.tones[tone] ? (
                      <i
                        key={tone}
                        className={`tone-${tone}`}
                        style={{ flexGrow: item.tones[tone] }}
                      />
                    ) : null,
                  )}
                </span>
              </span>
              <span className="pt-bar-label">
                {item.m === 1 || i === 0 ? (
                  <b>{item.y}</b>
                ) : item.m % 3 === 1 ? (
                  `${item.m}月`
                ) : (
                  ""
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

