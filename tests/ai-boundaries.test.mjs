import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Compile the real server module in isolation; skip only the Next build marker.
const source = (
  await readFile(new URL("../lib/zenmux.ts", import.meta.url), "utf8")
).replace('import "server-only";', "");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
}).outputText;
const {
  searchIntelligence,
  generateStrategy,
  ruleStrategy,
  validateCompanyProfile,
  checkAiRateLimit,
} = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

const oldFetch = globalThis.fetch;
const originalKey = process.env.ZENMUX_API_KEY;
test.afterEach(() => {
  globalThis.fetch = oldFetch;
  if (originalKey === undefined) delete process.env.ZENMUX_API_KEY;
  else process.env.ZENMUX_API_KEY = originalKey;
});

function searchResponse(signals, citations = [], calls = 1) {
  process.env.ZENMUX_API_KEY = "unit-test-key";
  globalThis.fetch = async () =>
    Response.json({
      status: "completed",
      usage: { server_side_tool_usage_details: { x_search_calls: calls } },
      output: [
        {
          type: "message",
          content: [
            {
              type: "output_text",
              text: JSON.stringify({ signals }),
              annotations: citations.map((url) => ({
                type: "url_citation",
                url,
              })),
            },
          ],
        },
      ],
    });
}

test("generated URLs absent from provider citations remain unverified candidates", async () => {
  searchResponse(
    [
      {
        title: "A claim",
        summary: "Unverified",
        sourceUrl: "https://x.com/example/status/123",
      },
    ],
    ["https://x.com/i/status/999"],
  );
  const result = await searchIntelligence("AI");
  assert.deepEqual(result.signals, []);
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].verification, "unverified");
});

test("search keeps cited social signals, normalizes X post URLs, and drops uncited claims", async () => {
  searchResponse(
    [
      {
        title: "Cited",
        summary: "A social signal",
        sourceUrl: "https://x.com/OpenAI/status/123",
      },
      {
        title: "Uncited",
        summary: "Do not retain",
        sourceUrl: "https://example.com/unverified",
      },
    ],
    ["https://x.com/i/status/123"],
  );
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
    {
      title: "Official snapshot",
      url: "https://example.org/policy",
      summary: "Snapshot",
      date: "2026-01-01",
      sourceType: "official_snapshot",
      checkedAt: "2026-10-19",
    },
    {
      title: "Social claim",
      url: "https://x.com/i/status/123",
      summary: "Unverified",
      sourceType: "social_signal",
    },
  ];
  const report = await generateStrategy({ name: "Example" }, [], evidence);
  assert.equal(report.sources[0].date, "2026-01-01");
  assert.equal(report.sources[1].sourceType, "social_signal");
  assert.equal(report.mode, "rules");
});

test("a model answer without actual search activity is never presented as live search", async () => {
  searchResponse([], [], 0);
  await assert.rejects(
    searchIntelligence("AI"),
    (error) => error.code === "SEARCH_NOT_EXECUTED",
  );
});

test("an upstream failure yields labeled rules, never an invented AI success", async () => {
  process.env.ZENMUX_API_KEY = "unit-test-key";
  globalThis.fetch = async () =>
    new Response("upstream unavailable", { status: 503 });
  const report = await generateStrategy(
    validateCompanyProfile({
      name: "Example",
      markets: ["中国", "欧盟"],
      dataSensitivity: "个人信息",
    }),
  );
  assert.equal(report.mode, "rules");
  assert.deepEqual(report.sources, []);
  assert.match(report.notice, /暂时不可用/);
  assert.equal(report.risks[0].level, "高");
});

test("missing key uses rules without making a network request", async () => {
  delete process.env.ZENMUX_API_KEY;
  globalThis.fetch = async () => {
    assert.fail("network request must not run without credentials");
  };
  const report = await generateStrategy({ name: "Example" });
  assert.equal(report.mode, "rules");
  assert.match(report.notice, /尚未配置/);
});

test("empty profiles are rejected and per-user search limits bound repeated paid calls", () => {
  assert.throws(
    () => validateCompanyProfile({}),
    (error) => error.code === "INVALID_PROFILE",
  );
  const id = `test-${Date.now()}`;
  for (let i = 0; i < 3; i++) checkAiRateLimit(id, "search");
  assert.throws(
    () => checkAiRateLimit(id, "search"),
    (error) => error.status === 429,
  );
});

