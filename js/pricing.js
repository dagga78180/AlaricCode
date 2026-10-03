/* AlaricCode V2 — moteur de prix Q/P. */
(function (global) {
  'use strict';

  let model = null;

  function number(value, fallback = NaN) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function commercialRound(value) {
    const n = number(value);
    if (!Number.isFinite(n)) return NaN;
    const step = n < 100 ? 1 : (n < 1000 ? 5 : 10);
    return Math.round(n / step) * step;
  }

  function rarity(rank) {
    const labels = ['Commun', 'Peu Commun', 'Inhabituel', 'Rare', 'Très Rare', 'Légendaire'];
    const r = Math.max(0, Math.min(5, Math.trunc(number(rank, 0))));
    return labels[r];
  }

  function calculate(item) {
    if (!model || !item || !item.cofSpec) return null;
    const spec = item.cofSpec;
    const base = model.bases && model.bases[String(spec.base || '')];

    if (!base) return null;

    const basePA = number(base.basePA);
    const difficulty = number(base.difficulty, 1);
    if (!Number.isFinite(basePA)) return null;

    const q = Math.max(0, Math.min(5, Math.trunc(number(spec.quality, 0))));
    let total = basePA;
    let rank = q;

    if (q > 0) {
      const qRef = number(model.qualityReferencePO && model.qualityReferencePO[String(q)]) * 100;
      const refBase = number(model.qualityReferenceBasePA, 5);
      const exponent = number(model.qualityMaterialExponent, 0.25);
      if (Number.isFinite(qRef)) total += qRef * Math.pow(Math.max(basePA, 0.01) / refBase, exponent);
    }

    const ids = Array.isArray(spec.affixes) ? spec.affixes : [];
    for (const id of ids) {
      const affix = model.affixes && model.affixes[String(id)];
      if (!affix) continue;
      const p = Math.max(0, Math.min(5, Math.trunc(number(affix.p, 0))));
      if (!p) continue;
      const pRef = number(model.powerReferencePO && model.powerReferencePO[String(p)]) * 100;
      if (!Number.isFinite(pRef)) continue;
      total += pRef * difficulty * number(affix.coef, 1) * number(affix.noise, 1);
      rank = Math.max(rank, p);
    }

    return { price: commercialRound(total), rarity: rarity(rank), rank };
  }

  function apply(item) {
    const calculated = calculate(item);
    if (!calculated) return item;
    const next = { ...item, price: calculated.price, rarity: calculated.rarity };
    if (item.cofSpec && typeof item.cofSpec === 'object') {
      next.cofSpec = {
        ...item.cofSpec,
        price: `${calculated.price} pa`,
        rarity: calculated.rarity
      };
    }
    return next;
  }

  async function load(url = 'data/pricing-model.json') {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Impossible de charger ${url} (HTTP ${response.status}).`);
    const data = await response.json();
    if (!data || typeof data !== 'object' || !data.bases || !data.affixes) {
      throw new Error(`${url} ne contient pas un modèle de prix valide.`);
    }
    model = data;
    return model;
  }

  global.AlaricPricing = { load, calculate, apply, commercialRound, rarity };
}(window));
