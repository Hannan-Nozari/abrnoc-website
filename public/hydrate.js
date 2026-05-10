// Make-up-for-no-React layer.
// The original abrnoc.com site is Gatsby+React; the static mirror does not
// rehydrate React, so a couple of behaviors that depend on JS need a small
// vanilla replacement:
//
//   1. The .navbar is transparent by default and only becomes opaque (white)
//      after scroll, via the .colorChange class. The original React component
//      adds/removes that class on scroll. Without it, the sticky nav bleeds
//      through onto every dark section it overlays.
//
//   2. The .team-members container is empty in the static HTML. The original
//      React app populates it from a JSON data source. We inject a static
//      list of team members here so the "Nice to Meet You" section is real.
//
//   3. Swap the "Referral" navbar link for "Contact" pointing at /request/.
//      The /referral/ page was removed; this turns the slot into something
//      useful instead of a 404 link.
//
// Effects 1 & 3 are independent of motion preferences. Effect 2 is content,
// also always runs.

(function () {
  if (typeof window === 'undefined') return;

  const init = () => {
    // ── 1. Nav background on scroll ──────────────────────────────────────
    const nav = document.querySelector('.navbar');
    if (nav) {
      const NAV_THRESHOLD = 80;
      const update = () => {
        if (window.scrollY > NAV_THRESHOLD) nav.classList.add('colorChange');
        else nav.classList.remove('colorChange');
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
    }

    // ── 1b. Replace "Referral" → "Contact" (/request/) in the navbar ─────
    // The /referral/ page was removed; rather than leave a dead link, repurpose
    // the menu slot as a Contact link to the existing /request/ form page.
    const refLink = document.querySelector('a.page_links[href="/referral/"], a.page_links_active[href="/referral/"]');
    if (refLink) {
      refLink.textContent = 'Contact';
      refLink.title = 'Contact';
      refLink.setAttribute('href', '/request/');
    }

    // ── 1c. Same swap in the footer ──────────────────────────────────────
    document.querySelectorAll('.footer-links a[href="/referral/"]').forEach((a) => {
      a.textContent = 'Contact';
      a.title = 'Contact';
      a.setAttribute('href', '/request/');
    });

    // ── 1d. Auto-update the copyright year so it's never stale ──────────
    const copyP = document.querySelector('.footer-copyright p');
    if (copyP) {
      const yr = new Date().getFullYear();
      copyP.innerHTML = '&copy; ' + yr + ' abrNOC. All rights reserved.';
    }

    // ── 1c. Logo wordmark theme swap ─────────────────────────────────────
    // The bundled SVG logo paints the "abrNOC" wordmark with fill="#182126"
    // (near-black) which disappears against the dark theme. We pre-compute a
    // white-wordmark variant of the SAME SVG and swap the <img>'s data URI
    // whenever data-theme on <html> changes.
    const logoImg = document.querySelector('.site-branding img');
    if (logoImg && logoImg.src.indexOf('data:image/svg+xml;base64,') === 0) {
      const originalSrc = logoImg.src;
      let darkSrc = null;
      try {
        const b64    = originalSrc.split('base64,')[1];
        const svg    = atob(b64);
        const reFill = svg.replace(/fill="#182126"/g, 'fill="#F9FAFB"');
        darkSrc = 'data:image/svg+xml;base64,' + btoa(reFill);
      } catch (e) { /* base64/atob failed — leave logo as-is */ }

      if (darkSrc) {
        const applyLogoTheme = () => {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          logoImg.src = isDark ? darkSrc : originalSrc;
        };
        applyLogoTheme();
        new MutationObserver(applyLogoTheme).observe(
          document.documentElement,
          { attributes: true, attributeFilter: ['data-theme'] }
        );
      }
    }

    // ── 2. Team members ──────────────────────────────────────────────────
    // Real team data scraped from the production Gatsby bundle. Photos are
    // mirrored to /static/ on this VPS. Hover swaps to the second photo via
    // existing CSS (.team-member:hover .team-member__img--hover { opacity: 1 }).
    const teamContainer = document.querySelector('.team-members');
    if (teamContainer && !teamContainer.querySelector('.team-member')) {
      const team = [
        { name: 'Aref',     jobTitle: 'Senior Data Analyst',         defaultImg: '/static/aref-e247fd31d2014513094b2bc2e4c5a4c5.png',                 hoverImg: '/static/aref__hover-6516d824ff5603564a9abbeb15d4e56f.png' },
        { name: 'Tina',     jobTitle: 'Office Manager & HR',         defaultImg: '/static/tina-default-e69ee87efbaa2551e16cc7b664d98b7a.png',         hoverImg: '/static/tina-hover-cc957a23c29bc9244a44c81c48c92c98.png' },
        { name: 'Ali',      jobTitle: 'Junior Frontend Developer',   defaultImg: '/static/ali_tadayoni-883f36ecbeaf6a5a491e20a52e5be853.png',         hoverImg: '/static/ali_tadayoni__hover-e7c3b7ae519c49fb3ab611a53ec20edf.png' },
        { name: 'Reza',     jobTitle: 'Cloud Engineer',              defaultImg: '/static/mohammadreza-788225d5221849a34ac7b3124176bb2d.png',         hoverImg: '/static/mohammadreza_hover-6e6ee3322084b1cc168cdc956ed7f899.png' },
        { name: 'Ozra',     jobTitle: 'Facility Worker',             defaultImg: '/static/ozra-18e08bfa132d5e8141a7fe9da305b6ad.png',                 hoverImg: '/static/ozra_hover-93366b3973c56bc4e3ed71198b3a511f.png' },
        { name: 'Farid',    jobTitle: 'Frontend Developer',          defaultImg: '/static/farid-aa3e8913dc451cebaea7c3c289a90728.png',                hoverImg: '/static/farid__hover-82197b19a22e7e9dc1b6403414d90341.png' },
        { name: 'Setareh',  jobTitle: 'Product Manager Assistant',   defaultImg: '/static/setareh-331ac06ff3e8411936f39c04c082e89b.png',              hoverImg: '/static/setareh__hover-ec01e2345e0b42413392ed88bcd8441c.png' },
        { name: 'Mohammad', jobTitle: 'Customer Support',            defaultImg: '/static/MohammadSup%20-%20default-ebf6fd054c73a51374e9cd560ab32aea.png', hoverImg: '/static/MohammadSup%20-%20hover-3d05090ecd4b136885643a06bce055d4.png' },
        { name: 'Farangis', jobTitle: 'Chief Happiness Officer',     defaultImg: '/static/farangis-ea57ff45bdc95f1c2d29863ecb634269.png',             hoverImg: '/static/farangis__hover-c4c37237dbfd194ded183cb5c660f2e6.png' }
      ];

      const escapeAttr = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

      teamContainer.innerHTML = team.map(m => `
        <div class="team-member">
          <img class="team-member__img" src="${m.defaultImg}" alt="${escapeAttr(m.name)}" loading="lazy" decoding="async">
          <img class="team-member__img--hover" src="${m.hoverImg}" alt="" aria-hidden="true" loading="lazy" decoding="async">
          <h5 class="team-member__name">${escapeAttr(m.name)}</h5>
          <span class="team-member__info">${escapeAttr(m.jobTitle)}</span>
        </div>
      `).join('');
    }
  };

  // ── 4. /request/ contact form → mailto:hr@abrnoc.com ────────────────────
  // The original Gatsby form posted to a backend that doesn't exist on this
  // VPS. Replace the submit handler with a mailto: that pre-fills an email
  // to hr@abrnoc.com using the form fields. Also drop a visible fallback
  // address above the form so anyone whose email client doesn't open still
  // has the address.
  const wireRequestForm = () => {
    const form = document.querySelector('form.request__form');
    if (!form || form.dataset.hrWired === '1') return;
    form.dataset.hrWired = '1';

    // Intercept submit → build mailto.
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name    = (fd.get('name')    || '').toString().trim();
      const email   = (fd.get('email')   || '').toString().trim();
      const company = (fd.get('company') || '').toString().trim();
      const message = (fd.get('message') || '').toString().trim();

      const subject = 'abrNOC contact request — ' + name +
        (company ? ' (' + company + ')' : '');
      const body =
        'Name:    ' + name + '\n' +
        'Email:   ' + email + '\n' +
        'Company: ' + company + '\n\n' +
        'Message:\n' + (message || '(no message)') + '\n\n' +
        '— Sent from astro.abrnoc.com /request form';

      const mailto = 'mailto:hr@abrnoc.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

      // Inline notice so the user knows what happened.
      let notice = form.querySelector('.hr-form-notice');
      if (!notice) {
        notice = document.createElement('div');
        notice.className = 'hr-form-notice';
        notice.style.cssText =
          'margin-top:1.8rem;padding:1.2rem 1.6rem;border-radius:10px;' +
          'background:rgba(6,182,212,0.10);border:1px solid rgba(6,182,212,0.30);' +
          'color:#0891B2;font-weight:600;font-size:1.4rem;line-height:1.5;';
        form.appendChild(notice);
      }
      notice.innerHTML =
        'Opening your email app to send to ' +
        '<a href="mailto:hr@abrnoc.com" style="color:#F97316;text-decoration:underline">hr@abrnoc.com</a>… ' +
        '<span style="color:#6B7280;font-weight:500">If nothing opened, copy that address and email us directly.</span>';

      window.location.href = mailto;
    });

    // Direct-email line at the top of the form (BEFORE the first input,
    // not as a sibling of the form — that breaks the request__header/form
    // flex layout).
    if (form.querySelector('.hr-form-direct')) return;
    const direct = document.createElement('p');
    direct.className = 'hr-form-direct';
    direct.style.cssText =
      'margin:0 0 2rem 0;font-size:1.4rem;color:#6B7280;line-height:1.5;';
    direct.innerHTML =
      'Or email us directly at ' +
      '<a href="mailto:hr@abrnoc.com" style="color:#F97316;font-weight:600;text-decoration:none;border-bottom:1px solid currentColor;">hr@abrnoc.com</a>.';
    form.insertBefore(direct, form.firstChild);
  };

  const boot = () => { init(); wireRequestForm(); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
