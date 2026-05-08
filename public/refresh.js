/* ==========================================================================
   refresh.js — 2026 visual refresh JS layer for the abrnoc.com static clone.
   Runs after hydrate.js and polish.js, so it can rely on the navbar's scroll
   class, the populated team list, and the polish.css reveal scaffolding.

   What it does:
     1. Persists / applies a dark-mode preference (localStorage 'abrnoc-theme').
     2. Renders a floating theme-toggle button (top-right, fixed, 44px round).
     3. Renders a 3px gradient scroll-progress bar at the top.
     4. Sprinkles 5 extra pulsing dots over the world map (CSS does the pulse).

   Cursor-following effects (magnetic buttons + cursor accent dot) were
   removed at the user's request.

   All motion is gated by prefers-reduced-motion: reduce — when that is set,
   the toggle + theme persistence still work, but the scroll bar and mesh
   gradient are skipped.
   ========================================================================== */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  var STORAGE_KEY = 'abrnoc-theme';
  var prefersReduced =
    !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasHover =
    !!(window.matchMedia && window.matchMedia('(hover: hover)').matches);

  // ── Theme: read & apply as early as possible (before DOMContentLoaded). ──
  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }

  function readStoredTheme() {
    try {
      var v = window.localStorage.getItem(STORAGE_KEY);
      if (v === 'dark' || v === 'light') return v;
    } catch (_) { /* localStorage may be blocked */ }
    return null;
  }

  // Apply right away so first paint matches preference.
  var initialTheme = readStoredTheme() ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(initialTheme);

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  // ── 1. Floating theme-toggle button ──────────────────────────────────────
  function mountThemeToggle() {
    if (document.querySelector('.refresh-theme-toggle')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'refresh-theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.innerHTML =
      '<svg class="refresh-icon-sun"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>' +
      '<svg class="refresh-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>';
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { window.localStorage.setItem(STORAGE_KEY, next); } catch (_) { /* noop */ }
    });
    document.body.appendChild(btn);
  }

  // ── 2. Scroll progress bar ───────────────────────────────────────────────
  function mountScrollBar() {
    if (prefersReduced) return;
    if (document.querySelector('.refresh-scrollbar')) return;
    var bar = document.createElement('div');
    bar.className = 'refresh-scrollbar';
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - doc.clientHeight) || 1;
      var pct = Math.min(1, Math.max(0, window.scrollY / max));
      bar.style.transform = 'scaleX(' + pct + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  // ── 3. Extra pulsing map dots ────────────────────────────────────────────
  function mountMapDots() {
    var map = document.querySelector('#section-map .map');
    if (!map) return;
    if (map.querySelector('.refresh-mapdot')) return;
    // CSS handles 2 dots via ::before/::after. Add 5 more via JS.
    // Coordinates are % within the .map container — chosen to land roughly
    // over Europe / Americas / SE Asia / Oceania / Middle East on the SVG.
    var dots = [
      { top: '46%', left: '12%', cls: 'refresh-mapdot--cyan'   },
      { top: '52%', left: '34%', cls: 'refresh-mapdot--orange' },
      { top: '40%', left: '74%', cls: 'refresh-mapdot--navy'   },
      { top: '60%', left: '86%', cls: 'refresh-mapdot--cyan'   },
      { top: '64%', left: '48%', cls: 'refresh-mapdot--navy'   }
    ];
    dots.forEach(function (d) {
      var el = document.createElement('span');
      el.className = 'refresh-mapdot ' + d.cls;
      el.style.top  = d.top;
      el.style.left = d.left;
      map.appendChild(el);
    });
  }

  ready(function () {
    try { mountThemeToggle();     } catch (_) {}
    try { mountScrollBar();       } catch (_) {}
    try { mountMapDots();         } catch (_) {}
  });
})();
