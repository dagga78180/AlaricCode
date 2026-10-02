let ITEMS = [];
let ICON_MANIFEST = [];
let STOCK_CLIENT = null;
let stockRefreshTimer = null;

const STOCK_REFRESH_MS = 30000;

const ICONS_BASE_PATH = "assets/icons/";

const CATALOGUE_FILES = [
  { filename: "catalogue.json", source: "alaric", label: "Sélection d’Alaric" },
  { filename: "catalogue-item-de-base.json", source: "base", label: "Catalogue de base" }
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
    "armes d'attaque a distance": 2,
    "armes magiques": 3
  },
  "armure / bouclier": {
    "armures et boucliers": 1,
    "armures": 1,
    "boucliers": 2
  },
  "armures": {
    "armures": 1,
    "boucliers": 2,
    "armures et boucliers": 1
  },
  "accessoire": {},
  "accessoires": {},
  "objet consommable": {
    "fiole / potion": 1,
    "fiole / dose": 1,
    "parchemin": 2,
    "provision": 3,
    "munitions": 4
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
  "Armes": "Epee_longue",
  "Armure / Bouclier": "Armure_de_plaque",
  "Armures": "Armure_de_plaque",
  "Accessoire": "anneaux",
  "Accessoires": "anneaux",
  "Objet consommable": "Potion_de_soins",
  "Potions": "Potion_de_soins",
  "Objet": "Sac_a_dos",
  "Objets": "Sac_a_dos"
};

const FALLBACK_ICONS = DEFAULT_ICON_KEYS;

// Ces alias ne servent que de filet de sécurité. Les catalogues officiels ont
// tous un iconKey explicite afin de ne jamais dépendre d'une déduction fragile.
const ICON_ALIASES = {
  "parchemin de stabilisation": "tied-scroll",
  "marteau a deux mains": "Marteau_a_2_main",
  "marteau 2 mains": "Marteau_a_2_main",
  "hache a deux mains": "Hache_a_deux_mains",
  "hache 2 mains": "Hache_a_deux_mains",
  "epee a deux mains": "Ep_a_2_main",
  "epee 2 mains": "Ep_a_2_main",
  "epee batarde": "Ep_batarde",
  "epee courte": "Ep_courte",
  "epee longue": "Epee_longue",
  "arbalete de poing": "Arbalete",
  "arbalete lourde": "Arbalete",
  "arbalete legere": "Arbalete",
  "arbalete": "Arbalete",
  "arc court": "Arc_court",
  "arc long": "Arc_long",
  "couteaux de lancer": "Couteaux_de_lancer",
  "baton ferre": "Baton_ferre",
  "baton": "Baton",
  "dague magique": "Dague_magique",
  "dague": "Dague",
  "hache": "Hache",
  "javelot": "Javelot",
  "lance": "Lance",
  "marteau": "Marteau",
  "masse": "Masse",
  "pioche": "Pioche",
  "mousquet": "Mousquet",
  "petoire": "Petoire",
  "rapiere": "Rapiere",
  "armure de plaques": "Armure_de_plaque",
  "chemise de mailles": "Chemis_de_maille",
  "cotte de mailles": "Cotte_de_maille",
  "cuir renforce": "Cuir_renforce",
  "cuir simple": "Cuir_simple",
  "tissus matelasses": "Tissus_matelasses",
  "grand bouclier": "Grand_bouclier",
  "petit bouclier": "Petit_bouclier",
  "poison": "Poison",
  "potion de mana": "Potion_de_mana",
  "potion de soins": "Potion_de_soins",
  "potion de celerite": "Potion_de_celerite",
  "potion de resistance magique": "Potion_de_resistance_magique",
  "potion de resistance physique": "Potion_de_resistance_physique",
  "potion de caracteristique": "Potion_de_caracteristique_temporaire",
  "parchemin": "Parchemin_de_capacite",
  "ration": "Ration",
  "briquet": "Briquet_a_silex",
  "carquois": "Carquois_de_20_fl_hes",
  "corde": "Corde_15_m",
  "couverture": "Couverture",
  "grappin": "Grappin",
  "huile": "Huile_pour_lanterne",
  "lanterne": "Lanterne_a_huile",
  "materiel d'ecriture": "Materiel_d_riture",
  "outils de crochetage": "Outils_de_crochetage",
  "sac a dos": "Sac_a_dos",
  "torches": "Torches_x3",
  "anneau": "anneaux",
  "bague": "anneaux",
  "ceinture": "ceinture",
  "collier": "Cou",
  "amulette": "Cou",
  "cape": "Dos",
  "manteau": "Dos",
  "gants": "Gants",
  "bottes": "Pieds",
  "casque": "Tete",
  "sceptre": "Sceptre",
  "focus": "Focus",
  "grenade": "grenade"
};

