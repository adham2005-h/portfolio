(() => {
  function startMotionEffects() {
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger) return;

    const root = document.documentElement;
    const completedEntrances = new WeakSet();
    const selectAll = (selector, scope = document) => [...scope.querySelectorAll(selector)];
    const showContent = () => selectAll('.reveal').forEach((element) => {
      element.classList.remove('reveal-ready');
      element.classList.add('is-visible');
    });

    try {
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const entrances = new Map();
        const originalStyles = new Map();
        const originalOwnership = new Map();
        const motionContext = gsap.context(() => {}, document.body);
        const desktopMedia = gsap.matchMedia();

        function own(elements) {
          elements.filter(Boolean).forEach((element) => {
            if (!originalStyles.has(element)) {
              originalStyles.set(element, element.getAttribute('style'));
              originalOwnership.set(element, element.getAttribute('data-motion-owned'));
            }
            element.setAttribute('data-motion-owned', '');
          });
          return elements.filter(Boolean);
        }

        function restoreContent() {
          desktopMedia.revert();
          motionContext.revert();
          originalStyles.forEach((style, element) => {
            if (style === null) element.removeAttribute('style');
            else element.setAttribute('style', style);
            const ownership = originalOwnership.get(element);
            if (ownership === null) element.removeAttribute('data-motion-owned');
            else element.setAttribute('data-motion-owned', ownership);
          });
          root.classList.remove('has-advanced-motion');
          showContent();
          document.removeEventListener('focusin', finishFocusedEntrance);
        }

        function finishFocusedEntrance(event) {
          entrances.forEach((timeline, element) => {
            if (element.contains(event.target) && timeline.progress() < 1) {
              timeline.progress(1).pause();
            }
          });
        }

        function enterOnce(element, timeline, htmlTargets = []) {
          if (!element || !timeline.getChildren().length) return;
          // Restore CSS hover transforms after an HTML entrance has finished.
          if (htmlTargets.length) timeline.set(htmlTargets, { clearProps: 'transform,opacity' });
          timeline.eventCallback('onComplete', () => completedEntrances.add(element));
          entrances.set(element, timeline);
          const finish = () => timeline.progress(1).pause();
          const play = () => { if (timeline.progress() < 1) timeline.play(); };
          const rect = element.getBoundingClientRect();

          if (completedEntrances.has(element) || rect.bottom <= 0) {
            finish();
          } else {
            ScrollTrigger.create({
              trigger: element,
              start: 'top 88%',
              end: 'bottom top',
              onEnter: play,
              onEnterBack: play,
              onLeave: finish
            });
            if (rect.top < window.innerHeight * 0.88) play();
          }
        }

        function entranceTimeline() {
          return gsap.timeline({ paused: true, defaults: { duration: 0.75, ease: 'power3.out' } });
        }

        try {
          showContent();
          root.classList.add('has-advanced-motion');
          document.addEventListener('focusin', finishFocusedEntrance);

          motionContext.add(() => {
            const hero = document.querySelector('#home');
            if (hero) {
              const opening = own(selectAll('.hero-text .eyebrow, .hero-text .availability', hero));
              const title = own(selectAll('.hero-title-inner', hero));
              const copy = own(selectAll('.hero-text > h2, .hero-text > p, .hero-tags, .hero-buttons, .hero-proof', hero));
              const portrait = own(selectAll('.portrait-content', hero));
              const note = own(selectAll('.hero-note > *', hero));
              const timeline = entranceTimeline();
              if (opening.length) timeline.fromTo(opening, { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07 }, 0);
              if (title.length) timeline.fromTo(title, { yPercent: 110, rotation: 2 }, { yPercent: 0, rotation: 0, duration: 1, stagger: 0.11 }, 0.08);
              if (copy.length) timeline.fromTo(copy, { y: 25, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.09 }, 0.32);
              if (portrait.length) timeline.fromTo(portrait, { y: 40, rotation: -4, scale: 0.94, opacity: 0 }, { y: 0, rotation: 0, scale: 1, opacity: 1, duration: 1 }, 0.2);
              if (note.length) timeline.fromTo(note, { x: 20, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.08 }, 0.55);
              enterOnce(hero, timeline, [...opening, ...title, ...copy, ...portrait, ...note]);
            }

            selectAll('.section-title').forEach((heading) => {
              const words = own(selectAll('.word-inner', heading));
              const details = own(selectAll('.section-label, p', heading));
              const rule = own(selectAll('.title-rule', heading));
              const timeline = entranceTimeline();
              if (words.length) timeline.fromTo(words, { yPercent: 110, rotation: 3 }, { yPercent: 0, rotation: 0, duration: 0.95, stagger: 0.06 }, 0);
              if (details.length) timeline.fromTo(details, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.09 }, 0.12);
              if (rule.length) timeline.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, 0.18);
              enterOnce(heading, timeline, [...words, ...details, ...rule]);
            });

            selectAll('.project-card').forEach((card) => {
              const icon = own(selectAll('.art-emoji', card));
              const details = own(selectAll('.project-info > *', card));
              const timeline = entranceTimeline();
              if (icon.length) timeline.fromTo(icon, { y: 50, scale: 0.8, rotation: -10, opacity: 0 }, { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 1 }, 0);
              if (details.length) timeline.fromTo(details, { y: 27, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.075 }, 0.12);
              enterOnce(card, timeline, [...icon, ...details]);
            });

            selectAll('.skill-card, .work-experience, .education-card, .featured-copy, .contact-links').forEach((group) => {
              const items = own([...group.children]);
              if (!items.length) return;
              const timeline = entranceTimeline().fromTo(items,
                { y: 25, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.075 }, 0);
              enterOnce(group, timeline, items);
            });

            selectAll('.summary-visual').forEach((diagram) => {
              const lines = own(selectAll('.diagram-line', diagram));
              const nodes = own(selectAll('.diagram-nodes > g, .diagram-tables > rect', diagram));
              const lengths = new Map(lines.map((line) => [line, Math.max(1, line.getTotalLength())]));
              const timeline = entranceTimeline();
              if (lines.length) timeline.fromTo(lines, {
                strokeDasharray: (_, line) => lengths.get(line),
                strokeDashoffset: (_, line) => lengths.get(line)
              }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.065, ease: 'power2.inOut' }, 0.08);
              if (nodes.length) timeline.fromTo(nodes,
                { scale: 0.7, opacity: 0, transformOrigin: '50% 50%' },
                { scale: 1, opacity: 1, stagger: 0.085, duration: 0.65 }, 0);
              enterOnce(diagram, timeline);
            });
          });

          desktopMedia.add('(min-width: 901px) and (hover: hover) and (pointer: fine)', () => {
            const heroText = document.querySelector('.hero-text');
            const heroNote = document.querySelector('.hero-note');
            own([heroText, heroNote]);
            if (heroText) gsap.to(heroText, {
              y: -45, ease: 'none',
              scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 0.7 }
            });
            if (heroNote) gsap.to(heroNote, {
              y: 35, rotation: -3, ease: 'none',
              scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 0.7 }
            });
            selectAll('.project-card').forEach((card, index) => {
              const icon = card.querySelector('.art-emoji > svg');
              if (!icon) return;
              own([icon]);
              const direction = index % 2 ? 1 : -1;
              gsap.fromTo(icon, { y: 18, rotation: -7 * direction }, {
                y: -18, rotation: 7 * direction, ease: 'none',
                scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
              });
            });
          });
        } catch (error) {
          restoreContent();
          console.warn('Enhanced motion could not start. Standard navigation remains available.', error);
          return;
        }

        return restoreContent;
      });

      const pageLoaded = document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
      Promise.allSettled([document.fonts?.ready || Promise.resolve(), pageLoaded])
        .then(() => ScrollTrigger.refresh());
    } catch (error) {
      root.classList.remove('has-advanced-motion');
      showContent();
      console.warn('Standard portfolio motion is being used.', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMotionEffects, { once: true });
  } else {
    startMotionEffects();
  }
})();
