# AlaricCode — Correctif icônes Catalogue V2 (13 novembre 2026)

**IMPORTANT :** ce paquet est une mise à jour de l'installation **Alaric Export Roll20 prêt session**. Les **74 silhouettes SVG** fournies dans `Icone.zip` sont réutilisées pour les **75 objets V2** (Plomb de fronde partage la silhouette de la Sacoche à plombs). La correspondance se trouve dans `assets/icons/catalogue-v2/index.json`.

- 27 armes et 9 armures/boucliers : 11 rangs R00 à R10 (Q+Pmax).
- 7 accessoires : R00 blanc initial + 5 variantes R01 à R05 (Pmax, Q=0).
- 14 consommables : **un seul SVG physique par objet**, recoloré en mémoire par `data/icones-consommables-v2.json`; P1 blanc, P2 vert, P3 cyan, P4 bleu, P5 violet.
- 4 munitions : R00 à R05, P1 blanc ; 14 matériels : un SVG fixe, sans changement de logique métier.

La palette R00–R10 reprend les couleurs exactes de `Exemple.zip`. L'export `!co-alaric panier` vers Roll20, les prix, Firebase et le catalogue mécanique restent inchangés.

**Déploiement :** copie le contenu du répertoire `Alaric/` à la racine de ton site existant et conserve tes HTML, CSS et paramètres Firebase. Lis `INSTALLATION_ICONES_ALARIC_V2.md` à la racine du ZIP pour les tests.

---

# Alaric — Catalogue V2 / pont Roll20 (session du 13 novembre 2026)

Cette distribution est un **patch de l'application Alaric existante**, et non un site HTML autonome. Elle préserve les ressources SVG et ne contient ni les pages HTML, ni la configuration Firebase, ni les règles Firestore.

Installe les fichiers de ce dossier à la racine de ton site Alaric actuel, **en conservant toutes les autres ressources**. Les fichiers catalogues sont exclusivement ceux du nouveau Catalogue V2.

Voir `../INSTALLATION_ALARIC_EXPORT_SOIR.md` pour l'ordre d'installation avec Roll20 et la procédure de tests.
