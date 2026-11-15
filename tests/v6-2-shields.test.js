const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
test('boucliers : DEF conservée et malus de base corrigé',()=>{
 const base=read('data/catalogue-objets-v2.json');
 for(const [id,def,malus] of [['BCL-01',1,1],['BCL-02',2,2]]){
  const b=base.find(x=>x.id===id);
  assert.equal(b.armorBonus,def);assert.equal(b.armorMalus,malus);
  assert.equal(b.playerMalus,`−${malus}`);
 }
});
test('toutes les variantes de bouclier héritent du malus corrigé',()=>{
 const links=read('data/catalogue-liaisons-v2.json').filter(x=>['BCL-01','BCL-02'].includes(x.itemId));
 assert.equal(links.length,92);
 for(const x of links)assert.equal(x.playerMalus,x.itemId==='BCL-01'?'−1':'−2');
 const rp=read('data/catalogue-rp-nouveau.json').filter(x=>/^(?:BASE\|)?BCL-0[12](?:\||$)/.test(x.ref));
 assert.equal(rp.length,94);
 for(const x of rp)assert.equal(x.malus,x.ref.includes('BCL-01')?'−1':'−2');
});
test('les modifications n’impactent pas les prix de base',()=>{
 const base=read('data/catalogue-objets-v2.json');
 assert.equal(base.find(x=>x.id==='BCL-01').pricePC,200);
 assert.equal(base.find(x=>x.id==='BCL-02').pricePC,400);
});
