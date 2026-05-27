import { H as Hls } from './hls.js';

export function setupPlayer(videoId, buttonId, source) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  const shell = video ? video.closest('.player-shell') : null;
  let ready = false;
  let hls = null;

  async function start() {
    if (!video) {
      return;
    }

    if (!ready) {
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    if (shell) {
      shell.classList.add('is-playing');
    }

    try {
      await video.play();
    } catch (error) {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && shell) {
        shell.classList.remove('is-playing');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
