// ─── PLAYER ───────────────────────────────────────────────────────

const Player = {
  _currentType: null,
  _currentId:   null,
  _currentS:    null,
  _currentE:    null,

  movieSrc(id, autoplay = true, progress = 0) {
    const p = new URLSearchParams({ color: CONFIG.VIDKING_COLOR, autoPlay: autoplay });
    if (progress > 0) p.set('progress', Math.floor(progress));
    return `${CONFIG.VIDKING}/embed/movie/${id}?${p}`;
  },

  tvSrc(id, season, episode, autoplay = true, progress = 0) {
    const p = new URLSearchParams({
      color:           CONFIG.VIDKING_COLOR,
      autoPlay:        autoplay,
      nextEpisode:     true,
      episodeSelector: true,
    });
    if (progress > 0) p.set('progress', Math.floor(progress));
    return `${CONFIG.VIDKING}/embed/tv/${id}/${season}/${episode}?${p}`;
  },

  _mount(wrapEl, src) {
    // Save state for retry
    this._lastSrc  = src;
    this._lastWrap = wrapEl;

    wrapEl.innerHTML = '';

    // Loading overlay (hidden by iframe onload)
    const overlay = document.createElement('div');
    overlay.className = 'modal__player-loading';
    overlay.id = 'playerLoadingOverlay';
    overlay.innerHTML = `
      <div class="spinner"></div>
      <p>Finding the best source… this may take a moment</p>`;
    wrapEl.appendChild(overlay);

    // Iframe
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.allowFullscreen = true;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';

    // Hide overlay once player loads
    iframe.addEventListener('load', () => {
      // Give VidKing 1.5s to initialise before hiding overlay
      setTimeout(() => {
        const ov = document.getElementById('playerLoadingOverlay');
        if (ov) ov.classList.add('hidden');
        // Remove overlay from DOM after fade
        setTimeout(() => ov?.remove(), 500);
      }, 1500);
    });

    wrapEl.appendChild(iframe);
  },

  mountMovie(wrapEl, id, autoplay = true) {
    this._currentType = 'movie';
    this._currentId   = id;
    const saved = this._getSaved('movie', id);
    this._mount(wrapEl, this.movieSrc(id, autoplay, saved?.t || 0));
    // Update player label
    const lbl = document.getElementById('modalPlayerTitle');
    if (lbl) lbl.textContent = 'Watch Now';
  },

  mountTV(wrapEl, showId, season, episode, autoplay = true) {
    this._currentType = 'tv';
    this._currentId   = showId;
    this._currentS    = season;
    this._currentE    = episode;
    const saved = this._getSaved('tv', showId, season, episode);
    this._mount(wrapEl, this.tvSrc(showId, season, episode, autoplay, saved?.t || 0));
    const lbl = document.getElementById('modalPlayerTitle');
    if (lbl) lbl.textContent = `Season ${season} · Episode ${episode}`;
  },

  // Reload same content (different internal source picked by VidKing on reload)
  retry() {
    if (!this._lastWrap || !this._lastSrc) return;
    // Add cache-busting param so VidKing picks a fresh source
    const url = new URL(this._lastSrc);
    url.searchParams.set('_t', Date.now());
    this._mount(this._lastWrap, url.toString());
  },

  unmount(wrapEl) {
    if (wrapEl) wrapEl.innerHTML = '';
    this._lastSrc  = null;
    this._lastWrap = null;
  },

  // Progress persistence
  _getSaved(type, id, s, e) {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY(type, id, s, e));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  _setSaved(type, id, s, e, t, dur) {
    try {
      localStorage.setItem(PROGRESS_KEY(type, id, s, e), JSON.stringify({ t, dur }));
    } catch {}
  },
};

// Retry button handler (global so inline onclick works)
function _retryPlayer() {
  Player.retry();
}

// Listen for VidKing progress events
window.addEventListener('message', (ev) => {
  if (typeof ev.data !== 'string') return;
  try {
    const msg = JSON.parse(ev.data);
    if (msg?.type !== 'PLAYER_EVENT') return;
    const d = msg.data;
    if (d?.event === 'timeupdate' && d.id) {
      Player._setSaved(d.mediaType, d.id, d.season, d.episode, d.currentTime, d.duration);
    }
  } catch {}
});
