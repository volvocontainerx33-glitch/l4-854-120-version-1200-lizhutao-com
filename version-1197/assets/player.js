function setupPlayer(root) {
  var video = root.querySelector("video[data-src]");
  var button = root.querySelector("[data-play-button]");
  var source = video ? video.getAttribute("data-src") : "";
  var hlsInstance = null;
  var started = false;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (started) {
      return;
    }
    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    attachSource();
    if (button) {
      button.classList.add("is-hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("is-hidden");
    }
  });

  video.addEventListener("ended", function () {
    if (button) {
      button.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}

document.querySelectorAll("[data-player]").forEach(setupPlayer);
