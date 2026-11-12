(function () {
  'use strict';
  const A=window.AlaricV3;
  const p=new URLSearchParams(location.search);
  const group=A.groupId(p.get('groupe'));
  const $=id=>document.getElementById(id);
  const storeKey=`alaric-v3-cart-${group}`;
  let items=[],cart={};
  try{cart=JSON.parse(localStorage.getItem(storeKey)||'{}');if(!cart||typeof cart!=='object'||Array.isArray(cart))cart={};}catch{cart={};}
  $('group-heading').textContent=A.cfg.groups[group]+' · Stock dédié';
  $(`nav-${group==='groupe1'?'g1':'g2'}`).classList.add('active');
  const status=(message,type='')=>{const el=$('status');el.textContent=message;el.className='notice'+(type?' '+type:'');};
  const persist=()=>{try{localStorage.setItem(storeKey,JSON.stringify(cart));}catch{}};
  const money=A.formatPC;
  const stockLabel=n=>n===null||n===undefined?'∞ Illimité':`${n} disponible${n>1?'s':''}`;
  function quantity(item){const raw=Number(cart[item.id]||0);return Number.isSafeInteger(raw)&&raw>0?raw:0;}
  function icon(item){const wrap=A.elem('div',{className:'item-image'});if(item.icon)wrap.append(A.elem('img',{src:item.icon,alt:''}));else wrap.append(A.elem('span',{className:'no-icon',text:'✦'}));return wrap;}
  function add(id,by=1){const item=items.find(o=>o.id===id);if(!item||item.pricePC===null||item.pricePC===undefined)return;const max=item.stock===null?99:item.stock;
    const next=Math.max(0,Math.min(max,quantity(item)+by));if(next)cart[id]=next;else delete cart[id];persist();renderCart();renderProducts();}
  function renderProducts(){const q=$('search').value.trim().toLocaleLowerCase('fr');const cat=$('category').value;const available=$('only-available').checked;
    const list=items.filter(it=>it.visible && (!cat||it.category===cat) && (!available||it.stock===null||it.stock>0) && (!q||`${it.name} ${it.category} ${it.subcategory} ${it.description}`.toLocaleLowerCase('fr').includes(q)));
    $('result-count').textContent=`${list.length} objet${list.length>1?'s':''} affiché${list.length>1?'s':''}`;
    const root=$('products');root.replaceChildren();if(!list.length){root.append(A.elem('div',{className:'empty',text:'Aucun objet à afficher.'}));return;}
    for(const it of list){const card=A.elem('article',{className:'item-card'});card.append(icon(it));const content=A.elem('div',{className:'item-content'});
      content.append(A.elem('div',{className:'category',text:it.category+(it.origin==='Création MJ'?' · Spécial':'' )}),A.elem('h3',{text:it.name}));
      if(it.affixes?.length)content.append(A.elem('div',{className:'tiny muted',text:it.affixes.map(a=>a.name).join(' · ')}));
      content.append(A.elem('p',{className:'desc',text:it.description}),A.elem('strong',{className:'price',text:money(it.pricePC)}));
      const foot=A.elem('div',{className:'card-footer'});foot.append(A.elem('span',{className:'stock'+(it.stock===0?' zero':''),text:stockLabel(it.stock)}));
      const disabled=it.stock===0 || it.pricePC===null || it.pricePC===undefined || quantity(it)>=(it.stock??99);
      foot.append(A.elem('button',{className:'small'+(disabled?' subtle':' primary'),text:quantity(it)?`+ Ajouter (${quantity(it)})`:'+ Panier',disabled,onClick:()=>add(it.id)}));content.append(foot);card.append(content);root.append(card);
    }
  }
  function renderCart(){const list=$('cart');list.replaceChildren();let total=0,valid=0;
    for(const [id,q] of Object.entries(cart)){const item=items.find(x=>x.id===id);if(!item||!item.visible){delete cart[id];continue;}const qty=quantity(item);if(!qty)continue;valid++;if(Number.isSafeInteger(item.pricePC))total+=item.pricePC*qty;
      const li=A.elem('li');const name=A.elem('div');name.append(A.elem('strong',{text:item.name}),A.elem('div',{className:'muted tiny',text:money(item.pricePC)+' × '+qty}));
      const controls=A.elem('div',{className:'cart-controls'});controls.append(A.elem('button',{className:'small',text:'−',onClick:()=>add(id,-1)}),A.elem('strong',{text:String(qty)}),A.elem('button',{className:'small',text:'+',disabled:item.stock!==null&&qty>=item.stock,onClick:()=>add(id,1)}));li.append(name,controls);list.append(li);
    }
    if(!valid)list.append(A.elem('li',{className:'muted',text:'Ton panier est vide.'}));$('total').textContent=money(total);$('copy').disabled=!valid;persist();
  }
  async function copyOrder(){const rows=[];let total=0;
    for(const [id,q] of Object.entries(cart)){const it=items.find(x=>x.id===id);const qty=Number(q);if(!it||qty<=0||!Number.isSafeInteger(it.pricePC))continue;total+=qty*it.pricePC;
      rows.push(`- ${it.name} ×${qty} — ${money(qty*it.pricePC)}${it.affixes?.length?' ['+it.affixes.map(a=>a.name).join(', ')+']':''}`);
    }
    if(!rows.length)return;const name=$('character').value.trim();const text=[`Commande chez Alaric — ${A.cfg.groups[group]}`,name?`Aventurier : ${name}`:'',...rows,`TOTAL : ${money(total)}`,'Commande à valider par le MJ, sous réserve de stock.'].filter(Boolean).join('\n');
    try{await navigator.clipboard.writeText(text);$('copy-status').textContent='✓ Commande copiée ! Envoie-la au MJ.';}catch{
      $('copy-status').replaceChildren(A.elem('div',{text:'La copie automatique est bloquée. Copie le texte ci-dessous :'}),A.elem('textarea',{value:text}));const t=$('copy-status').querySelector('textarea');t.value=text;t.select();}
  }
  for(const id of ['search','category','only-available'])$(id).addEventListener(id==='search'?'input':'change',renderProducts);
  $('copy').addEventListener('click',copyOrder);$('clear').addEventListener('click',()=>{cart={};persist();renderCart();renderProducts();});
  async function reload(){
    try{const [catalog,stocks,custom,overrides]=await Promise.all([A.loadCatalog(),A.getStock(group),A.getCustom(group),A.getOverrides(group)]);
      items=A.overlay(catalog.base,custom,overrides,stocks);
      for(const [id,qty] of Object.entries(cart)){const it=items.find(item=>item.id===id);if(!it||!it.visible){delete cart[id];continue;}if(it.stock!==null&&qty>it.stock){if(it.stock>0)cart[id]=it.stock;else delete cart[id];}}
      const oldCategory=$('category').value;const cats=[...new Set(items.map(i=>i.category))].sort((a,b)=>a.localeCompare(b,'fr'));
      $('category').replaceChildren(A.elem('option',{value:'',text:'Toutes les catégories'}));
      for(const cat of cats)$('category').append(A.elem('option',{value:cat,text:cat}));$('category').value=oldCategory;
      renderProducts();renderCart();status(`${A.cfg.groups[group]} : ${items.filter(i=>i.visible).length} objets accessibles · stocks synchronisés avec Firebase.`, 'success');
      if(catalog.warnings){status('Catalogue incomplet : '+catalog.warnings, 'error');}
    }catch(err){status(`Impossible de charger le catalogue ou les stocks : ${err.message}. Vérifie Firestore Rules et les fichiers JSON.`, 'error');console.error(err);}
  }
  $('refresh').addEventListener('click',reload);reload();setInterval(()=>{if(!document.hidden)reload();},180000);
}());
