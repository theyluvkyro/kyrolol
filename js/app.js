// ─── APP ──────────────────────────────────────────────────────────
let _heroItems = [];
let _heroIndex = 0;
let _heroTimer = null;

async function init() {
  populateGenres();
  await loadHome();
}

async function loadHome() {
  try {
    // Kick off all requests in parallel
    const [
      trending,
      popularMovies,
      popularTV,
      topMovies,
      topTV,
      nowPlaying,
      originals,
      action,
      comedy,
      horror,
      scifi,
      romance,
      documentary,
    ] = await Promise.allSettled([
      API.trending('week'),
      API.popularMovies(),
      API.popularTV(),
      API.topRatedMovies(),
      API.topRatedTV(),
      API.newOnKyro(),
      API.netflixOriginals(),
      API.genre(28, 'movie'),
      API.genre(35, 'movie'),
      API.genre(27, 'movie'),
      API.genre(878, 'movie'),
      API.genre(10749, 'movie'),
      API.genre(99, 'movie'),
    ]);

    const get = (r) => r.status === 'fulfilled' ? (r.value.results || []) : [];

    // ── Hero
    const heroPool = get(trending)
      .filter(i => i.backdrop_path && (i.title || i.name));
    _heroItems = heroPool.slice(0, 10);
    if (_heroItems.length) {
      _heroIndex = Math.floor(Math.random() * Math.min(5, _heroItems.length));
      renderHero(_heroItems[_heroIndex]);
      // Cycle hero every 12s
      _heroTimer = setInterval(() => {
        _heroIndex = (_heroIndex + 1) % _heroItems.length;
        renderHero(_heroItems[_heroIndex]);
      }, 12000);
    }

    // ── Rows
    const container = document.getElementById('rowsContainer');
    container.innerHTML = '';

    const rowDefs = [
      { title: 'Trending Now',             items: get(trending),      type: null       },
      { title: 'Popular on Kyro',          items: get(popularMovies), type: 'movie'    },
      { title: 'Top TV Shows',             items: get(popularTV),     type: 'tv'       },
      { title: 'New Releases',             items: get(nowPlaying),    type: 'movie'    },
      { title: 'Top Rated Movies',         items: get(topMovies),     type: 'movie'    },
      { title: 'Top Rated TV',             items: get(topTV),         type: 'tv'       },
      { title: 'Action & Adventure',       items: get(action),        type: 'movie'    },
      { title: 'Laugh Out Loud Comedies',  items: get(comedy),        type: 'movie'    },
      { title: 'Bone-Chilling Horror',     items: get(horror),        type: 'movie'    },
      { title: 'Sci-Fi & Fantasy',         items: get(scifi),         type: 'movie'    },
      { title: 'Romantic Movies',          items: get(romance),       type: 'movie'    },
      { title: 'Documentaries',            items: get(documentary),   type: 'movie'    },
    ];

    rowDefs.forEach(({ title, items, type }) => {
      const row = buildRow(title, items, type);
      if (row) container.appendChild(row);
    });

  } catch (err) {
    console.error('Load error:', err);
  }
}

// ── Hero rendering
function renderHero(item) {
  const type   = itemType(item);
  const title  = itemTitle(item);
  const year   = itemYear(item);
  const rating = matchPercent(item.vote_average);
  const seasons = item.number_of_seasons;

  // Backdrop
  const bg = document.getElementById('heroBg');
  const newBg = backdropUrl(item.backdrop_path);
  if (newBg) bg.style.backgroundImage = `url(${newBg})`;

  // Title (prefer logo image from TMDB if available)
  const logoDiv = document.getElementById('heroLogoImg');
  const titleDiv = document.getElementById('heroTitle');
  logoDiv.innerHTML = '';
  titleDiv.textContent = title;

  // Info row
  let infoHtml = '';
  if (rating) infoHtml += `<span class="hero__match">${rating}% Match</span>`;
  if (year)   infoHtml += `<span class="hero__dot"></span><span class="hero__year">${year}</span>`;
  if (seasons) infoHtml += `<span class="hero__dot"></span><span class="hero__seasons">${seasons} Season${seasons>1?'s':''}</span>`;
  document.getElementById('heroInfoRow').innerHTML = infoHtml;

  // Description
  document.getElementById('heroDesc').textContent = item.overview || '';

  // Buttons
  document.getElementById('heroBtnPlay').onclick = () => openModal(item.id, type, true);
  document.getElementById('heroBtnInfo').onclick = () => openModal(item.id, type, false);

  // Maturity
  const mat = document.getElementById('heroMaturity');
  if (item.adult) {
    mat.innerHTML = `<div class="hero__maturity-badge">18+</div>`;
  } else {
    mat.innerHTML = `<div class="hero__maturity-badge">PG-13</div>`;
  }
}

// ── Filter section (from nav links)
function filterSection(section) {
  goHome();
  // Could add filtered view here
}

// ── Genre filter
function filterGenre(id, name) {
  // Could add genre filter view
}

// ── Start
init();
