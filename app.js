let ITEMS = [];
let ICON_MANIFEST = [];

const ICONS_BASE_PATH = "assets/icons/";

const CATALOGUE_FILES = [
  "catalogue.json",
  "catalogue-item-de-base.json"
];

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

const CATEGORY_ORDER = {
  "armes": 1,
  "armure / bouclier": 2,
  "armures": 2,
  "accessoire": 3,
  "accessoires": 3,
  "objet consommable": 4,
  "potions": 4,
  "objet": 5,
  "objets": 5
};

const SUBCATEGORY_ORDER = {
  "armes": {
    "armes d'attaque au contact": 1,
    "armes d'attaque a distance": 2
  },
  "armure / bouclier": {
    "armures et boucliers": 1
  },
  "armures": {
    "armures et boucliers": 1
  },
  "accessoire": {},
  "accessoires": {},
  "objet consommable": {
    "fiole / potion": 1,
    "munitions": 2,
    "ration": 3,
    "parchemin": 4
  },
  "potions": {
    "fiole / potion": 1
  },
  "objet": {
    "materiel": 1
  },
  "objets": {
    "materiel": 1
  }
};


const DEFAULT_ICON_KEYS = {
  "Armes": "Epee",
  "Armure / Bouclier": "Cuir",
  "Armures": "Cuir",
  "Accessoire": "ring",
  "Accessoires": "ring",
  "Objet consommable": "round-potion",
  "Potions": "round-potion",
  "Objet": "swap-bag",
  "Objets": "swap-bag"
};

const FALLBACK_ICONS = DEFAULT_ICON_KEYS;

