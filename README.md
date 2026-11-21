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
```

Pour ajouter un club adverse par défaut : dépose son logo dans `assets/logos/`
et ajoute une entrée `{"name": "...", "logo": "assets/logos/....webp"}` dans la liste
`opps` au début de `js/app.js`.
