/* =========================================================
   FORME — interactions
   GSAP + ScrollTrigger · progressive enhancement
   ========================================================= */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReduced = reduceMotion.matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasScrollTrigger = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (hasScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  /* -------------------------------------------------------
     Footer year
     ------------------------------------------------------- */
  var yearEl = doc.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* -------------------------------------------------------
     Loader
     ------------------------------------------------------- */
  var loader = doc.getElementById('loader');
  var introStarted = false;

  function hideLoader(immediate) {
    if (!loader || loader.dataset.done === 'true') return;
    loader.dataset.done = 'true';

    if (immediate || !hasGSAP) {
      loader.style.display = 'none';
      return;
    }
    window.gsap.to(loader, {
      yPercent: -100,
      duration: 0.9,
      ease: 'power4.inOut',
      onComplete: function () { loader.style.display = 'none'; }
    });
    window.gsap.to(loader.querySelectorAll('.loader__word, .loader__line, .loader__label'), {
      opacity: 0,
      y: -12,
      duration: 0.45,
      stagger: 0.05,
      ease: 'power2.out'
    });
  }

  // Never let the curtain get stuck.
  window.setTimeout(function () { hideLoader(true); }, 4200);

  /* -------------------------------------------------------
     Hero introduction
     ------------------------------------------------------- */
  function playIntro() {
    if (introStarted) return;
    introStarted = true;

    var heroTitle = doc.querySelector('.hero__title');
    var heroLines = doc.querySelectorAll('.hero__title .line__inner');
    var heroBits = doc.querySelectorAll('[data-hero-el]');
    var heroMedia = doc.querySelector('.hero__image');
    var heroImg = heroMedia ? heroMedia.querySelector('img') : null;

    if (!hasGSAP) return;

    // Prepare start states only once the DOM is ready to avoid flashes.
    window.gsap.set(heroLines, { yPercent: 112 });
    window.gsap.set(heroBits, { opacity: 0, y: 20 });
    if (heroMedia) window.gsap.set(heroMedia, { clipPath: 'inset(0% 0% 100% 0%)' });
    if (heroImg) window.gsap.set(heroImg, { scale: 1.12 });

    var tl = window.gsap.timeline({ delay: 0.55, defaults: { ease: 'power3.out' } });

    tl.to(heroLines, { yPercent: 0, duration: 1.15, stagger: 0.11 }, 0)
      .to(heroBits, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.28)
      .to(heroMedia, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power3.inOut' }, 0.15)
      .to(heroImg, { scale: 1, duration: 1.7, ease: 'power2.out' }, 0.15);

    if (heroTitle) tl.set(heroTitle, { clearProps: 'none' });
  }

  function startPage() {
    hideLoader(prefersReduced);
    if (!prefersReduced) playIntro();
  }

  if (doc.readyState === 'complete') {
    startPage();
  } else {
    window.addEventListener('load', startPage, { once: true });
    // Fallback in case a slow font/image stalls the load event.
    window.setTimeout(startPage, 2600);
  }

  /* -------------------------------------------------------
     Navigation · scrolled state + progress + active link
     ------------------------------------------------------- */
  var nav = doc.getElementById('siteHeader');
  var progressBar = doc.getElementById('progressBar');
  var sections = ['home', 'about', 'programs', 'membership']
    .map(function (id) { return doc.getElementById(id); })
    .filter(Boolean);
  var navLinks = doc.querySelectorAll('.nav__link');

  function setScrolled() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  setScrolled();

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

  function updateActive() {
    if (!sections.length) return;
    var probe = window.scrollY + window.innerHeight * 0.32;
    var current = sections[0].id;
    sections.forEach(function (section) {
      if (section.offsetTop <= probe) current = section.id;
    });
    if (window.innerHeight + window.scrollY >= doc.body.scrollHeight - 4) {
      current = 'membership';
    }
    navLinks.forEach(function (link) {
      var isCurrent = link.getAttribute('href') === '#' + current;
      link.classList.toggle('is-active', isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }
  updateActive();

  if (hasScrollTrigger && progressBar && !prefersReduced) {
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
  var menuLinks = menu ? menu.querySelectorAll('.menu__link, .menu__cta, [data-menu-close]') : [];
  var menuTl = null;

  function focusables() {
    if (!menu) return [];
    return Array.prototype.slice.call(menu.querySelectorAll('a[href], button:not([disabled])'));
  }

  function openMenu() {
    if (!menu || !menuToggle) return;
    menu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');

    if (hasGSAP && !prefersReduced) {
      if (menuTl) menuTl.kill();
      menuTl = window.gsap.timeline();
      menuTl
        .fromTo(menuBg, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
        .fromTo(menuPanel, { xPercent: 100 }, { xPercent: 0, duration: 0.62, ease: 'power3.inOut' }, 0)
        .fromTo(menu.querySelectorAll('.menu__link, .menu__foot'),
          { opacity: 0, x: 22 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }, 0.24);
    }
    if (menuClose) menuClose.focus({ preventScroll: true });
  }

  function closeMenu(returnFocus) {
    if (!menu || menu.hidden) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');

    function finish() {
      menu.hidden = true;
      if (returnFocus !== false) menuToggle.focus({ preventScroll: true });
    }

    if (hasGSAP && !prefersReduced) {
      if (menuTl) menuTl.kill();
      menuTl = window.gsap.timeline({ onComplete: finish });
      menuTl
        .to(menu.querySelectorAll('.menu__link, .menu__foot'), { opacity: 0, x: 12, duration: 0.25, stagger: 0.03 })
        .to(menuPanel, { xPercent: 100, duration: 0.5, ease: 'power3.inOut' }, 0.05)
        .to(menuBg, { opacity: 0, duration: 0.4 }, 0.05);
    } else {
      finish();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      if (menu.hidden) openMenu();
      else closeMenu();
    });
  }
  if (menuClose) menuClose.addEventListener('click', function () { closeMenu(); });

  menuLinks.forEach(function (el) {
    el.addEventListener('click', function () {
      if (el.hasAttribute('data-menu-close')) closeMenu(false);
      else closeMenu(false);
    });
  });

  doc.addEventListener('keydown', function (event) {
    if (!menu || menu.hidden) return;

    if (event.key === 'Escape') {
      closeMenu();
      return;
    }

    if (event.key === 'Tab') {
      var items = focusables();
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
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && menu && !menu.hidden) closeMenu(false);
  });

  /* -------------------------------------------------------
     Scroll-driven reveals
     ------------------------------------------------------- */
  if (hasScrollTrigger && !prefersReduced) {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    // Fade-up reveals, staggered when they enter together.
    gsap.set('[data-reveal]', { opacity: 0, y: 22 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: 'power2.out',
          overwrite: true
        });
      }
    });

    // Editorial line reveals.
    gsap.utils.toArray('[data-reveal-line]').forEach(function (line) {
      gsap.fromTo(line,
        { yPercent: 108 },
        {
          yPercent: 0,
          duration: 1.05,
          ease: 'power3.out',
          scrollTrigger: { trigger: line, start: 'top 92%', once: true }
        });
    });

    // Image mask reveals.
    gsap.utils.toArray('[data-reveal-img]').forEach(function (box) {
      gsap.fromTo(box,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: box, start: 'top 90%', once: true }
        });
    });

    // Subtle parallax inside image frames.
    gsap.utils.toArray('[data-parallax]').forEach(function (img) {
      var amount = parseFloat(img.getAttribute('data-parallax')) || 6;
      var frame = img.closest('.media') || img.parentElement;
      gsap.fromTo(img,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: 'none',
          scrollTrigger: {
            trigger: frame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6
          }
        });
    });

    // Full-bleed parallax for the visual break.
    var breakImg = doc.querySelector('[data-parallax-free]');
    if (breakImg) {
      var freeAmount = parseFloat(breakImg.getAttribute('data-parallax-free')) || 16;
      gsap.fromTo(breakImg,
        { yPercent: -freeAmount / 2 },
        {
          yPercent: freeAmount / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: breakImg.closest('.break'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8
          }
        });
    }
  }

  /* -------------------------------------------------------
     Gentle hover zoom
     ------------------------------------------------------- */
  if (hasGSAP && canHover && !prefersReduced) {
    var zoomFrames = doc.querySelectorAll('.hero__figure, .about__figure, .about__inset, .program__media');
    zoomFrames.forEach(function (frame) {
      var img = frame.querySelector('img');
      if (!img) return;
      frame.addEventListener('mouseenter', function () {
        window.gsap.to(img, { scale: 1.045, duration: 1.15, ease: 'power2.out', overwrite: 'auto' });
      });
      frame.addEventListener('mouseleave', function () {
        window.gsap.to(img, { scale: 1, duration: 1.25, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }

  /* -------------------------------------------------------
     Reduced-motion changes at runtime
     ------------------------------------------------------- */
  function applyMotionPreference() {
    if (reduceMotion.matches) {
      if (hasGSAP) window.gsap.set('[data-reveal], [data-hero-el]', { clearProps: 'all' });
      if (hasScrollTrigger) window.ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
    }
  }
  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', function () {
      prefersReduced = reduceMotion.matches;
      applyMotionPreference();
    });
  }
})();
