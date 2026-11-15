const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const get = file => fs.readFileSync(path.join(root,file),'utf8');
const base = JSON.parse(get('data/catalogue-objets-v2.json'));

test('les deux boucliers ont un malus source explicite', () => {
  for (const id of ['BCL-01','BCL-02']) {
    const shield = base.find(x=>x.id===id);
    assert.ok(shield, id);
    assert.equal(shield.category,'armure');
    assert.equal(shield.armorMalus,0);
  }
});

test('la carte et la prévisualisation ne masquent pas le malus des boucliers', () => {
  const app=get('js/app.js'), mj=get('mj-v5.js');
  assert.match(app, /cardStat\('MALUS',malus\|\|'—'\)/);
  assert.doesNotMatch(app,/cardShield\?'':cardStat\('MALUS'/);
  assert.match(mj,/stat\('MALUS',Number\(source\.armorMalus\)/);
  assert.doesNotMatch(mj,/if\(!t\.sourceId\.startsWith\('BCL-'\)\)/);
});

test('diagnostic des refus Firebase est explicite sans ouvrir les droits joueur', () => {
  const source=get('mj-v5.js');
  const start=source.indexOf('function priceBookError(e)');
  const end=source.indexOf('async function syncPricebooks()',start);
  assert.ok(start>=0 && end>start);
  const fn=new Function(source.slice(start,end)+'\nreturn priceBookError;')();
  assert.match(fn({code:'permission-denied',message:'Missing or insufficient permissions'}),/règles V6.*PUBLIÉES.*UID/);
  assert.match(fn({message:'Connexion interrompue'}),/Connexion interrompue/);
  const rules=get('firestore.rules');
  assert.match(rules,/bookId == 'priceBook' && isMJ\(\)/);
  assert.doesNotMatch(rules,/allow (create|write|update): if true/);
});
