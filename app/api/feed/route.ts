import {
  countries,
  organizations,
  signals as curated,
  DATA_UPDATED_AT,
  type Signal,
} from "@/lib/data";

import latestEvents from "@/docs/latest-ai-events.json";

export const runtime = "nodejs";
function normalize(value: unknown): Signal | null {
  if (!value || typeof value !== "object") return null;
  const s = value as Record<string, unknown>;
  if (
    typeof s.id !== "string" ||
    typeof s.title !== "string" ||
    typeof s.sourceUrl !== "string" ||
    !s.sourceUrl.startsWith("https://")
  )
    return null;
  const categories: Signal["category"][] = [
    "政策监管",
    "技术模型",
    "国际合作",
    "市场准入",
    "数据安全",
  ];
  return {
    id: s.id.slice(0, 160),
    title: s.title.slice(0, 300),
    summary: String(s.summary || "").slice(0, 5000),
    date: typeof s.date === "string" ? s.date.slice(0, 30) : "日期待核实",
    country: String(s.country || ""),
    countryName: String(s.countryName || "全球"),
    category: categories.includes(s.category as Signal["category"])
      ? (s.category as Signal["category"])
      : "技术模型",
    impact: ["高", "中", "低"].includes(String(s.impact))
      ? (s.impact as Signal["impact"])
      : "中",
    source: String(s.source || "公开来源").slice(0, 200),
    sourceUrl: s.sourceUrl,
    relatedSources: Array.isArray(s.relatedSources)
      ? s.relatedSources
          .flatMap((item) => {
            if (!item || typeof item !== "object") return [];
            const link = item as Record<string, unknown>;
            return typeof link.url === "string" &&
              link.url.startsWith("https://")
              ? [
                  {
                    title: String(link.title || "关联来源").slice(0, 200),
                    url: link.url,
                  },
                ]
              : [];
          })
          .slice(0, 5)
      : [],
    tags: Array.isArray(s.tags)
      ? s.tags.filter((x): x is string => typeof x === "string").slice(0, 15)
      : [],
    status: s.status === "已核实" ? "已核实" : "待核实",
    implication: String(
      s.implication || "请回到原始来源核验适用范围与企业影响。",
    ).slice(0, 5000),
  };
}
export async function GET() {
  const checkedAt = new Date().toISOString();
  let updatedAt = `${DATA_UPDATED_AT}T00:00:00.000Z`;
  let storage: "supabase" | "static_fallback" = "static_fallback";
  const latest = latestEvents
    .map(normalize)
    .filter((s): s is Signal => s !== null);
  const merged = new Map([...curated, ...latest].map((s) => [s.id, s]));
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  try {
    if (url && key) {
      const response = await fetch(
        `${url}/rest/v1/windinsight_public_events?select=payload,updated_at&order=published_at.desc&limit=150`,
        {
          headers: { apikey: key },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        },
      );
      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows)) {
          for (const row of rows) {
            const signal = normalize(row.payload);
            if (signal) merged.set(signal.id, signal);
            if (
              typeof row.updated_at === "string" &&
              row.updated_at > updatedAt
            )
              updatedAt = row.updated_at;
          }
          storage = "supabase";
        }
      }
    }
  } catch {
    /* Keep public source snapshots accessible when storage is unavailable. */
  }
  return Response.json(
    {
      signals: [...merged.values()].sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
      countries,
      organizations,
      updatedAt,
      checkedAt,
      refreshIntervalSeconds: 60,
      mode: "curated_snapshot",
      storage,
    },
    {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=30, stale-while-revalidate=60",
      },
    },
  );
}
