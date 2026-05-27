(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupMobileMenu() {
    var button = $('[data-mobile-menu-button]');
    var panel = $('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    $all('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) return;
        var query = input.value.trim();
        if (!query) {
          event.preventDefault();
          input.focus();
          return;
        }
        event.preventDefault();
        var target = form.getAttribute('data-target') || form.getAttribute('action') || 'search.html';
        window.location.href = target + '?q=' + encodeURIComponent(query);
      });
    });
  }

  function setupHeroSlider() {
    var slider = $('[data-hero-slider]');
    if (!slider) return;
    var slides = $all('[data-hero-slide]', slider);
    var dots = $all('[data-hero-dot]', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    var prev = $('[data-hero-prev]', slider);
    var next = $('[data-hero-next]', slider);
    if (prev) prev.addEventListener('click', function () { show(current - 1); start(); });
    if (next) next.addEventListener('click', function () { show(current + 1); start(); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function setupFilterGrid() {
    var grid = $('[data-filter-grid]');
    if (!grid) return;
    var cards = $all('.movie-card', grid);
    var original = cards.slice();
    var input = $('[data-grid-search]');
    var buttons = $all('[data-sort]');
    var sortMode = 'default';

    function apply() {
      var term = input ? input.value.trim().toLowerCase() : '';
      var visibleCards = cards.filter(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !term || haystack.indexOf(term) !== -1;
        card.hidden = !matched;
        return matched;
      });

      var sorted = visibleCards.slice();
      if (sortMode === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        });
      } else if (sortMode === 'title') {
        sorted.sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
        });
      } else {
        sorted = original.filter(function (card) { return !card.hidden; });
      }
      sorted.forEach(function (card) { grid.appendChild(card); });
    }

    if (input) input.addEventListener('input', apply);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        sortMode = button.getAttribute('data-sort') || 'default';
        buttons.forEach(function (item) { item.classList.toggle('is-active', item === button); });
        apply();
      });
    });
    apply();
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag-chip">' + escapeHtml(tag) + '</span>';
    }).join('\n');

    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '" data-year="' + escapeHtml(movie.yearValue) + '">',
      '  <span class="poster-wrap">',
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.closest('.poster-wrap').classList.add('no-image')\">",
      '    <span class="poster-gradient"></span>',
      '    <span class="poster-play">立即观看</span>',
      '  </span>',
      '  <span class="movie-card-body">',
      '    <span class="movie-title line-clamp-1">' + escapeHtml(movie.title) + '</span>',
      '    <span class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>',
      '    <span class="movie-desc line-clamp-2">' + escapeHtml(movie.oneLine) + '</span>',
      '    <span class="movie-tags">' + tags + '</span>',
      '  </span>',
      '</a>'
    ].join('\\n');
  }

  function setupSearchPage() {
    var results = $('[data-search-results]');
    if (!results || !window.MOVIE_SEARCH_DATA) return;
    var input = $('[data-global-search-input]');
    var title = $('[data-search-title]');
    var count = $('[data-search-count]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) input.value = query;

    function render(term) {
      var cleanTerm = String(term || '').trim().toLowerCase();
      if (!cleanTerm) {
        results.innerHTML = '';
        if (title) title.textContent = '输入关键词开始搜索';
        if (count) count.textContent = '可检索完整影片数据。';
        return;
      }
      var words = cleanTerm.split(/\s+/).filter(Boolean);
      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = String(movie.search || '').toLowerCase();
        return words.every(function (word) { return haystack.indexOf(word) !== -1; });
      });
      matched.sort(function (a, b) {
        return Number(b.yearValue || 0) - Number(a.yearValue || 0);
      });
      results.innerHTML = matched.slice(0, 240).map(createSearchCard).join('\n');
      if (title) title.textContent = '搜索结果';
      if (count) {
        count.textContent = '找到 ' + matched.length + ' 个相关结果' + (matched.length > 240 ? '，当前显示前 240 个。' : '。');
      }
    }

    if (input) {
      input.addEventListener('input', function () { render(input.value); });
    }
    render(query);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupSearchForms();
    setupHeroSlider();
    setupFilterGrid();
    setupSearchPage();
  });
})();
