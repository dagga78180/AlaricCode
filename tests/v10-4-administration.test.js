'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const html=read('mj.html'),js=read('mj-v5.js'),rayons=read('js/rayons-mj.js');
test('V10.4 : quatre onglets seulement, configuration en bas de la vue générale',()=>{
 const tabs=[...html.matchAll(/data-tab="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(tabs,['home','stock','editor','backup']);
 assert.match(html,/id="mj-config-details"/);
 assert.match(html,/id="mj-import-details"/);
 assert.ok(html.indexOf('id="mj-config-details"')<html.indexOf('id="tab-stock"'));
});
test('V10.4 : chaque groupe garde son propre stock, glisser carte ou pastille',()=>{
 assert.match(rayons,/function makeGroup\(item, group\)/);
 assert.match(rayons,/startDrag\(ev, \{id: item\.id, groups: \[group\]\}\)/);
 assert.match(rayons,/GROUPS\.filter\(g => original\(g, item\.id\)\)/);
 assert.match(rayons,/v\.stock === null\) tx\.delete\(ref\)/);
 assert.match(rayons,/tx\.set\(ref, \{stock: v\.stock, updatedAt: timestamp\}\)/);
});
test('V10.4 : une remise ne modifie pas le prix officiel et ne duplique pas le stock',()=>{
 assert.match(rayons,/tx\.set\(path\(group, 'storefront', 'featured'\)/);
 assert.match(rayons,/promoPrices\[id\] = P\.salePricePC\(prices\[id\], feature\.discounts\[id\]\)/);
 assert.match(rayons,/promos\.delete\(id\); secrets\.delete\(id\)/);
 assert.match(rayons,/for \(const id of \[\.\.\.promos\.keys\(\)\]\) if \(secrets\.has\(id\)\) promos\.delete\(id\)/);
});
test('V10.4 : contrôle de concurrence sur les stocks, détails repliables',()=>{
 assert.match(rayons,/Stock de .* modifié entre-temps/);
 assert.match(rayons,/create\('details', 'rayon-detail-fold'\)/);
 assert.match(rayons,/function detailsContent/);
 assert.match(rayons,/window\.__alaricMjData/);
 assert.match(js,/__alaricMjData=\{catalog,groups:state\}/);
});
test('V10.4 : après publication, rester dans la création et exporter les rayons',()=>{
 assert.match(js,/await loadAll\(\);tab\('editor'\)/);
 assert.match(js,/group\.storefront=\{itemIds:/);
 assert.match(js,/version:2,createdAt/);
 assert.match(js,/Les mots de passe ne sont pas exportés/);
 assert.match(html,/id="template-search"/);
 assert.match(html,/id="mj-affix-chooser"/);
});
