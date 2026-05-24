let ITEMS = [];

const RARITY_ORDER = [
  "Commun",
  "Peu Commun",
  "Inhabituel",
  "Rare",
  "Exceptionnel",
  "Précieux",
  "Épique",
  "Légendaire",
  "Mythique",
  "Artefact",
  "Objet Divin"
];


const RARITY_THEME_CLASS = {
  "Commun": "commun",
  "Peu Commun": "peu-commun",
  "Inhabituel": "inhabituel",
  "Rare": "rare",
  "Exceptionnel": "exceptionnel",
  "Précieux": "precieux",
  "Épique": "epique",
  "Légendaire": "legendaire",
  "Mythique": "mythique",
  "Artefact": "artefact",
  "Objet Divin": "objet-divin"
};

const CATEGORY_ORDER = ["Armes", "Armures", "Accessoires", "Potions", "Objets"];

const FALLBACK_ICONS = {
  Armes: "⚔️",
  Armures: "🛡️",
  Accessoires: "💍",
  Potions: "🧪",
  Objets: "🎒"
};

const state = {
  category: "all",
  subcategory: "all",
  rarity: "all",
  search: "",
  sort: "category-asc",
  cart: loadCart()
};

const elements = {
  grid: document.querySelector("#items-grid"),
  categoryFilters: document.querySelector("#category-filters"),
  subcategoryFilter: document.querySelector("#subcategory-filter"),
  rarityFilter: document.querySelector("#rarity-filter"),
  sortFilter: document.querySelector("#sort-filter"),
  search: document.querySelector("#search"),
  resultCount: document.querySelector("#result-count"),
  cartItems: document.querySelector("#cart-items"),
  cartEmpty: document.querySelector("#cart-empty"),
  cartTotal: document.querySelector("#cart-total"),
  copyOrder: document.querySelector("#copy-order"),
  clearCart: document.querySelector("#clear-cart"),
  toast: document.querySelector("#toast"),
  cartPanel: document.querySelector("#cart-panel"),
  openCartMobile: document.querySelector("#open-cart-mobile"),
  closeCartMobile: document.querySelector("#close-cart-mobile")
};

async function loadCatalogue() {
  const response = await fetch("catalogue.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Impossible de charger catalogue.json (${response.status})`);
  }

  const catalogue = await response.json();
  if (!Array.isArray(catalogue)) {
    throw new Error("catalogue.json doit contenir un tableau d'objets.");
  }

  ITEMS = catalogue.map(normalizeItem);
}

