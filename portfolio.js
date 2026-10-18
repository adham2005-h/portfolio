(() => {
  function startPortfolio() {
    const root = document.documentElement;
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.nav-menu');
    const navLinks = [...document.querySelectorAll('.nav-link[href^="#"]')];
    const sections = [...document.querySelectorAll('main section[id]')];
    const progress = document.querySelector('.scroll-progress span');
    const backToTop = document.querySelector('.back-to-top');
    const revealElements = [...document.querySelectorAll('.reveal')];
    const tiltCards = [...document.querySelectorAll('.tilt-card, .portrait-scene')];
    const parallax = document.querySelector('.hero-orbit, .hero-visual');
    const hero = document.querySelector('#home');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const mobileLayout = window.matchMedia('(max-width: 900px)');

    let revealObserver;
    let scrollFrame = 0;
    let pointerFrame = 0;
    let pointerPosition;
    let activeCard;
    let activeSection = '';

    root.classList.add('has-js');

    function listenToPreference(preference, callback) {
      if (preference.addEventListener) {
        preference.addEventListener('change', callback);
      } else {
        preference.addListener(callback);
      }
    }

    function setMenuOpen(open, restoreFocus = false) {
      if (!menu || !menuToggle) return;
      const isOpen = open && mobileLayout.matches;
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      navbar?.classList.toggle('menu-open', isOpen);
      menu.classList.toggle('is-open', isOpen);
      menu.classList.toggle('menu-open', isOpen);
      if (restoreFocus) menuToggle.focus();
    }

    menuToggle?.addEventListener('click', () => {
      setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
    });

    menu?.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenuOpen(false);
    });

    document.addEventListener('click', (event) => {
      if (!navbar?.contains(event.target)) setMenuOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false, true);
      }
    });

    listenToPreference(mobileLayout, () => setMenuOpen(false));
    setMenuOpen(false);

    function showElement(element, immediately = false) {
      element.classList.add('is-visible');
      if (immediately) element.classList.remove('reveal-ready');
      revealObserver?.unobserve(element);
    }

    function prepareReveals() {
      revealObserver?.disconnect();
      if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        revealElements.forEach((element) => showElement(element, true));
        return;
      }

      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) showElement(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

      // The opening view stays visible; only upcoming content is armed for a reveal.
      revealElements.forEach((element) => {
        if (element.classList.contains('is-visible')) return;
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9 || rect.bottom <= 0) {
          showElement(element);
          return;
        }
        const delay = Math.min(500, Math.max(0, Number(element.dataset.delay) || 0));
        element.style.setProperty('--reveal-delay', `${delay}ms`);
        element.classList.add('reveal-ready');
        revealObserver.observe(element);
      });
    }

    // Keyboard navigation must never land on an element waiting for its animation.
    document.addEventListener('focusin', (event) => {
      let element = event.target.closest('.reveal');
      while (element) {
        showElement(element, true);
        element = element.parentElement?.closest('.reveal');
      }
    });

    function resetTilt() {
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      pointerPosition = undefined;
      activeCard = undefined;
      tiltCards.forEach((card) => {
        ['--tilt-x', '--tilt-y', '--pointer-x', '--pointer-y'].forEach((property) => {
          card.style.removeProperty(property);
        });
        card.classList.remove('is-pointer-active');
      });
    }

    function updateTilt() {
      pointerFrame = 0;
      if (!activeCard || !pointerPosition || reducedMotion.matches || !finePointer.matches) return;
      const rect = activeCard.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.min(1, Math.max(0, (pointerPosition.x - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (pointerPosition.y - rect.top) / rect.height));
      activeCard.style.setProperty('--tilt-x', `${((0.5 - y) * 8).toFixed(2)}deg`);
      activeCard.style.setProperty('--tilt-y', `${((x - 0.5) * 8).toFixed(2)}deg`);
      activeCard.style.setProperty('--pointer-x', `${(x * 100).toFixed(1)}%`);
      activeCard.style.setProperty('--pointer-y', `${(y * 100).toFixed(1)}%`);
      activeCard.classList.add('is-pointer-active');
    }

    tiltCards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        if (reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
        if (event.target.closest('.tilt-card, .portrait-scene') !== card) return;
        if (activeCard && activeCard !== card) resetTilt();
        activeCard = card;
        pointerPosition = { x: event.clientX, y: event.clientY };
        if (!pointerFrame) pointerFrame = window.requestAnimationFrame(updateTilt);
      }, { passive: true });
      card.addEventListener('pointerleave', resetTilt);
      card.addEventListener('pointercancel', resetTilt);
    });

    window.addEventListener('blur', resetTilt);
    listenToPreference(finePointer, resetTilt);

    function updateScroll() {
      scrollFrame = 0;
      const scrollTop = window.scrollY || root.scrollTop;
      const scrollableHeight = Math.max(0, root.scrollHeight - window.innerHeight);
      const fraction = scrollableHeight ? Math.min(1, Math.max(0, scrollTop / scrollableHeight)) : 0;
      const headerHeight = navbar?.getBoundingClientRect().height || 80;
      let currentSection = sections[0]?.id || '';

      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= headerHeight + 100) currentSection = section.id;
      });
      if (scrollableHeight > 0 && scrollTop >= scrollableHeight - 4) {
        currentSection = sections[sections.length - 1]?.id || currentSection;
      }

      let scrollShift = 0;
      if (hero && parallax && !reducedMotion.matches && finePointer.matches && !root.classList.contains('has-advanced-motion')) {
        const rect = hero.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          scrollShift = Math.min(30, Math.max(-30, (-rect.top / Math.max(1, rect.height)) * 30));
        }
      }

      if (progress) progress.style.transform = `scaleX(${fraction.toFixed(4)})`;
      navbar?.classList.toggle('is-scrolled', scrollTop > 24);
      backToTop?.classList.toggle('is-visible', scrollTop > 700);
      parallax?.style.setProperty('--scroll-shift', `${scrollShift.toFixed(2)}px`);

      if (currentSection !== activeSection) {
        activeSection = currentSection;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute('href') === `#${activeSection}`;
          link.classList.toggle('is-active', isActive);
          if (isActive) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    }

    function requestScrollUpdate() {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
    }

    if (backToTop?.tagName === 'BUTTON') {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      });
    }

    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate, { passive: true });
    window.addEventListener('load', requestScrollUpdate, { once: true });
    document.fonts?.ready.then(requestScrollUpdate);

    listenToPreference(reducedMotion, () => {
      resetTilt();
      prepareReveals();
      requestScrollUpdate();
    });

    prepareReveals();
    requestScrollUpdate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPortfolio, { once: true });
  } else {
    startPortfolio();
  }
})();
