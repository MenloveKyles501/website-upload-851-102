
(function () {
  function bySel(sel, root) { return (root || document).querySelector(sel); }
  function allSel(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  var menuBtn = bySel('[data-menu-toggle]');
  var nav = bySel('[data-nav-links]');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  allSel('[data-search-input]').forEach(function (input) {
    var target = input.getAttribute('data-search-input');
    var list = bySel(target);
    if (!list) return;
    var cards = allSel('[data-card]', list);
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var hay = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region')).toLowerCase();
        card.style.display = !q || hay.indexOf(q) > -1 ? '' : 'none';
      });
    });
  });

  var topBtn = bySel('[data-scroll-top]');
  if (topBtn) {
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // mark current nav item
  var path = location.pathname.split('/').pop() || 'index.html';
  allSel('.nav-links a').forEach(function (a) {
    try {
      var href = a.getAttribute('href');
      if (href && href.split('#')[0] === path) a.classList.add('active');
    } catch (e) {}
  });
})();