const ICON_ALIASES = {
  "arbalete": "Arbalette",
  "arbalette": "Arbalette",
  "arc": "Arc",
  "fleche": "broadhead-arrow",
  "trait": "broadhead-arrow",
  "carreau": "broadhead-arrow",
  "baton": "Baton",
  "dague": "Dague",
  "epee a 2 mains": "Epee___2_main",
  "epee 2 mains": "Epee___2_main",
  "epee deux mains": "Epee___2_main",
  "epee longue": "Epee_longue",
  "epee batarde": "Epee_Batarde",
  "epee bâtarde": "Epee_Batarde",
  "epee": "Epee",
  "hache a 2 mains": "Hache___2_main",
  "hache 2 mains": "Hache___2_main",
  "hache deux mains": "Hache___2_main",
  "hache": "Hache",
  "javelot": "Javelot",
  "lance": "Lance",
  "marteau": "Marteau",
  "masse a 2 mains": "Masse___2_main",
  "masse 2 mains": "Masse___2_main",
  "masse deux mains": "Masse___2_main",
  "masse": "Masse",
  "mousquet": "Mousquet",
  "petoire": "Petoire",
  "pétoire": "Petoire",
  "rapiere": "Rapiere",
  "rapière": "Rapiere",
  "munition": "heavy-bullets",
  "balle": "heavy-bullets",
  "cuir": "Cuir",
  "tissu": "Tissu",
  "plaque": "plaque",
  "chemise de maille": "Chemise_de_maille",
  "maille": "Chemise_de_maille",
  "grand bouclier": "Grand_Bouclier",
  "petit bouclier": "Petit_Bouclier",
  "bouclier": "Petit_Bouclier",
  "anneau": "ring",
  "bague": "ring",
  "ring": "ring",
  "collier": "emerald-necklace",
  "amulette": "emerald-necklace",
  "pendentif": "emerald-necklace",
  "ceinture": "belt",
  "belt": "belt",
  "bottes": "boots",
  "botte": "boots",
  "boots": "boots",
  "cape": "cloak",
  "cloak": "cloak",
  "gants": "gloves",
  "gant": "gloves",
  "gloves": "gloves",
  "potion de folie": "potion-of-madness",
  "folie": "potion-of-madness",
  "potion de feu": "fire-bottle",
  "feu gregeois": "fire-bottle",
  "feu grégeois": "fire-bottle",
  "fiole de feu": "fire-bottle",
  "bombe": "fire-bottle",
  "potion": "round-potion",
  "fiole": "potion-ball",
  "parchemin": "scroll-unfurled",
  "scroll": "scroll-unfurled",
  "sac": "swap-bag",
  "besace": "swap-bag",
  "objet": "swap-bag"
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

async function loadIconManifest() {
  try {
    const response = await fetch(`${ICONS_BASE_PATH}manifest.json`, { cache: "no-store" });
    if (!response.ok) return;

    const manifest = await response.json();
    ICON_MANIFEST = Array.isArray(manifest) ? manifest : [];
  } catch (error) {
    console.warn("Manifest d'icônes indisponible :", error);
    ICON_MANIFEST = [];
  }
}

async function loadCatalogueFile(filename) {
  const response = await fetch(filename, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Impossible de charger ${filename} (${response.status})`);
  }

  const catalogue = await response.json();
  if (!Array.isArray(catalogue)) {
    throw new Error(`${filename} doit contenir un tableau d'objets.`);
  }

  return catalogue;
}

async function loadCatalogue() {
  const catalogues = await Promise.all(CATALOGUE_FILES.map(loadCatalogueFile));
  const items = catalogues.flat();
  const seenIds = new Set();

  ITEMS = items
    .map(normalizeItem)
    .filter(item => {
      if (seenIds.has(item.id)) {
        console.warn(`Objet ignoré car son id existe déjà : ${item.id}`);
        return false;
      }
      seenIds.add(item.id);
      return true;
    });
}

function normalizeItem(item) {
  const category = String(item.category || "Objets");
  const subcategory = String(item.subcategory || "Objets");
  const name = String(item.name || "Objet sans nom");
  const rarity = String(item.rarity || "Commun");
  const explicitIcon = item.icon ? String(item.icon) : "";

  return {
    id: String(item.id || crypto.randomUUID()),
    category,
    subcategory,
    name,
    rarity,
    description: String(item.description || ""),
    price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
    icon: resolveIcon(item, { explicitIcon, category, subcategory, name, rarity }),
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

function isImageIcon(iconText) {
  return /^https?:\/\//i.test(iconText) || /\.(png|jpe?g|webp|gif|svg)$/i.test(iconText);
}

function normalizeIconKey(value) {
  return normalize(value)
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function iconEntryMatchesRarity(entry, rarity) {
  const target = normalize(rarity);
  return normalize(entry.rarity_label) === target || normalize(entry.rarity_slug) === target;
}

function iconPath(entry) {
  return entry?.png_path ? `${ICONS_BASE_PATH}${entry.png_path}` : "";
}

function resolveIcon(item, { explicitIcon, category, subcategory, name, rarity }) {
  if (explicitIcon && isImageIcon(explicitIcon)) return explicitIcon;

  const candidates = [
    item.iconKey,
    item.iconName,
    explicitIcon,
    name,
    subcategory,
    category
  ].filter(Boolean);

  const automaticIcon = findIconForItem(candidates, rarity, category);
  return automaticIcon || explicitIcon || FALLBACK_ICONS[category] || "✦";
}

function findIconForItem(candidates, rarity, category) {
  if (!ICON_MANIFEST.length) return "";

  const rarityEntries = ICON_MANIFEST.filter(entry => iconEntryMatchesRarity(entry, rarity));
  const pool = rarityEntries.length ? rarityEntries : ICON_MANIFEST;
  const iconNames = uniqueSorted(pool.map(entry => entry.icon));

  for (const candidate of candidates) {
    const iconName = matchIconName(candidate, iconNames);
    if (!iconName) continue;

    const entry = pool.find(item => item.icon === iconName);
    const path = iconPath(entry);
    if (path) return path;
  }

  const fallbackKey = DEFAULT_ICON_KEYS[category] || DEFAULT_ICON_KEYS.Objets;
  const fallbackEntry = pool.find(entry => entry.icon === fallbackKey)
    || ICON_MANIFEST.find(entry => entry.icon === fallbackKey);
  return iconPath(fallbackEntry);
}

function matchIconName(value, iconNames) {
  const candidate = normalizeIconKey(value);
  if (!candidate) return "";

  const alias = Object.entries(ICON_ALIASES).find(([key]) => candidate.includes(normalizeIconKey(key)));
  if (alias && iconNames.includes(alias[1])) return alias[1];

  const rankedIconNames = [...iconNames].sort((a, b) => normalizeIconKey(b).length - normalizeIconKey(a).length);
  const exact = rankedIconNames.find(iconName => normalizeIconKey(iconName) === candidate);
  if (exact) return exact;

  return rankedIconNames.find(iconName => {
    const normalizedIconName = normalizeIconKey(iconName);
    return normalizedIconName.length >= 3 && candidate.includes(normalizedIconName);
  }) || "";
}


function rarityThemeClass(rarity) {
  return RARITY_THEME_CLASS[rarity] || safeClass(rarity) || "commun";
}

function rankKey(value) {
  return normalize(value)
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function textCompare(a = "", b = "") {
  return String(a ?? "").localeCompare(String(b ?? ""), "fr", { sensitivity: "base" });
}

function rarityRank(rarity) {
  const key = rankKey(rarity);
  const index = RARITY_ORDER.findIndex(value => rankKey(value) === key);
  return index === -1 ? RARITY_ORDER.length : index;
}

function categoryRank(category) {
  return CATEGORY_ORDER[rankKey(category)] ?? 999;
}

function subcategoryRank(category, subcategory) {
  const categoryKey = rankKey(category);
  const subcategoryKey = rankKey(subcategory);
  return SUBCATEGORY_ORDER[categoryKey]?.[subcategoryKey] ?? 999;
}

function subcategoryRankForFilter(subcategory) {
  if (state.category !== "all") {
    return subcategoryRank(state.category, subcategory);
  }

  const subcategoryKey = rankKey(subcategory);
  const ranks = Object.values(SUBCATEGORY_ORDER)
    .map(group => group[subcategoryKey])
    .filter(Number.isFinite);

  return ranks.length ? Math.min(...ranks) : 999;
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
  return ["all", ...uniqueSorted(source.map(item => item.subcategory), subcategoryRankForFilter)];
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
    if (state.sort === "price-asc") return a.price - b.price || textCompare(a.name, b.name);
    if (state.sort === "price-desc") return b.price - a.price || textCompare(a.name, b.name);
    if (state.sort === "rarity-asc") return rarityRank(a.rarity) - rarityRank(b.rarity) || textCompare(a.name, b.name);
    if (state.sort === "rarity-desc") return rarityRank(b.rarity) - rarityRank(a.rarity) || textCompare(a.name, b.name);
    if (state.sort === "category-asc") {
      return categoryRank(a.category) - categoryRank(b.category)
        || textCompare(a.category, b.category)
        || subcategoryRank(a.category, a.subcategory) - subcategoryRank(b.category, b.subcategory)
        || textCompare(a.subcategory, b.subcategory)
        || rarityRank(a.rarity) - rarityRank(b.rarity)
        || textCompare(a.name, b.name)
        || a.price - b.price
        || textCompare(a.price, b.price);
    }
    return textCompare(a.name, b.name);
  });

  return items;
}

function iconMarkup(item) {
  const icon = item.icon || FALLBACK_ICONS[item.category] || "✦";
  const iconText = String(icon);
  if (isImageIcon(iconText)) {
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
      <article class="item-row item-row--${escapeHTML(rarityTheme)} rarity-${safeClass(item.rarity)}">
        <div class="item-icon">${iconMarkup(item)}</div>

        <div class="item-row__main">
          <div class="item-row__title-line">
            <h3>${escapeHTML(item.name)}</h3>
            <div class="item-row__badges">
              <span class="rarity-badge rarity-badge--${escapeHTML(rarityTheme)}">${escapeHTML(item.rarity)}</span>
              ${qty ? `<span class="qty-badge">Panier : ${qty}</span>` : ""}
            </div>
          </div>

          <div class="item-row__meta">
            <span>${escapeHTML(item.category)}</span>
            <span>${escapeHTML(item.subcategory)}</span>
          </div>

          <p class="item-description">${escapeHTML(item.description || "Alaric garde les détails pour les clients sérieux.")}</p>

          ${details.length ? `
            <dl class="item-row__stats">
              ${details.map(detail => `<div><dt>${escapeHTML(detail.split(":")[0])}</dt><dd>${escapeHTML(detail.split(":").slice(1).join(":").trim())}</dd></div>`).join("")}
            </dl>
          ` : ""}
        </div>

        <div class="item-row__actions">
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
    await loadIconManifest();
    await loadCatalogue();
    renderAll(true);
  } catch (error) {
    console.error(error);
    elements.resultCount.textContent = "Catalogues indisponibles";
    elements.grid.innerHTML = `
      <article class="empty-card">
        <strong>Impossible de charger un des fichiers catalogue.</strong>
        <span>Vérifie que catalogue.json et catalogue-item-de-base.json sont présents à la racine du dépôt.</span>
      </article>
    `;
  }
}

init();
