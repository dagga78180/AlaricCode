/* Calculs monétaires purs : prix en PC entiers, jamais de flottants stockés. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.AlaricPriceTools=api;})(typeof window!=='undefined'?window:null,()=>{
'use strict';
function validPercent(p){return Number.isInteger(p)&&p>=1&&p<=90;}
function salePricePC(basePC,pct){if(!Number.isSafeInteger(basePC)||basePC<0||!validPercent(pct))throw Error('Tarif ou remise invalide (1 à 90 %).');return Math.round(basePC*(100-pct)/100);}
function normalizeDiscounts(ids,values){const result={};for(const id of ids||[]){const pct=Number(values?.[id]);if(validPercent(pct))result[id]=pct;}return result;}
return {validPercent,salePricePC,normalizeDiscounts};
});