test("Singapore AI aggregators receive upstream restrictions and activity-based privacy checks", () => {
  const report = ruleStrategy({
    name: "VirtualCloud",
    headquarters: "新加坡",
    industry: "AI API 聚合平台",
    description: "中国团队，在新加坡注册，服务全球开发者",
    markets: ["中国", "欧盟", "美国"],
    dataSensitivity: "个人信息",
  });
  assert.match(report.summary, /新加坡注册地不自动解除/);
  assert.ok(
    report.recommendations.some((item) =>
      /禁止通过备用线路绕过/.test(item.detail),
    ),
  );
  assert.ok(
    report.risks.some((item) =>
      /不以团队国籍或注册地单独下结论/.test(item.detail),
    ),
  );
  assert.ok(report.risks.some((item) => /加速卡采购/.test(item.detail)));
});

const business = (id, name, markets, extra = {}) => ({
  id,
  name,
  description: `${name}业务说明`,
  markets,
  useCases: ["知识检索"],
  dataTypes: ["一般业务数据"],
  models: ["Qwen3"],
  stage: "试点中",
  ...extra,
});

test("business validation preserves bounded business fields and rejects ambiguous identifiers", () => {
  const profile = validateCompanyProfile({
    name: "BusinessCo",
    businesses: [
      business("cn", "境内业务", ["中国", "中国"], {
        dataTypes: ["个人信息", 123],
        stage: "unknown",
        extra: "discard",
      }),
    ],
  });
  assert.equal(profile.businesses.length, 1);
  assert.deepEqual(profile.businesses[0].markets, ["中国"]);
  assert.deepEqual(profile.businesses[0].dataTypes, ["个人信息"]);
  assert.equal(profile.businesses[0].stage, "规划中");
  assert.equal(profile.businesses[0].extra, undefined);
  assert.throws(
    () =>
      validateCompanyProfile({
        name: "Example",
        businesses: [business("dup", "A", []), business("dup", "B", [])],
      }),
    (error) => error.code === "INVALID_BUSINESSES",
  );
  assert.throws(
    () =>
      validateCompanyProfile({
        name: "Example",
        businesses: [business("empty", "", [])],
      }),
    (error) => error.code === "INVALID_BUSINESSES",
  );
  assert.throws(
    () =>
      validateCompanyProfile({
        name: "Example",
        businesses: { id: "invalid" },
      }),
    (error) => error.code === "INVALID_BUSINESSES",
  );
});

test("selected business scope includes its markets and leaves the saved company snapshot intact", async () => {
  const serverModule = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );
  const profile = validateCompanyProfile({
    name: "Multi",
    headquarters: "新加坡",
    markets: ["美国"],
    businesses: [
      business("cn", "境内服务", ["中国"]),
      business("eu", "欧洲知识库", ["欧盟"]),
    ],
  });
  assert.deepEqual(serverModule.strategyMarketCodes(profile), [
    "CN",
    "US",
    "EU",
    "SG",
  ]);
  const scoped = serverModule.selectStrategyProfile(profile, "eu");
  assert.deepEqual(
    scoped.businesses.map((entry) => entry.id),
    ["eu"],
  );
  assert.deepEqual(serverModule.strategyMarketCodes(scoped), [
    "US",
    "EU",
    "SG",
  ]);
  assert.equal(profile.businesses.length, 2);
  assert.throws(
    () => serverModule.selectStrategyProfile(profile, "missing"),
    (error) => error.code === "INVALID_BUSINESS_SELECTION",
  );
  assert.deepEqual(
    serverModule.strategyMarketCodes({
      name: "Australian",
      markets: ["Australia"],
    }),
    [],
  );
});

test("per-business rule fallback varies by data and lifecycle and retains dated matching evidence", async () => {
  delete process.env.ZENMUX_API_KEY;
  const profile = validateCompanyProfile({
    name: "Multi",
    businesses: [
      business("cn", "境内客服", ["中国"], {
        dataTypes: ["个人信息"],
        stage: "已上线",
      }),
      business("eu", "欧洲知识库", ["欧盟"]),
    ],
  });
  const evidence = [
    {
      title: "中国 Qwen 许可",
      summary: "模型许可",
      url: "https://example.org/cn",
      date: "2026-01-01",
      sourceType: "official_snapshot",
    },
    {
      title: "欧盟 AI Act",
      summary: "业务角色核验",
      url: "https://example.org/eu",
      date: "2026-02-01",
      sourceType: "official_snapshot",
    },
  ];
  const report = await generateStrategy(profile, [], evidence);
  assert.equal(report.mode, "rules");
  assert.equal(report.businessInsights.length, 2);
  assert.match(report.businessInsights[0].exposure, /个人信息或敏感数据/);
  assert.ok(
    report.businessInsights[0].actions.some((action) =>
      /服务中断预案/.test(action),
    ),
  );
  assert.deepEqual(report.businessInsights[0].sourceUrls, [
    "https://example.org/cn",
  ]);
  assert.deepEqual(report.businessInsights[1].sourceUrls, [
    "https://example.org/eu",
  ]);
  assert.equal(report.sources[1].date, "2026-02-01");
  assert.match(report.notice, /未执行实时检索/);
});

