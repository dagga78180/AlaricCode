/* V10.3 — Gestion des promotions et du rayon secret, par groupe. */
(() => {
'use strict';
const A=window.AlaricApp, P=window.AlaricPriceTools,$=id=>document.getElementById(id);
const GROUPS=['groupe1','groupe2'],profiles={},lookup=new Map();
const targets=()=>$('active-group').value==='both'?GROUPS:[$('active-group').value];
const ref=(g,collection,id)=>A.db.collection('groups').doc(g).collection(collection).doc(id);
const message=s=>{if($('shelf-status'))$('shelf-status').textContent=s;};
const sha256=async phrase=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(phrase))),b=>b.toString(16).padStart(2,'0')).join('');
const make=(tag,text='',className='')=>{const e=document.createElement(tag);e.textContent=text;if(className)e.className=className;return e;};
let catalog=null;
function listed(){return targets().flatMap(g=>[...profiles[g]?.items||[]]);}
function item(g,id){return profiles[g]?.itemsById.get(id)||null;}
function refreshPicker(){
 const term=$('feature-search')?.value.trim().toLocaleLowerCase('fr')||'';
 const select=$('feature-picker'),previous=select.value;
 const rows=new Map();
 for(const it of listed())if(!rows.has(it.id))rows.set(it.id,it);
 const options=[...rows.values()].filter(x=>!term||`${x.name} ${x.id} ${x.category}`.toLocaleLowerCase('fr').includes(term)).sort((a,b)=>a.name.localeCompare(b.name,'fr'));
 select.replaceChildren();const opt=new Option(options.length?'Choisir un objet…':'Aucun résultat','');select.add(opt);
 for(const it of options)select.add(new Option(`${it.name} · ${it.id}`,it.id));
 if(options.some(x=>x.id===previous))select.value=previous;
}
function render(){
 if(!profiles.groupe1||!profiles.groupe2)return;
 refreshPicker();
 for(const type of ['promo','secret']){
  const target=$(type+'-list');target.replaceChildren();
  const ids=new Set(targets().flatMap(g=>type==='promo'?[...profiles[g].promo.keys()]:[...profiles[g].secret]));
  for(const id of ids){
   const name=targets().map(g=>item(g,id)?.name).find(Boolean)||id;
   const row=make('div','','mj-feature-row');row.append(make('span',name,'mj-feature-name'));
   if(type==='promo'){
    for(const g of targets()){
     const it=item(g,id),pct=profiles[g].promo.get(id);if(!it||pct===undefined)continue;
     const block=make('label','','mj-feature-group');block.append(make('small',g==='groupe1'?'G1':'G2'));
     const input=make('input');input.type='number';input.min='1';input.max='90';input.step='1';input.value=String(pct);input.title='Réduction en pourcentage';input.setAttribute('aria-label','Remise '+name+' '+g);
     const preview=make('small',P.validPercent(pct)&&Number.isSafeInteger(it.pricePC)?A.formatPC(P.salePricePC(it.pricePC,pct)):'Remise/prix à définir');
     input.addEventListener('input',()=>{const val=Number(input.value);profiles[g].promo.set(id,val);if(P.validPercent(val)&&Number.isSafeInteger(it.pricePC)){preview.textContent=A.formatPC(P.salePricePC(it.pricePC,val));}else preview.textContent='1 à 90 % / prix indisponible';});
     block.append(input,make('small','%'),preview);row.append(block);
    }
   }else for(const g of targets())if(profiles[g].secret.has(id))row.append(make('small',g==='groupe1'?'G1':'G2'));
   const remove=make('button','Retirer','small subtle');remove.type='button';remove.addEventListener('click',()=>{for(const g of targets()){profiles[g][type==='promo'?'promo':'secret'].delete(id);}render();});row.append(remove);target.append(row);
  }
  if(!ids.size)target.append(make('p','Aucun objet sélectionné.','muted'));
 }
}
function add(type,id){
 if(!id)return;
 let count=0;
 for(const g of targets()){
  const entry=profiles[g];if(!entry||!item(g,id))continue;
  if(type==='promo'){
    entry.secret.delete(id);
    if(!entry.promo.has(id))entry.promo.set(id,10);
  }else{entry.promo.delete(id);entry.secret.add(id);}
  count++;
 }
 render();message(count?`« ${targets().map(g=>item(g,id)?.name).find(Boolean)||id} » ajouté au rayon. Ajuste la remise, puis clique sur Enregistrer les rayons.`:'Objet absent des groupes ciblés.');
}
async function load(){
 if(!A.auth.currentUser)return;
 message('Chargement des rayons et des deux groupes…');
 try{
  catalog=await A.loadCatalog();lookup.clear();
  for(const g of GROUPS){
   const [custom,overrides,stocks,pub,settings]=await Promise.all([A.getCustom(g),A.getOverrides(g),A.getStock(g),ref(g,'storefront','featured').get(),ref(g,'privateSettings','secretShop').get()]);
   const items=A.overlay(catalog.stockBase,custom,overrides,stocks,catalog.base);
   items.forEach(it=>lookup.set(it.id,it));
   const config=pub.exists?pub.data():{}, discounts=config.discounts||{};
   profiles[g]={items,itemsById:new Map(items.map(x=>[x.id,x])),
    promo:new Map((Array.isArray(config.itemIds)?config.itemIds:[]).map(id=>[id,P.validPercent(Number(discounts[id]))?Number(discounts[id]):0])),
    secret:new Set(Array.isArray(config.secretIds)?config.secretIds:[]),activeHash:settings.exists?String(settings.data()?.activeHash||''):''};
  }
  render();message('Rayons chargés. Modifie les remises et enregistre pour publier les prix réduits.');
 }catch(error){console.error(error);message('Chargement refusé : '+error.message);}
}
async function save(){
 if(!A.auth.currentUser)return message('Connecte-toi en MJ.');
 const pass=$('shelf-new-password').value.trim();
 if(pass&&pass.length<12)return message('Le mot de passe doit contenir au moins 12 caractères (une phrase longue est recommandée).');
 const gs=targets();
 for(const g of gs){
  const e=profiles[g];if(!e)return message('Les données MJ ne sont pas encore chargées.');
  if(e.secret.size&&!pass&&!e.activeHash)return message('Définis un mot de passe pour '+g+'.');
  for(const [id,pct] of e.promo)if(!P.validPercent(pct)||!Number.isSafeInteger(item(g,id)?.pricePC))return message('Remise ou prix invalide pour '+id+' / '+g+'.');
 }
 if(!confirm('Enregistrer les promotions et les rayons secrets dans '+gs.join(' et ')+' ? Les nouveaux prix seront immédiatement utilisés lors des achats.'))return;
 message('Enregistrement en cours…');
 try{
  if(pass&&!crypto?.subtle)throw Error('Connexion HTTPS nécessaire pour le mot de passe.');
  const token=pass?await sha256(pass):null;
  const batch=A.db.batch(),updatedAt=firebase.firestore.FieldValue.serverTimestamp();
  for(const g of gs){
   const e=profiles[g], old=e.activeHash, currentHash=token||old;
   if(e.secret.size&&!currentHash)throw Error('Rayon secret sans mot de passe : '+g);
   const ids=[...e.promo.keys()].filter(id=>e.itemsById.has(id)),discounts=Object.fromEntries(ids.map(id=>[id,e.promo.get(id)]));
   const secretIds=[...e.secret].filter(id=>e.itemsById.has(id));
   const published={itemIds:ids,secretIds,discounts,updatedAt};
   const book=A.makePriceBook(e.items,catalog,published);
   batch.set(ref(g,'storefront','featured'),published);
   batch.set(ref(g,'storefront','priceBook'),{...book,updatedAt});
   if(currentHash){
    batch.set(ref(g,'secretShelves',currentHash),{itemIds:secretIds,updatedAt});
    batch.set(ref(g,'privateSettings','secretShop'),{activeHash:currentHash,updatedAt});
   }
   if(old&&old!==currentHash)batch.delete(ref(g,'secretShelves',old));
  }
  await batch.commit();$('shelf-new-password').value='';await load();
  message('Rayons et tarifs promotionnels publiés pour '+gs.join(' et ')+'. Stocks et commandes existantes inchangés.');
 }catch(error){console.error(error);message('Publication refusée : '+error.message+' (vérifie les règles Firestore V10.3 et l’UID MJ).');}
}
function bind(){
 if(!$('shelf-save'))return;
 for(const type of ['promo','secret'])$('add-'+type).addEventListener('click',()=>add(type,$('feature-picker').value));
 $('feature-search')?.addEventListener('input',refreshPicker);
 $('shelf-save').addEventListener('click',save);$('shelf-reload').addEventListener('click',load);
 $('active-group').addEventListener('change',render);
 document.addEventListener('alaric-mj-feature-add',event=>{
  const {id,type}=event.detail||{};if(id&&['promo','secret'].includes(type)){add(type,id);$('feature-search').value='';refreshPicker();$('feature-picker').value=id;}
 });
 A.auth.onAuthStateChanged(user=>{if(user)load();});
}
bind();
})();
