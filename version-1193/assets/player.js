(function () {
  var ready = function (fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  ready(function () {
    var video = document.getElementById('movieVideo');
    var button = document.getElementById('playerStart');
    var wrap = document.getElementById('playerWrap');
    if (!video || !button || !wrap) {
      return;
    }

    var src = video.getAttribute('data-play-url');
    var hls = null;
    var attached = false;

    function attachSource() {
      if (attached || !src) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function playVideo() {
      attachSource();
      wrap.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          wrap.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      wrap.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        wrap.classList.remove('is-playing');
      }
    });
    video.addEventListener('ended', function () {
      wrap.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
