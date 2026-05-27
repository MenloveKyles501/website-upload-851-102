
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('[data-mobile-menu-btn]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }

  // Search / filter support
  const searchInput = document.querySelector('[data-search-input]');
  const searchScope = document.querySelector('[data-search-scope]');
  const sortSelect = document.querySelector('[data-sort-select]');
  const items = Array.from(document.querySelectorAll('[data-search-item]'));

  const applyFilter = () => {
    if (!searchInput || !searchScope || !items.length) return;
    const q = (searchInput.value || '').trim().toLowerCase();
    const scope = searchScope.value || 'all';
    const sort = sortSelect ? sortSelect.value : 'default';

    const visible = [];
    items.forEach((item) => {
      const kw = (item.dataset.keywords || '').toLowerCase();
      const cat = item.dataset.category || 'all';
      const ok = (!q || kw.includes(q)) && (scope === 'all' || cat === scope);
      item.style.display = ok ? '' : 'none';
      if (ok) visible.push(item);
    });

    if (sort && sort !== 'default') {
      visible.sort((a, b) => {
        const av = Number(a.dataset[sort] || 0);
        const bv = Number(b.dataset[sort] || 0);
        if (sort === 'title') return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        return bv - av;
      }).forEach((item, idx) => item.parentElement.appendChild(item));
    }

    const countEl = document.querySelector('[data-result-count]');
    if (countEl) countEl.textContent = String(visible.length);
  };

  if (searchInput) {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q && !searchInput.value) searchInput.value = q;
    searchInput.addEventListener('input', applyFilter);
  }
  if (searchScope) searchScope.addEventListener('change', applyFilter);
  if (sortSelect) sortSelect.addEventListener('change', applyFilter);
  if (items.length) applyFilter();

  // HLS player
  const player = document.querySelector('video[data-hls-url]');
  if (player) {
    const src = player.dataset.hlsUrl;
    const tryNative = () => {
      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = src;
        return true;
      }
      return false;
    };

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(player);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            tryNative();
          }
        }
      });
    } else {
      tryNative();
    }
  }
});
