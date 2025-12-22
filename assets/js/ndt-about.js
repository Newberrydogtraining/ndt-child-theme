
// =========================================
// NDT · About Hero Video Scroll
// =========================================

(function (window, document) {
  'use strict';

  const VIDEO_END_ADJUST = 0.7;

  function endMarkerOffset() {
    return window.innerHeight * VIDEO_END_ADJUST;
  }

  function initScrollScrub(wrapper, video) {
    return window.ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: `bottom bottom-=${endMarkerOffset()}px`,
      scrub: 0.3,
      markers: false,
      onUpdate(self) {
        if (video.duration && !Number.isNaN(video.duration)) {
          video.currentTime = self.progress * video.duration;
        }
      }
    });
  }

  function setupVideoAttributes(video) {
    video.setAttribute('muted', '');
    video.muted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('preload', 'auto');
    video.load();

    video.addEventListener('play', function handleAutoPlay() {
      video.pause();
    });

    video.addEventListener('click', function preventClick(e) {
      e.preventDefault();
    });
  }

  function boot() {
    const NDT = window.NDT || {};
    const hasGSAP = !!window.gsap;
    const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
    const wrapper = document.querySelector('.ndt-about-hero-visual');
    const video = wrapper && wrapper.querySelector('.ndt-about-frame-video');

    if (!wrapper || !video || !hasGSAP || !hasScrollTrigger) {
      return;
    }

    // Ensure plugin is available even if global register was skipped.
    window.gsap.registerPlugin(window.ScrollTrigger);

    setupVideoAttributes(video);

    let scrubTrigger = null;

    const rebuild = function () {
      if (scrubTrigger) {
        scrubTrigger.kill();
        scrubTrigger = null;
      }
      scrubTrigger = initScrollScrub(wrapper, video);
      wrapper._ndtHeroScrubTrigger = scrubTrigger;
      return scrubTrigger;
    };

    const debounce = typeof NDT.debounce === 'function'
      ? NDT.debounce
      : function (fn, delay) {
        let t;
        return function () {
          const ctx = this;
          const args = arguments;
          clearTimeout(t);
          t = setTimeout(function () {
            fn.apply(ctx, args);
          }, delay || 200);
        };
      };

    const rebuildDebounced = debounce(function () {
      rebuild();
      if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
        window.ScrollTrigger.refresh();
      }
    }, 200);

    function handleReady() {
      rebuild();
    }

    if (video.readyState >= 2) {
      handleReady();
    } else {
      video.addEventListener(
        'loadeddata',
        function handleLoaded() {
          video.removeEventListener('loadeddata', handleLoaded);
          handleReady();
        },
        { once: true }
      );
    }

    window.addEventListener('resize', rebuildDebounced);

    window.addEventListener('load', function () {
      if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
        window.ScrollTrigger.refresh();
      }
    });
  }

  function init() {
    const ndt = window.NDT;
    if (ndt && typeof ndt.onReady === 'function') {
      ndt.onReady(boot);
      return;
    }

    document.addEventListener('DOMContentLoaded', function handleReady() {
      document.removeEventListener('DOMContentLoaded', handleReady);
      boot();
    });
  }

  init();
})(window, document);

