/* =========================================
   Newberry Dog Training Co.
   Global JS utilities + namespace
   ========================================= */

(function (window, document) {
  'use strict';

  // Single global namespace
  const NDT = (window.NDT = window.NDT || {});

  /* =========================================
     Core flags
     ========================================= */

  // Respect system reduced-motion for any animations
  NDT.prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================
     DOM ready helper
     ========================================= */

  NDT.onReady = function (callback) {
    if (typeof callback !== 'function') return;

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // already ready
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', function handleReady() {
        document.removeEventListener('DOMContentLoaded', handleReady);
        callback();
      });
    }
  };

  /* =========================================
     Utility: debounce
     ========================================= */

  NDT.debounce = function (fn, delay) {
    if (typeof fn !== 'function') return function () {};
    let timeoutId;
    return function () {
      const ctx = this;
      const args = arguments;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        fn.apply(ctx, args);
      }, delay || 200);
    };
  };

  /* =========================================
     Utility: cheap query helpers
     ========================================= */

  NDT.qs = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  NDT.qsa = function (selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  };

  /* =========================================
     GSAP integration
     (used by hero, gallery, etc.)
     ========================================= */

  NDT.gsap = {
    get gsap() {
      return window.gsap || null;
    },
    get hasGSAP() {
      return !!window.gsap;
    },
    get hasScrollTrigger() {
      return typeof window.ScrollTrigger !== 'undefined';
    },
    get hasDraggable() {
      return typeof window.Draggable !== 'undefined';
    },

    /**
     * Register any available plugins once.
     */
    registerPlugins() {
      if (!this.hasGSAP) {
        console.warn('[NDT] GSAP not found; animation features disabled.');
        return false;
      }

      if (this.hasScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
      }

      // Draggable is a plugin too, but can also be used directly.
      // Registering is safe either way.
      if (this.hasDraggable && window.gsap.registerPlugin) {
        window.gsap.registerPlugin(window.Draggable);
      }

      return true;
    },

    /**
     * Safe refresh for ScrollTrigger when content height changes.
     */
    refreshScroll() {
      if (this.hasScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
        window.ScrollTrigger.refresh();
      }
    }
  };

  /* =========================================
     Global resize bus
     (widgets can hook into this instead of
      each one adding its own noisy listener)
     ========================================= */

  NDT.resizeHandlers = [];

  NDT.onResize = function (handler) {
    if (typeof handler !== 'function') return;
    NDT.resizeHandlers.push(handler);
  };

  const debouncedResize = NDT.debounce(function () {
    NDT.resizeHandlers.forEach(function (fn) {
      try {
        fn();
      } catch (err) {
        console.error('[NDT] resize handler error:', err);
      }
    });
  }, 200);

  window.addEventListener('resize', debouncedResize);

  /* =========================================
     Widget init hooks (stubs)
     - You will move actual widget logic into
       these in separate files later.
     ========================================= */

  // Example placeholders so you have a clean place to target:
  NDT.initServicesGuide = function () {
    // services interactive guide logic will live in its own module,
    // which can call this or overwrite it.
  };

  NDT.initFullscreenGallery = function () {
    // fullscreen drag gallery logic will live in its own module.
  };

  /* =========================================
     Default bootstrapping
     ========================================= */

  NDT.onReady(function () {
    // Ensure GSAP plugins are registered if GSAP is present
    NDT.gsap.registerPlugins();

    // Widgets can either:
    //  - override these init functions in their own scripts, OR
    //  - call NDT.onReady inside their own files.
    //
    // For now these do nothing until you wire up the widget modules.
    if (typeof NDT.initServicesGuide === 'function') {
      NDT.initServicesGuide();
    }

    if (typeof NDT.initFullscreenGallery === 'function') {
      NDT.initFullscreenGallery();
    }
  });
})(window, document);
/* =====================================
   Hero dog parallax (one-way scroll)
   ===================================== */
(function () {
  function initHeroDogParallax() {
    try {
      if (typeof window === 'undefined') return;
      if (!window.gsap || !window.ScrollTrigger) return;

      var gsap = window.gsap;
      var ScrollTrigger = window.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      var heroStage = document.querySelector('.ndt-hero-dog-stage');
      var chubby    = document.querySelector('.ndt-chubby');
      var bluebell  = document.querySelector('.ndt-bluebell');
      var shadow    = document.querySelector('.ndt-ground-shadow');

      // If the hero or dogs aren't on this page, do nothing
      if (!heroStage || !chubby || !bluebell || !shadow) return;

      if (typeof ScrollTrigger.matchMedia !== 'function') {
        // Older ScrollTrigger version: skip politely
        return;
      }

      ScrollTrigger.matchMedia({
        '(prefers-reduced-motion: reduce)': function () {
          // Respect reduced motion, no animation
        },

        // Main desktop effect: 1080 / 1440 tier
        '(min-width: 1024px) and (min-height: 900px)': function () {
          var heroHeight = heroStage.offsetHeight || window.innerHeight;
          var travel = heroHeight * 1;

          gsap.set([chubby, bluebell, shadow], { willChange: 'transform' });
          gsap.set(shadow, { opacity: 0 });

          // Build the dog animation, but keep it paused
          var tl = gsap.timeline({ paused: true });

          tl.to([chubby, bluebell, shadow], {
            y: travel,
            ease: 'none',
            duration: 0.9
          }, 0)
          .to(shadow, {
            opacity: 1,
            ease: 'none',
            duration: 0.4
          }, 0.5)
          .to([chubby, bluebell, shadow], {
            y: travel,
            ease: 'none',
            duration: 0.1
          }, 0.9);

          // One-way scroll: only move forward to the furthest point reached
          var maxProgress = 0;

          ScrollTrigger.create({
            trigger: heroStage,
            start: 'top top',
            end: 'bottom top',
            scrub: true, // smooth updates
            onUpdate: function (self) {
              var p = self.progress;
              if (p > maxProgress) {
                maxProgress = p;
                tl.progress(maxProgress);
              }
              // scrolling up: p < maxProgress -> do nothing
            },
            onRefresh: function (self) {
              maxProgress = self.progress;
              tl.progress(maxProgress);
            }
          });
        },

        // Mid-height laptops: no animation for now
        '(min-width: 768px) and (max-height: 899px)': function () {
          // Static hero on cramped screens
        }
      });
    } catch (err) {
      console.error('NDT hero dog parallax failed gracefully:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroDogParallax);
  } else {
    initHeroDogParallax();
  }
})();
