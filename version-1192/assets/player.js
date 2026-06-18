import { H as Hls } from './hls-dru42stk.js';

(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player-box]'));

  boxes.forEach(function (box) {
    var video = box.querySelector('video[data-src]');
    var button = box.querySelector('[data-player-start]');
    var hasInitialized = false;

    function initializePlayer() {
      if (!video || hasInitialized) {
        return;
      }

      hasInitialized = true;
      var source = video.getAttribute('data-src');

      if (window.Hls && window.Hls.isSupported()) {
        var windowHls = new window.Hls();
        windowHls.loadSource(source);
        windowHls.attachMedia(video);
      } else if (Hls && Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      box.classList.add('is-ready');
      video.play().catch(function () {
        video.controls = true;
      });
    }

    if (button) {
      button.addEventListener('click', initializePlayer);
    }

    if (video) {
      video.addEventListener('play', initializePlayer, { once: true });
    }
  });
})();