const state = {
  category: "all",
  subcategory: "all",
  rarity: "all",
  source: "all",
  search: "",
  minPrice: null,
  maxPrice: null,
  favoritesOnly: false,
  sort: "alaric-first",
  cart: loadCart(),
  favorites: loadFavorites(),
  catalogueWarnings: [],
  stockWarning: "",
  stockOnline: false
};

const elements = {
  grid: document.querySelector("#items-grid"),
  categoryFilters: document.querySelector("#category-filters"),
  subcategoryFilter: document.querySelector("#subcategory-filter"),
  rarityFilter: document.querySelector("#rarity-filter"),
  sourceFilter: document.querySelector("#source-filter"),
  sortFilter: document.querySelector("#sort-filter"),
  search: document.querySelector("#search"),
  minPrice: document.querySelector("#price-min"),
  maxPrice: document.querySelector("#price-max"),
  favoritesOnly: document.querySelector("#favorites-only"),
  resetFilters: document.querySelector("#reset-filters"),
  resultCount: document.querySelector("#result-count"),
  catalogueAlerts: document.querySelector("#catalogue-alerts"),
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

function flattenIconManifest(manifest) {
  if (!Array.isArray(manifest)) return [];

  return manifest.flatMap(entry => {
    // Nouveau pack : une entrée par icône, avec ses 11 variantes de rareté.
    if (Array.isArray(entry?.variants)) {
      const icon = String(entry.icon_key || entry.name || "");
      return entry.variants
        .filter(variant => icon && variant?.path)
        .map(variant => ({
          icon,
          rarity_label: String(variant.rarity || "Commun"),
          rarity_slug: String(variant.slug || ""),
          png_path: String(variant.path)
        }));
    }

    // Compatibilité avec l'ancien manifest plat, au cas où un ancien pack est remis.
    if (entry?.icon && entry?.png_path) {
      return [{
        icon: String(entry.icon),
        rarity_label: String(entry.rarity_label || "Commun"),
        rarity_slug: String(entry.rarity_slug || ""),
        png_path: String(entry.png_path)
      }];
    }

    return [];
  });
}

async function loadIconManifest() {
  try {
    const response = await fetch(`${ICONS_BASE_PATH}manifest.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const manifest = await response.json();
    ICON_MANIFEST = flattenIconManifest(manifest);

    if (!ICON_MANIFEST.length) {
      console.warn("Le manifest d'icônes est vide ou dans un format inconnu.");
    }
  } catch (error) {
    console.warn("Manifest d'icônes indisponible :", error);
    ICON_MANIFEST = [];
  }
}

async function loadCatalogueFile(config) {
  const response = await fetch(config.filename, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Impossible de charger ${config.filename} (${response.status})`);
  }

  let catalogue;
  try {
    catalogue = await response.json();
  } catch (error) {
    throw new Error(`${config.filename} contient un JSON invalide.`);
  }

  if (!Array.isArray(catalogue)) {
    throw new Error(`${config.filename} doit contenir un tableau d'objets.`);
  }

  return catalogue.map((item, index) => normalizeItem(item, config.source, index));
}

async function loadCatalogue() {
  const results = await Promise.allSettled(CATALOGUE_FILES.map(loadCatalogueFile));
  const seenIds = new Set();
  const warnings = [];
  const loadedItems = [];

  results.forEach((result, index) => {
    const config = CATALOGUE_FILES[index];
    if (result.status === "rejected") {
      console.error(result.reason);
      warnings.push(`${config.label} indisponible : ${result.reason.message || result.reason}`);
      return;
    }

    result.value.forEach(item => {
      if (seenIds.has(item.id)) {
        const message = `ID dupliqué ignoré : ${item.id} (${item.name})`;
        console.warn(message);
        warnings.push(message);
        return;
      }
      seenIds.add(item.id);
      loadedItems.push(item);
    });
  });

  loadedItems.forEach(item => {
    if (item.iconKey && !hasIconVariant(item.iconKey, item.rarity)) {
      warnings.push(`Icône introuvable pour ${item.name} : ${item.iconKey} / ${item.rarity}`);
    }
  });

  ITEMS = loadedItems;
  state.catalogueWarnings = warnings;

  if (!ITEMS.length) {
    throw new Error("Aucun catalogue n'a pu être chargé.");
  }

  const cartAdjusted = sanitizeCart();
  if (cartAdjusted) {
    state.catalogueWarnings.push("Le panier local a été ajusté au catalogue et aux stocks actuels.");
  }
}

function slugify(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "objet";
}

function normalizeItem(item, source = "base", index = 0) {
  const category = String(item.category || "Objets");
  const subcategory = String(item.subcategory || "Objets");
  const name = String(item.name || "Objet sans nom");
  const rarity = String(item.rarity || "Commun");
  const explicitIcon = item.icon ? String(item.icon) : "";
  const rawStock = source === "alaric" ? item.stock : null;
  const hasFiniteStock = rawStock !== null && rawStock !== undefined && rawStock !== "" && Number.isFinite(Number(rawStock));
  const jsonStock = hasFiniteStock ? Math.max(0, Math.floor(Number(rawStock))) : null;
  const fallbackId = `${source}-${slugify(name)}-${index + 1}`;

  return {
    id: String(item.id || fallbackId),
    source,
    category,
    subcategory,
    name,
    rarity,
    description: String(item.description || ""),
    price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
    stock: jsonStock,
    stockSource: jsonStock === null ? "none" : "json",
    iconKey: item.iconKey ? String(item.iconKey) : "",
    icon: resolveIcon(item, { explicitIcon, category, subcategory, name, rarity }),
    damage: item.damage ? String(item.damage) : "",
    damageMod: item.damageMod ? String(item.damageMod) : "",
    armorMod: item.armorMod ? String(item.armorMod) : "",
    cofSpec: item.cofSpec && typeof item.cofSpec === "object" ? JSON.parse(JSON.stringify(item.cofSpec)) : null,
    cofCompatible: item.cofCompatible !== false,
    cofError: String(item.cofError || "")
  };
}

function initStockClient() {
  const config = window.ALARIC_SUPABASE_CONFIG || {};
  if (!config.url || !config.publishableKey) {
    throw new Error("Configuration Supabase absente.");
  }
  if (!window.supabase?.createClient) {
    throw new Error("La bibliothèque Supabase n’a pas pu être chargée.");
  }
  STOCK_CLIENT = window.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
}

async function loadRemoteStocks({ silent = false } = {}) {
  if (!STOCK_CLIENT || !ITEMS.length) return false;

  try {
    const { data, error } = await STOCK_CLIENT
      .from("stocks")
      .select("item_id, stock");

    if (error) throw error;

    // Une ligne absente dans Supabase signifie : stock illimité.
    ITEMS.filter(item => item.source === "alaric").forEach(item => {
      item.stock = null;
      item.stockSource = "supabase";
    });

    (data || []).forEach(row => {
      const item = itemById(String(row.item_id));
      if (!item || item.source !== "alaric") return;
      const value = Number(row.stock);
      if (!Number.isFinite(value)) return;
      item.stock = Math.max(0, Math.floor(value));
      item.stockSource = "supabase";
    });

    const cartAdjusted = sanitizeCart();
    state.stockOnline = true;
    state.stockWarning = "";
    if (cartAdjusted && !silent) showToast("Panier ajusté au stock actuel.");
    if (!silent) renderAll(false);
    return true;
  } catch (error) {
    console.warn("Stocks Supabase indisponibles :", error);
    state.stockOnline = false;
    state.stockWarning = "Stocks en ligne indisponibles : les dernières valeurs connues/locales sont utilisées.";
    if (!silent) renderAll(false);
    return false;
  }
}

function scheduleStockRefresh() {
  if (!STOCK_CLIENT || stockRefreshTimer) return;
  stockRefreshTimer = window.setInterval(() => {
    loadRemoteStocks();
  }, STOCK_REFRESH_MS);
}

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem("alaric-cart")) || {};
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem("alaric-cart", JSON.stringify(state.cart));
}

function loadFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem("alaric-favorites")) || [];
    return new Set(Array.isArray(stored) ? stored.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveFavorites() {
  localStorage.setItem("alaric-favorites", JSON.stringify([...state.favorites]));
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    showToast("Retiré des favoris.");
  } else {
    state.favorites.add(id);
    showToast("Ajouté aux favoris.");
  }
  saveFavorites();
  renderItems();
}

function hasFiniteStock(item) {
  return item.source === "alaric" && Number.isInteger(item.stock) && item.stock >= 0;
}

function remainingForCart(item) {
  if (!hasFiniteStock(item)) return Infinity;
  return Math.max(0, item.stock - (state.cart[item.id] || 0));
}

function sanitizeCart() {
  let changed = false;
  const cleaned = {};

  Object.entries(state.cart).forEach(([id, rawQty]) => {
    const item = itemById(id);
    if (!item) {
      changed = true;
      return;
    }

    let qty = Math.max(0, Math.floor(Number(rawQty) || 0));
    if (hasFiniteStock(item) && qty > item.stock) {
      qty = item.stock;
      changed = true;
    }

    if (qty > 0) cleaned[id] = qty;
    if (qty !== rawQty) changed = true;
  });

  if (Object.keys(cleaned).length !== Object.keys(state.cart).length) changed = true;
  state.cart = cleaned;
  if (changed) saveCart();
  return changed;
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

function hasIconVariant(iconKey, rarity) {
  if (!iconKey || !ICON_MANIFEST.length) return false;
  const normalizedKey = normalizeIconKey(iconKey);
  return ICON_MANIFEST.some(entry =>
    normalizeIconKey(entry.icon) === normalizedKey && iconEntryMatchesRarity(entry, rarity)
  );
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
  if (!subcategoryOptions.includes(state.subcategory)) state.subcategory = "all";
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

  elements.sourceFilter.value = state.source;
  elements.sortFilter.value = state.sort;
  elements.search.value = state.search;
  elements.minPrice.value = state.minPrice ?? "";
  elements.maxPrice.value = state.maxPrice ?? "";
  elements.favoritesOnly.classList.toggle("is-active", state.favoritesOnly);
  elements.favoritesOnly.setAttribute("aria-pressed", String(state.favoritesOnly));
}

function filteredItems() {
  let items = [...ITEMS];

  if (state.category !== "all") items = items.filter(item => item.category === state.category);
  if (state.subcategory !== "all") items = items.filter(item => item.subcategory === state.subcategory);
  if (state.rarity !== "all") items = items.filter(item => item.rarity === state.rarity);
  if (state.source !== "all") items = items.filter(item => item.source === state.source);
  if (state.favoritesOnly) items = items.filter(item => state.favorites.has(item.id));
  if (state.minPrice !== null) items = items.filter(item => item.price >= state.minPrice);
  if (state.maxPrice !== null) items = items.filter(item => item.price <= state.maxPrice);

  if (state.search.trim()) {
    const query = normalize(state.search);
    items = items.filter(item => [
      item.name, item.category, item.subcategory, item.rarity, item.description,
      item.damage, item.damageMod, item.armorMod
    ].some(value => normalize(value).includes(query)));
  }

  items.sort((a, b) => {
    if (state.sort === "alaric-first") {
      return Number(b.source === "alaric") - Number(a.source === "alaric")
        || categoryRank(a.category) - categoryRank(b.category)
        || textCompare(a.category, b.category)
        || subcategoryRank(a.category, a.subcategory) - subcategoryRank(b.category, b.subcategory)
        || rarityRank(a.rarity) - rarityRank(b.rarity)
        || textCompare(a.name, b.name);
    }
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
        || textCompare(a.name, b.name);
    }
    return textCompare(a.name, b.name);
  });

  return items;
}

