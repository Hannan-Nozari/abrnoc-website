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
// Both effects are skipped when prefers-reduced-motion: reduce is set, except
// item 2 which is content (not motion) and always runs.

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
