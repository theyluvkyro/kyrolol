// ─── MODAL ────────────────────────────────────────────────────────
let _modalState = null;

async function openModal(id, type, autoplay = false) {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Reset
  _modalState = null;
  _resetModal();

  try {
    const data = type === 'movie'
      ? await API.movieDetail(id)
      : await API.tvDetail(id);

    _modalState = { id, type, data, season: 1, episode: 1, autoplay };
    _renderModal(data, type, autoplay);
  } catch (err) {
    console.error('Modal load error:', err);
    const pw = document.getElementById('modalPlayerWrap');
    if (pw) pw.innerHTML = `<div class="modal__player-placeholder"><p style="color:#a3a3a3;font-size:14px">Failed to load content. Please try again.</p></div>`;
    const t = document.getElementById('modalTitle');
    if (t) t.textContent = 'Error loading content';
  }
}

function _resetModal() {
  // Show spinner in backdrop area
  document.getElementById('modalBackdrop').style.backgroundImage = '';
  document.getElementById('modalTitle').textContent = '';
  document.getElementById('modalMeta').innerHTML = '';
  document.getElementById('modalDesc').textContent = '';
  document.getElementById('modalCast').innerHTML = '';
  document.getElementById('modalGenres').innerHTML = '';
  document.getElementById('modalPlayerWrap').innerHTML =
    `<div class="modal__player-placeholder">
       <div class="modal__play-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
       <span>Loading…</span>
     </div>`;
  document.getElementById('modalEpisodesSection').style.display = 'none';
  document.getElementById('modalMoreGrid').innerHTML = '';
}

