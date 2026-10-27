# Batuhan Mermi — Portfolio

Personal portfolio site: data analyst (data governance) and game developer at Triarch Interactive.

Live: https://batuhanmrm.github.io

## Structure

```
index.html        page markup
css/style.css     styles (design tokens at the top)
js/games.js       game catalog: the single source for cards, table and charts
js/main.js        SQL-style filter, modal, analytics charts
assets/           game images
```

## Add a game

Append one object to `js/games.js` and drop its image into `assets/games/`.
The library, table view and analytics charts update automatically.

## Run locally

```bash
python3 -m http.server 8080
```

No build step. Deployed with GitHub Pages from the `main` branch root.

Game images © Triarch Interactive.
