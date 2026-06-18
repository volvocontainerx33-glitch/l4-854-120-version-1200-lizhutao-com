(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function createMovieCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.dataset.title = movie.title;
    article.dataset.year = movie.year;
    article.dataset.region = movie.region;
    article.dataset.genre = movie.genre;

    var cover = document.createElement("a");
    cover.className = "card-cover";
    cover.href = movie.url;

    var img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.src = movie.poster;
    img.alt = movie.title;

    var score = document.createElement("span");
    score.className = "card-score";
    score.textContent = movie.score;

    cover.appendChild(img);
    cover.appendChild(score);

    var body = document.createElement("div");
    body.className = "card-body";

    var meta = document.createElement("div");
    meta.className = "card-meta";
    [movie.year, movie.region, movie.type].forEach(function (item) {
      var span = document.createElement("span");
      span.textContent = item;
      meta.appendChild(span);
    });

    var title = document.createElement("h3");
    var link = document.createElement("a");
    link.href = movie.url;
    link.textContent = movie.title;
    title.appendChild(link);

    var summary = document.createElement("p");
    summary.textContent = movie.summary;

    var tags = document.createElement("div");
    tags.className = "tag-row";
    [movie.category, movie.genre, movie.region].slice(0, 3).forEach(function (item) {
      var tag = document.createElement("span");
      tag.textContent = item;
      tags.appendChild(tag);
    });

    body.appendChild(meta);
    body.appendChild(title);
    body.appendChild(summary);
    body.appendChild(tags);
    article.appendChild(cover);
    article.appendChild(body);
    return article;
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.dataset.heroDot));
        start();
      });
    });

    start();
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll(".js-card-grid"));
    grids.forEach(function (grid) {
      var section = grid.closest("section") || document;
      var input = section.querySelector(".js-filter-input");
      var yearSelect = section.querySelector(".js-year-select");
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function apply() {
        var query = normalize(input && input.value);
        var year = yearSelect ? yearSelect.value : "";
        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.genre,
            card.textContent
          ].join(" "));
          var okQuery = !query || text.indexOf(query) !== -1;
          var okYear = !year || card.dataset.year.indexOf(year) !== -1;
          card.classList.toggle("is-hidden", !(okQuery && okYear));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", apply);
      }
    });
  }

  function setupSearchPage() {
    var data = window.SEARCH_MOVIES || [];
    var input = document.getElementById("search-page-input");
    var results = document.getElementById("search-results");
    var summary = document.getElementById("search-summary");
    if (!input || !results || !summary || !data.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function render(query) {
      var term = normalize(query);
      var matches = data.filter(function (movie) {
        return !term || normalize(movie.text).indexOf(term) !== -1;
      }).slice(0, 96);

      results.innerHTML = "";
      matches.forEach(function (movie) {
        results.appendChild(createMovieCard(movie));
      });

      if (term) {
        summary.textContent = "搜索结果：" + query + "，显示相关影片";
      } else {
        summary.textContent = "热门影片推荐";
      }
    }

    input.addEventListener("input", function () {
      render(input.value);
    });
    render(initialQuery);
  }

  window.initMoviePlayer = function (videoId, coverId, source) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hls = null;
    var attached = false;

    if (!video || !cover || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      cover.hidden = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          cover.hidden = false;
        });
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
