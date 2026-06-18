(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function text(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var opened = mobileNav.hasAttribute("hidden");
                if (opened) {
                    mobileNav.removeAttribute("hidden");
                } else {
                    mobileNav.setAttribute("hidden", "");
                }
                menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        document.querySelectorAll(".site-search, .hero-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./all-movies.html";
                }
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var copies = Array.prototype.slice.call(hero.querySelectorAll(".hero-copy"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var current = 0;
            var timer = null;

            function setHero(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (item, i) {
                    item.classList.toggle("is-active", i === current);
                });
                copies.forEach(function (item, i) {
                    item.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (item, i) {
                    item.classList.toggle("is-active", i === current);
                });
            }

            function startHero() {
                stopHero();
                timer = window.setInterval(function () {
                    setHero(current + 1);
                }, 5200);
            }

            function stopHero() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    setHero(Number(dot.getAttribute("data-hero-index")) || 0);
                    startHero();
                });
            });

            hero.addEventListener("mouseenter", stopHero);
            hero.addEventListener("mouseleave", startHero);
            setHero(0);
            startHero();
        }

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var section = scope.closest("section") || document;
            var input = section.querySelector("[data-filter-input]");
            var buttons = Array.prototype.slice.call(section.querySelectorAll("[data-filter-value]"));
            var empty = section.querySelector("[data-empty]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-card"));
            var params = new URLSearchParams(window.location.search);
            var selected = "";

            function haystack(card) {
                return text([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
            }

            function apply() {
                var query = input ? text(input.value) : "";
                var chip = text(selected);
                var visible = 0;

                cards.forEach(function (card) {
                    var data = haystack(card);
                    var matched = (!query || data.indexOf(query) !== -1) && (!chip || data.indexOf(chip) !== -1);
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    if (visible) {
                        empty.setAttribute("hidden", "");
                    } else {
                        empty.removeAttribute("hidden");
                    }
                }
            }

            if (input) {
                var q = params.get("q") || "";
                if (q) {
                    input.value = q;
                }
                input.addEventListener("input", apply);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    selected = button.getAttribute("data-filter-value") || "";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });

            apply();
        });

        document.querySelectorAll(".player-shell").forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".play-cover");
            var stream = player.getAttribute("data-play");
            var hls = null;
            var loaded = false;

            function load() {
                if (!video || !stream || loaded) {
                    return;
                }
                loaded = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play() {
                load();
                player.classList.add("is-playing");
                var attempt = video.play();
                if (attempt && attempt.catch) {
                    attempt.catch(function () {
                        player.classList.remove("is-playing");
                    });
                }
            }

            if (cover && video) {
                cover.addEventListener("click", play);
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (!video.ended) {
                        player.classList.add("is-playing");
                    }
                });
            }

            window.addEventListener("pagehide", function () {
                if (hls && hls.destroy) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    });
})();
