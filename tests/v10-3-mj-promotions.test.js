'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const P=require('../js/price-tools');
const {placeOrder}=require('../js/checkout-free');
const JSONfile=p=>JSON.parse(read(p));
test('arc court N32 : prix officiel 50 585 PC, dont le MJ peut restaurer les 63 prix de départ',()=>{
 const link=JSONfile('data/catalogue-liaisons-v2.json').find(l=>l.id==='DST-01|N32');
 assert.equal(link.priceMagiePC,50585);
 const selection=JSONfile('data/stock-base-alaric-v2.json');
 assert.ok(selection.some(x=>x.base==='DST-01'&&!x.affix));
 // La variante N32 existe comme liaison officielle mais pas dans les 63 articles par défaut.
 assert.equal(selection.some(x=>x.base==='DST-01'&&x.affix==='N32'),false);
 assert.match(read('mj-v5.js'),/Restaurer|repairOfficialPrices/);
 assert.match(read('mj-v5.js'),/A\.makePriceBook\(nextItems\[g\]/);
 assert.match(read('mj-v5.js'),/groupRef\.collection\('baseOverrides'\)/);
});
test('remise MJ : arrondi PC exact et pas de valeur libre hors 1..90%',()=>{
 assert.equal(P.salePricePC(50585,10),45527);
 assert.equal(P.salePricePC(50585,25),37939);
 assert.equal(P.salePricePC(100,90),10);
 for(const n of [0,91,20.5,NaN])assert.throws(()=>P.salePricePC(50585,n));
});
test('règles Firestore : seulement le MJ publie les tarifs, promoPrices documenté',()=>{
 const rules=read('firestore.rules');
 assert.match(rules,/bookId == 'priceBook' && isMJ\(\)/);
 assert.match(rules,/promoPrices/);
 assert.match(rules,/line\.get\('promo', false\)/);
 assert.match(rules,/discounts\.keys\(\)\.hasOnly/);
 assert.match(rules,/secretShelves/);
});
test('MJ V10.4 : filtres et glisser-déposer des deux rayons',()=>{
 const html=read('mj.html'),js=read('mj-v5.js'),rayons=read('js/rayons-mj.js');
 for(const id of ['stock-shelf','stock-price-min','stock-price-max','stock-search','stock-category','stock-rarity','repair-preview','repair-run','rayon-search','rayon-password','rayon-board','rayon-save','rayon-discount-dialog'])assert.ok(html.includes(`id="${id}"`),id);
 assert.match(js,/alaric-mj-feature-add/);
 assert.match(rayons,/startDrag/);
 assert.match(rayons,/function proposeMove/);
 assert.match(rayons,/P\.salePricePC/);
 assert.match(rayons,/A\.db\.runTransaction/);
});
test('le rayon Promotions utilise les mêmes cartes avec un prix réduit et ne laisse pas l’objet en double',()=>{
 const js=read('js/app.js');
 assert.match(js,/state\.activeView==='boutique'\) items=items\.filter\(it=>it\.visible && !state\.lockedIds\.has\(it\.id\) && !state\.featuredIds\.has\(it\.id\)/);
 assert.match(js,/priceTag\(item\)/);
 assert.match(js,/displayPrice\(item\)\.promo/);
 assert.match(js,/loadMerchandiseFeatures\(\)/);
});
const ORDER='11111111-2222-4333-8444-555555555555';
function fake(initial){
 const dbDocs=new Map(Object.entries(initial));
 const ref=parts=>({path:parts.join('/'),collection:n=>ref([...parts,n]),doc:n=>ref([...parts,n])});
 return {docs:dbDocs,db:{collection:n=>ref([n]),runTransaction:async job=>{
   const actions=[];
   const tx={get:async r=>({exists:dbDocs.has(r.path),data:()=>dbDocs.get(r.path)}),set:(r,val)=>actions.push(['set',r.path,val]),update:(r,val)=>actions.push(['update',r.path,val])};
   const result=await job(tx);
   for(const [type,id,val] of actions)dbDocs.set(id,type==='set'?val:{...dbDocs.get(id),...val});
   return result;
 }}};
}
const spec={base:'DST-01',quality:0,affixes:['N32'],name:'Arc court à monture compacte',price:'50585 pc'};
const line=(pricePC,promo)=>({id:'stock-dst-01-n32',name:'Arc court',qty:1,pricePC,promo,sourceSpec:spec,sourceName:spec.name,isCustom:false,spec});
const params=(db,l)=>({db,FieldValue:{serverTimestamp:()=>({timestamp:true})},group:'groupe1',orderId:ORDER,uid:'player-A',lines:[l]});
test('achat en promotion : stock déduit et commande Roll20 avec le prix réduit',async()=>{
 const {db,docs}=fake({
  'groups/groupe1/storefront/priceBook':{prices:{'stock-dst-01-n32':50585},promoPrices:{'stock-dst-01-n32':45527}},
  'groups/groupe1/stocks/stock-dst-01-n32':{stock:3}
 });
 const order=await placeOrder(params(db,line(45527,true)));
 assert.equal(order.totalPC,45527);
 assert.equal(order.checkoutLines['stock-dst-01-n32'].promo,true);
 assert.equal(docs.get('groups/groupe1/stocks/stock-dst-01-n32').stock,2);
 const data=JSON.parse(decodeURIComponent(order.roll20Command.split('--data ')[1]));
 assert.equal(data.items[0].price,'45527 pc');
});
test('achat en promotion : faux prix rejeté avant toute déduction',async()=>{
 const {db,docs}=fake({
  'groups/groupe1/storefront/priceBook':{prices:{'stock-dst-01-n32':50585},promoPrices:{'stock-dst-01-n32':45527}},
  'groups/groupe1/stocks/stock-dst-01-n32':{stock:2}
 });
 await assert.rejects(placeOrder(params(db,line(20000,true))),/prix ou la disponibilité/);
 assert.equal(docs.get('groups/groupe1/stocks/stock-dst-01-n32').stock,2);
});
