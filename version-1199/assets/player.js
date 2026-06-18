import { H as Hls } from './hls-dru42stk.js';

document.querySelectorAll('[data-player]').forEach(function (player) {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const source = player.dataset.src;
  let hlsInstance = null;

  const start = function () {
    if (!video || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = source;
      }
    } else if (Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }
    } else if (!video.src) {
      video.src = source;
    }

    player.classList.add('is-playing');
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        player.classList.remove('is-playing');
      });
    }
  };

  if (button) {
    button.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
  }
});