test("AI business insights keep company IDs and reject source URLs outside supplied evidence", async () => {
  process.env.ZENMUX_API_KEY = "unit-test-key";
  let sent;
  const output = {
    summary: "业务差异分析",
    recommendations: [
      { title: "核验区域", detail: "检查供应商合同", priority: "高" },
    ],
    risks: [{ title: "数据流", detail: "确认实际路径", level: "中" }],
    models: [{ name: "Qwen3", fit: "候选", caution: "核验许可" }],
    businessInsights: [
      {
        businessId: "eu",
        businessName: "伪造名称",
        exposure: "欧洲业务暴露",
        opportunity: "企业知识检索机会",
        actions: ["核对处理主体"],
        sourceUrls: [
          "https://example.org/eu",
          "https://invented.example/policy",
        ],
      },
      {
        businessId: "unknown",
        businessName: "新增业务",
        exposure: "无关",
        opportunity: "无关",
        actions: ["无关"],
        sourceUrls: [],
      },
    ],
  };
  globalThis.fetch = async (_url, init) => {
    sent = JSON.parse(init.body);
    return Response.json({
      status: "completed",
      output_text: JSON.stringify(output),
    });
  };
  const profile = validateCompanyProfile({
    name: "Multi",
    businesses: [business("eu", "欧洲知识库", ["欧盟"])],
  });
  const report = await generateStrategy(
    profile,
    [],
    [
      {
        title: "欧盟规则",
        summary: "日期快照",
        url: "https://example.org/eu",
        date: "2026-01-01",
        sourceType: "official_snapshot",
      },
    ],
  );
  assert.equal(report.mode, "ai");
  assert.equal(report.businessInsights.length, 1);
  assert.equal(report.businessInsights[0].businessName, "欧洲知识库");
  assert.deepEqual(report.businessInsights[0].sourceUrls, [
    "https://example.org/eu",
  ]);
  assert.match(sent.input, /逐项分析每个已提供业务/);
  assert.match(sent.input, /2026-01-01/);
  assert.equal(sent.tools, undefined);
});

test("incomplete AI business coverage becomes explicitly labeled business rules", async () => {
  process.env.ZENMUX_API_KEY = "unit-test-key";
  globalThis.fetch = async () =>
    Response.json({
      status: "completed",
      output_text: JSON.stringify({
        summary: "Incomplete",
        recommendations: [{ title: "A", detail: "B" }],
        risks: [{ title: "R", detail: "D" }],
        models: [{ name: "M", fit: "F" }],
        businessInsights: [],
      }),
    });
  const report = await generateStrategy(
    validateCompanyProfile({
      name: "Multi",
      businesses: [business("cn", "境内业务", ["中国"])],
    }),
  );
  assert.equal(report.mode, "rules");
  assert.equal(report.businessInsights[0].businessId, "cn");
  assert.match(report.notice, /未完整覆盖所选业务/);
});

test("public feed evidence keeps dates and never promotes an X URL to official status", async () => {
  const serverModule = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );
  const official = serverModule.publicEvidenceSnapshot(
    {
      title: "新加坡政策",
      source: "IMDA",
      sourceUrl: "https://www.imda.gov.sg/policy",
      summary: "政策快照",
      date: "2026-10-19",
      status: "已核实",
    },
    "2026-10-19T08:00:00Z",
  );
  assert.equal(official.sourceType, "official_snapshot");
  assert.equal(official.date, "2026-10-19");
  assert.equal(official.checkedAt, "2026-10-19T08:00:00Z");
  const social = serverModule.publicEvidenceSnapshot({
    title: "社媒线索",
    sourceUrl: "https://x.com/official/status/123",
    status: "已核实",
    date: "2026-10-19",
  });
  assert.equal(social.sourceType, "social_signal");
  assert.equal(
    serverModule.publicEvidenceSnapshot({
      title: "Unsafe",
      sourceUrl: "javascript:alert(1)",
    }),
    null,
  );
});
