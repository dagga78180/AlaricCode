const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('V10.1 : deux bandeaux superflus retirés des boutiques', () => {
  for (const name of ['groupe1.html','groupe2.html']) {
    const html=read(name);
    assert.doesNotMatch(html, /class="shop-ribbon/);
    assert.doesNotMatch(html, /class="section-heading/);
    assert.match(html, /class="catalogue-controls"/);
    for(const id of ['catalogue-title','result-count','search','sort-filter','price-mode','items-grid','cart-panel']) {
      assert.ok(html.includes(`id="${id}"`), `${name} ${id}`);
    }
  }
});

test('V10.1 : navigation des deux groupes et trois rayons conservée', () => {
  for(const group of [1,2]) {
    const html=read(`groupe${group}.html`);
    assert.match(html, new RegExp(`href="groupe${group}.html" aria-current="page"`));
    assert.match(html, /href="mj.html"/);
    for(const shelf of ['boutique','promotions','secret'])assert.ok(html.includes(`data-shop-tab="${shelf}"`));
  }
});

test('V10.2 : barre compacte responsive et police lisible', () => {
  const css=read('boutique.css');
  assert.match(css, /\.catalogue-controls\{[\s\S]*?grid-template-columns:minmax\(200px,1fr\)/);
  assert.match(css, /font-family:"Segoe UI",Tahoma,Arial,sans-serif/);
  assert.match(css, /\.item-row__head\{[^}]*padding:18px 13px/);
});
