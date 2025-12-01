/* =========================================
   Hero combo help card
   Uses global NDT utilities from ndt.js
   ========================================= */

(function (window, document) {
  'use strict';

  const NDT = (window.NDT = window.NDT || {});
  NDT.sections = NDT.sections || {};

  NDT.sections.heroComboCard = function () {
    const hero = document.querySelector('.ndt-hero-combo-help-card');
    if (!hero) return;

    const prefersReduced = !!NDT.prefersReducedMotion;
    const g = NDT.gsap || {};
    const hasGSAP = !!g.gsap;
    const gsap = hasGSAP ? g.gsap : null;
    const ScrollTrigger = g.hasScrollTrigger ? window.ScrollTrigger : null;

    const qs =
      NDT.qs ||
      function (sel, root) {
        return (root || document).querySelector(sel);
      };
    const qsa =
      NDT.qsa ||
      function (sel, root) {
        return Array.from((root || document).querySelectorAll(sel));
      };

    const kicker = qs('.ndt-hero-help-kicker', hero);
    const accentLine = qs('.ndt-header-accent-line', hero);
    const locationEl = qs('.ndt-hero-help-location', hero);
    const services = qsa('.ndt-hero-help-service', hero);
    const topRight = qs('.ndt-hero-help-top-right', hero);
    const headers = qsa('.ndt-combo-col-header', hero);
    const comboItems = qsa('.ndt-combo-item', hero);
    const painRow = qs('.ndt-hero-pain-row', hero);
    const painChips = qsa('.ndt-hero-pain-chip', hero);
    const videoFrame = qs('.ndt-hero-help-video-frame', hero);
    const particleContainer = qs('.ndt-particles', hero);

    function revealStatic() {
      const groups = [kicker, locationEl, topRight, painRow];
      groups.forEach(function (el) {
        if (!el) return;
        el.style.opacity = '1';
        el.style.transform = 'none';
      });

      services.concat(comboItems).forEach(function (el) {
        if (!el) return;
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }

    // If GSAP is missing or motion is reduced, just show everything
    if (!hasGSAP || prefersReduced) {
      revealStatic();
      return;
    }

    // Safe, idempotent plugin registration
    if (typeof g.registerPlugins === 'function') {
      g.registerPlugins();
    }

    /* Particles */

    function createParticles() {
      if (!particleContainer) return;
      if (particleContainer.dataset.ndtParticlesInit === '1') return;
      particleContainer.dataset.ndtParticlesInit = '1';

      const colors = [
        'var(--ndt-primary, #BAA2E7)',
        'var(--ndt-utility-sky, #7895C4)',
        'var(--ndt-utility-ochre, #9D8058)',
        'var(--ndt-success, #85A894)'
      ];

      for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'ndt-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particleContainer.appendChild(particle);

        gsap.to(particle, {
          y: -8 + Math.random() * 16,
          x: -8 + Math.random() * 16,
          opacity: 0.15,
          duration: 4 + Math.random() * 5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * 4
        });
      }
    }

    createParticles();

    /* Intro timeline */

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (kicker) {
      tl.to(kicker, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'back.out(1.4)'
      });
    }

    if (accentLine) {
      tl.to(
        accentLine,
        {
          width: '100%',
          duration: 0.6,
          ease: 'power2.out'
        },
        '-=0.25'
      );
    }

    if (locationEl) {
      tl.to(
        locationEl,
        {
          opacity: 0.96,
          y: 0,
          duration: 0.45
        },
        '-=0.4'
      );
    }

    if (services.length) {
      tl.to(
        services,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: 'back.out(1.2)'
        },
        '-=0.35'
      );
    }

    if (topRight) {
      tl.to(
        topRight,
        {
          opacity: 1,
          y: 0,
          duration: 0.5
        },
        '-=0.55'
      );
    }

    if (headers.length) {
      tl.to(
        headers,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06
        },
        '-=0.4'
      );
    }

    if (comboItems.length) {
      tl.to(
        comboItems,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 0.3,
          stagger: 0.03,
          ease: 'back.out(1.1)'
        },
        '-=0.25'
      );
    }

    if (painRow) {
      tl.to(
        painRow,
        {
          opacity: 1,
          y: 0,
          duration: 0.4
        },
        '-=0.25'
      );
    }

    /* Service hover */

    services.forEach(function (service) {
      const icon = qs('.ndt-hero-help-service-icon', service);
      const label = qs('.ndt-hero-help-service-label', service);

      let accentColor = 'var(--ndt-text, #F5F5F4)';
      if (service.classList.contains('ndt-hero-help-service--private')) {
        accentColor = 'var(--ndt-primary, #BAA2E7)';
      } else if (service.classList.contains('ndt-hero-help-service--day')) {
        accentColor = 'var(--ndt-utility-sky, #7895C4)';
      } else if (service.classList.contains('ndt-hero-help-service--board')) {
        accentColor = 'var(--ndt-utility-ochre, #9D8058)';
      } else if (service.classList.contains('ndt-hero-help-service--group')) {
        accentColor = 'var(--ndt-success, #85A894)';
      }

      service.addEventListener('mouseenter', function () {
        gsap.to(service, {
          y: -2,
          duration: 0.12,
          ease: 'power2.out'
        });

        if (label) {
          gsap.to(label, {
            color: accentColor,
            duration: 0.12
          });
        }

        if (icon) {
          gsap.to(icon, {
            borderColor: 'rgba(140, 150, 170, 0.6)',
            scale: 1.05,
            duration: 0.12
          });
        }
      });

      service.addEventListener('mouseleave', function () {
        gsap.to(service, {
          y: 0,
          x: 0,
          duration: 0.15,
          ease: 'power2.out'
        });

        if (icon) {
          gsap.to(icon, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            borderColor: 'rgba(255, 255, 255, 0.04)',
            duration: 0.15,
            ease: 'power2.out'
          });
        }

        if (label) {
          gsap.to(label, {
            x: 0,
            color: 'var(--ndt-text, #F5F5F4)',
            duration: 0.15,
            ease: 'power2.out'
          });
        }
      });

      service.addEventListener('mousemove', function (e) {
        const rect = service.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(service, {
          x: x * 0.01,
          duration: 0.12,
          ease: 'power2.out'
        });

        if (icon) {
          gsap.to(icon, {
            x: x * 0.03,
            y: y * 0.02,
            rotation: x * 0.02,
            duration: 0.12,
            ease: 'power2.out'
          });
        }

        if (label) {
          gsap.to(label, {
            x: x * 0.02,
            duration: 0.12,
            ease: 'power2.out'
          });
        }
      });
    });

    /* Combo cards hover */

    comboItems.forEach(function (item) {
      const icon = qs('.ndt-combo-icon', item);
      const label = qs('.ndt-combo-label', item);

      let accentColor = 'var(--ndt-text, #F5F5F4)';

      if (
        item.classList.contains('ndt-combo-item--tone1') ||
        item.classList.contains('ndt-combo-item--experience')
      ) {
        accentColor = 'var(--ndt-primary, #BAA2E7)';
      } else if (item.classList.contains('ndt-combo-item--tone2')) {
        accentColor = 'var(--ndt-utility-sky, #7895C4)';
      } else if (item.classList.contains('ndt-combo-item--owner')) {
        accentColor = 'var(--ndt-accent, #8DA0BF)';
      } else if (
        item.classList.contains('ndt-combo-item--tone3') ||
        item.classList.contains('ndt-combo-item--lifetime')
      ) {
        accentColor = 'var(--ndt-utility-ochre, #9D8058)';
      } else if (
        item.classList.contains('ndt-combo-item--tone4') ||
        item.classList.contains('ndt-combo-item--outcome')
      ) {
        accentColor = 'var(--ndt-success, #85A894)';
      }

      item.addEventListener('mouseenter', function () {
        gsap.to(item, {
          y: -2,
          duration: 0.12,
          ease: 'power2.out'
        });

        if (label) {
          gsap.to(label, {
            color: accentColor,
            duration: 0.12
          });
        }

        if (icon) {
          gsap.to(icon, {
            borderColor: 'rgba(140, 150, 170, 0.6)',
            scale: 1.03,
            duration: 0.12
          });
        }
      });

      item.addEventListener('mouseleave', function () {
        gsap.to(item, {
          y: 0,
          x: 0,
          duration: 0.15,
          ease: 'power2.out'
        });

        if (icon) {
          gsap.to(icon, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            borderColor: 'rgba(255, 255, 255, 0.04)',
            duration: 0.15,
            ease: 'power2.out'
          });
        }

        if (label) {
          gsap.to(label, {
            x: 0,
            color: 'var(--ndt-text, #F5F5F4)',
            duration: 0.15,
            ease: 'power2.out'
          });
        }
      });

      item.addEventListener('mousemove', function (e) {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(item, {
          x: x * 0.008,
          duration: 0.12,
          ease: 'power2.out'
        });

        if (icon) {
          gsap.to(icon, {
            x: x * 0.02,
            y: y * 0.015,
            rotation: x * 0.015,
            duration: 0.12,
            ease: 'power2.out'
          });
        }

        if (label) {
          gsap.to(label, {
            x: x * 0.015,
            duration: 0.12,
            ease: 'power2.out'
          });
        }
      });
    });

    /* Pain chips hover – only color handled via CSS, so no motion here */
    // kept painChips query in case you ever want to re-enable light motion

    /* Video parallax (pointer devices only) */

    if (videoFrame && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
      videoFrame.addEventListener('mousemove', function (e) {
        const rect = videoFrame.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

        gsap.to(videoFrame, {
          rotateY: x * 2,
          rotateX: -y * 2,
          transformPerspective: 1000,
          scale: 1.005,
          duration: 0.35,
          ease: 'power2.out'
        });
      });

      videoFrame.addEventListener('mouseleave', function () {
        gsap.to(videoFrame, {
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.15,
          ease: 'power2.out'
        });
      });
    }

    /* Scroll parallax */

    if (ScrollTrigger) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: function (self) {
          const progress = self.progress;
          gsap.to(hero, {
            y: progress * 20 - 10,
            duration: 0.3,
            overwrite: 'auto'
          });
        }
      });
    }

    /* SVG rotation on hover */

    const svgIcons = qsa('.ndt-hero-help-service-icon svg, .ndt-combo-icon svg', hero);
    svgIcons.forEach(function (svg) {
      const parent = svg.closest('.ndt-hero-help-service, .ndt-combo-item');
      if (!parent) return;

      parent.addEventListener('mouseenter', function () {
        gsap.to(svg, {
          rotation: 5,
          duration: 0.12,
          ease: 'power2.out'
        });
      });

      parent.addEventListener('mouseleave', function () {
        gsap.to(svg, {
          rotation: 0,
          duration: 0.15,
          ease: 'power2.out'
        });
      });
    });
  };

  // Hook into the global boot sequence safely
  if (typeof NDT.onReady === 'function') {
    NDT.onReady(function () {
      if (NDT.sections && typeof NDT.sections.heroComboCard === 'function') {
        NDT.sections.heroComboCard();
      }
    });
  } else {
    // Fallback so this file never explodes if ndt.js loads later or dies
    document.addEventListener('DOMContentLoaded', function () {
      if (NDT.sections && typeof NDT.sections.heroComboCard === 'function') {
        NDT.sections.heroComboCard();
      }
    });
  }
})(window, document);


