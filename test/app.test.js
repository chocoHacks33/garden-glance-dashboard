const test = require("node:test");
const assert = require("node:assert/strict");
const { plants, calculateSummary, escapeHtml, normalizeMoistureThreshold, readMoistureThreshold, getDryPlants, plantRow } = require("../app.js");

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

test("moisture thresholds are rounded and constrained", () => {
  assert.equal(normalizeMoistureThreshold(33), 35);
  assert.equal(normalizeMoistureThreshold(200), 80);
  assert.equal(normalizeMoistureThreshold("invalid", 40), 40);
});

test("stored moisture threshold tolerates unavailable storage", () => {
  assert.equal(readMoistureThreshold({ getItem: () => "42" }), 40);
  assert.equal(readMoistureThreshold({ getItem: () => { throw new Error("blocked"); } }), 35);
});

test("dry plants include threshold matches and sort driest first", () => {
  assert.deepEqual(getDryPlants(plants, 31).map((plant) => plant.name), ["Aloe vera", "Basil"]);
});
