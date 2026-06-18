(function () {
  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var localSearch = document.querySelector('[data-local-search]');
  var localList = document.querySelector('[data-local-list]');
  var localSelects = Array.prototype.slice.call(document.querySelectorAll('[data-local-select]'));

  function applyLocalFilter() {
    if (!localList) {
      return;
    }

    var keyword = localSearch ? localSearch.value.trim().toLowerCase() : '';
    var year = '';
    var genre = '';

    localSelects.forEach(function (select) {
      if (select.getAttribute('data-local-select') === 'year') {
        year = select.value;
      }

      if (select.getAttribute('data-local-select') === 'genre') {
        genre = select.value;
      }
    });

    var cards = Array.prototype.slice.call(localList.querySelectorAll('[data-movie-card]'));

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();

      var cardYear = card.getAttribute('data-year') || '';
      var cardGenre = card.getAttribute('data-genre') || '';
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (genre && cardGenre.indexOf(genre) === -1) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
    });
  }

  if (localSearch) {
    localSearch.addEventListener('input', applyLocalFilter);
  }

  localSelects.forEach(function (select) {
    select.addEventListener('change', applyLocalFilter);
  });
})();
