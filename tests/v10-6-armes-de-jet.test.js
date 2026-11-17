'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,'data',f),'utf8'));
const bases=read('catalogue-objets-v2.json'),affixes=read('catalogue-affixes-v2.json'),links=read('catalogue-liaisons-v2.json'),cards=read('catalogue-rp-nouveau.json'),prices=read('pricing-model.json'),stock=read('stock-base-alaric-v2.json'),source=read('catalogue-officiel-reference-2026.json');
const jets={'DST-06':{pc:10,die:4,range:'5 m'},'DST-07':{pc:25,die:6,range:'5 m'},'DST-08':{pc:15,die:6,range:'10 m'}};
const ammo=affixes.filter(a=>a.id.startsWith('AM_')&&a.category==='Munition');
const by=(arr,key)=>new Map(arr.map(x=>[x[key],x]));
const B=by(bases,'id'),L=by(links,'id'),C=by(cards,'ref'),RL=by(source.LIAISONS,'Référence');
const win={ALARIC_CONFIG:{firebase:{},groups:{groupe1:'G1',groupe2:'G2'}}};
win.firebase={apps:[],initializeApp:()=>({}),firestore:()=>({}),auth:()=>({})};
const ctx={window:win,fetch:async url=>({ok:true,json:async()=>read(url.replace(/^data\//,''))}),console};
vm.runInNewContext(fs.readFileSync(path.join(root,'shared.js'),'utf8'),ctx);
vm.runInNewContext(fs.readFileSync(path.join(root,'js/pricing.js'),'utf8'),ctx);
test('trois armes de jet présentes comme armes, Q0 uniquement, 22 affixes munition',()=>{
 assert.equal(ammo.length,22);assert.equal(bases.length,76);assert.equal(links.length,2341);assert.equal(cards.length,2417);assert.equal(stock.length,55);
 for(const [id,expected] of Object.entries(jets)){
  const b=B.get(id);assert.ok(b,id);
  assert.equal(b.pricePC,expected.pc,id);assert.equal(b.qMax,0,id);assert.equal(b.weaponType,'Arme de jet',id);
  assert.equal(b.weaponDmDie,expected.die,id);assert.equal(b.weaponRange,expected.range,id);
  assert.deepEqual(new Set(b.allowedAffixIds),new Set(ammo.map(a=>a.id)),id);
  assert.ok(stock.some(x=>x.base===id&&!x.affix),id);
  for(const a of ammo){
   assert.ok(a.allowedBaseIds.includes(id),id+' '+a.id);
   const k=id+'|'+a.id;
   assert.equal(L.get(k)?.publication,'Prêt',k);assert.equal(C.get(k)?.publication,'Prêt',k);
   assert.equal(prices.links[k].status,'Actif',k);
   const expectedPC=expected.pc+Math.round(Number(prices.links['MUN-01|'+a.id].magicCostPA)*100);
   assert.equal(prices.links[k].pricePC,expectedPC,k);
   assert.equal(C.get(k).pricePC,expectedPC,k);
   assert.equal(RL.get(k).Statut,'Actif',k);
  }
 }
 assert.equal(prices.bases['DST-06'].qMax,0);
});
test('anciennes variantes permanentes archivées plutôt que proposées à la vente',()=>{
 const old=links.filter(x=>['DST-07','DST-08'].includes(x.itemId)&&!x.affixId.startsWith('AM_'));
 assert.equal(old.length,14);
 for(const l of old){assert.equal(l.publication,'Retiré',l.id);assert.equal(l.sourcePublication,'Exclu',l.id);
  assert.equal(C.get(l.id).publication,'Retiré',l.id);assert.equal(prices.links[l.id].status,'Exclu',l.id);
  assert.equal(RL.get(l.id).Statut,'Exclu',l.id);
 }
});
test('Roll20 : les trois objets sont transmissibles ; Q et second affixe refusés',async()=>{
 await win.AlaricPricing.load();const cat=await win.AlaricApp.loadCatalog();
 for(const id of Object.keys(jets)){
  const base=cat.stockBase.find(x=>x.cofSpec.base===id);assert.ok(base,id);
  assert.ok(win.AlaricApp.prepareRoll20Spec(base,cat).ok,id);
  assert.equal(win.AlaricPricing.calculate({cofSpec:{base:id,quality:0,affixes:[]}}).pricePC,jets[id].pc);
  assert.equal(win.AlaricPricing.calculate({cofSpec:{base:id,quality:1,affixes:[]}}),null);
  assert.equal(win.AlaricPricing.calculate({cofSpec:{base:id,quality:0,affixes:['AM_ATT_1','AM_EXP_1']}}),null);
  const p={name:'Essai '+id,pricePC:prices.links[id+'|AM_EXP_1'].pricePC,cofSpec:{base:id,quality:0,affixes:['AM_EXP_1']}};
  const spec=win.AlaricApp.prepareRoll20Spec(p,cat);assert.ok(spec.ok,spec.errors.join('|'));
  assert.equal(win.AlaricPricing.calculate(p).pricePC,p.pricePC);
  assert.equal(win.AlaricApp.prepareRoll20Spec({...p,cofSpec:{...p.cofSpec,quality:1}},cat).ok,false);
  assert.equal(win.AlaricApp.prepareRoll20Spec({...p,cofSpec:{...p.cofSpec,affixes:['AM_EXP_1','AM_RIC_1']}},cat).ok,false);
 }
});
