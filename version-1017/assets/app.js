(function () {
  const mobileButton = document.querySelector('[data-mobile-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        const active = position === index;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.slide || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const year = scope.querySelector('[data-year-filter]');
    const type = scope.querySelector('[data-type-filter]');
    const grid = scope.parentElement ? scope.parentElement.querySelector('.movie-grid') : null;
    const cards = grid ? Array.from(grid.querySelectorAll('[data-card]')) : [];

    function filterCards() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const yearValue = year ? year.value : '';
      const typeValue = type ? type.value : '';

      cards.forEach(function (card) {
        const text = (card.dataset.text || '').toLowerCase();
        const matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchedYear = !yearValue || card.dataset.year === yearValue;
        const matchedType = !typeValue || card.dataset.type === typeValue;
        card.classList.toggle('hidden-card', !(matchedKeyword && matchedYear && matchedType));
      });
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }
    if (year) {
      year.addEventListener('change', filterCards);
    }
    if (type) {
      type.addEventListener('change', filterCards);
    }
  });

  const searchResults = document.querySelector('[data-search-results]');
  const searchTitle = document.querySelector('[data-search-title]');
  const searchInput = document.querySelector('[data-search-input]');

  if (searchResults) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();

    if (searchInput) {
      searchInput.value = query;
    }

    if (!query) {
      if (searchTitle) {
        searchTitle.textContent = '输入关键词查找影片';
      }
      searchResults.innerHTML = '';
      return;
    }

    fetch('./assets/movies-index.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (movies) {
        const words = query.toLowerCase().split(/\s+/).filter(Boolean);
        const matched = movies.filter(function (movie) {
          const text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.one_line, movie.category].join(' ').toLowerCase();
          return words.every(function (word) {
            return text.indexOf(word) !== -1;
          });
        });

        if (searchTitle) {
          searchTitle.textContent = '搜索：' + query;
        }

        if (!matched.length) {
          searchResults.innerHTML = '<div class="empty-state">未找到相关影片</div>';
          return;
        }

        searchResults.innerHTML = matched.slice(0, 240).map(renderCard).join('');
      });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderCard(movie) {
    return '<article class="movie-card">' +
      '<a class="card-link" href="' + escapeHtml(movie.url) + '">' +
      '<span class="poster-wrap">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"><span>播放</span></span>' +
      '<span class="corner-badge">' + escapeHtml(movie.type) + '</span>' +
      '</span>' +
      '<span class="card-body">' +
      '<span class="card-meta"><em>' + escapeHtml(movie.category) + '</em><i>' + escapeHtml(movie.year) + '</i></span>' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<span class="card-desc">' + escapeHtml(movie.one_line) + '</span>' +
      '<span class="card-foot"><b>' + escapeHtml(movie.region) + '</b><i>' + escapeHtml(movie.genre) + '</i></span>' +
      '</span>' +
      '</a>' +
      '</article>';
  }
}());
