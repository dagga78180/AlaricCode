"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const get=f=>JSON.parse(fs.readFileSync(path.join(ROOT,'data',f),'utf8'));
const affixes=get('catalogue-affixes-v2.json'), links=get('catalogue-liaisons-v2.json'), cards=get('catalogue-rp-nouveau.json'), price=get('pricing-model.json'), stock=get('stock-base-alaric-v2.json'), official=get('catalogue-officiel-reference-2026.json');
const families=['CHA','CON','DEX','FOR','INT','SAG'];
const deleted=[...families.map(car=>['CON-03',`CO_ELIXIR_${car}_1`]),['CON-08','CO_GRE_FEU_1'],['CON-10','CO_DEF_3']];
test('élixirs : paliers P2/P4 et coefficient 1,25 pour les 12 affixes',()=>{
 for(const car of families)for(const level of [1,2]){
  const id=`CO_ELIXIR_${car}_${level}`, power=level===1?2:4;
  const a=affixes.find(x=>x.id===id), l=links.find(x=>x.id===`CON-03|${id}`), c=cards.find(x=>x.ref===`CON-03|${id}`);
  assert.ok(a&&l&&c,id);
  assert.equal(a.p,power,id); assert.equal(a.tier,power,id); assert.equal(a.power,power,id); assert.equal(a.coefficient,1.25,id);
  assert.equal(l.palier,power,id); assert.equal(l.coefficient,1.25,id); assert.equal(c.power,power,id);
  assert.equal(price.affixes[id].p,power,id); assert.equal(price.affixes[id].coefficient,1.25,id);
  assert.equal(price.links[`CON-03|${id}`].p,power,id);
  assert.equal(price.links[`CON-03|${id}`].pricePC,level===1?3500:15120,id);
  const ar=official.AFFIXES.find(x=>x['ID affixe']===id);
  const cr=official.CATALOGUE.find(x=>x['Référence']===`CON-03|${id}`);
  assert.equal(ar.P,power,id);assert.equal(ar.Coefficient,1.25,id);assert.equal(cr.P,power,id);
 }
});
test('stock initial : 55 articles, sans les 8 références retirées',()=>{
 assert.equal(stock.length,55); for(const [base,affix] of deleted) assert.equal(stock.some(r=>r.base===base&&r.affix===affix),false,`${base} ${affix}`);
});
test('les 8 références retirées restent disponibles dans le créateur officiel',()=>{
 const bases=get('catalogue-objets-v2.json');
 for(const [base,affix] of deleted){
  assert.ok(bases.find(r=>r.id===base)?.allowedAffixIds?.includes(affix),`${base} / ${affix}`);
  assert.ok(affixes.find(r=>r.id===affix),affix);
  assert.ok(links.find(r=>r.id===`${base}|${affix}`),`${base}|${affix}`);
 }
});
