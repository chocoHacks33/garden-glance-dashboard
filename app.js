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

function toUtcDay(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function wateringPlan(items, today = new Date(), horizonDays = 7) {
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const end = start + horizonDays * 86_400_000;
  return items
    .map((plant) => ({
      name: plant.name,
      dueAt: toUtcDay(plant.lastWatered) + plant.wateringIntervalDays * 86_400_000
    }))
    .filter((entry) => entry.dueAt <= end)
    .sort((a, b) => a.dueAt - b.dueAt || a.name.localeCompare(b.name));
}

function formatCareDate(timestamp, today = new Date()) {
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (timestamp < start) return "Overdue";
  if (timestamp === start) return "Today";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", timeZone: "UTC" }).format(timestamp);
}

function renderCarePlan(items, documentRef, today = new Date()) {
  const plan = wateringPlan(items, today);
  documentRef.querySelector("#care-plan").innerHTML = plan.length
    ? plan.map((entry) => `<li><strong>${escapeHtml(entry.name)}</strong><time datetime="${new Date(entry.dueAt).toISOString().slice(0, 10)}">${formatCareDate(entry.dueAt, today)}</time></li>`).join("")
    : '<li class="empty-state">Nothing is due in the next seven days.</li>';
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
    renderCarePlan(plants, document);
  });
}

if (typeof module !== "undefined") {
  module.exports = { plants, calculateSummary, escapeHtml, toUtcDay, wateringPlan, formatCareDate, plantRow };
}
