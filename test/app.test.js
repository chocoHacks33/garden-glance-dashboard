const test = require("node:test");
const assert = require("node:assert/strict");
const { plants, calculateSummary, escapeHtml, plantSummary, copyText, plantRow } = require("../app.js");

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

test("plant summaries include the useful care details", () => {
  assert.equal(
    plantSummary(plants[0]),
    "Monstera — Tropical in Living room; 62% moisture; health: Thriving."
  );
});

test("copy text uses the Clipboard API when available", async () => {
  const copied = [];
  await copyText("care summary", { clipboard: { writeText: async (text) => copied.push(text) } });
  assert.deepEqual(copied, ["care summary"]);
});

test("plant rows expose a specifically labelled copy action", () => {
  const row = plantRow(plants[0]);
  assert.match(row, /data-copy-plant="1"/);
  assert.match(row, /aria-label="Copy care summary for Monstera"/);
});
