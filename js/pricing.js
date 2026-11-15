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

  // Barème validé : B + (Q + somme(P)) × (1 + 0,05 × Q × Pmax).
  // Le fichier de prix contient les valeurs Q0 officielles. Pour les combinaisons
  // de plusieurs affixes, le calcul est une estimation explicitement signalée.
  function calculate(item) {
    if (!model || !item || !item.cofSpec) return null;
    const spec=item.cofSpec,base=model.bases?.[String(spec.base||'')];
    if(!base)return null;
    const q=Number(spec.quality||0), ids=Array.isArray(spec.affixes)?spec.affixes:[];
    if(!Number.isInteger(q)||q<0||q>Number(base.qMax??0))return null;
    if(base.saleTemplate&&!ids.length)return null;
    if(new Set(ids).size!==ids.length)return null;
    const physical=Number(base.basePC);
    if(!Number.isSafeInteger(physical)||physical<0)return null;
    const B=physical/100;
    const rule=model.quality||{};
    const qualityPA=q>0 ? (Number(rule.q1FixedPA)+Number(rule.q1PhysicalWeight)*B)*Math.pow(Number(rule.multiplier),q-1) : 0;
    if(!Number.isFinite(qualityPA))return null;
    let magicPA=0,power=0;
    for(const id of ids){
      const link=model.links?.[spec.base+'|'+id],affix=model.affixes?.[id];
      if(!link||link.status!=='Actif'||!affix||affix.status!=='Actif')return null;
      const value=Number(link.magicCostPA);
      if(!Number.isFinite(value)||value<0)return null;
      magicPA+=value;
      power=Math.max(power,Number(affix.p)||0);
    }
    const sy=1+Number(model.synergyRate||0)*q*power;
    const only=ids.length===1 ? model.links?.[spec.base+'|'+ids[0]] : null;
    // Reprend le prix arrondi officiel de la liaison Q0 : évite les
    // écarts d'un PC dus aux flottants lors du recalcul.
    const pc=q===0 && only ? Number(only.pricePC) : Math.round((B+(qualityPA+magicPA)*sy)*100);
    if(!Number.isSafeInteger(pc)||pc<0)return null;
    const labels=['Commun','Peu Commun','Inhabituel','Rare','Exceptionnel','Précieux','Épique','Légendaire','Mythique','Artefact','Objet Divin'];
    const rank=Math.max(0,Math.min(10,base.category==='consommable'?power-1:q+power));
    return {price:pc/100,pricePC:pc,rarity:labels[rank],rank,estimated:ids.length>1};
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
