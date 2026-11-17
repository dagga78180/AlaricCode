'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const load=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
const source=load('data/catalogue-officiel-reference-2026.json');
const bases=load('data/catalogue-objets-v2.json');
const affixes=load('data/catalogue-affixes-v2.json');
const links=load('data/catalogue-liaisons-v2.json');
const cards=load('data/catalogue-rp-nouveau.json');
const model=load('data/pricing-model.json');
const by=(data,key)=>new Map(data.map(r=>[r[key],r]));
const officialPC=pa=>{const [whole,fraction='']=String(pa).split('.');return Number(whole)*100+Number(fraction.padEnd(2,'0').slice(0,2))+(Number(fraction[2]||0)>=5?1:0);};
const sources={bases:by(source.OBJETS,'ID objet'),affixes:by(source.AFFIXES,'ID affixe'),links:by(source.LIAISONS,'Référence'),cards:by(source.CATALOGUE,'Référence')};

test('fichiers catalogue : chaque identifiant provient du classeur final',()=>{
  assert.equal(bases.length,75);assert.equal(affixes.length,525);assert.equal(links.length,2275);assert.equal(cards.length,2350);
  for(const [rows,map,key] of [[bases,sources.bases,'id'],[affixes,sources.affixes,'id'],[links,sources.links,'id'],[cards,sources.cards,'ref']]){
    assert.equal(new Set(rows.map(x=>x[key])).size,rows.length,'identifiants doublons');
    for(const row of rows)assert.ok(map.has(row[key]),row[key]);
  }
});

test('objets et affixes : noms, RP, effets et coûts officiels',()=>{
  for(const o of bases){
    const r=sources.bases.get(o.id);
    assert.equal(o.name,r['Nom RP'],o.id);
    assert.equal(o.description,r['Description RP'],o.id);
    assert.equal(o.pricePC,r['Prix physique (PC)'],o.id);
    assert.equal(o.qMax,r['Q max'],o.id);
  }
  for(const a of affixes){
    const r=sources.affixes.get(a.id);
    assert.equal(a.name,r['Nom technique'],a.id);
    assert.equal(a.rpName,r['Nom RP / modèle'],a.id);
    assert.equal(a.effect,r['Effet court'],a.id);
    assert.equal(a.rpDescription,r['Description RP'],a.id);
    assert.equal(a.technicalMJ,r['Effet MJ'],a.id);
  }
});

test('liaisons : 2275 noms, descriptions et prix exacts depuis Excel',()=>{
  for(const l of links){
    const r=sources.links.get(l.id);
    assert.equal(l.name,r['Nom RP'],l.id);
    assert.equal(l.description,r['Description RP'],l.id);
    assert.equal(officialPC(l.pricePAExact),officialPC(r['Prix achat (PA)']),l.id);
    assert.equal(l.sourcePublication,r.Statut,l.id);
  }
  assert.equal(links.find(x=>x.id==='ACC-01|ACC_MOD_CON_1').name,"Anneau de l'endurance de l'Ours");
  assert.equal(links.find(x=>x.id==='DST-01|N32').name,'Arc court à encoche rapide');
});

test('fiches joueur et prix publiables conformes',()=>{
  for(const c of cards){
    const r=sources.cards.get(c.ref);
    assert.equal(c.name,r['Nom RP'],c.ref);
    assert.equal(c.description,r['Description RP'],c.ref);
    assert.equal(c.effect,r.Effet||null,c.ref);
    assert.equal(c.pricePC,officialPC(r['Prix achat (PA)']),c.ref);
  }
  assert.equal(Object.keys(model.links).length,2166);
  for(const [id,link] of Object.entries(model.links)){
    const r=sources.links.get(id);
    assert.ok(r && r.Statut==='Actif',id);
    assert.equal(link.pricePC,officialPC(r['Prix achat (PA)']),id);
  }
});

test('ancien poison supprimé du stock de référence, sans effacer des données de groupe',()=>{
  const selection=load('data/stock-base-alaric-v2.json');
  assert.equal(selection.length,54);
  assert.equal(selection.some(s=>s.affix==='CO_POISON_1'),false);
  assert.equal(affixes.some(a=>a.id==='CO_POISON_1'),false);
  assert.equal(links.some(l=>l.id==='CON-07|CO_POISON_1'),false);
});

test('une création MJ officielle retrouve son nom RP sans changer stock ni prix',async()=>{
  const win={ALARIC_CONFIG:{firebase:{},groups:{groupe1:'G1',groupe2:'G2'}}};
  win.firebase={apps:[],initializeApp:()=>({}),firestore:()=>({}),auth:()=>({})};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT,'shared.js'),'utf8'),{window:win,console,fetch:async url=>({ok:true,json:async()=>load(url)})});
  const catalog=await win.AlaricApp.loadCatalog();
  const old={id:'mj-acc-01-ancien',origin:'Création MJ',name:'Anneau de santé du roc',description:'Ancien texte',pricePC:248588,stock:4,cofSpec:{base:'ACC-01',quality:0,affixes:['ACC_MOD_CON_1'],name:'Anneau de santé du roc'}};
  const hydrated=win.AlaricApp.refreshOfficialItem(old,catalog);
  assert.equal(hydrated.name,"Anneau de l'endurance de l'Ours");
  assert.equal(hydrated.cofSpec.name,hydrated.name);
  assert.equal(hydrated.description,links.find(x=>x.id==='ACC-01|ACC_MOD_CON_1').description);
  assert.equal(hydrated.pricePC,old.pricePC);
  assert.equal(hydrated.stock,old.stock);
  const manual={...old,id:'personnalise-01'};
  assert.equal(win.AlaricApp.refreshOfficialItem(manual,catalog),manual);
});
