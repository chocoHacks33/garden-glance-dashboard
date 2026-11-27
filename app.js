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

function sortPlants(items, sortBy) {
  const sorted = [...items];
  const healthRank = { "Needs attention": 0, Stable: 1, Thriving: 2 };

  switch (sortBy) {
    case "moisture-low":
      return sorted.sort((a, b) => a.moisture - b.moisture || a.name.localeCompare(b.name));
    case "moisture-high":
      return sorted.sort((a, b) => b.moisture - a.moisture || a.name.localeCompare(b.name));
    case "health":
      return sorted.sort((a, b) => (healthRank[a.health] ?? 99) - (healthRank[b.health] ?? 99) || a.name.localeCompare(b.name));
    case "name":
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
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
    const sortSelect = document.querySelector("#plant-sort");
    const updatePlantOrder = () => renderDashboard(sortPlants(plants, sortSelect.value), document);

    updatePlantOrder();
    sortSelect.addEventListener("change", updatePlantOrder);
  });
}

if (typeof module !== "undefined") {
  module.exports = { plants, calculateSummary, escapeHtml, sortPlants, plantRow };
}
