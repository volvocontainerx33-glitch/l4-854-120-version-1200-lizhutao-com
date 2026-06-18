import { movies } from './movies-data.js';

const form = document.querySelector('[data-search-page-form]');
const input = form ? form.querySelector('input[name="q"]') : null;
const results = document.querySelector('[data-search-results]');
const summary = document.querySelector('[data-search-summary]');
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get('q') || '';

if (input) {
  input.value = initialQuery;
}

const escapeHtml = function (value) {
  return String(value || '').replace(/[&<>"]/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char];
  });
};

const cardHtml = function (movie) {
  const tags = String(movie.genre || movie.tags || '')
    .split(/[,，、/／]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(function (tag) {
      return '<span>' + escapeHtml(tag.trim()) + '</span>';
    })
    .join('');

  return `
<article class="movie-card">
  <a class="poster-link" href="${escapeHtml(movie.detail)}" aria-label="查看 ${escapeHtml(movie.title)}">
    <img src="${escapeHtml(movie.image)}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="poster-play">▶</span>
  </a>
  <div class="movie-card-body">
    <div class="movie-meta"><span>${escapeHtml(movie.year)}</span><span>${escapeHtml(movie.region)}</span><span>${escapeHtml(movie.type)}</span></div>
    <h3><a href="${escapeHtml(movie.detail)}">${escapeHtml(movie.title)}</a></h3>
    <p>${escapeHtml(movie.oneLine)}</p>
    <div class="tag-row">${tags}</div>
  </div>
</article>`;
};

const runSearch = function (query) {
  const q = String(query || '').trim().toLowerCase();

  if (!q) {
    if (summary) {
      summary.textContent = '请输入关键词开始搜索。';
    }
    if (results) {
      results.innerHTML = movies.slice(0, 24).map(cardHtml).join('');
    }
    return;
  }

  const matched = movies.filter(function (movie) {
    return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
      .join(' ')
      .toLowerCase()
      .indexOf(q) >= 0;
  });

  if (summary) {
    summary.textContent = matched.length > 0 ? '搜索结果已更新，可点击影片进入详情。' : '没有匹配结果，请更换关键词。';
  }
  if (results) {
    results.innerHTML = matched.slice(0, 120).map(cardHtml).join('');
  }
};

if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const value = input ? input.value : '';
    const url = new URL(window.location.href);
    if (value.trim()) {
      url.searchParams.set('q', value.trim());
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
    runSearch(value);
  });
}

runSearch(initialQuery);
