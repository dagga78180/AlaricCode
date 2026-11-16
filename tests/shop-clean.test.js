const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');const read=x=>fs.readFileSync(path.join(root,x),'utf8');
test('une feuille joueur et une feuille MJ, sans cascade V8',()=>{
 for(const html of ['groupe1.html','groupe2.html']){
  const s=read(html), links=[...s.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
  assert.equal(links.length,1);assert.match(s,/boutique\.css/);assert.match(s,/shop-paper/);
  for(const legacy of ['v8-enchantee.css','v8-1-prestige.css','v8-3-reference-fidele.css'])assert.ok(!s.includes(legacy));
 }
 const mj=read('mj.html');assert.equal([...mj.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].length,1);assert.match(mj,/mj-clean\.css/);
});
test('chaque groupe dispose des trois rayons, filtres et panier',()=>{
 for(const name of ['groupe1.html','groupe2.html']){
  const s=read(name);
  for(const id of ['data-shop-tab="boutique"','data-shop-tab="promotions"','data-shop-tab="secret"','id="secret-form"','id="items-grid"','id="cart-panel"','id="toggle-filters"'])assert.ok(s.includes(id),name+' '+id);
 }
});
test('mot de passe non codé en dur, empreinte du secret et règles dédiées',()=>{
 const app=read('js/app.js'),mj=read('js/rayons-mj.js'),rules=read('firestore.rules');
 assert.match(app,/crypto\.subtle\.digest/);assert.match(mj,/crypto\.subtle\.digest/);
 assert.match(rules,/secretShelves/);assert.match(rules,/allow list: if false/);
 assert.match(rules,/allow create, update: if isGroup\(groupId\) && bookId == 'featured' && isMJ\(\)/);
});
