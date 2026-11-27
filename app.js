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

function plantSummary(plant) {
  return `${plant.name} — ${plant.type} in ${plant.location}; ${plant.moisture}% moisture; health: ${plant.health}.`;
}

async function copyText(text, navigatorRef, documentRef) {
  if (navigatorRef?.clipboard?.writeText) {
    await navigatorRef.clipboard.writeText(text);
    return;
  }

  const helper = documentRef.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  documentRef.body.append(helper);
  helper.select();
  const copied = documentRef.execCommand("copy");
  helper.remove();
  if (!copied) throw new Error("Copy command was unavailable");
}

function plantRow(plant) {
  return `<tr>
    <td class="plant-name">${escapeHtml(plant.name)}</td>
    <td>${escapeHtml(plant.type)}</td>
    <td>${escapeHtml(plant.location)}</td>
    <td>${plant.moisture}%</td>
    <td><span class="health-badge" data-health="${escapeHtml(plant.health)}">${escapeHtml(plant.health)}</span></td>
    <td><button class="copy-button" type="button" data-copy-plant="${escapeHtml(plant.id)}" aria-label="Copy care summary for ${escapeHtml(plant.name)}">Copy summary</button></td>
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
    const rows = document.querySelector("#plant-rows");
    const copyStatus = document.querySelector("#copy-status");

    renderDashboard(plants, document);
    rows.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy-plant]");
      if (!button) return;

      const plant = plants.find((item) => item.id === Number(button.dataset.copyPlant));
      if (!plant) return;

      try {
        await copyText(plantSummary(plant), navigator, document);
        copyStatus.textContent = `${plant.name} summary copied.`;
      } catch {
        copyStatus.textContent = "Could not copy the plant summary in this browser.";
      }
    });
  });
}

if (typeof module !== "undefined") {
  module.exports = { plants, calculateSummary, escapeHtml, plantSummary, copyText, plantRow };
}
