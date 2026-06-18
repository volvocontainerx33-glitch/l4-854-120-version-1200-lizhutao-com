(function () {
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const summary = document.querySelector('[data-search-summary]');
  const movies = window.MOVIE_INDEX || [];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '" data-card>',
      '  <span class="poster-wrap">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '  </span>',
      '  <span class="card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <em>' + escapeHtml(movie.genre) + '</em>',
      '    <span class="card-line">' + escapeHtml(movie.oneLine) + '</span>',
      '    <span class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>',
      '  </span>',
      '</a>'
    ].join('\n');
  }

  function runSearch(query) {
    const keyword = String(query || '').trim().toLowerCase();

    if (!keyword) {
      results.innerHTML = '';
      summary.textContent = '请输入关键词开始搜索。';
      return;
    }

    const matched = movies.filter(function (movie) {
      const haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ').toLowerCase();
      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 240);

    results.innerHTML = matched.map(card).join('\n');
    summary.textContent = matched.length ? '搜索结果' : '没有找到匹配影片，请换一个关键词。';
  }

  if (form && input) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    input.value = initial;
    runSearch(initial);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const query = input.value.trim();
      const url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      runSearch(query);
    });

    input.addEventListener('input', function () {
      runSearch(input.value);
    });
  }
})();
