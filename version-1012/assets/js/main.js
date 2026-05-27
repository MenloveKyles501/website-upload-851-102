(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      mobilePanel.hidden = isOpen;
      menuButton.textContent = isOpen ? "☰" : "×";
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  const prev = document.querySelector(".hero-prev");
  const next = document.querySelector(".hero-next");
  let current = slides.findIndex(function (slide) {
    return slide.classList.contains("is-active");
  });

  if (current < 0) {
    current = 0;
  }

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  if (slides.length) {
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 6200);
  }

  const params = new URLSearchParams(window.location.search);
  const queryFromUrl = params.get("q") || "";
  const siteSearchInput = document.getElementById("siteSearchInput");
  const typeFilter = document.getElementById("typeFilter");
  const regionFilter = document.getElementById("regionFilter");
  const yearFilter = document.getElementById("yearFilter");
  const searchStatus = document.getElementById("searchStatus");
  const cards = Array.from(document.querySelectorAll(".searchable-list .movie-card"));

  if (siteSearchInput) {
    siteSearchInput.value = queryFromUrl;
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-year"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags"),
      card.textContent
    ].join(" "));
  }

  function applySearchFilters() {
    if (!cards.length) {
      return;
    }

    const q = normalize(siteSearchInput ? siteSearchInput.value : queryFromUrl);
    const selectedType = normalize(typeFilter ? typeFilter.value : "");
    const selectedRegion = normalize(regionFilter ? regionFilter.value : "");
    const selectedYear = normalize(yearFilter ? yearFilter.value : "");
    let visible = 0;

    cards.forEach(function (card) {
      const text = cardText(card);
      const type = normalize(card.getAttribute("data-type"));
      const region = normalize(card.getAttribute("data-region"));
      const year = normalize(card.getAttribute("data-year"));
      const matched = (!q || text.includes(q)) &&
        (!selectedType || type.includes(selectedType)) &&
        (!selectedRegion || region.includes(selectedRegion)) &&
        (!selectedYear || year === selectedYear);

      card.classList.toggle("is-hidden-by-filter", !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (searchStatus) {
      searchStatus.textContent = visible ? "搜索结果已更新" : "没有找到匹配内容";
    }
  }

  [siteSearchInput, typeFilter, regionFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applySearchFilters);
      control.addEventListener("change", applySearchFilters);
    }
  });

  if (queryFromUrl || typeFilter || regionFilter || yearFilter) {
    applySearchFilters();
  }

  const filterRows = Array.from(document.querySelectorAll(".filter-row"));
  filterRows.forEach(function (row) {
    const localCards = Array.from(document.querySelectorAll(".searchable-list .movie-card"));
    const buttons = Array.from(row.querySelectorAll(".filter-pill"));

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");

        const key = button.getAttribute("data-filter-key");
        const value = normalize(button.getAttribute("data-filter-value"));

        localCards.forEach(function (card) {
          if (key === "all") {
            card.classList.remove("is-hidden-by-filter");
            return;
          }

          const target = normalize(card.getAttribute("data-" + key));
          card.classList.toggle("is-hidden-by-filter", !target.includes(value));
        });
      });
    });
  });
})();
