(function () {
  var form = document.querySelector('[data-global-search-form]');
  var input = document.querySelector('[data-global-search-input]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var movies = [];

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function render(items, query) {
    if (!results || !status) {
      return;
    }

    if (!query) {
      results.innerHTML = '';
      status.textContent = '请输入关键词开始搜索。';
      return;
    }

    status.textContent = '找到 ' + items.length + ' 部相关影片。';

    results.innerHTML = items.slice(0, 120).map(function (movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card movie-card--compact">',
        '  <a class="movie-card__cover" href="' + movie.url + '" aria-label="观看《' + escapeHtml(movie.title) + '》详情">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=&quot;none&quot;; this.parentElement.classList.add(&quot;is-missing-cover&quot;);">',
        '    <span class="movie-card__badge">' + escapeHtml(movie.type) + '</span>',
        '    <span class="movie-card__play">播放</span>',
        '  </a>',
        '  <div class="movie-card__body">',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="movie-card__meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</p>',
        '    <p class="movie-card__desc">' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('\n');
    }).join('\n');
  }

  function search(query) {
    var normalized = query.trim().toLowerCase();

    if (!normalized) {
      render([], '');
      return;
    }

    var items = movies.filter(function (movie) {
      var text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags.join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();

      return text.indexOf(normalized) !== -1;
    });

    render(items, normalized);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  fetch('data/search-index.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      movies = data;
      var initialQuery = getQuery();

      if (input) {
        input.value = initialQuery;
      }

      search(initialQuery);
    });

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value : '';
      var url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.replaceState(null, '', url.toString());
      search(query);
    });
  }
})();
