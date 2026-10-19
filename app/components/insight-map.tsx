"use client";

import { useMemo, useState } from "react";
import { worldPaths } from "./insight-world-data";
import { I } from "./insight-icons";
import type { Country, Signal } from "@/lib/data";

// Coordinates align with the existing world SVG; event points are geographic guides.
const eventPoints: Record<string, [number, number]> = {
  CN: [713, 131],
  US: [211, 119],
  EU: [467, 88],
  FR: [457, 95],
  SG: [707, 204],
  JP: [784, 118],
  IN: [652, 155],
  GB: [443, 76],
  DE: [476, 83],
  KR: [770, 116],
  BR: [311, 242],
  ZA: [511, 282],
  AU: [788, 277],
  ID: [738, 216],
  CA: [201, 74],
};

export function InsightMap({
  countries,
  selected,
  onSelect,
  bloc,
  onBloc,
  events,
  selectedEvent,
  onSelectEvent,
}: {
  countries: Country[];
  selected: Country;
  onSelect: (country: Country) => void;
  bloc: string;
  onBloc: (bloc: string) => void;
  events?: Signal[];
  selectedEvent?: string;
  onSelectEvent?: (event: Signal) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [hover, setHover] = useState<string | null>(null);
  const countryMap = useMemo(
    () => new Map(countries.map((c) => [c.code, c])),
    [countries],
  );
  const eventGroups = useMemo(() => {
    const groups = new Map<string, Signal[]>();
    for (const event of events ?? []) {
      if (!eventPoints[event.country]) continue;
      const existing = groups.get(event.country) ?? [];
      existing.push(event);
      groups.set(event.country, existing);
    }
    return [...groups.entries()];
  }, [events]);
  return (
    <div className="world-panel">
      <div className="map-toolbar">
        <div>
          <h2>全球 AI 治理版图</h2>
          <p>从组织协作到企业决策，连接全球政策信号</p>
        </div>
        <div className="segmented" aria-label="组织视角">
          {["全部", "GPAI", "WAICO"].map((b) => (
            <button
              key={b}
              className={bloc === b ? "active" : ""}
              onClick={() => onBloc(b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      <div className="world-canvas">
        <svg
          viewBox="0 0 900 410"
          className="world-map"
          aria-label="全球国家 AI 治理关系交互地图"
        >
          <defs>
            <pattern
              id="map-dots"
              x="0"
              y="0"
              width="15"
              height="15"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r=".65" fill="#dfe7ef" />
            </pattern>
            <linearGradient id="map-surface" x2="0" y2="1">
              <stop stopColor="#f8fbfe" />
              <stop offset="1" stopColor="#f4f8fc" />
            </linearGradient>
          </defs>
          <rect width="900" height="410" fill="url(#map-surface)" />
          <rect width="900" height="410" fill="url(#map-dots)" />
          <g
            style={{
              transform: `translate(${450 - 450 * zoom}px,${205 - 205 * zoom}px) scale(${zoom})`,
              transformOrigin: "0 0",
              transition: "transform .25s",
            }}
          >
            {worldPaths.map((p) => {
              const c = countryMap.get(
                ["TW", "HK", "MO"].includes(p.code) ? "CN" : p.code,
              );
              const displayName = c?.name || p.name;
              const member =
                c && (bloc === "全部" || c.organizations.includes(bloc));
              return (
                <path
                  key={`${p.code}-${p.name}`}
                  d={p.path}
                  className={`country-shape ${member ? (c.bloc === "共同成员" ? "joint" : c.bloc === "GPAI" ? "gpai" : c.bloc === "WAICO" ? "waico" : "") : ""} ${c?.code === selected.code ? "selected" : ""}`}
                  onMouseEnter={() => setHover(displayName)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => c && onSelect(c)}
                  role={c ? "button" : undefined}
                  tabIndex={c ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (c && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onSelect(c);
                    }
                  }}
                  aria-label={
                    c ? `${displayName}，${c.bloc}，查看国家画像` : undefined
                  }
                >
                  <title>
                    {c ? `${displayName} · ${c.bloc}` : displayName}
                  </title>
                </path>
              );
            })}
            <text x="180" y="145" className="continent-label">
              北美洲
            </text>
            <text x="263" y="302" className="continent-label">
              南美洲
            </text>
            <text x="455" y="113" className="continent-label">
              欧洲
            </text>
            <text x="475" y="237" className="continent-label">
              非洲
            </text>
            <text x="666" y="155" className="continent-label">
              亚洲
            </text>
            <text x="769" y="330" className="continent-label">
              大洋洲
            </text>
            {!events && (
              <g className="map-city">
                <circle cx="741" cy="108" r="5" />
                <circle cx="741" cy="108" r="11" className="map-city-ring" />
                <text x="755" y="112">
                  北京
                </text>
              </g>
            )}
            {!events && (
              <g className="map-city">
                <circle cx="189" cy="114" r="4" />
                <text x="161" y="103">
                  华盛顿
                </text>
              </g>
            )}
            {!events && (
              <g className="map-city">
                <circle cx="456" cy="84" r="4" />
                <text x="468" y="83">
                  巴黎
                </text>
              </g>
            )}
            {!events && (
              <g className="map-city">
                <circle cx="709" cy="204" r="4" />
                <text x="722" y="208">
                  新加坡
                </text>
              </g>
            )}
            {eventGroups.map(([code, group]) => {
              const active = group.find((event) => event.id === selectedEvent);
              const event = active ?? group[0];
              const [x, y] = eventPoints[code];
              const isWaico = countryMap
                .get(code)
                ?.organizations.includes("WAICO");
              return (
                <g
                  key={code}
                  transform={`translate(${x},${y})`}
                  className={`public-map-event ${active ? "is-selected" : ""} ${isWaico ? "is-waico" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${event.countryName}，${group.length}条动态：${event.title}`}
                  aria-pressed={!!active}
                  onClick={() => onSelectEvent?.(event)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectEvent?.(event);
                    }
                  }}
                >
                  <circle className="event-hit-area" r="16" />
                  <circle className="event-halo" r={active ? 15 : 11} />
                  <circle className="event-core" r={active ? 7 : 5} />
                  <text x="13" y="4">
                    {event.countryName}
                    {group.length > 1 ? ` ${group.length}` : ""}
                  </text>
                  <title>{`${event.date} ${event.title}`}</title>
                </g>
              );
            })}
          </g>
        </svg>
        {hover && <div className="map-hover-label">{hover}</div>}
        <div className="map-zoom">
          <button
            aria-label="放大地图"
            onClick={() => setZoom((z) => Math.min(1.8, z + 0.2))}
          >
            <I name="plus" size={16} />
          </button>
          <button
            aria-label="缩小地图"
            onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
          >
            −
          </button>
          <button aria-label="重置地图" onClick={() => setZoom(1)}>
            <I name="globe" size={15} />
          </button>
        </div>
        <div className="map-attribution">
          地理示意 · Natural Earth / GeoAtlas
        </div>
      </div>
      <div className="map-snapshot-note">
        <I name="info" size={13} />
        <span>
          WAICO 着色基于 2026-07-21 的 29 国历史名单；官方规模已更新为 38
          国，新增成员待逐项核验。
        </span>
      </div>
      <div className="map-footer">
        <div className="map-legend">
          <span>
            <i className="gpai-dot" />
            GPAI
          </span>
          <span>
            <i className="waico-dot" />
            WAICO
          </span>
          <span>
            <i className="joint-dot" />
            共同成员
          </span>
          <span>
            <i className="other-dot" />
            未建档 / 其他
          </span>
        </div>
        <span>
          点击国家查看详情 <I name="info" size={13} />
        </span>
      </div>
    </div>
  );
}
