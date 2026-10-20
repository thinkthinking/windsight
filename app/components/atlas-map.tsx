"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { worldPaths } from "./insight-world-data";
import { LocateFixed, Minus, Plus } from "lucide-react";
import type { Country, Signal } from "@/lib/data";

/* ------------------------------------------------------------------ *
 * Geometry helpers
 * ------------------------------------------------------------------ */

const W = 900;
const H = 410;
const MIN_K = 1;
const MAX_K = 5;

export type Camera = { k: number; x: number; y: number };
const HOME: Camera = { k: 1, x: 0, y: 0 };

/** Hand-placed anchors for places whose geometry centre is misleading. */
const ANCHORS: Record<string, [number, number]> = {
  CN: [713, 131],
  US: [211, 119],
  EU: [478, 80],
  FR: [455, 98],
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
  RU: [640, 62],
};
/** Labels that read better on the left of their marker to avoid collisions. */
const LABEL_LEFT = new Set(["FR", "GB", "US", "IN"]);
const ALIAS: Record<string, string> = { TW: "CN", HK: "CN", MO: "CN" };

type Box = { x0: number; y0: number; x1: number; y1: number };

/** Bounding box of each country's largest ring (ignores far-flung islands). */
let mainBoxes: Map<string, Box> | null = null;
function getMainBoxes() {
  if (mainBoxes) return mainBoxes;
  const boxes = new Map<string, Box>();
  for (const shape of worldPaths) {
    const code = ALIAS[shape.code] ?? shape.code;
    if (ALIAS[shape.code]) continue;
    for (const ring of shape.path.split("M")) {
      if (!ring) continue;
      const nums = ring.match(/-?\d+(?:\.\d+)?/g);
      if (!nums || nums.length < 6) continue;
      let x0 = Infinity,
        y0 = Infinity,
        x1 = -Infinity,
        y1 = -Infinity;
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const x = +nums[i];
        const y = +nums[i + 1];
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
      const prev = boxes.get(code);
      if (!prev || (x1 - x0) * (y1 - y0) > (prev.x1 - prev.x0) * (prev.y1 - prev.y0))
        boxes.set(code, { x0, y0, x1, y1 });
    }
  }
  mainBoxes = boxes;
  return boxes;
}

export function anchorOf(code: string): [number, number] | null {
  if (ANCHORS[code]) return ANCHORS[code];
  const box = getMainBoxes().get(code);
  return box ? [(box.x0 + box.x1) / 2, (box.y0 + box.y1) / 2] : null;
}

function clampCamera(cam: Camera): Camera {
  const k = Math.min(MAX_K, Math.max(MIN_K, cam.k));
  return {
    k,
    x: Math.min(0, Math.max(W - W * k, cam.x)),
    y: Math.min(0, Math.max(H - H * k, cam.y)),
  };
}

function cameraFor(code: string, intent: "event" | "country"): Camera {
  const point = anchorOf(code);
  if (!point) return HOME;
  const box = getMainBoxes().get(code);
  let k = intent === "event" ? 2.6 : 2.2;
  if (box) {
    const fit = Math.min(
      W / ((box.x1 - box.x0) * 2.6),
      H / ((box.y1 - box.y0) * 2.6),
    );
    k = Math.min(intent === "event" ? 3.2 : 3, Math.max(1.35, fit));
  }
  return clampCamera({ k, x: W / 2 - point[0] * k, y: H / 2 - point[1] * k });
}

/* ------------------------------------------------------------------ */

export type MapFocus = {
  code: string;
  intent: "event" | "country";
  seq: number;
} | null;

export type OrgTone = "gpai" | "waico" | "joint" | "other";
/** Extra tones used by the enterprise view. */
export type MapTone = OrgTone | "market" | "home";

export function countryTone(country?: Country): OrgTone {
  if (!country) return "other";
  if (country.bloc === "共同成员") return "joint";
  if (country.bloc === "GPAI") return "gpai";
  if (country.bloc === "WAICO") return "waico";
  return "other";
}

type Tip =
  | {
      kind: "country";
      code: string;
      name: string;
      x: number;
      y: number;
      flip: boolean;
    }
  | { kind: "marker"; code: string; x: number; y: number; flip: boolean };

