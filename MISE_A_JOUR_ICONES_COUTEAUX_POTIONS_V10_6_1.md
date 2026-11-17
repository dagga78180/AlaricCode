# AlaricCode V10.6.1 — Couteaux de lancer et potions

## Ce qui a changé
- **DST-06 — Couteau de lancer** : dessin `thrown-knife.svg` fourni, décliné dans les **11 couleurs** de la palette officielle de rareté, R00 à R10. Même dessin dans les PNG historiques utilisés par les anciens chemins.
- **CON-01 — Potion de soins** : dessin `round-potion.svg` fourni, déclinaisons toujours **rouges**. Le cadre conserve la couleur de rareté.
- **CON-02 — Potion de mana** : dessin `round-potion (1).svg` fourni, déclinaisons toujours **bleues**. Le cadre conserve la couleur de rareté.
- **Autres consommables** : colorisation habituelle selon leur palier préservée ; le cadre suit lui aussi la couleur de rareté.
- **Calcul de rareté des armes de jet** `DST-06`, `DST-07`, `DST-08` : étant classées comme munitions (Q0), le palier P1 correspond maintenant à R00, P2 à R01, etc. Seule la couleur de l’icône change, **pas les prix, les dégâts ou les affixes**.
- **Deux boutiques et interface MJ** : tous les affichages utilisant `shared.js` bénéficient du même comportement.

## Déploiement
1. Sauvegarder le site actuellement déployé.
2. Copier le contenu complet de `AlaricCode/` vers l'hébergement du site (GitHub Pages/Firebase Hosting selon la configuration), notamment `shared.js`, `data/icones-consommables-v2.json`, les SVG dans `assets/icons/catalogue-v2/`, les images PNG historiques et les HTML actualisés.
3. Recharger la page avec rafraîchissement forcé si des icônes en cache sont affichées.
4. Tester couteau R00/R01, soins et mana P1/P2/P5 dans les deux vitrines et dans l'éditeur MJ.

Aucun catalogue, prix, stock Firestore ou script Roll20 n'a été modifié. Le déploiement en ligne n'est **pas** réalisé par cette archive.
