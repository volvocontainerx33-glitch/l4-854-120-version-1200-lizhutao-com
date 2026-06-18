(function () {
    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-main-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearchAndFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-movie-search]"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-field]"));
        if (!inputs.length && !buttons.length) {
            return;
        }
        var state = {};

        function allItems() {
            return Array.prototype.slice.call(document.querySelectorAll("[data-movie-list] .movie-card, [data-movie-list] .rank-item"));
        }

        function matchesText(item, query) {
            if (!query) {
                return true;
            }
            var content = [
                item.getAttribute("data-title"),
                item.getAttribute("data-region"),
                item.getAttribute("data-year"),
                item.getAttribute("data-genre"),
                item.getAttribute("data-tags")
            ].map(normalize).join(" ");
            return content.indexOf(query) !== -1;
        }

        function matchesFilters(item) {
            return Object.keys(state).every(function (field) {
                var value = state[field];
                if (!value) {
                    return true;
                }
                return normalize(item.getAttribute("data-" + field)).indexOf(normalize(value)) !== -1;
            });
        }

        function apply() {
            var query = normalize(inputs.map(function (input) {
                return input.value;
            }).find(function (value) {
                return value && value.trim();
            }) || "");
            allItems().forEach(function (item) {
                var visible = matchesText(item, query) && matchesFilters(item);
                item.classList.toggle("is-search-hidden", !visible);
            });
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", apply);
        });
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var field = button.getAttribute("data-filter-field");
                var value = button.getAttribute("data-filter-value") || "";
                state[field] = value;
                buttons.filter(function (item) {
                    return item.getAttribute("data-filter-field") === field;
                }).forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });
        apply();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupSearchAndFilters();
    });
})();
