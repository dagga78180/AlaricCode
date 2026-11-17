'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const json=(p)=>JSON.parse(read(p));
const palette=json('assets/icons/palette.json').map(x=>x.color);
const win={ALARIC_CONFIG:{firebase:{},groups:{groupe1:'G1',groupe2:'G2'}}};
win.firebase={apps:[],initializeApp:()=>({}),firestore:()=>({}),auth:()=>({})};
const context={window:win,fetch:async url=>({ok:true,json:async()=>json(url)}),console};
vm.runInNewContext(read('shared.js'),context);
const A=win.AlaricApp;
const decodeIcon=url=>{
  assert.ok(url.startsWith('data:image/svg+xml;charset=utf-8,'),url);
  return decodeURIComponent(url.split(',').slice(1).join(','));
};
const fills=xml=>[...xml.matchAll(/fill="(#[0-9a-fA-F]{6})"/g)].map(m=>m[1].toLowerCase());
const strokes=xml=>[...xml.matchAll(/stroke="(#[0-9a-fA-F]{6})"/g)].map(m=>m[1].toLowerCase());

test('les trois SVG fournis remplacent bien le couteau, le soin et le mana',()=>{
  const knife=read('assets/icons/catalogue-v2/DST-06_R00.svg');
  assert.match(knife,/M92\.563 18\.563/);
  assert.doesNotMatch(knife,/M43\.53 15\.75/);
  const heal=json('data/icones-consommables-v2.json')['CON-01'];
  const mana=json('data/icones-consommables-v2.json')['CON-02'];
  assert.match(heal,/translate\(25\.6, 25\.6\) scale\(0\.9, 0\.9\)/);
  assert.match(mana,/translate\(486\.4, 25\.6\) scale\(-0\.9, 0\.9\)/);
});

test('les 11 icônes SVG du couteau reprennent la palette exacte',()=>{
  for(let r=0;r<=10;r++){
    const icon=read(`assets/icons/catalogue-v2/DST-06_R${String(r).padStart(2,'0')}.svg`);
    assert.match(icon,/M92\.563 18\.563/);
    assert.ok(fills(icon).includes(palette[r].toLowerCase()),`couteau R${r}`);
    assert.ok(strokes(icon).includes(palette[r].toLowerCase()),`bordure couteau R${r}`);
  }
});

test('pour les potions, les couleurs restent rouge/bleu à chaque rang et la bordure indique la rareté',async()=>{
  await A.loadCatalog();
  const expectedRed=['#ff777e','#ff636d','#ff5465','#ff465a','#ff3860'];
  const expectedBlue=['#75c5ff','#62b8ff','#50acff','#438dfc','#537ffc'];
  for(let rank=0;rank<5;rank++){
    const health=decodeIcon(A.tieredIcon('assets/icons/catalogue-v2/CON-01.svg',rank));
    const mana=decodeIcon(A.tieredIcon('assets/icons/catalogue-v2/CON-02.svg',rank));
    assert.ok(fills(health).includes(expectedRed[rank]),'soins R'+rank);
    assert.ok(fills(mana).includes(expectedBlue[rank]),'mana R'+rank);
    assert.ok(strokes(health).includes(palette[rank]),'bordure soins R'+rank);
    assert.ok(strokes(mana).includes(palette[rank]),'bordure mana R'+rank);
    // Autres potions = palette de rareté habituelle.
    const other=decodeIcon(A.tieredIcon('assets/icons/catalogue-v2/CON-03.svg',rank));
    assert.ok(fills(other).includes(palette[rank]),'autre potion R'+rank);
    assert.ok(strokes(other).includes(palette[rank]),'autre potion bordure R'+rank);
  }
});

test('les armes de jet avec affixes munitions restent Q0, les rangs démarrent à R00',async()=>{
  const cat=await A.loadCatalog();
  for(const base of ['DST-06','DST-07','DST-08']){
    for(let p=1;p<=5;p++){
      const item={sourceId:base,category:'arme',quality:0,cofSpec:{base,quality:0,affixes:[{id:'demo',tier:p}]}};
      assert.equal(A.computeIconRank(item,cat.affixes).rank,p-1,`${base} P${p}`);
    }
  }
  const unePotion={sourceId:'CON-01',category:'consommable',quality:0,cofSpec:{base:'CON-01',affixes:[{id:'demo',tier:5}]}};
  assert.equal(A.computeIconRank(unePotion).rank,4);
  const uneEpee={sourceId:'CAC-04',category:'arme',quality:2,cofSpec:{base:'CAC-04',affixes:[{id:'demo',tier:3}]}};
  assert.equal(A.computeIconRank(uneEpee).rank,5);
});

test('les icônes sont utilisées sur les deux boutiques et l’interface MJ',()=>{
  for(const file of ['groupe1.html','groupe2.html','mj.html'])
    assert.match(read(file),/shared\.js\?v=1062-potions-contours-rarete/);
  assert.match(read('js/app.js'),/API\.tieredIcon\(explicitIcon/);
  assert.match(read('mj-v5.js'),/A\.tieredIcon\(A\.catalogueIconForItem/);
});
