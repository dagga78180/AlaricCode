(function (global) {
  'use strict';
  const cfg = global.ALARIC_CONFIG;
  if (!global.firebase?.firestore || !global.firebase?.auth) throw Error('Firebase non chargé');
  const app = global.firebase.apps.length ? global.firebase.app() : global.firebase.initializeApp(cfg.firebase);
  const db = global.firebase.firestore(app), auth = global.firebase.auth(app);
  const validGroups = Object.keys(cfg.groups);
  function groupId(raw) { return validGroups.includes(raw) ? raw : 'groupe1'; }
  function parsePricePC(value, defaultUnit='pa') {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? Math.round(value * {pa:100,pc:1,po:10000}[defaultUnit]) : null;
    const s = String(value).trim().toLowerCase().replaceAll(',', '.');
    const simple = /^([0-9]+(?:\.[0-9]+)?)\s*(po|pa|pc)?$/.exec(s);
    if (simple) return Math.round(Number(simple[1]) * ({po:10000,pa:100,pc:1}[simple[2] || defaultUnit]));
    const pattern = /([0-9]+)\s*(po|pa|pc)/g;
    let total=0, matched=0, rest=s;
    for (const m of s.matchAll(pattern)) { total+=Number(m[1])*{po:10000,pa:100,pc:1}[m[2]]; matched++; rest=rest.replace(m[0],' '); }
    return matched && !rest.replace(/[\s+]/g,'') ? total : null;
  }
  function formatPC(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return 'Prix à définir';
    let n = Math.round(Number(value));
    if(n < 0) return 'Prix à définir';
    const parts=[];
    if(n>=10000) {parts.push(`${Math.floor(n/10000)} PO`);n%=10000;}
    if(n>=100) {parts.push(`${Math.floor(n/100)} PA`);n%=100;}
    if(n || !parts.length) parts.push(`${n} PC`);
    return parts.join(' · ');
  }
  function normalizeId(id) {
    const s=String(id??'').trim().toLowerCase();
    if (/^b\d+$/.test(s)) return 'cof-'+s;
    return s.replace(/[^a-z0-9_-]/g,'-').slice(0,180);
  }
  function rowsOf(root) {
    if(Array.isArray(root))return root;
    for(const k of ['items','objets','catalogue','data','products','entries','stock','selection'])if(Array.isArray(root?.[k]))return root[k];
    return [];
  }
  const first=(o,keys)=>keys.map(k=>o?.[k]).find(v=>v!==undefined && v!==null && v!== '');
  function iconUrl(icon) {
    if(!icon || typeof icon!=='string')return '';
    const v=icon.trim();
    if(/^https:\/\//.test(v))return v;
    if(/^icons\/[\w.-]+\.svg$/.test(v)) return v;
    if(/^assets\/icons\/[\w/.-]+\.svg$/.test(v)) return '../'+v;
    if(/^assets\/[\w/.-]+\.(svg|png|jpg|webp)$/.test(v))return '../'+v;
    return '';
  }
  function normalizedItem(o, origin, maps={}) {
    if(!o || typeof o!=='object')return null;
    const id=normalizeId(first(o,['id','item_id','itemId','ID','sourceId']));
    const name=String(first(o,['name','nom','Nom objet','title','libelle']) ?? '').trim();
    if(!id || !name)return null;
    let pricePC = o.pricePC !== undefined ? parsePricePC(o.pricePC,'pc') : parsePricePC(first(o,['price','prix','pricePA','prix_pa','pricePa']),'pa');
    if (id === 'coam-f-0') pricePC=20; // Prix souhaité par le MJ ; source XLSX : 0,1 PA.
    const icon=iconUrl(maps[id] || first(o,['icon','icone','image','imageUrl','iconUrl','icon_url']));
    const sub=String(first(o,['subcategory','subCategory','sousCategorie','sous-catégorie','Sous-catégorie'])??'');
    const item = {id,name,category:String(first(o,['category','categorie','catégorie','Catégorie'])??'Divers'),subcategory:sub,
      description:String(first(o,['description','desc','Description / règles','rules','regles'])??''),
      pricePC,icon,origin,affixes:Array.isArray(o.affixes)?o.affixes:[],visible:o.visible !== false,
      sourceId:String(o.sourceId||o.ID||id),templateId:String(o.templateId||'')};
    return item;
  }
  async function fetchJSON(path) {
    const response=await fetch(path,{cache:'no-store'});
    if(!response.ok)throw Error(`${path} : HTTP ${response.status}`);
    return response.json();
  }
  async function loadCatalog() {
    const [templates,affixes,icons, baseResults] = await Promise.all([
      fetchJSON('data/templates.json'),fetchJSON('data/affixes.json'),fetchJSON('data/icons.json'),
      Promise.all(cfg.baseFiles.map(async f=>{try{return rowsOf(await fetchJSON(f));}catch(e){console.warn('Catalogue existant non chargé',f,e);return [];}}))
    ]);
    const byId=new Map();
    // Les deux fichiers existants restent prioritaires pour la sélection et les descriptions.
    for(const [i,rows] of baseResults.entries())for(const row of rows){const item=normalizedItem(row,i===0?'Alaric':'Base',icons);if(item)byId.set(item.id,item);}
    // Ajoute les 7 objets de base demandés même si le correctif précédent n'a pas été installé.
    const requested=['coam-f-0','coam-p-0','coam-q20','coam-s30','cof-b060','cof-b061','cof-b062'];
    for(const t of templates) {
      if (!requested.includes(t.id))continue;
      const normalized=normalizedItem({ ...t, icon:icons[t.id] },'Base',icons);
      if(!byId.has(t.id) && normalized)byId.set(t.id,normalized);
    }
    for(const id of ['cof-b049','b049'])byId.delete(id); // Ancien carquois avec flèches.
    // Si un fichier de base est inaccessible, les modèles du tableur restent accessibles dans l'éditeur MJ.
    return {base:[...byId.values()],templates,affixes,icons,warnings:baseResults.every(rows=>!rows.length)?'Les fichiers de catalogue existants sont introuvables : seuls les 7 ajouts sont visibles dans la vitrine.':''};
  }
  function groupStocks(group) { return db.collection('groups').doc(groupId(group)).collection('stocks'); }
  function groupItems(group) { return db.collection('groups').doc(groupId(group)).collection('customItems'); }
  async function getStock(group) {const ss=await groupStocks(group).get();return new Map(ss.docs.map(doc=>[doc.id,doc.data().stock]));}
  async function getCustom(group){const ss=await groupItems(group).get();return ss.docs.map(d=>normalizedItem({...d.data(),id:d.id},'Création MJ')).filter(Boolean);}
  async function setStock(group,id,value) {
    const doc=groupStocks(group).doc(normalizeId(id));
    if(value===null || value==='')return doc.delete(); // Sans document = illimité.
    const n=Number(value);
    if(!Number.isSafeInteger(n) || n<0 || n>1000000)throw Error('Stock : entier entre 0 et 1 000 000, ou vide pour illimité.');
    return doc.set({stock:n,updatedAt:global.firebase.firestore.FieldValue.serverTimestamp()});
  }
  async function saveCustom(group,item) {
    const id=normalizeId(item.id || `mj-${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
    if(!id)throw Error('Identifiant d’objet invalide');
    const name=String(item.name||'').trim();
    if(!name || name.length>140)throw Error('Nom invalide');
    const pricePC = item.pricePC == null || item.pricePC === '' ? null : Number(item.pricePC);
    if(pricePC !== null && (!Number.isSafeInteger(pricePC)||pricePC<0))throw Error('Prix en PC entiers obligatoire');
    const safeAffixes=(Array.isArray(item.affixes)?item.affixes:[]).slice(0,10).map(a=>({id:String(a.id||''),name:String(a.name||''),effect:String(a.effect||'')}));
    const doc={name,category:String(item.category||'Divers'),subcategory:String(item.subcategory||''),
      description:String(item.description||'').slice(0,4000),pricePC,icon:iconUrl(item.icon),
      templateId:String(item.templateId||''),affixes:safeAffixes,visible:item.visible!==false,
      updatedAt:global.firebase.firestore.FieldValue.serverTimestamp()};
    await groupItems(group).doc(id).set(doc,{merge:true}); return id;
  }
  async function deleteCustom(group,id){return groupItems(group).doc(normalizeId(id)).delete();}
  async function migrationLegacy(group){
    const [oldSnap,current]=await Promise.all([db.collection('stocks').get(),getStock(group)]);
    let pending=[];
    for(const d of oldSnap.docs){let data=d.data(),id=normalizeId(data.item_id||decodeURIComponent(d.id));
      if(current.has(id)||!Number.isInteger(data.stock)||data.stock<0)continue;
      pending.push([id,data.stock]);}
    for(let start=0;start<pending.length;start+=300){const batch=db.batch();for(const [id,stock] of pending.slice(start,start+300))batch.set(groupStocks(group).doc(id),{stock});await batch.commit();}
    return {source:oldSnap.size,added:pending.length,existing:current.size};
  }
  function affixProfiles(t){
    const cat=String(t.category).toLowerCase(),sub=String(t.subcategory).toLowerCase(),mode=String(t.modes||'').toLowerCase(),names=[];
    if(cat==='arme'){if(mode.includes('distance')||sub.includes('distance'))names.push('DISTANCE');else names.push('CAC');if(mode.includes('magique')||sub.includes('magique'))names.push('FOCUS_MAGIQUE');}
    if(cat==='armure'){
      names.push('ARMURE_TOUTES');
      const name=String(t.name||'').toLowerCase(),tags=String(t.tags||'').toLowerCase();
      if(name.includes('bouclier')||tags.includes('shield'))names.push('BOUCLIER','MAILLE_PLAQUE');
      else if(tags.includes('leather')||name.includes('cuir')||name.includes('broigne'))names.push('CUIR');
      else if(tags.includes('cloth')||name.includes('tissu')||name.includes('fourrure'))names.push('TISSU');
      else names.push('MAILLE_PLAQUE');
    }
    if(cat==='accessoire'){for(const [pattern,profile] of [['anneau','ANNEAU'],['ceinture','CEINTURE'],['cou','COU'],['dos','DOS'],['gants','GANTS'],['pieds','PIEDS'],['tête','TETE'],['tete','TETE'],['main gauche','FOCUS_MAGIQUE']])if(sub.includes(pattern))names.push(profile);}
    if(cat==='consommable'){if(sub.includes('grenade'))names.push('CONSOMMABLE_GRENADE___PROJECTILE_ALCHIMIQUE');else if(sub.includes('parchemin'))names.push('CONSOMMABLE_PARCHEMIN');else if(sub.includes('poison')||sub.includes('dose'))names.push('CONSOMMABLE_FIOLE___DOSE');else names.push('CONSOMMABLE_FIOLE___POTION');}
    return names;
  }
  function compatibleAffixes(t,affixes){
    const profiles=affixProfiles(t),tags=String(t.tags||'').toLowerCase().split(',').map(v=>v.trim()).filter(Boolean);
    return affixes.filter(a=>{
      if(!a.visible)return false;
      const prof=String(a.profile||'');
      if(!profiles.some(p=>prof.includes(p)))return false;
      const required=String(a.tagsRequired||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
      return !required.length || required.some(tag=>tags.includes(tag));
    });
  }
  function elem(tag, props={}, children=[]) {
    const e=document.createElement(tag);
    for (const [k,v] of Object.entries(props)) {
      if(k==='className')e.className=v;
      else if(k==='text')e.textContent=String(v);
      else if(k==='dataset')for(const [dataKey,val] of Object.entries(v))e.dataset[dataKey]=val;
      else if(k==='value')e.value=v;
      else if(k==='title')e.title=v;
      else if(k==='type')e.type=v;
      else if(k==='placeholder')e.placeholder=v;
      else if(k==='disabled')e.disabled=!!v;
      else if(k==='min')e.min=v;
      else if(k==='max')e.max=v;
      else if(k==='step')e.step=v;
      else if(k==='href')e.href=v;
      else if(k==='src')e.src=v;
      else if(k==='alt')e.alt=v;
      else if(k==='checked')e.checked=!!v;
      else if(k==='onClick')e.addEventListener('click',v);
    }
    for(const c of [].concat(children))if(c!==null && c!==undefined)e.append(typeof c==='string'?document.createTextNode(c):c);
    return e;
  }
  function groupOverrides(group) {return db.collection('groups').doc(groupId(group)).collection('baseOverrides');}
  async function getOverrides(group){const ss=await groupOverrides(group).get();return new Map(ss.docs.map(d=>[d.id,d.data()]));}
  async function setBaseOverride(group,id,overrides){
    const doc=groupOverrides(group).doc(normalizeId(id));
    const data={visible:overrides.visible!==false,updatedAt:global.firebase.firestore.FieldValue.serverTimestamp()};
    if (overrides.pricePC !== undefined && overrides.pricePC!==null && overrides.pricePC!=='') {
      const n=Number(overrides.pricePC);
      if(!Number.isSafeInteger(n)||n<0)throw Error('Prix invalide');
      data.pricePC=n;
    }
    return doc.set(data,{merge:true});
  }
  function overlay(base,custom,overrides,stocks){
    const all=new Map(base.map(it=>[it.id,{...it}]));
    for(const item of custom)all.set(item.id,{...item});
    return [...all.values()].map(it=>{
      const adjust=overrides.get(it.id)||{};
      return {...it,visible:adjust.visible!==undefined?adjust.visible:it.visible,
        pricePC:adjust.pricePC!==undefined?adjust.pricePC:it.pricePC,
        stock:stocks.has(it.id)?stocks.get(it.id):null};
    });
  }
  global.AlaricV3={cfg,db,auth,groupId,parsePricePC,formatPC,normalizeId,normalizedItem,loadCatalog,groupStocks,groupItems,getStock,getCustom,setStock,saveCustom,deleteCustom,migrationLegacy,compatibleAffixes,iconUrl,elem,getOverrides,setBaseOverride,overlay};
}(window));
