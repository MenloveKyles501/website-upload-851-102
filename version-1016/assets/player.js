import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(wrapper) {
  const video = wrapper.querySelector('video[data-src]');
  const overlay = wrapper.querySelector('[data-play-overlay]');
  const loading = wrapper.querySelector('[data-player-loading]');
  const errorBox = wrapper.querySelector('[data-player-error]');

  if (!video) return;

  const source = video.getAttribute('data-src');

  function showError(message) {
    if (loading) loading.hidden = true;
    if (errorBox) {
      errorBox.hidden = false;
      errorBox.textContent = message;
    }
  }

  function hideLoading() {
    if (loading) loading.hidden = true;
  }

  if (!source) {
    showError('没有可用的视频源');
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, hideLoading);
    hls.on(Hls.Events.ERROR, function (_event, data) {
      if (!data || !data.fatal) return;
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        showError('网络错误，正在尝试重新加载');
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        showError('媒体错误，正在尝试恢复');
        hls.recoverMediaError();
      } else {
        showError('无法播放视频');
        hls.destroy();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.addEventListener('loadedmetadata', hideLoading, { once: true });
  } else {
    showError('当前浏览器不支持 HLS 播放');
  }

  if (overlay) {
    overlay.addEventListener('click', async function () {
      try {
        await video.play();
      } catch (error) {
        showError('浏览器阻止了自动播放，请使用播放器控件播放');
      }
    });
  }

  video.addEventListener('play', function () {
    wrapper.classList.add('is-playing');
    hideLoading();
  });

  video.addEventListener('pause', function () {
    wrapper.classList.remove('is-playing');
  });

  video.addEventListener('canplay', hideLoading);
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(setupPlayer);
});
