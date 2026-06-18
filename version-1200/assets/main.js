(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
    initPlayers();
  });

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-site-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initSearchForms() {
    var forms = document.querySelectorAll("[data-site-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./all-movies.html";
        window.location.href = value ? target + "?q=" + encodeURIComponent(value) : target;
      });
    });
  }

  function initFilters() {
    var boxes = document.querySelectorAll("[data-filter-box]");
    boxes.forEach(function (box) {
      var input = box.querySelector("[data-filter-input]");
      var region = box.querySelector("[data-region-filter]");
      var year = box.querySelector("[data-year-filter]");
      var list = document.querySelector("[data-card-list]");
      var empty = document.querySelector("[data-empty-state]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (input && initial) {
        input.value = initial;
      }
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var matched = matchQuery && matchRegion && matchYear;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      [input, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-overlay");
      var errorBox = player.querySelector("[data-player-error]");
      var stream = player.getAttribute("data-stream");
      if (!video || !stream) {
        return;
      }
      function showError() {
        if (errorBox) {
          errorBox.hidden = false;
        }
      }
      function attachStream() {
        if (video.getAttribute("data-ready") === "yes") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.setAttribute("data-ready", "yes");
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              showError();
            }
          });
          video.setAttribute("data-ready", "yes");
          return;
        }
        showError();
      }
      function play() {
        attachStream();
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {
            showError();
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
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
      video.addEventListener("error", showError);
      attachStream();
    });
  }
})();
