// Run as the project owner: node --env-file=.env.local scripts/publish-public-feed.mjs
// Writes only windsight's public timeline. Keep the secret key local/server-side.
import fs from "node:fs";
import ts from "typescript";
import { createClient } from "@supabase/supabase-js";
const source = fs.readFileSync(
  new URL("../lib/data.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { signals } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
const snapshots = JSON.parse(
  fs.readFileSync(
    new URL("../docs/live-search-example.json", import.meta.url),
    "utf8",
  ),
);
const social = (snapshots.signals || []).map((s, i) => ({
  id: `captured-x-${i}-${s.sourceUrl.split("/").at(-1)}`,
  title: s.title,
  summary: s.summary,
  date: s.publishedAt ? s.publishedAt.slice(0, 10) : "日期待核实",
  country: /美国|United States|US/.test(s.region) ? "US" : "",
  countryName: s.region || "全球",
  category: "技术模型",
  impact: s.impact || "中",
  source: `${s.sourceName || "X"} · 已捕获检索快照`,
  sourceUrl: s.sourceUrl,
  tags: ["X 社交线索", "已捕获快照"],
  status: "待核实",
  implication:
    "这是实际 X 检索已捕获的历史线索；须回到官方原文核实，不代表本次重新检索或合规结论。",
}));
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY)
  throw new Error("Owner-only Supabase configuration is missing");
const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } },
);
const latest = JSON.parse(
  fs.readFileSync(
    new URL("../docs/latest-ai-events.json", import.meta.url),
    "utf8",
  ),
);
const rows = [...signals, ...latest, ...social].map((payload) => ({
  id: payload.id,
  payload,
  published_at: Number.isNaN(Date.parse(payload.date))
    ? null
    : new Date(payload.date).toISOString(),
  updated_at: new Date().toISOString(),
}));
const { error } = await admin
  .from("windinsight_public_events")
  .upsert(rows, { onConflict: "id" });
if (error) throw new Error(`Public feed write failed: ${error.code}`);
console.log(
  `Published ${signals.length} official snapshots, ${latest.length} new official events and ${social.length} marked social snapshots to windsight's public timeline.`,
);
