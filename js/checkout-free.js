/* AlaricCode V4 Spark — commandes atomiques Firestore sans Cloud Functions.
   Le navigateur construit le récapitulatif ; les Firestore Rules protègent les
   déductions de stock et exigent le livre des prix publié par le MJ. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  if(root)root.AlaricCheckout=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const VALID_GROUPS=new Set(['groupe1','groupe2']);
  const VALID_ID=/^[a-z0-9_-]{1,180}$/;
  const VALID_ORDER_ID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  function validateLines(lines){
    if(!Array.isArray(lines)||!lines.length||lines.length>50)throw Error('Panier : entre 1 et 50 références.');
    const ids=new Set();let qtyTotal=0;
    for(const line of lines){
      if(!line||!VALID_ID.test(line.id||'')||ids.has(line.id)||!Number.isInteger(line.qty)||line.qty<1||line.qty>100||!Number.isSafeInteger(line.pricePC)||line.pricePC<0||line.pricePC>1e11||!line.spec||!line.spec.base)
        throw Error('Une référence Roll20, une quantité ou un prix est invalide.');
      ids.add(line.id);qtyTotal+=line.qty;
    }
    if(qtyTotal>200)throw Error('Maximum 200 exemplaires par commande Roll20.');
    return lines;
  }
  function stable(value){
    if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
    if(value && typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
    return JSON.stringify(value);
  }
  function buildReceipt({uid,group,orderId,lines,stocks}){
    const items=[],checkoutLines={},rollItems=[];let totalPC=0;
    lines.forEach((line,index)=>{
      const before=stocks[index];
      if(before!==null && (!Number.isInteger(before)||before<line.qty))
        throw Error('Stock insuffisant pour '+line.name+'. Aucun achat effectué.');
      const after=before===null?null:before-line.qty;
      const total=line.qty*line.pricePC;
      if(!Number.isSafeInteger(total)||!Number.isSafeInteger(totalPC+total)||totalPC+total>1e13)
        throw Error('Montant total hors limites.');
      totalPC+=total;
      items.push({id:line.id,name:String(line.name).slice(0,140),qty:line.qty,pricePC:line.pricePC,totalPC:total,stockBefore:before,stockAfter:after});
      checkoutLines[line.id]={qty:line.qty,pricePC:line.pricePC,stockBefore:before,stockAfter:after};
      rollItems.push({...JSON.parse(JSON.stringify(line.spec)),qty:line.qty,price:line.pricePC+' pc'});
    });
    const payload={version:2,source:'AlaricCode-COAlaric',items:rollItems};
    const roll20Command='!co-alaric panier --target @{target|PJ|character_id} --data '+encodeURIComponent(JSON.stringify(payload));
    if(roll20Command.length>100000)throw Error('La commande Roll20 est trop longue. Réduis le panier.');
    return {id:orderId,uid,group,status:'confirmed',items,checkoutLines,totalPC,roll20Command};
  }
  async function placeOrder({db,FieldValue,group,orderId,uid,lines}){
    if(!VALID_GROUPS.has(group)||!VALID_ORDER_ID.test(orderId||'')||!uid)throw Error('Session ou groupe de commande invalide.');
    validateLines(lines);
    const root=db.collection('groups').doc(group);
    const orderRef=root.collection('orders').doc(orderId);
    const priceRef=root.collection('storefront').doc('priceBook');
    return db.runTransaction(async tx=>{
      // Lire AVANT d'écrire, pour permettre les reprises après perte de connexion.
      const previous=await tx.get(orderRef);
      if(previous.exists){
        const existing=previous.data();
        if(existing.uid!==uid)throw Error('Cette commande appartient à une autre session.');
        return {id:orderId,...existing};
      }
      const book=await tx.get(priceRef);
      if(!book.exists||!book.data()?.prices)
        throw Error('Boutique non initialisée : le MJ doit ouvrir son espace et publier les prix pour ce groupe.');
      const prices=book.data().prices;
      const rows=await Promise.all(lines.map(async line=>{
        const [stock,custom,override]=await Promise.all([
          tx.get(root.collection('stocks').doc(line.id)),
          tx.get(root.collection('customItems').doc(line.id)),
          tx.get(root.collection('baseOverrides').doc(line.id))
        ]);
        const price=prices[line.id];
        if(!Number.isSafeInteger(price)||price!==line.pricePC)
          throw Error('Le prix ou la disponibilité de « '+line.name+' » a changé. Actualise le catalogue, puis vérifie ton panier.');
        if(override.exists){
          const data=override.data();
          if(data.visible===false)throw Error('Cet objet n’est plus en vente : '+line.name);
          if(data.pricePC!==undefined&&data.pricePC!==price)
            throw Error('Le prix de '+line.name+' a été modifié par le MJ. Demande une actualisation des prix.');
        }
        if(custom.exists){
          const data=custom.data();
          if(data.visible===false||data.cofCompatible===false||data.pricePC==null&&!(override.exists&&Number.isInteger(override.data().pricePC)))
            throw Error('Cet objet n’est plus disponible : '+line.name);
          if(!(override.exists&&Number.isInteger(override.data().pricePC))&&data.pricePC!==price)
            throw Error('Le prix de '+line.name+' a changé : demande au MJ de republier les prix.');
          if(stable(data.cofSpec||null)!==stable(line.sourceSpec||null)||data.name!==line.sourceName)
            throw Error('Le MJ a modifié '+line.name+' : actualise le catalogue avant de confirmer.');
        }else if(line.isCustom)throw Error('L’objet « '+line.name+' » a été supprimé. Actualise le catalogue.');
        const before=stock.exists?stock.data()?.stock:null;
        if(before!==null&&(!Number.isInteger(before)||before<0||before<line.qty))
          throw Error('Stock insuffisant pour « '+line.name+' » : achat annulé, aucun stock déduit.');
        return {stockRef:root.collection('stocks').doc(line.id),before};
      }));
      const order=buildReceipt({uid,group,orderId,lines,stocks:rows.map(x=>x.before)});
      // Une seule transaction : toutes les déductions + l'historique, ou aucune.
      // Les règles comparent le stock avec checkoutLines et le prix publié par le MJ.
      for(let i=0;i<rows.length;i++)if(rows[i].before!==null){
        tx.update(rows[i].stockRef,{stock:rows[i].before-lines[i].qty,
          updatedAt:FieldValue.serverTimestamp(),lastOrderId:orderId});
      }
      tx.set(orderRef,{...order,createdAt:FieldValue.serverTimestamp()});
      return order;
    });
  }
  return {validateLines,buildReceipt,placeOrder};
});
