'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {placeOrder,validateLines}=require('../js/checkout-free');
const ID='11111111-2222-4333-8444-555555555555';
const ID2='11111111-2222-4333-8444-555555555556';
const product=(id='cac-01',qty=1,pricePC=100)=>({id,name:'Bâton de combat',qty,pricePC,sourceSpec:{base:'CAC-01',quality:0,affixes:[]},sourceName:'Bâton de combat',isCustom:false,spec:{base:'CAC-01',quality:0,affixes:[],name:'Bâton de combat',price:pricePC+' pc'}});
const field={serverTimestamp:()=>({timestamp:true})};
function fakeFirestore(initial={}){
 const docs=new Map(Object.entries(initial));
 const base={
  collection: name=>ref([name]),
  runTransaction:async fn=>{
   const updates=[];
   const tx={get:async r=>{
     const d=docs.get(r.path);return {exists:!!d,data:()=>d,id:r.path.split('/').at(-1)};
    },update:(r,v)=>updates.push(['update',r.path,v]),set:(r,v)=>updates.push(['set',r.path,v])};
   const result=await fn(tx);
   for(const [type,path,value] of updates){
     if(type==='update'&&!docs.has(path))throw Error('Unexpected missing document');
     docs.set(path,type==='set'?value:{...docs.get(path),...value});
   }
   return result;
  }
 };
 function ref(parts){return {path:parts.join('/'),collection:n=>ref([...parts,n]),doc:n=>ref([...parts,n])};}
 return {db:base,docs};
}
function context(d,opts={}){return {db:d.db,FieldValue:field,group:'groupe1',orderId:ID,uid:'player-A',lines:[product()],...opts};}
const book={'groups/groupe1/storefront/priceBook':{prices:{'cac-01':100,'dst-01':400}}};
test('achat limité atomique + historique + commande Roll20 exacte',async()=>{
 const fs=fakeFirestore({...book,'groups/groupe1/stocks/cac-01':{stock:3}});
 const result=await placeOrder(context(fs));
 assert.equal(fs.docs.get('groups/groupe1/stocks/cac-01').stock,2);
 assert.equal(fs.docs.get('groups/groupe1/stocks/cac-01').lastOrderId,ID);
 assert.equal(result.items[0].stockBefore,3);
 assert.equal(result.items[0].stockAfter,2);
 assert.equal(result.totalPC,100);
 assert.ok(result.roll20Command.startsWith('!co-alaric panier --target @{target|PJ|character_id} --data '));
 const parsed=JSON.parse(decodeURIComponent(result.roll20Command.split('--data ')[1]));
 assert.equal(parsed.items[0].base,'CAC-01');assert.equal(parsed.items[0].price,'100 pc');
 const second=await placeOrder(context(fs));
 assert.equal(second.roll20Command,result.roll20Command);
 assert.equal(fs.docs.get('groups/groupe1/stocks/cac-01').stock,2);
});
test('stock illimité : commande sans écriture de stock',async()=>{
 const fs=fakeFirestore(book);
 const result=await placeOrder(context(fs));
 assert.equal(result.items[0].stockBefore,null);
 assert.equal(result.items[0].stockAfter,null);
 assert.equal(fs.docs.has('groups/groupe1/stocks/cac-01'),false);
});
test('stock insuffisant : aucune écriture même avec plusieurs lignes',async()=>{
 const fs=fakeFirestore({...book,'groups/groupe1/stocks/cac-01':{stock:1},'groups/groupe1/stocks/dst-01':{stock:1}});
 await assert.rejects(placeOrder(context(fs,{lines:[product('cac-01',1,100),product('dst-01',2,400)]})),/Stock insuffisant/);
 assert.equal(fs.docs.get('groups/groupe1/stocks/cac-01').stock,1);
 assert.equal(fs.docs.has('groups/groupe1/orders/'+ID),false);
});
test('prix modifié : aucun stock déduit',async()=>{
 const fs=fakeFirestore({...book,'groups/groupe1/stocks/cac-01':{stock:2}});
 await assert.rejects(placeOrder(context(fs,{lines:[product('cac-01',1,50)]})),/prix ou la disponibilité/);
 assert.equal(fs.docs.get('groups/groupe1/stocks/cac-01').stock,2);
});
test('prix non publié : instruction compréhensible',async()=>{
 const fs=fakeFirestore({'groups/groupe1/stocks/cac-01':{stock:2}});
 await assert.rejects(placeOrder(context(fs)),/MJ doit ouvrir son espace/);
});
test('commandes et stocks séparés par groupe',async()=>{
 const fs=fakeFirestore({...book,'groups/groupe1/stocks/cac-01':{stock:3},'groups/groupe2/storefront/priceBook':{prices:{'cac-01':100}},'groups/groupe2/stocks/cac-01':{stock:5}});
 await placeOrder(context(fs));
 await placeOrder(context(fs,{group:'groupe2',orderId:ID2}));
 assert.equal(fs.docs.get('groups/groupe1/stocks/cac-01').stock,2);
 assert.equal(fs.docs.get('groups/groupe2/stocks/cac-01').stock,4);
});
test('identité différente ne peut pas récupérer une commande existante',async()=>{
 const fs=fakeFirestore({...book});await placeOrder(context(fs));
 await assert.rejects(placeOrder(context(fs,{uid:'player-B'})),/autre session/);
});
test('limites Roll20 imposées',()=>{
 assert.throws(()=>validateLines([]),/50/);
 assert.throws(()=>validateLines([product('cac-01',101)]),/quantité/);
 assert.throws(()=>validateLines([product(),product()]),/référence/);
});
