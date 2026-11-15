const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'boutique.css'), 'utf8');
function fn(name) {
  const match = app.match(new RegExp(`function ${name}\\([^]*?\\n}\\n`));
  assert.ok(match, `function ${name}`);
  return match[0];
}
function getSort() {
  const cats = app.match(/const CATEGORY_ORDER = Object\.freeze\(\{[^]*?\}\);/);
  const subs = app.match(/const SUBCATEGORY_ORDER = \{[^]*?\n\};/);
  assert.ok(cats && subs);
  const source = `
    ${cats[0]}
    ${subs[0]}
    const RARITY_ORDER = ['Commun','Peu Commun','Rare','Épique'];
    const normalize = x => String(x||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();
    ${fn('rankKey')}
    ${fn('textCompare')}
    ${fn('rarityRank')}
    ${fn('categoryRank')}
    ${fn('subcategoryRank')}
    ${fn('compareCatalogueItems')}
    compareCatalogueItems;
  `;
  return vm.runInNewContext(source);
}
const make=(category,name,source='base',price=20)=>({category, name, source, price, rarity:'Commun', subcategory:''});
test('V10.2 : ordre des six rayons conservé, même avec Sélection Alaric et prix', () => {
  const compare = getSort();
  const items = [
    make('divers','Sac','alaric',1), make('munition','Flèche','alaric',2),
    make('consommable','Potion','alaric',3), make('accessoire','Anneau','alaric',4),
    make('armure','Bouclier','base',5), make('arme','Épée','base',999),
    make('arme','Dague','alaric',15)
  ];
  const first = [...items].sort((a,b)=>compare(a,b,'alaric-first'));
  assert.deepEqual(first.map(it=>it.name),['Dague','Épée','Bouclier','Anneau','Potion','Flèche','Sac']);
  for(const mode of ['category-asc','name-asc','price-asc','price-desc','rarity-asc','rarity-desc']) {
    assert.deepEqual([...items].sort((a,b)=>compare(a,b,mode)).map(it=>it.category),['arme','arme','armure','accessoire','consommable','munition','divers'],mode);
  }
});
test('V10.2 : stock compact, même pour un seul exemplaire', () => {
  const stock=fn('stockBadge');
  assert.match(stock, /S = 1|S = \$\{item\.stock\}/);
  assert.doesNotMatch(stock, /Dernier/);
  assert.doesNotMatch(stock, />Stock :/);
});
test('V10.2 : panier sur deux lignes, avec contrôles inchangés',()=>{
  const segment=app.slice(app.indexOf('function renderCart()'),app.indexOf('function orderPayload()'));
  for(const text of ['cart-line__top','cart-line__name','cart-line__qty','cart-line__price','data-remove','data-add','data-delete','Prix :'])assert.match(segment,new RegExp(text));
  assert.match(segment,/formatPrice\(total\)/);
  assert.match(css,/\.cart-line__top\{display:grid;grid-template-columns:minmax\(0,1fr\) auto/);
});
test('V10.2 : bouton plus grand, stock lisible et fontes harmonisées',()=>{
  assert.match(css,/\.item-row__actions \.button\{padding:10px 13px;min-width:87px;min-height:42px/);
  assert.match(css,/font-variant-numeric:tabular-nums/);
  assert.match(css,/font-family:"Segoe UI",Tahoma,Arial,sans-serif/);
  assert.doesNotMatch(css, /Georgia|Times New Roman/);
  for(const f of ['index.html','groupe1.html','groupe2.html'])assert.match(fs.readFileSync(path.join(root,f),'utf8'), /boutique\.css\?v=v10-2/);
});