function normalizeItem(item) {
  return {
    id: String(item.id || crypto.randomUUID()),
    category: String(item.category || "Objets"),
    subcategory: String(item.subcategory || "Objets"),
    name: String(item.name || "Objet sans nom"),
    rarity: String(item.rarity || "Commun"),
    description: String(item.description || ""),
    price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
    icon: item.icon || FALLBACK_ICONS[item.category] || "✦",
    damage: item.damage ? String(item.damage) : "",
    damageMod: item.damageMod ? String(item.damageMod) : "",
    armorMod: item.armorMod ? String(item.armorMod) : ""
  };
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("alaric-cart")) || {};
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem("alaric-cart", JSON.stringify(state.cart));
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("fr-FR")} PA`;
}

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

function safeClass(value) {
  return normalize(value).replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");
}


function rarityThemeClass(rarity) {
  return RARITY_THEME_CLASS[rarity] || safeClass(rarity) || "commun";
}

function rarityRank(rarity) {
  const index = RARITY_ORDER.indexOf(rarity);
  return index === -1 ? RARITY_ORDER.length : index;
}

function categoryRank(category) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

function itemById(id) {
  return ITEMS.find(item => item.id === id);
}

function uniqueSorted(values, ranker) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => {
    if (ranker) return ranker(a) - ranker(b);
    return a.localeCompare(b, "fr");
  });
}

function categories() {
  return ["all", ...uniqueSorted(ITEMS.map(item => item.category), categoryRank)];
}

function subcategories() {
  const source = state.category === "all"
    ? ITEMS
    : ITEMS.filter(item => item.category === state.category);
  return ["all", ...uniqueSorted(source.map(item => item.subcategory))];
}

function rarities() {
  return ["all", ...uniqueSorted(ITEMS.map(item => item.rarity), rarityRank)];
}

function renderFilters() {
  elements.categoryFilters.innerHTML = categories().map(category => {
    const label = category === "all" ? "Tous" : category;
    const active = category === state.category ? "is-active" : "";
    return `<button class="chip ${active}" type="button" data-category="${escapeHTML(category)}">${escapeHTML(label)}</button>`;
  }).join("");

  const subcategoryOptions = subcategories();
  if (!subcategoryOptions.includes(state.subcategory)) {
    state.subcategory = "all";
  }
  elements.subcategoryFilter.innerHTML = subcategoryOptions.map(subcategory => {
    const label = subcategory === "all" ? "Toutes" : subcategory;
    const selected = subcategory === state.subcategory ? "selected" : "";
    return `<option value="${escapeHTML(subcategory)}" ${selected}>${escapeHTML(label)}</option>`;
  }).join("");

  elements.rarityFilter.innerHTML = rarities().map(rarity => {
    const label = rarity === "all" ? "Toutes" : rarity;
    const selected = rarity === state.rarity ? "selected" : "";
    return `<option value="${escapeHTML(rarity)}" ${selected}>${escapeHTML(label)}</option>`;
  }).join("");
}

function filteredItems() {
  let items = [...ITEMS];

  if (state.category !== "all") {
    items = items.filter(item => item.category === state.category);
  }

  if (state.subcategory !== "all") {
    items = items.filter(item => item.subcategory === state.subcategory);
  }

  if (state.rarity !== "all") {
    items = items.filter(item => item.rarity === state.rarity);
  }

  if (state.search.trim()) {
    const query = normalize(state.search);
    items = items.filter(item => {
      return [item.name, item.category, item.subcategory, item.rarity, item.description, item.damage, item.damageMod, item.armorMod]
        .some(value => normalize(value).includes(query));
    });
  }

  items.sort((a, b) => {
    if (state.sort === "price-asc") return a.price - b.price || a.name.localeCompare(b.name, "fr");
    if (state.sort === "price-desc") return b.price - a.price || a.name.localeCompare(b.name, "fr");
    if (state.sort === "rarity-asc") return rarityRank(a.rarity) - rarityRank(b.rarity) || a.name.localeCompare(b.name, "fr");
    if (state.sort === "rarity-desc") return rarityRank(b.rarity) - rarityRank(a.rarity) || a.name.localeCompare(b.name, "fr");
    if (state.sort === "category-asc") {
      return categoryRank(a.category) - categoryRank(b.category)
        || a.subcategory.localeCompare(b.subcategory, "fr")
        || rarityRank(a.rarity) - rarityRank(b.rarity)
        || a.name.localeCompare(b.name, "fr");
    }
    return a.name.localeCompare(b.name, "fr");
  });

  return items;
}

function iconMarkup(item) {
  const icon = item.icon || FALLBACK_ICONS[item.category] || "✦";
  const iconText = String(icon);
  const isImage = /^https?:\/\//i.test(iconText) || /\.(png|jpe?g|webp|gif|svg)$/i.test(iconText);
  if (isImage) {
    return `<img src="${escapeHTML(iconText)}" alt="" loading="lazy" />`;
  }
  return `<span aria-hidden="true">${escapeHTML(iconText)}</span>`;
}

function renderItems() {
  const items = filteredItems();
  elements.resultCount.textContent = `${items.length} marchandise${items.length > 1 ? "s" : ""}`;

  if (!items.length) {
    elements.grid.innerHTML = `
      <article class="empty-card">
        <strong>Aucune marchandise trouvée.</strong>
        <span>Alaric hausse les épaules : “Essaie une autre étagère.”</span>
      </article>
    `;
    return;
  }

  elements.grid.innerHTML = items.map(item => {
    const qty = state.cart[item.id] || 0;
    const details = [
      item.damage ? `Dégâts : ${item.damage}` : "",
      item.damageMod ? `Mod. DM : ${item.damageMod}` : "",
      item.armorMod ? `Armure : ${item.armorMod}` : ""
    ].filter(Boolean);
    const rarityTheme = rarityThemeClass(item.rarity);

    return `
      <article class="item-card item-card--${escapeHTML(rarityTheme)} rarity-${safeClass(item.rarity)}">
        <div class="item-card__top">
          <div class="item-icon">${iconMarkup(item)}</div>
          <div class="item-card__title">
            <h3>${escapeHTML(item.name)}</h3>
            <div class="item-meta">
              <span>${escapeHTML(item.category)}</span>
              <span>${escapeHTML(item.subcategory)}</span>
            </div>
          </div>
        </div>

        <div class="item-card__badges">
          <span class="rarity-badge rarity-badge--${escapeHTML(rarityTheme)}">${escapeHTML(item.rarity)}</span>
          ${qty ? `<span class="qty-badge">Panier : ${qty}</span>` : ""}
        </div>

        <p class="item-description">${escapeHTML(item.description || "Alaric garde les détails pour les clients sérieux.")}</p>

        ${details.length ? `
          <dl class="item-stats">
            ${details.map(detail => `<div><dt>${escapeHTML(detail.split(":")[0])}</dt><dd>${escapeHTML(detail.split(":").slice(1).join(":").trim())}</dd></div>`).join("")}
          </dl>
        ` : ""}

        <div class="item-card__footer">
          <strong class="price">${formatPrice(item.price)}</strong>
          <button class="button button--small" type="button" data-add="${escapeHTML(item.id)}">Ajouter</button>
        </div>
      </article>
    `;
  }).join("");
}

function addToCart(id, amount = 1) {
  state.cart[id] = Math.max(0, (state.cart[id] || 0) + amount);
  if (state.cart[id] === 0) delete state.cart[id];
  saveCart();
  renderAll(false);
}

function clearCart() {
  state.cart = {};
  saveCart();
  renderAll(false);
  showToast("Panier vidé.");
}

function cartEntries() {
  return Object.entries(state.cart)
    .map(([id, qty]) => ({ item: itemById(id), qty }))
    .filter(entry => entry.item && entry.qty > 0);
}

function cartTotal() {
  return cartEntries().reduce((sum, entry) => sum + entry.item.price * entry.qty, 0);
}

function renderCart() {
  const entries = cartEntries();
  elements.cartEmpty.style.display = entries.length ? "none" : "block";

  elements.cartItems.innerHTML = entries.map(({ item, qty }) => {
    const total = item.price * qty;
    return `
      <div class="cart-line">
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <span>${formatPrice(item.price)} / unité</span>
        </div>
        <div class="cart-line__controls">
          <button class="icon-button" type="button" data-remove="${escapeHTML(item.id)}" aria-label="Retirer un exemplaire">−</button>
          <span>${qty}</span>
          <button class="icon-button" type="button" data-add="${escapeHTML(item.id)}" aria-label="Ajouter un exemplaire">+</button>
        </div>
        <strong>${formatPrice(total)}</strong>
      </div>
    `;
  }).join("");

  elements.cartTotal.textContent = formatPrice(cartTotal());
}

function orderText() {
  const entries = cartEntries();
  if (!entries.length) return "Le panier est vide.";

  const lines = entries.map(({ item, qty }) => {
    return `- ${item.name} (${item.rarity}, ${item.category}) x${qty} = ${formatPrice(item.price * qty)}`;
  });

  return [
    "Commande chez Alaric :",
    ...lines,
    "",
    `Total : ${formatPrice(cartTotal())}`
  ].join("\n");
}

async function copyOrder() {
  const text = orderText();
  try {
    await navigator.clipboard.writeText(text);
    showToast("Commande copiée.");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast("Commande copiée.");
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.setTimeout(() => elements.toast.classList.remove("is-visible"), 1700);
}

function renderAll(refreshFilters = true) {
  if (refreshFilters) renderFilters();
  renderItems();
  renderCart();
}

function bindEvents() {
  elements.search.addEventListener("input", event => {
    state.search = event.target.value;
    renderItems();
  });

  elements.subcategoryFilter.addEventListener("change", event => {
    state.subcategory = event.target.value;
    renderItems();
  });

  elements.rarityFilter.addEventListener("change", event => {
    state.rarity = event.target.value;
    renderItems();
  });

  elements.sortFilter.addEventListener("change", event => {
    state.sort = event.target.value;
    renderItems();
  });

  document.addEventListener("click", event => {
    const categoryButton = event.target.closest("[data-category]");
    if (categoryButton) {
      state.category = categoryButton.dataset.category;
      state.subcategory = "all";
      renderAll(true);
      return;
    }

    const addButton = event.target.closest("[data-add]");
    if (addButton) {
      addToCart(addButton.dataset.add, 1);
      showToast("Ajouté au panier.");
      return;
    }

    const removeButton = event.target.closest("[data-remove]");
    if (removeButton) {
      addToCart(removeButton.dataset.remove, -1);
    }
  });

  elements.copyOrder.addEventListener("click", copyOrder);
  elements.clearCart.addEventListener("click", clearCart);
  elements.openCartMobile.addEventListener("click", () => elements.cartPanel.classList.add("is-open"));
  elements.closeCartMobile.addEventListener("click", () => elements.cartPanel.classList.remove("is-open"));
}

async function init() {
  bindEvents();
  try {
    await loadCatalogue();
    renderAll(true);
  } catch (error) {
    console.error(error);
    elements.resultCount.textContent = "Catalogue indisponible";
    elements.grid.innerHTML = `
      <article class="empty-card">
        <strong>Impossible de charger catalogue.json.</strong>
        <span>Vérifie que le fichier est présent à la racine du dépôt.</span>
      </article>
    `;
  }
}

init();
