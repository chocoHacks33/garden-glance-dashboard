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

function normalizeMoistureThreshold(value, fallback = 35) {
  if (value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(80, Math.max(10, Math.round(parsed / 5) * 5)) : fallback;
}

function readMoistureThreshold(storage, fallback = 35) {
  try {
    return normalizeMoistureThreshold(storage.getItem("garden-glance-moisture-threshold"), fallback);
  } catch {
    return fallback;
  }
}

function getDryPlants(items, threshold) {
  return items.filter((plant) => plant.moisture <= threshold).sort((a, b) => a.moisture - b.moisture || a.name.localeCompare(b.name));
}

function renderMoistureAlerts(items, threshold, documentRef) {
  const dryPlants = getDryPlants(items, threshold);
  documentRef.querySelector("#threshold-value").textContent = `${threshold}%`;
  documentRef.querySelector("#moisture-alerts").innerHTML = dryPlants.length
    ? dryPlants.map((plant) => `<li>${escapeHtml(plant.name)} · ${plant.moisture}%</li>`).join("")
    : '<li class="all-clear">All plants are above the threshold.</li>';
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
    const input = document.querySelector("#moisture-threshold");
    const threshold = readMoistureThreshold(window.localStorage);
    input.value = threshold;
    renderDashboard(plants, document);
    renderMoistureAlerts(plants, threshold, document);
    input.addEventListener("input", () => {
      const nextThreshold = normalizeMoistureThreshold(input.value);
      try { window.localStorage.setItem("garden-glance-moisture-threshold", nextThreshold); } catch { /* Continue without persistence. */ }
      renderMoistureAlerts(plants, nextThreshold, document);
    });
  });
}

if (typeof module !== "undefined") {
  module.exports = { plants, calculateSummary, escapeHtml, normalizeMoistureThreshold, readMoistureThreshold, getDryPlants, plantRow };
}
