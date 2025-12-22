/* =========================================
   NDT HERO - LUXURY SCROLL EXPERIENCE
   Apple MacBook Pro-Inspired Interactions
   ========================================= */

(function (window, document) {
  'use strict';

  // Early exit if nothing hero-related is present
  if (
    !document.querySelector('.ndt-hero-experience') &&
    !document.querySelector('.ndt-hero-promise')
  ) {
    return;
  }

  /* =========================================
     SCROLL-TRIGGERED REVEAL ANIMATIONS
     ========================================= */

  function initScrollReveal() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15 // Trigger when 15% of element is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');

          // Stagger child elements if they exist
          staggerChildren(entry.target);

          // Unobserve after revealing (one-time animation)
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all main section containers
    const sectionsToReveal = document.querySelectorAll([
      '.ndt-hero-statement',
      '.ndt-hero-promise',
      '.ndt-hero-promise__media',
      '.ndt-hero-challenge',
      '.ndt-hero-services',
      '.ndt-hero-proof',
      '.ndt-hero-transformation',
      '.ndt-hero-cta-finale'
    ].join(','));

    sectionsToReveal.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });
  }

  /* =========================================
     STAGGER CHILD ELEMENT ANIMATIONS
     ========================================= */

  function staggerChildren(parent) {
    // Challenge items
    const challengeItems = parent.querySelectorAll('.ndt-hero-challenge__item');
    if (challengeItems.length > 0) {
      challengeItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('is-visible');
        }, index * 100); // 100ms stagger
      });
    }

    // Service cards
    const serviceCards = parent.querySelectorAll('.ndt-hero-service-card');
    if (serviceCards.length > 0) {
      serviceCards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('is-visible');
        }, index * 150); // 150ms stagger
      });
    }

    // Transformation outcomes
    const outcomes = parent.querySelectorAll('.ndt-hero-transformation__outcome');
    if (outcomes.length > 0) {
      outcomes.forEach((outcome, index) => {
        setTimeout(() => {
          outcome.classList.add('is-visible');
        }, index * 120); // 120ms stagger
      });
    }
  }

  /* =========================================
     PROOF SECTION TABS
     ========================================= */

  function initProofTabs() {
    const proofSection = document.querySelector('.ndt-hero-proof');
    if (!proofSection) return;

    const tabs = proofSection.querySelectorAll('.ndt-hero-proof__tab');
    const panels = proofSection.querySelectorAll('.ndt-hero-proof__panel');
    const indicator = proofSection.querySelector('.ndt-hero-proof__tabs-indicator');

    if (tabs.length === 0 || panels.length === 0 || !indicator) return;

    // Function to move indicator to active tab
    function moveIndicator(activeTab) {
      const tabRect = activeTab.getBoundingClientRect();
      const containerRect = activeTab.parentElement.getBoundingClientRect();

      // Calculate position relative to container
      const left = tabRect.left - containerRect.left;
      const width = tabRect.width;

      // Apply transform for smooth sliding
      indicator.style.transform = `translateX(${left}px)`;
      indicator.style.width = `${width}px`;
    }

    // Set first tab/panel as active by default
    tabs[0]?.classList.add('is-active');
    panels[0]?.classList.add('is-active');

    // Initialize indicator position on first tab
    if (tabs[0]) {
      // Wait for DOM to fully render before calculating
      requestAnimationFrame(() => {
        moveIndicator(tabs[0]);
      });
    }

    // Tab click handlers
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and panels
        tabs.forEach(t => t.classList.remove('is-active'));
        panels.forEach(p => p.classList.remove('is-active'));

        // Add active class to clicked tab and corresponding panel
        tab.classList.add('is-active');
        if (panels[index]) {
          panels[index].classList.add('is-active');
        }

        // Slide indicator to clicked tab
        moveIndicator(tab);
      });
    });

    // Handle window resize - reposition indicator
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const activeTab = proofSection.querySelector('.ndt-hero-proof__tab.is-active');
        if (activeTab) {
          moveIndicator(activeTab);
        }
      }, 150);
    }, { passive: true });
  }

  /* =========================================
     SCROLL HINT BEHAVIOR
     ========================================= */

  function initScrollHint() {
    let hasScrolled = false;

    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 100) {
        hasScrolled = true;
        document.body.classList.add('ndt-has-scrolled');
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /* =========================================
     VIDEO AUTO-PLAY HANDLING
     ========================================= */

  function initVideoPlayers() {
    const videos = document.querySelectorAll([
      '.ndt-hero-promise__video',
      '.ndt-hero-transformation__video'
    ].join(','));

    videos.forEach((video) => {
      if (video && video.tagName === 'VIDEO') {
        // Set video attributes for autoplay
        video.setAttribute('autoplay', '');
        video.setAttribute('loop', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');

        // Attempt to play (will only work if muted and autoplay allowed)
        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            // Autoplay was prevented
            console.log('Video autoplay prevented:', error);
          });
        }
      }
    });

    // Intersection Observer for video lazy loading/playing
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          // Video is in viewport, ensure it's playing
          if (video.paused) {
            video.play().catch(() => {
              // Silent fail if autoplay still blocked
            });
          }
        } else {
          // Video out of viewport, pause to save resources
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, {
      threshold: 0.25
    });

    videos.forEach((video) => {
      if (video && video.tagName === 'VIDEO') {
        videoObserver.observe(video);
      }
    });
  }

  /* =========================================
     PROMISE VIDEO TILT (Mouse Parallax)
     ========================================= */

  function initPromiseTilt() {
    const mediaEls = document.querySelectorAll('.ndt-hero-promise__media');
    if (!mediaEls.length) return;

    // Respect reduced motion + coarse pointers (mobile)
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (prefersReduced || coarsePointer) return;

    mediaEls.forEach((media) => {
      let tiltLayer = media.querySelector('.ndt-hero-promise__media-tilt');

      if (!tiltLayer) {
        tiltLayer = document.createElement('div');
        tiltLayer.className = 'ndt-hero-promise__media-tilt';

        while (media.firstChild) {
          tiltLayer.appendChild(media.firstChild);
        }

        media.appendChild(tiltLayer);
      }

      const target = tiltLayer;

      // Guard if the element is missing
      if (!target) return;

      let raf = null;
      let active = false;
      let bounds = null;

      const current = { x: 0, y: 0 };
      const targetPoint = { x: 0, y: 0 };

      // Slight perspective tilt
      const maxRotate = 4.5; // degrees
      const maxTranslate = 8; // px
      const maxScale = 1.02;
      const smooth = 0.12;
      const settleEpsilon = 0.001;

      media.style.perspective = '900px';
      target.style.willChange = 'transform';
      target.style.transformStyle = 'preserve-3d';
      target.style.transformOrigin = 'center center';

      function updateBounds() {
        bounds = media.getBoundingClientRect();
      }

      function applyTransform() {
        const dx = targetPoint.x - current.x;
        const dy = targetPoint.y - current.y;

        current.x += dx * smooth;
        current.y += dy * smooth;

        const rotateY = current.x * maxRotate;
        const rotateX = -current.y * maxRotate;
        const translateX = current.x * maxTranslate;
        const translateY = current.y * maxTranslate;

        target.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${maxScale})`;

        if (
          active ||
          Math.abs(targetPoint.x - current.x) > settleEpsilon ||
          Math.abs(targetPoint.y - current.y) > settleEpsilon
        ) {
          raf = requestAnimationFrame(applyTransform);
        } else {
          raf = null;
        }
      }

      function setTargetFromEvent(e) {
        if (!bounds) updateBounds();
        if (!bounds || !bounds.width || !bounds.height) return;

        const x = (e.clientX - bounds.left) / bounds.width;
        const y = (e.clientY - bounds.top) / bounds.height;

        const clampedX = Math.max(-1, Math.min(1, (x - 0.5) * 2));
        const clampedY = Math.max(-1, Math.min(1, (y - 0.5) * 2));

        targetPoint.x = clampedX;
        targetPoint.y = clampedY;

        if (!raf) raf = requestAnimationFrame(applyTransform);
      }

      function onEnter(e) {
        active = true;
        updateBounds();
        setTargetFromEvent(e);
      }

      function onMove(e) {
        if (!active) return;
        setTargetFromEvent(e);
      }

      function onLeave() {
        active = false;
        targetPoint.x = 0;
        targetPoint.y = 0;
        if (!raf) raf = requestAnimationFrame(applyTransform);
      }

      media.addEventListener('pointerenter', onEnter);
      media.addEventListener('pointermove', onMove, { passive: true });
      media.addEventListener('pointerleave', onLeave);
      media.addEventListener('pointercancel', onLeave);
    });
  }

  /* =========================================
     SMOOTH SCROLL TO SECTIONS
     ========================================= */

  function initSmoothScroll() {
    // If there are any internal anchor links to sections
    const scrollLinks = document.querySelectorAll('a[href^="#ndt-hero-section"]');

    scrollLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /* =========================================
     APPLE-STYLE CARD HOVER EFFECTS
     Enhanced 3D parallax on mouse move
     ========================================= */

  function initAppleCardEffects() {
    // Respect reduced motion preference
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    if (prefersReduced || isMobile) return;

    // Select all interactive cards
    const cards = document.querySelectorAll([
      '.ndt-hero-challenge__item',
      '.ndt-hero-service-card',
      '.ndt-hero-proof__value'
    ].join(','));

    cards.forEach((card) => {
      let rafId = null;
      let bounds = null;
      let isHovering = false;

      // Current state
      let currentY = 0;
      let currentScale = 1;
      let currentRotateX = 0;
      let currentRotateY = 0;

      // Target state
      let targetY = 0;
      let targetScale = 1;
      let targetRotateX = 0;
      let targetRotateY = 0;

      const lerp = (start, end, factor) => {
        return start + (end - start) * factor;
      };

      const animate = () => {
        // Apple-like smooth interpolation - consistent timing for hover and leave
        // Lower lerp factor = smoother, more gradual animation (like Apple)
        const lerpFactor = 0.16; // Balanced, elegant feel matching Apple Store

        currentY = lerp(currentY, targetY, lerpFactor);
        currentScale = lerp(currentScale, targetScale, lerpFactor);
        currentRotateX = lerp(currentRotateX, targetRotateX, lerpFactor);
        currentRotateY = lerp(currentRotateY, targetRotateY, lerpFactor);

        // Apply transform - JS handles everything
        card.style.transform = `
          translateY(${currentY}px)
          scale(${currentScale})
          perspective(1000px)
          rotateX(${currentRotateX}deg)
          rotateY(${currentRotateY}deg)
        `;

        // Continue animation if not settled
        const epsilon = 0.05;
        if (Math.abs(targetY - currentY) > epsilon ||
            Math.abs(targetScale - currentScale) > 0.001 ||
            Math.abs(targetRotateX - currentRotateX) > epsilon ||
            Math.abs(targetRotateY - currentRotateY) > epsilon) {
          rafId = requestAnimationFrame(animate);
        } else {
          rafId = null;

          // Clean reset when fully settled and not hovering
          if (!isHovering && targetY === 0) {
            card.style.transform = '';
            currentY = 0;
            currentScale = 1;
            currentRotateX = 0;
            currentRotateY = 0;
          }
        }
      };

      const handleMouseMove = (e) => {
        if (!bounds) {
          bounds = card.getBoundingClientRect();
        }

        // Calculate mouse position relative to card center
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        const deltaX = (e.clientX - centerX) / bounds.width;
        const deltaY = (e.clientY - centerY) / bounds.height;

        // Update all targets
        targetY = -6;
        targetScale = 1.02;
        targetRotateX = -deltaY * 2.5;
        targetRotateY = deltaX * 2.5;

        // Start animation loop if not running
        if (!rafId) {
          rafId = requestAnimationFrame(animate);
        }
      };

      const handleMouseEnter = () => {
        isHovering = true;
        bounds = card.getBoundingClientRect();

        // Immediately set hover targets
        targetY = -6;
        targetScale = 1.02;

        // Only allow box-shadow to transition via CSS, transforms via JS
        card.style.transition = 'box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        if (!rafId) {
          rafId = requestAnimationFrame(animate);
        }
      };

      const handleMouseLeave = () => {
        isHovering = false;
        bounds = null;

        // Reset all targets immediately
        targetY = 0;
        targetScale = 1;
        targetRotateX = 0;
        targetRotateY = 0;

        // Start smooth return animation
        if (!rafId) {
          rafId = requestAnimationFrame(animate);
        }
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mousemove', handleMouseMove, { passive: true });
      card.addEventListener('mouseleave', handleMouseLeave);
    });
  }

  /* =========================================
     INITIALIZE ALL COMPONENTS
     ========================================= */

  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize all hero components
    initScrollReveal();
    initProofTabs();
    initScrollHint();
    initVideoPlayers();
    initPromiseTilt();
    initSmoothScroll();
    initAppleCardEffects();

    // Add loaded class to body for any CSS-based reveals
    document.body.classList.add('ndt-hero-loaded');
  }

  // Start initialization
  init();

})(window, document);


/* =========================================
   NDT HERO DOG PARALLAX (Legacy - Keep)
   Note: This controls the dog images parallax
   User will adjust timing/trigger later
   ========================================= */

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
      var parkBg    = document.querySelector('.ndt-dog-bg');

      if (!heroStage || !chubby || !bluebell || !shadow || !parkBg) return;
      if (typeof ScrollTrigger.matchMedia !== 'function') return;

      ScrollTrigger.matchMedia({
        '(prefers-reduced-motion: reduce)': function () {},

        '(min-width: 1024px) and (min-height: 900px)': function () {
          var dogs = [chubby, bluebell, shadow];

          var scrollY = window.scrollY || window.pageYOffset || 0;

          var parkRect    = parkBg.getBoundingClientRect();
          var parkDocTop  = parkRect.top + scrollY;
          var parkDocLeft = parkRect.left;

          var dogData = dogs.map(function (el) {
            var r = el.getBoundingClientRect();
            return {
              el: el,
              docTop: r.top + scrollY,
              docLeft: r.left,
              width: r.width,
              height: r.height
            };
          });

          dogs.forEach(function (el) {
            parkBg.appendChild(el);
          });

          dogData.forEach(function (d) {
            var topRelativeToPark  = d.docTop  - parkDocTop;
            var leftRelativeToPark = d.docLeft - parkDocLeft;

            gsap.set(d.el, {
              position: 'absolute',
              top: topRelativeToPark,
              left: leftRelativeToPark,
              width: d.width,
              height: d.height,
              x: 0,
              y: 0,
              willChange: 'transform, opacity'
            });
          });

          gsap.set(shadow, { opacity: 0 });

          var travel = window.innerHeight;

          /* ----------------------------------------
             Scroll animation state
             ---------------------------------------- */
          var targetScrollProgress  = 0;
          var currentScrollProgress = 0;
          var maxScrollProgress     = 0;
          var scrollLerpFactor      = 0.18;
          var rafId                 = null;
          var parallaxEnabled       = false;

          function lerp(start, end, factor) {
            return start + (end - start) * factor;
          }

          function renderScroll() {
            if (parallaxEnabled) {
              rafId = null;
              return;
            }

            var needsUpdate = false;

            currentScrollProgress = lerp(currentScrollProgress, targetScrollProgress, scrollLerpFactor);
            if (Math.abs(currentScrollProgress - targetScrollProgress) < 0.0001) {
              currentScrollProgress = targetScrollProgress;
            } else {
              needsUpdate = true;
            }

            var scrollDrivenY = currentScrollProgress * travel;
            var shadowOpacity = Math.max(0, Math.min(1, (currentScrollProgress - 0.6) / 0.4));

            gsap.set(chubby, { y: scrollDrivenY });
            gsap.set(bluebell, { y: scrollDrivenY });
            gsap.set(shadow, { y: scrollDrivenY, opacity: shadowOpacity });

            if (needsUpdate) {
              rafId = requestAnimationFrame(renderScroll);
            } else {
              rafId = null;
            }
          }

          function startScrollRender() {
            if (!rafId && !parallaxEnabled) {
              rafId = requestAnimationFrame(renderScroll);
            }
          }

          ScrollTrigger.create({
            trigger: heroStage,
            start: 'top top',
            end: 'bottom top',
            onUpdate: function (self) {
              var p = self.progress;
              if (p > maxScrollProgress) {
                maxScrollProgress = p;
              }
              targetScrollProgress = maxScrollProgress;
              startScrollRender();
            },
            onRefresh: function (self) {
              var p = self.progress;
              if (p > maxScrollProgress) {
                maxScrollProgress = p;
              }
              targetScrollProgress = maxScrollProgress;
              currentScrollProgress = maxScrollProgress;

              var scrollDrivenY = currentScrollProgress * travel;
              var shadowOpacity = Math.max(0, Math.min(1, (currentScrollProgress - 0.6) / 0.4));
              gsap.set(chubby, { y: scrollDrivenY });
              gsap.set(bluebell, { y: scrollDrivenY });
              gsap.set(shadow, { y: scrollDrivenY, opacity: shadowOpacity });
            }
          });

          /* ----------------------------------------
             CINEMATIC MOUSE PARALLAX
             ---------------------------------------- */

          var landedY = travel;

          var motion = {
            park: {
              xMult: -25,
              yMult: -18,
              duration: 0.6,
              ease: 'power1.out'
            },
            chubby: {
              xMult: 22,
              yMult: 12,
              duration: 0.5,
              ease: 'power2.out',
              rotationMult: 2,
              counterX: 0.15
            },
            bluebell: {
              xMult: 8,
              yMult: 14,
              duration: 1.1,
              ease: 'sine.out',
              rotationMult: -1.5,
              counterX: -0.1
            }
          };

          function handleMouseMove(e) {
            if (!parallaxEnabled) return;

            var xPos = (e.clientX / window.innerWidth) - 0.5;
            var yPos = (e.clientY / window.innerHeight) - 0.5;

            var xCurved = xPos * (1 - Math.abs(xPos) * 0.3);
            var yCurved = yPos * (1 - Math.abs(yPos) * 0.3);

            gsap.to(parkBg, {
              x: xCurved * motion.park.xMult,
              y: yCurved * motion.park.yMult,
              duration: motion.park.duration,
              ease: motion.park.ease,
              overwrite: 'auto'
            });

            var chubbyX = xCurved * motion.chubby.xMult;
            var chubbyY = yCurved * motion.chubby.yMult;
            chubbyX += (xPos * xPos * xPos) * 30 * motion.chubby.counterX;
            var chubbyRotation = xCurved * motion.chubby.rotationMult;

            gsap.to(chubby, {
              x: chubbyX,
              y: landedY + chubbyY,
              rotation: chubbyRotation,
              duration: motion.chubby.duration,
              ease: motion.chubby.ease,
              overwrite: 'auto'
            });

            var bluebellX = xCurved * motion.bluebell.xMult;
            var bluebellY = yCurved * motion.bluebell.yMult;
            bluebellX += (xPos * xPos * xPos) * 30 * motion.bluebell.counterX;
            var bluebellRotation = xCurved * motion.bluebell.rotationMult;

            gsap.to(bluebell, {
              x: bluebellX,
              y: landedY + bluebellY,
              rotation: bluebellRotation,
              duration: motion.bluebell.duration,
              ease: motion.bluebell.ease,
              overwrite: 'auto'
            });
          }

          parkBg.addEventListener('mousemove', handleMouseMove);

          ScrollTrigger.create({
            trigger: heroStage,
            start: 'top top',
            end: 'bottom top-=50',
            onUpdate: function (self) {
              var p = self.progress;
              if (p > maxScrollProgress) {
                maxScrollProgress = p;
              }
              targetScrollProgress = maxScrollProgress;
              startScrollRender();
            },
            onRefresh: function (self) {
              var p = self.progress;
              if (p > maxScrollProgress) {
                maxScrollProgress = p;
              }
              targetScrollProgress = maxScrollProgress;
              currentScrollProgress = maxScrollProgress;

              var scrollDrivenY = currentScrollProgress * travel;
              var shadowOpacity = Math.max(0, Math.min(1, (currentScrollProgress - 0.6) / 0.4));
              gsap.set(chubby, { y: scrollDrivenY });
              gsap.set(bluebell, { y: scrollDrivenY });
              gsap.set(shadow, { y: scrollDrivenY, opacity: shadowOpacity });
            }
          });

          ScrollTrigger.create({
            trigger: parkBg,
            start: 'top top+=45',
            end: 'top top',
            scrub: 0.1,
            onUpdate: function(self) {
              var eased = gsap.parseEase('power2.inOut')(self.progress);
              var offset = (1 - eased) * 12;
              gsap.set(parkBg, { y: offset });
            },
            onLeave: function() {
              gsap.set(parkBg, { y: 0 });
            }
          });

          ScrollTrigger.create({
            trigger: parkBg,
            start: 'top top',
            end: '+=350%',
            pin: true,
            pinSpacing: false,
            anticipatePin: 0,
            onEnter: function () {
              parallaxEnabled = true;
              if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
              }

              gsap.to(parkBg, {
                y: 0,
                duration: 0.10,
                ease: 'power1.out',
                overwrite: true
              });

              var chubbyCurrentY = gsap.getProperty(chubby, 'y');
              var bluebellCurrentY = gsap.getProperty(bluebell, 'y');
              var shadowCurrentY = gsap.getProperty(shadow, 'y');
              var shadowCurrentOp = gsap.getProperty(shadow, 'opacity');

              gsap.fromTo(chubby,
                { y: chubbyCurrentY },
                {
                  y: landedY,
                  duration: 0.6,
                  ease: 'sine.out',
                  overwrite: true
                }
              );
              gsap.fromTo(bluebell,
                { y: bluebellCurrentY },
                {
                  y: landedY,
                  duration: 0.7,
                  ease: 'sine.out',
                  overwrite: true
                }
              );
              gsap.fromTo(shadow,
                { y: shadowCurrentY, opacity: shadowCurrentOp },
                {
                  y: landedY,
                  opacity: 1,
                  duration: 0.65,
                  ease: 'sine.out',
                  overwrite: true
                }
              );
            },
            onEnterBack: function () {
              parallaxEnabled = true;
              if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
              }

              var chubbyCurrentY = gsap.getProperty(chubby, 'y');
              var bluebellCurrentY = gsap.getProperty(bluebell, 'y');
              var shadowCurrentY = gsap.getProperty(shadow, 'y');

              gsap.fromTo(chubby,
                { y: chubbyCurrentY },
                {
                  y: landedY,
                  duration: 0.6,
                  ease: 'sine.out',
                  overwrite: true
                }
              );
              gsap.fromTo(bluebell,
                { y: bluebellCurrentY },
                {
                  y: landedY,
                  duration: 0.7,
                  ease: 'sine.out',
                  overwrite: true
                }
              );
              gsap.fromTo(shadow,
                { y: shadowCurrentY },
                {
                  y: landedY,
                  opacity: 1,
                  duration: 0.65,
                  ease: 'sine.out',
                  overwrite: true
                }
              );
            },
            onLeave: function () {
              parallaxEnabled = false;

              gsap.to(chubby, {
                x: 0,
                y: landedY,
                rotation: 0,
                duration: 0.5,
                ease: 'sine.out',
                overwrite: true
              });
              gsap.to(bluebell, {
                x: 0,
                y: landedY,
                rotation: 0,
                duration: 0.6,
                ease: 'sine.out',
                overwrite: true
              });
            },
            onLeaveBack: function () {
              parallaxEnabled = false;

              var scrollDrivenY = maxScrollProgress * travel;
              var shadowOpacity = Math.max(0, Math.min(1, (maxScrollProgress - 0.6) / 0.4));

              var chubbyCurrentY = gsap.getProperty(chubby, 'y');
              var bluebellCurrentY = gsap.getProperty(bluebell, 'y');
              var shadowCurrentY = gsap.getProperty(shadow, 'y');

              gsap.fromTo(chubby,
                { y: chubbyCurrentY },
                {
                  x: 0,
                  y: scrollDrivenY,
                  rotation: 0,
                  duration: 0.7,
                  ease: 'sine.out',
                  overwrite: true
                }
              );

              gsap.fromTo(bluebell,
                { y: bluebellCurrentY },
                {
                  x: 0,
                  y: scrollDrivenY,
                  rotation: 0,
                  duration: 0.8,
                  ease: 'sine.out',
                  overwrite: true
                }
              );

              gsap.fromTo(shadow,
                { y: shadowCurrentY },
                {
                  x: 0,
                  y: scrollDrivenY,
                  opacity: shadowOpacity,
                  duration: 0.75,
                  ease: 'sine.out',
                  overwrite: true,
                  onComplete: function () {
                    currentScrollProgress = maxScrollProgress;
                    targetScrollProgress = maxScrollProgress;
                    startScrollRender();
                  }
                }
              );
            }
          });
        },

        '(min-width: 768px) and (max-height: 899px)': function () {}
      });
    } catch (err) {
      console.error('NDT hero dog parallax failed:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroDogParallax);
  } else {
    initHeroDogParallax();
  }
})();