export function AtlasMap({
  countries,
  events,
  bloc,
  emphasis,
  focus,
  selectedCode,
  hotCode,
  onCountry,
  onHoverCode,
  eventOrgTone,
  toneFor,
  homeCode,
  homeLabel = "注册地",
}: {
  countries: Country[];
  events: Signal[];
  bloc: string;
  emphasis: OrgTone | null;
  focus: MapFocus;
  selectedCode: string | null;
  hotCode: string | null;
  onCountry: (code: string) => void;
  onHoverCode?: (code: string | null) => void;
  eventOrgTone: (event: Signal) => MapTone;
  /** Override country colouring (enterprise view). */
  toneFor?: (country: Country) => MapTone | null;
  /** Draw a registration-site ring on this country. */
  homeCode?: string;
  homeLabel?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [manual, setManual] = useState<{ key: string; cam: Camera } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);
  const [hint, setHint] = useState(false);
  // Keep markers a constant on-screen size however large the SVG renders.
  const [markerScale, setMarkerScale] = useState(1);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const ro = new ResizeObserver(() => {
      const rect = svg.getBoundingClientRect();
      const s = Math.min(rect.width / W, rect.height / H);
      if (s > 0) setMarkerScale(Math.min(1.8, Math.max(0.7, 1.08 / s)));
    });
    ro.observe(svg);
    return () => ro.disconnect();
  }, []);
  const hintTimer = useRef<number | null>(null);

  const focusKey = focus ? `${focus.code}:${focus.intent}:${focus.seq}` : "home";
  const focusCam = useMemo(
    () => (focus ? cameraFor(focus.code, focus.intent) : HOME),
    [focus],
  );
  const cam = manual && manual.key === focusKey ? manual.cam : focusCam;
  const camRef = useRef(cam);
  useEffect(() => {
    camRef.current = cam;
  }, [cam]);

  const countryMap = useMemo(
    () => new Map(countries.map((c) => [c.code, c])),
    [countries],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Signal[]>();
    for (const event of events) {
      if (!anchorOf(event.country)) continue;
      const list = map.get(event.country) ?? [];
      list.push(event);
      map.set(event.country, list);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [events]);
  const groupMap = useMemo(() => new Map(groups), [groups]);

  /* ---------- camera controls ---------- */

  const toViewBox = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: W / 2, y: H / 2 };
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const p = point.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }, []);

  const zoomAt = useCallback(
    (factor: number, vx = W / 2, vy = H / 2) => {
      const c = camRef.current;
      const k = Math.min(MAX_K, Math.max(MIN_K, c.k * factor));
      const wx = (vx - c.x) / c.k;
      const wy = (vy - c.y) / c.k;
      setManual({
        key: focusKey,
        cam: clampCamera({ k, x: vx - wx * k, y: vy - wy * k }),
      });
    },
    [focusKey],
  );

  // Pinch / ⌘+wheel zooms; a plain wheel scrolls the page and shows a hint.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const p = toViewBox(event.clientX, event.clientY);
        zoomAt(Math.exp(-event.deltaY * 0.01), p.x, p.y);
        return;
      }
      setHint(true);
      if (hintTimer.current) window.clearTimeout(hintTimer.current);
      hintTimer.current = window.setTimeout(() => setHint(false), 1400);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      if (hintTimer.current) window.clearTimeout(hintTimer.current);
    };
  }, [toViewBox, zoomAt]);

  const drag = useRef<{
    x: number;
    y: number;
    cam: Camera;
    moved: boolean;
    scale: number;
  } | null>(null);
  const suppressClick = useRef(false);

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0 || event.pointerType === "touch") return;
    const ctm = svgRef.current?.getScreenCTM();
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      cam: camRef.current,
      moved: false,
      scale: ctm ? 1 / ctm.a : 1,
    };
  };
  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.x;
    const dy = event.clientY - d.y;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 5 || d.cam.k <= 1.001) return;
      d.moved = true;
      setDragging(true);
      setTip(null);
      svgRef.current?.setPointerCapture(event.pointerId);
    }
    setManual({
      key: focusKey,
      cam: clampCamera({
        k: d.cam.k,
        x: d.cam.x + dx * d.scale,
        y: d.cam.y + dy * d.scale,
      }),
    });
  };
  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      suppressClick.current = true;
      window.setTimeout(() => (suppressClick.current = false), 0);
      setDragging(false);
      if (svgRef.current?.hasPointerCapture(event.pointerId))
        svgRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const tipAt = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    return rect
      ? {
          x: clientX - rect.left,
          y: clientY - rect.top,
          flip: clientX - rect.left > rect.width - 290,
        }
      : { x: 0, y: 0, flip: false };
  };

  const pick = (code: string) => {
    if (suppressClick.current) return;
    onCountry(code);
  };

  const pickRef = useRef(pick);
  const tipRef = useRef<(tip: Tip | null) => void>(() => {});
  const hoverRef = useRef(onHoverCode);
  useEffect(() => {
    pickRef.current = pick;
    hoverRef.current = onHoverCode;
    tipRef.current = (next) => {
      if (drag.current?.moved) return;
      setTip(next);
    };
  });
  // Translate client coordinates for the memoized layer.
  const tipAtRef = useRef(tipAt);
  useEffect(() => {
    tipAtRef.current = tipAt;
  });

  const camTransform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.k})`;
  const tipGroup = tip ? groupMap.get(tip.code) : undefined;
  const tipCountry = tip ? countryMap.get(tip.code) : undefined;

  return (
    <div
      ref={stageRef}
      className={`atlas-map ${dragging ? "is-dragging" : ""} ${cam.k > 1.01 ? "is-zoomed" : ""}`}
      data-emphasis={emphasis ?? undefined}
      data-bloc={bloc}
      onPointerLeave={() => setTip(null)}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="atlas-svg"
        role="group"
        aria-label="全球国家 AI 治理关系交互地图，点击国家或事件点查看详情"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <pattern
            id="atlas-dots"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".6" fill="#d9e2ee" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#atlas-dots)" opacity=".7" />
        <g className="atlas-camera" style={{ transform: camTransform }}>
          <CountryLayer
            countryMap={countryMap}
            bloc={bloc}
            toneFor={toneFor}
            selectedCode={selectedCode}
            hotCode={hotCode}
            onPick={pickRef}
            tipAt={tipAtRef}
            onTip={tipRef}
            onHover={hoverRef}
          />
        </g>

        {/* Markers live in screen space so they stay crisp at any zoom. */}
        <g className="atlas-markers">
          {homeCode && anchorOf(homeCode) ? (
            <g
              className="atlas-home"
              style={{
                transform: `translate(${anchorOf(homeCode)![0] * cam.k + cam.x}px, ${anchorOf(homeCode)![1] * cam.k + cam.y}px) scale(${markerScale})`,
              }}
              aria-hidden
            >
              <circle className="atlas-home-ring" r="17" />
              <g transform="translate(0, 30)">
                <rect x="-22" y="-9" width="44" height="18" rx="9" />
                <text textAnchor="middle" dy="0.35em">
                  {homeLabel}
                </text>
              </g>
            </g>
          ) : null}
          {groups.map(([code, list], index) => {
            const [ax, ay] = anchorOf(code)!;
            const x = ax * cam.k + cam.x;
            const y = ay * cam.k + cam.y;
            const tone = eventOrgTone(list[0]);
            const r = 4 + Math.min(5, Math.sqrt(list.length) * 1.5);
            const left = LABEL_LEFT.has(code);
            const name = list[0].countryName;
            const selected = selectedCode === code;
            return (
              <g
                key={code}
                className={`atlas-marker tone-${tone} ${selected ? "is-selected" : ""} ${hotCode === code ? "is-hot" : ""}`}
                style={{
                  transform: `translate(${x}px, ${y}px) scale(${markerScale})`,
                }}
                role="button"
                tabIndex={0}
                aria-label={`${name}，${list.length} 条动态`}
                aria-pressed={selected}
                onClick={() => pick(code)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onCountry(code);
                  }
                }}
                onPointerEnter={(event) => {
                  onHoverCode?.(code);
                  const p = tipAt(event.clientX, event.clientY);
                  setTip({ kind: "marker", code, ...p });
                }}
                onPointerMove={(event) => {
                  event.stopPropagation();
                  if (drag.current?.moved) return;
                  const p = tipAt(event.clientX, event.clientY);
                  setTip({ kind: "marker", code, ...p });
                }}
                onPointerLeave={() => {
                  onHoverCode?.(null);
                  setTip(null);
                }}
              >
                <g
                  className="atlas-marker-body"
                  style={{ animationDelay: `${180 + index * 55}ms` }}
                >
                  <circle className="atlas-marker-hit" r={r + 9} />
                  {selected ? (
                    <>
                      <circle className="atlas-marker-pulse" r={r + 2} />
                      <circle
                        className="atlas-marker-pulse is-late"
                        r={r + 2}
                      />
                    </>
                  ) : null}
                  <circle className="atlas-marker-halo" r={r + 5} />
                  <circle className="atlas-marker-core" r={r} />
                  <g
                    className="atlas-marker-label"
                    transform={`translate(${left ? -(r + 6) : r + 6}, 0)`}
                  >
                    <text textAnchor={left ? "end" : "start"} dy="0.35em">
                      {name}
                      <tspan className="atlas-marker-count" dx="4">
                        {list.length}
                      </tspan>
                    </text>
                  </g>
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {tip && !dragging ? (
        <div
          className={`atlas-tip ${tip.flip ? "is-flipped" : ""}`}
          style={{ left: tip.x, top: tip.y }}
          role="presentation"
        >
          <div className="atlas-tip-head">
            <i className={`tone-${countryTone(tipCountry)}`} />
            <strong>
              {tip.kind === "country"
                ? tipCountry?.name ?? tip.name
                : tipGroup?.[0].countryName}
            </strong>
            {tipCountry ? <span>{tipCountry.bloc}</span> : null}
          </div>
          {tipGroup?.length ? (
            <>
              <p>{tipGroup[0].title}</p>
              <em>
                {tipGroup.length} 条动态 · 点击查看
              </em>
            </>
          ) : tipCountry ? (
            <em>暂无当前筛选下的动态 · 点击查看国家画像</em>
          ) : (
            <em>未建档</em>
          )}
        </div>
      ) : null}

      <div className={`atlas-hint ${hint ? "is-visible" : ""}`} aria-hidden>
        按住 ⌘ / Ctrl 滚动缩放{cam.k > 1.01 ? "，拖动平移" : ""}
      </div>

      <div className="atlas-zoom" role="group" aria-label="地图缩放">
        <button aria-label="放大地图" onClick={() => zoomAt(1.5)}>
          <Plus size={16} aria-hidden />
        </button>
        <button aria-label="缩小地图" onClick={() => zoomAt(1 / 1.5)}>
          <Minus size={16} aria-hidden />
        </button>
        <button
          aria-label="回到全球视图"
          onClick={() => setManual({ key: focusKey, cam: HOME })}
          disabled={cam.k <= 1.001}
        >
          <LocateFixed size={15} aria-hidden />
        </button>
      </div>
    </div>
  );
}

type Ref<T> = { current: T };
const CountryLayer = memo(function CountryLayer({
  countryMap,
  bloc,
  toneFor,
  selectedCode,
  hotCode,
  onPick,
  onTip,
  onHover,
  tipAt,
}: {
  countryMap: Map<string, Country>;
  bloc: string;
  toneFor?: (country: Country) => MapTone | null;
  selectedCode: string | null;
  hotCode: string | null;
  onPick: Ref<(code: string) => void>;
  onTip: Ref<(tip: Tip | null) => void>;
  onHover: Ref<((code: string | null) => void) | undefined>;
  tipAt: Ref<
    (x: number, y: number) => { x: number; y: number; flip: boolean }
  >;
}) {
  return (
    <>
      {worldPaths.map((shape) => {
        const code = ALIAS[shape.code] ?? shape.code;
        const country = countryMap.get(code);
        const override = country && toneFor ? toneFor(country) : undefined;
        const tone = override ?? countryTone(country);
        const inScope =
          !!country &&
          override !== null &&
          (bloc === "全部" || country.organizations.includes(bloc));
        const name = country?.name ?? shape.name;
        return (
          <path
            key={`${shape.code}-${shape.name}`}
            d={shape.path}
            data-code={code}
            className={[
              "atlas-country",
              inScope ? `tone-${tone}` : "tone-none",
              country ? "is-known" : "",
              selectedCode === code ? "is-selected" : "",
              hotCode === code ? "is-hot" : "",
            ].join(" ")}
            onClick={() => country && onPick.current(code)}
            onPointerMove={(event) => {
              const p = tipAt.current(event.clientX, event.clientY);
              onTip.current({ kind: "country", code, name, ...p });
            }}
            onPointerEnter={() => country && onHover.current?.(code)}
            onPointerLeave={() => {
              onTip.current(null);
              onHover.current?.(null);
            }}
            role={country ? "button" : undefined}
            tabIndex={country ? 0 : undefined}
            aria-label={
              country ? `${name}，${country.bloc}，查看国家画像` : undefined
            }
            onKeyDown={(event) => {
              if (country && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onPick.current(code);
              }
            }}
          />
        );
      })}
    </>
  );
});
