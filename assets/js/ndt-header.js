(function () {
  function initNdtHeader() {
    var header = document.querySelector('.ndt-header-rail');
    if (!header) return;

    var lastScroll = 0;
    var scrollThreshold = 60;
    var ticking = false;
    var headerHeight = null;

    function updateHeader() {
      var currentScroll = window.pageYOffset || document.documentElement.scrollTop;

      if (currentScroll > 30) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }

      if (currentScroll > scrollThreshold && currentScroll > lastScroll) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }

      lastScroll = currentScroll <= 0 ? 0 : currentScroll;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }

    function setHeaderHeightVar() {
      if (!header) return;
      var height = header.getBoundingClientRect().height;
      headerHeight = Math.ceil(height);
      document.documentElement.style.setProperty('--ndt-header-height', headerHeight + 'px');
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateHeader();
    setHeaderHeightVar();
    window.addEventListener('resize', setHeaderHeightVar);

    // ============================================
    // MOBILE NAVIGATION
    // ============================================
    var fab = document.querySelector('.ndt-mobile-fab');
    var overlay = document.querySelector('.ndt-mobile-overlay');
    var body = document.body;
    var mobileQuery = window.matchMedia('(max-width: 1024px)');
    var mobileNavInitialized = false;

    function openMenu() {
      if (!fab || !overlay) return;
      body.classList.add('ndt-nav-open');
      fab.setAttribute('aria-label', 'Close navigation');
      fab.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      if (!fab || !overlay) return;
      body.classList.remove('ndt-nav-open');
      fab.setAttribute('aria-label', 'Open navigation');
      fab.setAttribute('aria-expanded', 'false');
    }

    function initMobileNav() {
      if (!fab || !overlay || mobileNavInitialized) return;
      mobileNavInitialized = true;

      fab.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (body.classList.contains('ndt-nav-open')) {
          closeMenu();
        } else {
          openMenu();
        }
      });

      var mobileLinks = overlay.querySelectorAll('.ndt-mobile-nav-link');
      mobileLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          setTimeout(closeMenu, 150);
        });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && body.classList.contains('ndt-nav-open')) {
          closeMenu();
        }
      });

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          closeMenu();
        }
      });
    }

    function syncMobileNavState() {
      if (!fab || !overlay) return;
      if (mobileQuery.matches) {
        initMobileNav();
      } else {
        closeMenu();
      }
    }

    if (mobileQuery && typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', syncMobileNavState);
    } else if (mobileQuery && typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(syncMobileNavState);
    }

    syncMobileNavState();

    // ============================================
    // ACTIVE STATE FOR CURRENT PAGE
    // ============================================
    var currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    var desktopLinks = document.querySelectorAll('.ndt-nav-link');
    var mobileLinksAll = document.querySelectorAll('.ndt-mobile-nav-link');
    var allLinks = Array.prototype.slice.call(desktopLinks).concat(Array.prototype.slice.call(mobileLinksAll));

    allLinks.forEach(function (link) {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
      var href = link.getAttribute('href');
      if (!href) return;
      var normalizedHref = href.replace(/\/+$/, '') || '/';

      if (currentPath === normalizedHref || (normalizedHref !== '/' && currentPath.indexOf(normalizedHref) === 0)) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });

    // ============================================
    // CTA HOVER ANIMATION (HERO + HEADER)
    // ============================================
    function initNdtLinkHovers() {
      if (typeof gsap === 'undefined') return false;

      var links = document.querySelectorAll('.ndt-link-item');
      if (!links.length) return true;

      links.forEach(function (link) {
        var sweep = link.querySelector('.ndt-link-sweep');
        var text = link.querySelector('.ndt-link-text');
        var arrow = link.querySelector('.ndt-link-arrow');
        if (!sweep || !text || !arrow) return;

        var isHeaderCTA = link.classList.contains('ndt-header-cta-link');

        var hoverTl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power2.out', duration: 0.3 }
        });

        hoverTl
          .to(link, { y: -2, scale: 1.04, duration: 0.3, ease: 'power2.out' }, 0)
          .to(sweep, { scaleX: 1, duration: 0.25, ease: 'power2.out' }, 0)
          .to(text, { letterSpacing: '0.5px', x: -3, duration: 0.3 }, 0)
          .to(arrow, { opacity: 1, x: 0, duration: 0.25, ease: 'back.out(2)' }, 0.05);

        if (isHeaderCTA) {
          hoverTl.to(link, { color: '#111317', duration: 0.25 }, 0);
        }

        link.addEventListener('mouseenter', function () { hoverTl.play(); });
        link.addEventListener('mouseleave', function () { hoverTl.reverse(); });
        link.addEventListener('focusin', function () { hoverTl.play(); });
        link.addEventListener('focusout', function () { hoverTl.reverse(); });
      });

      return true;
    }

    if (!initNdtLinkHovers()) {
      window.addEventListener('load', initNdtLinkHovers);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNdtHeader);
  } else {
    initNdtHeader();
  }
})();
