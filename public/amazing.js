/* ==========================================================================
   amazing.js — 2026 product-site upgrade JS layer.

   Loads AFTER hydrate.js, polish.js, and refresh.js.  Reads the now-fully-
   hydrated DOM (team list rendered, .colorChange logic active, theme toggle
   mounted, scroll bar mounted) and adds:

     1. (n/a — JS bundle stripping is done at build time in index.astro.)
     2. Stats ticker band beneath the hero.
     3. (Globe removed at user's request — original .map-img stays.)
     4. Mock product UI panels into each .services__item.
     5. Scroll-driven hero parallax via CSS variable on #section-hero.

   Motion gates: a JS prefersReduced flag short-circuits the parallax loop
   and the ticker re-roll cadence.  Visuals (stats values, mock panels)
   still render under reduced motion — only the animation stops.
   ========================================================================== */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  var prefersReduced =
    !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  // Tiny SVG icon helper.
  function svg(d, opts) {
    opts = opts || {};
    var stroke = opts.stroke || 'currentColor';
    var size = opts.size || 14;
    return (
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' +
      stroke +
      '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      d +
      '</svg>'
    );
  }

  // ── 2. STATS TICKER ──────────────────────────────────────────────────────
  function mountStats() {
    var hero = document.getElementById('section-hero');
    if (!hero) return;
    if (document.querySelector('.amazing-stats')) return;

    // Insert AFTER the hero section so the ticker sits visually between
    // hero and the next section. We also negative-margin it up via CSS so
    // it slightly overlaps the hero bottom edge.
    var band = document.createElement('div');
    band.className = 'amazing-stats';
    band.setAttribute('role', 'status');
    band.setAttribute('aria-live', 'polite');
    band.innerHTML = [
      '<div class="amazing-stats__cell amazing-stats__cell--live">',
      '  <span class="amazing-stats__label">Servers Online</span>',
      '  <span class="amazing-stats__value" data-stat="servers">0</span>',
      '</div>',
      '<div class="amazing-stats__cell">',
      '  <span class="amazing-stats__label">Bandwidth Today</span>',
      '  <span class="amazing-stats__value" data-stat="bandwidth">0<span class="amazing-stats__value-suffix">TB</span></span>',
      '</div>',
      '<div class="amazing-stats__cell">',
      '  <span class="amazing-stats__label">Customers</span>',
      '  <span class="amazing-stats__value" data-stat="customers">0</span>',
      '</div>',
      '<div class="amazing-stats__cell">',
      '  <span class="amazing-stats__label">Uptime SLA</span>',
      '  <span class="amazing-stats__value" data-stat="uptime">0<span class="amazing-stats__value-suffix">%</span></span>',
      '</div>'
    ].join('');

    if (hero.parentNode) hero.parentNode.insertBefore(band, hero.nextSibling);

    // Format numbers with commas.
    function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
    function fmtBW(n) { return n.toFixed(1); }

    function snapshot() {
      var jitter = function (range) { return (Math.random() * 2 - 1) * range; };
      return {
        servers:    12400 + Math.round(jitter(28)),
        bandwidth: 184.2 + jitter(0.30),
        customers:  8710 + Math.round(jitter(3)),
        uptime:    99.98
      };
    }

    function setVal(node, html) {
      if (!node) return;
      // soft fade swap
      node.classList.add('is-fading');
      setTimeout(function () {
        node.innerHTML = html;
        node.classList.remove('is-fading');
      }, 220);
    }

    function paint(initial) {
      var s = snapshot();
      setVal(band.querySelector('[data-stat="servers"]'),    fmt(s.servers));
      setVal(band.querySelector('[data-stat="bandwidth"]'),  fmtBW(s.bandwidth) + '<span class="amazing-stats__value-suffix">TB</span>');
      setVal(band.querySelector('[data-stat="customers"]'),  fmt(s.customers));
      setVal(band.querySelector('[data-stat="uptime"]'),     s.uptime.toFixed(2) + '<span class="amazing-stats__value-suffix">%</span>');
      if (initial) {
        // first render: skip the fade
        var nodes = band.querySelectorAll('.amazing-stats__value');
        for (var i = 0; i < nodes.length; i++) nodes[i].classList.remove('is-fading');
      }
    }

    paint(true);

    if (!prefersReduced) {
      var loop = function () {
        paint(false);
        var next = 4000 + Math.random() * 4000; // 4–8s
        setTimeout(loop, next);
      };
      setTimeout(loop, 5000);
    }
  }


  // ── 4. SERVICES MOCK PRODUCT UI ──────────────────────────────────────────
  function buildComputeMock() {
    var rows = [
      { name: 'web-prod-01',  region: 'fra · 8 vCPU · 16 GB',  ping: '14 ms' },
      { name: 'api-prod-02',  region: 'ams · 4 vCPU · 8 GB',   ping: '11 ms' },
      { name: 'db-replica-3', region: 'lhr · 16 vCPU · 64 GB', ping: '22 ms' }
    ];
    return [
      '<div class="amazing-mock amazing-mock--compute">',
      '  <div class="amazing-mock__chrome">',
      '    <span class="amazing-mock__dot amazing-mock__dot--r"></span>',
      '    <span class="amazing-mock__dot amazing-mock__dot--y"></span>',
      '    <span class="amazing-mock__dot amazing-mock__dot--g"></span>',
      '    <span class="amazing-mock__title">VM Console</span>',
      '  </div>',
      '  <div class="amazing-mock__rows">',
      rows.map(function (r) {
        return [
          '<div class="amazing-mock-vm">',
          '  <span class="amazing-mock-vm__status"></span>',
          '  <span><span class="amazing-mock-vm__name">' + r.name + '</span><br>',
          '    <span class="amazing-mock-vm__meta">' + r.region + '</span></span>',
          '  <span class="amazing-mock-vm__ping">' + r.ping + '</span>',
          '</div>'
        ].join('');
      }).join(''),
      '  </div>',
      '</div>'
    ].join('');
  }

  function buildStorageMock() {
    var bars = [
      { label: 'Block Storage', used: '4.2 TB / 8 TB', pct: 52 },
      { label: 'Object Buckets', used: '1.7 TB / 5 TB', pct: 34 },
      { label: 'Snapshots',      used: '0.9 TB / 3 TB', pct: 30 }
    ];
    return [
      '<div class="amazing-mock amazing-mock--storage">',
      '  <div class="amazing-mock__chrome">',
      '    <span class="amazing-mock__dot amazing-mock__dot--r"></span>',
      '    <span class="amazing-mock__dot amazing-mock__dot--y"></span>',
      '    <span class="amazing-mock__dot amazing-mock__dot--g"></span>',
      '    <span class="amazing-mock__title">Storage Usage</span>',
      '  </div>',
      '  <div class="amazing-mock__rows">',
      bars.map(function (b) {
        return [
          '<div class="amazing-mock-bar">',
          '  <div class="amazing-mock-bar__head">',
          '    <span class="amazing-mock-bar__label">' + b.label + '</span>',
          '    <span class="amazing-mock-bar__value">' + b.used + '</span>',
          '  </div>',
          '  <div class="amazing-mock-bar__track">',
          '    <span class="amazing-mock-bar__fill" data-target="' + b.pct + '"></span>',
          '  </div>',
          '</div>'
        ].join('');
      }).join(''),
      '  </div>',
      '  <div class="amazing-mock__total">',
      '    <span>Allocated</span><b>6.8 TB / 16 TB</b>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function buildBillingMock() {
    var cols = [22, 36, 28, 48, 41, 56, 64, 52, 70, 62, 78, 84];
    return [
      '<div class="amazing-mock amazing-mock--billing">',
      '  <div class="amazing-mock__chrome">',
      '    <span class="amazing-mock__dot amazing-mock__dot--r"></span>',
      '    <span class="amazing-mock__dot amazing-mock__dot--y"></span>',
      '    <span class="amazing-mock__dot amazing-mock__dot--g"></span>',
      '    <span class="amazing-mock__title">Billing · Q2</span>',
      '  </div>',
      '  <div class="amazing-mock__chart">',
      cols.map(function (h, i) {
        var cls = i === cols.length - 1 ? 'amazing-mock-bar-col is-current' : 'amazing-mock-bar-col';
        return '<span class="' + cls + '" style="height:' + h + '%"></span>';
      }).join(''),
      '  </div>',
      '  <div class="amazing-mock__rows">',
      '    <div class="amazing-mock-invoice">',
      '      <span class="amazing-mock-invoice__name">INV-2026-04812</span>',
      '      <span class="amazing-mock-invoice__amount">$2,184.00</span>',
      '      <span class="amazing-mock-invoice__pill">Paid</span>',
      '    </div>',
      '    <div class="amazing-mock-invoice">',
      '      <span class="amazing-mock-invoice__name">INV-2026-04813</span>',
      '      <span class="amazing-mock-invoice__amount">$1,724.50</span>',
      '      <span class="amazing-mock-invoice__pill">Paid</span>',
      '    </div>',
      '    <div class="amazing-mock-invoice">',
      '      <span class="amazing-mock-invoice__name">INV-2026-04814</span>',
      '      <span class="amazing-mock-invoice__amount">$3,062.10</span>',
      '      <span class="amazing-mock-invoice__pill amazing-mock-invoice__pill--scheduled">Auto</span>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function mountServiceMocks() {
    var section = document.getElementById('section-services');
    if (!section) return;
    if (section.classList.contains('amazing-services-enhanced')) return;
    var items = section.querySelectorAll('.services__item');
    if (!items || !items.length) return;

    section.classList.add('amazing-services-enhanced');

    // Map: 1st card = compute, 2nd = storage, 3rd = billing.  The original
    // markup in source-snapshot/index.html only shows TWO services rendered
    // (Cloud Compute, Cloud Storage) — but the brief mentions a 3rd
    // "Server Billing" card.  If only 2 exist we ALSO inject a 3rd
    // services__item synthetically so the section is balanced.
    var mocks = [buildComputeMock, buildStorageMock, buildBillingMock];
    var labels = [
      { name: 'Cloud Compute Solutions',  hint: 'Spin up servers, scale on demand.', icon: 'M3 12h18M3 6h18M3 18h18' },
      { name: 'Cloud Storage Solutions',  hint: 'Object & block storage, on tap.',   icon: 'M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4 9-4M12 11v10' },
      { name: 'Server Billing Automation', hint: 'Invoices, taxes, & reconciliation.', icon: 'M4 4h16v16H4zM4 9h16M9 14h6' }
    ];

    var existing = Array.prototype.slice.call(items);

    // For each existing card, inject the matching mock.
    existing.forEach(function (card, idx) {
      if (idx >= mocks.length) return;
      // Avoid double injection.
      if (card.querySelector('.amazing-mock')) return;
      var html = mocks[idx]();
      card.insertAdjacentHTML('beforeend', html);
    });

    // If the source HTML has fewer than 3 services items, build the rest.
    if (existing.length < 3) {
      var itemsContainer = section.querySelector('.services__items') || section;
      for (var i = existing.length; i < 3; i++) {
        var card = document.createElement('div');
        card.className = 'services__item amazing-services-extra';
        var labelInfo = labels[i];
        // Inline SVG icon so we don't need a new asset.
        var iconSvg =
          '<svg class="services__item-img" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="' + labelInfo.icon + '"></path></svg>';
        card.innerHTML =
          iconSvg +
          '<h5 class="services__item-name">' + labelInfo.name + '</h5>' +
          mocks[i]();
        itemsContainer.appendChild(card);
      }
    }

    // Animate storage bars after a short tick.
    if (!prefersReduced) {
      requestAnimationFrame(function () {
        setTimeout(function () {
          section.querySelectorAll('.amazing-mock-bar__fill').forEach(function (el) {
            var pct = el.getAttribute('data-target');
            if (pct) el.style.width = pct + '%';
          });
        }, 350);
      });
    } else {
      section.querySelectorAll('.amazing-mock-bar__fill').forEach(function (el) {
        var pct = el.getAttribute('data-target');
        if (pct) el.style.width = pct + '%';
      });
    }
  }

  // ── 5. HERO PARALLAX ─────────────────────────────────────────────────────
  function mountParallax() {
    if (prefersReduced) return;
    var hero = document.getElementById('section-hero');
    if (!hero) return;

    var ticking = false;
    var lastP = 0;

    function update() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      var heroHeight = rect.height || 1;
      // Progress: 0 when top of hero at viewport top, 1 when bottom of hero at viewport top.
      var raw = (-rect.top) / heroHeight;
      var p = Math.max(0, Math.min(1, raw));
      if (Math.abs(p - lastP) < 0.005) return;
      lastP = p;
      hero.style.setProperty('--p', p.toFixed(3));
      if (p > 0.001) hero.classList.add('amazing-parallaxing');
      else hero.classList.remove('amazing-parallaxing');
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  // ── 6. GALLERY LIGHTBOX ──────────────────────────────────────────────────
  function mountGalleryLightbox() {
    var imgs = Array.prototype.slice.call(document.querySelectorAll('.gallery__img'));
    if (imgs.length === 0) return;
    if (document.querySelector('.amazing-lightbox')) return;

    var box = document.createElement('div');
    box.className = 'amazing-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Gallery image viewer');
    box.innerHTML =
      '<button class="amazing-lightbox__btn amazing-lightbox__close" aria-label="Close">&times;</button>' +
      '<button class="amazing-lightbox__btn amazing-lightbox__nav amazing-lightbox__nav--prev" aria-label="Previous image">&#x2039;</button>' +
      '<img class="amazing-lightbox__img" alt="">' +
      '<button class="amazing-lightbox__btn amazing-lightbox__nav amazing-lightbox__nav--next" aria-label="Next image">&#x203A;</button>' +
      '<div class="amazing-lightbox__counter"></div>';
    document.body.appendChild(box);

    var picture  = box.querySelector('.amazing-lightbox__img');
    var counter  = box.querySelector('.amazing-lightbox__counter');
    var btnClose = box.querySelector('.amazing-lightbox__close');
    var btnPrev  = box.querySelector('.amazing-lightbox__nav--prev');
    var btnNext  = box.querySelector('.amazing-lightbox__nav--next');
    var current  = 0;

    function open(i) {
      current = ((i % imgs.length) + imgs.length) % imgs.length;
      picture.src = imgs[current].src;
      picture.alt = imgs[current].alt || '';
      counter.textContent = (current + 1) + ' / ' + imgs.length;
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    function step(d) { open(current + d); }

    imgs.forEach(function (im, idx) {
      im.style.cursor = 'zoom-in';
      im.addEventListener('click', function () { open(idx); });
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    btnNext.addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape')         close();
      else if (e.key === 'ArrowLeft')  step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }

  // ── 7. HERO CLI MOCK ─────────────────────────────────────────────────────
  function mountCliMock() {
    var section = document.getElementById('section-hero');
    if (!section) return;
    var heroInfo = section.querySelector('.hero-info');
    if (!heroInfo) return;
    if (heroInfo.querySelector('.amazing-cli')) return;
    // Skip on viewports too narrow to fit (CSS also hides via @media).
    if (window.innerWidth < 1100) return;

    var card = document.createElement('div');
    card.className = 'amazing-cli';
    card.innerHTML =
      '<div class="amazing-cli__chrome">' +
      '  <span class="amazing-cli__dot amazing-cli__dot--r"></span>' +
      '  <span class="amazing-cli__dot amazing-cli__dot--y"></span>' +
      '  <span class="amazing-cli__dot amazing-cli__dot--g"></span>' +
      '  <span class="amazing-cli__title">~ provision</span>' +
      '</div>' +
      '<div class="amazing-cli__body">' +
      '  <span class="amazing-cli__line">' +
      '    <span class="amazing-cli__prompt">$</span>' +
      '    <span class="amazing-cli__cmd"></span>' +
      '    <span class="amazing-cli__caret"></span>' +
      '  </span>' +
      '  <div class="amazing-cli__output"></div>' +
      '</div>';
    heroInfo.appendChild(card);

    // Fade card in as soon as it's mounted.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { card.classList.add('is-in'); });
    });

    var rawCmd = 'abrnoc instance create --region tehran-1 --plan compute-4x';
    var highlightedHtml =
      'abrnoc instance create ' +
      '<span class="flag">--region</span> <span class="arg">tehran-1</span> ' +
      '<span class="flag">--plan</span> <span class="arg">compute-4x</span>';

    var outputLines = [
      '<span class="ok">&#10003;</span><span class="key">instance</span><span class="val">i-7f2a8b4c</span>',
      '<span class="ok">&#10003;</span><span class="key">ip</span><span class="val">14.218.92.10</span>',
      '<span class="ok">&#10003;</span><span class="key">ready in</span><span class="val">38s</span>'
    ];

    var cmdEl    = card.querySelector('.amazing-cli__cmd');
    var caret    = card.querySelector('.amazing-cli__caret');
    var outputEl = card.querySelector('.amazing-cli__output');

    function fillStatic() {
      cmdEl.innerHTML = highlightedHtml;
      if (caret) caret.style.display = 'none';
      outputEl.innerHTML = outputLines.map(function (l) { return '<div>' + l + '</div>'; }).join('');
    }

    if (prefersReduced) { fillStatic(); return; }

    var typed = false;
    function startType() {
      if (typed) return;
      typed = true;
      var i = 0;
      (function tick() {
        if (i >= rawCmd.length) return finishType();
        cmdEl.textContent += rawCmd.charAt(i++);
        setTimeout(tick, 28 + Math.random() * 50);
      })();
    }
    function finishType() {
      cmdEl.innerHTML = highlightedHtml;
      setTimeout(function () {
        if (caret) caret.style.display = 'none';
        outputLines.forEach(function (html, idx) {
          setTimeout(function () {
            var line = document.createElement('div');
            line.innerHTML = html;
            line.style.opacity = '0';
            line.style.transition = 'opacity 0.32s ease';
            outputEl.appendChild(line);
            requestAnimationFrame(function () { line.style.opacity = '1'; });
          }, idx * 380);
        });
      }, 350);
    }

    // Start typing as soon as the card scrolls into view (or immediately if already in).
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { startType(); io.disconnect(); }
        });
      }, { threshold: 0.25 });
      io.observe(card);
    } else {
      startType();
    }
  }

  // ── boot ─────────────────────────────────────────────────────────────────
  ready(function () {
    try { mountStats();            } catch (e) { console && console.warn && console.warn('[amazing] stats:', e); }
    try { mountServiceMocks();     } catch (e) { console && console.warn && console.warn('[amazing] services:', e); }
    try { mountParallax();         } catch (e) { console && console.warn && console.warn('[amazing] parallax:', e); }
    try { mountGalleryLightbox(); } catch (e) { console && console.warn && console.warn('[amazing] gallery:', e); }
    try { mountCliMock();          } catch (e) { console && console.warn && console.warn('[amazing] cli:', e); }
    try { window.__amazingReady = true; } catch (_) {}
  });
})();
