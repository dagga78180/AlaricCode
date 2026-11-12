# Correctif icônes V4.2 — R = Q + Pmax

Ce correctif s’applique **par-dessus une V4 déjà installée** : copie tous ses fichiers à la racine de `AlaricCode` en conservant leur arborescence. Les modifications remplacent `shared.js`, `js/app.js` et `mj.js`, ajoutent 572 SVG dans `assets/icons/alaric-nouvelles/` et mettent à jour le README. **Ne supprime pas** les 52 SVG originaux ni les 1 530 PNG V2 déjà présents.

- R00…R10 sont obtenus par `R = min(10, Q + Pmax)`.
- Q est la qualité de l’objet (Q0 à Q5).
- Pmax est la puissance maximale des affixes (P0 à P5), jamais leur somme.
- Les dessins SVG conservent leur teinte élémentaire ; leur bordure et leur couleur secondaire correspondent à la palette de rareté V2.
- Les nouveaux objets créés par le MJ et les objets importés héritent de cette règle.
- Aucun changement dans Firebase, dans le catalogue ou dans les prix.

Pour une installation entièrement neuve, utilise plutôt `AlaricCode-V4-2-icones-PQ-complet.zip`.
