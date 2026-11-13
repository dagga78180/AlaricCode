(function(){
'use strict';
const A=window.AlaricApp, $=id=>document.getElementById(id);
let group='groupe1',catalog=null,stocks=new Map(),overrides=new Map(),custom=[],all=[],selected=new Set(),pending=null;
const notice=(txt,type='')=>{const e=$('admin-status');e.className='notice'+(type?' '+type:'');e.textContent=txt;};
const importNotice=(txt,type='')=>{const e=$('import-result');e.className='notice'+(type?' '+type:'');e.textContent=txt;};
const safe=(id)=>A.normalizeId(id);
const priceLabel=price=>price===null||price===undefined?'Prix à définir':A.formatPC(price);
const groupName=()=>A.cfg.groups[group];
const fetchState=async()=>{
  notice('Chargement des données…');pending=null;$('run-import').disabled=true;
  try{
    if(!catalog)catalog=await A.loadCatalog();
    [stocks,custom,overrides]=await Promise.all([A.getStock(group),A.getCustom(group),A.getOverrides(group)]);
    all=A.overlay(catalog.stockBase,custom,overrides,stocks,catalog.base);
    $('stat-visible').textContent=all.filter(o=>o.visible).length;
    $('stat-custom').textContent=custom.length;
    $('stat-limited').textContent=[...stocks.values()].filter(x=>Number.isInteger(x)).length;
    $('import-group').textContent=groupName();
    buildCategory();renderTable();buildTemplates();
    notice(groupName()+' prêt : '+all.length+' objets connus. Les modifications ne touchent pas l’autre groupe.','success');
    if(catalog.warnings)notice(groupName()+' : '+catalog.warnings+' Vérifie les chemins dans config.js.');
  }catch(e){notice('Erreur de chargement : '+e.message+'. Vérifie les règles Firestore et les noms des fichiers JSON.','error');console.error(e);}
};
function buildCategory(){const s=$('stock-category'),previous=s.value;s.replaceChildren(A.elem('option',{value:'',text:'Toutes les catégories'}));for(const c of [...new Set(all.map(i=>i.category))].sort((a,b)=>a.localeCompare(b,'fr')))s.append(A.elem('option',{value:c,text:c}));s.value=previous;}
function renderTable(){const needle=$('stock-search').value.trim().toLocaleLowerCase('fr'),category=$('stock-category').value;
  const rows=all.filter(i=>(!category||i.category===category)&&(!needle||`${i.name} ${i.id} ${i.category}`.toLocaleLowerCase('fr').includes(needle)));
  $('stock-count').textContent=rows.length+' objets affichés';const root=$('stock-rows');root.replaceChildren();
  for(const it of rows){const tr=A.elem('tr');const itemCell=A.elem('td');const text=A.elem('div');text.append(A.elem('strong',{text:it.name}),A.elem('div',{className:'code',text:it.id}),A.elem('span',{className:'pill',text:it.origin||'Base'}));
    itemCell.append(A.elem('div',{className:'row'},(A.catalogueIconForItem(it,catalog?.icons))?[A.elem('img',{src:A.tieredIcon(A.catalogueIconForItem(it,catalog?.icons),A.computeIconRank(it,catalog?.affixes).rank),alt:''}),text]:[text]));
    const priceCell=A.elem('td');priceCell.append(A.elem('div',{className:'nowrap',text:priceLabel(it.pricePC)}));
    if(it.origin!=='Création MJ')priceCell.append(A.elem('button',{className:'small ghost',text:'Changer',onClick:async()=>{
      const raw=prompt('Prix de '+it.name+' pour '+groupName()+' (ex: 2 PO 20 PA 50 PC)',it.pricePC===null?'':A.formatPC(it.pricePC));
      if(raw===null)return;const parsed=A.parsePricePC(raw,'pa');if(parsed===null){alert('Prix invalide. Utilise par ex. 2 PO 20 PA 50 PC.');return;}
      try{await A.setBaseOverride(group,it.id,{visible:it.visible,pricePC:parsed});await fetchState();}catch(e){notice('Prix : '+e.message,'error');}
    }}));
    const quantityInput=A.elem('input',{type:'number',min:'0',max:'1000000',placeholder:'∞',value:it.stock===null?'':String(it.stock)});quantityInput.setAttribute('aria-label','Stock de '+it.name);
    const quantityCell=A.elem('td');quantityCell.append(quantityInput);
    const shown=A.elem('input',{type:'checkbox',checked:it.visible,disabled:it.origin==='Catalogue V2'});shown.setAttribute('aria-label','Visible : '+it.name);
    const visibleCell=A.elem('td');visibleCell.append(shown);
    shown.addEventListener('change',async()=>{shown.disabled=true;try{await A.setBaseOverride(group,it.id,{visible:shown.checked});it.visible=shown.checked;notice(it.name+(shown.checked?' affiché':' masqué')+' dans '+groupName()+'.','success');}catch(e){shown.checked=!shown.checked;notice('Visibilité : '+e.message,'error');}finally{shown.disabled=false;}});
    const actions=A.elem('td');const buttons=A.elem('div',{className:'cell-actions'});buttons.append(A.elem('button',{className:'small primary',text:'Stock OK',onClick:async()=>{
      const val=quantityInput.value.trim();try{await A.setStock(group,it.id,val===''?null:Number(val));it.stock=val===''?null:Number(val);notice(`Stock de ${it.name} modifié dans ${groupName()} : ${val||'illimité'}.`,'success');}catch(e){notice('Stock : '+e.message,'error');}
    }}));
    if(it.origin==='Création MJ'||it.origin==='Alaric')buttons.append(
      A.elem('button',{className:'small',text:'Modifier',onClick:()=>editObject(it)}),
      A.elem('button',{className:'small warn',text:'Retirer',onClick:async()=>{
        if(!confirm(`Retirer ${it.name} de la sélection de ${groupName()} ?`))return;
        try{
          if(it.origin==='Création MJ')await A.deleteCustom(group,it.id);
          // Les anciens objets JSON de la V2 sont conservés en archive, mais masqués pour ce groupe.
          await A.setBaseOverride(group,it.id,{visible:false});
          await fetchState();
        }catch(e){notice('Retrait impossible : '+e.message,'error');}
      }})
    );actions.append(buttons);tr.append(itemCell,priceCell,quantityCell,visibleCell,actions);root.append(tr);
  }
}
function buildTemplates(){const s=$('template'),current=s.value;s.replaceChildren(A.elem('option',{value:'',text:'Objet entièrement personnalisé'}));
  for(const t of catalog.templates){s.append(A.elem('option',{value:t.id,text:`${t.sourceId} · ${t.name}`}));}s.value=current;
}
function switchTab(name){for(const tab of ['stock','editor','import','info']){$('tab-'+tab).classList.toggle('hidden',tab!==name);document.querySelector(`[data-tab="${tab}"]`).classList.toggle('active',tab===name);}}
function currentTemplate(){return catalog?.templates.find(t=>t.id===$('template').value)||null;}
function getCompatible(){const t=currentTemplate();return t?A.compatibleAffixes(t,catalog.affixes):[];}
function displayAffixes(){const search=$('affix-search').value.trim().toLocaleLowerCase('fr'),matches=getCompatible().filter(a=>!search||`${a.id} ${a.name} ${a.rpName||''} ${a.rpDescription||''} ${a.effect} ${a.category}`.toLocaleLowerCase('fr').includes(search));
  const root=$('affix-list');root.replaceChildren();
  if(!$('template').value){root.append(A.elem('p',{className:'muted',text:'Choisis un modèle pour voir les affixes compatibles.'}));return;}
  root.append(A.elem('p',{className:'muted tiny',text:`${matches.length} affixes compatibles trouvés (50 affichés).`}));
  for(const aff of matches.slice(0,50)){
    const line=A.elem('label',{className:'affix-option'}),cb=A.elem('input',{type:'checkbox',checked:selected.has(aff.id)});
    cb.addEventListener('change',()=>{if(cb.checked){if(selected.size>=10){cb.checked=false;alert('Maximum 10 affixes par objet');return;}selected.add(aff.id);}else selected.delete(aff.id);renderSelected();});
    line.append(cb,A.elem('span',{text:`${aff.id} · ${aff.rpName||aff.name} — ${aff.effect}`}));root.append(line);
  }
}
function renderSelected(){const root=$('selected-affixes');root.replaceChildren();
  refreshPq();if(!selected.size){root.append(A.elem('p',{className:'muted',text:'Aucun affixe.'}));return;}
  for(const id of selected){const a=catalog.affixes.find(x=>x.id===id);if(!a)continue;
    const line=A.elem('div',{className:'row'});line.append(A.elem('span',{className:'pill',text:a.id}),A.elem('strong',{text:a.rpName||a.name}),A.elem('span',{className:'muted tiny',text:a.effect}),A.elem('button',{className:'small warn',text:'×',onClick:()=>{selected.delete(id);renderSelected();displayAffixes();}}));root.append(line);
  }
}
function setTemplate(t){selected.clear();if(!t){$('object-category').value='Divers';$('object-subcategory').value='';$('object-description').value='';$('object-price').value='';$('object-icon').value='';displayAffixes();renderSelected();return;}
  $('object-quality').value=String(t.quality||0);$('object-name').value=t.name;$('object-category').value=t.category;$('object-subcategory').value=t.subcategory||'';$('object-description').value=t.description||'';
  $('object-price').value=t.pricePC===null?'':priceLabel(t.pricePC);$('object-icon').value=catalog.icons[t.id]||'';
  displayAffixes();renderSelected();
}
function resetEditor(){selected.clear();$('editor-form').reset();$('object-quality').value='0';$('edit-id').value='';$('object-id').disabled=false;$('object-id').value='';$('object-category').value='Divers';$('object-visible').checked=true;displayAffixes();renderSelected();}
function editObject(it){switchTab('editor');resetEditor();$('edit-id').value=it.id;$('object-id').value=it.id;$('object-id').disabled=true;
  $('template').value=it.templateId||(it.cofSpec?.base?A.normalizeId(it.cofSpec.base):'');$('object-quality').value=String(it.quality||it.cofSpec?.quality||0);$('object-name').value=it.name;$('object-category').value=it.category;$('object-subcategory').value=it.subcategory;$('object-description').value=it.description;$('object-price').value=it.pricePC===null?'':priceLabel(it.pricePC);$('object-icon').value=A.catalogueIconForItem(it,catalog?.icons);$('object-visible').checked=it.visible;
  selected=new Set((it.affixes||[]).length?(it.affixes||[]).map(a=>a.id):(it.cofSpec?.affixes||[]));displayAffixes();renderSelected();window.scrollTo({top:0,behavior:'smooth'});
}
function slug(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,56);}
function quality(){return Number($('object-quality')?.value||0);}
function power(){return A.computeIconRank({cofSpec:{affixes:[...selected]}},catalog?.affixes).p;}
function refreshPq(){if(!$('object-rank'))return;const p=power(),q=quality(),t=currentTemplate();const r=A.computeIconRank({category:t?.category||$('object-category').value,quality:q,cofSpec:{affixes:[...selected]}},catalog?.affixes).rank;$('object-power').textContent='P'+p;$('object-rank').textContent='R'+String(r).padStart(2,'0');}
function estimatePrice(){
  const t=currentTemplate();
  if(!t)return notice('Choisis un modèle avec prix de base.','error');
  const chosen=[...selected];
  if(quality()!==0 || chosen.length>1){
    $('calculated-price').textContent='Qualité Q>0 ou combinaison de plusieurs affixes : prix non validé par la matrice 1+1. Indique un prix manuel.';
    refreshPq();return;
  }
  let price=null;
  if(chosen.length===0)price=t.pricePC;
  else {
    const match=catalog.liaisons.find(x=>x.itemId===t.sourceId&&x.affixId===chosen[0]);
    if(match)price=match.priceMagiePC!==null?Math.round(match.priceMagiePC):
      match.priceConsoPA!==null?Math.round(match.priceConsoPA*100):null;
  }
  if(price!==null&&Number.isFinite(Number(price))){
    $('object-price').value=A.formatPC(Math.round(price));
    $('calculated-price').textContent='Prix exact de la liaison V2 : '+A.formatPC(Math.round(price));
  }else $('calculated-price').textContent='Prix non renseigné dans le classeur : saisie manuelle nécessaire.';
  refreshPq();
}
function normalizedAffixes(ids,t){return ids.map(id=>catalog.affixes.find(a=>a.id===id)).filter(Boolean).map(a=>({id:a.id,name:a.rpName||a.name,effect:a.effect}));}
async function saveEditor(e){e.preventDefault();const priceText=$('object-price').value.trim();const pc=priceText?A.parsePricePC(priceText,'pa'):null;
  if(priceText && pc===null){notice('Prix invalide : écris par ex. 1 PO 25 PA 20 PC','error');return;}
  const name=$('object-name').value.trim();if(!name)return;
  const id=$('edit-id').value||safe($('object-id').value||`mj-${slug(name)}-${Date.now().toString(36)}`);
  if([...catalog.base,...catalog.stockBase].some(b=>b.id===id && b.origin==='Catalogue V2')){notice('Cet identifiant est réservé au catalogue de base permanent.','error');return;}
  const t=currentTemplate(),affixes=normalizedAffixes([...selected],t);
  const obj={id,name,pricePC:pc,category:$('object-category').value.trim(),subcategory:$('object-subcategory').value.trim(),description:$('object-description').value.trim(),icon:$('object-icon').value.trim(),iconKey:t?.iconKey||'',quality:quality(),power:power(),rarity:(A.RARITY_LABELS||[])[A.computeIconRank({category:t?.category||$('object-category').value,quality:quality(),cofSpec:{affixes:[...selected]}},catalog?.affixes).rank]||'Commun',cofSpec:{base:t?.sourceId||'',quality:quality(),affixes:[...selected],name,price:pc===null?'':String(pc)+' pc'},visible:$('object-visible').checked,templateId:t?.id||'',affixes};
  const check=A.prepareRoll20Spec(obj,catalog);
  if(!check.ok && t){notice('Création refusée : export Roll20 non valide : '+check.errors.join(' / '),'error');return;}
  try{await A.saveCustom(group,obj);await A.setBaseOverride(group,id,{visible:obj.visible});await fetchState();resetEditor();switchTab('stock');notice(`Objet « ${name} » enregistré dans ${groupName()}.`,'success');}catch(err){notice('Enregistrement impossible : '+err.message,'error');}
}
function parseList(){
  const raw=$('import-json').value;
  let data;
  try{data=JSON.parse(raw);}catch(err){throw Error('JSON invalide : '+err.message);}
  const rows=Array.isArray(data)?data:data?.items;
  if(!Array.isArray(rows)||!rows.length)throw Error('Attendu : {"items":[...]} non vide.');
  if(rows.length>100)throw Error('Maximum 100 équipements par fichier.');
  if(!catalog||!Array.isArray(catalog.templates)||!Array.isArray(catalog.affixes))throw Error('Catalogue V2 non chargé. Recharge la page MJ.');
  const knownIds=new Set(all.map(i=>i.id)),local=new Set(),items=[],warnings=[];
  const reserved=new Set((catalog.base||[]).map(b=>String(b.id).toLowerCase()));
  const sourceMap=new Map(catalog.templates.map(t=>[String(t.sourceId||'').toUpperCase(),t]));
  const byId=new Map(catalog.affixes.map(a=>[String(a.id),a]));
  for(const [index,row] of rows.entries()){
    const line=index+1;
    if(!row||typeof row!=='object'||Array.isArray(row))throw Error('Ligne '+line+' : objet JSON invalide.');
    const requested=String(row.templateId||row.modele||row.cofSpec?.base||'').trim();
    const cleaned=requested.replace(/^cof-/i,'');
    const t=catalog.templates.find(t=>String(t.id).toLowerCase()===cleaned.toLowerCase()||String(t.id).toLowerCase()===requested.toLowerCase()) || sourceMap.get(cleaned.toUpperCase()) || null;
    const ids=(Array.isArray(row.affixIds)?row.affixIds:Array.isArray(row.cofSpec?.affixes)?row.cofSpec.affixes:[]).map(id=>String(id).trim());
    const qualityValue=row.quality??row.cofSpec?.quality??0;
    const q=Number(qualityValue);
    const name=String(row.nom||row.name||t?.name||'').trim();
    if(!name)throw Error('Ligne '+line+' : nom manquant.');
    if(!t&&(requested||ids.length||q!==0))throw Error('Ligne '+line+' ('+name+') : modèle V2 introuvable '+requested+'. Vérifie shared.js et le catalogue V2.');
    if(!Number.isInteger(q)||q<0||q>5)throw Error('Ligne '+line+' ('+name+') : qualité Q incorrecte : '+qualityValue);
    if(q>0&&t&&!['arme','armure'].includes(String(t.category||'').toLowerCase()))throw Error('Ligne '+line+' ('+name+') : qualité Q interdite pour '+t.category);
    if(ids.length>10||new Set(ids).size!==ids.length||ids.some(id=>!id))throw Error('Ligne '+line+' ('+name+') : affixes manquants, répétés ou plus de 10.');
    const compatible=t?new Set((typeof A.compatibleAffixes==='function'?A.compatibleAffixes(t,catalog.affixes):catalog.affixes.filter(a=>a.allowedBaseIds?.includes(t.sourceId))).map(a=>a.id)):new Set();
    for(const aid of ids){if(!byId.has(aid)||!compatible.has(aid))throw Error('Ligne '+line+' ('+name+') : affixe '+aid+' incompatible avec '+(t?.sourceId||'?'));}
    if(t?.category==='consommable'&&ids.length>1)throw Error('Ligne '+line+' ('+name+') : un seul affixe pour consommable.');
    const id=A.normalizeId(row.id||'mj-'+name);
    if(!id||reserved.has(id)||local.has(id))throw Error('Ligne '+line+' ('+name+') : identifiant absent, réservé ou en double : '+id);
    local.add(id);
    if(knownIds.has(id))warnings.push('Déjà présent : '+id+' (sera mis à jour)');
    const rawPrice=row.pricePC??row.prix??row.price;
    const price=rawPrice===null||rawPrice===undefined||rawPrice===''?(t?.pricePC??null):
      row.pricePC!==undefined?A.parsePricePC(rawPrice,'pc'):A.parsePricePC(rawPrice,'pa');
    if(price===null||!Number.isSafeInteger(price)||price<0)throw Error('Ligne '+line+' ('+name+') : prix PC invalide ou manquant.');
    const stockRaw=row.stock;
    const stock=stockRaw===null||stockRaw===undefined||stockRaw===''?null:Number(stockRaw);
    if(stock!==null&&(!Number.isSafeInteger(stock)||stock<0||stock>1000000))throw Error('Ligne '+line+' ('+name+') : stock invalide.');
    const effects=ids.map(aid=>byId.get(aid));
    const palier=Math.max(0,...effects.map(a=>Number(a.tier??a.p??0)));
    const category=String(t?.category||row.category||row.categorie||'divers');
    const config=row.config||row.cofSpec?.config||{};
    const spec={base:t?.sourceId||'',quality:q,affixes:ids,name,price:String(price)+' pc'};
    if(Object.keys(config).length)spec.config=config;
    if(row.cofSpec?.mode)spec.mode=row.cofSpec.mode;
    const item={id,name,category,subcategory:String(t?.subcategory||row.subcategory||''),description:String(row.description??t?.description??''),
      pricePC:price,quality:q,power:palier,visible:row.visible!==false,stock,templateId:t?.id||'',
      icon:String(row.icon||catalog.icons?.[t?.id]||catalog.icons?.[t?.sourceId]||t?.icon||''),
      rarity:(A.RARITY_LABELS||[])[Math.min(10,q+palier)]||'Commun',
      cofSpec:spec,affixes:effects.map(a=>({id:a.id,name:a.rpName||a.displayName||a.name,effect:a.effect,tier:Number(a.tier??a.p??0)}))};
    if(t&&typeof A.prepareRoll20Spec==='function'){
      const test=A.prepareRoll20Spec(item,catalog);
      if(!test.ok)throw Error('Ligne '+line+' ('+name+') : export Roll20 invalide : '+test.errors.join('; '));
      if(test.warnings?.length)warnings.push('Ligne '+line+' : '+test.warnings.join('; '));
    }
    items.push(item);
  }
  return {items,warnings};
}
function previewImport(){try{pending=parseList();$('run-import').disabled=false;importNotice(`${pending.items.length} objets valides pour ${groupName()}.\n`+(pending.warnings.length?pending.warnings.join('\n'):'Aucun identifiant déjà présent.'),'success');}
  catch(e){pending=null;$('run-import').disabled=true;importNotice(e.message,'error');}}
async function performImport(){if(!pending)return;
  const payload=pending;const conflicts=payload.warnings.filter(w=>w.startsWith('Déjà présent :')).length;
  if(!confirm(`Importer ${payload.items.length} objets dans ${groupName()} ? ${conflicts?'ATTENTION : '+conflicts+' identifiant(s) déjà présent(s), mise à jour à confirmer.':''}\nLa base de l'autre groupe ne sera pas modifiée.`))return;
  $('run-import').disabled=true;let saved=0,phase='';
  try{
    for(const it of payload.items){
      phase='création de la fiche';importNotice(`Import ${saved+1}/${payload.items.length} — ${it.name} (${phase})…`);
      await A.saveCustom(group,it);
      phase='visibilité';await A.setBaseOverride(group,it.id,{visible:it.visible});
      if(it.stock!==null){phase='quantité de stock';await A.setStock(group,it.id,it.stock);}
      saved++;
    }
    await fetchState();importNotice(`✓ ${saved} objets importés dans ${groupName()}.`,'success');
  }catch(e){
    const item=payload.items[saved];const code=e?.code||'';
    const hint=/permission-denied/i.test(code+' '+e.message)?' Vérifie que ton compte MJ possède les droits Firestore et que les règles publiées utilisent le bon UID.':
      /unavailable|network/i.test(code+' '+e.message)?' Vérifie ta connexion Firebase.':'';
    importNotice(`Import interrompu à la ligne ${saved+1}/${payload.items.length} (${item?.id||'?'}), étape « ${phase} » : ${e.message}.${hint} Les ${saved} lignes précédentes peuvent déjà être enregistrées ; relancer avec les mêmes IDs les mettra à jour.`, 'error');
    $('run-import').disabled=false;
  }
}
function exportItems(){const records=custom.map(c=>({id:c.id,nom:c.name,category:c.category,subcategory:c.subcategory,pricePC:c.pricePC,description:c.description,icon:c.icon,visible:c.visible,templateId:c.templateId,quality:c.cofSpec?.quality??c.quality??0,config:c.cofSpec?.config||{},affixIds:(c.cofSpec?.affixes||c.affixes?.map(a=>a.id)||[]),stock:stocks.has(c.id)?stocks.get(c.id):null}));
  const blob=new Blob([JSON.stringify({items:records},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`alaric-${group}-objets.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
for(const b of document.querySelectorAll('[data-tab]'))b.addEventListener('click',()=>switchTab(b.dataset.tab));
$('active-group').addEventListener('change',()=>{group=A.groupId($('active-group').value);resetEditor();fetchState();});
$('reload').addEventListener('click',fetchState);$('stock-search').addEventListener('input',renderTable);$('stock-category').addEventListener('change',renderTable);
$('template').addEventListener('change',()=>setTemplate(currentTemplate()));$('object-quality').addEventListener('change',refreshPq);$('calculate-price').addEventListener('click',estimatePrice);$('affix-search').addEventListener('input',displayAffixes);
$('editor-form').addEventListener('submit',saveEditor);$('reset-editor').addEventListener('click',resetEditor);
$('suggest-name').addEventListener('click',()=>{const t=currentTemplate();if(!t)return;const picked=[...selected].map(id=>catalog.affixes.find(a=>a.id===id)?.name).filter(Boolean);$('object-name').value=t.name+(picked.length?' · '+picked.join(' / '):'');});
$('import-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{$('import-json').value=await file.text();previewImport();}catch(x){importNotice(x.message,'error');}});
$('import-json').addEventListener('input',()=>{pending=null;$('run-import').disabled=true;});
$('preview-import').addEventListener('click',previewImport);$('run-import').addEventListener('click',performImport);$('export-items').addEventListener('click',exportItems);
if($('migrate-legacy'))$('migrate-legacy').hidden=true; // Aucun accès à la migration historique.
$('login-form').addEventListener('submit',async e=>{e.preventDefault();$('login-message').textContent='Connexion…';try{await A.auth.signInWithEmailAndPassword($('email').value.trim(),$('password').value);$('password').value='';}catch(err){$('login-message').textContent='Erreur de connexion : '+err.message;}});
$('logout').addEventListener('click',()=>A.auth.signOut());
A.auth.onAuthStateChanged(user=>{const yes=!!user;$('auth-box').classList.toggle('hidden',yes);$('dashboard').classList.toggle('hidden',!yes);
  if(yes){$('connected-as').textContent=user.email||user.uid;fetchState();}else{$('connected-as').textContent='';}
});
}());
