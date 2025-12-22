(function (window, document) {
  'use strict';

  var NDT = (window.NDT = window.NDT || {});
  NDT.sections = NDT.sections || {};

  /* =========================================
     UTILITY: Intersection Observer Helper
     ========================================= */
  
  function initWhenVisible(selector, initFn, options) {
    var el = document.querySelector(selector);
    if (!el) return;
    
    var defaults = { rootMargin: '200px', threshold: 0.01 };
    var config = options ? Object.assign({}, defaults, options) : defaults;
    
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          initFn(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, config);
    
    observer.observe(el);
  }

  /* =========================================
     CORE TRUTHS – entrance animation
     ========================================= */

  NDT.initCoreTruths = function () {
    var gsap = NDT.gsap && NDT.gsap.gsap;
    var prefersReduced = !!NDT.prefersReducedMotion;

    var sections = NDT.qsa
      ? NDT.qsa('.ndt-core-truths')
      : Array.from(document.querySelectorAll('.ndt-core-truths'));

    if (!sections.length) return;

    sections.forEach(function (section) {
      var lines = section.querySelectorAll('.ndt-statement-line');
      var underline = section.querySelector('.ndt-underline');

      if (!lines.length) return;

      if (!gsap || prefersReduced) {
        lines.forEach(function (line) {
          line.style.opacity = '1';
          line.style.transform = 'none';
        });
        if (underline) {
          underline.style.opacity = '0.7';
          underline.classList.add('active');
        }
        return;
      }

      var tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      });

      tl.from(lines, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1
      });

      if (underline) {
        tl.fromTo(
          underline,
          { opacity: 0, scaleX: 0 },
          {
            opacity: 0.7,
            scaleX: 1,
            duration: 0.5,
            ease: 'power2.out',
            transformOrigin: 'left center',
            onComplete: function () {
              underline.classList.add('active');
            }
          },
          '-=0.25'
        );
      }
    });
  };

  if (typeof NDT.onReady === 'function') {
    NDT.onReady(NDT.initCoreTruths);
  } else {
    document.addEventListener('DOMContentLoaded', NDT.initCoreTruths);
  }

  /* =========================================
     TONE CARD – "How direct do you want it?"
     ========================================= */

  function initToneCardCore() {
    const card = document.querySelector('.ndt-tone-card');
    if (!card) return;
    if (card.dataset.ndtToneInit === '1') return;
    card.dataset.ndtToneInit = '1';

    const ambient = card.querySelector('.ndt-tone-ambient');
    const knob = card.querySelector('.ndt-tone-toggle-knob');
    const glow = card.querySelector('.ndt-tone-glow');
    const footerHighlight = card.querySelector('.ndt-tone-footer-highlight');
    const toggleBtns = card.querySelectorAll('.ndt-tone-toggle-btn');
    const items = card.querySelectorAll('.ndt-tone-item');
    const textWraps = card.querySelectorAll('.ndt-tone-text-wrap');

    if (!ambient || !knob || !glow || !footerHighlight) return;

    let activeTone = 'gentle';

    function lockToneHeights() {
      if (!textWraps.length) return;

      textWraps.forEach(function (wrap) {
        wrap.style.height = '';

        const texts = wrap.querySelectorAll('.ndt-tone-text');
        if (!texts.length) return;

        let maxHeight = 0;

        texts.forEach(function (t) {
          const originalClassName = t.className;
          t.classList.add('ndt-tone-text--measure');
          const h = t.offsetHeight;
          if (h > maxHeight) maxHeight = h;
          t.className = originalClassName;
        });

        if (maxHeight > 0) {
          wrap.style.height = maxHeight + 'px';
        }
      });
    }

    function setTone(tone) {
      activeTone = tone;

      if (tone === 'blunt') {
        card.classList.add('blunt-mode');
      } else {
        card.classList.remove('blunt-mode');
      }

      toggleBtns.forEach(btn => {
        const isActive = btn.dataset.tone === tone;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      knob.className = 'ndt-tone-toggle-knob ' + tone;
      glow.className = 'ndt-tone-glow ' + tone;

      if (tone === 'gentle') {
        knob.style.background = 'linear-gradient(135deg, #F5F5F4 0%, #BFC4BB 100%)';
        knob.style.boxShadow =
          '0 0 12px rgba(141, 160, 191, 0.2),' +
          '0 8px 16px rgba(0, 0, 0, 0.4),' +
          '0 2px 4px rgba(0, 0, 0, 0.2),' +
          '0 0 0 1px rgba(0, 0, 0, 0.6) inset';
      } else {
        knob.style.background = 'linear-gradient(135deg, #D1837D 0%, #A14553 100%)';
        knob.style.boxShadow =
          '0 0 12px rgba(161, 69, 83, 0.2),' +
          '0 8px 16px rgba(0, 0, 0, 0.4),' +
          '0 2px 4px rgba(0, 0, 0, 0.2),' +
          '0 0 0 1px rgba(0, 0, 0, 0.6) inset';
      }

      ambient.className = 'ndt-tone-ambient ' + tone;
      footerHighlight.className = 'ndt-tone-footer-highlight ' + tone;
      footerHighlight.textContent = tone.charAt(0).toUpperCase() + tone.slice(1);

      const texts = card.querySelectorAll('.ndt-tone-text');
      texts.forEach(text => {
        const textTone = text.dataset.tone;
        if (textTone === tone) {
          text.classList.add('active');
          text.classList.remove('inactive', 'gentle-inactive', 'blunt-inactive');
        } else {
          text.classList.remove('active');
          text.classList.add('inactive');
          if (textTone === 'gentle') {
            text.classList.add('gentle-inactive');
          } else {
            text.classList.add('blunt-inactive');
          }
        }
      });
    }

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const tone = btn.dataset.tone;
        if (tone && tone !== activeTone) {
          setTone(tone);
        }
      });
    });

    items.forEach(item => {
      item.addEventListener('mouseenter', function () {
        items.forEach(other => {
          if (other !== item) other.classList.add('dimmed');
        });
      });

      item.addEventListener('mouseleave', function () {
        items.forEach(other => other.classList.remove('dimmed'));
      });
    });

    setTone('gentle');
    lockToneHeights();

    let toneResizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(toneResizeTimer);
      toneResizeTimer = setTimeout(lockToneHeights, 150);
    });
  }

  // Defer particle creation until visible
  function initToneCardParticles() {
    const card = document.querySelector('.ndt-tone-card');
    if (!card) return;
    if (card.dataset.ndtToneParticles === '1') return;
    card.dataset.ndtToneParticles = '1';

    const particlesContainer = card.querySelector('.ndt-tone-particles');
    if (!particlesContainer) return;

    const colors = [
      'var(--ndt-primary, #BAA2E7)',
      'var(--ndt-utility-sky, #7895C4)',
      'var(--ndt-utility-ochre, #9D8058)',
      'var(--ndt-success, #85A894)'
    ];

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'ndt-tone-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      const size = Math.random() * 3 + 1;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDelay = Math.random() * 5 + 's';
      particle.style.animationDuration = 20 + Math.random() * 10 + 's';
      particlesContainer.appendChild(particle);
    }
  }

  // Initialize core immediately, defer particles
  document.addEventListener('DOMContentLoaded', function() {
    initToneCardCore();
    initWhenVisible('.ndt-tone-card', initToneCardParticles);
  });

  /* =========================================
     SERVICES SUMMARY STRIP
     ========================================= */

  // No initialization needed - pure CSS/HTML

  /* =========================================
     SERVICES SELECTOR CARD
     ========================================= */

  function initServicesCardCore() {
    const card = document.getElementById('ndtServicesCard');
    if (!card) return;
    if (card.dataset.ndtServicesInit === '1') return;
    card.dataset.ndtServicesInit = '1';

    const items = card.querySelectorAll('.ndt-services-item');
    const scheduleThumb = document.getElementById('scheduleThumb');
    const scheduleGlow = document.getElementById('scheduleGlow');
    const dogThumb = document.getElementById('dogThumb');
    const dogGlow = document.getElementById('dogGlow');
    const resultMain = document.getElementById('resultMain');
    const resultAlt = document.getElementById('resultAlt');

    const firstItem = items[0];
    if (firstItem) {
      firstItem.classList.add('ndt-services-item--nudge');
      setTimeout(() => {
        firstItem.classList.remove('ndt-services-item--nudge');
      }, 3200);
    }

    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        items.forEach(i => {
          if (i !== item) i.classList.add('dimmed');
        });
      });

      item.addEventListener('mouseleave', () => {
        items.forEach(i => i.classList.remove('dimmed'));
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
        }
      });
    });

    const state = {
      schedule: null,
      dog: null
    };

    const recommendations = {
      'slammed|puppy':   { main: 'Board & train · 4 weeks', alt: 'Alt: Day train' },
      'slammed|manners': { main: 'Board & train · 4 weeks', alt: 'Alt: Day train' },
      'slammed|spicy':   { main: 'Board & train · 6 weeks', alt: 'Alt: Day train' },
      'some|puppy':      { main: 'Day train',               alt: 'Alt: Private lessons' },
      'some|manners':    { main: 'Day train',               alt: 'Alt: Board & train · 4 weeks' },
      'some|spicy':      { main: 'Board & train · 6 weeks', alt: 'Alt: Day train' },
      'love|puppy':      { main: 'Private lessons',         alt: 'Alt: Group classes' },
      'love|manners':    { main: 'Private lessons',         alt: 'Alt: Group classes' },
      'love|spicy':      { main: 'Private lessons',         alt: 'Alt: Board & train · 6 weeks' }
    };

    function getProgramFromText(text) {
      if (!text) return null;
      const t = text.toLowerCase();
      if (t.includes('board & train')) return 'board';
      if (t.includes('day train')) return 'day';
      if (t.includes('private')) return 'private';
      if (t.includes('group')) return 'group';
      return null;
    }

    function clearActive() {
      items.forEach(i => i.classList.remove('active'));
    }

    function resetResultColor() {
      resultMain.style.color = '#BAA2E7';
    }

    function updateResult() {
      if (!state.schedule || !state.dog) {
        clearActive();
        resetResultColor();
        resultMain.textContent = 'Choose your schedule and dog above.';
        resultAlt.textContent = 'We will suggest the best starting point.';
        return;
      }

      const key = state.schedule + '|' + state.dog;
      const rec = recommendations[key];

      if (!rec) {
        clearActive();
        resetResultColor();
        resultMain.textContent = 'We could not match a program.';
        resultAlt.textContent = 'Try adjusting your answers.';
        return;
      }

      resultMain.textContent = rec.main;
      resultAlt.textContent = rec.alt;

      clearActive();

      const mainProgram = getProgramFromText(rec.main);
      if (mainProgram) {
        const target = card.querySelector('.ndt-services-item[data-program="' + mainProgram + '"]');
        if (target) {
          target.classList.add('active');
          const color = target.getAttribute('data-color');
          if (color) {
            resultMain.style.color = color;
          } else {
            resetResultColor();
          }
        } else {
          resetResultColor();
        }
      } else {
        resetResultColor();
      }
    }

    function setupToggle(toggleEl, type, defaultIndex) {
      const options = toggleEl.querySelectorAll('.ndt-services-toggle-option');
      const thumb = type === 'schedule' ? scheduleThumb : dogThumb;
      const glow = type === 'schedule' ? scheduleGlow : dogGlow;
      const count = options.length;

      function setActive(index) {
        const percent = 100 / count;

        if (thumb) {
          thumb.style.width = percent + '%';
          thumb.style.left = (percent * index) + '%';
          thumb.style.opacity = '1';
        }

        if (glow) {
          glow.style.left = (percent * index + percent / 2) + '%';
          glow.style.opacity = '0.4';
        }

        options.forEach((opt, i) => {
          opt.classList.toggle('active', i === index);
        });

        const activeOpt = options[index];
        const value = activeOpt.getAttribute('data-value');
        state[type] = value;

        if (type === 'dog' && thumb) {
          thumb.className = 'ndt-services-toggle-thumb ' + value;
        }

        updateResult();
      }

      options.forEach((opt, i) => {
        opt.addEventListener('click', () => setActive(i));
        opt.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActive(i);
          }
        });
      });

      if (typeof defaultIndex === 'number') {
        setActive(defaultIndex);
      }
    }

    const scheduleToggle = card.querySelector('[data-toggle="schedule"]');
    const dogToggle = card.querySelector('[data-toggle="dog"]');

    if (scheduleToggle) setupToggle(scheduleToggle, 'schedule', 1);
    if (dogToggle) setupToggle(dogToggle, 'dog', 1);
  }

  function initServicesCardParticles() {
    const card = document.getElementById('ndtServicesCard');
    if (!card) return;
    if (card.dataset.ndtServicesParticles === '1') return;
    card.dataset.ndtServicesParticles = '1';

    const ambient = document.getElementById('ndtServicesAmbient');
    if (!ambient) return;

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'ndt-services-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.width = (Math.random() * 3 + 1) + 'px';
      particle.style.height = particle.style.width;
      particle.style.background = '#BAA2E7';
      particle.style.animationDelay = Math.random() * 5 + 's';
      particle.style.animationDuration = (20 + Math.random() * 10) + 's';
      ambient.appendChild(particle);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    initServicesCardCore();
    initWhenVisible('#ndtServicesCard', initServicesCardParticles);
  });

  /* =========================================
     FULLSCREEN DRAG GALLERY
     ========================================= */

  (function() {
    'use strict';

    if (typeof window === 'undefined') return;
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not loaded - drag gallery disabled');
      return;
    }

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const section = document.querySelector('.ndt-gallery-fs');
    const canvas  = document.getElementById('ndtGalleryCanvas');
    const grid    = document.getElementById('ndtGalleryGrid');
    const tiles   = grid ? Array.from(grid.querySelectorAll('.ndt-gallery-tile')) : [];

    if (!section || !canvas || !grid || !tiles.length) return;

    let draggables = [];
    let hasDragged = false;
    let dragScrollRef = null;
    const RESET_SCROLL_DELTA = 40;

    const mobileToggleBtn = section.querySelector('.ndt-gallery-fs-toggle');

    function resetTiles(animate) {
      const config = { x: 0, y: 0, clearProps: 'transform' };

      if (animate) {
        gsap.to(tiles, {
          ...config,
          duration: 0.45,
          ease: 'power3.out'
        });
      } else {
        gsap.set(tiles, config);
      }

      tiles.forEach(tile => tile.classList.remove('is-dragging'));
      hasDragged = false;
      dragScrollRef = null;
    }

    function createDraggables() {
      draggables.forEach(d => d && d.kill && d.kill());
      draggables = [];
      resetTiles(false);

      if (window.innerWidth < 768 || typeof Draggable === 'undefined') return;

      tiles.forEach((tile, index) => {
        tile.style.zIndex = index + 1;

        const draggable = Draggable.create(tile, {
          type: 'x,y',
          bounds: section,
          edgeResistance: 0.85,
          inertia: false,
          onDragStart: function() {
            hasDragged = true;
            dragScrollRef = window.scrollY;

            tiles.forEach(t => {
              t.style.zIndex = parseInt(t.style.zIndex || 1, 10);
            });

            this.target.style.zIndex = tiles.length + 10;
            this.target.classList.add('is-dragging');

            gsap.to(this.target, {
              scale: 1.05,
              duration: 0.18,
              ease: 'power2.out'
            });
          },
          onDragEnd: function() {
            const target = this.target;
            target.classList.remove('is-dragging');

            gsap.to(target, {
              scale: 1,
              duration: 0.22,
              ease: 'power2.out'
            });
          }
        })[0];

        draggables.push(draggable);
      });
    }

    if (!prefersReducedMotion && typeof ScrollTrigger !== 'undefined') {
      gsap.from(tiles, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.04,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    }

    function handleScrollReset() {
      if (!hasDragged || dragScrollRef === null) return;
      const delta = Math.abs(window.scrollY - dragScrollRef);
      if (delta >= RESET_SCROLL_DELTA) {
        resetTiles(true);
      }
    }

    window.addEventListener('scroll', handleScrollReset, { passive: true });

    function updateToggleLabel() {
      if (!mobileToggleBtn) return;
      const expanded = section.classList.contains('ndt-gallery-fs--expanded');
      mobileToggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      mobileToggleBtn.textContent = expanded ? 'Show fewer dogs' : 'Show all dogs';
    }

    if (mobileToggleBtn) {
      mobileToggleBtn.addEventListener('click', function() {
        section.classList.toggle('ndt-gallery-fs--expanded');
        updateToggleLabel();
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      });
    }

    function init() {
      createDraggables();
      updateToggleLabel();
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      init();
    } else {
      window.addEventListener('DOMContentLoaded', init);
    }

    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        createDraggables();
        updateToggleLabel();
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }, 250);
    });
  })();

  /* =========================================
     GLASS HERO WIDGET – START
     ========================================= */

  (function (window, document) {
    'use strict';

    if (!window.gsap) return;

    function initGlassHeroCard() {
      const shell = document.querySelector('.ndt-gh-shell');
      if (!shell) return;
      if (shell.dataset.ndtGlassInit === '1') return;
      shell.dataset.ndtGlassInit = '1';

      const card = shell.querySelector('.ndt-gh-card');
      if (!card) return;

      const stamp      = card.querySelector('.ndt-gh-stamp');
      const preTitle   = card.querySelector('.ndt-gh-pretitle');
      const title      = card.querySelector('.ndt-gh-title');
      const iconGroups = card.querySelectorAll('.ndt-gh-icon');
      const links      = card.querySelectorAll('.ndt-gh-link');
      let activeIcon   = null;

      /* ================================
         Mobile interaction tracking
         ================================ */

      const isMobileViewport = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;

      function markGlassHeroInteracted() {
        shell.dataset.ndtInteracted = '1';
      }

      function setIconSelection(target, options) {
        if (!iconGroups.length) return;
        const opts = options || {};

        if (!target) {
          iconGroups.forEach(function (icon) {
            const wasActive = icon.classList.contains('is-active');
            icon.classList.remove('is-active', 'is-selected');
            icon.setAttribute('aria-pressed', 'false');
            if (wasActive) {
              icon.dispatchEvent(
                new CustomEvent('ndt-gh-icon-toggle', {
                  detail: { active: false },
                  bubbles: false
                })
              );
            }
          });
          activeIcon = null;
          return;
        }

        if (activeIcon === target && !opts.force) return;

        iconGroups.forEach(function (icon) {
          const isActive = icon === target;
          const wasActive = icon.classList.contains('is-active');

          icon.classList.toggle('is-active', isActive);
          icon.classList.toggle('is-selected', isActive);
          icon.setAttribute('aria-pressed', isActive ? 'true' : 'false');

          if (isActive && !wasActive) {
            icon.dispatchEvent(
              new CustomEvent('ndt-gh-icon-toggle', {
                detail: { active: true },
                bubbles: false
              })
            );
          } else if (!isActive && wasActive) {
            icon.dispatchEvent(
              new CustomEvent('ndt-gh-icon-toggle', {
                detail: { active: false },
                bubbles: false
              })
            );
          }
        });

        activeIcon = target;
      }

      if (iconGroups.length) {
        iconGroups.forEach(function (icon) {
          icon.setAttribute('role', 'button');
          icon.setAttribute('tabindex', '0');
          icon.setAttribute('aria-pressed', 'false');

          icon.addEventListener('click', function () {
            setIconSelection(icon);
            markGlassHeroInteracted();
          });

          icon.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              icon.click();
            }
          });

          if (!isMobileViewport) {
            icon.addEventListener('focusin', function () {
              setIconSelection(icon);
            });
            icon.addEventListener('focusout', function (event) {
              if (!icon.contains(event.relatedTarget)) {
                setIconSelection(null);
              }
            });
          } else {
            icon.addEventListener('focusin', function () {
              setIconSelection(icon);
            });
            icon.addEventListener('focusout', function (event) {
              if (!icon.contains(event.relatedTarget)) {
                setIconSelection(null);
              }
            });
          }
        });

        if (isMobileViewport) {
          setIconSelection(iconGroups[0], { force: true });
        }
      }

      if (isMobileViewport) {
        shell.addEventListener('touchstart', function onFirstTouch() {
          markGlassHeroInteracted();
          shell.removeEventListener('touchstart', onFirstTouch);
        }, { passive: true, once: true });
      }

      /* ================================
         1. Intro reveal timeline - DEFERRED
         ================================ */

      const prefersReduced =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Make card frame visible immediately (no position animation)
      gsap.set(card, { opacity: 1 });

      if (prefersReduced) {
        // Static reveal for reduced motion
        if (stamp) gsap.set(stamp, { scale: 1, rotation: 0, opacity: 1 });
        if (preTitle) gsap.set(preTitle, { opacity: 1, y: 0 });
        if (title) gsap.set(title, { opacity: 1, y: 0 });
        if (iconGroups.length) gsap.set(iconGroups, { opacity: 1, y: 0 });
        if (links.length) gsap.set(links, { opacity: 1, x: 0 });
      } else {
        // Animate content when scrolled into view
        const introTl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true
          }
        });

        if (stamp) {
          introTl.from(
            stamp,
            {
              scale: 0,
              rotation: -180,
              duration: 0.7,
              ease: 'back.out(1.7)'
            },
            0
          );
        }

        if (preTitle) {
          introTl.from(
            preTitle,
            {
              opacity: 0,
              y: 8,
              duration: 0.45
            },
            '-=0.5'
          );
        }

        if (title) {
          introTl.from(
            title,
            {
              opacity: 0,
              y: 16,
              duration: 0.6,
              ease: 'back.out(1.2)'
            },
            '-=0.4'
          );
        }

        if (iconGroups.length) {
          introTl.from(
            iconGroups,
            {
              opacity: 0,
              y: 12,
              duration: 0.4,
              stagger: 0.08
            },
            '-=0.3'
          );
        }

        if (links.length) {
          introTl.from(
            links,
            {
              opacity: 0,
              x: -8,
              duration: 0.45,
              stagger: 0.06
            },
            '-=0.25'
          );
        }
      }

      /* ================================
         2. 3D tilt on the glass card
         ================================ */

      if (!prefersReduced && !isMobileViewport) {
        gsap.set(card, {
          transformPerspective: 900,
          transformOrigin: '50% 50%',
          transformStyle: 'preserve-3d',
          willChange: 'transform'
        });

        const tiltTarget = card;
        let rafId = null;
        let lastEvent = null;

        const updateTilt = function () {
          rafId = null;
          if (!lastEvent) return;

          const e = lastEvent;
          const rect = tiltTarget.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const pointerX = e.clientX - centerX;
          const pointerY = e.clientY - centerY;

          let rotateX = (pointerY / (rect.height / 2)) * -4;
          let rotateY = (pointerX / (rect.width / 2)) * 4;
          rotateX = Math.max(-4, Math.min(4, rotateX));
          rotateY = Math.max(-4, Math.min(4, rotateY));

          gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            duration: 0.22,
            ease: 'power1.out',
            overwrite: 'auto'
          });
        };

        const handleTilt = function (e) {
          lastEvent = e;
          if (rafId === null) {
            rafId = requestAnimationFrame(updateTilt);
          }
        };

        const resetTilt = function () {
          lastEvent = null;
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        };

        tiltTarget.addEventListener('mousemove', handleTilt);
        tiltTarget.addEventListener('mouseleave', resetTilt);
      }

      /* ================================
         2b. Mobile: Touch tap response
         ================================ */
      if (!prefersReduced && isMobileViewport) {
        card.addEventListener('touchstart', function () {
          card.classList.add('is-pressed');
        }, { passive: true });

        card.addEventListener('touchend', function () {
          card.classList.remove('is-pressed');
          
          gsap.fromTo(card, 
            { scale: 0.995 },
            { 
              scale: 1, 
              duration: 0.3, 
              ease: 'elastic.out(1.2, 0.5)',
              overwrite: 'auto'
            }
          );
        }, { passive: true });

        card.addEventListener('touchcancel', function () {
          card.classList.remove('is-pressed');
        }, { passive: true });
      }

      /* ================================
         4. CTA hover timelines
         ================================ */

      links.forEach(function (link) {
        const sweep = link.querySelector('.ndt-gh-link-sweep');
        const text  = link.querySelector('.ndt-gh-link-text');
        const arrow = link.querySelector('.ndt-gh-link-arrow');

        if (!sweep || !text || !arrow) return;

        const hoverTl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power2.out', duration: 0.26 }
        });

        hoverTl
          .to(
            link,
            {
              y: -2,
              scale: 1.04,
              duration: 0.22
            },
            0
          )
          .to(
            sweep,
            {
              scaleX: 1,
              duration: 0.22
            },
            0
          )
          .to(
            text,
            {
              letterSpacing: '0.04em',
              x: -2,
              duration: 0.24
            },
            0
          )
          .to(
            arrow,
            {
              opacity: 1,
              x: 0,
              duration: 0.22,
              ease: 'back.out(2)'
            },
            0.05
          );

        link.addEventListener('mouseenter', function () {
          hoverTl.play();
        });

        link.addEventListener('mouseleave', function () {
          hoverTl.reverse();
        });

        link.addEventListener('focusin', function () {
          hoverTl.play();
        });

        link.addEventListener('focusout', function () {
          hoverTl.reverse();
        });

        link.addEventListener('click', function () {
          hoverTl.restart();
        });
      });
    }

    // Use Intersection Observer to initialize when visible
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        initWhenVisible('.ndt-gh-shell', initGlassHeroCard, { rootMargin: '300px' });
      });
    } else {
      initWhenVisible('.ndt-gh-shell', initGlassHeroCard, { rootMargin: '300px' });
    }
  })(window, document);

  /* =========================================
     GLASS HERO ICON: Chaos blocks
     ========================================= */

  (function () {
    if (!window.gsap) return;

    const chaosGroup = document.getElementById('icon-group-chaos');
    if (!chaosGroup) return;

    const blocks = chaosGroup.querySelectorAll('.chaos-block');
    if (!blocks.length) return;

    const isMobile = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
    let isOrganized = false;

    const chaosColors = [
      'var(--ndt-primary, #BAA2E7)',
      'var(--ndt-utility-sky, #7895C4)',
      'var(--ndt-utility-ochre, #9D8058)',
      'var(--ndt-success, #85A894)'
    ];
    const organizedColor = 'var(--ndt-primary, #BAA2E7)';

    function ndtChaosOffset() {
      return (Math.random() - 0.5) * 26;
    }

    function ndtChaosRotation() {
      return (Math.random() - 0.5) * 120;
    }

    function applyChaosPalette() {
      blocks.forEach(function (block, index) {
        block.style.fill = chaosColors[index % chaosColors.length];
      });
    }

    function applyOrganizedPalette() {
      blocks.forEach(function (block) {
        block.style.fill = organizedColor;
      });
    }

    gsap.set(blocks, {
      transformOrigin: '50% 50%',
      x: ndtChaosOffset,
      y: ndtChaosOffset,
      rotation: ndtChaosRotation,
      scale: 0.85,
      opacity: 0.8
    });
    applyChaosPalette();

    function animateToOrganized() {
      isOrganized = true;
      applyOrganizedPalette();
      gsap.to(blocks, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: 'back.out(1.7)'
      });
    }

    function animateToChaos() {
      isOrganized = false;
      applyChaosPalette();
      gsap.to(blocks, {
        x: ndtChaosOffset,
        y: ndtChaosOffset,
        rotation: ndtChaosRotation,
        scale: 0.85,
        opacity: 0.8,
        duration: 0.5,
        ease: 'power2.out'
      });
    }

    chaosGroup.addEventListener('ndt-gh-icon-toggle', function (event) {
      if (!event.detail) return;
      if (event.detail.active) {
        if (!isOrganized) animateToOrganized();
      } else {
        if (isOrganized) animateToChaos();
      }
    });

    if (!isMobile) {
      chaosGroup.addEventListener('mouseenter', function () {
        if (chaosGroup.getAttribute('aria-pressed') === 'true') return;
        animateToOrganized();
      });
      chaosGroup.addEventListener('mouseleave', function () {
        if (chaosGroup.getAttribute('aria-pressed') === 'true') return;
        animateToChaos();
      });
    }
  })();

  /* =========================================
     GLASS HERO ICON: Signal strength bars
     ========================================= */

  (function (window, document) {
    'use strict';

    if (!window.gsap) return;

    const signalGroup = document.getElementById('icon-group-wifi');
    if (!signalGroup) return;

    const signalBars = signalGroup.querySelectorAll('.signal-bar');
    if (!signalBars.length) return;

    const isMobile = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
    let isActive = false;

    const wifiColor = 'var(--ndt-success, #85A894)';
    signalBars.forEach(function (bar) {
      bar.style.fill = wifiColor;
    });

    gsap.set(signalBars, {
      opacity: 0.3,
      scaleY: 1,
      transformOrigin: 'bottom center'
    });

    function animateToActive() {
      isActive = true;
      gsap.killTweensOf(signalBars);
      gsap.to(signalBars, {
        opacity: 1,
        duration: 0.15,
        stagger: 0.08,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      gsap.to(signalBars, {
        scaleY: 1.05,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        delay: 0.3,
        overwrite: 'auto'
      });
    }

    function animateToInactive() {
      isActive = false;
      gsap.killTweensOf(signalBars);
      gsap.to(signalBars, {
        opacity: 0.3,
        scaleY: 1,
        duration: 0.25,
        clearProps: 'scaleY',
        overwrite: 'auto',
        onComplete: function () {
          gsap.set(signalBars, { opacity: 0.3, scaleY: 1 });
        }
      });
    }

    signalGroup.addEventListener('ndt-gh-icon-toggle', function (event) {
      if (event.detail && event.detail.active) {
        animateToActive();
      } else {
        animateToInactive();
      }
    });

    if (!isMobile) {
      signalGroup.addEventListener('mouseenter', function () {
        if (signalGroup.getAttribute('aria-pressed') === 'true') return;
        animateToActive();
      });
      signalGroup.addEventListener('mouseleave', function () {
        if (signalGroup.getAttribute('aria-pressed') === 'true') return;
        animateToInactive();
      });
    }
  })(window, document);

  /* =========================================
     GLASS HERO ICON: Reality melt
     ========================================= */

  (function () {
    if (!window.gsap) return;

    const realityGroup = document.getElementById('icon-group-reality');
    if (!realityGroup) return;

    const displacementMap = realityGroup.querySelector('#ndt-melt-displacement');
    const earthGroup = realityGroup.querySelector('.ndt-earth-group');
    if (!displacementMap || !earthGroup) return;

    const svg = realityGroup.querySelector('svg');
    const ns = 'http://www.w3.org/2000/svg';
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(ns, 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }

    let gradient = svg.querySelector('#ndt-earth-gradient');
    if (!gradient) {
      gradient = document.createElementNS(ns, 'linearGradient');
      gradient.setAttribute('id', 'ndt-earth-gradient');
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '100%');

      const stop1 = document.createElementNS(ns, 'stop');
      stop1.setAttribute('offset', '0%');
      gradient.appendChild(stop1);

      const stop2 = document.createElementNS(ns, 'stop');
      stop2.setAttribute('offset', '60%');
      gradient.appendChild(stop2);

      const stop3 = document.createElementNS(ns, 'stop');
      stop3.setAttribute('offset', '100%');
      gradient.appendChild(stop3);

      defs.appendChild(gradient);
    }

    const gradientStops = gradient.querySelectorAll('stop');
    const basePalette = {
      ocean: '#1E74B4',
      mid: '#3BB3C8',
      land: '#3C8E4E'
    };

    function setGradientColors(palette) {
      if (gradientStops[0]) gradientStops[0].setAttribute('stop-color', palette.ocean);
      if (gradientStops[1]) gradientStops[1].setAttribute('stop-color', palette.mid);
      if (gradientStops[2]) gradientStops[2].setAttribute('stop-color', palette.land);
    }

    const earthPath = earthGroup.querySelector('path');
    if (earthPath) {
      earthPath.setAttribute('fill', 'url(#ndt-earth-gradient)');
    }

    setGradientColors(basePalette);

    const isMobile = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
    let isMelted = false;
    const meltState = { scale: 0, y: 0 };

    function applyMelt() {
      displacementMap.setAttribute('scale', meltState.scale);
      earthGroup.style.transform = 'translateY(' + meltState.y + 'px)';
      earthGroup.style.opacity = 1 - meltState.y / 20;
    }

    function animateToMelted() {
      isMelted = true;
      gsap.killTweensOf(meltState);

      gsap.to(meltState, {
        scale: 15,
        y: 6,
        duration: 0.4,
        ease: 'power2.in',
        onUpdate: applyMelt
      });
    }

    function animateToNormal() {
      isMelted = false;
      gsap.killTweensOf(meltState);

      gsap.to(meltState, {
        scale: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
        onUpdate: applyMelt,
        onComplete: function () {
          meltState.scale = 0;
          meltState.y = 0;
          applyMelt();
          earthGroup.style.opacity = 1;
        }
      });
    }

    realityGroup.addEventListener('ndt-gh-icon-toggle', function (event) {
      if (event.detail && event.detail.active) {
        animateToMelted();
      } else {
        animateToNormal();
      }
    });

    if (!isMobile) {
      realityGroup.addEventListener('mouseenter', function () {
        if (realityGroup.getAttribute('aria-pressed') === 'true') return;
        animateToMelted();
      });
      realityGroup.addEventListener('mouseleave', function () {
        if (realityGroup.getAttribute('aria-pressed') === 'true') return;
        animateToNormal();
      });
    }
  })();

  /* =========================================
     GLASS HERO WIDGET – END
     ========================================= */

  /* =========================================
     PURPOSE WIDGET – reveal + magnetic hover
     ========================================= */

  (function (window, document) {
    'use strict';

    if (!window.NDT) {
      console.warn('NDT not found for ndt-purpose-widget; falling back to static reveal.');
      document.addEventListener('DOMContentLoaded', function () {
        var shell = document.querySelector('.ndt-purpose-shell');
        if (!shell) return;

        var card       = shell.querySelector('.ndt-purpose-card');
        var header     = shell.querySelector('.ndt-purpose-header');
        var footer     = shell.querySelector('.ndt-purpose-footer');
        var colHeaders = shell.querySelectorAll('.ndt-purpose-col-header');
        var colUnder   = shell.querySelectorAll('.ndt-purpose-col-underline');
        var items      = shell.querySelectorAll('.ndt-purpose-item');
        var chars      = shell.querySelectorAll('.ndt-purpose-char');
        var wordLines  = shell.querySelectorAll('.ndt-purpose-word-underline');

        if (card) card.classList.remove('ndt-purpose-hidden');
        if (header) header.classList.remove('ndt-purpose-hidden');
        if (footer) footer.classList.remove('ndt-purpose-hidden');

        colHeaders.forEach(function (h) { h.classList.remove('ndt-purpose-hidden'); });
        colUnder.forEach(function (u) { u.classList.remove('ndt-purpose-hidden'); u.style.width = '100%'; });
        items.forEach(function (it) { it.classList.remove('ndt-purpose-hidden'); });
        chars.forEach(function (ch) { ch.style.opacity = '1'; ch.style.transform = 'none'; });
        wordLines.forEach(function (u) { u.style.width = '100%'; u.style.opacity = '1'; });
      });
      return;
    }

    var NDT = window.NDT;

    NDT.initPurposeWidget = function () {
      var shell = document.querySelector('.ndt-purpose-shell');
      if (!shell) return;

      var card       = shell.querySelector('.ndt-purpose-card');
      var header     = shell.querySelector('.ndt-purpose-header');
      var footer     = shell.querySelector('.ndt-purpose-footer');
      var colHeaders = shell.querySelectorAll('.ndt-purpose-col-header');
      var colUnder   = shell.querySelectorAll('.ndt-purpose-col-underline');
      var items      = shell.querySelectorAll('.ndt-purpose-item');

      var toolChars    = shell.querySelectorAll('.ndt-purpose-word--tool .ndt-purpose-char');
      var resultChars  = shell.querySelectorAll('.ndt-purpose-word--result .ndt-purpose-char');
      var productChars = shell.querySelectorAll('.ndt-purpose-word--product .ndt-purpose-char');

      var ulTool    = shell.querySelector('.ndt-purpose-word--tool .ndt-purpose-word-underline');
      var ulResult  = shell.querySelector('.ndt-purpose-word--result .ndt-purpose-word-underline');
      var ulProduct = shell.querySelector('.ndt-purpose-word--product .ndt-purpose-word-underline');

      var wordUnderlinesAll = shell.querySelectorAll('.ndt-purpose-word-underline');

      var gsap = NDT.gsap && NDT.gsap.gsap;
      var prefersReduced = !!NDT.prefersReducedMotion;

      var purposeMobileQuery = window.matchMedia('(max-width: 767px)');

      function initPurposeMobileDeck() {
        if (!purposeMobileQuery.matches) return;
        if (shell.dataset.purposeMobileReady === '1') return;

        var cardEl = shell.querySelector('.ndt-purpose-card');
        var colsRoot = shell.querySelector('.ndt-purpose-cols');
        var cols = colsRoot ? colsRoot.querySelectorAll('.ndt-purpose-col') : null;
        if (!cardEl || !cols || !cols.length) return;

        var views = [
          { key: 'heavy', label: 'Heavier days', colIndex: 0 },
          { key: 'potential', label: 'More potential', colIndex: 1 }
        ];

        views = views.filter(function (v) { return !!cols[v.colIndex]; });
        if (!views.length) return;

        var activeViewKey = views[0].key;

        var mobileTabs = document.createElement('div');
        mobileTabs.className = 'ndt-purpose-mobile-tabs';
        mobileTabs.setAttribute('role', 'tablist');
        mobileTabs.setAttribute('aria-label', 'Toggle between real-life scenarios');

        var thumb = document.createElement('div');
        thumb.className = 'ndt-purpose-mobile-tab-thumb';
        mobileTabs.appendChild(thumb);

        var tabButtons = {};
        var tabPanelsByKey = {};

        views.forEach(function (view, index) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ndt-purpose-mobile-tab';
          btn.textContent = view.label;
          btn.setAttribute('data-ndt-view', view.key);
          btn.setAttribute('role', 'tab');
          btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

          var colEl = cols[view.colIndex];
          if (colEl) {
            var panelId = colEl.id || ('ndt-purpose-panel-' + view.key);
            colEl.id = panelId;
            colEl.setAttribute('role', 'tabpanel');
            colEl.setAttribute('aria-labelledby', 'ndt-purpose-tab-' + view.key);
            tabPanelsByKey[view.key] = colEl;
            btn.id = 'ndt-purpose-tab-' + view.key;
            btn.setAttribute('aria-controls', panelId);
          }

          btn.addEventListener('click', function () {
            if (!purposeMobileQuery.matches) return;
            setMobileView(view.key);
          });

          btn.addEventListener('keydown', function (event) {
            if (!purposeMobileQuery.matches) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setMobileView(view.key);
            }
          });

          tabButtons[view.key] = btn;
          mobileTabs.appendChild(btn);
        });

        var swipeHint = document.createElement('p');
        swipeHint.className = 'ndt-purpose-mobile-swipe-hint';
        swipeHint.textContent = 'Tap or swipe to flip between these two real moments';

        var contentRoot = shell.querySelector('.ndt-purpose-content');
        if (contentRoot && colsRoot) {
          contentRoot.insertBefore(mobileTabs, colsRoot);
          contentRoot.insertBefore(swipeHint, colsRoot);
        } else if (contentRoot) {
          contentRoot.insertBefore(mobileTabs, contentRoot.firstChild);
          contentRoot.insertBefore(swipeHint, mobileTabs.nextSibling);
        } else {
          shell.insertBefore(mobileTabs, shell.firstChild);
          shell.insertBefore(swipeHint, mobileTabs.nextSibling);
        }

        function setMobileView(viewKey) {
          var target = views.find(function (v) { return v.key === viewKey; }) || views[0];
          activeViewKey = target.key;

          cardEl.dataset.ndtMobileView = target.key;
          mobileTabs.dataset.activeView = target.key;

          Object.keys(tabButtons).forEach(function (key) {
            var isActive = key === target.key;
            var btn = tabButtons[key];
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
          });

          Object.keys(tabPanelsByKey).forEach(function (key) {
            var panel = tabPanelsByKey[key];
            var isActive = key === target.key;
            panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
          });
        }

        (function attachCategorySwipe(targetEl) {
          if (!targetEl) return;
          var startX = 0;
          var startY = 0;
          var tracking = false;

          targetEl.addEventListener('touchstart', function (event) {
            if (!purposeMobileQuery.matches) return;
            if (!event.touches || !event.touches.length) return;
            tracking = true;
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
          }, { passive: true });

          targetEl.addEventListener('touchend', function (event) {
            if (!tracking || !purposeMobileQuery.matches) return;
            tracking = false;
            if (!event.changedTouches || !event.changedTouches.length) return;

            var endX = event.changedTouches[0].clientX;
            var endY = event.changedTouches[0].clientY;
            var deltaX = endX - startX;
            var deltaY = endY - startY;

            var absX = Math.abs(deltaX);
            var absY = Math.abs(deltaY);
            var horizontalThreshold = 60;
            if (absX < horizontalThreshold) return;
            if (absX < absY * 2) return;

            var order = views.map(function (v) { return v.key; });
            var currentIndex = order.indexOf(activeViewKey);
            if (currentIndex === -1) currentIndex = 0;

            if (deltaX < 0 && currentIndex < order.length - 1) {
              setMobileView(order[currentIndex + 1]);
            } else if (deltaX > 0 && currentIndex > 0) {
              setMobileView(order[currentIndex - 1]);
            }
          }, { passive: true });
        })(colsRoot);

        var allItems = shell.querySelectorAll('.ndt-purpose-item');
        var openItem = null;

        function setItemOpenState(item, shouldOpen) {
          var detail = item.querySelector('.ndt-purpose-item-detail');
          if (!detail) return;

          item.dataset.ndtOpen = shouldOpen ? '1' : '0';
          item.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');

          if (shouldOpen) {
            detail.style.maxHeight = detail.scrollHeight + 'px';
          } else {
            detail.style.maxHeight = '0px';
          }
        }

        allItems.forEach(function (item) {
          var textEl = item.querySelector('.ndt-purpose-item-text');
          var originalText = textEl ? textEl.textContent.trim() : '';
          var detailAttr = item.getAttribute('data-detail') || '';
          var detailText = detailAttr || originalText;
          var existingDetail = item.querySelector('.ndt-purpose-item-detail');

          if (!existingDetail && detailText) {
            existingDetail = document.createElement('p');
            existingDetail.className = 'ndt-purpose-item-detail';
            existingDetail.textContent = detailText;
            item.appendChild(existingDetail);
          } else if (existingDetail && !existingDetail.textContent && detailText) {
            existingDetail.textContent = detailText;
          }

          if (!existingDetail) return;

          if (textEl && originalText) {
            item.setAttribute('data-ndt-label', originalText);
          }

          item.dataset.ndtOpen = '0';
          item.setAttribute('role', 'button');
          item.setAttribute('tabindex', '0');
          item.setAttribute('aria-expanded', 'false');

          var colEl = item.closest('.ndt-purpose-col');

          function toggleItem() {
            if (!purposeMobileQuery.matches) return;
            var isOpen = item.dataset.ndtOpen === '1';

            if (openItem && openItem !== item) {
              setItemOpenState(openItem, false);
            }

            if (isOpen) {
              setItemOpenState(item, false);
              openItem = null;
              if (colEl) {
                var anyOpenInCol = Array.prototype.some.call(
                  colEl.querySelectorAll('.ndt-purpose-item'),
                  function (other) {
                    return other.dataset.ndtOpen === '1';
                  }
                );
                if (!anyOpenInCol) {
                  var panel = colEl.querySelector('.ndt-purpose-mobile-panel');
                  if (panel) {
                    panel.classList.remove('is-visible');
                    panel.setAttribute('aria-hidden', 'true');
                  }
                }
              }
            } else {
              setItemOpenState(item, true);
              openItem = item;
              if (colEl) {
                var panel = colEl.querySelector('.ndt-purpose-mobile-panel');
                if (panel) {
                  var panelLabel = panel.querySelector('.ndt-purpose-mobile-panel-label');
                  var panelBody = panel.querySelector('.ndt-purpose-mobile-panel-body');

                  var labelText = item.getAttribute('data-ndt-label') || originalText || '';
                  var bodyText = detailText || '';

                  if (panelLabel) panelLabel.textContent = labelText;
                  if (panelBody) panelBody.textContent = bodyText;

                  panel.classList.add('is-visible');
                  panel.setAttribute('aria-hidden', 'false');
                }
              }
            }
          }

          item.addEventListener('touchstart', function (event) {
            if (!event.touches || !event.touches.length) return;
            var rect = item.getBoundingClientRect();
            var x = ((event.touches[0].clientX - rect.left) / rect.width) * 100;
            var y = ((event.touches[0].clientY - rect.top) / rect.height) * 100;
            item.style.setProperty('--tap-x', x + '%');
            item.style.setProperty('--tap-y', y + '%');
          }, { passive: true });

          item.addEventListener('click', function (event) {
            if (event.target.closest('a')) return;
            toggleItem();
          });

          item.addEventListener('keydown', function (event) {
            if (!purposeMobileQuery.matches) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              toggleItem();
            }
          });
        });

        cardEl.dataset.ndtMobileView = activeViewKey;
        mobileTabs.dataset.activeView = activeViewKey;
        setMobileView(activeViewKey);

        shell.dataset.purposeMobileReady = '1';
      }

      function setupMobileDeck() {
        initPurposeMobileDeck();

        if (typeof purposeMobileQuery.addEventListener === 'function') {
          purposeMobileQuery.addEventListener('change', function (evt) {
            if (evt.matches) {
              initPurposeMobileDeck();
            }
          });
        } else if (typeof purposeMobileQuery.addListener === 'function') {
          purposeMobileQuery.addListener(function (evt) {
            if (evt.matches) {
              initPurposeMobileDeck();
            }
          });
        }
      }

      function revealStatic() {
        if (card) card.classList.remove('ndt-purpose-hidden');
        if (header) header.classList.remove('ndt-purpose-hidden');
        if (footer) footer.classList.remove('ndt-purpose-hidden');

        colHeaders.forEach(function (h) { h.classList.remove('ndt-purpose-hidden'); });
        colUnder.forEach(function (u) { u.classList.remove('ndt-purpose-hidden'); u.style.width = '100%'; });
        items.forEach(function (it) { it.classList.remove('ndt-purpose-hidden'); });

        [toolChars, resultChars, productChars].forEach(function (list) {
          list.forEach(function (ch) {
            ch.style.opacity = '1';
            ch.style.transform = 'none';
          });
        });

        wordUnderlinesAll.forEach(function (u) {
          u.style.width = '100%';
          u.style.opacity = '1';
        });
      }

      if (!gsap || prefersReduced) {
        revealStatic();
        setupMobileDeck();
        return;
      }

      if (typeof NDT.gsap.registerPlugins === 'function') {
        NDT.gsap.registerPlugins();
      }

      if (card) {
        card.classList.remove('ndt-purpose-hidden');
        gsap.set(card, { opacity: 0, y: 18, scale: 0.995, transformOrigin: '50% 60%' });
      }

      if (header) {
        header.classList.remove('ndt-purpose-hidden');
        gsap.set(header, { opacity: 0, y: 12 });
      }

      if (colHeaders.length) {
        colHeaders.forEach(function (h) { h.classList.remove('ndt-purpose-hidden'); });
        gsap.set(colHeaders, { opacity: 0, y: 14 });
      }

      if (colUnder.length) {
        colUnder.forEach(function (u) { u.classList.remove('ndt-purpose-hidden'); });
        gsap.set(colUnder, { width: '0%' });
      }

      if (items.length) {
        items.forEach(function (it) { it.classList.remove('ndt-purpose-hidden'); });
        gsap.set(items, { opacity: 0, y: 10 });
      }

      if (footer) {
        footer.classList.remove('ndt-purpose-hidden');
        gsap.set(footer, { opacity: 0, y: 10 });
      }

      var allChars = []
        .concat(Array.prototype.slice.call(toolChars))
        .concat(Array.prototype.slice.call(resultChars))
        .concat(Array.prototype.slice.call(productChars));

      if (allChars.length) {
        gsap.set(allChars, { opacity: 0, yPercent: 40 });
      }

      if (wordUnderlinesAll.length) {
        gsap.set(wordUnderlinesAll, { width: 0, opacity: 0, transformOrigin: 'left center' });
      }

      var tlConfig = { 
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: card || shell,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      };

      var tl = gsap.timeline(tlConfig);

      if (card) {
        tl.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.35 });
      }

      if (header) {
        tl.to(header, { opacity: 1, y: 0, duration: 0.25 }, '-=0.2');
      }

      if (colHeaders.length) {
        tl.to(colHeaders, { opacity: 1, y: 0, duration: 0.22, stagger: 0.04 }, '-=0.16');
      }

      if (colUnder.length) {
        tl.to(colUnder, { width: '100%', duration: 0.28, ease: 'circ.out' }, '-=0.18');
      }

      if (items.length) {
        tl.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: { each: 0.03, from: 'edges' }
        }, '-=0.2');
      }

      if (footer) {
        tl.to(footer, { opacity: 1, y: 0, duration: 0.26 }, '-=0.18');
      }

      if (toolChars.length) {
        tl.to(toolChars, {
          opacity: 1,
          yPercent: 0,
          duration: 0.4,
          ease: 'power3.out',
          stagger: 0.03
        }, '+=0.1');

        if (ulTool) {
          tl.to(ulTool, {
            width: '100%',
            opacity: 0.9,
            duration: 0.5,
            ease: 'power2.out'
          }, '<+0.1');
        }
      }

      if (resultChars.length) {
        tl.to(resultChars, {
          opacity: 1,
          yPercent: 0,
          duration: 0.4,
          ease: 'power3.out',
          stagger: 0.03
        }, '-=0.1');

        if (ulResult) {
          tl.to(ulResult, {
            width: '100%',
            opacity: 0.9,
            duration: 0.5,
            ease: 'power2.out'
          }, '<+0.1');
        }
      }

      if (productChars.length) {
        tl.to(productChars, {
          opacity: 1,
          yPercent: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.05
        }, '+=0.4');

        if (ulProduct) {
          tl.to(ulProduct, {
            width: '100%',
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out'
          }, '<+0.15');
        }

        var fadeLines = [];
        if (ulTool) fadeLines.push(ulTool);
        if (ulResult) fadeLines.push(ulResult);

        if (fadeLines.length) {
          tl.to(fadeLines, {
            opacity: 0.5,
            duration: 0.4,
            ease: 'power1.out'
          }, '<+0.2');
        }
      }

      var isMobile = function () {
        return (
          window.innerWidth < 768 ||
          !window.matchMedia ||
          !window.matchMedia('(pointer:fine)').matches
        );
      };

      items.forEach(function (item) {
        var iconBox = item.querySelector('.ndt-purpose-icon-box');
        var textWrap = item.querySelector('.ndt-purpose-item-text-wrap');

        if (!iconBox || !textWrap) return;

        item.addEventListener('mousemove', function (e) {
          if (isMobile()) return;

          var rect = item.getBoundingClientRect();
          var centerX = rect.left + rect.width / 2;
          var centerY = rect.top + rect.height / 2;
          var distX = (e.clientX - centerX) * 0.12;
          var distY = (e.clientY - centerY) * 0.12;

          gsap.to(iconBox, { x: distX, y: distY, duration: 0.25, ease: 'power2.out' });
          gsap.to(textWrap, { x: distX * 0.3, duration: 0.25, ease: 'power2.out' });
          gsap.to(item, { y: -2, scale: 1.01, duration: 0.18, ease: 'power1.out' });
        });

        item.addEventListener('mouseleave', function () {
          gsap.to(iconBox, { x: 0, y: 0, duration: 0.35, ease: 'power2.out' });
          gsap.to(textWrap, { x: 0, duration: 0.35, ease: 'power2.out' });
          gsap.to(item, { y: 0, scale: 1, duration: 0.35, ease: 'power2.out' });
        });
      });

      setupMobileDeck();
    };

    var readyFn =
      (typeof NDT.onReady === 'function' && NDT.onReady) ||
      (typeof NDT.ready === 'function' && NDT.ready) ||
      null;

    if (readyFn) {
      readyFn(NDT.initPurposeWidget);
    } else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        NDT.initPurposeWidget();
      });
    } else {
      NDT.initPurposeWidget();
    }
  })(window, document);

})(window, document);