function iconMarkup(item) {
  const icon = item.icon || FALLBACK_ICONS[item.category] || "✦";
  const iconText = String(icon);
  if (isImageIcon(iconText)) return `<img src="${escapeHTML(iconText)}" alt="" loading="lazy" />`;
  return `<span aria-hidden="true">${escapeHTML(iconText)}</span>`;
}

function stockBadge(item) {
  if (!hasFiniteStock(item)) return "";
  if (item.stock === 0) return `<span class="stock-badge stock-badge--empty">Épuisé</span>`;
  if (item.stock === 1) return `<span class="stock-badge stock-badge--low">Dernier exemplaire</span>`;
  if (item.stock <= 3) return `<span class="stock-badge stock-badge--low">Stock : ${item.stock}</span>`;
  return `<span class="stock-badge">En stock : ${item.stock}</span>`;
}

function renderItems() {
  const items = filteredItems();
  elements.resultCount.textContent = `${items.length} marchandise${items.length > 1 ? "s" : ""}`;

  if (!items.length) {
    elements.grid.innerHTML = `
      <article class="empty-card">
        <strong>Aucune marchandise trouvée.</strong>
        <span>Alaric hausse les épaules : “Essaie une autre étagère.”</span>
      </article>`;
    return;
  }

  elements.grid.innerHTML = items.map(item => {
    const qty = state.cart[item.id] || 0;
    const details = [
      item.damage ? ["Dégâts", item.damage] : null,
      item.damageMod ? ["Mod. DM", item.damageMod] : null,
      item.armorMod ? ["Armure", item.armorMod] : null
    ].filter(Boolean);
    const rarityTheme = rarityThemeClass(item.rarity);
    const favorite = state.favorites.has(item.id);
    const finiteStock = hasFiniteStock(item);
    const canBuy = item.cofCompatible && item.cofSpec && (!finiteStock || qty < item.stock);
    const buttonLabel = !item.cofCompatible || !item.cofSpec
      ? "Indisponible"
      : finiteStock && item.stock === 0
        ? "Épuisé"
        : finiteStock && qty >= item.stock
          ? "Stock atteint"
          : "Ajouter";
    const buttonTitle = !item.cofCompatible || !item.cofSpec
      ? (item.cofError || "Non compatible avec CoFItem actuel")
      : finiteStock && qty >= item.stock
        ? "La quantité maximale disponible est déjà dans le panier."
        : "";

    return `
      <article class="item-row ${item.source === "alaric" ? "item-row--selection" : ""} item-row--${escapeHTML(rarityTheme)} rarity-${safeClass(item.rarity)}">
        <button class="favorite-button ${favorite ? "is-favorite" : ""}" type="button" data-favorite="${escapeHTML(item.id)}" aria-label="${favorite ? "Retirer des favoris" : "Ajouter aux favoris"}" aria-pressed="${favorite}">${favorite ? "★" : "☆"}</button>
        <div class="item-icon">${iconMarkup(item)}</div>

        <div class="item-row__main">
          <div class="item-row__title-line">
            <h3>${escapeHTML(item.name)}</h3>
            <div class="item-row__badges">
              ${item.source === "alaric" ? `<span class="selection-badge">✦ Sélection d’Alaric</span>` : ""}
              <span class="rarity-badge rarity-badge--${escapeHTML(rarityTheme)}">${escapeHTML(item.rarity)}</span>
              ${stockBadge(item)}
              ${qty ? `<span class="qty-badge">Panier : ${qty}</span>` : ""}
            </div>
          </div>

          <div class="item-row__meta">
            <span>${escapeHTML(item.category)}</span>
            <span>${escapeHTML(item.subcategory)}</span>
          </div>

          <details class="item-details">
            <summary>Voir les détails</summary>
            <div class="item-details__content">
              <p class="item-description">${escapeHTML(item.description || "Alaric garde les détails pour les clients sérieux.")}</p>
              ${details.length ? `
                <dl class="item-row__stats">
                  ${details.map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join("")}
                </dl>` : ""}
              ${finiteStock ? `<p class="stock-note">Stock en ligne : <strong>${item.stock}</strong>.</p>` : ""}
            </div>
          </details>
        </div>

        <div class="item-row__actions">
          <strong class="price">${formatPrice(item.price)}</strong>
          <button class="button button--small" type="button" data-add="${escapeHTML(item.id)}" ${canBuy ? "" : "disabled"} title="${escapeHTML(buttonTitle)}">${buttonLabel}</button>
        </div>
      </article>`;
  }).join("");
}

