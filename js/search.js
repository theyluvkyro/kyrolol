// ─── SEARCH ───────────────────────────────────────────────────────
let _searchTimer = null;
let _lastQuery   = '';

document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(_searchTimer);
  const q = e.target.value.trim();
  if (!q) {
    if (_lastQuery) goHome();
    return;
  }
  _searchTimer = setTimeout(() => doSearch(q), 380);
});

async function doSearch(q) {
  if (q === _lastQuery) return;
  _lastQuery = q;

  const section = document.getElementById('searchSection');
  const main    = document.getElementById('mainBrowse');
  const grid    = document.getElementById('searchGrid');

  section.classList.add('active');
  main.classList.add('hidden');

  grid.innerHTML = `
    <div class="spinner-wrap" style="grid-column:1/-1">
      <div class="spinner"></div>
    </div>`;

  try {
    const data = await API.searchMulti(q);
    const results = (data.results || [])
      .filter(r =>
        (r.media_type === 'movie' || r.media_type === 'tv') &&
        (r.backdrop_path || r.poster_path) &&
        (r.title || r.name)
      )
      .sort((a, b) => b.popularity - a.popularity);

    if (!results.length) {
      grid.innerHTML = `<div class="search-empty" style="grid-column:1/-1">No results for "<strong>${q}</strong>"</div>`;
      return;
    }

    grid.innerHTML = '';
    results.forEach(item => {
      const type  = item.media_type;
      const title = itemTitle(item);
      const thumb = item.backdrop_path
        ? imgUrl(item.backdrop_path, 'w300')
        : imgUrl(item.poster_path, 'w500');

      const card = document.createElement('div');
      card.className = 'search-grid__card';
      card.innerHTML = `
        <img src="${thumb || PLACEHOLDER(300, 169)}"
             alt="${title.replace(/"/g, '&quot;')}"
             loading="lazy"
             onerror="this.src='${PLACEHOLDER(300, 169)}'" />
        <div class="search-grid__card-label">
          <div class="search-grid__card-type">${type === 'tv' ? 'TV Show' : 'Movie'}</div>
          ${title}
        </div>`;
      card.addEventListener('click', () => openModal(item.id, type));
      grid.appendChild(card);
    });

  } catch (err) {
    grid.innerHTML = `<div class="search-empty" style="grid-column:1/-1">Something went wrong. Try again.</div>`;
  }
}
