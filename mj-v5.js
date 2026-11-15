(function(){
'use strict';
const A=window.AlaricApp,$=id=>document.getElementById(id),GROUPS=['groupe1','groupe2'];
let catalog=null,priceModel=null,pending=null,backupPending=null,busy=false;
const state={},edits=new Map(),selectedRows=new Set(),chosenAffixes=new Set(),importChoices=new Map();
const enc=x=>String(x??''),numeric=x=>x!==''&&Number.isFinite(Number(x))&&Number(x)>=0;
const esc=s=>enc(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groups=()=> $('active-group').value==='both'?GROUPS:[$('active-group').value];
const names={groupe1:'Groupe 1',groupe2:'Groupe 2'};
const status=(msg,type='')=>{const el=$('admin-status');el.className='notice'+(type?' '+type:'');el.textContent=msg;};
const importStatus=(msg,type='')=>{const el=$('import-result');el.className='notice'+(type?' '+type:'');el.textContent=msg;};
const backupStatus=(msg,type='')=>{const el=$('backup-result');el.className='notice'+(type?' '+type:'');el.textContent=msg;};
function tab(name){for(const n of ['home','stock','editor','import','backup','info']){$('tab-'+n).classList.toggle('hidden',n!==name);document.querySelector('[data-tab="'+n+'"]').classList.toggle('active',n===name);}}
function combined(){const map=new Map();for(const g of GROUPS)for(const it of state[g]?.items||[]){if(!map.has(it.id))map.set(it.id,{id:it.id,ref:it});}return [...map.values()].sort((a,b)=>a.ref.name.localeCompare(b.ref.name,'fr'));}
function itemFor(id,g){return state[g]?.byId.get(id)||null;}
function k(id,g){return g+'|'+id;}
function draft(id,g){const it=itemFor(id,g);if(!it)return null;return edits.get(k(id,g))||{stock:it.stock===null?'':String(it.stock),price:String(it.pricePC??''),visible:!!it.visible};}
function changeDraft(id,g,prop,val){const base=draft(id,g);if(!base)return;edits.set(k(id,g),{...base,[prop]:val});refreshChanges();}
function refreshChanges(){const n=edits.size;$('changes-status').textContent=n?n+' groupe(s)/objet(s) modifié(s), non enregistrés':'Aucune modification';$('save-changes').disabled=!n||busy;$('cancel-changes').disabled=!n||busy;}
async function loadAll(){if(busy)return;busy=true;status('Chargement des deux groupes…');try{
 if(!catalog)catalog=await A.loadCatalog();
 if(!priceModel){try{const r=await fetch('data/pricing-model.json',{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);priceModel=await r.json();}catch(e){console.warn('Modèle de prix P/Q absent',e);}}
 for(const g of GROUPS){const [stocks,custom,overrides]=await Promise.all([A.getStock(g),A.getCustom(g),A.getOverrides(g)]);const items=A.overlay(catalog.stockBase,custom,overrides,stocks,catalog.base);state[g]={stocks,custom,overrides,items,byId:new Map(items.map(it=>[it.id,it]))};}
 edits.clear();selectedRows.clear();pending=null;importChoices.clear();$('run-import').disabled=true;
 renderDashboard();buildCategories();buildRarities();renderTable();buildTemplates();renderAffixes();renderEditor();
 const bookErrors=await syncPricebooks();status(bookErrors.length?'Les données sont chargées, mais le livre des prix doit être corrigé : '+bookErrors.join(' | '):'Les deux groupes sont chargés. Boutique joueur V6 chargée avec les nouveaux prix et textes RP.',bookErrors.length?'error':'success');
 }catch(e){console.error(e);status('Chargement impossible : '+e.message,'error');}finally{busy=false;refreshChanges();}}
function priceBookError(e){
 if(e?.code==='permission-denied'||/Missing or insufficient permissions/i.test(e?.message||''))
   return 'accès au livre des prix refusé par Firestore. Vérifie que les règles V6 sont PUBLIÉES et que isMJ() utilise l’UID du compte MJ connecté (voir Configuration et GUIDE_CORRECTION_FIREBASE.md).';
 return String(e?.message||e);
}
async function syncPricebooks(){const msgs=[],errors=[];for(const g of GROUPS){try{const b=await A.publishPriceBook(g,state[g].items,catalog);msgs.push(names[g]+': '+b.count+' prix '+(b.updated?'actualisés':'à jour'));}catch(e){const detail=priceBookError(e);msgs.push(names[g]+': ERREUR '+detail);errors.push(names[g]+' : '+detail);}}$('pricebook-status').textContent=msgs.join(' · ');return errors;}
function renderDashboard(){const out=$('home-metrics');out.replaceChildren();for(const g of GROUPS){const s=state[g],v=s.items.filter(it=>it.visible),limited=v.filter(x=>Number.isInteger(x.stock)),low=limited.filter(x=>x.stock<=2);const box=A.elem('article',{className:'mj-metric'});box.innerHTML='<h3>'+names[g]+'</h3><div class="mj-stat"><div><strong>'+v.length+'</strong><small>En vente</small></div><div><strong>'+s.custom.length+'</strong><small>Créations MJ</small></div><div><strong>'+low.length+'</strong><small>Stock ≤ 2</small></div></div>';out.append(box);}}
function buildCategories(){const sel=$('stock-category'),prev=sel.value;sel.replaceChildren(A.elem('option',{value:'',text:'Toutes les catégories'}));for(const cat of [...new Set(combined().map(x=>x.ref.category))].sort((a,b)=>a.localeCompare(b,'fr')))sel.append(A.elem('option',{value:cat,text:cat}));sel.value=prev;}
function buildRarities(){const sel=$('stock-rarity'),prev=sel.value;sel.replaceChildren(A.elem('option',{value:'',text:'Toutes les raretés'}));for(const rarity of [...new Set(combined().map(x=>x.ref.rarity))].sort((a,b)=>a.localeCompare(b,'fr')))sel.append(A.elem('option',{value:rarity,text:rarity}));sel.value=prev;}
function rowsFiltered(){const needle=$('stock-search').value.trim().toLocaleLowerCase('fr'),cat=$('stock-category').value,rarity=$('stock-rarity').value,presence=$('stock-presence').value;return combined().filter(({id,ref})=>{
 if(cat&&ref.category!==cat)return false;if(rarity&&ref.rarity!==rarity)return false;if(needle&&!`${ref.name} ${id} ${ref.category} ${ref.subcategory||''}`.toLocaleLowerCase('fr').includes(needle))return false;
 const parts=GROUPS.map(g=>itemFor(id,g)).filter(Boolean);if(presence==='visible'&&!parts.some(x=>x.visible))return false;if(presence==='hidden'&&parts.some(x=>x.visible))return false;if(presence==='low'&&!parts.some(x=>x.visible&&Number.isInteger(x.stock)&&x.stock<=2))return false;return true;
 });}
function renderTable(){const rows=rowsFiltered();$('stock-count').textContent=rows.length+' objets';const tbody=$('stock-rows');tbody.replaceChildren();for(const {id,ref} of rows){const tr=A.elem('tr');let img='';try{img=A.tieredIcon(A.catalogueIconForItem(ref,catalog?.icons),A.computeIconRank(ref,catalog?.affixes).rank)||'';}catch(e){}const first=A.elem('td',{className:'mj-sticky-name'});const wrapper=A.elem('div',{className:'object-main'});const cb=A.elem('input',{type:'checkbox',checked:selectedRows.has(id)});cb.setAttribute('aria-label','Sélectionner '+ref.name);cb.addEventListener('change',()=>{if(cb.checked)selectedRows.add(id);else selectedRows.delete(id);refreshSelection();});const details=A.elem('div');details.append(A.elem('div',{className:'object-label',text:ref.name}),A.elem('div',{className:'object-sub',text:ref.category+' · '+id}));if(img)wrapper.append(cb,A.elem('img',{src:img,alt:''}),details);else wrapper.append(cb,details);first.append(wrapper);tr.append(first);
 for(const field of ['stock','price','visible'])for(const g of GROUPS){const it=itemFor(id,g),value=draft(id,g),td=A.elem('td');const scoped=groups().includes(g);if(!it){if(field==='stock'&&ref.origin==='Création MJ'){td.append(A.elem('button',{className:'small subtle',text:'Ajouter',onClick:()=>copyToGroup(id,g)}));}else td.append(A.elem('span',{className:'mj-missing',text:'Non présent'}));tr.append(td);continue;}
 if(field==='visible'){const input=A.elem('input',{type:'checkbox',checked:value.visible,disabled:!scoped});input.setAttribute('aria-label','Visible '+ref.name+' '+names[g]);input.addEventListener('change',()=>changeDraft(id,g,'visible',input.checked));td.append(input);}else{const input=A.elem('input',{type:'number',min:'0',step:field==='stock'?'1':'0.01',placeholder:field==='stock'?'∞':'PA',value:field==='stock'?value.stock:(value.price===''?'':String(Number(value.price)/100)),disabled:!scoped});input.setAttribute('aria-label',(field==='stock'?'Stock ':'Prix ')+ref.name+' '+names[g]);input.addEventListener('input',()=>{changeDraft(id,g,field,field==='stock'?input.value:(input.value===''?'':String(Math.round(Number(input.value)*100))))});td.append(input);}tr.append(td);
 }tbody.append(tr);}refreshSelection();refreshChanges();}
function refreshSelection(){const shown=rowsFiltered().map(x=>x.id);$('selection-count').textContent=selectedRows.size+' sélection(s)';$('select-all').checked=shown.length>0&&shown.every(id=>selectedRows.has(id));}
function applyBulkStock(){if(!selectedRows.size)return status('Sélectionne des objets dans le tableau.','error');const raw=$('bulk-value').value.trim();if(!/^\d+$/.test(raw)||Number(raw)>1000000)return status('Quantité invalide (0 à 1 000 000).','error');const quantity=Number(raw),mode=$('bulk-mode').value;let touched=0;for(const id of selectedRows)for(const g of groups()){const current=draft(id,g);if(!current)continue;let n=quantity;if(mode==='add'){const prev=current.stock===''?0:Number(current.stock);n=prev+quantity;}if(n>1000000)return status('Stock supérieur à 1 000 000.','error');changeDraft(id,g,'stock',String(n));touched++;}renderTable();status(touched+' stocks préparés : clique sur « Enregistrer les modifications ».','success');}
async function saveChanges(){if(!edits.size||busy)return;for(const [key,v] of edits){const g=key.split('|')[0],id=key.slice(g.length+1),original=itemFor(id,g);if(!original)continue;if(v.stock!==''&&(!/^\d+$/.test(v.stock)||Number(v.stock)>1000000))return status('Stock invalide pour '+original.name+' / '+names[g],'error');if(v.price===''||!/^\d+$/.test(v.price)||!Number.isSafeInteger(Number(v.price))||Number(v.price)>1e11)return status('Prix invalide pour '+original.name+' / '+names[g],'error');}
 if(!confirm('Enregistrer les modifications de '+edits.size+' cellule(s)/objet(s) de groupe ?'))return;busy=true;refreshChanges();let n=0;try{for(const [key,v] of edits){const g=key.split('|')[0],id=key.slice(g.length+1),it=itemFor(id,g);if(!it)continue;if(v.stock!==(it.stock===null?'':String(it.stock)))await A.setStock(g,id,v.stock===''?null:Number(v.stock));if(Number(v.price)!==it.pricePC||v.visible!==it.visible)await A.setBaseOverride(g,id,{pricePC:Number(v.price),visible:v.visible});n++;}busy=false;await loadAll();status(n+' modification(s) enregistrée(s) ; prix synchronisés.','success');}catch(e){busy=false;status('Enregistrement interrompu après '+n+' groupe(s)/objet(s) : '+e.message+'. Recharge pour contrôler les modifications.','error');refreshChanges();}}
async function bulkVisibility(visible){if(!selectedRows.size)return status('Sélectionne au moins un objet.','error');for(const id of selectedRows)for(const g of groups()){const v=draft(id,g);if(v)changeDraft(id,g,'visible',visible);}renderTable();status('Visibilité préparée. Clique sur Enregistrer pour appliquer.','success');}
async function copyToGroup(id,g){const from=GROUPS.find(x=>x!==g&&itemFor(id,x));if(!from)return status('Aucune fiche à copier.','error');const original=itemFor(id,from);if(original.origin!=='Création MJ')return status('Seules les créations MJ peuvent être copiées dans ce groupe.','error');if(!confirm('Ajouter « '+original.name+' » dans '+names[g]+' ? Le stock initial sera copié, puis modifiable dans le tableau.'))return;try{await A.saveCustom(g,original,{replace:true});await A.setBaseOverride(g,id,{visible:original.visible,pricePC:original.pricePC},{replace:true});await A.setStock(g,id,original.stock);await loadAll();status(original.name+' ajouté à '+names[g]+'.','success');}catch(e){status('Copie impossible : '+e.message,'error');}}
async function bulkDelete(){if(!selectedRows.size)return status('Sélectionne au moins un objet.','error');if(!confirm('Retirer '+selectedRows.size+' objet(s) des boutiques sélectionnées ? Pour une création MJ cela supprime la fiche et son stock de chaque groupe visé. Les objets de base seront simplement masqués.'))return;if(!confirm('Confirmer la suppression / le retrait ? Cette action est définitive pour les créations MJ.'))return;let n=0;try{for(const id of selectedRows)for(const g of groups()){const it=itemFor(id,g);if(!it)continue;if(it.origin==='Création MJ'){await A.deleteCustom(g,id);await A.setStock(g,id,null);await A.db.collection('groups').doc(g).collection('baseOverrides').doc(id).delete();}else await A.setBaseOverride(g,id,{visible:false,pricePC:it.pricePC});n++;}await loadAll();status(n+' objet(s) retiré(s) des groupes concernés.','success');}catch(e){status('Suppression incomplète après '+n+' opérations : '+e.message,'error');}}
function buildTemplates(){const select=$('template'),old=select.value;select.replaceChildren(A.elem('option',{value:'',text:'Choisir un objet existant…'}));for(const t of catalog.templates)select.append(A.elem('option',{value:t.id,text:t.sourceId+' · '+t.name}));select.value=old||'';}
function template(){return catalog?.templates.find(t=>t.id===$('template').value)||null;}
function affixesFor(){const t=template();return t?A.compatibleAffixes(t,catalog.affixes):[];}
function renderAffixes(){const root=$('affix-list');root.replaceChildren();const t=template();if(!t){root.append(A.elem('p',{className:'muted tiny',text:'Choisis un objet de base.'}));$('selected-affixes').replaceChildren();return;}const search=$('affix-search').value.toLocaleLowerCase('fr');const matches=affixesFor().filter(a=>!search||`${a.id} ${a.name} ${a.rpName||''} ${a.effect}`.toLocaleLowerCase('fr').includes(search));root.append(A.elem('p',{className:'muted tiny',text:matches.length+' affixes compatibles (80 premiers affichés)'}));for(const a of matches.slice(0,80)){const label=A.elem('label',{className:'affix-option'}),box=A.elem('input',{type:'checkbox',checked:chosenAffixes.has(a.id)});box.addEventListener('change',()=>{if(box.checked){if(chosenAffixes.size>=(t.category==='consommable'?1:10)){box.checked=false;status('Maximum '+(t.category==='consommable'?1:10)+' affixe(s) pour cet objet.','error');return;}chosenAffixes.add(a.id);}else chosenAffixes.delete(a.id);renderChosen();renderEditor();});label.append(box,A.elem('span',{text:(a.rpName||a.name)+' — '+a.effect}));root.append(label);}renderChosen();}
function renderChosen(){const root=$('selected-affixes');root.replaceChildren();if(!chosenAffixes.size){root.append(A.elem('span',{className:'muted tiny',text:'Aucun affixe ajouté.'}));return;}for(const id of chosenAffixes){const a=catalog.affixes.find(x=>x.id===id);if(!a)continue;const line=A.elem('div',{className:'mj-affix-selected'});line.append(A.elem('span',{text:(a.rpName||a.name)+' · '+a.effect}),A.elem('button',{type:'button',className:'small warn',text:'×',onClick:()=>{chosenAffixes.delete(id);renderAffixes();renderEditor();}}));root.append(line);}}
// Les prix officiels proviennent du classeur CATALOGUE RP. Une seule liaison Q0 est exacte.
// Plusieurs affixes : addition de leurs seuls surcoûts, explicitement signalée comme estimation.
function computePrice(t,ids,q){
 if(!t||!Number.isSafeInteger(t.pricePC)||!priceModel)return {price:null,note:'Tarif de support ou barème indisponible.'};
 if(t.sourceId?.startsWith('CON-')&&t.sourceId!=='CON-15'&&!ids.length)
   return {price:null,note:'Ce consommable est un gabarit sans prix autonome : choisis un affixe.'};
 const srcBase=t.pricePC,basePA=srcBase/100;
 let pc=srcBase;
 if(q>0){
   const formula=priceModel.quality||{};
   if(q>Number(formula.qMax||5))return {price:null,note:'Qualité supérieure au barème.'};
   const supplementPA=(Number(formula.q1FixedPA)+Number(formula.q1PhysicalWeight)*basePA)*Math.pow(Number(formula.multiplier),q-1);
   if(!Number.isFinite(supplementPA))return {price:null,note:'Tarif de qualité introuvable.'};
   pc+=Math.round(supplementPA*100);
 }
 for(const id of ids){
   const link=catalog.liaisons.find(l=>l.itemId===t.sourceId&&l.affixId===id);
   if(!link||link.publication!=='Prêt')return {price:null,note:'Affixe non publiable ou liaison non validée : '+id};
   const linked=link.priceMagiePC!==null&&link.priceMagiePC!==undefined
     ? Math.round(Number(link.priceMagiePC))
     : link.priceConsoPA!==null&&link.priceConsoPA!==undefined ? Math.round(Number(link.priceConsoPA)*100) : NaN;
   if(!Number.isSafeInteger(linked))return {price:null,note:'Prix de liaison indisponible : '+id};
   pc+=linked-srcBase;
 }
 if(!Number.isSafeInteger(pc)||pc<0||pc>1e11)return {price:null,note:'Prix calculé hors limites.'};
 return {price:pc,note:ids.length>1?'Estimation automatique : addition des surcoûts de plusieurs affixes (le classeur ne chiffre que les associations à un affixe).':
   q>0?'Tarif du catalogue + supplément de qualité officiel.':'Tarif exact du catalogue RP validé.'};
}
function editorObject(){
 const t=template();if(!t)return null;
 const ids=[...chosenAffixes],q=Number($('object-quality').value),allowed=['arme','armure'].includes(t.category),actualQ=allowed?q:0;
 const affs=ids.map(id=>catalog.affixes.find(a=>a.id===id)).filter(Boolean);
 const baseSpec=catalog.objectSpecs.find(x=>x.id===t.sourceId)||{};
 if(actualQ>Number(baseSpec.qMax??5))return {error:'Qualité supérieure à la limite de cet objet.'};
 const link=ids.length===1?catalog.liaisons.find(l=>l.itemId===t.sourceId&&l.affixId===ids[0]&&l.publication==='Prêt'):null;
 const rootName=link?.name || (t.name+(affs.length?' — '+affs.map(a=>a.rpName||a.name).join(' · '):''));
 const name=rootName+(actualQ?' +'+actualQ:'');
 if(name.length>140)return {error:'Nom automatique trop long (140 caractères maximum). Réduis le nombre d’affixes.'};
 const pricing=computePrice(t,ids,actualQ);if(pricing.price===null)return {error:pricing.note};
 const rank=A.computeIconRank({category:t.category,quality:actualQ,cofSpec:{affixes:ids}},catalog.affixes);
 const desc=link?.description || (affs.length ? [baseSpec.rpDescription||t.description,...affs.map(a=>a.rpDescription)].filter(Boolean).join(' ') : t.description);
 const item={id:'mj-'+A.normalizeId(t.sourceId)+'-'+Date.now().toString(36),name,category:t.category,subcategory:t.subcategory,
   description:desc.slice(0,4000),pricePC:pricing.price,quality:actualQ,power:rank.p,
   rarity:A.RARITY_LABELS[rank.rank]||'Commun',icon:catalog.icons[t.sourceId]||t.icon,
   iconKey:t.iconKey||'',visible:true,templateId:t.id,
   cofSpec:{base:t.sourceId,quality:actualQ,affixes:ids,name,price:String(pricing.price)+' pc'},
   affixes:affs.map(a=>({id:a.id,name:a.rpName||a.name,effect:a.effect}))};
 return {item,pricing,source:baseSpec,check:A.prepareRoll20Spec(item,catalog)};
}
function renderEditor(){const t=template();$('object-quality').disabled=!t||!['arme','armure'].includes(t.category);if(t&&!['arme','armure'].includes(t.category))$('object-quality').value='0';const target=groups();$('editor-stock1').disabled=!target.includes('groupe1');$('editor-stock2').disabled=!target.includes('groupe2');$('editor-copy').disabled=target.length!==2;
 const root=$('object-preview'),note=$('editor-warning');root.replaceChildren();const data=editorObject();if(!data||!t){root.append(A.elem('p',{className:'muted',text:'Choisis un objet de base pour commencer.'}));note.textContent='';$('create-object').disabled=true;return;}if(data.error){root.append(A.elem('p',{className:'mj-danger-note',text:data.error}));note.textContent=data.error;$('create-object').disabled=true;return;}
 const {item,source,pricing,check}=data;const img=A.tieredIcon(A.catalogueIconForItem(item,catalog.icons),A.computeIconRank(item,catalog.affixes).rank);const header=A.elem('div',{className:'mj-preview-header'});if(img)header.append(A.elem('img',{src:img,alt:''}));const name=A.elem('div');name.append(A.elem('div',{className:'mj-preview-title',text:item.name}),A.elem('div',{className:'muted tiny',text:item.category+' · '+item.rarity}));header.append(name);root.append(header);
 const stats=A.elem('div',{className:'mj-preview-stats'});const stat=(label,val,full=false)=>{const box=A.elem('div',{className:'mj-preview-stat'+(full?' mj-preview-full':'')});box.append(A.elem('small',{text:label}),A.elem('strong',{text:String(val)}));stats.append(box);};
 if(item.category==='arme'){const dm=[source.weaponDmNb||1,'d',source.weaponDmDie||'?',item.quality?'+'+item.quality:'',source.weaponDmCar&&source.weaponDmCar!=='AUCUN'?'+'+source.weaponDmCar:''].join('');stat('ATTAQUE','+'+item.quality);stat('DM',dm);stat('TYPE DE DÉGÂTS',source.weaponDamageType||'Non renseigné',true);}else if(item.category==='armure'){stat('DEF','+'+(Number(source.armorBonus||0)+item.quality));stat('MALUS',Number(source.armorMalus) ? '−'+Math.abs(Number(source.armorMalus)) : (source.armorMalus===null||source.armorMalus===undefined?'—':'0'));}
 const effects=item.affixes.map(a=>a.effect).filter(Boolean).join(' · ')||source.playerEffect||'';if(effects)stat('EFFET',effects,true);root.append(stats);root.append(A.elem('div',{className:'price',text:A.formatPC(item.pricePC)}));root.append(A.elem('p',{className:'mj-price-note',text:pricing.note}));root.append(A.elem('p',{className:'muted tiny',text:'Description : '+item.description}));
 if(!check.ok){note.textContent='Impossible de générer une commande Roll20 valide : '+check.errors.join(' / ');$('create-object').disabled=true;}else{note.textContent=check.warnings?.join(' · ')||'Publication immédiate dans les groupes sélectionnés.';$('create-object').disabled=false;}
}
function validStock(s){return s.trim()===''||(/^\d+$/.test(s)&&Number(s)<=1000000);}
async function createObject(){const data=editorObject();if(!data||data.error||!data.check?.ok)return status('Objet incomplet ou non compatible Roll20.','error');for(const g of groups()){const v=$(g==='groupe1'?'editor-stock1':'editor-stock2').value;if(!validStock(v))return status('Stock invalide pour '+names[g],'error');}if(!confirm('Créer et publier « '+data.item.name+' » dans '+groups().map(g=>names[g]).join(' et ')+' ?'))return;
 const item=data.item;item.id='mj-'+A.normalizeId(template().sourceId)+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);let done=[];try{for(const g of groups()){await A.saveCustom(g,item,{replace:true});await A.setBaseOverride(g,item.id,{visible:true,pricePC:item.pricePC},{replace:true});const v=$(g==='groupe1'?'editor-stock1':'editor-stock2').value;await A.setStock(g,item.id,v.trim()===''?null:Number(v));done.push(names[g]);}await loadAll();tab('stock');status('Objet publié : '+item.name+' → '+done.join(' et ')+'.','success');}catch(e){status('Création interrompue après '+done.join(', ')+': '+e.message+'. Vérifie l’état des deux groupes avant de réessayer.','error');}}

// Analyse JSON héritée de la V4 : préserve le format, les validations et le pont Roll20.
function parseList(){
  const raw=$('import-json').value;
  let data;
  try{data=JSON.parse(raw);}catch(err){throw Error('JSON invalide : '+err.message);}
  const rows=Array.isArray(data)?data:data?.items;
  if(!Array.isArray(rows)||!rows.length)throw Error('Attendu : {"items":[...]} non vide.');
  if(rows.length>100)throw Error('Maximum 100 équipements par fichier.');
  if(!catalog||!Array.isArray(catalog.templates)||!Array.isArray(catalog.affixes))throw Error('Catalogue RP non chargé. Recharge la page MJ.');
  const knownIds=new Set(combined().map(i=>i.id)),local=new Set(),items=[],warnings=[];
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
    if(knownIds.has(id))warnings.push('Déjà présent : '+id+' (à examiner)');
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

function previewImport(){try{pending=parseList();importChoices.clear();renderImportPreview();$('run-import').disabled=false;const existing=pending.items.filter(it=>groups().some(g=>!!itemFor(it.id,g))).length;importStatus('✓ '+pending.items.length+' objet(s) valides · '+existing+' référence(s) déjà présente(s) dans au moins un groupe. Choisis les objets et les décisions ci-dessous.','success');}catch(e){pending=null;$('run-import').disabled=true;$('import-preview').replaceChildren();importStatus(e.message,'error');}}
function renderImportPreview(){const root=$('import-preview');root.replaceChildren();if(!pending)return;for(const it of pending.items){const card=A.elem('details',{className:'mj-import-card'});const summary=A.elem('summary');const cb=A.elem('input',{type:'checkbox',checked:true});cb.addEventListener('click',e=>e.stopPropagation());cb.setAttribute('aria-label','Importer '+it.name);cb.dataset.importItem=it.id;const name=A.elem('strong',{text:it.name});const label=A.elem('span',{className:'pill',text:it.category+' · '+it.rarity});summary.append(cb,name,label);card.append(summary);
 const details=A.elem('div',{className:'mj-import-detail'});details.append(A.elem('p',{className:'muted tiny',text:'ID : '+it.id+' · Qualité +'+it.quality+' · Prix JSON : '+A.formatPC(it.pricePC)}));details.append(A.elem('p',{className:'muted tiny',text:'Affixes : '+(it.affixes.map(a=>a.name).join(', ')||'aucun')}));details.append(A.elem('p',{text:'Effets : '+(it.affixes.map(a=>a.effect).join(' · ')||'aucun')}));details.append(A.elem('p',{className:'muted tiny',text:'Description : '+(it.description||'Aucune')}));
 const scope=A.elem('div',{className:'mj-import-target'});for(const g of groups()){const present=itemFor(it.id,g);const row=A.elem('div');row.append(A.elem('label',{text:names[g]+' — '+(present?'Déjà présent':'Nouveau')}));const sel=A.elem('select');sel.dataset.group=g;sel.dataset.importChoice=it.id;sel.append(A.elem('option',{value:present?'ignore':'add',text:present?'Ignorer (conserver)':'Ajouter au groupe'}));if(present)sel.append(A.elem('option',{value:'replace',text:'Remplacer la fiche (conserver stock et prix)'}));sel.value=importChoices.get(k(it.id,g))||(present?'ignore':'add');sel.addEventListener('change',()=>importChoices.set(k(it.id,g),sel.value));row.append(sel);scope.append(row);}details.append(scope);card.append(details);root.append(card);}}
async function performImport(){if(!pending||busy)return;const selected=new Set([...document.querySelectorAll('[data-import-item]')].filter(el=>el.checked).map(el=>el.dataset.importItem));if(!selected.size)return importStatus('Sélectionne au moins un objet.','error');const todo=[];for(const it of pending.items)if(selected.has(it.id))for(const g of groups()){const old=itemFor(it.id,g);const decision=importChoices.get(k(it.id,g))||(old?'ignore':'add');if(decision!=='ignore')todo.push({item:it,group:g,old});}if(!todo.length)return importStatus('Aucun objet à ajouter ou remplacer avec les décisions actuelles.','error');if(!confirm('Importer '+todo.length+' fiche(s) dans les groupes sélectionnés ? Les stocks et prix des doublons seront conservés.'))return;busy=true;$('run-import').disabled=true;let done=0;try{
 for(const {item,group:g,old} of todo){const it={...item};if(old){it.pricePC=old.pricePC;it.visible=old.visible;it.cofSpec={...it.cofSpec,price:String(it.pricePC)+' pc'};}await A.saveCustom(g,it,{replace:true});if(!old){await A.setBaseOverride(g,it.id,{visible:it.visible,pricePC:it.pricePC},{replace:true});if(it.stock!==null)await A.setStock(g,it.id,it.stock);}done++;importStatus('Import '+done+'/'+todo.length+' — '+it.name+' dans '+names[g]+'…');}
 busy=false;await loadAll();importStatus('✓ '+done+' fiche(s) importée(s). Les stocks et prix des doublons ont été conservés.','success');
 }catch(e){busy=false;$('run-import').disabled=false;importStatus('Import interrompu après '+done+' opération(s) : '+e.message+'. Les opérations précédentes peuvent avoir été appliquées. Recharge et vérifie avant de relancer.','error');}}
// Une sauvegarde ne contient jamais les achats ni les commandes Roll20 des joueurs.
function validateBackup(data){if(!data||data.format!=='alaric-v5-backup'||data.version!==1||!data.groups||typeof data.groups!=='object')throw Error('Ce fichier n’est pas une sauvegarde Alaric V5 valide.');const clean={};for(const g of GROUPS){const obj=data.groups[g];if(!obj||!Array.isArray(obj.customItems)||!Array.isArray(obj.stocks)||!Array.isArray(obj.baseOverrides))throw Error('Données absentes pour '+names[g]);for(const [cat,max] of [['customItems',400],['stocks',500],['baseOverrides',500]])if(obj[cat].length>max)throw Error('Trop de documents dans '+names[g]+' / '+cat);
 const seen={};for(const cat of ['customItems','stocks','baseOverrides']){seen[cat]=new Set();for(const doc of obj[cat]){if(!doc||typeof doc!=='object'||typeof doc.id!=='string'||!doc.id||doc.id!==A.normalizeId(doc.id)||seen[cat].has(doc.id))throw Error('Identifiant invalide ou dupliqué dans '+g+'/'+cat);seen[cat].add(doc.id);
 if(cat==='stocks'&&(!Number.isSafeInteger(doc.stock)||doc.stock<0||doc.stock>1000000))throw Error('Stock invalide : '+doc.id);
 if(cat==='baseOverrides'&&(typeof doc.visible!=='boolean'||(doc.pricePC!==undefined&&(!Number.isSafeInteger(doc.pricePC)||doc.pricePC<0))))throw Error('Visibilité/prix invalide : '+doc.id);
 if(cat==='customItems'&&(typeof doc.name!=='string'||!doc.name||doc.name.length>140||typeof doc.category!=='string'||!Number.isInteger(doc.quality)||doc.quality<0||doc.quality>5||(doc.pricePC!==null&&(!Number.isSafeInteger(doc.pricePC)||doc.pricePC<0))))throw Error('Objet personnalisé invalide : '+doc.id);
 }}clean[g]=obj;}return clean;}
async function exportBackup(){try{const result={format:'alaric-v5-backup',version:1,createdAt:new Date().toISOString(),groups:{}};for(const g of GROUPS){const group={};for(const cat of ['customItems','stocks','baseOverrides']){const snap=await A.db.collection('groups').doc(g).collection(cat).get();group[cat]=snap.docs.map(d=>{const data=d.data();delete data.updatedAt;delete data.lastOrderId;return {id:d.id,...data};});}result.groups[g]=group;}
 const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='alaric-v5-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);backupStatus('✓ Sauvegarde des deux groupes téléchargée. Conserve le fichier dans un endroit sûr.','success');}catch(e){backupStatus('Export impossible : '+e.message,'error');}}
async function previewBackup(){backupPending=null;$('backup-restore').disabled=true;try{const file=$('backup-file').files?.[0];if(!file)throw Error('Sélectionne un fichier JSON de sauvegarde.');if(file.size>8*1024*1024)throw Error('Fichier trop volumineux (maximum 8 Mo).');const data=JSON.parse(await file.text());const valid=validateBackup(data);backupPending={data,valid};const text=GROUPS.map(g=>names[g]+': '+valid[g].customItems.length+' objets MJ, '+valid[g].stocks.length+' stocks limités, '+valid[g].baseOverrides.length+' réglages').join('\n');backupStatus('Sauvegarde du '+(data.createdAt||'date inconnue')+'\n'+text+'\n\nUne restauration remplace intégralement ces trois collections des DEUX groupes. Les commandes enregistrées ne sont pas modifiées.','success');$('backup-restore').disabled=false;}catch(e){backupStatus('Sauvegarde invalide : '+e.message,'error');}}
async function restoreBackup(){if(!backupPending||busy)return;if(!confirm('ATTENTION : restaurer les deux boutiques à l’état de ce fichier, y compris les suppressions de créations/stock ?'))return;if(!confirm('DERNIÈRE CONFIRMATION — Une restauration modifie les stocks. Assure-toi qu’aucun joueur n’achète pendant l’opération. Continuer ?'))return;busy=true;$('backup-restore').disabled=true;let done=[];try{const valid=backupPending.valid;for(const g of GROUPS){const current={};for(const cat of ['customItems','stocks','baseOverrides']){const snap=await A.db.collection('groups').doc(g).collection(cat).get();current[cat]=new Set(snap.docs.map(d=>d.id));}
 for(const doc of valid[g].customItems){await A.saveCustom(g,doc,{replace:true});current.customItems.delete(doc.id);}
 for(const doc of valid[g].baseOverrides){await A.setBaseOverride(g,doc.id,{visible:doc.visible,pricePC:doc.pricePC},{replace:true});current.baseOverrides.delete(doc.id);}
 for(const doc of valid[g].stocks){await A.setStock(g,doc.id,doc.stock);current.stocks.delete(doc.id);}
 // Suppression des seuls documents absents du fichier de sauvegarde.
 for(const cat of ['customItems','stocks','baseOverrides'])for(const id of current[cat])await A.db.collection('groups').doc(g).collection(cat).doc(id).delete();done.push(g);}
 busy=false;backupPending=null;await loadAll();backupStatus('✓ Restauration terminée pour les deux groupes ; livre des prix recalculé.','success');
 }catch(e){busy=false;$('backup-restore').disabled=false;backupStatus('Restauration interrompue après '+done.join(', ')+': '+e.message+'. Les groupes peuvent être partiellement modifiés ; recharge et contrôle les stocks.','error');}}
// Événements d’interface
for(const b of document.querySelectorAll('[data-tab]'))b.addEventListener('click',()=>tab(b.dataset.tab));for(const b of document.querySelectorAll('[data-go]'))b.addEventListener('click',()=>tab(b.dataset.go));
$('active-group').addEventListener('change',()=>{if(edits.size&&!confirm('Les modifications non enregistrées resteront en mémoire. Changer de groupe ?'))return;renderTable();renderEditor();if(pending)renderImportPreview();});
$('reload').addEventListener('click',()=>{if(edits.size&&!confirm('Annuler les modifications non enregistrées ?'))return;loadAll();});
$('stock-search').addEventListener('input',renderTable);$('stock-category').addEventListener('change',renderTable);$('stock-rarity').addEventListener('change',renderTable);$('stock-presence').addEventListener('change',renderTable);
$('select-all').addEventListener('change',e=>{for(const x of rowsFiltered()){if(e.target.checked)selectedRows.add(x.id);else selectedRows.delete(x.id);}renderTable();});
$('bulk-stock').addEventListener('click',applyBulkStock);$('bulk-show').addEventListener('click',()=>bulkVisibility(true));$('bulk-hide').addEventListener('click',()=>bulkVisibility(false));$('bulk-delete').addEventListener('click',bulkDelete);
$('save-changes').addEventListener('click',saveChanges);$('cancel-changes').addEventListener('click',()=>{edits.clear();renderTable();});
$('template').addEventListener('change',()=>{chosenAffixes.clear();$('affix-search').value='';renderAffixes();renderEditor();});$('object-quality').addEventListener('change',renderEditor);$('affix-search').addEventListener('input',renderAffixes);
$('editor-copy').addEventListener('click',()=>{$('editor-stock1').value=$('editor-common').value;$('editor-stock2').value=$('editor-common').value;});$('create-object').addEventListener('click',createObject);
$('import-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{$('import-json').value=await file.text();previewImport();}catch(err){importStatus(err.message,'error');}});
$('import-json').addEventListener('input',()=>{pending=null;importChoices.clear();$('run-import').disabled=true;$('import-preview').replaceChildren();});$('preview-import').addEventListener('click',previewImport);$('run-import').addEventListener('click',performImport);
$('backup-export').addEventListener('click',exportBackup);$('backup-preview').addEventListener('click',previewBackup);$('backup-restore').addEventListener('click',restoreBackup);
$('publish-pricebook').addEventListener('click',async()=>{try{const errors=await syncPricebooks();status(errors.length?'Publication incomplète : '+errors.join(' · '):'Livres des prix actualisés pour les deux groupes.',errors.length?'error':'success');}catch(e){status(e.message,'error');}});
$('login-form').addEventListener('submit',async e=>{e.preventDefault();$('login-message').textContent='Connexion…';try{await A.auth.signInWithEmailAndPassword($('email').value.trim(),$('password').value);$('password').value='';}catch(err){$('login-message').textContent='Erreur : '+err.message;}});
$('logout').addEventListener('click',()=>A.auth.signOut());
A.auth.onAuthStateChanged(user=>{const yes=!!user;$('auth-box').classList.toggle('hidden',yes);$('dashboard').classList.toggle('hidden',!yes);$('connected-as').textContent=user?(user.email||user.uid):'';
$('firebase-project-id').textContent=String(A.cfg?.firebase?.projectId||'Non renseigné');
$('firebase-mj-uid').textContent=user?.uid||'Non connecté';
if(yes)loadAll();else {edits.clear();selectedRows.clear();}});
}());
