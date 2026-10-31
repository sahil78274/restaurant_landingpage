/* =========================================================
   FORME — motion & interaction
   GSAP + ScrollTrigger + Lenis · progressive enhancement
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

  /* =======================================================
     1 · Letter splitting
     ======================================================= */
  var splitMap = [];

  function splitElement(el) {
    var text = (el.getAttribute('data-split') || el.textContent || '').trim();
    if (!text) return [];
    el.setAttribute('aria-label', text);
    el.textContent = '';

    var chars = [];
    text.split('').forEach(function (character) {
      var outer = doc.createElement('span');
      outer.className = 'char';
      outer.setAttribute('aria-hidden', 'true');

      var inner = doc.createElement('span');
      inner.className = 'char__in';

      if (character === ' ') {
        outer.className += ' char--space';
        inner.innerHTML = '&nbsp;';
      } else {
        inner.textContent = character;
        if (character === '.' || character === '!') inner.className += ' char--accent';
      }

      outer.appendChild(inner);
      el.appendChild(outer);
      chars.push(inner);
    });

    splitMap.push({ el: el, chars: chars });
    return chars;
  }

  var splitTargets = doc.querySelectorAll('[data-split]');
  splitTargets.forEach(splitElement);

  function charsOf(selector) {
    var entry = splitMap.filter(function (item) {
      return item.el.matches(selector);
    })[0];
    return entry ? entry.chars : [];
  }

  /* =======================================================
     2 · Loader
     ======================================================= */
  var loader = doc.getElementById('loader');
  var loaderBar = doc.getElementById('loaderBar');
  var loaderCount = doc.getElementById('loaderCount');
  var loaderFinished = false;
  var pageStarted = false;

  function paintLoader(pct) {
    if (loaderCount) loaderCount.textContent = pct < 10 ? '0' + pct : String(pct);
    if (loaderBar) loaderBar.style.transform = 'scaleX(' + pct / 100 + ')';
  }

  function endLoader(immediate) {
    if (loaderFinished) return;
    loaderFinished = true;

    if (!loader || immediate || !hasGSAP) {
      if (loader) loader.style.display = 'none';
      startPage();
      return;
    }

    window.gsap.to(loader.querySelectorAll('.loader__word, .loader__line, .loader__meta'), {
      y: -12,
      opacity: 0,
      duration: 0.35,
      stagger: 0.04,
      ease: 'power2.out'
    });
    window.gsap.to(loader, {
      yPercent: -100,
      duration: 0.8,
      delay: 0.12,
      ease: 'power4.inOut',
      onComplete: function () {
        loader.style.display = 'none';
        startPage();
      }
    });
  }

  function runLoader() {
    if (loaderFinished) return;
    if (!loader || reduced || !hasGSAP) { endLoader(true); return; }

    var state = { v: 0 };
    window.gsap.to(state, {
      v: 100,
      duration: 1.35,
      ease: 'power2.inOut',
      onUpdate: function () { paintLoader(Math.round(state.v)); },
      onComplete: function () { endLoader(false); }
    });
  }

  window.setTimeout(function () { endLoader(true); }, 4000);

  /* =======================================================
     3 · Smooth scrolling (Lenis)
     ======================================================= */
  var lenis = null;

  if (typeof window.Lenis === 'function' && !reduced) {
    try {
      lenis = new window.Lenis({
        duration: 1.05,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        touchMultiplier: 1.4
      });

      if (hasGSAP) {
        lenis.on('scroll', window.ScrollTrigger.update);
        window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        window.gsap.ticker.lagSmoothing(0);
      } else {
        var raf = function (time) {
          lenis.raf(time);
          window.requestAnimationFrame(raf);
        };
        window.requestAnimationFrame(raf);
      }
    } catch (error) {
      // Native scrolling stays in place if Lenis cannot initialise.
      lenis = null;
    }
  }

  function scrollToTarget(target) {
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -72, duration: 1.15 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  /* =======================================================
     4 · Hero introduction
     ======================================================= */
  var heroStarted = false;

  function startPage() {
    if (pageStarted) return;
    pageStarted = true;
    playHero();
  }

  function playHero() {
    if (heroStarted) return;
    heroStarted = true;

    var line1 = charsOf('.hero__line--1');
    var line2 = charsOf('.hero__line--2');
    var band = doc.querySelector('[data-hero-band]');
    var bandImg = doc.querySelector('[data-hero-img]');
    var metaBits = doc.querySelectorAll('[data-hero-meta]');
    var badge = doc.querySelector('.badge');

    if (!hasGSAP) return;

    if (reduced) {
      window.gsap.set([line1, line2, metaBits, badge], { clearProps: 'all' });
      return;
    }

    window.gsap.set([line1, line2], { yPercent: 118, rotate: 3 });
    window.gsap.set(metaBits, { opacity: 0, y: 12 });
    if (badge) window.gsap.set(badge, { opacity: 0, scale: 0.7 });
    if (band) window.gsap.set(band, { clipPath: 'inset(0% 0% 100% 0%)' });
    if (bandImg) window.gsap.set(bandImg, { scale: 1.22 });

    var tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(metaBits, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0)
      .to(line1, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.035, ease: 'power4.out' }, 0.05)
      .to(band, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.05, ease: 'power3.inOut' }, 0.35)
      .to(bandImg, { scale: 1, duration: 1.8, ease: 'power2.out' }, 0.35)
      .to(line2, { yPercent: 0, rotate: 0, duration: 1.05, stagger: 0.03, ease: 'power4.out' }, 0.55)
      .to(badge, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, 0.95);
  }

  if (doc.readyState === 'complete') runLoader();
  else window.addEventListener('load', runLoader, { once: true });
  window.setTimeout(function () { if (!loaderFinished) runLoader(); }, 2400);

  /* =======================================================
     5 · Scroll-driven motion
     ======================================================= */
  if (hasST && !reduced) {
    var gsap = window.gsap;
    var ST = window.ScrollTrigger;

    /* Headings revealed letter by letter */
    splitMap.forEach(function (entry) {
      if (!entry.el.hasAttribute('data-reveal-heading')) return;
      gsap.fromTo(entry.chars, { yPercent: 110, opacity: 0 }, {
        yPercent: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.022,
        ease: 'power4.out',
        scrollTrigger: { trigger: entry.el, start: 'top 88%', once: true }
      });
    });

    /* Small fade-ups */
    gsap.set('[data-reveal]', { opacity: 0, y: 16 });
    ST.batch('[data-reveal]', {
      start: 'top 92%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: 'power2.out', overwrite: true });
      }
    });

    /* Image mask reveals */
    gsap.utils.toArray('[data-reveal-img]').forEach(function (box) {
      gsap.fromTo(box, { clipPath: 'inset(0% 0% 100% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: box, start: 'top 90%', once: true }
      });
    });

    /* Impact headline */
    gsap.utils.toArray('[data-line]').forEach(function (line) {
      gsap.fromTo(line, { yPercent: 110 }, {
        yPercent: 0,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: { trigger: line, start: 'top 94%', once: true }
      });
    });

    /* Hero band — gentle zoom + lift as it leaves */
    var bandImg = doc.querySelector('[data-hero-img]');
    if (bandImg) {
      gsap.fromTo(bandImg, { scale: 1 }, {
        scale: 1.1,
        yPercent: -3,
        ease: 'none',
        scrollTrigger: { trigger: doc.querySelector('[data-hero-band]'), start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
    }

    /* Thumbnail parallax */
    var thumb = doc.querySelector('[data-thumb-img]');
    if (thumb) {
      gsap.fromTo(thumb, { yPercent: -6, scale: 1.08 }, {
        yPercent: 6,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: thumb.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: 0.7 }
      });
    }

    /* Impact — parallax + slow zoom */
    var impactImg = doc.querySelector('[data-impact-img]');
    if (impactImg) {
      gsap.fromTo(impactImg, { yPercent: -6, scale: 1.14 }, {
        yPercent: 6,
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: impactImg.closest('.impact'), start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      });
    }

    /* Program numbers */
    gsap.utils.toArray('[data-count-to]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
      var state = { v: 0 };
      gsap.to(state, {
        v: target,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: function () {
          var value = Math.round(state.v);
          el.textContent = value < 10 ? '0' + value : String(value);
        }
      });
    });

    /* Letter-spacing ease on the closing headline */
    var closingTitle = doc.querySelector('.closing__title');
    if (closingTitle) {
      gsap.fromTo(closingTitle, { letterSpacing: '0.012em' }, {
        letterSpacing: '-0.05em',
        ease: 'none',
        scrollTrigger: { trigger: closingTitle, start: 'top 95%', end: 'top 55%', scrub: 0.8 }
      });
    }
  }

  /* =======================================================
     6 · Nav · panel · active section · smooth anchors
     ======================================================= */
  var nav = doc.getElementById('siteHeader');
  var navToggle = doc.getElementById('navToggle');
  var navPanel = doc.getElementById('navPanel');
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.nav__link'));
  var tracked = ['programs', 'impact', 'join']
    .map(function (id) { return doc.getElementById(id); })
    .filter(Boolean);

  function onScrollState() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);

    var probe = window.scrollY + window.innerHeight * 0.4;
    var current = '';
    tracked.forEach(function (section) {
      if (section.offsetTop <= probe) current = section.id;
    });
    navLinks.forEach(function (link) {
      var isCurrent = current && link.getAttribute('href') === '#' + current;
      link.classList.toggle('is-active', !!isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  onScrollState();
  window.addEventListener('scroll', onScrollState, { passive: true });

  function closePanel(focus) {
    if (!navPanel || navPanel.hidden) return;
    navPanel.hidden = true;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    if (focus) navToggle.focus({ preventScroll: true });
  }

  if (navToggle && navPanel) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closePanel(false);
        return;
      }
      navPanel.hidden = false;
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close menu');
      if (hasGSAP && !reduced) {
        window.gsap.fromTo(navPanel.querySelectorAll('.panel__nav a, .panel__foot'),
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' });
      }
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !navPanel.hidden) closePanel(true);
    });
    doc.addEventListener('click', function (event) {
      if (navPanel.hidden) return;
      if (navPanel.contains(event.target) || navToggle.contains(event.target)) return;
      closePanel(false);
    });
  }

  doc.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;
    var hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    var target = doc.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    closePanel(false);

    if (hash === '#top') {
      if (lenis) lenis.scrollTo(0, { duration: 1.1 });
      else window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    } else {
      scrollToTarget(target);
    }
    if (history.replaceState) history.replaceState(null, '', hash);
  });

  /* =======================================================
     7 · Custom cursor (pointer devices only)
     ======================================================= */
  var cursor = doc.getElementById('cursor');

  if (cursor && canHover && !reduced && hasGSAP) {
    var gsap = window.gsap;
    var ring = cursor.querySelector('.cursor__ring');
    var dot = cursor.querySelector('.cursor__dot');

    var ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
    var ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });
    var dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' });
    var dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });

    var cursorVisible = false;

    window.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch') return;
      ringX(event.clientX);
      ringY(event.clientY);
      dotX(event.clientX);
      dotY(event.clientY);
      if (!cursorVisible) {
        cursor.classList.add('is-ready');
        cursorVisible = true;
      }
    }, { passive: true });

    doc.addEventListener('pointerover', function (event) {
      var interactive = event.target.closest('a, button, [data-cursor]');
      cursor.classList.toggle('is-hover', !!interactive);
    });

    doc.documentElement.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-ready');
      cursorVisible = false;
    });
  }

  /* =======================================================
     8 · Runtime preference change
     ======================================================= */
  function onPreferenceChange() {
    reduced = reduceQuery.matches;
    if (!reduced) return;
    if (hasGSAP) window.gsap.set('[data-reveal], [data-split] .char__in', { clearProps: 'all' });
    if (hasST) window.ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
    if (cursor) cursor.style.display = 'none';
    if (lenis && typeof lenis.destroy === 'function') lenis.destroy();
  }
  if (typeof reduceQuery.addEventListener === 'function') {
    reduceQuery.addEventListener('change', onPreferenceChange);
  }
})();
