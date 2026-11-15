# AlaricCode V6.1 — Corriger « Missing or insufficient permissions »

Ce message ne concerne **ni Roll20 ni les prix du classeur Excel**. Les données des groupes se chargent, mais Firestore refuse au compte connecté l’accès nécessaire au document `groups/groupe1/storefront/priceBook` (et à celui du Groupe 2), qui sécurise le prix des commandes.

## Procédure (sans npm, sans Cloud Functions, sans Blaze)

1. Dans **`mj.html`**, connecte-toi avec ton **compte MJ** (e-mail/mot de passe Firebase). Ouvre l’onglet **Configuration**.
2. Copie les deux valeurs qui s’y affichent : **Projet Firebase** et **UID MJ connecté** (ne copie pas ton mot de passe).
3. Ouvre [Firebase Console](https://console.firebase.google.com/), sélectionne **le même projet**. Dans **Authentication > Utilisateurs**, vérifie que l’UID correspond au compte MJ.
4. Dans **Firestore Database > Règles**, **sauvegarde d’abord** le texte actuellement publié. Vérifie que les règles de la V6, notamment les chemins `/groups/{groupId}/storefront/{bookId}`, sont bien présents. Le fichier `firestore.rules` de ce ZIP est un modèle complet : il ne contient **pas** ton UID réel. Il ne faut pas le publier sans adaptation.
5. Dans la fonction `isMJ()`, remplace exclusivement la chaîne `REMPLACE_PAR_TON_UID_MJ` par **ton UID MJ**. Exemple de la condition attendue :

   ```javascript
   function isMJ() {
     return request.auth != null && request.auth.uid == 'TON_UID_MJ_ICI';
   }
   ```

   Si tu as déjà des règles personnalisées, **fusionne** les conditions nécessaires avec précaution au lieu d’écraser tes règles en production. Ne donne jamais la permission de publier les livres de prix à tous les joueurs ou à tous les comptes authentifiés.
6. Clique sur **Publier** dans Firebase Console. La modification du fichier local ne suffit pas : **les règles en ligne doivent être publiées**.
7. Recharge `mj.html`, reconnecte-toi si nécessaire, puis clique sur **Actualiser les prix des deux groupes**. Tu dois voir un message de succès.
8. Seulement après cette étape, fais un achat de test en Groupe 1 puis Groupe 2 et vérifie les stocks.

### Si l’erreur persiste

- **Projet Firebase différent** : compare l’ID affiché dans MJ avec la console ; vérifie `config.js`.
- **UID incorrect** : l’UID du compte actuellement connecté doit correspondre exactement à celui de `isMJ()` ; l’adresse e-mail seule ne suffit pas.
- **Règles anciennes** : le chemin `storefront/priceBook` n’existe peut-être pas dans les règles publiées. Les anciennes règles V4/V5 ne suffisent pas forcément.
- **Règles non publiées** : vérifie la date de publication dans l’onglet Règles.

La V6.1 **ne modifie pas automatiquement tes règles Firebase en ligne** et **n’efface aucun stock**. La synchronisation des prix nécessite toujours un compte MJ autorisé.
