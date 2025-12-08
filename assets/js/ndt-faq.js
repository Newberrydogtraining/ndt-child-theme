(function () {
  "use strict";

  // Global guard: prevent running FAQ script more than once
  if (window.__NDT_FAQ_INIT__) {
    return;
  }
  window.__NDT_FAQ_INIT__ = true;
  // Config
  const CONFIG = {
    singleOpenPerPanel: true,
    enableDesktopDrag: true,
    mobileSwipeMax: 900,
    searchDebounce: 140
  };

  // State
  let initialized = false;
  let shell = null;
  let pills = [];
  let panels = [];
  let panelMap = new Map();

  // Helpers
  function $(selector, context = document) {
    return context.querySelector(selector);
  }

  function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  // Core functions
  function getActiveCategory() {
    const active = pills.find(p => p.classList.contains("is-active"));
    return active?.dataset.faqCategory || pills[0]?.dataset.faqCategory || null;
  }

  function setActiveCategory(key) {
    if (!key || !panelMap.has(key)) return;

    const previousKey = getActiveCategory();
    const isNewCategory = previousKey !== key;

    pills.forEach(pill => {
      const isActive = pill.dataset.faqCategory === key;
      pill.classList.toggle("is-active", isActive);
      pill.setAttribute("aria-selected", isActive);
      pill.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach(panel => {
      const isActive = panel.dataset.faqPanel === key;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });

    resetSearch();

    // Animate cards entrance when switching to a new category
    if (isNewCategory) {
      const newPanel = panelMap.get(key);
      if (newPanel) {
        animateCardsEntrance(newPanel);
      }
    }
  }

  function animateCardsEntrance(panel) {
    const cards = $$(".ndt-faq-card", panel);
    if (!cards.length) return;

    // Mark cards as revealed so CSS doesn't hide them
    cards.forEach(card => card.classList.add("is-revealed"));

    // Use GSAP if available for smooth animation
    if (typeof gsap !== "undefined") {
      gsap.fromTo(cards, 
        {
          opacity: 0,
          y: 24,
          scale: 0.96
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.08,
          ease: "power3.out",
          onComplete: () => {
            // Clear transforms but keep opacity via class
            cards.forEach(card => {
              card.style.transform = "";
              card.style.opacity = "";
            });
          }
        }
      );
    } else {
      // CSS fallback animation
      cards.forEach((card, i) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(24px) scale(0.96)";
        card.style.transition = "none";
        
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.style.transition = "opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
            card.style.transitionDelay = `${i * 0.07}s`;
            card.style.opacity = "1";
            card.style.transform = "translateY(0) scale(1)";
            
            // Clean up after animation
            setTimeout(() => {
              card.style.transition = "";
              card.style.transitionDelay = "";
              card.style.opacity = "";
              card.style.transform = "";
            }, 500 + (i * 70));
          });
        });
      });
    }
  }

  function openCard(card, scrollTo = false) {
    if (!card) return;

    const body = $(".ndt-faq-card-body", card);
    const toggle = $("[data-faq-toggle]", card);
    if (!body || !toggle) return;

    // Close others in same panel if single-open mode
    if (CONFIG.singleOpenPerPanel) {
      const panel = card.closest("[data-faq-panel]");
      if (panel) {
        $$("[data-faq-item]", panel).forEach(other => {
          if (other !== card) closeCard(other);
        });
      }
    }

    card.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    body.classList.add("is-open");

    // Animate open
    body.style.maxHeight = body.scrollHeight + "px";
    body.style.opacity = "1";

    // Clear inline max-height after transition and scroll to center
    const onEnd = () => {
      // Keep the panel open after the transition instead of snapping shut
      if (body.classList.contains("is-open")) {
        body.style.maxHeight = "none";
        
        // Smart scroll: center the card content in viewport
        scrollCardIntoView(card);
      }
      body.removeEventListener("transitionend", onEnd);
    };
    body.addEventListener("transitionend", onEnd);
  }

  function scrollCardIntoView(card) {
    if (!card) return;

    const cardRect = card.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const cardHeight = cardRect.height;
    
    // Check if card is taller than viewport
    if (cardHeight > viewportHeight * 0.85) {
      // Card is large: scroll to show the top of the card with some padding
      const targetTop = cardRect.top + window.scrollY - 100;
      window.scrollTo({
        top: targetTop,
        behavior: "smooth"
      });
    } else {
      // Card fits: center it in the viewport
      const cardCenter = cardRect.top + window.scrollY + (cardHeight / 2);
      const targetTop = cardCenter - (viewportHeight / 2);
      
      // Only scroll if the card isn't already mostly visible
      const cardTop = cardRect.top;
      const cardBottom = cardRect.bottom;
      const buffer = 60;
      
      if (cardTop < buffer || cardBottom > viewportHeight - buffer) {
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: "smooth"
        });
      }
    }
  }

  function closeCard(card) {
    if (!card) return;

    const body = $(".ndt-faq-card-body", card);
    const toggle = $("[data-faq-toggle]", card);
    if (!body || !toggle) return;

    card.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");

    // Set explicit height first for transition
    body.style.maxHeight = body.scrollHeight + "px";

    // Force reflow then animate closed
    body.offsetHeight;
    body.classList.remove("is-open");
    body.style.maxHeight = "0";
    body.style.opacity = "0";
  }

  function toggleCard(card) {
    if (!card) return;
    const body = $(".ndt-faq-card-body", card);
    if (body?.classList.contains("is-open")) {
      closeCard(card);
    } else {
      openCard(card, true);
    }
  }

  function getVisibleCards(panel) {
    return $$("[data-faq-item]", panel).filter(card => {
      return !card.classList.contains("is-filtered-out") &&
             getComputedStyle(card).display !== "none";
    });
  }

  function navigateCard(currentCard, direction) {
    if (!currentCard) return;

    const panel = currentCard.closest("[data-faq-panel]");
    if (!panel) return;

    const visible = getVisibleCards(panel);
    if (visible.length < 2) return;

    const idx = visible.indexOf(currentCard);
    const nextIdx = (idx + direction + visible.length) % visible.length;
    const nextCard = visible[nextIdx];

    if (nextCard && nextCard !== currentCard) {
      closeCard(currentCard);
      openCard(nextCard, true);
      $("[data-faq-toggle]", nextCard)?.focus({ preventScroll: true });
    }
  }

  // Search
  function filterCards(query) {
    const key = getActiveCategory();
    const panel = panelMap.get(key);
    if (!panel) return;

    const q = query.trim().toLowerCase();
    const cards = $$("[data-faq-item]", panel);
    let matches = 0;

    cards.forEach(card => {
      const question = $(".ndt-faq-card-question", card)?.textContent || "";
      const body = $(".ndt-faq-card-body", card)?.textContent || "";
      const text = (question + " " + body).toLowerCase();
      const isMatch = !q || text.includes(q);

      card.classList.toggle("is-filtered-out", !isMatch);
      card.style.display = isMatch ? "" : "none";
      if (isMatch) matches++;
    });

    // Empty state
    let empty = $(".ndt-faq-empty", panel);
    if (!empty) {
      empty = document.createElement("div");
      empty.className = "ndt-faq-empty";
      empty.textContent = "No questions match that search in this category.";
      panel.appendChild(empty);
    }
    empty.style.display = matches === 0 ? "block" : "none";
  }

  const debouncedFilter = debounce(filterCards, CONFIG.searchDebounce);

  function resetSearch() {
    const key = getActiveCategory();
    const panel = panelMap.get(key);
    if (!panel) return;

    $$("[data-faq-item]", panel).forEach(card => {
      card.classList.remove("is-filtered-out");
      card.style.display = "";
    });

    const empty = $(".ndt-faq-empty", panel);
    if (empty) empty.style.display = "none";
  }

  // Event handlers
  function handleClick(e) {
    const target = e.target;

    // Category pill
    const pill = target.closest("[data-faq-category]");
    if (pill && shell.contains(pill)) {
      e.preventDefault();
      setActiveCategory(pill.dataset.faqCategory);
      return;
    }

    // Toggle button
    const toggle = target.closest("[data-faq-toggle]");
    if (toggle && shell.contains(toggle)) {
      e.preventDefault();
      const card = toggle.closest("[data-faq-item]");
      toggleCard(card);
      return;
    }

    // Prev button
    const prev = target.closest("[data-faq-prev]");
    if (prev && shell.contains(prev)) {
      e.preventDefault();
      const card = prev.closest("[data-faq-item]");
      navigateCard(card, -1);
      return;
    }

    // Next button
    const next = target.closest("[data-faq-next]");
    if (next && shell.contains(next)) {
      e.preventDefault();
      const card = next.closest("[data-faq-item]");
      navigateCard(card, 1);
      return;
    }
  }

  function handleKeydown(e) {
    if (!shell.contains(e.target)) return;
    if (e.key !== "Enter" && e.key !== " ") return;

    const pill = e.target.closest("[data-faq-category]");
    if (pill) {
      e.preventDefault();
      setActiveCategory(pill.dataset.faqCategory);
      return;
    }

    const toggle = e.target.closest("[data-faq-toggle]");
    if (toggle) {
      e.preventDefault();
      toggleCard(toggle.closest("[data-faq-item]"));
    }
  }

  // Setup
  function setupSearch() {
    const input = $('[data-faq-search="input"]', shell);
    const clear = $('[data-faq-search="clear"]', shell);

    if (input) {
      input.addEventListener("input", () => debouncedFilter(input.value));
    }

    if (clear) {
      clear.addEventListener("click", () => {
        if (input) input.value = "";
        resetSearch();
        input?.focus();
      });
    }
  }

  function setupSwipe() {
    if (window.innerWidth >= CONFIG.mobileSwipeMax) return;

    $$(".ndt-faq-card-body", shell).forEach(body => {
      let startX = 0;
      let startY = 0;
      let tracking = false;

      body.addEventListener("touchstart", e => {
        if (!body.classList.contains("is-open")) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
      }, { passive: true });

      body.addEventListener("touchmove", e => {
        if (!tracking) return;
        const dy = Math.abs(e.touches[0].clientY - startY);
        const dx = Math.abs(e.touches[0].clientX - startX);
        if (dy > dx && dy > 20) tracking = false;
      }, { passive: true });

      body.addEventListener("touchend", e => {
        if (!tracking) return;
        tracking = false;

        const dx = e.changedTouches[0].clientX - startX;
        const dy = Math.abs(e.changedTouches[0].clientY - startY);

        if (Math.abs(dx) < 60 || Math.abs(dx) < dy) return;

        const card = body.closest("[data-faq-item]");
        navigateCard(card, dx < 0 ? 1 : -1);
      }, { passive: true });
    });
  }

  function setupDrag() {
    if (!CONFIG.enableDesktopDrag || window.innerWidth < 1024) return;

    $$(".ndt-faq-card", shell).forEach(card => {
      let dragging = false;
      let startX = 0;
      let startY = 0;

      card.addEventListener("pointerdown", e => {
        if (e.pointerType !== "mouse") return;

        // Don't initiate drag when clicking interactive elements
        if (e.target.closest("[data-faq-toggle], [data-faq-prev], [data-faq-next], button, a")) {
          return;
        }

        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        card.setPointerCapture(e.pointerId);
        card.classList.add("is-dragging");
      });

      card.addEventListener("pointermove", e => {
        if (!dragging || e.pointerType !== "mouse") return;
        const dx = Math.max(-10, Math.min(10, e.clientX - startX));
        const dy = Math.max(-10, Math.min(10, e.clientY - startY));
        card.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      });

      const endDrag = e => {
        if (e?.pointerType && e.pointerType !== "mouse") return;
        dragging = false;
        card.classList.remove("is-dragging");
        card.style.transform = "";
      };

      card.addEventListener("pointerup", endDrag);
      card.addEventListener("pointerleave", endDrag);
      card.addEventListener("pointercancel", endDrag);
    });
  }

  function seedInitialState() {
    // Ensure one category is active
    if (!getActiveCategory() && pills[0]) {
      setActiveCategory(pills[0].dataset.faqCategory);
    }

    // Add spacing between category pills and FAQ panels
    const panelsContainer = $(".ndt-faq-panels", shell);
    if (panelsContainer) {
      panelsContainer.style.marginTop = "2.5rem";
    }

    // Ensure all cards start closed
    $$("[data-faq-item]", shell).forEach(card => {
      const body = $(".ndt-faq-card-body", card);
      const toggle = $("[data-faq-toggle]", card);

      // Remove any pre-existing open states
      card.classList.remove("is-open");
      if (body) {
        body.classList.remove("is-open");
        body.style.maxHeight = "0";
        body.style.opacity = "0";
      }
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Link pills to panels for aria
    pills.forEach(pill => {
      const key = pill.dataset.faqCategory;
      if (!pill.id) pill.id = `ndt-faq-tab-${key}`;
      const panel = panelMap.get(key);
      if (panel) panel.setAttribute("aria-labelledby", pill.id);
    });
  }

  function animateIn() {
    // Mark shell as ready so CSS knows JS has loaded
    shell.classList.add("is-ready");

    const heroElements = $$(".ndt-faq-hero-inner > *", shell);
    const activePanel = $(".ndt-faq-panel.is-active", shell);
    const activeCards = activePanel ? $$(".ndt-faq-card", activePanel) : [];

    // Mark elements as revealed so they stay visible after animation
    heroElements.forEach(el => el.classList.add("is-revealed"));
    pills.forEach(pill => pill.classList.add("is-revealed"));
    activeCards.forEach(card => card.classList.add("is-revealed"));

    if (typeof gsap === "undefined") {
      // CSS fallback: staggered reveal without GSAP
      heroElements.forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }, i * 80);
      });

      pills.forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0) scale(1)";
        }, 200 + i * 50);
      });

      activeCards.forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          // Clear inline styles after animation - CSS class handles visibility
          setTimeout(() => {
            el.style.opacity = "";
            el.style.transform = "";
          }, 100);
        }, 350 + i * 60);
      });
      return;
    }

    // GSAP animation: animate TO visible state (elements start hidden via CSS)
    const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.5 } });

    tl.to(heroElements, {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      onComplete: () => {
        heroElements.forEach(el => {
          el.style.opacity = "";
          el.style.transform = "";
        });
      }
    });

    // Pills get a bouncy entrance with scale
    tl.to(pills, {
      y: 0,
      opacity: 1,
      scale: 1,
      stagger: 0.06,
      ease: "back.out(1.4)",
      duration: 0.5,
      onComplete: () => {
        // Clear inline styles - CSS class handles visibility
        pills.forEach(pill => {
          pill.style.opacity = "";
          pill.style.transform = "";
        });
      }
    }, "-=0.3");

    if (activeCards.length) {
      tl.to(activeCards, {
        y: 0,
        opacity: 1,
        stagger: 0.07,
        ease: "power3.out",
        duration: 0.45,
        onComplete: () => {
          // Clear inline styles - CSS class handles visibility
          activeCards.forEach(card => {
            card.style.opacity = "";
            card.style.transform = "";
          });
        }
      }, "-=0.2");
    }
  }

  // Main init
  function init() {
    if (initialized) return;

    shell = $(".ndt-faq-shell");
    if (!shell) return;

    initialized = true;

    // Cache elements
    pills = $$("[data-faq-category]", shell);
    panels = $$("[data-faq-panel]", shell);

    panels.forEach(panel => {
      const key = panel.dataset.faqPanel;
      if (key) panelMap.set(key, panel);
    });

    // Attach events
    shell.addEventListener("click", handleClick);
    shell.addEventListener("keydown", handleKeydown);

    // Setup features
    setupSearch();
    setupSwipe();
    setupDrag();
    seedInitialState();
    animateIn();
  }

  // Boot
  function boot() {
    if ($(".ndt-faq-shell")) {
      init();
      return;
    }

    // Poll for Elementor async loading
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if ($(".ndt-faq-shell") || attempts > 50) {
        clearInterval(poll);
        init();
      }
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();