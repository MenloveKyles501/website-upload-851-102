(function () {
  window.initMoviePlayer = function (sourceUrl) {
    document.addEventListener("DOMContentLoaded", function () {
      const video = document.querySelector(".js-player");
      const overlay = document.querySelector(".js-player-overlay");
      let hasAttached = false;
      let hlsInstance = null;

      if (!video || !overlay || !sourceUrl) {
        return;
      }

      function attachSource() {
        if (hasAttached) {
          return;
        }

        hasAttached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
          return;
        }

        video.src = sourceUrl;
      }

      function startPlayback() {
        attachSource();
        overlay.classList.add("is-hidden");
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      overlay.addEventListener("click", startPlayback);
      video.addEventListener("click", function () {
        if (!hasAttached) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
      video.addEventListener("ended", function () {
        if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
          hlsInstance.stopLoad();
        }
      });
    });
  };
})();
