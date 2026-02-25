// ─── CONFIG ───────────────────────────────────────────────────────
const CONFIG = {
  TMDB_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwN2M2MTg2NDBlOTQ1ZTNiNDIwNGIxMzgyN2ZmZWNmMSIsIm5iZiI6MTc3MTU3MzgzNC41MDU5OTk4LCJzdWIiOiI2OTk4MTI0YTMwYThhZjIwYWRhYjkwMzMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.-u-Iyr8pb8JUEdzjaoP4dLDEhEVWvcwshR0qEhm3qGw',
  TMDB_BASE: 'https://api.themoviedb.org/3',
  IMG_BASE:  'https://image.tmdb.org/t/p/',
  VIDKING:   'https://www.vidking.net',
  VIDKING_COLOR: 'e50914',

  // Image sizes
  THUMB_SIZE:    'w300',
  BACKDROP_SIZE: 'w1280',
  POSTER_SIZE:   'w500',
  ORIGINAL:      'original',
};

const GENRE_MAP = {
  28:    'Action',
  12:    'Adventure',
  16:    'Animation',
  35:    'Comedy',
  80:    'Crime',
  99:    'Documentary',
  18:    'Drama',
  10751: 'Family',
  14:    'Fantasy',
  36:    'History',
  27:    'Horror',
  10402: 'Music',
  9648:  'Mystery',
  10749: 'Romance',
  878:   'Sci-Fi',
  10770: 'TV Movie',
  53:    'Thriller',
  10752: 'War',
  37:    'Western',
};

// Track progress in localStorage
const PROGRESS_KEY = (type, id, s, e) =>
  `kyro_progress_${type}_${id}${s ? `_s${s}e${e}` : ''}`;
