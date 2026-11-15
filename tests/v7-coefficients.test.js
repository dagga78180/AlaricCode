const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.join(__dirname,'..');
const load=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
const model=load('data/pricing-model.json');
const supports=load('data/catalogue-objets-v2.json');
const affixes=load('data/catalogue-affixes-v2.json');
const liens=load('data/catalogue-liaisons-v2.json');
const win={ALARIC_CONFIG:{firebase:{},groups:{groupe1:'G1',groupe2:'G2'}}};
win.firebase={apps:[],initializeApp:()=>({}),firestore:()=>({}),auth:()=>({})};
const ctx={window:win,fetch:async url=>({ok:true,json:async()=>load(url)}),console};
vm.runInNewContext(fs.readFileSync(path.join(ROOT,'js/pricing.js'),'utf8'),ctx);
vm.runInNewContext(fs.readFileSync(path.join(ROOT,'shared.js'),'utf8'),ctx);
const pricing=win.AlaricPricing;
test('référentiel complet, coefficients et malus officiels',()=>{
 assert.equal(supports.length,75);assert.equal(affixes.length,536);assert.equal(liens.length,2278);
 assert.equal(Object.keys(model.groupCoefficients).length,201);
 assert.equal(Object.keys(model.links).length,2168);
 assert.equal(model.magicBasePA['1'],450);
 assert.equal(model.magicBasePA['5'],24300);
 assert.equal(model.quality.q1FixedPA,550);
 assert.equal(model.synergyRate,0.05);
 assert.equal(supports.find(x=>x.id==='BCL-01').playerMalus,'−1');
 assert.equal(supports.find(x=>x.id==='BCL-02').playerMalus,'−2');
});
test('chaque prix officiel publiable est égal au tarif du catalogue arrondi au PC',async()=>{
 await pricing.load();
 for(const [key,link] of Object.entries(model.links)){
   const [base,affix]=key.split('|');
   const got=pricing.calculate({cofSpec:{base,quality:0,affixes:[affix]}});
   assert.ok(got,key);
   assert.equal(got.pricePC,link.pricePC,key);
 }
});
test('Q et synergie appliquées aux surcoûts sans multiplier le support',()=>{
 const base='CAC-01', affix='CAC_ELEM_AIR_1',B=model.bases[base].basePC/100;
 const p=model.affixes[affix].p;
 const q=2;
 const costQ=(550+0.8*B)*3**(q-1);
 const costP=Number(model.links[base+'|'+affix].magicCostPA);
 const price=Math.round((B+(costQ+costP)*(1+0.05*q*p))*100);
 assert.equal(pricing.calculate({cofSpec:{base,quality:q,affixes:[affix]}}).pricePC,price);
});
test('un multi-affixe signale une estimation et les affixes non publiables sont refusés',()=>{
 const result=pricing.calculate({cofSpec:{base:'CAC-01',quality:1,affixes:['CAC_ELEM_AIR_1','CAC_ELEM_AIR_2']}});
 assert.ok(result?.pricePC>0);assert.equal(result.estimated,true);
 assert.equal(pricing.calculate({cofSpec:{base:'CON-01',quality:0,affixes:[]}}),null);
 assert.equal(pricing.calculate({cofSpec:{base:'CON-02',quality:0,affixes:['CO_MANA_6']}}),null);
});
test('chargement de 63 références stock avec lien de prix exact et schéma Roll20 intact',async()=>{
 const catalogue=await win.AlaricApp.loadCatalog();
 assert.equal(catalogue.stockBase.length,63);
 for(const item of catalogue.stockBase){
   assert.ok(Number.isSafeInteger(item.pricePC));
   assert.ok(win.AlaricApp.prepareRoll20Spec(item,catalogue).ok, item.id);
   assert.ok(item.previousStandardPricePC!==undefined,item.id);
 }
 const previous=load('data/catalogue-prix-precedents-v6.json');
 const r=catalogue.stockBase.find(x=>x.id==='stock-con-01-co_soins_1');
 assert.equal(r.pricePC,2250);assert.equal(previous[r.id],2500);
 const overrides=new Map([[r.id,{visible:true,pricePC:2500}]]);
 const merged=win.AlaricApp.overlay([r],[],overrides,new Map(),catalogue.base);
 assert.equal(merged[0].pricePC,2250);
 const customised=win.AlaricApp.overlay([r],[],new Map([[r.id,{visible:true,pricePC:1800}]]),new Map(),catalogue.base);
 assert.equal(customised[0].pricePC,1800);
});
test('atelier MJ : prix Q0 exacts et même barème de synergie que le moteur commun',()=>{
 const src=fs.readFileSync(path.join(ROOT,'mj-v5.js'),'utf8');
 const start=src.indexOf('function computePrice(t,ids,q){');
 const end=src.indexOf('function editorObject()',start);
 assert.ok(start>=0 && end>start);
 const editor=new Function('priceModel',src.slice(start,end)+'\nreturn computePrice;')(model);
 for(const [key,link] of Object.entries(model.links)){
   const [base,affix]=key.split('|');
   assert.equal(editor({sourceId:base,pricePC:model.bases[base].basePC},[affix],0).price,link.pricePC,key);
 }
 const t={sourceId:'CAC-01',pricePC:model.bases['CAC-01'].basePC};
 assert.equal(editor(t,['CAC_ELEM_AIR_1'],2).price,
   pricing.calculate({cofSpec:{base:'CAC-01',quality:2,affixes:['CAC_ELEM_AIR_1']}}).pricePC);
 assert.match(editor(t,['CAC_ELEM_AIR_1','CAC_ELEM_AIR_2'],2).note,/Estimation/);
});
