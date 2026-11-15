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
    const spec=item.cofSpec;
    const base=model.bases?.[String(spec.base||'')];if(!base)return null;
    const q=Number(spec.quality||0), ids=Array.isArray(spec.affixes)?spec.affixes:[];
    if(!Number.isInteger(q)||q<0||q>Number(base.qMax??0))return null;
    if(base.saleTemplate&&!ids.length)return null;
    const physical=Number(base.basePC);
    if(!Number.isSafeInteger(physical)||physical<0)return null;
    let pc=physical;
    if(q>0){
      const rule=model.quality;
      pc+=Math.round((Number(rule.q1FixedPA)+Number(rule.q1PhysicalWeight)*(physical/100))*Math.pow(Number(rule.multiplier),q-1)*100);
    }
    let power=0;
    for(const id of ids){
      const link=model.links?.[spec.base+'|'+id],affix=model.affixes?.[id];
      if(!link||!Number.isSafeInteger(link.pricePC)||!affix||affix.status!=='Actif')return null;
      pc+=link.pricePC-physical;
      power=Math.max(power,Number(affix.p)||0);
    }
    if(!Number.isSafeInteger(pc)||pc<0)return null;
    const labels=['Commun','Peu Commun','Inhabituel','Rare','Exceptionnel','Précieux','Épique','Légendaire','Mythique','Artefact','Objet Divin'];
    const rank=Math.max(0,Math.min(10,base.category==='consommable'?power-1:q+power));
    return {price:pc/100,pricePC:pc,rarity:labels[rank],rank};
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

  function powerForAffix(id){return Number(model?.affixes?.[String(id)]?.p)||0;}
  global.AlaricPricing = { load, calculate, apply, commercialRound, rarity, powerForAffix };
}(window));
