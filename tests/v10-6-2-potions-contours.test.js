'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const palette=json('assets/icons/palette.json').map(p=>p.color);
const window={ALARIC_CONFIG:{firebase:{},groups:{groupe1:'a',groupe2:'b'}},firebase:{apps:[],initializeApp:()=>({}),firestore:()=>({}),auth:()=>({})}};
const context={window,fetch:async path=>({ok:true,json:async()=>json(path)}),console};
vm.runInNewContext(read('shared.js'),context);
const A=window.AlaricApp;
const decode=data=>decodeURIComponent(data.slice(data.indexOf(',')+1));
const attr=(xml,colour)=>new RegExp(`fill="${colour}"`,'i').test(xml);
const border=(xml,colour)=>new RegExp(`stroke="${colour}"`,'i').test(xml);

test('potions R00-R10 : contour silhouette/cadre rareté, liquide rouge ou bleu immuable',async()=>{
 await A.loadCatalog();
 const source=json('data/icones-consommables-v2.json');
 for(const id of ['CON-01','CON-02']){
   assert.match(source[id],/fill="#ffffff"/);
   const liquid=id==='CON-01'?'#d0021b':'#48baff';
   for(let r=0;r<=10;r++){
     const svg=decode(A.tieredIcon(`assets/icons/catalogue-v2/${id}.svg`,r));
     const colour=palette[r];
     assert.ok(attr(svg,liquid),`${id} R${r} liquide`);
     assert.ok(attr(svg,colour),`${id} R${r} flacon`);
     assert.ok(border(svg,colour),`${id} R${r} cadre`);
     assert.ok(border(svg,'#000000'),`${id} R${r} bulles`);
     if(r>0) assert.ok(!attr(svg,'#ffffff') || colour==='#ffffff',`${id} R${r} ne doit pas avoir de silhouette blanche`);
   }
 }
});
