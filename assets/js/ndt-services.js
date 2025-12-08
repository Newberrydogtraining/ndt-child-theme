// =========================================
// SERVICES CAROUSEL – START
// =========================================

(function () {
  'use strict';

  function prefersReducedMotion() {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function initServicesCarousel() {
    var shell = document.getElementById('ndt-services');
    if (!shell) return;

    // Guarantee the page background stays on the dark canvas
    document.body.classList.add('ndt-services-bg');

    var serviceKeys = ['private', 'day', 'board', 'group'];
    var track = shell.querySelector('[data-ndt-services-track]');
    if (!track) return;

    var tabs = {};
    var dots = {};
    var cards = {};

    serviceKeys.forEach(function (key) {
      tabs[key] = shell.querySelector('[data-ndt-service-tab="' + key + '"]');
      dots[key] = shell.querySelector('[data-ndt-service-dot="' + key + '"]');
      cards[key] = shell.querySelector('[data-ndt-service-card="' + key + '"]');
    });

    var prevBtn = shell.querySelector('[data-ndt-services-prev]');
    var nextBtn = shell.querySelector('[data-ndt-services-next]');
    var currentCount = shell.querySelector('[data-ndt-progress-current]');
    var totalCount = shell.querySelector('[data-ndt-progress-total]');

    if (totalCount) {
      totalCount.textContent = String(serviceKeys.length);
    }

    var activeKey = serviceKeys[0];
    serviceKeys.forEach(function (key, idx) {
      if (cards[key] && cards[key].classList.contains('is-active')) {
        activeKey = key;
      }
      if (tabs[key] && tabs[key].classList.contains('is-active')) {
        activeKey = key;
      }
      if (dots[key] && dots[key].classList.contains('is-active')) {
        activeKey = key;
      }
    });

    var isSyncingScroll = false;

    function setActiveService(key, options) {
      options = options || {};
      if (serviceKeys.indexOf(key) === -1) return;
      activeKey = key;

      // update state classes
      serviceKeys.forEach(function (k) {
        if (tabs[k]) tabs[k].classList.toggle('is-active', k === key);
        if (dots[k]) dots[k].classList.toggle('is-active', k === key);
        if (cards[k]) cards[k].classList.toggle('is-active', k === key);
      });

      var index = serviceKeys.indexOf(key);
      if (currentCount) currentCount.textContent = String(index + 1);

      var cardEl = cards[key];
      if (cardEl && !options.fromScroll && !options.skipScroll) {
        isSyncingScroll = true;
        cardEl.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          inline: 'center',
          block: 'nearest',
        });
        window.setTimeout(function () {
          isSyncingScroll = false;
        }, 260);
      }

      if (!options.fromScroll && window.gsap && cardEl) {
        try {
          window.gsap.fromTo(
            cardEl,
            { autoAlpha: 0.92, scale: 0.985 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: prefersReducedMotion() ? 0 : 0.28,
              ease: 'power2.out',
            }
          );
        } catch (e) {
          /* no-op */
        }
      }
    }

    function move(direction) {
      var currentIndex = serviceKeys.indexOf(activeKey);
      if (currentIndex === -1) currentIndex = 0;
      var nextIndex =
        (currentIndex + direction + serviceKeys.length) % serviceKeys.length;
      setActiveService(serviceKeys[nextIndex]);
    }

    // click handlers
    Object.keys(tabs).forEach(function (key) {
      var tab = tabs[key];
      if (!tab) return;
      tab.addEventListener('click', function () {
        setActiveService(key);
      });
    });

    Object.keys(dots).forEach(function (key) {
      var dot = dots[key];
      if (!dot) return;
      dot.addEventListener('click', function () {
        setActiveService(key);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        move(-1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        move(1);
      });
    }

    // scroll syncing
    var pendingFrame = null;
    function handleTrackScroll() {
      if (isSyncingScroll) return;
      if (pendingFrame) return;
      pendingFrame = window.requestAnimationFrame(function () {
        pendingFrame = null;
        var trackRect = track.getBoundingClientRect();
        var centerX = trackRect.left + trackRect.width / 2;
        var closestKey = activeKey;
        var smallest = Number.POSITIVE_INFINITY;

        serviceKeys.forEach(function (key) {
          var el = cards[key];
          if (!el) return;
          var rect = el.getBoundingClientRect();
          var cardCenter = rect.left + rect.width / 2;
          var delta = Math.abs(cardCenter - centerX);
          if (delta < smallest) {
            smallest = delta;
            closestKey = key;
          }
        });

        if (closestKey !== activeKey) {
          setActiveService(closestKey, { fromScroll: true, skipScroll: true });
        }
      });
    }

    track.addEventListener('scroll', handleTrackScroll, { passive: true });
    window.addEventListener('resize', handleTrackScroll);

    // init
    setActiveService(activeKey, { skipScroll: true });
  });
})();

// =========================================
// SERVICES CAROUSEL – END
// =========================================

