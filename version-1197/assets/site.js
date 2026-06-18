(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyImageFallbacks() {
    document.querySelectorAll("img[data-fallback]").forEach(function (image) {
      image.addEventListener("error", function () {
        image.hidden = true;
        var holder = image.closest(".media-fallback");
        if (holder) {
          holder.classList.add("is-missing");
        }
      });
    });
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupFiltering() {
    var input = document.querySelector("[data-page-filter]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }

    if (input.hasAttribute("data-read-query")) {
      var query = new URLSearchParams(window.location.search).get("q");
      if (query) {
        input.value = query;
      }
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search-card]"));

    function filterCards() {
      var terms = normalize(input.value).split(/\s+/).filter(Boolean);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-filter-text"));
        var matched = terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
        card.classList.toggle("is-hidden", terms.length > 0 && !matched);
      });
    }

    input.addEventListener("input", filterCards);
    filterCards();
  }

  function setupQuickFilters() {
    document.querySelectorAll("[data-quick-filter] [data-term]").forEach(function (button) {
      button.addEventListener("click", function () {
        var input = document.querySelector("[data-page-filter]");
        if (!input) {
          return;
        }
        input.value = button.getAttribute("data-term") || "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
      });
    });
  }

  ready(function () {
    applyImageFallbacks();
    setupNavigation();
    setupFiltering();
    setupQuickFilters();
  });
})();
