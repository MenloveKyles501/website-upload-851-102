
import { H as Hls } from './hls-vendor.js';

const ready = (fn) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
};

function norm(text) {
  return String(text || '').toLowerCase().trim();
}

function passesFilter(card, query, year, type, genre) {
  const text = [
    card.dataset.title,
    card.dataset.tags,
    card.dataset.year,
    card.dataset.type,
    card.dataset.genre,
    card.dataset.region,
    card.textContent,
  ].join(' ').toLowerCase();
  const q = norm(query);
  const queryOk = !q || text.includes(q);
  const yearOk = !year || year === 'all' || card.dataset.year === year;
  const typeOk = !type || type === 'all' || card.dataset.type === type;
  const genreOk = !genre || genre === 'all' || card.dataset.genre.includes(genre) || card.dataset.title.includes(genre);
  return queryOk && yearOk && typeOk && genreOk;
}

function updateCount(root, visible) {
  const box = root.querySelector('[data-count]');
  if (box) box.textContent = String(visible);
}

function initFilters(root = document) {
  const search = root.querySelector('[data-filter-search]');
  const yearSel = root.querySelector('[data-filter-year]');
  const typeSel = root.querySelector('[data-filter-type]');
  const genreSel = root.querySelector('[data-filter-genre]');
  const cards = Array.from(root.querySelectorAll('.movie-card, .rank-row'));
  if (!cards.length) return;

  const params = new URLSearchParams(location.search);
  if (search && params.get('q') && !search.value) search.value = params.get('q');
  if (yearSel && params.get('year')) yearSel.value = params.get('year');
  if (typeSel && params.get('type')) typeSel.value = params.get('type');
  if (genreSel && params.get('genre')) genreSel.value = params.get('genre');

  const apply = () => {
    let visible = 0;
    cards.forEach(card => {
      const ok = passesFilter(card, search?.value || '', yearSel?.value || '', typeSel?.value || '', genreSel?.value || '');
      card.classList.toggle('hidden', !ok);
      if (ok) visible += 1;
    });
    updateCount(root, visible);
  };

  [search, yearSel, typeSel, genreSel].forEach(el => {
    if (!el) return;
    el.addEventListener('input', apply);
    el.addEventListener('change', apply);
  });
  apply();
}

function initCarousel() {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;
  const track = root.querySelector('[data-carousel-track]');
  const slides = Array.from(root.querySelectorAll('[data-carousel-slide]'));
  const dots = Array.from(root.querySelectorAll('[data-carousel-dot]'));
  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  if (!track || !slides.length) return;

  let index = 0;
  let timer = null;

  const render = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };
  const go = (dir) => {
    index = (index + dir + slides.length) % slides.length;
    render();
  };
  const start = () => {
    stop();
    timer = window.setInterval(() => go(1), 5200);
  };
  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  prev?.addEventListener('click', () => { go(-1); start(); });
  next?.addEventListener('click', () => { go(1); start(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { index = i; render(); start(); }));
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  render();
  start();
}

function initPlayer() {
  const frame = document.querySelector('[data-player]');
  if (!frame) return;
  const video = frame.querySelector('video');
  const button = frame.querySelector('[data-play-toggle]');
  if (!video) return;

  const src = video.dataset.hlsSrc || video.getAttribute('src') || '';
  const poster = video.dataset.poster || '';
  if (poster) video.poster = poster;

  if (src && src.endsWith('.m3u8')) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      window.__movieHls = hls;
    } else {
      video.src = src;
    }
  } else if (src) {
    video.src = src;
  }

  const sync = () => {
    if (!button) return;
    button.textContent = video.paused ? '点击播放' : '暂停播放';
  };

  button?.addEventListener('click', async () => {
    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (err) {
      console.error(err);
    }
    sync();
  });
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  video.addEventListener('loadedmetadata', sync);
  sync();
}

function enhanceLists() {
  const toggles = document.querySelectorAll('[data-toggle-panel]');
  toggles.forEach(btn => {
    const target = document.querySelector(btn.dataset.togglePanel || '');
    if (!target) return;
    btn.addEventListener('click', () => target.classList.toggle('hidden'));
  });
}

ready(() => {
  initCarousel();
  initPlayer();
  initFilters();
  enhanceLists();
});
