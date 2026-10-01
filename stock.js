let originalCatalogue = [];
let workingCatalogue = [];
let currentQuery = "";

const elements = {
  rows: document.querySelector("#stock-rows"),
  summary: document.querySelector("#stock-summary"),
  message: document.querySelector("#admin-message"),
  export: document.querySelector("#export-stock"),
  reload: document.querySelector("#reload-stock"),
  reset: document.querySelector("#reset-stock"),
  file: document.querySelector("#stock-file"),
  search: document.querySelector("#stock-search"),
  allOne: document.querySelector("#all-one"),
  allUnlimited: document.querySelector("#all-unlimited")
};

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function formatPrice(value) {
  const number = Number(value);
  return `${Number.isFinite(number) ? number.toLocaleString("fr-FR") : "0"} PA`;
}

function validateCatalogue(data) {
  if (!Array.isArray(data)) throw new Error("Le fichier doit contenir un tableau JSON d’objets.");

  const seen = new Set();
  const duplicates = [];
  data.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Entrée ${index + 1} invalide : un objet JSON est attendu.`);
    }
    if (!item.id) throw new Error(`Entrée ${index + 1} sans id. Chaque objet du catalogue doit avoir un id stable.`);
    const id = String(item.id);
    if (seen.has(id)) duplicates.push(id);
    seen.add(id);
  });

  if (duplicates.length) {
    throw new Error(`ID dupliqué dans le catalogue : ${[...new Set(duplicates)].join(", ")}.`);
  }

  return data;
}

function setCatalogue(data, sourceLabel) {
  validateCatalogue(data);
  originalCatalogue = clone(data);
  workingCatalogue = clone(data);
  enableControls(true);
  renderRows();
  setMessage(`${workingCatalogue.length} objet${workingCatalogue.length > 1 ? "s" : ""} chargé${workingCatalogue.length > 1 ? "s" : ""} depuis ${sourceLabel}.`);
}

async function loadDefaultCatalogue() {
  setMessage("Chargement de catalogue.json…");
  try {
    const response = await fetch("catalogue.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    setCatalogue(data, "catalogue.json");
  } catch (error) {
    console.error(error);
    workingCatalogue = [];
    originalCatalogue = [];
    enableControls(false);
    renderRows();
    setMessage("Impossible de charger catalogue.json automatiquement. Importe le fichier avec le bouton ci-dessus si la page est ouverte directement depuis ton ordinateur.", true);
  }
}

function enableControls(enabled) {
  elements.export.disabled = !enabled;
  elements.reset.disabled = !enabled;
  elements.allOne.disabled = !enabled;
  elements.allUnlimited.disabled = !enabled;
}

function setMessage(message, isError = false) {
  elements.message.textContent = message;
  elements.message.classList.toggle("is-error", isError);
}

function stockValue(item) {
  if (item.stock === null || item.stock === undefined || item.stock === "") return null;
  const value = Number(item.stock);
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : null;
}

function filteredCatalogue() {
  if (!currentQuery.trim()) return workingCatalogue;
  const query = normalize(currentQuery);
  return workingCatalogue.filter(item => [item.name, item.category, item.subcategory, item.rarity, item.id]
    .some(value => normalize(value).includes(query)));
}

function renderRows() {
  const items = filteredCatalogue();
  const finiteCount = workingCatalogue.filter(item => stockValue(item) !== null).length;
  const soldOutCount = workingCatalogue.filter(item => stockValue(item) === 0).length;
  elements.summary.textContent = workingCatalogue.length
    ? ` · ${workingCatalogue.length} objets · ${finiteCount} stocks définis${soldOutCount ? ` · ${soldOutCount} épuisé${soldOutCount > 1 ? "s" : ""}` : ""}`
    : "";

  if (!workingCatalogue.length) {
    elements.rows.innerHTML = `<tr><td colspan="3">Aucun catalogue chargé.</td></tr>`;
    return;
  }

  if (!items.length) {
    elements.rows.innerHTML = `<tr><td colspan="3">Aucun objet ne correspond à la recherche.</td></tr>`;
    return;
  }

  elements.rows.innerHTML = items.map(item => {
    const stock = stockValue(item);
    return `
      <tr>
        <td class="stock-table__name">
          <strong>${escapeHTML(item.name || item.id)}</strong>
          <span>${escapeHTML(item.category || "Sans catégorie")} · ${escapeHTML(item.rarity || "")}</span>
        </td>
        <td>${formatPrice(item.price)}</td>
        <td>
          <div class="stock-control">
            <button class="icon-button" type="button" data-stock-action="minus" data-id="${escapeHTML(item.id)}" aria-label="Retirer un exemplaire">−</button>
            <input type="number" min="0" step="1" value="${stock === null ? "" : stock}" placeholder="∞" data-stock-input="${escapeHTML(item.id)}" aria-label="Stock de ${escapeHTML(item.name || item.id)}" />
            <button class="icon-button" type="button" data-stock-action="plus" data-id="${escapeHTML(item.id)}" aria-label="Ajouter un exemplaire">+</button>
            <button class="button button--small button--ghost" type="button" data-stock-action="zero" data-id="${escapeHTML(item.id)}">0</button>
          </div>
          <div class="stock-unlimited">Champ vide = illimité</div>
        </td>
      </tr>`;
  }).join("");
}

function itemById(id) {
  return workingCatalogue.find(item => String(item.id) === String(id));
}

function writeStock(item, value) {
  if (!item) return;
  if (value === null || value === "" || !Number.isFinite(Number(value))) {
    delete item.stock;
  } else {
    item.stock = Math.max(0, Math.floor(Number(value)));
  }
}

function changeStock(id, delta) {
  const item = itemById(id);
  if (!item) return;
  const current = stockValue(item);
  const base = current === null ? 0 : current;
  writeStock(item, Math.max(0, base + delta));
  renderRows();
}

function setAllStocks(value) {
  workingCatalogue.forEach(item => writeStock(item, value));
  renderRows();
  setMessage(value === null ? "Tous les stocks sont maintenant non limités." : `Tous les stocks ont été mis à ${value}.`);
}

function resetCatalogue() {
  workingCatalogue = clone(originalCatalogue);
  renderRows();
  setMessage("Modifications annulées.");
}

function exportCatalogue() {
  if (!workingCatalogue.length) return;
  const json = `${JSON.stringify(workingCatalogue, null, 2)}\n`;
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "catalogue.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setMessage("catalogue.json exporté. Remplace le fichier du site par cette version pour publier le nouveau stock.");
}

async function importFile(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    setCatalogue(data, file.name);
  } catch (error) {
    console.error(error);
    setMessage(`Import impossible : ${error.message || error}`, true);
  } finally {
    elements.file.value = "";
  }
}

elements.rows.addEventListener("click", event => {
  const button = event.target.closest("[data-stock-action]");
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.stockAction;
  if (action === "minus") changeStock(id, -1);
  if (action === "plus") changeStock(id, 1);
  if (action === "zero") {
    writeStock(itemById(id), 0);
    renderRows();
  }
});

elements.rows.addEventListener("change", event => {
  const input = event.target.closest("[data-stock-input]");
  if (!input) return;
  writeStock(itemById(input.dataset.stockInput), input.value);
  renderRows();
});

elements.search.addEventListener("input", event => {
  currentQuery = event.target.value;
  renderRows();
});

elements.file.addEventListener("change", event => importFile(event.target.files?.[0]));
elements.export.addEventListener("click", exportCatalogue);
elements.reload.addEventListener("click", loadDefaultCatalogue);
elements.reset.addEventListener("click", resetCatalogue);
elements.allOne.addEventListener("click", () => setAllStocks(1));
elements.allUnlimited.addEventListener("click", () => setAllStocks(null));

loadDefaultCatalogue();
