# Kyro 🎬

A pixel-perfect Netflix UI clone powered by **TMDB** for content data and **VidKing** for streaming.

## Features

- Netflix-identical UI — navbar, hero billboard, card rows, hover panels, detail modal
- Live TMDB data — trending, popular movies/TV, top rated, genres
- VidKing embedded player — movies and full TV show season/episode navigation
- Real-time search across movies and TV shows
- Watch progress saved to localStorage via VidKing postMessage events
- Rotating hero billboard every 12 seconds
- Fully responsive (desktop, tablet, mobile)

## File Structure

```
kyro/
├── index.html
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── navbar.css
│   ├── hero.css
│   ├── rows.css
│   ├── modal.css
│   ├── search.css
│   └── loading.css
├── js/
│   ├── config.js    ← API keys & VidKing config
│   ├── api.js       ← TMDB API wrapper
│   ├── ui.js        ← Card & row builders
│   ├── player.js    ← VidKing player mount/unmount
│   ├── search.js    ← Search functionality
│   ├── modal.js     ← Detail modal + episodes
│   ├── preview.js   ← Hover preview positioning
│   └── app.js       ← Main entrypoint
└── assets/
    └── favicon.svg
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Visit `https://yourusername.github.io/kyro`

## Tech

- Vanilla HTML/CSS/JS — zero dependencies
- [TMDB API](https://www.themoviedb.org/documentation/api)
- [VidKing](https://www.vidking.net) embed player
