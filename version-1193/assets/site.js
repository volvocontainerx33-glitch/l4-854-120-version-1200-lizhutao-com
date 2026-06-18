(function () {
  var ready = function (fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  ready(function () {
    var menuToggle = document.getElementById('menuToggle');
    var mobilePanel = document.getElementById('mobilePanel');
    if (menuToggle && mobilePanel) {
      menuToggle.addEventListener('click', function () {
        mobilePanel.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showHero(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function startHero() {
      if (slides.length <= 1) {
        return;
      }
      clearInterval(timer);
      timer = setInterval(function () {
        showHero(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(index - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(index + 1);
        startHero();
      });
    }

    startHero();

    var list = document.querySelector('[data-filter-list]');
    var cardSearch = document.querySelector('.js-card-search');
    var yearFilter = document.querySelector('.js-year-filter');

    function filterCards() {
      if (!list) {
        return;
      }
      var keyword = cardSearch ? cardSearch.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      Array.prototype.slice.call(list.children).forEach(function (item) {
        var text = (item.getAttribute('data-search') || item.getAttribute('data-title') || '').toLowerCase();
        var itemYear = item.getAttribute('data-year') || '';
        var matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || itemYear === year);
        item.classList.toggle('hidden-card', !matched);
      });
    }

    if (cardSearch) {
      cardSearch.addEventListener('input', filterCards);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', filterCards);
    }

    var form = document.getElementById('globalSearchForm');
    var input = document.getElementById('globalSearchInput');
    var results = document.getElementById('searchResults');
    var status = document.getElementById('searchStatus');

    function resultCard(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card compact">'
        + '<a class="poster-link" href="' + escapeHtml(item.url) + '">'
        + '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
        + '<span class="score-badge">' + escapeHtml(item.score) + '</span>'
        + '<span class="type-badge">' + escapeHtml(item.type) + '</span>'
        + '</a>'
        + '<div class="card-body">'
        + '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>'
        + '<p class="meta-line">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.genre) + '</p>'
        + '<p class="card-line">' + escapeHtml(item.line) + '</p>'
        + '<div class="tag-row">' + tags + '</div>'
        + '</div>'
        + '</article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function renderSearch(query) {
      if (!results || !window.SEARCH_DATA) {
        return;
      }
      var keyword = (query || '').trim().toLowerCase();
      var matched = window.SEARCH_DATA.filter(function (item) {
        if (!keyword) {
          return true;
        }
        var text = [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(' '), item.line].join(' ').toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, 160);
      results.innerHTML = matched.map(resultCard).join('');
      if (status) {
        status.textContent = keyword ? '搜索结果：' + matched.length + ' 条' : '热门推荐';
      }
    }

    if (form && input) {
      var params = new URLSearchParams(window.location.search);
      var preset = params.get('q') || '';
      if (preset) {
        input.value = preset;
        renderSearch(preset);
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        renderSearch(input.value);
      });
      input.addEventListener('input', function () {
        renderSearch(input.value);
      });
    }
  });
})();
