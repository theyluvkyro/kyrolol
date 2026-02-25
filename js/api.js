// ─── API ──────────────────────────────────────────────────────────

// Standalone fetch wrapper — no `this` issues
async function tmdbGet(path) {
  const url = `${CONFIG.TMDB_BASE}${path}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${CONFIG.TMDB_TOKEN}`,
      'accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
}

const API = {
  get: (path) => tmdbGet(path),

  // ── Collections
  trending:         (w = 'week') => tmdbGet(`/trending/all/${w}`),
  popularMovies:    ()            => tmdbGet('/movie/popular'),
  popularTV:        ()            => tmdbGet('/tv/popular'),
  topRatedMovies:   ()            => tmdbGet('/movie/top_rated'),
  topRatedTV:       ()            => tmdbGet('/tv/top_rated'),
  newOnKyro:        ()            => tmdbGet('/movie/now_playing'),
  netflixOriginals: ()            => tmdbGet('/discover/tv?with_networks=213'),
  genre: (id, type = 'movie')    => tmdbGet(`/discover/${type}?with_genres=${id}&sort_by=popularity.desc`),

  // ── Detail
  movieDetail: (id)    => tmdbGet(`/movie/${id}?append_to_response=credits,videos,similar`),
  tvDetail:    (id)    => tmdbGet(`/tv/${id}?append_to_response=credits,videos,similar`),
  season:      (id, s) => tmdbGet(`/tv/${id}/season/${s}`),

  // ── Search
  searchMulti: (q) => tmdbGet(`/search/multi?query=${encodeURIComponent(q)}&page=1`),

  // ── Genres
  genres: () => Promise.all([
    tmdbGet('/genre/movie/list'),
    tmdbGet('/genre/tv/list'),
  ]),
};

// ── Image helpers
const imgUrl = (path, size = CONFIG.THUMB_SIZE) =>
  path ? `${CONFIG.IMG_BASE}${size}${path}` : null;

const backdropUrl = (path) => imgUrl(path, CONFIG.BACKDROP_SIZE);
const posterUrl   = (path) => imgUrl(path, CONFIG.POSTER_SIZE);

// ── Item helpers
const itemTitle = (item) => item.title || item.name || '';
const itemYear  = (item) => ((item.release_date || item.first_air_date || '')).slice(0, 4);
const itemType  = (item) => item.media_type || (item.first_air_date ? 'tv' : 'movie');
const itemRating = (item) => item.vote_average ? Math.round(item.vote_average * 10) : null;
