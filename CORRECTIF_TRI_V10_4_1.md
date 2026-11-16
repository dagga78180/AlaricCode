# Correctif V10.4.1 — Sélection d’Alaric

**Portée : tri du catalogue joueur uniquement.** Toutes les références ajoutées hors catalogue de base (y compris les créations MJ) passent avant celles du catalogue de base lorsque « Sélection d’Alaric puis catégorie » est sélectionné.

Ordre dans chacun des deux ensembles : **Armes → Armures → Accessoires → Consommables → Munitions → Matériel**. Les autres tris restent inchangés.

Déploiement : remplacer les fichiers `js/app.js`, `groupe1.html` et `groupe2.html` sur GitHub Pages (ou publier le dossier complet). La version du script dans les pages a été augmentée pour éviter le cache navigateur. **Aucune modification des règles Firestore n’est nécessaire pour ce correctif.** Les règles et autres fichiers sont inclus inchangés par rapport à V10.4 ; ne pas remplacer des règles Firebase personnalisées par erreur.
