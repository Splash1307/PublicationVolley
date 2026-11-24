# Studio posts · Les Griffons

Petit site statique pour créer les visuels Instagram du club (résultat ou jour de match),
en format post 4:5 ou story, puis les télécharger en JPG.

## Utilisation

1. Choisis le type de post (**Résultat** ou **Jour de match**) et le format.
2. Sélectionne l'équipe, l'adversaire, la date, puis les sets ou l'heure et le lieu.
3. Ajoute éventuellement une photo du match (sinon la photo par défaut de l'équipe est utilisée).
4. Clique sur **Télécharger l'image** (ou appui long sur l'aperçu depuis un téléphone).

Les **Réglages du club** (équipes, photos par défaut, clubs adverses et leurs logos,
logo du club, salle à domicile) sont enregistrés dans le navigateur
(`localStorage` et IndexedDB). Ils ne sont pas partagés entre appareils.

## Résultats FFVB automatiques

Le bouton **« Choisir un match terminé »** ouvre la liste des matchs terminés des équipes
d'Aizenay. Toucher un match remplit l'équipe, l'adversaire (avec son logo), la date et les sets.

- Source : l'export « Calendrier complet du club » du site de la FFVB (Gestion Sportive),
  club n° `0856001`. Pas d'API officielle : une seule requête publique, sans compte.
- `scripts/resultats.mjs` télécharge cet export, garde les matchs terminés, remet les sets
  du point de vue d'Aizenay et écrit `data/resultats.json`.
- Le workflow GitHub Pages lance ce script à chaque déploiement : toutes les heures le
  week-end, 3 fois par jour en semaine (et à chaque push). Si la FFVB ne répond pas, le
  dernier fichier publié est conservé.
- Correspondance compétition → équipe du studio : fonction `teamFor` du script. Les logos
  adverses sont retrouvés par nom puis par numéro de club FFVB (champ `ffvb` dans `js/app.js`).

Lancer le script à la main : `node scripts/resultats.mjs`.

## Lancer en local

Le visuel est dessiné dans un `<canvas>` : le site doit être servi par un serveur web
(ouvrir `index.html` en double-cliquant bloque l'export de l'image).

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Mise en ligne (GitHub Pages)

Le workflow `.github/workflows/pages.yml` publie le site à chaque push sur `main`.
Dans le dépôt GitHub : **Settings › Pages › Source : GitHub Actions**.

## Structure

```
index.html            page et formulaire
css/style.css         styles de l'interface
js/app.js             rendu du visuel (canvas), formulaire, stockage
assets/logos/         logo des Griffons et des clubs adverses (WebP)
scripts/resultats.mjs récupération des résultats FFVB
data/resultats.json   résultats générés (ne pas modifier à la main)
```

Pour ajouter un club adverse par défaut : dépose son logo dans `assets/logos/`
et ajoute une entrée `{"name": "...", "logo": "assets/logos/....webp"}` dans la liste
`opps` au début de `js/app.js`.
