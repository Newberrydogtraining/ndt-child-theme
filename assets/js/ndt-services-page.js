// =========================================
// NDT SERVICES PAGE – IMMERSIVE EXPERIENCE
// A world-class services page with GSAP
// =========================================

(function () {
  'use strict';

  // =========================================
  // UTILITIES
  // =========================================

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isMobile() {
    return window.innerWidth < 768;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function debounce(fn, ms) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // =========================================
  // SERVICE DATA
  // =========================================

  const SERVICES = {
    private: {
      name: 'Private Lessons',
      tagline: '1-on-1 coaching that sticks',
      desc: 'Personalized sessions tailored to your specific goals. You learn alongside your dog with hands-on guidance.',
      icon: 'chat',
      color: '#BAA2E7',
      features: [
        'Customized training plan',
        'In-home or on-location sessions',
        'Real-time feedback and adjustments',
        'Lifetime support access'
      ]
    },
    day: {
      name: 'Day Training',
      tagline: 'Drop off. Train all day. Home by evening.',
      desc: 'Your dog trains with us during the day while you work. We handle the repetitions; you see the results.',
      icon: 'sun',
      color: '#7895C4',
      features: [
        'Full-day professional training',
        'Daily progress reports',
        'Weekly owner sessions',
        'Flexible scheduling'
      ]
    },
    board: {
      name: 'Board & Train',
      tagline: 'Immersive training. Fast results.',
      desc: 'Your dog lives with us for intensive, around-the-clock training. The fastest path to real change.',
      icon: 'home',
      color: '#9D8058',
      features: [
        '24/7 structured environment',
        'Intensive daily sessions',
        'Real-world proofing',
        'Owner training included'
      ]
    },
    group: {
      name: 'Group Classes',
      tagline: 'Learn together. Proof in public.',
      desc: 'Small group setting for socialization and distraction training. Build skills around other dogs.',
      icon: 'users',
      color: '#85A894',
      features: [
        'Small class sizes (4-6 dogs)',
        'Structured curriculum',
        'Real distraction training',
        'Community support'
      ]
    }
  };

  // =========================================
  // MAIN INITIALIZATION
  // =========================================

  function init() {
    const page = document.querySelector('.ndt-services-page');
    if (!page) return;

    // Initialize all modules
    initAmbientEffects(page);
    initHeroAnimations(page);
    initServiceOrbit(page);
    initShowcaseCarousel(page);
    initServiceCards(page);
    initMobileCards(page);
    initComparisonTable(page);
    initFaqAccordion(page);
    initMobileSheet(page);
    initScrollAnimations(page);
    init3DTilt(page);
    initMouseTracking(page);

    // Mark page as ready
    page.classList.add('is-ready');
  }

  // =========================================
  // AMBIENT EFFECTS
  // =========================================

  function initAmbientEffects(page) {
    const ambient = page.querySelector('.ndt-sp-ambient');
    if (!ambient) return;

    // Create floating particles
    const particleCount = isMobile() ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'ndt-sp-particle';
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: rgba(186, 162, 231, ${Math.random() * 0.3 + 0.1});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        pointer-events: none;
      `;
      ambient.appendChild(particle);
    }

    // Animate particles with GSAP if available
    if (window.gsap && !prefersReducedMotion()) {
      const particles = ambient.querySelectorAll('.ndt-sp-particle');
      particles.forEach((particle, i) => {
        gsap.to(particle, {
          x: `random(-50, 50)`,
          y: `random(-50, 50)`,
          opacity: `random(0.1, 0.4)`,
          duration: `random(8, 15)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.1
        });
      });
    }
  }

  // =========================================
  // HERO ANIMATIONS
  // =========================================

  function initHeroAnimations(page) {
    const hero = page.querySelector('.ndt-sp-hero');
    if (!hero) return;

    const badge = hero.querySelector('.ndt-sp-hero-badge');
    const title = hero.querySelector('.ndt-sp-hero-title');
    const subtitle = hero.querySelector('.ndt-sp-hero-subtitle');
    const ctas = hero.querySelector('.ndt-sp-hero-ctas');

    const elements = [badge, title, subtitle, ctas].filter(Boolean);

    if (window.gsap && !prefersReducedMotion()) {
      const tl = gsap.timeline({ delay: 0.2 });
      
      elements.forEach((el, i) => {
        tl.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out'
        }, i * 0.15);
      });

      // Animate title words
      if (title) {
        const words = title.querySelectorAll('.ndt-sp-hero-title-word');
        if (words.length) {
          tl.from(words, {
            opacity: 0,
            y: 30,
            rotationX: -20,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out'
          }, 0.3);
        }
      }
    } else {
      // Fallback: just show elements
      elements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }

  // =========================================
  // SERVICE ORBIT (DESKTOP)
  // =========================================

  function initServiceOrbit(page) {
    const orbit = page.querySelector('.ndt-sp-orbit');
    if (!orbit) return;

    const pills = orbit.querySelectorAll('.ndt-sp-orbit-pill');
    const center = orbit.querySelector('.ndt-sp-orbit-center');
    const centerIcon = center?.querySelector('.ndt-sp-orbit-icon');
    const centerTitle = center?.querySelector('.ndt-sp-orbit-title');
    const centerDesc = center?.querySelector('.ndt-sp-orbit-desc');

    let activeService = 'private';
    let isAnimating = false;
    let pendingService = null;

    function updateOrbitCenter(serviceKey, force = false) {
      const service = SERVICES[serviceKey];
      if (!service || !center) return;
      
      // Prevent rapid switching that causes glitches
      if (serviceKey === activeService && !force) return;
      
      // If already animating, queue this service
      if (isAnimating && !force) {
        pendingService = serviceKey;
        return;
      }

      isAnimating = true;
      activeService = serviceKey;
      page.dataset.activeService = serviceKey;

      // Update pills immediately (no animation lag)
      pills.forEach(pill => {
        const key = pill.dataset.service;
        pill.classList.toggle('is-active', key === serviceKey);
      });

      // Update center accent color
      if (center) {
        center.style.setProperty('--sp-active', service.color);
      }

      // Animate center content with GSAP
      if (window.gsap && !prefersReducedMotion()) {
        // Kill any existing animations to prevent conflicts
        gsap.killTweensOf([centerIcon, centerTitle, centerDesc]);
        
        const tl = gsap.timeline({
          onComplete: () => {
            isAnimating = false;
            // Process pending service if one was queued
            if (pendingService && pendingService !== activeService) {
              const pending = pendingService;
              pendingService = null;
              updateOrbitCenter(pending);
            }
          }
        });
        
        tl.to([centerIcon, centerTitle, centerDesc], {
          opacity: 0,
          y: -8,
          duration: 0.15,
          stagger: 0.03,
          ease: 'power2.in',
          overwrite: true
        })
        .call(() => {
          if (centerTitle) centerTitle.textContent = service.name;
          if (centerDesc) centerDesc.textContent = service.tagline;
          if (centerIcon) {
            centerIcon.innerHTML = getServiceIconSVG(serviceKey);
            const svg = centerIcon.querySelector('svg');
            if (svg) svg.style.color = service.color;
          }
        })
        .to([centerIcon, centerTitle, centerDesc], {
          opacity: 1,
          y: 0,
          duration: 0.25,
          stagger: 0.03,
          ease: 'power2.out'
        });
      } else {
        // No GSAP - instant update
        if (centerTitle) centerTitle.textContent = service.name;
        if (centerDesc) centerDesc.textContent = service.tagline;
        if (centerIcon) {
          centerIcon.innerHTML = getServiceIconSVG(serviceKey);
          const svg = centerIcon.querySelector('svg');
          if (svg) svg.style.color = service.color;
        }
        isAnimating = false;
      }
    }

    // Debounced hover handler to prevent rapid firing
    let hoverTimeout = null;
    function handlePillHover(serviceKey) {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        if (serviceKey && SERVICES[serviceKey] && serviceKey !== activeService) {
          updateOrbitCenter(serviceKey);
        }
      }, 80); // Small delay prevents flicker
    }

    // Pill click and hover handlers
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        clearTimeout(hoverTimeout);
        const serviceKey = pill.dataset.service;
        if (serviceKey && SERVICES[serviceKey]) {
          updateOrbitCenter(serviceKey);
        }
      });

      pill.addEventListener('mouseenter', () => {
        const serviceKey = pill.dataset.service;
        handlePillHover(serviceKey);
      });
      
      pill.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
      });
    });

    // Initialize with first service
    updateOrbitCenter('private');

    // Auto-rotate on desktop if no interaction
    if (!isMobile() && !prefersReducedMotion()) {
      let autoRotateTimer;
      let hasInteracted = false;
      const serviceKeys = Object.keys(SERVICES);
      let currentIndex = 0;

      function startAutoRotate() {
        if (hasInteracted) return;
        
        autoRotateTimer = setInterval(() => {
          if (hasInteracted) {
            clearInterval(autoRotateTimer);
            return;
          }
          currentIndex = (currentIndex + 1) % serviceKeys.length;
          updateOrbitCenter(serviceKeys[currentIndex]);
        }, 4000);
      }

      orbit.addEventListener('mouseenter', () => {
        hasInteracted = true;
        clearInterval(autoRotateTimer);
      });

      // Start after a delay
      setTimeout(startAutoRotate, 3000);
    }
  }

  // =========================================
  // SHOWCASE CAROUSEL
  // =========================================

  function initShowcaseCarousel(page) {
    const showcase = page.querySelector('.ndt-sp-showcase');
    if (!showcase) return;

    const carousel = showcase.querySelector('.ndt-sp-showcase-carousel');
    const slides = showcase.querySelectorAll('.ndt-sp-showcase-slide');
    const dots = showcase.querySelectorAll('.ndt-sp-showcase-dot');
    const prevBtn = showcase.querySelector('.ndt-sp-showcase-arrow--prev');
    const nextBtn = showcase.querySelector('.ndt-sp-showcase-arrow--next');
    
    if (!slides.length) return;

    let currentIndex = 0;
    let isDesktop = window.innerWidth >= 1024;
    let autoPlayTimer = null;

    // Get service key from index
    const serviceKeys = ['private', 'day', 'board', 'group'];

    function updateSlide(index, animate = true) {
      currentIndex = ((index % slides.length) + slides.length) % slides.length;
      
      if (isDesktop) {
        // Desktop: show only active slide with animation
        slides.forEach((slide, i) => {
          const isActive = i === currentIndex;
          slide.classList.toggle('is-active', isActive);
          
          if (window.gsap && animate && !prefersReducedMotion()) {
            if (isActive) {
              gsap.fromTo(slide, 
                { opacity: 0, scale: 0.95, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power2.out' }
              );
            }
          }
        });
      }
      
      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === currentIndex);
      });
    }

    function nextSlide() {
      updateSlide(currentIndex + 1);
    }

    function prevSlide() {
      updateSlide(currentIndex - 1);
    }

    // Dot click handlers
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        updateSlide(i);
        stopAutoPlay();
      });
    });

    // Arrow handlers
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoPlay();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoPlay();
      });
    }

    // Mobile scroll snap detection
    if (carousel && !isDesktop) {
      let scrollTimeout;
      carousel.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const scrollLeft = carousel.scrollLeft;
          const slideWidth = slides[0].offsetWidth + 32; // Including gap
          const newIndex = Math.round(scrollLeft / slideWidth);
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < slides.length) {
            currentIndex = newIndex;
            dots.forEach((dot, i) => {
              dot.classList.toggle('is-active', i === currentIndex);
            });
          }
        }, 50);
      });
    }

    // Auto-play on desktop
    function startAutoPlay() {
      if (!isDesktop || prefersReducedMotion()) return;
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        nextSlide();
      }, 5000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    // Pause on hover
    showcase.addEventListener('mouseenter', stopAutoPlay);
    showcase.addEventListener('mouseleave', () => {
      if (isDesktop) startAutoPlay();
    });

    // Keyboard navigation
    showcase.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        stopAutoPlay();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        stopAutoPlay();
      }
    });

    // Handle resize
    window.addEventListener('resize', debounce(() => {
      const wasDesktop = isDesktop;
      isDesktop = window.innerWidth >= 1024;
      
      if (wasDesktop !== isDesktop) {
        if (isDesktop) {
          // Switched to desktop
          slides.forEach(slide => slide.classList.remove('is-active'));
          slides[currentIndex].classList.add('is-active');
          startAutoPlay();
        } else {
          // Switched to mobile - show all slides
          slides.forEach(slide => slide.classList.add('is-active'));
          stopAutoPlay();
        }
      }
    }, 200));

    // Initialize
    updateSlide(0, false);
    
    // Start auto-play after a delay
    setTimeout(() => {
      if (isDesktop) startAutoPlay();
    }, 2000);

    // Intersection observer to pause when not visible
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (isDesktop) startAutoPlay();
          } else {
            stopAutoPlay();
          }
        });
      }, { threshold: 0.3 });
      
      observer.observe(showcase);
    }
  }

  // =========================================
  // SERVICE CARDS
  // =========================================

  function initServiceCards(page) {
    const cards = page.querySelectorAll('.ndt-sp-service-card');
    
    cards.forEach(card => {
      // Track mouse position for spotlight effect
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });

      // CTA click
      const cta = card.querySelector('.ndt-sp-service-card-cta');
      if (cta) {
        cta.addEventListener('click', (e) => {
          e.stopPropagation();
          // Could navigate to evaluation page
          window.location.href = '/evaluation';
        });
      }
    });
  }

  // =========================================
  // MOBILE CARDS (HORIZONTAL SWIPE)
  // =========================================

  function initMobileCards(page) {
    const container = page.querySelector('.ndt-sp-mobile-cards');
    if (!container) return;

    const cards = container.querySelectorAll('.ndt-sp-mobile-card');
    if (!cards.length) return;

    let activeIndex = 0;

    function updateActiveCard() {
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      let closest = 0;
      let closestDist = Infinity;

      cards.forEach((card, i) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const dist = Math.abs(cardCenter - centerX);
        
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });

      if (closest !== activeIndex) {
        activeIndex = closest;
        cards.forEach((card, i) => {
          card.classList.toggle('is-active', i === activeIndex);
        });

        // Update page active service
        const serviceKey = cards[activeIndex]?.dataset.service;
        if (serviceKey) {
          page.dataset.activeService = serviceKey;
        }
      }
    }

    container.addEventListener('scroll', debounce(updateActiveCard, 50), { passive: true });
    
    // Initial state
    updateActiveCard();
  }

  // =========================================
  // COMPARISON TABLE
  // =========================================

  function initComparisonTable(page) {
    const table = page.querySelector('.ndt-sp-compare-table');
    if (!table) return;

    // Add hover highlighting for rows
    const rows = table.querySelectorAll('.ndt-sp-compare-row:not(.ndt-sp-compare-row--header)');
    
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        row.style.background = 'rgba(186, 162, 231, 0.03)';
      });
      
      row.addEventListener('mouseleave', () => {
        row.style.background = '';
      });
    });

    // Column highlighting
    const headerCells = table.querySelectorAll('.ndt-sp-compare-row--header .ndt-sp-compare-cell');
    
    headerCells.forEach((cell, colIndex) => {
      if (colIndex === 0) return; // Skip feature name column
      
      cell.addEventListener('mouseenter', () => {
        rows.forEach(row => {
          const targetCell = row.children[colIndex];
          if (targetCell) {
            targetCell.style.background = 'rgba(186, 162, 231, 0.05)';
          }
        });
      });
      
      cell.addEventListener('mouseleave', () => {
        rows.forEach(row => {
          const targetCell = row.children[colIndex];
          if (targetCell) {
            targetCell.style.background = '';
          }
        });
      });
    });
  }

  // =========================================
  // FAQ ACCORDION
  // =========================================

  function initFaqAccordion(page) {
    const items = page.querySelectorAll('.ndt-sp-faq-item');
    
    items.forEach(item => {
      const trigger = item.querySelector('.ndt-sp-faq-trigger');
      const content = item.querySelector('.ndt-sp-faq-content');
      
      if (!trigger || !content) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        
        // Close all other items
        items.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('is-open')) {
            otherItem.classList.remove('is-open');
          }
        });
        
        // Toggle current item
        item.classList.toggle('is-open', !isOpen);

        // Animate with GSAP if available
        if (window.gsap && !prefersReducedMotion()) {
          if (!isOpen) {
            gsap.from(content.querySelector('.ndt-sp-faq-answer'), {
              opacity: 0,
              y: -10,
              duration: 0.3,
              ease: 'power2.out'
            });
          }
        }
      });
    });
  }

  // =========================================
  // MOBILE BOTTOM SHEET
  // =========================================

  function initMobileSheet(page) {
    const sheet = page.querySelector('.ndt-sp-mobile-sheet');
    if (!sheet) return;

    const handle = sheet.querySelector('.ndt-sp-mobile-sheet-handle');
    const peek = sheet.querySelector('.ndt-sp-mobile-sheet-peek');
    const navBtns = sheet.querySelectorAll('.ndt-sp-mobile-sheet-nav-btn');

    let isExpanded = false;
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    function toggleSheet(expand) {
      isExpanded = expand !== undefined ? expand : !isExpanded;
      sheet.classList.toggle('is-expanded', isExpanded);
    }

    // Handle click to toggle
    if (handle) {
      handle.addEventListener('click', () => toggleSheet());
    }
    if (peek) {
      peek.addEventListener('click', () => toggleSheet());
    }

    // Touch drag to expand/collapse
    if (handle) {
      handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        startY = e.touches[0].clientY;
      }, { passive: true });

      document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const delta = startY - currentY;
        
        if (delta > 50 && !isExpanded) {
          toggleSheet(true);
          isDragging = false;
        } else if (delta < -50 && isExpanded) {
          toggleSheet(false);
          isDragging = false;
        }
      }, { passive: true });

      document.addEventListener('touchend', () => {
        isDragging = false;
      });
    }

    // Navigation buttons
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        
        const serviceKey = btn.dataset.service;
        if (serviceKey) {
          page.dataset.activeService = serviceKey;
          updateSheetContent(sheet, serviceKey);
        }
      });
    });
  }

  function updateSheetContent(sheet, serviceKey) {
    const service = SERVICES[serviceKey];
    if (!service) return;

    const title = sheet.querySelector('.ndt-sp-mobile-sheet-title');
    if (title) {
      title.textContent = service.name;
    }

    // Could update more content here
  }

  // =========================================
  // SCROLL ANIMATIONS
  // =========================================

  function initScrollAnimations(page) {
    if (prefersReducedMotion()) return;

    const animateElements = page.querySelectorAll('.ndt-sp-animate-in');
    const staggerGroups = page.querySelectorAll('.ndt-sp-stagger');

    if (!window.IntersectionObserver) {
      // Fallback: just show everything
      animateElements.forEach(el => el.classList.add('is-visible'));
      staggerGroups.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(el => observer.observe(el));
    staggerGroups.forEach(el => observer.observe(el));
  }

  // =========================================
  // 3D TILT EFFECT
  // =========================================

  function init3DTilt(page) {
    if (isMobile() || prefersReducedMotion()) return;

    const tiltElements = page.querySelectorAll('.ndt-sp-service-card, .ndt-sp-orbit-center');

    tiltElements.forEach(el => {
      let bounds;
      let rafId;

      const updateTilt = (e) => {
        if (!bounds) bounds = el.getBoundingClientRect();
        
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        
        const rotateX = ((mouseY - centerY) / centerY) * -5;
        const rotateY = ((mouseX - centerX) / centerX) * 5;

        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          el.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateZ(10px)
          `;
        });
      };

      const resetTilt = () => {
        cancelAnimationFrame(rafId);
        el.style.transform = '';
        bounds = null;
      };

      el.addEventListener('mouseenter', () => {
        bounds = el.getBoundingClientRect();
      });
      
      el.addEventListener('mousemove', updateTilt);
      el.addEventListener('mouseleave', resetTilt);
    });
  }

  // =========================================
  // MOUSE TRACKING FOR AMBIENT
  // =========================================

  function initMouseTracking(page) {
    if (isMobile() || prefersReducedMotion()) return;

    const secondaryOrb = page.querySelector('.ndt-sp-ambient-orb--secondary');
    if (!secondaryOrb) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 100;
      targetY = (e.clientY / window.innerHeight - 0.5) * 100;
    });

    function animate() {
      currentX = lerp(currentX, targetX, 0.02);
      currentY = lerp(currentY, targetY, 0.02);
      
      secondaryOrb.style.transform = `translate(${currentX}px, ${currentY}px)`;
      
      requestAnimationFrame(animate);
    }

    animate();
  }

  // =========================================
  // SVG ICON GENERATOR
  // =========================================

  function getServiceIconSVG(serviceKey) {
    const icons = {
      private: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <circle cx="9" cy="10" r="1" fill="currentColor"/>
          <circle cx="12" cy="10" r="1" fill="currentColor"/>
          <circle cx="15" cy="10" r="1" fill="currentColor"/>
        </svg>
      `,
      day: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      `,
      board: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <path d="M9 22V12h6v10"/>
        </svg>
      `,
      group: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      `
    };
    
    return icons[serviceKey] || icons.private;
  }

  // =========================================
  // GSAP SCROLL TRIGGERS (IF AVAILABLE)
  // =========================================

  function initGSAPScrollTriggers(page) {
    if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);

    // Parallax ambient orbs
    const primaryOrb = page.querySelector('.ndt-sp-ambient-orb--primary');
    const secondaryOrb = page.querySelector('.ndt-sp-ambient-orb--secondary');

    if (primaryOrb) {
      gsap.to(primaryOrb, {
        y: 200,
        ease: 'none',
        scrollTrigger: {
          trigger: page,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1
        }
      });
    }

    // Service cards reveal
    const cards = page.querySelectorAll('.ndt-sp-service-card');
    cards.forEach((card, i) => {
      gsap.from(card, {
        y: 80,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        delay: i * 0.1
      });
    });

    // Comparison table rows
    const compareRows = page.querySelectorAll('.ndt-sp-compare-row:not(.ndt-sp-compare-row--header)');
    compareRows.forEach((row, i) => {
      gsap.from(row, {
        x: -30,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        },
        delay: i * 0.05
      });
    });

    // FAQ items
    const faqItems = page.querySelectorAll('.ndt-sp-faq-item');
    faqItems.forEach((item, i) => {
      gsap.from(item, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        },
        delay: i * 0.08
      });
    });
  }

  // =========================================
  // KEYBOARD NAVIGATION
  // =========================================

  function initKeyboardNav(page) {
    const pills = page.querySelectorAll('.ndt-sp-orbit-pill');
    const serviceKeys = Object.keys(SERVICES);
    let currentPillIndex = 0;

    document.addEventListener('keydown', (e) => {
      // Only handle if orbit is in view
      const orbit = page.querySelector('.ndt-sp-orbit');
      if (!orbit) return;

      const orbitRect = orbit.getBoundingClientRect();
      if (orbitRect.top > window.innerHeight || orbitRect.bottom < 0) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        currentPillIndex = (currentPillIndex + 1) % serviceKeys.length;
        pills[currentPillIndex]?.click();
        pills[currentPillIndex]?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        currentPillIndex = (currentPillIndex - 1 + serviceKeys.length) % serviceKeys.length;
        pills[currentPillIndex]?.click();
        pills[currentPillIndex]?.focus();
      }
    });
  }

  // =========================================
  // RECOMMENDATION ENGINE
  // =========================================

  function initRecommendationEngine(page) {
    const recommendWidget = page.querySelector('.ndt-sp-recommend');
    if (!recommendWidget) return;

    const scheduleToggle = recommendWidget.querySelector('[data-toggle="schedule"]');
    const dogToggle = recommendWidget.querySelector('[data-toggle="dog"]');
    const resultMain = recommendWidget.querySelector('.ndt-sp-recommend-result-main');
    const resultAlt = recommendWidget.querySelector('.ndt-sp-recommend-result-alt');
    const serviceCards = page.querySelectorAll('.ndt-sp-service-card');

    let scheduleValue = null;
    let dogValue = null;

    const recommendations = {
      // Schedule: slammed
      'slammed-puppy': { main: 'Day Training', alt: 'Board & Train if urgent', highlight: 'day' },
      'slammed-manners': { main: 'Day Training', alt: 'Board & Train for faster results', highlight: 'day' },
      'slammed-spicy': { main: 'Board & Train', alt: 'Private add-ons for owner coaching', highlight: 'board' },
      
      // Schedule: some time
      'some-puppy': { main: 'Private Lessons', alt: 'Day Training for extra reps', highlight: 'private' },
      'some-manners': { main: 'Private Lessons', alt: 'Group Classes for proofing', highlight: 'private' },
      'some-spicy': { main: 'Private Lessons', alt: 'Consider Board & Train intensive', highlight: 'private' },
      
      // Schedule: love training
      'love-puppy': { main: 'Private Lessons', alt: 'Group Classes after foundation', highlight: 'private' },
      'love-manners': { main: 'Group Classes', alt: 'Private for specific issues', highlight: 'group' },
      'love-spicy': { main: 'Private Lessons', alt: 'Focused behavior modification', highlight: 'private' }
    };

    function updateRecommendation() {
      if (!scheduleValue || !dogValue) {
        if (resultMain) resultMain.textContent = 'Select both options above';
        if (resultAlt) resultAlt.textContent = 'We\'ll suggest your best starting point.';
        return;
      }

      const key = `${scheduleValue}-${dogValue}`;
      const rec = recommendations[key];

      if (rec && resultMain && resultAlt) {
        // Animate the update
        if (window.gsap && !prefersReducedMotion()) {
          gsap.to([resultMain, resultAlt], {
            opacity: 0,
            y: -10,
            duration: 0.2,
            onComplete: () => {
              resultMain.textContent = rec.main;
              resultAlt.textContent = rec.alt;
              gsap.to([resultMain, resultAlt], {
                opacity: 1,
                y: 0,
                duration: 0.3,
                stagger: 0.1
              });
            }
          });
        } else {
          resultMain.textContent = rec.main;
          resultAlt.textContent = rec.alt;
        }

        // Highlight recommended card
        serviceCards.forEach(card => {
          const isHighlighted = card.classList.contains(`ndt-sp-service-card--${rec.highlight}`);
          card.classList.toggle('is-recommended', isHighlighted);
          
          if (isHighlighted && window.gsap && !prefersReducedMotion()) {
            gsap.to(card, {
              scale: 1.02,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => {
                gsap.to(card, { scale: 1, duration: 0.3 });
              }
            });
          }
        });
      }
    }

    function setupToggle(toggleEl, type) {
      if (!toggleEl) return;

      const options = toggleEl.querySelectorAll('.ndt-sp-recommend-toggle-option');
      const thumb = toggleEl.querySelector('.ndt-sp-recommend-toggle-thumb');

      options.forEach((option, index) => {
        option.addEventListener('click', () => {
          // Update active state
          options.forEach(opt => opt.classList.remove('is-active'));
          option.classList.add('is-active');

          // Move thumb
          if (thumb) {
            const optionWidth = option.offsetWidth;
            const thumbLeft = index * optionWidth;
            thumb.style.width = `${optionWidth}px`;
            thumb.style.transform = `translateX(${thumbLeft}px)`;
          }

          // Store value
          const value = option.dataset.value;
          if (type === 'schedule') {
            scheduleValue = value;
          } else if (type === 'dog') {
            dogValue = value;
          }

          updateRecommendation();
        });
      });
    }

    setupToggle(scheduleToggle, 'schedule');
    setupToggle(dogToggle, 'dog');
  }

  // =========================================
  // ENHANCED MOBILE GESTURES
  // =========================================

  function initMobileGestures(page) {
    if (!isMobile()) return;

    const cards = page.querySelectorAll('.ndt-sp-mobile-card');
    const container = page.querySelector('.ndt-sp-mobile-cards');
    
    if (!container || !cards.length) return;

    // Touch feedback with haptics simulation
    cards.forEach(card => {
      let touchStartTime = 0;
      let touchStartX = 0;
      let touchStartY = 0;

      card.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        
        // Scale down slightly for press feedback
        card.style.transition = 'transform 0.1s ease';
        card.style.transform = 'scale(0.98)';
      }, { passive: true });

      card.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - touchStartTime;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = Math.abs(touchEndX - touchStartX);
        const deltaY = Math.abs(touchEndY - touchStartY);
        
        // Reset scale
        card.style.transform = '';
        
        // If it was a tap (short duration, minimal movement)
        if (touchDuration < 300 && deltaX < 10 && deltaY < 10) {
          // Trigger haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(10);
          }
          
          // Visual feedback
          card.style.transition = 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
          card.style.transform = 'scale(1.02)';
          setTimeout(() => {
            card.style.transform = '';
          }, 150);
        }
      }, { passive: true });

      card.addEventListener('touchcancel', () => {
        card.style.transform = '';
      }, { passive: true });
    });

    // Swipe indicator
    let hasScrolled = false;
    container.addEventListener('scroll', () => {
      if (!hasScrolled) {
        hasScrolled = true;
        const hint = page.querySelector('.ndt-sp-mobile-swipe-hint');
        if (hint) {
          hint.style.opacity = '0';
          setTimeout(() => hint.remove(), 300);
        }
      }
    }, { passive: true });
  }

  // =========================================
  // SERVICE CARD EXPANSION (MOBILE)
  // =========================================

  function initMobileCardExpansion(page) {
    if (!isMobile()) return;

    const cards = page.querySelectorAll('.ndt-sp-service-card');
    
    cards.forEach(card => {
      const body = card.querySelector('.ndt-sp-service-card-body');
      const features = card.querySelector('.ndt-sp-service-features');
      
      if (!body || !features) return;

      // Initially collapse features on mobile
      features.style.maxHeight = '0';
      features.style.overflow = 'hidden';
      features.style.transition = 'max-height 0.4s ease, opacity 0.3s ease';
      features.style.opacity = '0';

      // Create expand button
      const expandBtn = document.createElement('button');
      expandBtn.className = 'ndt-sp-service-card-expand';
      expandBtn.innerHTML = `
        <span>See what's included</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      `;
      expandBtn.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.75rem;
        margin-top: 1rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        color: var(--sp-text-muted, #9CA3AF);
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      `;
      expandBtn.querySelector('svg').style.cssText = `
        width: 16px;
        height: 16px;
        transition: transform 0.3s ease;
      `;

      body.insertBefore(expandBtn, features);

      let isExpanded = false;

      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isExpanded = !isExpanded;

        if (isExpanded) {
          features.style.maxHeight = features.scrollHeight + 'px';
          features.style.opacity = '1';
          expandBtn.querySelector('span').textContent = 'Show less';
          expandBtn.querySelector('svg').style.transform = 'rotate(180deg)';
          expandBtn.style.borderColor = 'rgba(186, 162, 231, 0.3)';
        } else {
          features.style.maxHeight = '0';
          features.style.opacity = '0';
          expandBtn.querySelector('span').textContent = 'See what\'s included';
          expandBtn.querySelector('svg').style.transform = '';
          expandBtn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }

        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      });
    });
  }

  // =========================================
  // PROGRESS INDICATOR (MOBILE)
  // =========================================

  function initMobileProgressIndicator(page) {
    if (!isMobile()) return;

    const container = page.querySelector('.ndt-sp-mobile-cards');
    if (!container) return;

    const cards = container.querySelectorAll('.ndt-sp-mobile-card');
    if (cards.length <= 1) return;

    // Create progress indicator
    const progress = document.createElement('div');
    progress.className = 'ndt-sp-mobile-progress';
    progress.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 1rem 0;
    `;

    cards.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'ndt-sp-mobile-progress-dot';
      dot.dataset.index = i;
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
        cursor: pointer;
      `;
      if (i === 0) {
        dot.style.background = 'var(--sp-primary, #BAA2E7)';
        dot.style.width = '24px';
        dot.style.borderRadius = '4px';
      }
      progress.appendChild(dot);
    });

    container.parentNode.insertBefore(progress, container.nextSibling);

    // Update progress on scroll
    let activeIndex = 0;

    function updateProgress() {
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      let closest = 0;
      let closestDist = Infinity;

      cards.forEach((card, i) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const dist = Math.abs(cardCenter - centerX);
        
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });

      if (closest !== activeIndex) {
        activeIndex = closest;
        
        progress.querySelectorAll('.ndt-sp-mobile-progress-dot').forEach((dot, i) => {
          if (i === activeIndex) {
            dot.style.background = 'var(--sp-primary, #BAA2E7)';
            dot.style.width = '24px';
            dot.style.borderRadius = '4px';
          } else {
            dot.style.background = 'rgba(255, 255, 255, 0.2)';
            dot.style.width = '8px';
            dot.style.borderRadius = '50%';
          }
        });
      }
    }

    container.addEventListener('scroll', debounce(updateProgress, 30), { passive: true });

    // Click to scroll
    progress.querySelectorAll('.ndt-sp-mobile-progress-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => {
        cards[i]?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      });
    });
  }

  // =========================================
  // BOOT
  // =========================================

  function boot() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }

    // Initialize GSAP ScrollTrigger after a tick
    setTimeout(() => {
      const page = document.querySelector('.ndt-services-page');
      if (page) {
        initGSAPScrollTriggers(page);
        initKeyboardNav(page);
        initRecommendationEngine(page);
        initMobileGestures(page);
        initMobileCardExpansion(page);
        initMobileProgressIndicator(page);
      }
    }, 100);
  }

  boot();

})();

// =========================================
// NDT SERVICES PAGE – END
// =========================================


