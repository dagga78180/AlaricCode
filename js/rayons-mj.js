/* AlaricCode V10.4 — Rayons compacts, deux stocks, modifications préparées puis validées. */
(() => {
  'use strict';
  const A = window.AlaricApp;
  const P = window.AlaricPriceTools;
  const GROUPS = ['groupe1', 'groupe2'];
  const SHELVES = ['normal', 'promo', 'secret'];
  const $ = id => document.getElementById(id);
  const create = (name, cls, text) => {
    const el = document.createElement(name);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = String(text);
    return el;
  };
  const stockText = n => n === null ? '∞' : String(n);
  const path = (group, collection, id) => A.db.collection('groups').doc(group).collection(collection).doc(id);
  const key = (group, id) => `${group}|${id}`;
  const original = (group, id) => data?.groups[group]?.byId?.get(id) || null;
  const section = (group, id) => {
    const feature = data?.groups[group]?.featured || {};
    if ((feature.secretIds || []).includes(id)) return 'secret';
    if ((feature.itemIds || []).includes(id)) return 'promo';
    return 'normal';
  };
  const originalPct = (group, id) => Number(data?.groups[group]?.featured?.discounts?.[id]) || 20;
  const changes = new Map();
  const expandedCount = {normal: 45, promo: 45, secret: 45};
  let data = null, busy = false, drag = null, selected = null;
  let modalRequest = null, lastDiscount = 20, hashState = {groupe1: null, groupe2: null};
  let hashLoadGeneration = 0, statusOverride = '', justSaved = false;
  const saved = (group, id) => {
    const it = original(group, id);
    return it && {stock: it.stock == null ? null : Number(it.stock), shelf: section(group, id), discount: originalPct(group, id)};
  };
  function draft(group, id) { return changes.get(key(group, id)) || saved(group, id); }
  function dirty(group, id, entry) {
    const before = saved(group, id);
    return before && (entry.stock !== before.stock || entry.shelf !== before.shelf ||
      (entry.shelf === 'promo' && entry.discount !== before.discount));
  }
  function update(group, id, patch) {
    if (!original(group, id)) return;
    justSaved = false;
    const next = {...draft(group, id), ...patch};
    if (dirty(group, id, next)) changes.set(key(group, id), next);
    else changes.delete(key(group, id));
    showActions();
  }
  function status(message, error = false) {
    const el = $('rayon-status');
    if (!el) return;
    el.textContent = message;
    el.classList.toggle('rayon-error', error);
    statusOverride = message;
  }
  function showActions() {
    const hasPassword = !!$('rayon-password')?.value.trim();
    const n = changes.size;
    const isDirty = n > 0 || hasPassword;
    $('rayon-save').disabled = busy || !isDirty;
    $('rayon-cancel').disabled = busy || !isDirty;
    if (busy) status('Enregistrement en cours…');
    else if (n) status(`${n} objet(s)/groupe(s) modifié(s), non enregistrés.`);
    else if (hasPassword) status('Nouveau mot de passe en attente d’enregistrement.');
    else if (justSaved) status('✓ Modifications enregistrées dans Firebase.');
    else status('Aucune modification.');
  }
  function allItems() {
    const m = new Map();
    for (const group of GROUPS) for (const it of data?.groups[group]?.items || []) {
      if (!m.has(it.id)) m.set(it.id, it);
    }
    return [...m.values()].sort((a, b) => String(a.name).localeCompare(String(b.name), 'fr'));
  }
  function buildFilters() {
    const items = allItems();
    for (const [id, values, label] of [
      ['rayon-category', [...new Set(items.map(i => i.category).filter(Boolean))], 'Toutes les catégories'],
      ['rayon-rarity', [...new Set(items.map(i => i.rarity).filter(Boolean))], 'Toutes les raretés']
    ]) {
      const select = $(id), previous = select.value;
      select.replaceChildren(new Option(label, ''));
      values.sort((a, b) => a.localeCompare(b, 'fr')).forEach(v => select.add(new Option(v, v)));
      select.value = values.includes(previous) ? previous : '';
    }
  }
  function filteredItems() {
    const needle = $('rayon-search').value.trim().toLocaleLowerCase('fr');
    const category = $('rayon-category').value;
    const rarity = $('rayon-rarity').value;
    const availability = $('rayon-availability').value;
    return allItems().filter(item => {
      if (category && item.category !== category) return false;
      if (rarity && item.rarity !== rarity) return false;
      const other = GROUPS.map(g => original(g, item.id)).find(Boolean);
      if (needle && !`${item.name} ${item.id} ${item.category} ${item.description || ''} ${other?.subcategory || ''}`.toLocaleLowerCase('fr').includes(needle)) return false;
      const stocks = GROUPS.map(g => original(g, item.id) && draft(g, item.id)?.stock).filter(v => v !== undefined);
      const anyAvailable = stocks.some(v => v === null || v > 0);
      if (availability === 'available' && !anyAvailable) return false;
      if (availability === 'empty' && anyAvailable) return false;
      return true;
    });
  }
  function currentPrice(item) {
    // Le prix de référence est commun ; une ancienne divergence entre groupes
    // est signalée plutôt que silencieusement écrasée.
    const p1 = original('groupe1', item.id)?.pricePC;
    const p2 = original('groupe2', item.id)?.pricePC;
    return {value: Number.isSafeInteger(p1) ? p1 : p2, divergent: p1 != null && p2 != null && p1 !== p2};
  }
  function makeGroup(item, group) {
    const state = draft(group, item.id);
    const chip = create('div', 'rayon-chip');
    const handle = create('span', 'rayon-grab', group === 'groupe1' ? 'G1 ⠿' : 'G2 ⠿');
    handle.draggable = true;
    handle.title = 'Glisser seulement ce groupe';
    handle.tabIndex = 0;
    handle.setAttribute('aria-label', `Déplacer ${group === 'groupe1' ? 'Groupe 1' : 'Groupe 2'} uniquement`);
    handle.addEventListener('dragstart', ev => {ev.stopPropagation();startDrag(ev, {id: item.id, groups: [group]});});
    const input = create('input', 'rayon-stock-input');
    input.type = 'number'; input.min = '0'; input.max = '1000000'; input.step = '1';
    input.placeholder = '∞'; input.value = state.stock == null ? '' : String(state.stock);
    input.title = 'Quantité ; vide = illimité';
    input.setAttribute('aria-label', `Stock ${group === 'groupe1' ? 'G1' : 'G2'} : ${item.name}`);
    input.addEventListener('input', () => {
      const raw = input.value.trim();
      if (raw !== '' && (!/^\d+$/.test(raw) || Number(raw) > 1000000)) {
        input.setCustomValidity('Entier de 0 à 1 000 000, ou vide pour illimité.');
        input.reportValidity(); $('rayon-save').disabled = true;
        return;
      }
      input.setCustomValidity('');
      update(group, item.id, {stock: raw === '' ? null : Number(raw)});
    });
    chip.append(handle, input);
    return chip;
  }
  function detailsContent(item, zone, groups) {
    const panel = create('div', 'rayon-details');
    const parts = [];
    if (item.damage) parts.push(`DM : ${item.damage}`);
    if (item.armorMod) parts.push(`Protection : ${item.armorMod}`);
    if (item.quality) parts.push(`Qualité : +${item.quality}`);
    if (item.cofSpec?.base) parts.push(`Référence : ${item.cofSpec.base}`);
    const stats = create('div', 'rayon-stats', parts.join(' · ') || 'Objet du catalogue');
    panel.append(stats);
    const effects = (item.affixes || []).map(a => a.effect).filter(Boolean);
    if (effects.length) panel.append(create('p', '', 'Effet : ' + effects.join(' · ')));
    if (item.description) panel.append(create('p', '', 'Description : ' + item.description));
    const buttons = create('div', 'rayon-detail-actions');
    for (const group of groups) {
      const select = create('select');
      select.setAttribute('aria-label', 'Déplacer ' + item.name + ' ' + group);
      for (const [value, label] of [['normal', 'G' + (group === 'groupe1' ? 1 : 2) + ' · Boutique'], ['promo', 'G' + (group === 'groupe1' ? 1 : 2) + ' · Promotions'], ['secret', 'G' + (group === 'groupe1' ? 1 : 2) + ' · Secret']]) {
        select.add(new Option(label, value));
      }
      select.value = draft(group, item.id).shelf;
      select.addEventListener('change', () => { proposeMove(item.id, [group], select.value); });
      buttons.append(select);
    }
    const both = create('select');
    both.setAttribute('aria-label', 'Déplacer les deux groupes pour ' + item.name);
    both.add(new Option('Déplacer G1 + G2…', ''));
    for (const [value, label] of [['normal', '→ Boutique'], ['promo', '→ Promotions'], ['secret', '→ Secret']]) both.add(new Option(label, value));
    both.addEventListener('change', () => { if (both.value) proposeMove(item.id, GROUPS.filter(g => original(g, item.id)), both.value); both.value = ''; });
    buttons.append(both); panel.append(buttons);
    return panel;
  }
  function renderCard(item, zone, groups) {
    const card = create('article', 'rayon-card');
    card.draggable = false;
    card.dataset.itemId = item.id;
    // Drag contrôlé : la poignée / le nom déplacent les deux groupes, jamais une saisie de stock.
    const allGroupDrag = ev => {ev.stopPropagation();startDrag(ev, {id: item.id, groups: GROUPS.filter(g => original(g, item.id))});};
    card.addEventListener('dragend', clearDrag);
    const line = create('div', 'rayon-card-line');
    const grip = create('span', 'rayon-card-grip', '⠿'); grip.title = 'Glisser la carte pour les deux groupes';
    grip.draggable = true;
    grip.addEventListener('dragstart', ev => {ev.stopPropagation();startDrag(ev, {id: item.id, groups: GROUPS.filter(g => original(g, item.id))});});
    grip.addEventListener('dragend', clearDrag);
    const text = create('div', 'rayon-card-text');
    text.draggable = true; text.addEventListener('dragstart', allGroupDrag);
    text.append(create('strong', 'rayon-name', item.name));
    const sub = create('span', 'rayon-sub', `${item.rarity || 'Commun'} · ${A.formatPC(currentPrice(item).value || 0)}`);
    text.append(sub);
    if (currentPrice(item).divergent) text.append(create('span', 'rayon-warning', '⚠ Prix G1/G2 différents : réparer dans Vue d’ensemble'));
    const chips = create('div', 'rayon-chips');
    groups.forEach(g => chips.append(makeGroup(item, g)));
    const details = create('details', 'rayon-detail-fold');
    const summary = create('summary'); summary.title = 'Caractéristiques et déplacements alternatifs'; summary.setAttribute('aria-label', 'Détails de ' + item.name); summary.textContent = '⌄';
    details.append(summary, detailsContent(item, zone, groups));
    line.append(grip, text, chips);
    card.append(line, details);
    if (zone === 'promo') {
      const pcts = groups.map(g => draft(g, item.id).discount);
      const pctTxt = pcts.every(x => x === pcts[0]) ? `−${pcts[0]} %` : groups.map((g, i) => `G${g === 'groupe1' ? 1 : 2} −${pcts[i]} %`).join(' · ');
      card.append(create('span', 'rayon-discount-badge', pctTxt));
    }
    return card;
  }
  function render() {
    if (!data) return;
    const items = filteredItems();
    const byShelf = {normal: [], promo: [], secret: []};
    for (const item of items) {
      const map = new Map();
      for (const group of GROUPS) {
        if (!original(group, item.id)) continue;
        const zone = draft(group, item.id).shelf;
        if (!map.has(zone)) map.set(zone, []);
        map.get(zone).push(group);
      }
      for (const [zone, groups] of map) byShelf[zone].push({item, groups});
    }
    $('rayon-total').textContent = `${items.length} références affichées`;
    for (const zone of SHELVES) {
      const list = $('rayon-list-' + zone); list.replaceChildren();
      const rows = byShelf[zone];
      const max = expandedCount[zone];
      for (const {item, groups} of rows.slice(0, max)) list.append(renderCard(item, zone, groups));
      if (!rows.length) list.append(create('p', 'rayon-empty', 'Dépose des objets ici.'));
      $('rayon-count-' + zone).textContent = String(rows.length);
      const more = document.querySelector(`[data-more="${zone}"]`);
      more.classList.toggle('hidden', rows.length <= max);
      more.textContent = `Voir ${Math.min(45, rows.length - max)} objet(s) supplémentaires`;
    }
    showActions();
  }
  function clearDrag() {
    drag = null;
    document.querySelectorAll('.rayon-lane, .rayon-drop-target').forEach(n => n.classList.remove('rayon-over'));
  }
  function startDrag(event, payload) {
    drag = payload;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify(payload));
    }
  }
  function proposeMove(id, groups, shelf) {
    const validGroups = groups.filter(g => !!original(g, id));
    if (!validGroups.length || !SHELVES.includes(shelf)) return;
    if (shelf === 'promo') {
      modalRequest = {id, groups: validGroups, shelf};
      const target = validGroups.map(g => draft(g, id)).find(x => x.shelf === 'promo');
      $('rayon-discount').value = String(target?.discount || lastDiscount);
      $('rayon-discount-label').textContent = `${original(validGroups[0], id).name} — ${validGroups.map(g => g === 'groupe1' ? 'G1' : 'G2').join(' + ')}`;
      if (typeof $('rayon-discount-dialog').showModal === 'function') $('rayon-discount-dialog').showModal();
      else {
        const answer = prompt('Réduction en % (1 à 90)', String(lastDiscount));
        if (answer !== null) finishDiscount(Number(answer));
      }
      return;
    }
    for (const group of validGroups) update(group, id, {shelf});
    render();
  }
  function finishDiscount(pct) {
    if (!P.validPercent(pct)) { status('Réduction invalide : entre 1 et 90 %.', true); return; }
    if (!modalRequest) return;
    lastDiscount = pct;
    for (const group of modalRequest.groups) update(group, modalRequest.id, {shelf: 'promo', discount: pct});
    modalRequest = null;
    render();
  }
  async function digest(value) {
    if (!window.crypto?.subtle) throw Error('Le mot de passe nécessite une connexion HTTPS.');
    const raw = new TextEncoder().encode(value);
    const buf = await crypto.subtle.digest('SHA-256', raw);
    return [...new Uint8Array(buf)].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function expectedFeatured(group) {
    const feat = data.groups[group].featured || {};
    return JSON.stringify({itemIds: feat.itemIds || [], secretIds: feat.secretIds || [], discounts: feat.discounts || {}});
  }
  function buildFeature(group) {
    const feat = data.groups[group].featured || {};
    const promos = new Map((feat.itemIds || []).map(id => [id, Number(feat.discounts?.[id]) || 20]));
    const secrets = new Set(feat.secretIds || []);
    for (const [draftKey, next] of changes) {
      if (!draftKey.startsWith(group + '|')) continue;
      const id = draftKey.slice(group.length + 1);
      if (!original(group, id)) continue;
      promos.delete(id); secrets.delete(id);
      if (next.shelf === 'promo') promos.set(id, next.discount);
      else if (next.shelf === 'secret') secrets.add(id);
    }
    for (const id of [...promos.keys()]) if (secrets.has(id)) promos.delete(id);
    const itemIds = [...promos.keys()].filter(id => !!original(group, id));
    const secretIds = [...secrets].filter(id => !!original(group, id));
    return {itemIds, secretIds, discounts: Object.fromEntries(itemIds.map(id => [id, promos.get(id)]))};
  }
  async function save() {
    if (!data || busy) return;
    if ([...document.querySelectorAll('.rayon-stock-input')].some(input => !input.checkValidity())) return status('Corrige d’abord les quantités en erreur.', true);
    const newPass = $('rayon-password').value.trim();
    if (newPass && newPass.length < 12) return status('Le mot de passe doit compter au moins 12 caractères.', true);
    if (!changes.size && !newPass) return;
    const variants = GROUPS.map(group => ({group,
      edits: [...changes].filter(([k]) => k.startsWith(group + '|')),
      shelfChanged: [...changes].some(([k, v]) => k.startsWith(group + '|') && (v.shelf !== section(group, k.slice(group.length + 1)) || (v.shelf === 'promo' && v.discount !== originalPct(group, k.slice(group.length + 1))))),
      feature: buildFeature(group)
    }));
    for (const variant of variants) {
      const feature = variant.feature;
      if (feature.itemIds.length > 200 || feature.secretIds.length > 200) return status('Trop d’objets dans un rayon (limite 200 par groupe).', true);
      if (feature.secretIds.length && !newPass && !hashState[variant.group]) return status('Définis un mot de passe pour le rayon secret, ou recharge les paramètres MJ.', true);
      for (const [id, pct] of Object.entries(feature.discounts)) {
        if (!P.validPercent(pct)) return status(`Réduction invalide pour ${id}.`, true);
      }
    }
    if (changes.size > 350) return status('Trop de modifications à la fois (350 maximum). Enregistre en plusieurs fois.', true);
    if (!confirm(`Enregistrer ${changes.size} changement(s) et ${newPass ? 'mettre à jour le mot de passe secret' : 'conserver le mot de passe'} ? Les stocks seront modifiés seulement si tu as changé leurs valeurs.`)) return;
    busy = true; showActions();
    try {
      const token = newPass ? await digest(newPass) : null;
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      await A.db.runTransaction(async tx => {
        // Toutes les lectures précèdent la première écriture, conformément aux transactions Firestore.
        const reads = [];
        const originals = [];
        for (const {group, edits, shelfChanged} of variants) {
          const touchedStocks = edits.filter(([k, v]) => {
            const id = k.slice(group.length + 1);
            return v.stock !== saved(group, id)?.stock;
          });
          for (const [k] of touchedStocks) {
            const id = k.slice(group.length + 1);
            reads.push(tx.get(path(group, 'stocks', id)));
            originals.push({type: 'stock', group, id});
          }
          if (shelfChanged || token) {
            reads.push(tx.get(path(group, 'storefront', 'featured')));
            originals.push({type: 'featured', group});
            reads.push(tx.get(path(group, 'storefront', 'priceBook')));
            originals.push({type: 'book', group});
            reads.push(tx.get(path(group, 'privateSettings', 'secretShop')));
            originals.push({type: 'settings', group});
          }
        }
        const snapshots = await Promise.all(reads);
        const live = {groupe1: {}, groupe2: {}};
        for (let i = 0; i < snapshots.length; i++) {
          const {type, group, id} = originals[i];
          if (type === 'stock') {
            const actual = snapshots[i].exists ? snapshots[i].data().stock : null;
            const before = saved(group, id).stock;
            if (actual !== before) throw Error(`Stock de ${original(group, id).name} / ${group} modifié entre-temps (${stockText(actual)} au lieu de ${stockText(before)}). Recharge avant d’enregistrer.`);
          } else if (type === 'featured') {
            const feat = snapshots[i].exists ? snapshots[i].data() : {};
            const actual = JSON.stringify({itemIds: feat.itemIds || [], secretIds: feat.secretIds || [], discounts: feat.discounts || {}});
            if (actual !== expectedFeatured(group)) throw Error('Rayons modifiés depuis le chargement pour ' + group + '. Recharge avant d’enregistrer.');
            live[group].featured = feat;
          } else if (type === 'book') live[group].book = snapshots[i].exists ? snapshots[i].data() : null;
          else if (type === 'settings') live[group].settings = snapshots[i].exists ? snapshots[i].data() : null;
        }
        for (const {group, edits, shelfChanged, feature} of variants) {
          for (const [k, v] of edits) {
            const id = k.slice(group.length + 1);
            if (v.stock === saved(group, id)?.stock) continue;
            const ref = path(group, 'stocks', id);
            if (v.stock === null) tx.delete(ref);
            else tx.set(ref, {stock: v.stock, updatedAt: timestamp});
          }
          if (!shelfChanged && !token) continue;
          const existingHash = String(live[group].settings?.activeHash || '');
          const hash = token || existingHash;
          if (feature.secretIds.length && !hash) throw Error('Rayon secret sans mot de passe pour ' + group);
          const prices = live[group].book?.prices || A.makePriceBook(data.groups[group].items, data.catalog).prices;
          const promoPrices = {};
          for (const id of feature.itemIds) {
            if (!Number.isSafeInteger(prices[id])) throw Error('Prix publié indisponible pour ' + id + ' / ' + group);
            promoPrices[id] = P.salePricePC(prices[id], feature.discounts[id]);
          }
          tx.set(path(group, 'storefront', 'featured'), {...feature, updatedAt: timestamp});
          tx.set(path(group, 'storefront', 'priceBook'), {prices, promoPrices, updatedAt: timestamp});
          if (hash) {
            tx.set(path(group, 'secretShelves', hash), {itemIds: feature.secretIds, updatedAt: timestamp});
            if (token) tx.set(path(group, 'privateSettings', 'secretShop'), {activeHash: hash, updatedAt: timestamp});
          }
          if (token && existingHash && existingHash !== token) tx.delete(path(group, 'secretShelves', existingHash));
        }
      });
      changes.clear(); $('rayon-password').value = ''; justSaved = true;
      status('✓ Modifications enregistrées dans Firebase. Rechargement des stocks…');
      window.dispatchEvent(new CustomEvent('alaric-mj-request-reload'));
    } catch (error) {
      console.error('Enregistrement des rayons', error);
      status('Enregistrement refusé : ' + String(error?.message || error) + '. Vérifie les règles Firestore publiées et ton UID MJ.', true);
    } finally { busy = false; showActions(); }
  }
  async function loadHashes() {
    const generation = ++hashLoadGeneration;
    try {
      const snaps = await Promise.all(GROUPS.map(group => path(group, 'privateSettings', 'secretShop').get()));
      if (generation !== hashLoadGeneration) return;
      hashState = Object.fromEntries(GROUPS.map((group, i) => [group, snaps[i].exists ? String(snaps[i].data()?.activeHash || '') : '']));
    } catch (error) {
      console.warn('Lecture du mot de passe secret refusée', error);
      hashState = {groupe1: null, groupe2: null};
      status('Impossible de lire les paramètres du rayon secret : ' + String(error?.code || error?.message || error), true);
    }
  }
  function bind() {
    if (!$('rayon-board')) return;
    for (const lane of document.querySelectorAll('.rayon-lane, .rayon-drop-target')) {
      lane.addEventListener('dragover', ev => { if (!drag) return; ev.preventDefault(); lane.classList.add('rayon-over'); });
      lane.addEventListener('dragleave', ev => { if (!lane.contains(ev.relatedTarget)) lane.classList.remove('rayon-over'); });
      lane.addEventListener('drop', ev => {
        ev.preventDefault();
        let value = drag;
        if (!value) { try { value = JSON.parse(ev.dataTransfer?.getData('text/plain') || 'null'); } catch (_) {} }
        if (value?.id && Array.isArray(value.groups)) proposeMove(value.id, value.groups, lane.dataset.shelf || lane.dataset.dropTarget);
        clearDrag();
      });
    }
    for (const id of ['rayon-search', 'rayon-category', 'rayon-rarity', 'rayon-availability']) {
      $(id).addEventListener(id === 'rayon-search' ? 'input' : 'change', () => {
        Object.keys(expandedCount).forEach(k => { expandedCount[k] = 45; }); render();
      });
    }
    for (const more of document.querySelectorAll('[data-more]')) more.addEventListener('click', () => {expandedCount[more.dataset.more] += 45; render();});
    $('rayon-cancel').addEventListener('click', () => { changes.clear(); justSaved = false; $('rayon-password').value = ''; render(); });
    $('rayon-refresh').addEventListener('click', () => {
      if (changes.size && !confirm('Abandonner les modifications non enregistrées et recharger ?')) return;
      changes.clear(); justSaved = false; window.dispatchEvent(new CustomEvent('alaric-mj-request-reload'));
    });
    $('rayon-password').addEventListener('input', showActions);
    $('rayon-save').addEventListener('click', save);
    $('rayon-discount-dialog').addEventListener('close', () => {
      const dialog = $('rayon-discount-dialog');
      if (dialog.returnValue === 'confirm') {
        const pct = Number($('rayon-discount').value);
        if (P.validPercent(pct)) finishDiscount(pct);
        else status('La réduction doit être un nombre entier de 1 à 90 %.', true);
      }
      modalRequest = null;
    });
    document.addEventListener('alaric-mj-feature-add', event => {
      const {id, type} = event.detail || {};
      if (!id || !['promo', 'secret'].includes(type)) return;
      proposeMove(id, GROUPS.filter(g => original(g, id)), type);
    });
    function handleData(event) {
      if (changes.size && !confirm('Les données MJ ont été rechargées. Abandonner les déplacements non sauvegardés ?')) return;
      changes.clear(); data = event.detail; buildFilters(); render(); loadHashes();
    }
    window.addEventListener('alaric-mj-data', handleData);
    if (window.__alaricMjData) handleData({detail: window.__alaricMjData});
    A.auth.onAuthStateChanged(user => {
      if (!user) { data = null; changes.clear(); hashState = {groupe1: null, groupe2: null}; }
    });
  }
  bind();
})();
