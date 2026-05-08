/* ==========================================================================
   polish.js — subtle motion bootstrap for the abrnoc.com static clone.
   Adds .reveal classes to major sections, observes them with
   IntersectionObserver, and runs a one-shot count-up on visible numeric stats.
   Honors prefers-reduced-motion: reduce by bailing out entirely.
   ========================================================================== */
(function () {
  'use strict';

  // Bail out for users who prefer reduced motion.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    // ---------- 1. Tag sections + their card children with .reveal ----------
    // Top-level reveal targets — full sections fade up as you reach them.
    var sectionSelectors = [
      '#section-hero .hero-info',
      '#section-hero .hero-img',
      '#section-services .services__header',
      '#section-services .services__header-info',
      '#section-services .services__item',
      '#section-choose .choose__img',
      '#section-choose .choose__info',
      '#section-request_cta .request_cta',
      '#section-map .map-header',
      '#section-map .map-img',
      '#section-who .who__header',
      '#section-who .who_we-img',
      '#gallery .gallery__header',
      '#gallery [class^="gallery__item--"]',
      '#section-team .team__header',
      '#section-team .team__body',
      '#section-team .team-memeber__item',
      '#section-join .join__header',
      '#section-join .join__body-item',
      '#section-refer_cta .refer_cta',
      '#section-Customers .testimonials-header',
      '#section-Customers .testimonial-item',
      '[class*="priceCard-module--price-card--"]'
    ];

    sectionSelectors.forEach(function (sel) {
      var nodes = document.querySelectorAll(sel);
      nodes.forEach(function (el, idx) {
        el.classList.add('reveal');
        // Stagger siblings of the same selector — caps at delay-5.
        var delay = Math.min(idx, 5);
        if (delay > 0) {
          el.classList.add('delay-' + delay);
        }
      });
    });

    // ---------- 2. IntersectionObserver: add .in when in view ----------
    var io = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      io.observe(el);
    });

    // ---------- 3. Count-up on visible numeric stats ----------
    // We look for headings containing "More than N" or trailing N+ / N% / N.N%.
    // Pattern: a leading verb ("More than", "Over", "Up to") followed by an
    // integer, OR a number with a + / % suffix at start/end of the heading.
    var statSelectors = ['h1', 'h2', 'h3', '.map-header', '.hero-info--header'];
    var stats = [];

    statSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        // Skip if this element is inside a price card (those numbers are spec
        // values, not animated stats — animating them on every card looks busy).
        if (el.closest('[class*="priceCard-module--"]')) return;
        var text = el.textContent;
        if (!text) return;
        // Match patterns like "More than 15", "Over 99.9%", "10+", "99.9%".
        var m = text.match(/(More than|Over|Up to)\s+(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)([%+])/i);
        if (!m) return;

        var numStr, suffix;
        if (m[2]) {
          numStr = m[2];
          suffix = '';
        } else {
          numStr = m[3];
          suffix = m[4] || '';
        }
        var target = parseFloat(numStr);
        if (!isFinite(target) || target <= 0) return;

        // Wrap the matched number+suffix in a span we can animate without
        // disturbing surrounding text.
        var fullMatch = m[0];
        var html = el.innerHTML;
        // Be conservative: only proceed if the match appears once in textContent
        // and we can find a safe replace target in innerHTML.
        if (html.indexOf(fullMatch) === -1) return;

        // Decimal places: preserve original if it had any.
        var decimals = (numStr.split('.')[1] || '').length;
        var startText = (decimals > 0 ? (0).toFixed(decimals) : '0') + suffix;

        // Reconstruct the matched chunk with the numeric portion wrapped.
        var wrappedNumber = '<span class="polish-count" data-target="' + target +
          '" data-decimals="' + decimals +
          '" data-suffix="' + suffix + '">' + startText + '</span>';
        var wrappedMatch;
        if (m[2]) {
          // "More than 15" -> "More than <span>0</span>"
          wrappedMatch = m[1] + ' ' + wrappedNumber;
        } else {
          // "15+" or "99.9%" -> "<span>0+</span>"
          wrappedMatch = wrappedNumber;
        }
        el.innerHTML = html.replace(fullMatch, wrappedMatch);

        // The spans we just inserted are the new animation targets.
        el.querySelectorAll('.polish-count').forEach(function (span) {
          stats.push(span);
        });
      });
    });

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animateCount(span) {
      var target = parseFloat(span.getAttribute('data-target'));
      var decimals = parseInt(span.getAttribute('data-decimals') || '0', 10);
      var suffix = span.getAttribute('data-suffix') || '';
      var duration = 1200;
      var startTime = null;

      function frame(now) {
        if (startTime === null) startTime = now;
        var elapsed = now - startTime;
        var t = Math.min(1, elapsed / duration);
        var eased = easeOutQuart(t);
        var value = target * eased;
        span.textContent = (decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()) + suffix;
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          span.textContent = (decimals > 0 ? target.toFixed(decimals) : target.toString()) + suffix;
        }
      }
      requestAnimationFrame(frame);
    }

    if (stats.length > 0) {
      var countIO = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.5 }
      );
      stats.forEach(function (s) { countIO.observe(s); });
    }
  });
})();