function _renderModal(data, type, autoplay) {
  const title   = itemTitle(data);
  const year    = itemYear(data);
  const rating  = matchPercent(data.vote_average);
  const seasons = data.number_of_seasons;
  const runtime = data.runtime ? `${data.runtime}m` : null;
  const genres  = (data.genres || []).map(g => g.name);
  const cast    = (data.credits?.cast || []).slice(0, 5).map(c => c.name);
  const director= (data.credits?.crew || []).filter(c => c.job === 'Director').slice(0,2).map(c=>c.name);

  // Backdrop
  if (data.backdrop_path) {
    document.getElementById('modalBackdrop').style.backgroundImage =
      `url(${backdropUrl(data.backdrop_path)})`;
  }

  document.getElementById('modalTitle').textContent = title;

  // Meta
  let metaHtml = '';
  if (rating) metaHtml += `<span class="modal__match">${rating}% Match</span>`;
  if (year)   metaHtml += `<span class="modal__year">${year}</span>`;
  if (seasons) metaHtml += `<span class="modal__seasons">${seasons} Season${seasons > 1 ? 's' : ''}</span>`;
  if (runtime) metaHtml += `<span>${runtime}</span>`;
  metaHtml += `<span class="modal__hd">HD</span>`;
  document.getElementById('modalMeta').innerHTML = metaHtml;
  document.getElementById('modalDesc').textContent = data.overview || '';

  // Cast / genres sidebar
  if (cast.length) {
    document.getElementById('modalCast').innerHTML =
      `<span style="color:#777">Cast: </span><span>${cast.join(', ')}</span>`;
  }
  if (director.length) {
    document.getElementById('modalCast').innerHTML +=
      `<br><span style="color:#777">Director: </span><span>${director.join(', ')}</span>`;
  }
  if (genres.length) {
    document.getElementById('modalGenres').innerHTML =
      `<span style="color:#777">Genres: </span><span>${genres.join(', ')}</span>`;
  }

  // Trailer button
  const trailer = (data.videos?.results || []).find(v =>
    v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  const trailerBtn = document.getElementById('modalTrailerBtn');
  if (trailer) {
    trailerBtn.style.display = '';
    trailerBtn.onclick = () => {
      window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
    };
  } else {
    trailerBtn.style.display = 'none';
  }

  // Play button in hero
  document.getElementById('modalPlayBtn').onclick = () => {
    _loadPlayer(true);
  };

  // Player
  _loadPlayer(autoplay);

  // TV Episodes
  if (type === 'tv') {
    _renderSeasonSelect(data);
    document.getElementById('modalEpisodesSection').style.display = 'block';
    _loadEpisodes(data.id, 1, autoplay);
  }

  // More like this
  const similar = (data.similar?.results || [])
    .filter(i => i.backdrop_path || i.poster_path)
    .slice(0, 9);
  _renderMoreLike(similar, type);
}

function _loadPlayer(autoplay) {
  if (!_modalState) return;
  const { id, type, season, episode } = _modalState;
  const wrap = document.getElementById('modalPlayerWrap');
  if (type === 'movie') {
    Player.mountMovie(wrap, id, autoplay);
  } else {
    Player.mountTV(wrap, id, season, episode, autoplay);
  }
}

function _renderSeasonSelect(data) {
  const seasons = (data.seasons || []).filter(s => s.season_number > 0);
  const sel = document.getElementById('modalSeasonSelect');
  sel.innerHTML = seasons.map(s =>
    `<option value="${s.season_number}">Season ${s.season_number}</option>`
  ).join('');
}

async function _loadEpisodes(showId, seasonNum, playFirst = false) {
  const list = document.getElementById('modalEpisodesList');
  list.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  try {
    const data = await API.season(showId, seasonNum);
    const eps  = (data.episodes || []).filter(e => e.episode_number > 0);

    list.innerHTML = '';
    eps.forEach((ep, i) => {
      const thumb = ep.still_path ? imgUrl(ep.still_path, 'w300') : null;
      const el = document.createElement('div');
      el.className = `episode-item${i === 0 ? ' active' : ''}`;
      el.id = `ep-item-${ep.episode_number}`;
      el.innerHTML = `
        <div class="episode-item__num">${ep.episode_number}</div>
        <div class="episode-item__thumb">
          ${thumb
            ? `<img src="${thumb}" alt="Episode ${ep.episode_number}" loading="lazy">`
            : `<div style="width:100%;height:100%;background:#333;"></div>`}
          <div class="episode-item__thumb-play">
            <svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="episode-item__info">
          <div class="episode-item__title-row">
            <span class="episode-item__name">${ep.name || `Episode ${ep.episode_number}`}</span>
            ${ep.runtime ? `<span class="episode-item__duration">${ep.runtime}m</span>` : ''}
          </div>
          <div class="episode-item__desc">${ep.overview || ''}</div>
        </div>`;

      el.addEventListener('click', () => _selectEpisode(ep.episode_number));
      list.appendChild(el);
    });

    if (playFirst && eps.length) _selectEpisode(1);
    else if (eps.length && !_modalState.episodeLoaded) {
      _selectEpisode(1);
      _modalState.episodeLoaded = true;
    }
  } catch {
    list.innerHTML = `<p style="color:#a3a3a3;padding:16px">Failed to load episodes.</p>`;
  }
}

function _selectEpisode(epNum) {
  if (!_modalState) return;
  _modalState.episode = epNum;

  document.querySelectorAll('.episode-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(`ep-item-${epNum}`);
  if (el) el.classList.add('active');

  Player.mountTV(
    document.getElementById('modalPlayerWrap'),
    _modalState.id,
    _modalState.season,
    epNum,
    true
  );
}

async function changeSeason() {
  if (!_modalState) return;
  const sn = parseInt(document.getElementById('modalSeasonSelect').value);
  _modalState.season = sn;
  _modalState.episode = 1;
  _modalState.episodeLoaded = false;
  await _loadEpisodes(_modalState.id, sn, false);
}

function _renderMoreLike(items, type) {
  const grid = document.getElementById('modalMoreGrid');
  grid.innerHTML = '';
  items.forEach(item => {
    const t = itemTitle(item);
    const rating = matchPercent(item.vote_average);
    const thumb  = item.backdrop_path
      ? imgUrl(item.backdrop_path, 'w300')
      : imgUrl(item.poster_path, 'w500');

    const card = document.createElement('div');
    card.className = 'more-card';
    card.innerHTML = `
      <img class="more-card__thumb" src="${thumb || PLACEHOLDER(300, 169)}" alt="${t}" loading="lazy">
      <div class="more-card__body">
        <div class="more-card__header">
          <div class="more-card__title">${t}</div>
          ${rating ? `<div class="more-card__match">${rating}% Match</div>` : ''}
        </div>
        <div class="more-card__desc">${item.overview || ''}</div>
      </div>`;
    card.addEventListener('click', () => openModal(item.id, type));
    grid.appendChild(card);
  });
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  Player.unmount(document.getElementById('modalPlayerWrap'));
  _modalState = null;
}

function overlayClose(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

// ESC to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
