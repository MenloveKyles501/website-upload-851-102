
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function clampText(v) { return (v || '').toLowerCase(); }

  function initNav() {
    const btn = qs('[data-nav-toggle]');
    const nav = qs('[data-nav-menu]');
    if (btn && nav) {
      btn.addEventListener('click', () => nav.classList.toggle('open'));
    }
  }

  function initHero() {
    const slides = qsa('[data-hero-slide]');
    if (!slides.length) return;
    let current = 0;
    function show(i) {
      slides.forEach((el, idx) => el.classList.toggle('active', idx === i));
    }
    show(0);
    setInterval(() => {
      current = (current + 1) % slides.length;
      show(current);
    }, 4500);
  }

  function filterCards(input, containerSel, itemSel) {
    if (!input) return;
    const container = qs(containerSel);
    if (!container) return;
    const items = qsa(itemSel, container);
    input.addEventListener('input', () => {
      const q = clampText(input.value.trim());
      let visible = 0;
      items.forEach((card) => {
        const hay = clampText(card.getAttribute('data-keywords') || card.textContent);
        const ok = !q || hay.includes(q);
        card.classList.toggle('hidden', !ok);
        if (ok) visible += 1;
      });
      const empty = qs('[data-empty]', container.parentElement || document);
      if (empty) empty.classList.toggle('hidden', visible !== 0);
    });
  }

  function initSearchPage() {
    const wrap = qs('[data-search-page]');
    if (!wrap || !window.MOVIE_CATALOG) return;
    const input = qs('[data-search-input]', wrap);
    const genre = qs('[data-search-genre]', wrap);
    const region = qs('[data-search-region]', wrap);
    const list = qs('[data-search-results]', wrap);
    const count = qs('[data-search-count]', wrap);
    const pills = qsa('[data-search-chip]', wrap);

    function render() {
      const q = clampText(input ? input.value.trim() : '');
      const g = clampText(genre ? genre.value : '');
      const r = clampText(region ? region.value : '');
      const results = window.MOVIE_CATALOG.filter((m) => {
        const hay = clampText([m.title, m.genre, m.region, m.type, m.one_line, m.summary, m.review, (m.tags || []).join(' ')].join(' '));
        const matchQ = !q || hay.includes(q);
        const matchG = !g || clampText(m.primary_genre) === g;
        const matchR = !r || clampText(m.region_group) === r;
        return matchQ && matchG && matchR;
      });
      if (count) count.textContent = String(results.length);
      if (!list) return;
      list.innerHTML = results.slice(0, 200).map((m) => `
        <article class="search-item">
          <div class="search-thumb" style="--c1:${m.c1};--c2:${m.c2}"></div>
          <div>
            <h4>${m.title}</h4>
            <p>${m.one_line || m.summary || m.review || ''}</p>
          </div>
          <div class="right">
            <span class="badge">${m.year || ''}</span>
            <span class="badge">${m.region}</span>
            <span class="badge">${m.genre}</span>
            <a class="btn btn-primary" href="${m.slug}">查看详情</a>
          </div>
        </article>
      `).join('') || '<div class="content-block"><p>没有匹配到结果，请换个关键词继续搜索。</p></div>';
    }

    if (input) input.addEventListener('input', render);
    if (genre) genre.addEventListener('change', render);
    if (region) region.addEventListener('change', render);
    pills.forEach((p) => p.addEventListener('click', () => {
      if (input) input.value = p.getAttribute('data-value') || '';
      if (genre) genre.value = p.getAttribute('data-genre') || '';
      if (region) region.value = p.getAttribute('data-region') || '';
      render();
    }));
    render();
  }

  function initLocalFilter() {
    qsa('[data-filter-input]').forEach((input) => {
      const box = input.closest('[data-filter-wrap]');
      if (!box) return;
      const cards = qsa('[data-filter-card]', box);
      input.addEventListener('input', () => {
        const q = clampText(input.value.trim());
        let visible = 0;
        cards.forEach((card) => {
          const hay = clampText(card.getAttribute('data-keywords') || card.textContent);
          const ok = !q || hay.includes(q);
          card.classList.toggle('hidden', !ok);
          if (ok) visible += 1;
        });
        const empty = qs('[data-empty]', box);
        if (empty) empty.classList.toggle('hidden', visible !== 0);
      });
    });
  }

  initNav();
  initHero();
  initSearchPage();
  initLocalFilter();
})();