function addToCart(id, amount = 1) {
  const item = itemById(id);
  if (!item) return false;

  const current = state.cart[id] || 0;
  let next = Math.max(0, current + amount);
  if (hasFiniteStock(item)) next = Math.min(next, item.stock);

  if (next === current && amount > 0) {
    showToast("Stock maximum atteint.");
    return false;
  }

  if (next === 0) delete state.cart[id];
  else state.cart[id] = next;

  saveCart();
  renderAll(false);
  return true;
}

function clearCart() {
  state.cart = {};
  saveCart();
  renderAll(false);
  showToast("Panier vidé.");
}

function cartEntries() {
  return Object.entries(state.cart)
    .map(([id, qty]) => ({ item: itemById(id), qty: Math.max(0, Math.floor(Number(qty) || 0)) }))
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
    const atStockLimit = hasFiniteStock(item) && qty >= item.stock;
    return `
      <div class="cart-line">
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <span>${formatPrice(item.price)} / unité${hasFiniteStock(item) ? ` · stock ${item.stock}` : ""}</span>
        </div>
        <div class="cart-line__controls">
          <button class="icon-button" type="button" data-remove="${escapeHTML(item.id)}" aria-label="Retirer un exemplaire">−</button>
          <span>${qty}</span>
          <button class="icon-button" type="button" data-add="${escapeHTML(item.id)}" aria-label="Ajouter un exemplaire" ${atStockLimit ? "disabled" : ""}>+</button>
        </div>
        <strong>${formatPrice(total)}</strong>
      </div>`;
  }).join("");

  elements.cartTotal.textContent = formatPrice(cartTotal());
}

