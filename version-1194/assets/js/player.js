import { H as Hls } from './hls.js';

function attachSource(video, source) {
  if (!source) {
    return;
  }

  if (video.dataset.ready === 'true') {
    return;
  }

  if (Hls && Hls.isSupported && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    video._hlsInstance = hls;
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else {
    video.src = source;
  }

  video.dataset.ready = 'true';
}

document.querySelectorAll('[data-player]').forEach(function (player) {
  const video = player.querySelector('[data-player-video]');
  const playButton = player.querySelector('[data-player-play]');

  if (!video || !playButton) {
    return;
  }

  const source = video.dataset.src;

  function play() {
    attachSource(video, source);
    playButton.classList.add('is-hidden');
    const promise = video.play();

    if (promise && promise.catch) {
      promise.catch(function () {
        playButton.classList.remove('is-hidden');
      });
    }
  }

  playButton.addEventListener('click', play);

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    playButton.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      playButton.classList.remove('is-hidden');
    }
  });
});
