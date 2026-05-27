(function() {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-start-player]');

  if (!video || !overlay) {
    return;
  }

  var streamUrl = video.getAttribute('data-stream');
  var hlsInstance = null;
  var initialized = false;

  function initialize() {
    if (initialized || !streamUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    initialized = true;
  }

  function start() {
    initialize();
    overlay.hidden = true;
    video.controls = true;
    var request = video.play();

    if (request && typeof request.catch === 'function') {
      request.catch(function() {
        overlay.hidden = false;
      });
    }
  }

  overlay.addEventListener('click', start);
  video.addEventListener('click', function() {
    if (!initialized) {
      start();
    }
  });

  window.addEventListener('beforeunload', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
