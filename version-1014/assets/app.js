(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function() {
        showSlide(active + 1);
      }, 5000);
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function() {
        showSlide(active - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(active + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function(button) {
    button.addEventListener('click', function() {
      var targetId = button.getAttribute('data-target');
      var target = targetId ? document.getElementById(targetId) : null;

      if (!target) {
        return;
      }

      var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
      target.scrollBy({ left: direction * 420, behavior: 'smooth' });
    });
  });

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function(scope) {
    var input = scope.querySelector('[data-card-search]');
    var sort = scope.querySelector('[data-card-sort]');
    var type = scope.querySelector('[data-card-type]');
    var grid = scope.querySelector('[data-card-grid]');
    var empty = scope.querySelector('[data-search-empty]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

    if (input && getQueryValue('q')) {
      input.value = getQueryValue('q');
    }

    function applyFilter() {
      var query = input ? normalize(input.value) : '';
      var typeValue = type ? type.value : '';
      var visible = 0;

      cards.forEach(function(card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var cardType = card.querySelector('.movie-type') ? card.querySelector('.movie-type').textContent : '';
        var matchedQuery = !query || searchText.indexOf(query) !== -1;
        var matchedType = !typeValue || cardType === typeValue;
        var shouldShow = matchedQuery && matchedType;

        card.classList.toggle('hidden-card', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    function applySort() {
      if (!sort) {
        return;
      }

      var value = sort.value;
      var sorted = cards.slice().sort(function(a, b) {
        if (value === 'year') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }

        if (value === 'views') {
          return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
        }

        if (value === 'title') {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
        }

        return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
      });

      sorted.forEach(function(card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (type) {
      type.addEventListener('change', applyFilter);
    }

    if (sort) {
      sort.addEventListener('change', function() {
        applySort();
        applyFilter();
      });
      applySort();
    }

    applyFilter();
  });

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function() {
      backTop.classList.toggle('is-visible', window.scrollY > 360);
    });

    backTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
