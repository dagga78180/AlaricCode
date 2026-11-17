'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.join(__dirname,'..');
const load=(p)=>JSON.parse(fs.readFileSync(path.join(ROOT,'data',p),'utf8'));
const affixes=load('catalogue-affixes-v2.json');
const bases=load('catalogue-objets-v2.json');
const links=load('catalogue-liaisons-v2.json');
const cards=load('catalogue-rp-nouveau.json');
const prices=load('pricing-model.json');
const source=load('catalogue-officiel-reference-2026.json');
const mapping={
  ACC_ATT_CAC:'bonusAttaqueContactEquipement',
  ACC_ATT_DIST:'bonusAttaqueDistanceEquipement',
  ACC_ATT_MAG:'bonusAttaqueMagiqueEquipement',
  ACC_DM_CAC:'bonusDMContactEquipement',
  ACC_DM_DIST:'bonusDMDistanceEquipement',
  ACC_DM_MAG:'bonusDMMagiqueEquipement'
};
const named=Object.keys(mapping).flatMap(prefix=>[`${prefix}_1`,`${prefix}_2`]);
const retired=['ACC_ATT_1','ACC_ATT_2','ACC_DM_1','ACC_DM_2'];
const by=(arr,key)=>new Map(arr.map(x=>[x[key],x]));
const A=by(affixes,'id'),B=by(bases,'id'),L=by(links,'id'),C=by(cards,'ref');

test('catalogue exact, anciens affixes supprimés et 12 affixes spécialisés créés',()=>{
 assert.equal(affixes.length,525);assert.equal(links.length,2275);assert.equal(cards.length,2350);
 for(const id of retired){assert.equal(A.has(id),false,id);assert.equal(prices.affixes[id],undefined,id);}
 for(const [id,suffix] of named.map(id=>[id,id.endsWith('_1')?1:2])){
  const prefix=id.slice(0,-2);
  const a=A.get(id),row=source.AFFIXES.find(r=>r['ID affixe']===id);
  assert.ok(a&&row,id);
  assert.equal(a.predicates,`${mapping[prefix]}:${suffix}`,id);
  assert.equal(a.roll20Predicate,row['Prédicat Roll20'],id);
  assert.equal(a.effect,row['Effet court'],id);
  assert.deepEqual(a.allowedBaseIds,['ACC-01','ACC-05'],id);
  assert.equal(prices.affixes[id].p,suffix,id);
  assert.equal(a.auto,false,'L’application ne doit pas promettre une automatisation Roll20 non vérifiée');
 }
 for(const base of ['ACC-01','ACC-05']){
  const allowed=B.get(base).allowedAffixIds;
  for(const id of named){
   assert.ok(allowed.includes(id),`${base}|${id}`);
   const ref=`${base}|${id}`;
   assert.ok(L.has(ref)&&C.has(ref),ref);
   assert.equal(C.get(ref).roll20Predicate,A.get(id).roll20Predicate,ref);
   assert.equal(L.get(ref).pricePCOfficial,prices.links[ref].pricePC,ref);
  }
  for(const id of retired){assert.ok(!allowed.includes(id),base+'|'+id);assert.ok(!L.has(base+'|'+id));}
 }
});

test('pont Roll20 : une création MJ envoie le prédicat officiel exact',async()=>{
 const win={ALARIC_CONFIG:{firebase:{},groups:{groupe1:'G1',groupe2:'G2'}}};
 win.firebase={apps:[],initializeApp:()=>({}),firestore:()=>({}),auth:()=>({})};
 const ctx={window:win,fetch:async url=>({ok:true,json:async()=>load(url.replace(/^data\//,''))}),console};
 vm.runInNewContext(fs.readFileSync(path.join(ROOT,'shared.js'),'utf8'),ctx);
 const catalog=await win.AlaricApp.loadCatalog();
 for(const id of named){
  const spec=win.AlaricApp.prepareRoll20Spec({name:'Anneau test',pricePC:100000,cofSpec:{base:'ACC-01',quality:0,affixes:[id]}},catalog);
  assert.equal(spec.ok,true,id);
  assert.equal(spec.spec.config[id].predicat,A.get(id).roll20Predicate,id);
 }
 const old=win.AlaricApp.prepareRoll20Spec({name:'Ancien bonus',pricePC:100000,cofSpec:{base:'ACC-01',quality:0,affixes:[retired[0]]}},catalog);
 assert.equal(old.ok,false);
 assert.match(old.errors.join('; '),/Affixe inexistant/);
});

test('correctifs V10.5.1 conservés malgré la divergence du nouveau classeur sur les élixirs',()=>{
 for(const car of ['CHA','CON','DEX','FOR','INT','SAG'])for(const level of [1,2]){
  const id=`CO_ELIXIR_${car}_${level}`;
  assert.equal(A.get(id).p,level===1?2:4);
  assert.equal(A.get(id).coefficient,1.25);
  assert.equal(prices.affixes[id].p,level===1?2:4);
 }
});
