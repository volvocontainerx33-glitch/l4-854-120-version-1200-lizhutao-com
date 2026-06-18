(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function normalize(text) {
    return String(text || "").trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.textContent = nav.classList.contains("open") ? "×" : "☰";
    });
  }

  function initSiteSearchForms() {
    var forms = document.querySelectorAll("[data-site-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
        } else {
          window.location.href = "./search.html";
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    start();
  }

  function initLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
      });
    });
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!form || !results || !status || !data.length) {
      return;
    }
    var input = form.querySelector("input[name='q']");

    function movieCard(movie) {
      var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags].join(" · ");
      return [
        '<article class="movie-card">',
        '<a class="poster" href="./' + movie.file + '">',
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="play-chip">播放</span>',
        '</a>',
        '<div class="card-body">',
        '<a class="card-title" href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a>',
        '<p class="card-meta">' + escapeHtml(text) + '</p>',
        '<p class="card-desc">' + escapeHtml(movie.oneLine || "") + '</p>',
        '<div class="tag-row"><span>' + escapeHtml(movie.category || "精选") + '</span></div>',
        '</div>',
        '</article>'
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function render(query) {
      var q = normalize(query);
      var matched = data.filter(function (movie) {
        var haystack = normalize([movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine, movie.category].join(" "));
        return !q || haystack.indexOf(q) !== -1;
      }).slice(0, 96);
      status.textContent = q ? "搜索结果：" + matched.length + " 条" : "推荐结果";
      results.innerHTML = matched.map(movieCard).join("");
    }

    var initial = getQueryValue("q");
    input.value = initial;
    render(initial);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input.value.trim();
      var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
      window.history.replaceState(null, "", url);
      render(value);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  function initPlayer() {
    var box = document.querySelector("[data-video]");
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    var source = box.getAttribute("data-video");
    var attached = false;
    var hls = null;

    function attach() {
      if (attached || !source || !video) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      box.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          box.classList.remove("is-playing");
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        box.classList.add("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initSiteSearchForms();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayer();
  });
})();
