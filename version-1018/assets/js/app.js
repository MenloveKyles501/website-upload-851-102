(function () {
  var ready = function (callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  };

  ready(function () {
    var header = document.querySelector(".site-header");
    var menu = document.querySelector("[data-menu-toggle]");
    if (header && menu) {
      menu.addEventListener("click", function () {
        header.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var value = input ? input.value.trim() : "";
        var prefix = form.getAttribute("data-root") || "";
        var target = (prefix ? prefix + "/" : "") + "search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      var active = 0;
      var showSlide = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === active);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide(active + 1);
        }, 5600);
      }
    }

    var filterScope = document.querySelector("[data-filter-scope]");
    if (filterScope) {
      var textInput = document.querySelector("[data-filter-input]");
      var typeSelect = document.querySelector("[data-filter-type]");
      var yearSelect = document.querySelector("[data-filter-year]");
      var emptyState = document.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (textInput && query) {
        textInput.value = query;
      }
      var applyFilter = function () {
        var keyword = textInput ? textInput.value.trim().toLowerCase() : "";
        var typeValue = typeSelect ? typeSelect.value : "";
        var yearValue = yearSelect ? yearSelect.value : "";
        var visible = 0;
        filterScope.querySelectorAll("[data-card]").forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (typeValue && cardType !== typeValue) {
            ok = false;
          }
          if (yearValue && cardYear !== yearValue) {
            ok = false;
          }
          card.classList.toggle("hidden-card", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.classList.toggle("visible", visible === 0);
        }
      };
      [textInput, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
      applyFilter();
    }

    document.querySelectorAll(".player-box").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".player-start");
      var message = box.querySelector(".player-message");
      var source = video ? video.getAttribute("data-m3u8") : "";
      var writeMessage = function (value) {
        if (!message) {
          return;
        }
        message.textContent = value;
        box.classList.add("has-message");
      };
      var attachSource = function () {
        if (!video || !source || box.getAttribute("data-loaded") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegURL")) {
          video.src = source;
          box.setAttribute("data-loaded", "1");
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          box.hlsPlayer = hls;
          box.setAttribute("data-loaded", "1");
          return;
        }
        writeMessage("播放器暂时无法在当前浏览器启动");
      };
      var playVideo = function () {
        attachSource();
        if (!video) {
          return;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            writeMessage("请再次点击播放按钮");
          });
        }
      };
      if (button) {
        button.addEventListener("click", playVideo);
      }
      if (video) {
        video.addEventListener("play", function () {
          box.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            box.classList.remove("is-playing");
          }
        });
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          }
        });
      }
    });
  });
})();
