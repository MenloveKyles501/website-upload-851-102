(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      const open = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  const carousel = document.getElementById("heroCarousel");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    let current = 0;

    function activate(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
      });
    });

    setInterval(function () {
      activate(current + 1);
    }, 5200);
  }

  const searchInput = document.getElementById("movieSearch");
  const typeFilter = document.getElementById("typeFilter");
  const yearFilter = document.getElementById("yearFilter");
  const cards = Array.from(document.querySelectorAll(".filter-list .search-item"));

  function matchesYear(cardYear, selectedYear) {
    if (!selectedYear) {
      return true;
    }
    if (selectedYear === "2019") {
      const parsed = parseInt(cardYear, 10);
      return Number.isFinite(parsed) && parsed <= 2019;
    }
    return cardYear === selectedYear;
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const typeValue = typeFilter ? typeFilter.value : "";
    const yearValue = yearFilter ? yearFilter.value : "";

    cards.forEach(function (card) {
      const text = [
        card.dataset.title || "",
        card.dataset.region || "",
        card.dataset.type || "",
        card.dataset.year || "",
        card.dataset.genre || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
      const typeOk = !typeValue || (card.dataset.type || "").indexOf(typeValue) !== -1;
      const yearOk = matchesYear(card.dataset.year || "", yearValue);
      const keywordOk = !keyword || text.indexOf(keyword) !== -1;
      card.classList.toggle("is-hidden", !(typeOk && yearOk && keywordOk));
    });
  }

  [searchInput, typeFilter, yearFilter].forEach(function (field) {
    if (field) {
      field.addEventListener("input", applyFilters);
      field.addEventListener("change", applyFilters);
    }
  });
}());
