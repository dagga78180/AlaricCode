/* Gestion légère des rayons — configuration Firestore par groupe (MJ seulement). */
(() => {
'use strict';
const A=window.AlaricApp;
const $=id=>document.getElementById(id);
const GROUPS=['groupe1','groupe2'];
const state={items:[],promo:new Set(),secret:new Set(),activeHash:''};
const msg=(s)=>{if($('shelf-status'))$('shelf-status').textContent=s;};
const group=()=>$('active-group')?.value==='groupe2'?'groupe2':'groupe1';
const scope=()=>$('active-group')?.value==='both'?GROUPS:[$('active-group').value];
const path=(g,col,id)=>A.db.collection('groups').doc(g).collection(col).doc(id);
const hash=async phrase=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(phrase))),b=>b.toString(16).padStart(2,'0')).join('');
const el=(tag,text,props={})=>Object.assign(document.createElement(tag),{textContent:text,...props});
function render(){
  for(const type of ['promo','secret']){
    const target=$(type+'-list');target.replaceChildren();
    const set=state[type];
    for(const id of set){
      const found=state.items.find(x=>x.id===id);
      const row=el('div','');row.className='mj-feature-row';
      row.append(el('span',found?`${found.name} · ${id}`:`${id} (objet introuvable)`));
      const remove=el('button','Retirer',{type:'button'});
      remove.className='small subtle';remove.addEventListener('click',()=>{set.delete(id);render();});row.append(remove);target.append(row);
    }
    if(!set.size)target.append(el('p','Aucun objet sélectionné.'));
  }
}
async function initChoices(){
  const catalog=await A.loadCatalog(),g=group();
  const [custom,overrides,stocks]=await Promise.all([A.getCustom(g),A.getOverrides(g),A.getStock(g)]);
  state.items=A.overlay(catalog.stockBase,custom,overrides,stocks,catalog.base).sort((a,b)=>a.name.localeCompare(b.name,'fr'));
  const list=$('feature-picker');list.replaceChildren(el('option','Choisir un objet…',{value:''}));
  for(const x of state.items)list.append(el('option',`${x.name} · ${x.id}`,{value:x.id}));
}
async function load(){
  if(!A.auth.currentUser)return;
  msg('Chargement des rayons…');
  try{
    await initChoices();
    const g=group();
    const [pub,settings]=await Promise.all([
      path(g,'storefront','featured').get(),path(g,'privateSettings','secretShop').get()
    ]);
    const data=pub.exists?pub.data():{};
    state.promo=new Set(Array.isArray(data.itemIds)?data.itemIds:[]);
    state.secret=new Set(Array.isArray(data.secretIds)?data.secretIds:[]);
    state.activeHash=settings.exists?String(settings.data()?.activeHash||''):'';
    render();msg(`Configuration affichée pour ${g}. Les modifications s'appliqueront aux groupes ciblés lors de l'enregistrement.`);
  }catch(e){msg('Chargement refusé : '+e.message);}
}
async function save(){
  if(!A.auth.currentUser)return msg('Connecte-toi en MJ.');
  const pass=$('shelf-new-password').value.trim();
  if(pass && pass.length<12)return msg('Choisis un mot de passe d’au moins 12 caractères, idéalement une phrase longue.');
  if(!pass && state.secret.size && !state.activeHash)return msg('Définis un mot de passe pour activer ce rayon.');
  const targets=scope();
  if(!confirm(`Enregistrer les rayons ${targets.join(' et ')} ?`))return;
  try{
    if(pass && !crypto.subtle)throw Error('HTTPS est nécessaire pour définir le mot de passe.');
    const newHash=pass?await hash(pass):'';
    const timestamp=firebase.firestore.FieldValue.serverTimestamp();
    for(const g of targets){
      const current=await path(g,'privateSettings','secretShop').get();
      const oldHash=current.exists?String(current.data()?.activeHash||''):'';
      const token=newHash||oldHash;
      if(!token&&state.secret.size)throw Error(`Mot de passe manquant pour ${g}`);
      const batch=A.db.batch();
      batch.set(path(g,'storefront','featured'),{itemIds:[...state.promo],secretIds:[...state.secret],updatedAt:timestamp});
      if(token){
        batch.set(path(g,'secretShelves',token),{itemIds:[...state.secret],updatedAt:timestamp});
        batch.set(path(g,'privateSettings','secretShop'),{activeHash:token,updatedAt:timestamp});
      }
      if(oldHash && oldHash!==token)batch.delete(path(g,'secretShelves',oldHash));
      await batch.commit();
    }
    $('shelf-new-password').value='';
    await load();msg('Rayons enregistrés sur '+targets.join(' et ')+'. Le mot de passe n’est jamais stocké en clair.');
  }catch(e){msg('Enregistrement impossible : '+e.message);}
}
function bind(){
  if(!$('shelf-save'))return;
  for(const name of ['promo','secret'])$('add-'+name).addEventListener('click',()=>{
    const id=$('feature-picker').value;if(!id)return;
    if(name==='promo')state.secret.delete(id);else state.promo.delete(id);
    state[name].add(id);render();
  });
  $('shelf-save').addEventListener('click',save);
  $('shelf-reload').addEventListener('click',load);
  $('active-group').addEventListener('change',load);
  A.auth.onAuthStateChanged(user=>{if(user)load();});
}
bind();
})();