/* =========================================
   CORE TRUTHS – entrance animation
   ========================================= */

(function (window, document) {
  'use strict';

  if (!window.NDT) return;
  var NDT = window.NDT;

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

      // No GSAP or reduced motion: just show everything
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
        defaults: { ease: 'power2.out' }
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
    NDT.onReady(function () {
      if (typeof NDT.initCoreTruths === 'function') {
        NDT.initCoreTruths();
      }
    });
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      if (typeof NDT.initCoreTruths === 'function') {
        NDT.initCoreTruths();
      }
    });
  }
})(window, document);


// =========================================
// Tone card: "How direct do you want it?"
// No tilt, no ripple, no mouse-follow
// =========================================

(function () {
  const card = document.querySelector('.ndt-tone-card');
  if (!card) return;

  const particlesContainer = card.querySelector('.ndt-tone-particles');
  const ambient = card.querySelector('.ndt-tone-ambient');
  const knob = card.querySelector('.ndt-tone-toggle-knob');
  const glow = card.querySelector('.ndt-tone-glow');
  const footerHighlight = card.querySelector('.ndt-tone-footer-highlight');
  const toggleBtns = card.querySelectorAll('.ndt-tone-toggle-btn');
  const items = card.querySelectorAll('.ndt-tone-item');
  const textWraps = card.querySelectorAll('.ndt-tone-text-wrap');

  if (!particlesContainer || !ambient || !knob || !glow || !footerHighlight) {
    return;
  }

  let activeTone = 'gentle';

  // Create particles (subtle drift only, no mouse influence)
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'ndt-tone-particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    const size = Math.random() * 3 + 1;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.animationDelay = Math.random() * 5 + 's';
    particle.style.animationDuration = 20 + Math.random() * 10 + 's';
    particlesContainer.appendChild(particle);
  }

  // Lock each tone text wrapper to the tallest of its two states
  function lockToneHeights() {
    if (!textWraps.length) return;

    textWraps.forEach(function (wrap) {
      // reset any previous height before measuring
      wrap.style.height = '';

      const texts = wrap.querySelectorAll('.ndt-tone-text');
      if (!texts.length) return;

      let maxHeight = 0;

      texts.forEach(function (t) {
        // preserve original classes
        const originalClassName = t.className;

        // force into a neutral visible state for measurement
        t.classList.add('ndt-tone-text--measure');

        // read height
        const h = t.offsetHeight;
        if (h > maxHeight) maxHeight = h;

        // restore original className
        t.className = originalClassName;
      });

      if (maxHeight > 0) {
        wrap.style.height = maxHeight + 'px';
      }
    });
  }

  function setTone(tone) {
    activeTone = tone;

    // Card blunt mode affects corners + SVG visibility via CSS
    if (tone === 'blunt') {
      card.classList.add('blunt-mode');
    } else {
      card.classList.remove('blunt-mode');
    }

    // Toggle buttons
    toggleBtns.forEach(btn => {
      const isActive = btn.dataset.tone === tone;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Knob + glow class
    knob.className = 'ndt-tone-toggle-knob ' + tone;
    glow.className = 'ndt-tone-glow ' + tone;

    // Knob visual (matches your reference: neutral for gentle, red for blunt)
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

    // Ambient gradient
    ambient.className = 'ndt-tone-ambient ' + tone;

    // Footer highlight word
    footerHighlight.className = 'ndt-tone-footer-highlight ' + tone;
    footerHighlight.textContent = tone.charAt(0).toUpperCase() + tone.slice(1);

    // Particle tint
    const particles = particlesContainer.querySelectorAll('.ndt-tone-particle');
    particles.forEach(p => {
      p.style.background = tone === 'gentle' ? '#8DA0BF' : '#A14553';
    });

    // Copy swap
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

  // Toggle click handlers
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const tone = btn.dataset.tone;
      if (tone && tone !== activeTone) {
        setTone(tone);
      }
    });
  });

  // Item dimming on hover (no movement tied to mouse position)
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

  // Initial state
  setTone('gentle');
  // Lock heights after initial tone state is applied
  lockToneHeights();

  // Re-lock on resize with debounce so layout stays stable
  let toneResizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(toneResizeTimer);
    toneResizeTimer = setTimeout(lockToneHeights, 150);
  });
})();





