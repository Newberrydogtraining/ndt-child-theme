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
/* =========================================
   NDT Hero: Dog Parallax + Park Pin
   Reparent dogs to park, scroll-linked fall
   + cinematic mouse parallax with independent dog movement
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
             
             Design philosophy:
             - Park: Massive, slow, opposite = distant backdrop
             - Chubby: Alert, reactive, X-biased = engaged leader
             - Bluebell: Calm, floaty, Y-biased = relaxed follower
             - Micro-rotation: Dogs "look" toward mouse = alive
             - Counter-sway: Subtle opposition at extremes = tension
             ---------------------------------------- */
          
          var landedY = travel;

          // Parallax personality profiles
          var motion = {
            park: {
              xMult: -25,      // Opposite direction, strong
              yMult: -18,      // Opposite, slightly less
              duration: 0.6,   // Fastest - grounds the scene
              ease: 'power1.out'
            },
            chubby: {
              xMult: 22,       // Strong X movement
              yMult: 12,       // Less Y = favors horizontal
              duration: 0.5,   // Fastest dog - alert, reactive
              ease: 'power2.out', // Snappy - energetic personality
              rotationMult: 2, // Slight "look" toward mouse
              counterX: 0.15   // At extremes, slight counter-sway
            },
            bluebell: {
              xMult: 8,        // Gentle X
              yMult: 14,       // More Y = favors vertical (different path!)
              duration: 1.1,   // Slowest - calm, floaty
              ease: 'sine.out', // Soft - relaxed personality
              rotationMult: -1.5, // Counter-rotates (looks opposite way)
              counterX: -0.1   // Opposite counter-sway
            }
          };

          function handleMouseMove(e) {
            if (!parallaxEnabled) return;

            // Normalize to -0.5 to 0.5
            var xPos = (e.clientX / window.innerWidth) - 0.5;
            var yPos = (e.clientY / window.innerHeight) - 0.5;

            // Non-linear response: amplify center movement, soften extremes
            // Creates more "alive" feel - responsive but not twitchy
            var xCurved = xPos * (1 - Math.abs(xPos) * 0.3);
            var yCurved = yPos * (1 - Math.abs(yPos) * 0.3);

            /* --- PARK --- */
            // Moves opposite = creates depth parallax
            gsap.to(parkBg, {
              x: xCurved * motion.park.xMult,
              y: yCurved * motion.park.yMult,
              duration: motion.park.duration,
              ease: motion.park.ease,
              overwrite: 'auto'
            });

            /* --- CHUBBY (Left dog - Alert leader) --- */
            // Main movement: strong X bias
            var chubbyX = xCurved * motion.chubby.xMult;
            var chubbyY = yCurved * motion.chubby.yMult;
            
            // Counter-sway: at X extremes, add slight opposite pull
            // Creates tension, like he's bracing against the motion
            chubbyX += (xPos * xPos * xPos) * 30 * motion.chubby.counterX;
            
            // Micro-rotation: "looks" toward mouse direction
            var chubbyRotation = xCurved * motion.chubby.rotationMult;

            gsap.to(chubby, {
              x: chubbyX,
              y: landedY + chubbyY,
              rotation: chubbyRotation,
              duration: motion.chubby.duration,
              ease: motion.chubby.ease,
              overwrite: 'auto'
            });

            /* --- BLUEBELL (Right dog - Calm follower) --- */
            // Main movement: Y bias = different diagonal path
            var bluebellX = xCurved * motion.bluebell.xMult;
            var bluebellY = yCurved * motion.bluebell.yMult;
            
            // Counter-sway: opposite direction from Chubby
            // When Chubby leans right, she subtly leans left
            bluebellX += (xPos * xPos * xPos) * 30 * motion.bluebell.counterX;
            
            // Counter-rotation: looks slightly opposite
            // Creates "aware of each other" dynamic
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

          function resetMouseParallax() {
            gsap.to(parkBg, {
              x: 0,
              y: 0,
              duration: 0.8,
              ease: 'power2.out'
            });

            gsap.to(chubby, {
              x: 0,
              y: landedY,
              rotation: 0,
              duration: 0.6,
              ease: 'power2.out'
            });

            gsap.to(bluebell, {
              x: 0,
              y: landedY,
              rotation: 0,
              duration: 1,
              ease: 'sine.out'
            });
          }

          parkBg.addEventListener('mousemove', handleMouseMove);

       ScrollTrigger.create({
            trigger: heroStage,
            start: 'top top',
            end: 'bottom top-=50',  // Dogs finish 50px early
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
             Smooth approach before pin
             ---------------------------------------- */
          ScrollTrigger.create({
            trigger: parkBg,
            start: 'top top+=45',  // Shorter approach
            end: 'top top',
            scrub: 0.1,  // Faster response
            onUpdate: function(self) {
              var eased = gsap.parseEase('power2.inOut')(self.progress);
              var offset = (1 - eased) * 12;  // Slightly less offset
              gsap.set(parkBg, { y: offset });
            },
            onLeave: function() {
              gsap.set(parkBg, { y: 0 });
            }
          });

          /* ----------------------------------------
             Park pin
             ---------------------------------------- */
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
              
              // Ensure park is settled
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

    // Headline accent words – per-letter
    var toolChars    = shell.querySelectorAll('.ndt-purpose-word--tool .ndt-purpose-char');
    var resultChars  = shell.querySelectorAll('.ndt-purpose-word--result .ndt-purpose-char');
    var productChars = shell.querySelectorAll('.ndt-purpose-word--product .ndt-purpose-char');

    var ulTool    = shell.querySelector('.ndt-purpose-word--tool .ndt-purpose-word-underline');
    var ulResult  = shell.querySelector('.ndt-purpose-word--result .ndt-purpose-word-underline');
    var ulProduct = shell.querySelector('.ndt-purpose-word--product .ndt-purpose-word-underline');

    var wordUnderlinesAll = shell.querySelectorAll('.ndt-purpose-word-underline');

    // Use your global GSAP wrapper
    var gsap = NDT.gsap && NDT.gsap.gsap;
    var prefersReduced = !!NDT.prefersReducedMotion;

    // Fallback: no GSAP or reduced motion → just show everything statically
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
      return;
    }

    // Register plugins if available
    if (typeof NDT.gsap.registerPlugins === 'function') {
      NDT.gsap.registerPlugins();
    }

    // INITIAL STATE
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

    // Accent letters initial state
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

    // TIMELINE – ScrollTrigger if available
    var tlConfig = { defaults: { ease: 'power2.out' } };

    if (typeof window.ScrollTrigger !== 'undefined') {
      tlConfig.scrollTrigger = {
        trigger: card || shell,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true
      };
    }

    var tl = gsap.timeline(tlConfig);

    // 1. Card
    if (card) {
      tl.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.35 });
    }

    // 2. Header block
    if (header) {
      tl.to(header, { opacity: 1, y: 0, duration: 0.25 }, '-=0.2');
    }

    // 3. Column headers
    if (colHeaders.length) {
      tl.to(colHeaders, { opacity: 1, y: 0, duration: 0.22, stagger: 0.04 }, '-=0.16');
    }

    // 4. Column underlines
    if (colUnder.length) {
      tl.to(colUnder, { width: '100%', duration: 0.28, ease: 'circ.out' }, '-=0.18');
    }

    // 5. Items
    if (items.length) {
      tl.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: { each: 0.03, from: 'edges' }
      }, '-=0.2');
    }

    // 6. Footer
    if (footer) {
      tl.to(footer, { opacity: 1, y: 0, duration: 0.26 }, '-=0.18');
    }

   // ========================================
    // ACCENT WORD ANIMATIONS
    // ========================================

    // 7. TOOL word (quick reveal)
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

    // 8. RESULT word (starts right after TOOL)
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

    // 9. PRODUCT word (longer pause, slower reveal)
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

      // Dim previous underlines
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
    // ========================================
    // Magnetic hover (desktop only)
    // ========================================

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
  };

  // Use NDT.onReady / NDT.ready if present, else plain DOMContentLoaded
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













