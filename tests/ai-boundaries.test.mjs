import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Compile the real server module in isolation; skip only the Next build marker.
const source = (await readFile(new URL("../lib/zenmux.ts", import.meta.url), "utf8")).replace('import "server-only";', "");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { searchIntelligence, generateStrategy, ruleStrategy, validateCompanyProfile, checkAiRateLimit } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const oldFetch = globalThis.fetch;
const originalKey = process.env.ZENMUX_API_KEY;
test.afterEach(() => {
  globalThis.fetch = oldFetch;
  if (originalKey === undefined) delete process.env.ZENMUX_API_KEY;
  else process.env.ZENMUX_API_KEY = originalKey;
});

function searchResponse(signals, citations = [], calls = 1) {
  process.env.ZENMUX_API_KEY = "unit-test-key";
  globalThis.fetch = async () => Response.json({ status: "completed", usage: { server_side_tool_usage_details: { x_search_calls: calls } }, output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify({ signals }), annotations: citations.map((url) => ({ type: "url_citation", url })) }] }] });
}

test("generated URLs absent from provider citations remain unverified candidates", async () => {
  searchResponse([{ title: "A claim", summary: "Unverified", sourceUrl: "https://x.com/example/status/123" }], ["https://x.com/i/status/999"]);
  const result = await searchIntelligence("AI");
  assert.deepEqual(result.signals, []);
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].verification, "unverified");
});

test("search keeps cited social signals, normalizes X post URLs, and drops uncited claims", async () => {
  searchResponse([
    { title: "Cited", summary: "A social signal", sourceUrl: "https://x.com/OpenAI/status/123" },
    { title: "Uncited", summary: "Do not retain", sourceUrl: "https://example.com/unverified" },
  ], ["https://x.com/i/status/123"]);
  const result = await searchIntelligence("AI");
  assert.equal(result.signals.length, 1);
  assert.equal(result.signals[0].verification, "social_signal");
  assert.equal(result.signals[0].sourceUrl, "https://x.com/i/status/123");
  assert.equal(result.candidates[0].title, "Uncited");
  assert.match(result.notice, /未完成官方文件交叉核实/);
});

test("official snapshots retain dates and social identity through rule fallback", async () => {
  delete process.env.ZENMUX_API_KEY;
  const evidence = [
    { title: "Official snapshot", url: "https://example.org/policy", summary: "Snapshot", date: "2026-01-01", sourceType: "official_snapshot", checkedAt: "2026-10-19" },
    { title: "Social claim", url: "https://x.com/i/status/123", summary: "Unverified", sourceType: "social_signal" },
  ];
  const report = await generateStrategy({ name: "Example" }, [], evidence);
  assert.equal(report.sources[0].date, "2026-01-01");
  assert.equal(report.sources[1].sourceType, "social_signal");
  assert.equal(report.mode, "rules");
});

test("a model answer without actual search activity is never presented as live search", async () => {
  searchResponse([], [], 0);
  await assert.rejects(searchIntelligence("AI"), (error) => error.code === "SEARCH_NOT_EXECUTED");
});

test("an upstream failure yields labeled rules, never an invented AI success", async () => {
  process.env.ZENMUX_API_KEY = "unit-test-key";
  globalThis.fetch = async () => new Response("upstream unavailable", { status: 503 });
  const report = await generateStrategy(validateCompanyProfile({ name: "Example", markets: ["中国", "欧盟"], dataSensitivity: "个人信息" }));
  assert.equal(report.mode, "rules");
  assert.deepEqual(report.sources, []);
  assert.match(report.notice, /暂时不可用/);
  assert.equal(report.risks[0].level, "高");
});

test("missing key uses rules without making a network request", async () => {
  delete process.env.ZENMUX_API_KEY;
  globalThis.fetch = async () => { assert.fail("network request must not run without credentials"); };
  const report = await generateStrategy({ name: "Example" });
  assert.equal(report.mode, "rules");
  assert.match(report.notice, /尚未配置/);
});

test("empty profiles are rejected and per-user search limits bound repeated paid calls", () => {
  assert.throws(() => validateCompanyProfile({}), (error) => error.code === "INVALID_PROFILE");
  const id = `test-${Date.now()}`;
  for (let i = 0; i < 3; i++) checkAiRateLimit(id, "search");
  assert.throws(() => checkAiRateLimit(id, "search"), (error) => error.status === 429);
});

test("Singapore AI aggregators receive upstream restrictions and activity-based privacy checks", () => {
  const report = ruleStrategy({ name: "VirtualCloud", headquarters: "新加坡", industry: "AI API 聚合平台", description: "中国团队，在新加坡注册，服务全球开发者", markets: ["中国", "欧盟", "美国"], dataSensitivity: "个人信息" });
  assert.match(report.summary, /新加坡注册地不自动解除/);
  assert.ok(report.recommendations.some((item) => /禁止通过备用线路绕过/.test(item.detail)));
  assert.ok(report.risks.some((item) => /不以团队国籍或注册地单独下结论/.test(item.detail)));
  assert.ok(report.risks.some((item) => /加速卡采购/.test(item.detail)));
});