// ndt-services-summary.js
// Newberry Dog Training Co.
// Services summary strip
// Currently no interactive behavior is required for this block.

(function () {
  // Reserved for future enhancements.
  // Example: wire up analytics events on CTA clicks if you care later.
  // const summary = document.querySelector('.ndt-services-summary');
  // if (!summary) return;
})();
(function() {
  const card = document.getElementById('ndtServicesCard');
  if (!card) return;

  const ambient = document.getElementById('ndtServicesAmbient');
  const items = card.querySelectorAll('.ndt-services-item');
  const scheduleThumb = document.getElementById('scheduleThumb');
  const scheduleGlow = document.getElementById('scheduleGlow');
  const dogThumb = document.getElementById('dogThumb');
  const dogGlow = document.getElementById('dogGlow');
  const resultMain = document.getElementById('resultMain');
  const resultAlt = document.getElementById('resultAlt');

  /* ambient particles */
  if (ambient) {
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

  /* one-time nudge on first item */
  const firstItem = items[0];
  if (firstItem) {
    firstItem.classList.add('ndt-services-item--nudge');
    setTimeout(() => {
      firstItem.classList.remove('ndt-services-item--nudge');
    }, 3200);
  }

  /* dim others on hover */
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

  if (scheduleToggle) setupToggle(scheduleToggle, 'schedule', 1); // "Some time"
  if (dogToggle) setupToggle(dogToggle, 'dog', 1);               // "Manners"
})();
// NDT fullscreen drag gallery
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
    // kill previous
    draggables.forEach(d => d && d.kill && d.kill());
    draggables = [];
    resetTiles(false);

    // desktop only
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

  // entry animation
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
        toggleActions: 'play none none none'
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

  // mobile show-all logic
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

// =========================================
// Glass hero billboard card
// Intro, tilt, icon micro, CTA hover
// =========================================
(function (window, document) {
  'use strict';

  if (!window.gsap) return;

  function initGlassHeroCard() {
    // Match your CSS / HTML: .ndt-gh-shell and .ndt-gh-card
    const shell = document.querySelector('.ndt-gh-shell');
    if (!shell) return;

    const card = shell.querySelector('.ndt-gh-card');
    if (!card) return;

    const stamp      = card.querySelector('.ndt-gh-stamp');
    const preTitle   = card.querySelector('.ndt-gh-pretitle');
    const title      = card.querySelector('.ndt-gh-title');
    const iconGroups = card.querySelectorAll('.ndt-gh-icon');
    const links      = card.querySelectorAll('.ndt-gh-link');

    /* ================================
       1. Intro reveal timeline
       ================================ */

    const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    introTl.from(card, {
      duration: 1.0,
      y: 40,
      scale: 0.95,
      opacity: 0,
      ease: 'expo.out'
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
        '-=0.7'
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
        '-=0.45'
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

    /* ================================
       2. 3D tilt on the glass card
       ================================ */

    // Card gets 3D context
    gsap.set(card, {
      transformPerspective: 900,
      transformOrigin: '50% 50%',
      transformStyle: 'preserve-3d',
      willChange: 'transform'
    });

    const preferFinePointer =
      window.matchMedia &&
      window.matchMedia('(pointer: fine)').matches;

    const tiltTarget = card;

    if (preferFinePointer) {
      tiltTarget.addEventListener('mousemove', function (e) {
        const rect = tiltTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const rotateX = (mouseY / (rect.height / 2)) * -5;
        const rotateY = (mouseX / (rect.width / 2)) * 5;

        gsap.to(card, {
          rotationX: rotateX,
          rotationY: rotateY,
          duration: 0.22,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      });

      tiltTarget.addEventListener('mouseleave', function () {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
          overwrite: 'auto'
        });
      });
    }

    /* ================================
       3. Icon micro-interactions
       ================================ */

    iconGroups.forEach(function (group) {
      const icon = group.querySelector('.ndt-gh-icon-svg');
      if (!icon) return;

      group.addEventListener('mouseenter', function () {
        gsap.to(icon, {
          scale: 1.12,
          duration: 0.25,
          ease: 'back.out(2)'
        });
      });

      group.addEventListener('mouseleave', function () {
        gsap.to(icon, {
          scale: 1,
          duration: 0.25
        });
      });
    });

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
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlassHeroCard);
  } else {
    initGlassHeroCard();
  }
})(window, document);

// Chaos icon animation – "Chaos solved" blocks
(function () {
  if (!window.gsap) return;

  const chaosGroup = document.getElementById('icon-group-chaos');
  if (!chaosGroup) return;

  const blocks = chaosGroup.querySelectorAll('.chaos-block');
  if (!blocks.length) return;

  function ndtChaosOffset() {
    return (Math.random() - 0.5) * 26;
  }

  function ndtChaosRotation() {
    return (Math.random() - 0.5) * 120;
  }

  gsap.set(blocks, {
    transformOrigin: '50% 50%',
    x: ndtChaosOffset,
    y: ndtChaosOffset,
    rotation: ndtChaosRotation,
    scale: 0.85,
    opacity: 0.8
  });

  chaosGroup.addEventListener('mouseenter', function () {
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
  });

  chaosGroup.addEventListener('mouseleave', function () {
    gsap.to(blocks, {
      x: ndtChaosOffset,
      y: ndtChaosOffset,
      rotation: ndtChaosRotation,
      scale: 0.85,
      opacity: 0.8,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
})();

// A. ON & OFF LEASH (Signal Strength Bars)
(function (window, document) {
  'use strict';

  if (!window.gsap) return;

  const signalGroup = document.getElementById('icon-group-wifi');
  if (!signalGroup) return;

  const signalBars = signalGroup.querySelectorAll('.signal-bar');
  if (!signalBars.length) return;

  gsap.set(signalBars, {
    opacity: 0.3,
    scaleY: 1,
    transformOrigin: 'bottom center'
  });

  const signalTl = gsap.timeline({
    paused: true,
    defaults: { ease: 'power2.out' }
  });

  signalTl
    .to(signalBars, {
      opacity: 1,
      duration: 0.15,
      stagger: 0.08
    })
    .to(signalBars, {
      scaleY: 1.05,
      duration: 0.15,
      yoyo: true,
      repeat: 1
    });

  signalGroup.addEventListener('mouseenter', function () {
    signalTl.restart();
  });

  signalGroup.addEventListener('mouseleave', function () {
    signalTl.pause(0);

    gsap.to(signalBars, {
      opacity: 0.3,
      scaleY: 1,
      duration: 0.25,
      clearProps: 'transform'
    });
  });
})(window, document);

// Reality icon animation – "melting world"
(function () {
  if (!window.gsap) return;

  const realityGroup = document.getElementById('icon-group-reality');
  if (!realityGroup) return;

  const displacementMap = realityGroup.querySelector('#ndt-melt-displacement');
  const earthGroup = realityGroup.querySelector('.ndt-earth-group');
  if (!displacementMap || !earthGroup) return;

  const meltState = { scale: 0, y: 0 };

  function applyMelt() {
    displacementMap.setAttribute('scale', meltState.scale);
    earthGroup.style.transform = 'translateY(' + meltState.y + 'px)';
    earthGroup.style.opacity = 1 - meltState.y / 20;
  }

  realityGroup.addEventListener('mouseenter', function () {
    gsap.killTweensOf(meltState);

    gsap.to(meltState, {
      scale: 15,
      y: 6,
      duration: 0.4,
      ease: 'power2.in',
      onUpdate: applyMelt
    });
  });

  realityGroup.addEventListener('mouseleave', function () {
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
  });
})();










