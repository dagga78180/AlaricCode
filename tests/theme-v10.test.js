const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('V10 : les deux boutiques utilisent une feuille CSS unique et la nouvelle version', () => {
  for (const file of ['groupe1.html', 'groupe2.html', 'index.html']) {
    const html = read(file);
    assert.equal((html.match(/rel="stylesheet"/g) || []).length, 1);
    assert.match(html, /boutique\.css\?v=v10-1/);
  }
  assert.equal((read('mj.html').match(/rel="stylesheet"/g) || []).length, 1);
});
test('V10 : les nouveaux décors sont livrés dans le site et appelés par le CSS', () => {
  const css = read('boutique.css');
  for (const file of ['header-palais.webp','sol-arcane.webp','parchemin-texture.webp','ornate-card-frame.svg','ornate-cart-crest.svg']) {
    assert.ok(fs.statSync(path.join(root, 'assets', file)).size > 0, file);
    assert.ok(css.includes(`assets/${file}`), file);
  }
});
test('V10 : la disposition validée reste une grille quatre/deux/une colonne et trois panneaux', () => {
  const css = read('boutique.css');
  const group = read('groupe1.html');
  assert.match(css, /grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /grid-template-columns:1fr/);
  for (const x of ['class="filters-sidebar"','class="catalogue"','id="cart-panel"','id="items-grid"']) assert.ok(group.includes(x), x);
});
