let catalogue = [];
let stockMap = new Map();
let currentQuery = "";
let db = null;
let currentUser = null;

const elements = {
  rows: document.querySelector("#stock-rows"),
  summary: document.querySelector("#stock-summary"),
  message: document.querySelector("#admin-message"),
  reload: document.querySelector("#reload-stock"),
  search: document.querySelector("#stock-search"),
  allOne: document.querySelector("#all-one"),
  allUnlimited: document.querySelector("#all-unlimited"),
  loginForm: document.querySelector("#login-form"),
  loginEmail: document.querySelector("#login-email"),
  loginPassword: document.querySelector("#login-password"),
  loginButton: document.querySelector("#login-button"),
  sessionPanel: document.querySelector("#session-panel"),
  sessionUser: document.querySelector("#session-user"),
  logout: document.querySelector("#logout-button")
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

function formatPrice(value) {
  const number = Number(value);
  return `${Number.isFinite(number) ? number.toLocaleString("fr-FR") : "0"} PA`;
}

function setMessage(message, isError = false) {
  elements.message.textContent = message;
  elements.message.classList.toggle("is-error", isError);
}

function initSupabase() {
  const config = window.ALARIC_SUPABASE_CONFIG || {};
  if (!config.url || !config.publishableKey) throw new Error("Configuration Supabase absente.");
  if (!window.supabase?.createClient) throw new Error("La bibliothèque Supabase n’a pas pu être chargée.");
  db = window.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
}

async function loadCatalogue() {
  const response = await fetch("catalogue.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`Impossible de charger catalogue.json (HTTP ${response.status}).`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("catalogue.json doit contenir un tableau d’objets.");
  catalogue = data.filter(item => item && item.id).map(item => ({ ...item, id: String(item.id) }));
}

async function loadStocks({ announce = true } = {}) {
  if (!db) return;
  const { data, error } = await db.from("stocks").select("item_id, stock");
  if (error) throw error;

  stockMap = new Map();
  (data || []).forEach(row => {
    const value = Number(row.stock);
    if (Number.isFinite(value)) stockMap.set(String(row.item_id), Math.max(0, Math.floor(value)));
  });

  renderRows();
  if (announce) setMessage(`Stocks synchronisés avec Supabase · ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}.`);
}

function stockValue(item) {
  return stockMap.has(item.id) ? stockMap.get(item.id) : null;
}

function filteredCatalogue() {
  if (!currentQuery.trim()) return catalogue;
  const query = normalize(currentQuery);
  return catalogue.filter(item => [item.name, item.category, item.subcategory, item.rarity, item.id]
    .some(value => normalize(value).includes(query)));
}

function renderAuth() {
  const loggedIn = Boolean(currentUser);
  elements.loginForm.hidden = loggedIn;
  elements.sessionPanel.hidden = !loggedIn;
  elements.sessionUser.textContent = loggedIn ? `Connecté : ${currentUser.email || "MJ"}` : "";
  elements.allOne.disabled = !loggedIn || !catalogue.length;
  elements.allUnlimited.disabled = !loggedIn || !catalogue.length;
}

function renderRows() {
  const items = filteredCatalogue();
  const finiteCount = catalogue.filter(item => stockValue(item) !== null).length;
  const soldOutCount = catalogue.filter(item => stockValue(item) === 0).length;
  elements.summary.textContent = catalogue.length
    ? ` · ${catalogue.length} objets · ${finiteCount} stocks définis${soldOutCount ? ` · ${soldOutCount} épuisé${soldOutCount > 1 ? "s" : ""}` : ""}`
    : "";

  if (!catalogue.length) {
    elements.rows.innerHTML = `<tr><td colspan="3">Aucun catalogue chargé.</td></tr>`;
    return;
  }
  if (!items.length) {
    elements.rows.innerHTML = `<tr><td colspan="3">Aucun objet ne correspond à la recherche.</td></tr>`;
    return;
  }

  const disabled = currentUser ? "" : "disabled";
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
            <button class="icon-button" type="button" data-stock-action="minus" data-id="${escapeHTML(item.id)}" ${disabled} aria-label="Retirer un exemplaire">−</button>
            <input type="number" min="0" step="1" value="${stock === null ? "" : stock}" placeholder="∞" data-stock-input="${escapeHTML(item.id)}" ${disabled} aria-label="Stock de ${escapeHTML(item.name || item.id)}" />
            <button class="icon-button" type="button" data-stock-action="plus" data-id="${escapeHTML(item.id)}" ${disabled} aria-label="Ajouter un exemplaire">+</button>
            <button class="button button--small button--ghost" type="button" data-stock-action="zero" data-id="${escapeHTML(item.id)}" ${disabled}>0</button>
            <button class="button button--small button--ghost" type="button" data-stock-action="unlimited" data-id="${escapeHTML(item.id)}" ${disabled}>∞</button>
          </div>
          <div class="stock-unlimited">${stock === null ? "Stock illimité" : `Quantité publiée : ${stock}`}</div>
        </td>
      </tr>`;
  }).join("");
}

async function saveStock(id, value) {
  if (!currentUser) {
    setMessage("Connecte-toi avec le compte MJ pour modifier le stock.", true);
    return false;
  }

  try {
    if (value === null) {
      const { error } = await db.from("stocks").delete().eq("item_id", id);
      if (error) throw error;
      stockMap.delete(id);
    } else {
      const stock = Math.max(0, Math.floor(Number(value) || 0));
      const { error } = await db.from("stocks").upsert({ item_id: id, stock }, { onConflict: "item_id" });
      if (error) throw error;
      stockMap.set(id, stock);
    }
    renderRows();
    setMessage("Stock enregistré dans Supabase.");
    return true;
  } catch (error) {
    console.error(error);
    setMessage(`Modification impossible : ${error.message || error}`, true);
    return false;
  }
}

async function changeStock(id, delta) {
  const current = stockMap.has(id) ? stockMap.get(id) : null;
  const base = current === null ? 0 : current;
  await saveStock(id, Math.max(0, base + delta));
}

async function setAllStocks(value) {
  if (!currentUser || !catalogue.length) return;
  try {
    const ids = catalogue.map(item => item.id);
    if (value === null) {
      const { error } = await db.from("stocks").delete().in("item_id", ids);
      if (error) throw error;
      ids.forEach(id => stockMap.delete(id));
    } else {
      const rows = ids.map(item_id => ({ item_id, stock: Math.max(0, Math.floor(Number(value) || 0)) }));
      const { error } = await db.from("stocks").upsert(rows, { onConflict: "item_id" });
      if (error) throw error;
      rows.forEach(row => stockMap.set(row.item_id, row.stock));
    }
    renderRows();
    setMessage(value === null ? "Tous les objets sont maintenant en stock illimité." : `Tous les stocks ont été mis à ${value}.`);
  } catch (error) {
    console.error(error);
    setMessage(`Modification globale impossible : ${error.message || error}`, true);
  }
}

async function login(event) {
  event.preventDefault();
  const email = elements.loginEmail.value.trim();
  const password = elements.loginPassword.value;
  if (!email || !password) return;

  elements.loginButton.disabled = true;
  setMessage("Connexion MJ…");
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  elements.loginButton.disabled = false;
  elements.loginPassword.value = "";

  if (error) {
    setMessage(`Connexion refusée : ${error.message}`, true);
    return;
  }

  currentUser = data.user || null;
  renderAuth();
  renderRows();
  setMessage("Connexion MJ réussie.");
}

async function logout() {
  const { error } = await db.auth.signOut();
  if (error) {
    setMessage(`Déconnexion impossible : ${error.message}`, true);
    return;
  }
  currentUser = null;
  renderAuth();
  renderRows();
  setMessage("Déconnecté. Les stocks restent visibles en lecture seule.");
}

elements.rows.addEventListener("click", async event => {
  const button = event.target.closest("[data-stock-action]");
  if (!button || button.disabled) return;
  const id = button.dataset.id;
  const action = button.dataset.stockAction;
  if (action === "minus") await changeStock(id, -1);
  if (action === "plus") await changeStock(id, 1);
  if (action === "zero") await saveStock(id, 0);
  if (action === "unlimited") await saveStock(id, null);
});

elements.rows.addEventListener("change", async event => {
  const input = event.target.closest("[data-stock-input]");
  if (!input || input.disabled) return;
  const value = input.value.trim() === "" ? null : input.value;
  await saveStock(input.dataset.stockInput, value);
});

elements.search.addEventListener("input", event => {
  currentQuery = event.target.value;
  renderRows();
});

elements.loginForm.addEventListener("submit", login);
elements.logout.addEventListener("click", logout);
elements.reload.addEventListener("click", async () => {
  try {
    setMessage("Actualisation des stocks…");
    await loadStocks();
  } catch (error) {
    setMessage(`Actualisation impossible : ${error.message || error}`, true);
  }
});
elements.allOne.addEventListener("click", () => setAllStocks(1));
elements.allUnlimited.addEventListener("click", () => setAllStocks(null));

async function init() {
  try {
    initSupabase();
    await loadCatalogue();

    const { data: { session } } = await db.auth.getSession();
    currentUser = session?.user || null;
    db.auth.onAuthStateChange((_event, sessionState) => {
      currentUser = sessionState?.user || null;
      renderAuth();
      renderRows();
    });

    renderAuth();
    await loadStocks({ announce: false });
    setMessage(currentUser
      ? "Connecté au stock Supabase. Tu peux modifier les quantités."
      : "Stocks chargés en lecture seule. Connecte-toi pour les modifier.");
  } catch (error) {
    console.error(error);
    renderRows();
    setMessage(`Initialisation impossible : ${error.message || error}`, true);
  }
}

init();
