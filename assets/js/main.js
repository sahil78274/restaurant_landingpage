/* =========================================================
   FORME — interactions & motion
   GSAP + ScrollTrigger, progressive enhancement
   ========================================================= */
(function () {
  'use strict';

  var doc = document;
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = reduceQuery.matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (hasST) window.gsap.registerPlugin(window.ScrollTrigger);

  var yearEl = doc.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* -------------------------------------------------------
     Loader — counts 00 → 100 while the page settles
     ------------------------------------------------------- */
  var loader = doc.getElementById('loader');
  var loaderCount = doc.getElementById('loaderCount');
  var loaderBar = loader ? loader.querySelector('.loader__track i') : null;
  var loaderDone = false;
  var loaderRunning = false;

  function paintLoader(pct) {
    if (loaderCount) loaderCount.textContent = pct < 10 ? '0' + pct : String(pct);
    if (loaderBar) loaderBar.style.transform = 'scaleX(' + pct / 100 + ')';
  }

  function runLoader() {
    if (!loader) { startPage(); return; }
    if (reduced || !hasGSAP) { finishLoader(true); return; }
    if (loaderRunning || loaderDone) return;
    loaderRunning = true;

    var state = { v: 0 };
    window.gsap.to(state, {
      v: 100,
      duration: 1.25,
      ease: 'power2.inOut',
      onUpdate: function () { paintLoader(Math.round(state.v)); },
      onComplete: function () { finishLoader(false); }
    });
  }

  function finishLoader(immediate) {
    if (loaderDone) return;
    loaderDone = true;
    if (!loader) return;

    if (immediate || !hasGSAP) {
      loader.style.display = 'none';
      startPage();
      return;
    }
    window.gsap.to(loader.querySelectorAll('.loader__word, .loader__meter, .loader__note'), {
      opacity: 0,
      y: -10,
      duration: 0.35,
      stagger: 0.04,
      ease: 'power2.out'
    });
    window.gsap.to(loader, {
      yPercent: -100,
      duration: 0.75,
      delay: 0.15,
      ease: 'power4.inOut',
      onComplete: function () {
        loader.style.display = 'none';
        startPage();
      }
    });
  }

  // Safety net: never trap the page behind the curtain.
  window.setTimeout(function () { finishLoader(true); }, 3800);

  /* -------------------------------------------------------
     Hero introduction
     ------------------------------------------------------- */
  var introPlayed = false;

  function playHero() {
    if (introPlayed) return;
    introPlayed = true;

    var lines = doc.querySelectorAll('.hero__line-inner');
    var media = doc.querySelector('[data-hero-media]');
    var mediaImg = media ? media.querySelector('img') : null;
    var extras = doc.querySelectorAll('.hero__meta, .hero__foot, .hero__vlabel');

    if (!hasGSAP) return;

    if (reduced) {
      window.gsap.set([lines, extras], { clearProps: 'all' });
      return;
    }

    window.gsap.set(lines, { yPercent: 108 });
    window.gsap.set(extras, { opacity: 0, y: 14 });
    if (media) window.gsap.set(media, { clipPath: 'inset(0% 0% 100% 0%)' });
    if (mediaImg) window.gsap.set(mediaImg, { scale: 1.16 });

    var tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(lines, { yPercent: 0, duration: 1.05, stagger: 0.1, ease: 'power4.out' }, 0)
      .to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.05, ease: 'power3.inOut' }, 0.12)
      .to(mediaImg, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0.12)
      .to(extras, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 }, 0.35);
  }

  function startPage() {
    playHero();
  }

  if (doc.readyState === 'complete') runLoader();
  else window.addEventListener('load', runLoader, { once: true });
  window.setTimeout(function () { if (!loaderDone) runLoader(); }, 2200);

  /* -------------------------------------------------------
     Nav state, progress bar, active section
     ------------------------------------------------------- */
  var nav = doc.getElementById('siteHeader');
  var progressBar = doc.getElementById('progressBar');
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.nav__link'));
  var sections = ['programs', 'philosophy', 'membership']
    .map(function (id) { return doc.getElementById(id); })
    .filter(Boolean);

  function setScrolled() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 16);
  }
  setScrolled();

  function updateActive() {
    if (!sections.length) return;
    var probe = window.scrollY + window.innerHeight * 0.35;
    var current = '';
    sections.forEach(function (section) {
      if (section.offsetTop <= probe) current = section.id;
    });
    if (window.innerHeight + window.scrollY >= doc.body.scrollHeight - 8) current = 'membership';
    navLinks.forEach(function (link) {
      var isCurrent = current && link.getAttribute('href') === '#' + current;
      link.classList.toggle('is-active', !!isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }
  updateActive();

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      setScrolled();
      updateActive();
      ticking = false;
    });
  }, { passive: true });

  if (hasST && progressBar && !reduced) {
    window.gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.4 }
    });
  } else if (progressBar) {
    progressBar.style.display = 'none';
  }

  /* -------------------------------------------------------
     Mobile menu
     ------------------------------------------------------- */
  var menu = doc.getElementById('mobileMenu');
  var menuToggle = doc.getElementById('menuToggle');
  var menuClose = doc.getElementById('menuClose');
  var menuPanel = menu ? menu.querySelector('.menu__panel') : null;
  var menuBg = menu ? menu.querySelector('.menu__bg') : null;
  var menuTl = null;

  function menuFocusables() {
    if (!menu) return [];
    return Array.prototype.slice.call(menu.querySelectorAll('a[href], button:not([disabled])'));
  }

  function openMenu() {
    if (!menu || !menuToggle) return;
    menu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    doc.body.style.overflow = 'hidden';

    if (hasGSAP && !reduced) {
      if (menuTl) menuTl.kill();
      menuTl = window.gsap.timeline();
      menuTl
        .fromTo(menuBg, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0)
        .fromTo(menuPanel, { xPercent: 100 }, { xPercent: 0, duration: 0.55, ease: 'power3.inOut' }, 0)
        .fromTo(menu.querySelectorAll('.menu__link, .menu__foot'), { opacity: 0, x: 18 },
          { opacity: 1, x: 0, duration: 0.45, stagger: 0.045 }, 0.2);
    }
    if (menuClose) menuClose.focus({ preventScroll: true });
  }

  function closeMenu(shouldFocus) {
    if (!menu || menu.hidden) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');

    function done() {
      menu.hidden = true;
      doc.body.style.overflow = '';
      if (shouldFocus !== false) menuToggle.focus({ preventScroll: true });
    }

    if (hasGSAP && !reduced) {
      if (menuTl) menuTl.kill();
      menuTl = window.gsap.timeline({ onComplete: done });
      menuTl
        .to(menu.querySelectorAll('.menu__link, .menu__foot'), { opacity: 0, x: 10, duration: 0.2, stagger: 0.025 }, 0)
        .to(menuPanel, { xPercent: 100, duration: 0.45, ease: 'power3.inOut' }, 0.05)
        .to(menuBg, { opacity: 0, duration: 0.3 }, 0.05);
    } else {
      done();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      if (menu.hidden) openMenu();
      else closeMenu();
    });
  }
  if (menuClose) menuClose.addEventListener('click', function () { closeMenu(); });
  if (menu) {
    menu.querySelectorAll('a[href], [data-menu-close]').forEach(function (el) {
      el.addEventListener('click', function () { closeMenu(false); });
    });
  }

  doc.addEventListener('keydown', function (event) {
    if (!menu || menu.hidden) return;
    if (event.key === 'Escape') { closeMenu(); return; }
    if (event.key !== 'Tab') return;

    var items = menuFocusables();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && doc.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && doc.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && menu && !menu.hidden) closeMenu(false);
  });

  /* -------------------------------------------------------
     Number counters
     ------------------------------------------------------- */
  var counters = Array.prototype.slice.call(doc.querySelectorAll('[data-count]'));
  var countersStarted = false;

  function formatNumber(value, format) {
    var rounded = Math.round(value);
    if (format === 'comma') return rounded.toLocaleString('en-GB');
    return String(rounded);
  }

  function runCounters() {
    if (countersStarted || !counters.length) return;
    countersStarted = true;

    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var format = el.getAttribute('data-format');

      if (reduced || !hasGSAP) {
        el.textContent = formatNumber(target, format);
        return;
      }

      var state = { v: 0 };
      window.gsap.to(state, {
        v: target,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: function () { el.textContent = formatNumber(state.v, format); }
      });
    });
  }

  var dataSection = doc.getElementById('data');
  if (dataSection && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounters();
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.35 });
    counterObserver.observe(dataSection);
  } else {
    runCounters();
  }

  /* -------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------- */
  if (hasST && !reduced) {
    var gsap = window.gsap;

    gsap.set('[data-reveal]', { opacity: 0, y: 18 });
    window.ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.75, stagger: 0.07, ease: 'power2.out', overwrite: true });
      }
    });

    gsap.utils.toArray('[data-reveal-line]').forEach(function (line) {
      gsap.fromTo(line, { yPercent: 110 }, {
        yPercent: 0,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: { trigger: line, start: 'top 94%', once: true }
      });
    });

    gsap.utils.toArray('[data-reveal-img]').forEach(function (box) {
      gsap.fromTo(box, { clipPath: 'inset(0% 0% 100% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.05,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: box, start: 'top 92%', once: true }
      });
    });

    gsap.utils.toArray('[data-parallax]').forEach(function (img) {
      var amount = parseFloat(img.getAttribute('data-parallax')) || 6;
      var frame = img.closest('figure') || img.parentElement;
      gsap.fromTo(img, { yPercent: -amount }, {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    });

    var freeImg = doc.querySelector('[data-parallax-free]');
    if (freeImg) {
      var free = parseFloat(freeImg.getAttribute('data-parallax-free')) || 14;
      gsap.fromTo(freeImg, { yPercent: -free / 2 }, {
        yPercent: free / 2,
        ease: 'none',
        scrollTrigger: { trigger: freeImg.closest('.campaign'), start: 'top bottom', end: 'bottom top', scrub: 0.7 }
      });
    }

    // Campaign headline drifts slightly with scroll — subtle depth only.
    var campaignTitle = doc.querySelector('.campaign__title');
    if (campaignTitle) {
      gsap.to(campaignTitle, {
        yPercent: -3,
        ease: 'none',
        scrollTrigger: { trigger: campaignTitle.closest('.campaign'), start: 'top bottom', end: 'bottom top', scrub: 0.9 }
      });
    }
  }

  /* -------------------------------------------------------
     Program rows — pointer-following image position
     ------------------------------------------------------- */
  if (canHover && !reduced) {
    var rows = doc.querySelectorAll('[data-row]');
    rows.forEach(function (row) {
      var media = row.querySelector('.row__media');
      if (!media || !hasGSAP) return;
      var quickX = window.gsap.quickTo(media, 'x', { duration: 0.5, ease: 'power2.out' });

      row.addEventListener('mousemove', function (event) {
        var rect = row.getBoundingClientRect();
        var ratio = (event.clientX - rect.left) / rect.width;
        var drift = (ratio - 0.5) * 42;
        quickX(drift);
      });
      row.addEventListener('mouseleave', function () { quickX(0); });
    });
  }

  /* -------------------------------------------------------
     Marquee — duplicate content for a seamless loop
     ------------------------------------------------------- */
  var track = doc.getElementById('marqueeTrack');
  if (track) {
    var group = track.querySelector('.marquee__group');
    if (group) track.appendChild(group.cloneNode(true));
  }

  /* -------------------------------------------------------
     Runtime motion preference changes
     ------------------------------------------------------- */
  function onPreferenceChange() {
    reduced = reduceQuery.matches;
    if (reduced) {
      if (hasGSAP) window.gsap.set('[data-reveal], [data-hero-line]', { clearProps: 'all' });
      if (hasST) window.ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
    }
  }
  if (typeof reduceQuery.addEventListener === 'function') {
    reduceQuery.addEventListener('change', onPreferenceChange);
  }
})();
