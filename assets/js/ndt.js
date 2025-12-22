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
     - Actual widget logic lives in page-specific
       files that override these.
     ========================================= */

  NDT.initServicesGuide = function () {
    // services interactive guide logic will live in its own module,
    // which can call this or overwrite it.
  };

  NDT.initFullscreenGallery = function () {
    // fullscreen drag gallery logic will live in its own module.
  };

  /* =========================================
     Sections namespace
     (page-specific scripts register here)
     ========================================= */

  NDT.sections = NDT.sections || {};

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