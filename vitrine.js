(function () {
  'use strict';
  const A=window.AlaricApp, $=id=>document.getElementById(id);
  const group=A.groupId(new URLSearchParams(location.search).get('groupe'));
  const money=A.formatPC, storeKey=`alaric-cart-${group}`;
  let items=[],cart={};
  try {const stored=JSON.parse(localStorage.getItem(storeKey)||'{}');if(stored&&!Array.isArray(stored)&&typeof stored==='object')cart=stored;}catch{}
  $('group-heading').textContent=`Vitrine · ${A.cfg.groups[group]}`;
  $(group==='groupe1'?'nav-g1':'nav-g2').classList.add('is-active');
  const save=()=>{try{localStorage.setItem(storeKey,JSON.stringify(cart));}catch{}};
  const qty=it=>Math.max(0,Number(cart[it.id])||0);
  const stockLabel=n=>n===null?'Stock illimité':n===0?'Épuisé':`Stock : ${n}`;
  const notify=message=>{$('toast').textContent=message;$('toast').classList.add('is-visible');setTimeout(()=>$('toast').classList.remove('is-visible'),2200);};
  const status=(message,error=false)=>{$('status').textContent=message;$('status').classList.toggle('error',error);};
  const nrm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
  function icon(it){
    const img=A.elem('img',{className:'item-icon',alt:'',src:it.icon||A.fallbackIcon(it)});
    img.loading='lazy';img.decoding='async';
    img.addEventListener('error',()=>{const safe=A.fallbackIcon(it);if(img.getAttribute('src')!==safe)img.src=safe;});
    return img;
  }
  function add(id,change){
    const it=items.find(x=>x.id===id);if(!it||!Number.isSafeInteger(it.pricePC))return;
    const max=it.stock===null?99:it.stock;
    const next=Math.min(max,Math.max(0,qty(it)+change));
    if(next)cart[id]=next;else delete cart[id];save();renderCart();renderItems();
  }
  function selection(){
    const category=$('category-filters').dataset.selected||'all',rarity=$('rarity-filter').value,sort=$('sort-filter').value,q=nrm($('search').value.trim());
    const found=items.filter(it=>it.visible&&(category==='all'||it.category===category)&&(rarity==='all'||it.rarity===rarity)&&(!$('only-available').checked||it.stock===null||it.stock>0)&&(!q||nrm([it.name,it.description,it.category,it.subcategory,it.rarity,(it.affixes||[]).map(a=>a.name).join(' ')].join(' ')).includes(q)));
    found.sort((a,b)=>sort==='price-asc'?(a.pricePC??Infinity)-(b.pricePC??Infinity):sort==='price-desc'?(b.pricePC??-1)-(a.pricePC??-1):sort==='category-asc'?(a.category+' '+a.name).localeCompare(b.category+' '+b.name,'fr'):a.name.localeCompare(b.name,'fr'));
    return found;
  }
  function filters(){
    const root=$('category-filters'),current=root.dataset.selected||'all';root.replaceChildren();
    const cats=['all',...new Set(items.filter(i=>i.visible).map(i=>i.category))].sort((a,b)=>a==='all'?-1:b==='all'?1:a.localeCompare(b,'fr'));
    root.dataset.selected=cats.includes(current)?current:'all';
    for(const cat of cats){const btn=A.elem('button',{text:cat==='all'?'Tous':cat,className:'category-filter'+(root.dataset.selected===cat?' is-active':'')});btn.type='button';btn.dataset.category=cat;btn.addEventListener('click',()=>{root.dataset.selected=cat;filters();renderItems();});root.append(btn);}
    const r=$('rarity-filter'),keep=r.value;r.replaceChildren(A.elem('option',{value:'all',text:'Toutes'}));
    for(const rarity of [...new Set(items.filter(i=>i.visible).map(i=>i.rarity).filter(Boolean))].sort())r.append(A.elem('option',{value:rarity,text:rarity}));r.value=[...r.options].some(o=>o.value===keep)?keep:'all';
  }
  function renderItems(){
    const found=selection();$('result-count').textContent=`${found.length} objet${found.length>1?'s':''} trouvé${found.length>1?'s':''}`;
    const grid=$('items-grid');grid.replaceChildren();
    if(!found.length){grid.append(A.elem('div',{className:'vitrine-empty',text:'Alaric agite sa lanterne astrale, mais aucun objet ne répond à l’appel.'}));return;}
    for(const it of found){
      const row=A.elem('article',{className:'item-row'}),wrap=A.elem('div',{className:'item-row__icon-wrap'}),body=A.elem('div',{className:'item-row__content'}),buy=A.elem('div',{className:'item-row__buy'});
      wrap.append(icon(it));
      const line=A.elem('div',{className:'item-row__title-line'});line.append(A.elem('h3',{text:it.name}));
      if(qty(it))line.append(A.elem('span',{className:'in-cart',text:`Dans le panier : ${qty(it)}`}));body.append(line);
      const meta=A.elem('div',{className:'meta'});meta.append(A.elem('span',{className:'badge',text:it.category}));
      if(it.subcategory)meta.append(A.elem('span',{className:'badge badge--soft',text:it.subcategory}));
      if(it.rarity)meta.append(A.elem('span',{className:'badge badge--soft',text:it.rarity}));body.append(meta);
      body.append(A.elem('p',{className:'item-desc',text:it.description||'Alaric garde les détails pour les clients sérieux.'}));
      if(it.affixes?.length)body.append(A.elem('p',{className:'item-affixes',text:it.affixes.map(a=>a.name).join(' · ')}));
      buy.append(A.elem('strong',{className:'price',text:money(it.pricePC)}),A.elem('span',{className:'stock-tag'+(it.stock===0?' depleted':''),text:stockLabel(it.stock)}));
      const disabled=it.stock===0||!Number.isSafeInteger(it.pricePC)||qty(it)>=(it.stock??99);
      buy.append(A.elem('button',{className:'button button--primary',text:'Ajouter',disabled,onClick:()=>{add(it.id,1);notify('Ajouté au panier.');}}));
      row.append(A.elem('span',{className:'item-row__sigil',text:'✦'}),wrap,body,buy);grid.append(row);
    }
  }
  function renderCart(){
    const root=$('cart-items');root.replaceChildren();let total=0,count=0,valid=0;
    for(const [id,n] of Object.entries(cart)){
      const it=items.find(x=>x.id===id);if(!it||!it.visible){delete cart[id];continue;}
      if(it.stock!==null&&qty(it)>it.stock){if(it.stock>0)cart[id]=it.stock;else{delete cart[id];continue;}}
      const amount=qty(it);if(!amount)continue;valid++;count+=amount;
      if(Number.isSafeInteger(it.pricePC))total+=it.pricePC*amount;
      const card=A.elem('div',{className:'cart-product'});
      const details=A.elem('div',{className:'cart-product__desc'});details.append(A.elem('strong',{text:it.name}),A.elem('span',{text:`${money(it.pricePC)} / unité`}));
      const ctr=A.elem('div',{className:'cart-product__controls'});ctr.append(A.elem('button',{text:'−',onClick:()=>add(id,-1)}),A.elem('span',{text:String(amount)}),A.elem('button',{text:'+',disabled:it.stock!==null&&amount>=it.stock,onClick:()=>add(id,1)}));
      card.append(details,ctr,A.elem('strong',{className:'cart-product__price',text:money(it.pricePC*amount)}));root.append(card);
    }
    $('cart-empty').hidden=!!valid;$('cart-total').textContent=money(total);$('copy-order').disabled=!valid;$('cart-count').textContent=String(count);save();
  }
  async function copyOrder(){
    const rows=[];let total=0;
    for(const [id,n] of Object.entries(cart)){
      const it=items.find(x=>x.id===id),q=Number(n);
      if(!it||!q||!Number.isSafeInteger(it.pricePC))continue;
      total+=q*it.pricePC;rows.push(`- ${it.name} ×${q} — ${money(it.pricePC*q)}`);
    }
    if(!rows.length)return;
    const name=$('character').value.trim();const message=[`Commande chez Alaric — ${A.cfg.groups[group]}`,name?`Aventurier : ${name}`:'',...rows,'',`Total : ${money(total)}`,'Sous réserve de validation des stocks par le MJ.'].filter((x,i)=>x||i===rows.length+2).join('\n');
    try{await navigator.clipboard.writeText(message);notify('Commande copiée !');}catch{
      const tmp=document.createElement('textarea');tmp.value=message;document.body.append(tmp);tmp.select();document.execCommand('copy');tmp.remove();notify('Commande copiée.');
    }
  }
  async function reload(){
    try{
      const [catalog,stocks,custom,overrides]=await Promise.all([A.loadCatalog(),A.getStock(group),A.getCustom(group),A.getOverrides(group)]);
      items=A.overlay(catalog.base,custom,overrides,stocks);
      // Évite de mettre une ancienne quantité épuisée dans le panier.
      filters();renderItems();renderCart();
      status(`${A.cfg.groups[group]} · ${items.filter(i=>i.visible).length} objets affichables · Stocks synchronisés`);
      if(catalog.warnings)status(catalog.warnings,true);
    }catch(e){status('Impossible de charger le catalogue ou les stocks. '+e.message,true);console.error(e);}
  }
  $('search').addEventListener('input',renderItems);$('rarity-filter').addEventListener('change',renderItems);$('sort-filter').addEventListener('change',renderItems);$('only-available').addEventListener('change',renderItems);
  $('refresh').addEventListener('click',reload);$('copy-order').addEventListener('click',copyOrder);
  $('clear-cart').addEventListener('click',()=>{cart={};save();renderCart();renderItems();notify('Panier vidé.');});
  $('open-cart-mobile').addEventListener('click',()=>$('cart-panel').classList.add('is-open'));
  $('close-cart-mobile').addEventListener('click',()=>$('cart-panel').classList.remove('is-open'));
  reload();setInterval(()=>{if(!document.hidden)reload();},180000);
}());
