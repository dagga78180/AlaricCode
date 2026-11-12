(function (global) {
  'use strict';
  const cfg = global.ALARIC_CONFIG;
  if (!global.firebase?.firestore || !global.firebase?.auth) throw Error('Firebase non chargé');
  const app = global.firebase.apps.length ? global.firebase.app() : global.firebase.initializeApp(cfg.firebase);
  const db = global.firebase.firestore(app), auth = global.firebase.auth(app);
  const validGroups = Object.keys(cfg.groups);
  const RARITY_LABELS=['Commun','Peu Commun','Inhabituel','Rare','Exceptionnel','Précieux','Épique','Légendaire','Mythique','Artefact','Objet Divin'];
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
  // Pour les images V2, accepte leurs URL et chemins relatifs réels.
  // Les chemins locaux sont interprétés depuis la racine de GitHub Pages.
  function iconUrl(icon) {
    if(!icon || typeof icon!=='string')return '';
    const v=icon.trim();
    if(/^https:\/\//i.test(v))return v;
    // Autorise les caractères accentués et les espaces des SVG de l'ancien catalogue.
    if(!/\.(?:svg|png|webp|jpe?g)(?:[?#].*)?$/iu.test(v))return '';
    if(/^\/[^\s?#]+/u.test(v)&&!v.includes('..'))return encodeURI(v);
    const clean=v.replace(/^\.\//,'');
    if(clean.includes('..')&&!clean.startsWith('../'))return '';
    if(clean.startsWith('icons/')&&!clean.includes('..'))return encodeURI(clean);
    if(/^(?:assets|images)\//u.test(clean)&&!clean.includes('..'))return encodeURI(clean);
    if(/^\.\.\/(?:assets|images)\//u.test(v)&&!v.slice(3).includes('..'))return encodeURI(v.slice(3));
    if(!clean.includes('/')&&!clean.includes('..'))return 'assets/icons/'+encodeURI(clean);
    return '';
  }
  function fallbackIcon(o) {
    const name=String(o?.name||o?.nom||'').toLowerCase();
    const category=String(o?.category||o?.categorie||o?.['Catégorie']||'').toLowerCase();
    const sub=String(o?.subcategory||o?.['Sous-catégorie']||'').toLowerCase();
    if(/fl[eè]che|plomb|munition|carquois/.test(name+' '+sub)||category==='munition')return 'icons/fallback/munition.svg';
    if(/potion|fiole|poison|[eé]lixir|soin/.test(name+' '+sub))return 'icons/fallback/potion.svg';
    if(/parchemin|grimoire|livre/.test(name+' '+sub))return 'icons/fallback/parchemin.svg';
    if(/arc|arbal[eè]te|mousquet|p[eé]toire|javelot/.test(name))return 'icons/fallback/arc.svg';
    if(/bouclier|armure|cuir|maille|plaque|casque/.test(name+' '+sub)||category==='armure'||category==='armures')return 'icons/fallback/armure.svg';
    if(/anneau|amulette|bijou|bague|ceinture|cape|collier|gants|botte|sceptre|focus|diad[eè]me/.test(name+' '+sub)||category==='accessoire')return 'icons/fallback/accessoire.svg';
    if(/hache|[eé]p[eé]e|dague|marteau|masse|lance|rapi[eè]re|arme|b[aâ]ton/.test(name+' '+sub)||category==='arme'||category==='armes')return 'icons/fallback/arme.svg';
    return 'icons/fallback/materiel.svg';
  }
  // Même rang pour les PNG historiques et les SVG V3 : R = Q + Pmax, borné à 10.
  // Pmax est le palier le plus élevé de tous les affixes (jamais leur somme).
  function computeIconRank(item, affixCatalog=[]) {
    const clamp5=value=>Math.min(5,Math.max(0,Math.trunc(Number(value)||0)));
    const q=clamp5(item?.quality ?? item?.cofSpec?.quality ?? 0);
    const powerById=new Map((Array.isArray(affixCatalog)?affixCatalog:[]).map(a=>[String(a.id),clamp5(a.tier ?? a.p)]));
    const raw=[...(Array.isArray(item?.cofSpec?.affixes)?item.cofSpec.affixes:[]),
      ...(Array.isArray(item?.affixes)?item.affixes:[])];
    let found=false,p=0;
    for(const spec of raw) {
      const id=String(typeof spec==='object'?(spec?.id??''):spec);
      if(typeof spec==='object' && (spec?.tier !== undefined || spec?.p !== undefined)) {
        p=Math.max(p,clamp5(spec.tier ?? spec.p)); found=true;
      }
      if(powerById.has(id)) {p=Math.max(p,powerById.get(id));found=true;}
      // Affixes anciens issus de la V2 si absents du nouveau catalogue.
      else if(!found && global.AlaricPricing?.powerForAffix) {
        const legacy=clamp5(global.AlaricPricing.powerForAffix(id));
        if(legacy) {p=Math.max(p,legacy);found=true;}
      }
    }
    if(!found) p=clamp5(item?.power);
    return {q,p,rank:Math.min(10,q+p)};
  }
  function tieredIcon(icon,rank) {
    const raw=String(icon||'');
    // Seuls les SVG du jeu V3 possèdent les 11 variantes R00–R10 générées.
    if(!/^assets\/icons\/alaric-nouvelles\/[a-z0-9-]+(?:_R(?:0[0-9]|10))?\.svg$/i.test(raw))return raw;
    const r=Math.max(0,Math.min(10,Math.trunc(Number(rank)||0)));
    return raw.replace(/(?:_R(?:0[0-9]|10))?\.svg$/i,`_R${String(r).padStart(2,'0')}.svg`);
  }
  function normalizedItem(o, origin, maps={}) {
    if(!o || typeof o!=='object')return null;
    const id=normalizeId(first(o,['id','item_id','itemId','ID','sourceId']));
    const name=String(first(o,['name','nom','Nom objet','title','libelle']) ?? '').trim();
    if(!id || !name)return null;
    let pricePC = o.pricePC !== undefined ? parsePricePC(o.pricePC,'pc') : parsePricePC(first(o,['price','prix','pricePA','prix_pa','pricePa']),'pa');
    if (id === 'coam-f-0') pricePC=20; // Prix souhaité par le MJ ; source XLSX : 0,1 PA.
    const icon=iconUrl(maps[id] || first(o,['icon','icone','image','imageUrl','iconUrl','icon_url','illustration','image_url']));
    const sub=String(first(o,['subcategory','subCategory','sousCategorie','sous-catégorie','Sous-catégorie'])??'');
    const item = {id,name,category:String(first(o,['category','categorie','catégorie','Catégorie'])??'Divers'),subcategory:sub,
      description:String(first(o,['description','desc','Description / règles','rules','regles'])??''),
      pricePC,icon,origin,iconKey:String(o.iconKey||''),rarity:String(first(o,['rarity','rarete','rareté','Rareté'])??'Commun'),quality:Number(o.quality||o.cofSpec?.quality||0),power:Number(o.power||0),cofSpec:o.cofSpec||null,cofCompatible:o.cofCompatible!==false,affixes:Array.isArray(o.affixes)?o.affixes:[],visible:o.visible !== false,
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
    for(const id of ['cof-b049','b049','objets-munitions-carquois-de-20-fleches'])byId.delete(id); // Ancien carquois avec flèches.
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
      description:String(item.description||'').slice(0,4000),pricePC,quality:Math.max(0,Math.min(5,Number(item.quality)||0)),power:Math.max(0,Math.min(5,Number(item.power)||0)),rarity:String(item.rarity||'Commun'),iconKey:String(item.iconKey||''),cofSpec:item.cofSpec||null,cofCompatible:item.cofCompatible!==false,icon:iconUrl(item.icon),
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
      return {...it,visible:it.origin==='Base'?true:(adjust.visible!==undefined?adjust.visible:it.visible),
        pricePC:adjust.pricePC!==undefined?adjust.pricePC:it.pricePC,
        stock:stocks.has(it.id)?stocks.get(it.id):null};
    });
  }
  global.AlaricApp={cfg,db,auth,RARITY_LABELS,groupId,parsePricePC,formatPC,normalizeId,computeIconRank,tieredIcon,normalizedItem,fallbackIcon,loadCatalog,groupStocks,groupItems,getStock,getCustom,setStock,saveCustom,deleteCustom,migrationLegacy,compatibleAffixes,iconUrl,elem,getOverrides,setBaseOverride,overlay};
}(window));
