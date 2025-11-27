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
          backgroundColor: 'rgba(40, 42, 48, 0.96)',
          borderColor: 'rgba(96, 103, 116, 0.8)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
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
          backgroundColor: 'transparent',
          borderColor: 'var(--ndt-border-muted, transparent)',
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
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
          backgroundColor: 'rgba(40, 42, 48, 0.96)',
          borderColor: 'rgba(96, 103, 116, 0.8)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
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
          backgroundColor: 'transparent',
          borderColor: 'var(--ndt-border-muted, transparent)',
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
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

    /* Pain chips hover */

    painChips.forEach(function (chip) {
      chip.addEventListener('mouseenter', function () {
        gsap.to(chip, {
          y: -3,
          scale: 1.02,
          duration: 0.12,
          ease: 'power2.out'
        });
      });

      chip.addEventListener('mouseleave', function () {
        gsap.to(chip, {
          y: 0,
          scale: 1,
          duration: 0.15,
          ease: 'power2.out'
        });
      });
    });

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
   PURPOSE CARD - INIT
   ========================================= */

(function (window, document) {
  'use strict';

  if (!window.NDT) return;
  const NDT = window.NDT;

  NDT.initPurposeCard = function () {
    const gsap = NDT.gsap && NDT.gsap.gsap;
    const hasScrollTrigger =
      NDT.gsap && NDT.gsap.hasScrollTrigger && typeof window.ScrollTrigger !== 'undefined';
    const prefersReduced = !!NDT.prefersReducedMotion;

    const cards = NDT.qsa
      ? NDT.qsa('.ndt-purpose-card')
      : Array.from(document.querySelectorAll('.ndt-purpose-card'));

    if (!cards.length) return;

    cards.forEach(function (card) {
      const header = card.querySelector('.ndt-purpose-header');
      const columns = card.querySelectorAll('.ndt-purpose-column');
      const items = card.querySelectorAll('.ndt-purpose-item');
      const footer = card.querySelector('.ndt-purpose-footer');

      function revealStatic() {
        [header, footer].forEach(function (el) {
          if (!el) return;
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
        columns.forEach(function (col) {
          col.style.opacity = '1';
          col.style.transform = 'none';
        });
        items.forEach(function (item) {
          item.style.opacity = '1';
          item.style.transform = 'none';
        });
      }

      // If no GSAP, reduced motion, or no ScrollTrigger, just show everything
      if (!gsap || prefersReduced || !hasScrollTrigger) {
        revealStatic();
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });

      tl.to(header, {
        opacity: 1,
        y: 0,
        duration: 0.5
      })
        .to(
          columns,
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.1
          },
          '-=0.3'
        )
        .to(
          items,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.35,
            stagger: 0.04,
            ease: 'back.out(1.1)'
          },
          '-=0.35'
        )
        .to(
          footer,
          {
            opacity: 1,
            y: 0,
            duration: 0.4
          },
          '-=0.25'
        );

      // Hover interactions
      items.forEach(function (item) {
        const iconWrapper = item.querySelector('.ndt-purpose-icon-wrapper');
        const icon = item.querySelector('.ndt-purpose-icon');
        const text = item.querySelector('.ndt-purpose-text');

        item.addEventListener('mouseenter', function () {
          gsap.to(item, {
            y: -2,
            scale: 1,
            duration: 0.12,
            ease: 'power2.out'
          });
        });

        item.addEventListener('mouseleave', function () {
          gsap.to(item, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: 'elastic.out(1, 0.5)'
          });

          gsap.to([iconWrapper, icon, text].filter(Boolean), {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.4,
            ease: 'elastic.out(1, 0.5)'
          });
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

          if (iconWrapper) {
            gsap.to(iconWrapper, {
              x: x * 0.025,
              y: y * 0.015,
              duration: 0.12,
              ease: 'power2.out'
            });
          }

          if (icon) {
            gsap.to(icon, {
              rotation: x * 0.02,
              duration: 0.12,
              ease: 'power2.out'
            });
          }

          if (text) {
            gsap.to(text, {
              x: x * 0.015,
              duration: 0.12,
              ease: 'power2.out'
            });
          }
        });
      });
    });
  };

  // Hook into page boot **without** crashing if NDT.onReady is missing
  if (typeof NDT.onReady === 'function') {
    NDT.onReady(function () {
      if (typeof NDT.initPurposeCard === 'function') {
        NDT.initPurposeCard();
      }
    });
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      if (typeof NDT.initPurposeCard === 'function') {
        NDT.initPurposeCard();
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
// =========================================

(function () {
  const card = document.querySelector('.ndt-tone-card');
  if (!card) return;

  const particlesContainer = card.querySelector('.ndt-tone-particles');
  const ambient = card.querySelector('.ndt-tone-ambient');
  const header = card.querySelector('.ndt-tone-header');
  const footer = card.querySelector('.ndt-tone-footer');
  const knob = card.querySelector('.ndt-tone-toggle-knob');
  const glow = card.querySelector('.ndt-tone-glow');
  const footerHighlight = card.querySelector('.ndt-tone-footer-highlight');
  const toggleBtns = card.querySelectorAll('.ndt-tone-toggle-btn');
  const items = card.querySelectorAll('.ndt-tone-item');

  if (!particlesContainer || !ambient || !header || !footer || !knob || !glow || !footerHighlight) {
    return;
  }

  let activeTone = 'gentle';

  // Create subtle particles
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

  function setTone(tone) {
    if (tone === activeTone) return;
    activeTone = tone;

    // Buttons
    toggleBtns.forEach(btn => {
      const isActive = btn.dataset.tone === tone;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Knob and glow classes
    knob.className = 'ndt-tone-toggle-knob ' + tone;
    glow.className = 'ndt-tone-glow ' + tone;

    // Ambient
    ambient.className = 'ndt-tone-ambient ' + tone;

    // Footer highlight
    footerHighlight.className = 'ndt-tone-footer-highlight ' + tone;
    footerHighlight.textContent = tone.charAt(0).toUpperCase() + tone.slice(1);

    // Particles tint
    particlesContainer.querySelectorAll('.ndt-tone-particle').forEach(p => {
      if (tone === 'gentle') {
        p.classList.remove('blunt');
      } else {
        p.classList.add('blunt');
      }
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

    // Ripple ring
    const ripple = document.createElement('div');
    ripple.className = 'ndt-tone-ripple ' + tone;
    ripple.style.left = tone === 'gentle' ? '25%' : '75%';
    ripple.style.top = '50%';
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 950);
  }

  // Parallax tilt
  card.addEventListener('mousemove', function (e) {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

    card.style.transform =
      'perspective(1000px) rotateX(' + y * 1 + 'deg) rotateY(' + x * 1 + 'deg)';
    header.style.transform = 'translateX(' + x * 3 + 'px)';
    footer.style.transform = 'translateY(' + y * -2 + 'px)';
  });

  card.addEventListener('mouseleave', function () {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    header.style.transform = 'translateX(0)';
    footer.style.transform = 'translateY(0)';
  });

  // Toggle click handlers
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      setTone(btn.dataset.tone);
    });
  });

  // Item dimming on hover
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

  // Initial state (gentle)
  toggleBtns.forEach(btn => {
    const isActive = btn.dataset.tone === 'gentle';
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
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
