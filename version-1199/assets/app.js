(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      menuButton.textContent = mobilePanel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || '0'));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 6000);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const keyword = scope.querySelector('[data-filter-keyword]');
    const year = scope.querySelector('[data-filter-year]');
    const type = scope.querySelector('[data-filter-type]');
    const status = scope.querySelector('[data-filter-status]');
    const cards = Array.from(scope.querySelectorAll('.movie-card'));

    const applyFilter = function () {
      const keywordValue = (keyword && keyword.value || '').trim().toLowerCase();
      const yearValue = year && year.value || '';
      const typeValue = type && type.value || '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.year
        ].join(' ').toLowerCase();
        const matchKeyword = !keywordValue || haystack.indexOf(keywordValue) >= 0;
        const matchYear = !yearValue || (card.dataset.year || '').indexOf(yearValue) >= 0;
        const matchType = !typeValue || haystack.indexOf(typeValue.toLowerCase()) >= 0;
        const matched = matchKeyword && matchYear && matchType;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible > 0 ? '当前筛选结果可继续点击进入详情。' : '没有匹配结果，请更换关键词。';
      }
    };

    [keyword, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
