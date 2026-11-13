(function (global) {
  'use strict';
  const cfg = global.ALARIC_CONFIG;
  if (!global.firebase?.firestore || !global.firebase?.auth) throw Error('Firebase non chargé');
  const app = global.firebase.apps.length ? global.firebase.app() : global.firebase.initializeApp(cfg.firebase);
  const db = global.firebase.firestore(app), auth = global.firebase.auth(app);
  const validGroups = Object.keys(cfg.groups);
  const ICONS_CATALOGUE_V2={"CAC-01":"assets/icons/catalogue-v2/CAC-01_R00.svg","CAC-02":"assets/icons/catalogue-v2/CAC-02_R00.svg","CAC-03":"assets/icons/catalogue-v2/CAC-03_R00.svg","CAC-04":"assets/icons/catalogue-v2/CAC-04_R00.svg","CAC-05":"assets/icons/catalogue-v2/CAC-05_R00.svg","CAC-06":"assets/icons/catalogue-v2/CAC-06_R00.svg","CAC-07":"assets/icons/catalogue-v2/CAC-07_R00.svg","CAC-08":"assets/icons/catalogue-v2/CAC-08_R00.svg","CAC-09":"assets/icons/catalogue-v2/CAC-09_R00.svg","CAC-10":"assets/icons/catalogue-v2/CAC-10_R00.svg","CAC-11":"assets/icons/catalogue-v2/CAC-11_R00.svg","CAC-12":"assets/icons/catalogue-v2/CAC-12_R00.svg","CAC-13":"assets/icons/catalogue-v2/CAC-13_R00.svg","CAC-14":"assets/icons/catalogue-v2/CAC-14_R00.svg","DST-01":"assets/icons/catalogue-v2/DST-01_R00.svg","DST-02":"assets/icons/catalogue-v2/DST-02_R00.svg","DST-03":"assets/icons/catalogue-v2/DST-03_R00.svg","DST-04":"assets/icons/catalogue-v2/DST-04_R00.svg","DST-05":"assets/icons/catalogue-v2/DST-05_R00.svg","DST-07":"assets/icons/catalogue-v2/DST-07_R00.svg","DST-08":"assets/icons/catalogue-v2/DST-08_R00.svg","DST-09":"assets/icons/catalogue-v2/DST-09_R00.svg","DST-10":"assets/icons/catalogue-v2/DST-10_R00.svg","MAG-01":"assets/icons/catalogue-v2/MAG-01_R00.svg","MAG-02":"assets/icons/catalogue-v2/MAG-02_R00.svg","MAG-03":"assets/icons/catalogue-v2/MAG-03_R00.svg","MAG-04":"assets/icons/catalogue-v2/MAG-04_R00.svg","ARM-01":"assets/icons/catalogue-v2/ARM-01_R00.svg","ARM-02":"assets/icons/catalogue-v2/ARM-02_R00.svg","ARM-03":"assets/icons/catalogue-v2/ARM-03_R00.svg","ARM-04":"assets/icons/catalogue-v2/ARM-04_R00.svg","ARM-05":"assets/icons/catalogue-v2/ARM-05_R00.svg","ARM-06":"assets/icons/catalogue-v2/ARM-06_R00.svg","ARM-07":"assets/icons/catalogue-v2/ARM-07_R00.svg","BCL-01":"assets/icons/catalogue-v2/BCL-01_R00.svg","BCL-02":"assets/icons/catalogue-v2/BCL-02_R00.svg","ACC-01":"assets/icons/catalogue-v2/ACC-01_R00.svg","ACC-02":"assets/icons/catalogue-v2/ACC-02_R00.svg","ACC-03":"assets/icons/catalogue-v2/ACC-03_R00.svg","ACC-04":"assets/icons/catalogue-v2/ACC-04_R00.svg","ACC-05":"assets/icons/catalogue-v2/ACC-05_R00.svg","ACC-06":"assets/icons/catalogue-v2/ACC-06_R00.svg","ACC-08":"assets/icons/catalogue-v2/ACC-08_R00.svg","CON-01":"assets/icons/catalogue-v2/CON-01.svg","CON-02":"assets/icons/catalogue-v2/CON-02.svg","CON-03":"assets/icons/catalogue-v2/CON-03.svg","CON-04":"assets/icons/catalogue-v2/CON-04.svg","CON-05":"assets/icons/catalogue-v2/CON-05.svg","CON-07":"assets/icons/catalogue-v2/CON-07.svg","CON-08":"assets/icons/catalogue-v2/CON-08.svg","CON-09":"assets/icons/catalogue-v2/CON-09.svg","CON-10":"assets/icons/catalogue-v2/CON-10.svg","CON-11":"assets/icons/catalogue-v2/CON-11.svg","CON-12":"assets/icons/catalogue-v2/CON-12.svg","CON-13":"assets/icons/catalogue-v2/CON-13.svg","CON-14":"assets/icons/catalogue-v2/CON-14.svg","CON-15":"assets/icons/catalogue-v2/CON-15.svg","MUN-01":"assets/icons/catalogue-v2/MUN-01_R00.svg","MUN-02":"assets/icons/catalogue-v2/MUN-02_R00.svg","MUN-03":"assets/icons/catalogue-v2/MUN-03_R00.svg","MUN-04":"assets/icons/catalogue-v2/MUN-04_R00.svg","DIV-01":"assets/icons/catalogue-v2/DIV-01.svg","DIV-02":"assets/icons/catalogue-v2/DIV-02.svg","DIV-03":"assets/icons/catalogue-v2/DIV-03.svg","DIV-04":"assets/icons/catalogue-v2/DIV-04.svg","DIV-05":"assets/icons/catalogue-v2/DIV-05.svg","DIV-06":"assets/icons/catalogue-v2/DIV-06.svg","DIV-07":"assets/icons/catalogue-v2/DIV-07.svg","DIV-08":"assets/icons/catalogue-v2/DIV-08.svg","DIV-09":"assets/icons/catalogue-v2/DIV-09.svg","DIV-10":"assets/icons/catalogue-v2/DIV-10.svg","DIV-11":"assets/icons/catalogue-v2/DIV-11.svg","DIV-12":"assets/icons/catalogue-v2/DIV-12.svg","DIV-13":"assets/icons/catalogue-v2/DIV-13.svg","DIV-14":"assets/icons/catalogue-v2/DIV-14.svg"};
  let CONSUMABLE_ICON_SVGS = {};
  const PALETTE_CATALOGUE_V2=['#ffffff','#9dffb0','#7ee1ff','#6aa8ff','#b48cff','#ffd36a','#ff7ee7','#ff9f43','#ff5f6d','#ff009d','#ffd900'];
  const ICON_CACHE = new Map();
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
    const kind=String(item?.category||item?.categorie||'').toLowerCase();
    const q=['arme','armure'].includes(kind)||!kind ? clamp5(item?.quality ?? item?.cofSpec?.quality ?? 0) : 0;
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

    }
    if(!found) p=clamp5(item?.power);
    // Consommables P1=blanc (R00), puis P2=vert etc.; pas de qualité.
    const rank=(kind==='consommable'||kind==='munition')?Math.max(0,p-1):Math.min(10,q+p);
    return {q,p,rank};
  }
  // Toutes les 75 bases V2 sont reliées aux dessins reçus dans Icone.zip.
  // Les créations MJ attachées à une base V2 reçoivent également ce dessin,
  // sauf si une illustration externe spécifique a été définie.
  function catalogueIconForItem(item,icons=ICONS_CATALOGUE_V2){
    const baseId=String(item?.cofSpec?.base||item?.sourceId||item?.id||'').toUpperCase();
    const mapped=icons[baseId]||icons[normalizeId(baseId)]||ICONS_CATALOGUE_V2[baseId]||'';
    const explicit=String(item?.icon||'');
    if(item?.origin==='Création MJ' && /^(?:https:\/\/|assets\/icons\/custom\/)/i.test(explicit))return explicit;
    return mapped||explicit||fallbackIcon(item);
  }
  function tieredIcon(icon,rank) {
    const raw=String(icon||'').trim();
    const r=Math.max(0,Math.min(10,Math.trunc(Number(rank)||0)));
    const idMatch=/^assets\/icons\/catalogue-v2\/([A-Z]{3}-\d{2})(?:_R(?:0\d|10))?\.svg(?:[?#].*)?$/i.exec(raw);
    if(idMatch){
      const id=idMatch[1].toUpperCase();
      // Un SEUL fichier SVG par consommable, colorisé en mémoire (jamais de
      // CON-xx_R00, CON-xx_R01...): P1 -> R00, P5 -> R04.
      if(id.startsWith('CON-')){
        const svg=CONSUMABLE_ICON_SVGS[id];
        if(!svg)return `assets/icons/catalogue-v2/${id}.svg?v=2`;
        const k=`${id}:R${r}`;
        if(!ICON_CACHE.has(k)){
          const colored=svg.replace(/#ffffff/gi,PALETTE_CATALOGUE_V2[Math.min(4,r)]);
          ICON_CACHE.set(k,'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(colored));
        }
        return ICON_CACHE.get(k);
      }
      if(id.startsWith('DIV-'))return `assets/icons/catalogue-v2/${id}.svg?v=2`;
      const cap=/^(?:ACC-|MUN-)/.test(id)?5:10;
      return `assets/icons/catalogue-v2/${id}_R${String(Math.min(cap,r)).padStart(2,'0')}.svg?v=2`;
    }
    // Compatibilité des chemins d'icônes (ne rétablit aucun ancien catalogue d'objets).
    const old=/^(assets\/icons\/alaric-nouvelles\/[a-z0-9-]+?)(?:_R(?:0[0-9]|10))?\.svg(?:[?#].*)?$/i.exec(raw);
    return old?`${old[1]}_R${String(r).padStart(2,'0')}.svg?v=43`:raw;
  }
  function normalizedItem(o, origin, maps={}) {
    if(!o || typeof o!=='object')return null;
    const id=normalizeId(first(o,['id','item_id','itemId','ID','sourceId']));
    const name=String(first(o,['name','nom','Nom objet','title','libelle']) ?? '').trim();
    if(!id || !name)return null;
    let pricePC = o.pricePC !== undefined ? parsePricePC(o.pricePC,'pc') : parsePricePC(first(o,['price','prix','pricePA','prix_pa','pricePa']),'pa');
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
    // Catalogue V2 EXCLUSIF : ni templates.json, ni affixes.json, ni anciennes bases.
    const [objets,affixes,liaisons,svgs]=await Promise.all([
      fetchJSON('data/catalogue-objets-v2.json'),
      fetchJSON('data/catalogue-affixes-v2.json'),
      fetchJSON('data/catalogue-liaisons-v2.json'),
      fetchJSON('data/icones-consommables-v2.json').catch(e=>{console.warn('Icônes consommables non chargées :',e);return {};})
    ]);
    if(!Array.isArray(objets)||objets.length!==75||!Array.isArray(affixes)||affixes.length!==536||!Array.isArray(liaisons)||liaisons.length!==2278)
      throw Error('Catalogue V2 incomplet ou incohérent (75/536/2278 attendus).');
    CONSUMABLE_ICON_SVGS=svgs&&typeof svgs==='object'&&!Array.isArray(svgs)?svgs:{};ICON_CACHE.clear();
    const icons=Object.fromEntries(Object.entries(ICONS_CATALOGUE_V2).flatMap(([id,path])=>[[id,path],[normalizeId(id),path]]));
    const templates=objets.map(b=>({
      id:normalizeId(b.id),sourceId:b.id,name:b.name,category:b.category,
      subcategory:b.subcategory,description:b.description,pricePC:b.pricePC,
      tags:(b.baseTags||[]).join(','),iconKey:b.iconKey||'',icon:icons[b.id]||fallbackIcon(b),
      affixMode:b.affixModeDefault||''
    }));
    const base=objets.map(b=>normalizedItem({
      ...b,id:b.id,sourceId:b.id,icon:icons[b.id]||fallbackIcon(b),
      cofSpec:{base:b.id,quality:0,affixes:[]},templateId:normalizeId(b.id)
    },'Catalogue V2'));
    return {base,templates,affixes,liaisons,icons,warnings:Object.keys(CONSUMABLE_ICON_SVGS).length===14?'':'Icônes des consommables non chargées : vérifier data/icones-consommables-v2.json.'};
  }

  // Pont strict Alaric -> COFantasy Items / COAlaric.
  // Renvoie exactement la spec attendue par !co-alaric panier, jamais un objet Firebase brut.
  // La même logique est utilisée au chargement de la boutique et à la copie du panier.
  function prepareRoll20Spec(item, catalog) {
    const failures=[],warnings=[];
    const raw=item?.cofSpec;
    if(!raw || typeof raw!=='object' || Array.isArray(raw))
      return {ok:false,errors:['Modèle Roll20 absent : choisir un objet du catalogue V2.'],warnings};
    const baseId=String(raw.base||'').trim();
    const base=(catalog?.base||[]).find(b=>String(b.sourceId||b.cofSpec?.base||'')===baseId);
    if(!base)return {ok:false,errors:['Identifiant de base inconnu dans le catalogue V2 : '+(baseId||'(vide)')],warnings};
    const pricePC=item.pricePC;
    if(pricePC===null||pricePC===undefined||!Number.isSafeInteger(Number(pricePC))||Number(pricePC)<0)
      failures.push('Prix manquant ou invalide (PC entiers).');
    const rawQuality=raw.quality??item.quality??0, quality=Number(rawQuality);
    if(!Number.isInteger(quality)||quality<0||quality>5)failures.push('Qualité hors limites (Q0 à Q5).');
    if(quality>0&&!['arme','armure'].includes(base.category))
      failures.push('La qualité Q est réservée aux armes et armures.');
    const ids=Array.isArray(raw.affixes)?raw.affixes:[];
    const unique=[...new Set(ids.map(id=>String(id||'').trim()))];
    if(unique.includes('')||ids.length!==unique.length)failures.push('Affixes vides ou dupliqués.');
    if(unique.length>10)failures.push('Maximum 10 affixes par objet.');
    if(base.category==='consommable'&&unique.length>1)failures.push('Un consommable ne porte qu’un seul affixe.');
    const byId=new Map((catalog?.affixes||[]).map(a=>[a.id,a]));
    const config={};
    for(const id of unique){
      const a=byId.get(id);
      if(!a){failures.push('Affixe inexistant : '+id);continue;}
      if(a.catalogVisible===false||!Array.isArray(a.allowedBaseIds)||!a.allowedBaseIds.includes(baseId)){
        failures.push('Affixe non autorisé pour '+baseId+' : '+id);continue;
      }
      const cfg=raw.config?.[id];
      if(cfg&&typeof cfg==='object'&&!Array.isArray(cfg)){
        const picked={};
        for(const field of ['type1','type2','classe','commande','predicat']){
          if(cfg[field]!==undefined&&cfg[field]!==null&&String(cfg[field]).trim())picked[field]=String(cfg[field]).trim();
        }
        if(Object.keys(picked).length)config[id]=picked;
      }
      if(a.name==='traitement double'&&(!config[id]?.type1||!config[id]?.type2))
        failures.push(id+' : type1 et type2 manquants.');
      if(String(a.name||'').includes('"Classe"')&&!config[id]?.classe)
        failures.push(id+' : classe manquante.');
      if(!a.auto&&!config[id]?.commande&&!config[id]?.predicat)
        warnings.push(id+' : effet manuel, non automatisé dans Roll20.');
    }
    if(base.category==='divers'&&unique.length)failures.push('Les matériels ne peuvent pas recevoir d’affixe.');
    const spec={base:baseId,quality:Number.isInteger(quality)?quality:0,affixes:unique};
    if(raw.mode)spec.mode=String(raw.mode);
    if(String(raw.name||item.name||'').trim())spec.name=String(raw.name||item.name).trim();
    if(Number.isSafeInteger(Number(pricePC))&&pricePC!==null)spec.price=String(pricePC)+' pc';
    if(raw.rarity)spec.rarity=String(raw.rarity);
    if(Object.keys(config).length)spec.config=config;
    return {ok:!failures.length,errors:failures,warnings,spec};
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
    if(/^((cac|dst|mag|arm|bcl|acc|mun|con|div)-\d+)$/i.test(id))throw Error('Identifiant de catalogue V2 réservé : '+id);
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
  async function migrationLegacy(){
    throw Error('Migration de catalogue historique désactivée en V2 stricte.');
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
    const id=String(t?.sourceId||t?.id||'').toUpperCase();
    return (Array.isArray(affixes)?affixes:[]).filter(a=>
      a.visible!==false && Array.isArray(a.allowedBaseIds) && a.allowedBaseIds.includes(id));
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
    for(const item of custom){
      const baseId=String(item?.cofSpec?.base||'').toLowerCase();
      if(baseId&&!all.has(normalizeId(baseId)))continue; // Seules les bases V2 exactes sont acceptées.
      all.set(item.id,{...item});
    }
    return [...all.values()].map(it=>{
      const adjust=overrides.get(it.id)||{};
      return {...it,visible:it.origin==='Catalogue V2'?true:(adjust.visible!==undefined?adjust.visible:it.visible),
        pricePC:adjust.pricePC!==undefined?adjust.pricePC:it.pricePC,
        stock:stocks.has(it.id)?stocks.get(it.id):null};
    });
  }
  global.AlaricApp={cfg,db,auth,RARITY_LABELS,groupId,parsePricePC,formatPC,normalizeId,prepareRoll20Spec,computeIconRank,tieredIcon,catalogueIconForItem,normalizedItem,fallbackIcon,loadCatalog,groupStocks,groupItems,getStock,getCustom,setStock,saveCustom,deleteCustom,migrationLegacy,compatibleAffixes,iconUrl,elem,getOverrides,setBaseOverride,overlay};
}(window));
