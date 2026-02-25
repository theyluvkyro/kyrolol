// ─── UI HELPERS ───────────────────────────────────────────────────

const PLACEHOLDER = () =>
  `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="169"><rect fill="#2a2a2a" width="300" height="169"/></svg>')}`;

// ── Single global hover panel (reused for every card)
let _hoverPanel   = null;
let _hoverCard    = null;
let _showTimer    = null;
let _hideTimer    = null;
const SHOW_DELAY  = 380;
const HIDE_GRACE  = 180;

function _initHoverPanel() {
  _hoverPanel = document.createElement('div');
  _hoverPanel.className = 'card-hover-panel';
  document.body.appendChild(_hoverPanel);

  _hoverPanel.addEventListener('mouseenter', () => clearTimeout(_hideTimer));
  _hoverPanel.addEventListener('mouseleave', _scheduleHide);
}

function _positionPanel(card) {
  const r   = card.getBoundingClientRect();
  const pw  = r.width * 1.5;          // panel matches scaled card width
  const cx  = r.left + r.width / 2;   // card horizontal center

  let left = cx - pw / 2;
  // Clamp inside viewport
  const margin = 8;
  left = Math.max(margin, Math.min(left, window.innerWidth - pw - margin));

  // Top = bottom of scaled card
  // card scales 1.5× from center → new bottom = center_y + (h * 1.5 / 2)
  const centerY     = r.top + r.height / 2;
  const scaledBottom = centerY + (r.height * 1.5) / 2;

  _hoverPanel.style.width = pw + 'px';
  _hoverPanel.style.left  = left + 'px';
  _hoverPanel.style.top   = scaledBottom + window.scrollY + 'px';
  // Use fixed so we don't need scrollY
  _hoverPanel.style.top   = scaledBottom + 'px';
}

function _showPanel(card, item, type) {
  clearTimeout(_hideTimer);
  _hoverCard = card;
  card.classList.add('hovered');

  const title   = itemTitle(item);
  const rating  = itemRating(item);
  const year    = itemYear(item);
  const genres  = (item.genre_ids || []).slice(0, 3).map(id => GENRE_MAP[id]).filter(Boolean);
  const seasons = item.number_of_seasons;

  _hoverPanel.innerHTML = `
    <div class="card-hover-panel__actions">
      <button class="chp-btn chp-btn--play" onclick="event.stopPropagation();quickPlay(${item.id},'${type}')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <button class="chp-btn chp-btn--add" title="Add to My List">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      </button>
      <button class="chp-btn chp-btn--like" title="Thumbs Up">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
      </button>
      <button class="chp-btn chp-btn--chevron" title="More Info" onclick="event.stopPropagation();openModal(${item.id},'${type}')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
      </button>
    </div>
    <div class="card-hover-panel__title">${title}</div>
    <div class="card-hover-panel__meta">
      ${rating  ? `<span class="chp-match">${rating}% Match</span>` : ''}
      ${year    ? `<span class="chp-year">${year}</span>` : ''}
      <span class="chp-hd">HD</span>
      ${seasons ? `<span style="color:#e5e5e5">${seasons} Season${seasons > 1 ? 's' : ''}</span>` : ''}
    </div>
    ${genres.length ? `<div class="card-hover-panel__tags">${genres.map(g => `<span class="chp-tag">${g}</span>`).join('')}</div>` : ''}
  `;

  _positionPanel(card);
  _hoverPanel.classList.add('visible');
}

function _hidePanel() {
  _hoverPanel.classList.remove('visible');
  if (_hoverCard) { _hoverCard.classList.remove('hovered'); _hoverCard = null; }
}

function _scheduleHide() {
  _hideTimer = setTimeout(_hidePanel, HIDE_GRACE);
}