function orderPayload() {
  const entries = cartEntries();
  if (!entries.length) return null;

  return {
    version: 2,
    source: "AlaricCode-COAlaric",
    items: entries.map(({ item, qty }) => ({
      ...JSON.parse(JSON.stringify(item.cofSpec)),
      qty
    }))
  };
}

function orderCommand() {
  const payload = orderPayload();
  if (!payload) return "";
  const encoded = encodeURIComponent(JSON.stringify(payload));
  return `!co-alaric panier --target @{target|PJ|character_id} --data ${encoded}`;
}

async function copyOrder() {
  const text = orderCommand();
  if (!text) {
    showToast("Le panier est vide.");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast("Commande COAlaric copiée.");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast("Commande COAlaric copiée.");
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.setTimeout(() => elements.toast.classList.remove("is-visible"), 1700);
}

function renderCatalogueAlerts() {
  const messages = [...state.catalogueWarnings];
  if (state.stockWarning) messages.push(state.stockWarning);

  if (!messages.length) {
    elements.catalogueAlerts.hidden = true;
    elements.catalogueAlerts.innerHTML = "";
    return;
  }
  elements.catalogueAlerts.hidden = false;
  elements.catalogueAlerts.innerHTML = messages
    .map(message => `<div>⚠ ${escapeHTML(message)}</div>`)
    .join("");
}

function renderAll(refreshFilters = true) {
  if (refreshFilters) renderFilters();
  renderCatalogueAlerts();
  renderItems();
  renderCart();
}

function parseOptionalPrice(value) {
  if (value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function resetFilters() {
  state.category = "all";
  state.subcategory = "all";
  state.rarity = "all";
  state.source = "all";
  state.search = "";
  state.minPrice = null;
  state.maxPrice = null;
  state.favoritesOnly = false;
  state.sort = "alaric-first";
  renderAll(true);
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

  elements.sourceFilter.addEventListener("change", event => {
    state.source = event.target.value;
    renderItems();
  });

  elements.minPrice.addEventListener("input", event => {
    state.minPrice = parseOptionalPrice(event.target.value);
    renderItems();
  });

  elements.maxPrice.addEventListener("input", event => {
    state.maxPrice = parseOptionalPrice(event.target.value);
    renderItems();
  });

  elements.sortFilter.addEventListener("change", event => {
    state.sort = event.target.value;
    renderItems();
  });

  elements.favoritesOnly.addEventListener("click", () => {
    state.favoritesOnly = !state.favoritesOnly;
    elements.favoritesOnly.classList.toggle("is-active", state.favoritesOnly);
    elements.favoritesOnly.setAttribute("aria-pressed", String(state.favoritesOnly));
    renderItems();
  });

  elements.resetFilters.addEventListener("click", resetFilters);

  document.addEventListener("click", event => {
    const categoryButton = event.target.closest("[data-category]");
    if (categoryButton) {
      state.category = categoryButton.dataset.category;
      state.subcategory = "all";
      renderAll(true);
      return;
    }

    const favoriteButton = event.target.closest("[data-favorite]");
    if (favoriteButton) {
      toggleFavorite(favoriteButton.dataset.favorite);
      return;
    }

    const addButton = event.target.closest("[data-add]");
    if (addButton && !addButton.disabled) {
      if (addToCart(addButton.dataset.add, 1)) showToast("Ajouté au panier.");
      return;
    }

    const removeButton = event.target.closest("[data-remove]");
    if (removeButton) addToCart(removeButton.dataset.remove, -1);
  });

  elements.copyOrder.addEventListener("click", copyOrder);
  elements.clearCart.addEventListener("click", clearCart);
  elements.openCartMobile.addEventListener("click", () => elements.cartPanel.classList.add("is-open"));
  elements.closeCartMobile.addEventListener("click", () => elements.cartPanel.classList.remove("is-open"));
}

async function init() {
  bindEvents();
  await loadIconManifest();

  try {
    initStockClient();
  } catch (error) {
    console.warn(error);
    state.stockWarning = "Supabase n’est pas configuré : le site utilise les stocks de secours du JSON s’ils existent.";
  }

  try {
    await loadCatalogue();
    if (STOCK_CLIENT) await loadRemoteStocks({ silent: true });
    renderAll(true);
    scheduleStockRefresh();
  } catch (error) {
    console.error(error);
    elements.resultCount.textContent = "Catalogues indisponibles";
    elements.catalogueAlerts.hidden = false;
    elements.catalogueAlerts.innerHTML = `<div>⚠ ${escapeHTML(error.message || error)}</div>`;
    elements.grid.innerHTML = `
      <article class="empty-card">
        <strong>Impossible de charger le catalogue.</strong>
        <span>Vérifie les fichiers JSON à la racine du dépôt.</span>
      </article>`;
  }
}

init();
