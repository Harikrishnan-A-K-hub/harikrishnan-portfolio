/* =========================================================
   Harikrishnan A K — portfolio behaviour
   Theme, scroll reveal, work previews. No dependencies.
   ========================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Theme ---------- */

  var STORE_KEY = "hak-theme";
  var toggle = document.getElementById("themeToggle");
  var label = document.getElementById("themeLabel");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var isDark = theme === "dark";
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    }
    if (label) {
      label.textContent = isDark ? "Light" : "Dark";
    }
  }

  var stored = null;
  try {
    stored = localStorage.getItem(STORE_KEY);
  } catch (e) {}

  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
  } else {
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORE_KEY, next);
      } catch (e) {}
    });
  }

  /* ---------- Header stuck state ---------- */

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) {
        header.classList.add("is-stuck");
      } else {
        header.classList.remove("is-stuck");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */

  var revealables = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealAll() {
    revealables.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    revealables.forEach(function (el) {
      io.observe(el);
    });
    // safety net: never leave content hidden
    window.setTimeout(revealAll, 2600);
  }

  /* ---------- Work previews ---------- */

  var items = Array.prototype.slice.call(document.querySelectorAll(".work-item"));
  var wideEnough = window.matchMedia("(min-width: 621px)");

  if (finePointer && !reduceMotion && wideEnough.matches) {
    // floating preview follows the cursor
    var preview = document.querySelector(".preview");
    var previewImg = preview ? preview.querySelector(".preview__img") : null;
    var previewName = preview ? preview.querySelector(".preview__name") : null;

    var targetX = 0;
    var targetY = 0;
    var curX = 0;
    var curY = 0;
    var active = false;
    var rafId = null;
    var loadedShots = {};

    function loop() {
      curX += (targetX - curX) * 0.16;
      curY += (targetY - curY) * 0.16;
      if (preview) {
        preview.style.left = curX + "px";
        preview.style.top = curY + "px";
      }
      if (active || Math.abs(targetX - curX) > 0.5 || Math.abs(targetY - curY) > 0.5) {
        rafId = window.requestAnimationFrame(loop);
      } else {
        rafId = null;
      }
    }

    function startLoop() {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(loop);
      }
    }

    items.forEach(function (item) {
      var shot = item.getAttribute("data-shot");
      var name = item.getAttribute("data-name") || "";
      var hue = item.style.getPropertyValue("--h") || "28";

      item.addEventListener("mouseenter", function () {
        if (!preview) return;
        active = true;
        preview.style.setProperty("--h", hue.trim());
        if (previewName) previewName.textContent = name;
        if (previewImg) {
          previewImg.classList.remove("is-loaded");
          if (loadedShots[shot]) {
            previewImg.src = shot;
            previewImg.classList.add("is-loaded");
          } else {
            previewImg.removeAttribute("src");
            var probe = new Image();
            probe.onload = function () {
              loadedShots[shot] = true;
              // only apply if still hovering this item
              if (active && preview.classList.contains("is-visible")) {
                previewImg.src = shot;
                previewImg.classList.add("is-loaded");
              }
            };
            probe.onerror = function () {
              loadedShots[shot] = false;
            };
            probe.src = shot;
          }
        }
        preview.classList.add("is-visible");
        startLoop();
      });

      item.addEventListener("mousemove", function (ev) {
        targetX = ev.clientX;
        targetY = ev.clientY;
        startLoop();
      });

      item.addEventListener("mouseleave", function () {
        active = false;
        if (preview) preview.classList.remove("is-visible");
      });
    });
  }

  // Inline thumbnails appear whenever the thumb is actually shown, which is
  // narrow viewports and touch devices. On a wide desktop the thumb is
  // display:none so nothing is fetched there and no bandwidth is wasted.
  // Native lazy loading defers the offscreen fetches at the browser level.
  (function setupInlineThumbs() {
    var thumbLoad = function (item) {
      var thumb = item.querySelector(".work-item__thumb");
      if (!thumb || thumb.dataset.loaded) return;
      if (getComputedStyle(thumb).display === "none") return;
      var shot = item.getAttribute("data-shot");
      if (!shot) return;
      thumb.dataset.loaded = "1";
      var name = item.getAttribute("data-name") || "";
      if (name && !thumb.querySelector(".work-item__thumb-name")) {
        var lbl = document.createElement("span");
        lbl.className = "work-item__thumb-name";
        lbl.textContent = name;
        thumb.appendChild(lbl);
      }
      var img = new Image();
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("load", function () {
        img.classList.add("is-loaded");
      });
      img.src = shot;
      thumb.appendChild(img);
    };

    var loadAll = function () {
      items.forEach(thumbLoad);
    };

    loadAll();
    // if the viewport crosses the breakpoint, load any thumbs now shown
    if (wideEnough.addEventListener) {
      wideEnough.addEventListener("change", loadAll);
    } else if (wideEnough.addListener) {
      wideEnough.addListener(loadAll);
    }
  })();

  /* ---------- Footer year ---------- */

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