// ── Build card DOM element
function buildCard(item, overrideType) {
  const type  = overrideType || itemType(item);
  const title = itemTitle(item);

  // Always prefer backdrop (16:9) for the row thumbnail
  const thumb = item.backdrop_path
    ? `${CONFIG.IMG_BASE}w300${item.backdrop_path}`
    : item.poster_path
      ? `${CONFIG.IMG_BASE}w342${item.poster_path}`
      : null;

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <div class="card__thumb-wrap">
      <img class="card__img"
           src="${thumb || PLACEHOLDER()}"
           alt="${title.replace(/"/g, '&quot;')}"
           loading="lazy"
           onerror="this.src='${PLACEHOLDER()}'" />
    </div>`;

  card.addEventListener('mouseenter', () => {
    clearTimeout(_showTimer);
    clearTimeout(_hideTimer);
    _showTimer = setTimeout(() => _showPanel(card, item, type), SHOW_DELAY);
  });

  card.addEventListener('mouseleave', () => {
    clearTimeout(_showTimer);
    _scheduleHide();
  });

  card.addEventListener('click', () => openModal(item.id, type));
  return card;
}

// ── Build a row
function buildRow(title, items, type) {
  if (!items || !items.length) return null;

  const valid = items
    .filter(i => (i.backdrop_path || i.poster_path) && (i.title || i.name))
    .slice(0, 20);

  if (!valid.length) return null;

  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = `
    <div class="row__header">
      <h2 class="row__title">${title}</h2>
      <span class="row__explore">
        Explore All
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
      </span>
    </div>
    <div class="row__slider-wrap">
      <button class="row__handle row__handle--left" aria-label="Previous">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
      </button>
      <div class="row__slider"></div>
      <button class="row__handle row__handle--right" aria-label="Next">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
      </button>
    </div>`;

  const slider = row.querySelector('.row__slider');

  valid.forEach((item, i) => {
    const card = buildCard(item, type);
    if (i === 0)              card.classList.add('card--first');
    if (i === valid.length-1) card.classList.add('card--last');
    slider.appendChild(card);
  });

  // Scroll buttons
  const scrollBy = (dir) => {
    const cardW   = slider.querySelector('.card')?.offsetWidth || 200;
    const visible = Math.max(1, Math.floor(slider.clientWidth / (cardW + 4)));
    slider.scrollBy({ left: dir * cardW * visible, behavior: 'smooth' });
  };
  row.querySelector('.row__handle--left').addEventListener('click',  () => scrollBy(-1));
  row.querySelector('.row__handle--right').addEventListener('click', () => scrollBy(1));

  return row;
}

// ── Helpers
function slideRow(btn, dir) {
  const slider = btn.closest('.row__slider-wrap').querySelector('.row__slider');
  const cardW  = slider.querySelector('.card')?.offsetWidth || 200;
  slider.scrollBy({ left: dir * cardW, behavior: 'smooth' });
}

function matchPercent(v) { return v ? Math.round((v / 10) * 100) : null; }

function quickPlay(id, type) { openModal(id, type, true); }

function goHome(e) {
  if (e) e.preventDefault();
  document.getElementById('searchSection').classList.remove('active');
  document.getElementById('mainBrowse').classList.remove('hidden');
  document.getElementById('searchInput').value = '';
  document.querySelector('.search-inline')?.classList.remove('open');
}

function toggleSearch() {
  const s = document.getElementById('searchInline');
  s.classList.toggle('open');
  if (s.classList.contains('open')) document.getElementById('searchInput').focus();
}

function setActiveNav(e, section) {
  e.preventDefault();
  document.querySelectorAll('.navbar__link').forEach(l => l.classList.remove('active'));
  e.currentTarget.classList.add('active');
}

async function populateGenres() {
  try {
    const [mv, tv] = await API.genres();
    const all = [...new Map([...mv.genres, ...tv.genres].map(g => [g.id, g])).values()];
    document.getElementById('genreDropdown').innerHTML = all
      .map(g => `<div class="genre-dropdown__item" onclick="filterGenre(${g.id},'${g.name}')">${g.name}</div>`)
      .join('');
  } catch {}
}

function filterGenre() {}
function filterSection() {}

// Scroll-dependent navbar
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 10);
});

// Init on DOM ready
document.addEventListener('DOMContentLoaded', _initHoverPanel);
