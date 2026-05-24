let ITEMS = [];

async function loadCatalogue() {
  const response = await fetch("catalogue.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Impossible de charger catalogue.json (${response.status})`);
  }

  const catalogue = await response.json();

  if (!Array.isArray(catalogue)) {
    throw new Error("catalogue.json doit contenir un tableau d'objets.");
  }

  ITEMS = catalogue;
}

const state = {
  category: "all",
  rarity: "all",
  search: "",
  sort: "name-asc",
  cart: loadCart(),
};

const elements = {
  grid: document.querySelector("#items-grid"),
  categoryFilters: document.querySelector("#category-filters"),
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
  closeCartMobile: document.querySelector("#close-cart-mobile"),
};

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
  return `${Number(value).toLocaleString("fr-FR")} po`;
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function safeClass(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "");
}

function itemById(id) {
  return ITEMS.find(item => item.id === id);
}

function categories() {
  return ["all", ...new Set(ITEMS.map(item => item.category))];
}

function rarities() {
  return ["all", ...new Set(ITEMS.map(item => item.rarity).filter(Boolean))];
}

function renderFilters() {
  elements.categoryFilters.innerHTML = categories().map(category => {
    const label = category === "all" ? "Tous" : category;
    const active = category === state.category ? "is-active" : "";
    return `<button class="chip ${active}" type="button" data-category="${category}">${label}</button>`;
  }).join("");

  elements.rarityFilter.innerHTML = rarities().map(rarity => {
    const label = rarity === "all" ? "Toutes" : rarity;
    return `<option value="${rarity}">${label}</option>`;
  }).join("");
}

function filteredItems() {
  let items = [...ITEMS];

  if (state.category !== "all") {
    items = items.filter(item => item.category === state.category);
  }

  if (state.rarity !== "all") {
    items = items.filter(item => item.rarity === state.rarity);
  }

  if (state.search.trim()) {
    const query = normalize(state.search);
    items = items.filter(item => {
      return [item.name, item.category, item.subcategory, item.rarity, item.description]
        .some(value => normalize(value).includes(query));
    });
  }

  items.sort((a, b) => {
    if (state.sort === "price-asc") return a.price - b.price;
    if (state.sort === "price-desc") return b.price - a.price;
    if (state.sort === "category-asc") return `${a.category} ${a.name}`.localeCompare(`${b.category} ${b.name}`, "fr");
    return a.name.localeCompare(b.name, "fr");
  });

  return items;
}

function renderItems() {
  const items = filteredItems();
  elements.resultCount.textContent = `${items.length} objet${items.length > 1 ? "s" : ""} trouvé${items.length > 1 ? "s" : ""}`;

  if (!items.length) {
    elements.grid.innerHTML = `<div class="no-result">Alaric agite sa lanterne astrale, mais aucun objet ne répond à l’appel.</div>`;
    return;
  }

  elements.grid.innerHTML = items.map(item => {
    const qty = state.cart[item.id] || 0;
    const details = [
      item.damage ? `Dégâts : ${item.damage}` : "",
      item.damageMod ? `Mod. DM : ${item.damageMod}` : "",
      item.armorMod ? `Armure : ${item.armorMod}` : "",
    ].filter(Boolean);

    return `
      <article class="item-row rarity-${safeClass(item.rarity)}">
        <div class="item-row__sigil" aria-hidden="true">✦</div>

        <div class="item-row__icon-wrap">
          ${item.icon ? `<img class="item-icon" src="${item.icon}" alt="">` : `<div class="item-icon item-icon--fallback" aria-hidden="true">✦</div>`}
        </div>

        <div class="item-row__content">
          <div class="item-row__title-line">
            <h3>${item.name}</h3>
            ${qty ? `<span class="in-cart">Dans le panier : ${qty}</span>` : ""}
          </div>

          <div class="meta">
            <span class="badge">${item.category}</span>
            ${item.subcategory ? `<span class="badge badge--soft">${item.subcategory}</span>` : ""}
            <span class="badge badge--${safeClass(item.rarity)}">${item.rarity}</span>
          </div>

          <p class="description">${item.description || "Alaric garde les détails pour les clients sérieux."}</p>
          ${details.length ? `<div class="details">${details.map(detail => `<span>${detail}</span>`).join("")}</div>` : ""}
        </div>

        <div class="item-row__buy">
          <span class="price">${formatPrice(item.price)}</span>
          <button class="button button--primary" type="button" data-add="${item.id}">
            Ajouter
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function addToCart(id, amount = 1) {
  state.cart[id] = Math.max(0, (state.cart[id] || 0) + amount);
  if (state.cart[id] === 0) delete state.cart[id];
  saveCart();
  renderAll();
}

function clearCart() {
  state.cart = {};
  saveCart();
  renderAll();
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
          <strong>${item.name}</strong>
          <small>${formatPrice(item.price)} / unité</small>
          <div class="quantity">
            <button type="button" data-remove="${item.id}" aria-label="Retirer un exemplaire">−</button>
            <span>${qty}</span>
            <button type="button" data-add="${item.id}" aria-label="Ajouter un exemplaire">+</button>
          </div>
        </div>
        <div class="line-price">${formatPrice(total)}</div>
      </div>
    `;
  }).join("");
  elements.cartTotal.textContent = formatPrice(cartTotal());
}

function orderText() {
  const entries = cartEntries();
  if (!entries.length) return "Le panier est vide.";

  const lines = entries.map(({ item, qty }) => {
    return `- ${item.name} x${qty} = ${formatPrice(item.price * qty)}`;
  });

  return [
    "Commande chez Alaric :",
    ...lines,
    "",
    `Total : ${formatPrice(cartTotal())}`,
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

function renderAll() {
  renderFilters();
  renderItems();
  renderCart();
}

function bindEvents() {
  elements.search.addEventListener("input", event => {
    state.search = event.target.value;
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
      renderFilters();
      renderItems();
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
    renderAll();
  } catch (error) {
    console.error(error);
    elements.resultCount.textContent = "Catalogue indisponible";
    elements.grid.innerHTML = `<div class="no-result">Impossible de charger catalogue.json.</div>`;
  }
}

init();
