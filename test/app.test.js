const test = require("node:test");
const assert = require("node:assert/strict");
const { plants, calculateSummary, escapeHtml, summarizePlantTypes, typeInsightCard, plantRow } = require("../app.js");

test("starter data contains distinct plant records", () => {
  assert.equal(plants.length, 6);
  assert.equal(new Set(plants.map((plant) => plant.id)).size, plants.length);
});

test("summary reports count and rounded average moisture", () => {
  assert.deepEqual(calculateSummary([
    { moisture: 40, health: "Stable" },
    { moisture: 55, health: "Thriving" }
  ]), { plantCount: 2, averageMoisture: 48, attentionCount: 0 });
});

test("summary counts plants needing attention", () => {
  const summary = calculateSummary([
    { moisture: 20, health: "Needs attention" },
    { moisture: 60, health: "Thriving" }
  ]);
  assert.equal(summary.attentionCount, 1);
});

test("empty collections produce a zeroed summary", () => {
  assert.deepEqual(calculateSummary([]), { plantCount: 0, averageMoisture: 0, attentionCount: 0 });
});

test("plant rows escape user-facing text", () => {
  const row = plantRow({ name: "<Fern>", type: "A&B", location: '"Study"', moisture: 50, health: "Stable" });
  assert.match(row, /&lt;Fern&gt;/);
  assert.match(row, /A&amp;B/);
  assert.doesNotMatch(row, /<Fern>/);
});

test("escapeHtml handles all HTML-sensitive characters", () => {
  assert.equal(escapeHtml(`<>&"'`), "&lt;&gt;&amp;&quot;&#039;");
});

test("plant type insights aggregate moisture and attention status", () => {
  const insights = summarizePlantTypes(plants);
  assert.deepEqual(insights.map((group) => group.type), ["Herb", "Succulent", "Tropical"]);
  assert.deepEqual(insights.find((group) => group.type === "Herb"), {
    type: "Herb", count: 2, attentionCount: 1, averageMoisture: 45
  });
});

test("type insight cards expose an accessible progressbar", () => {
  const card = typeInsightCard({ type: "Herb & spice", count: 2, attentionCount: 0, averageMoisture: 64 });
  assert.match(card, /role="progressbar"/);
  assert.match(card, /aria-valuenow="64"/);
  assert.match(card, /Herb &amp; spice average moisture/);
});
