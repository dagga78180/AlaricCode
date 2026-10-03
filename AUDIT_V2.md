# Audit V2 — AlaricCode

## Verdict

La V2 est **nettoyée, factorisée et validée statiquement**. La structure sépare données, logique partagée, moteur de prix, boutique et administration ; les chemins locaux, JSON, IDs, références tarifaires et icônes sont contrôlés automatiquement.

## Mesures avant / après

| Indicateur | V5.2 | V2 |
|---|---:|---:|
| Fichiers distribués | 1 977 | 1 553 |
| Taille décompressée | 48 162 020 octets | ~28 031 671 octets |
| Lignes JS | 1 558 | ~1 535 |
| JavaScript partagé dédié | non | `js/core.js` |
| Validateur automatisé | non | oui |

La réduction provient surtout du retrait des SVG sources, archives/aperçus et fichiers de génération inutiles en production. Les PNG/WebP réellement consommés par le site sont conservés.

## Refonte d’architecture

- `data/` contient les deux catalogues et le modèle de prix.
- `js/core.js` centralise `escapeHTML`, normalisation, format de prix, chargement JSON et création du client Supabase.
- `js/pricing.js` est le seul moteur Q/P côté navigateur.
- `js/app.js` et `js/stock.js` sont encapsulés dans leur propre scope et ne polluent plus le global navigateur.
- `js/supabase-config.js` ne contient que la configuration publique.
- `sources/Catalogue_Objets_Magiques_V2.xlsx` remplace l’ancienne source.
- Assets de génération non utilisés retirés.

## Données et prix

- **55 bases** et **569 affixes** dans le modèle de prix.
- Q = **3 / 10 / 30 / 90 / 300 PO**.
- P = **4 / 15 / 50 / 180 / 600 PO**.
- A112 Héliolite est **P2**.
- `data/pricing-model.json` est byte-identique au modèle JSON livré dans Roll20Projet V2.
- Les consommables hors référentiel conservent volontairement leur prix catalogue dédié.

## Sécurité Supabase

- RLS activé sur `stocks`.
- lecture publique `anon/authenticated` ;
- écriture réservée aux utilisateurs authentifiés ;
- aucune `service_role` ou secret key embarquée ;
- la publishable key navigateur est assumée publique ; la sécurité repose sur RLS et la désactivation des inscriptions non souhaitées.

## Contrôles automatisés

```bash
node tools/validate-v2.mjs
```

Le validateur couvre : présence des fichiers, syntaxe JavaScript, JSON, IDs dupliqués, références `cofSpec`, chemins HTML, manifeste/variantes d’icônes et A112/P2. Le projet passe également `node --check` sur tous les fichiers JS.

## Compatibilité

Les IDs catalogue, `cofSpec`, format de commande COAlaric et clés de panier/favoris sont conservés. Aucun changement de stockage navigateur n’est requis.

## Limite de l’audit

Le déploiement GitHub Pages/Supabase réel n’est pas accessible depuis cet environnement. Avant bascule définitive, tester sur le site publié : chargement catalogue, connexion MJ, passage illimité→quantité→0, rafraîchissement client et copie du panier Roll20.
