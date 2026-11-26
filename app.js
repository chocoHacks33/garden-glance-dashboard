const plants = [
  { id: 1, name: "Monstera", type: "Tropical", location: "Living room", moisture: 62, health: "Thriving", lastWatered: "2026-11-24", wateringIntervalDays: 7 },
  { id: 2, name: "Snake plant", type: "Succulent", location: "Bedroom", moisture: 38, health: "Stable", lastWatered: "2026-11-19", wateringIntervalDays: 14 },
  { id: 3, name: "Basil", type: "Herb", location: "Kitchen", moisture: 31, health: "Needs attention", lastWatered: "2026-11-23", wateringIntervalDays: 3 },
  { id: 4, name: "Peace lily", type: "Tropical", location: "Study", moisture: 45, health: "Stable", lastWatered: "2026-11-22", wateringIntervalDays: 5 },
  { id: 5, name: "Mint", type: "Herb", location: "Kitchen", moisture: 58, health: "Thriving", lastWatered: "2026-11-24", wateringIntervalDays: 4 },
  { id: 6, name: "Aloe vera", type: "Succulent", location: "Balcony", moisture: 27, health: "Needs attention", lastWatered: "2026-11-12", wateringIntervalDays: 16 }
];

function calculateSummary(items) {
  const moistureTotal = items.reduce((sum, plant) => sum + plant.moisture, 0);
  return {
    plantCount: items.length,
    averageMoisture: items.length ? Math.round(moistureTotal / items.length) : 0,
    attentionCount: items.filter((plant) => plant.health === "Needs attention").length
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function summarizePlantTypes(items) {
  const groups = new Map();
  items.forEach((plant) => {
    const current = groups.get(plant.type) ?? { type: plant.type, count: 0, moistureTotal: 0, attentionCount: 0 };
    current.count += 1;
    current.moistureTotal += plant.moisture;
    if (plant.health === "Needs attention") current.attentionCount += 1;
    groups.set(plant.type, current);
  });
  return [...groups.values()]
    .map(({ moistureTotal, ...group }) => ({ ...group, averageMoisture: Math.round(moistureTotal / group.count) }))
    .sort((a, b) => a.type.localeCompare(b.type));
}

function typeInsightCard(group) {
  const type = escapeHtml(group.type);
  const attentionText = group.attentionCount ? `${group.attentionCount} need attention` : "All looking steady";
  return `<article class="type-insight">
    <h3>${type}</h3>
    <p>${group.count} ${group.count === 1 ? "plant" : "plants"} · ${attentionText}</p>
    <div class="moisture-track" role="progressbar" aria-label="${type} average moisture" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${group.averageMoisture}">
      <span class="moisture-fill" style="width: ${group.averageMoisture}%"></span>
    </div>
    <span class="moisture-value">${group.averageMoisture}% average</span>
  </article>`;
}

function renderTypeInsights(items, documentRef) {
  documentRef.querySelector("#type-insights").innerHTML = summarizePlantTypes(items).map(typeInsightCard).join("");
}

function plantRow(plant) {
  return `<tr>
    <td class="plant-name">${escapeHtml(plant.name)}</td>
    <td>${escapeHtml(plant.type)}</td>
    <td>${escapeHtml(plant.location)}</td>
    <td>${plant.moisture}%</td>
    <td><span class="health-badge" data-health="${escapeHtml(plant.health)}">${escapeHtml(plant.health)}</span></td>
  </tr>`;
}

function renderDashboard(items, documentRef) {
  const summary = calculateSummary(items);
  documentRef.querySelector("#plant-count").textContent = summary.plantCount;
  documentRef.querySelector("#average-moisture").textContent = `${summary.averageMoisture}%`;
  documentRef.querySelector("#attention-count").textContent = summary.attentionCount;
  documentRef.querySelector("#result-count").textContent = `${items.length} plants`;
  documentRef.querySelector("#plant-rows").innerHTML = items.map(plantRow).join("");
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    renderDashboard(plants, document);
    renderTypeInsights(plants, document);
  });
}

if (typeof module !== "undefined") {
  module.exports = { plants, calculateSummary, escapeHtml, summarizePlantTypes, typeInsightCard, plantRow };
}
