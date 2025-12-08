// =========================================
// NDT · Evaluation modal
// =========================================
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('ndt-eval-modal');
    const dialog = modal ? modal.querySelector('.ndt-eval-dialog') : null;
    const form = modal ? modal.querySelector('.fluent_form_5') : null;
    const desktopCta = document.querySelector('.ndt-header-cta-link');
    const mobileCta = document.querySelector('.ndt-mobile-cta-btn');

    const dragTarget = dialog || form;
    if (!modal || !dragTarget || !form) return;

    /* =========================================
       Modal open / close
       ========================================= */
    let offsetX = 0;
    let offsetY = 0;

    const applyTransform = (x, y) => {
      dragTarget.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const resetPosition = () => {
      offsetX = 0;
      offsetY = 0;
      applyTransform(0, 0);
    };

    const focusFirstField = () => {
      const first = form.querySelector('input, select, textarea, button');
      if (first) {
        try {
          first.focus({ preventScroll: true });
        } catch (_) {
          first.focus();
        }
      }
    };

    const closeDropdowns = () => {
      let closed = false;
      modal.querySelectorAll('.ndt-select-trigger.ndt-open').forEach((el) => {
        el.classList.remove('ndt-open');
        closed = true;
      });
      modal.querySelectorAll('.ndt-select-dropdown.ndt-open').forEach((el) => {
        el.classList.remove('ndt-open');
        closed = true;
      });
      return closed;
    };

    const openEvalModal = () => {
      modal.classList.add('ndt-eval-open');
      document.body.classList.add('ndt-eval-lock');
      resetPosition();
      closeDropdowns();
      focusFirstField();
    };

    const closeEvalModal = () => {
      modal.classList.remove('ndt-eval-open');
      document.body.classList.remove('ndt-eval-lock');
      closeDropdowns();
      resetPosition();
    };

    desktopCta?.addEventListener('click', (e) => {
      e.preventDefault();
      openEvalModal();
    });

    mobileCta?.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.remove('ndt-nav-open');
      openEvalModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('ndt-eval-backdrop')) {
        closeEvalModal();
      }
    });

    // Close button is now created in ensureProgressHeader()

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const dropped = closeDropdowns();
        if (!dropped && modal.classList.contains('ndt-eval-open')) {
          closeEvalModal();
        }
      }
    });

    /* =========================================
       Drag to move
       ========================================= */
    const supportsPointer = 'PointerEvent' in window;
    let dragging = false;
    let startX = 0;
    let startY = 0;

    const interactiveSelector = 'input, textarea, select, option, button, label, a, .ndt-select-dropdown, [data-ndt-no-drag]';
    const isInteractiveTarget = (target) => !!target.closest(interactiveSelector);

    const getClientPos = (event) => {
      if (event.touches && event.touches[0]) {
        return { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }
      return { x: event.clientX, y: event.clientY };
    };

    const startDrag = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (isInteractiveTarget(event.target)) return;
      const { x, y } = getClientPos(event);
      dragging = true;
      startX = x - offsetX;
      startY = y - offsetY;
      if (supportsPointer && dragTarget.setPointerCapture && event.pointerId !== undefined) {
        dragTarget.setPointerCapture(event.pointerId);
      }
    };

    const moveDrag = (event) => {
      if (!dragging) return;
      const { x, y } = getClientPos(event);
      offsetX = x - startX;
      offsetY = y - startY;
      applyTransform(offsetX, offsetY);
    };

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      if (supportsPointer && dragTarget.releasePointerCapture && event.pointerId !== undefined) {
        dragTarget.releasePointerCapture(event.pointerId);
      }
    };

    if (supportsPointer) {
      dragTarget.addEventListener('pointerdown', startDrag);
      window.addEventListener('pointermove', moveDrag);
      window.addEventListener('pointerup', endDrag);
    } else {
      dragTarget.addEventListener('mousedown', startDrag);
      window.addEventListener('mousemove', moveDrag);
      window.addEventListener('mouseup', endDrag);
      dragTarget.addEventListener('touchstart', startDrag, { passive: true });
      window.addEventListener('touchmove', moveDrag, { passive: true });
      window.addEventListener('touchend', endDrag);
    }

    /* =========================================
       Helpers: groups & labels
       ========================================= */
    const findGroupByLabelPrefix = (prefix) => {
      const groups = Array.from(form.querySelectorAll('.ff-el-group'));
      const lower = prefix.toLowerCase();
      return groups.find((group) => {
        const label = group.querySelector('.ff-el-input--label label');
        return label && label.textContent.trim().toLowerCase().startsWith(lower);
      }) || null;
    };

    const findLabelForInput = (input, scope) => {
      const labels = Array.from(scope.querySelectorAll('label'));
      const direct = labels.find((l) => l.control === input);
      if (direct) return direct;
      const id = input.getAttribute('id');
      if (id) {
        const byFor = labels.find((l) => l.getAttribute('for') === id);
        if (byFor) return byFor;
      }
      return input.closest('label');
    };

    const findInputForLabel = (label, scope) => {
      const forId = label.getAttribute('for');
      if (forId) {
        return scope.querySelector(`#${forId}`);
      }
      const nested = label.querySelector('input[type="radio"], input[type="checkbox"]');
      if (nested) return nested;
      return null;
    };

    /* =========================================
       Behavior pills & specify toggle
       ========================================= */
    const setupBehaviorPills = () => {
      // Find the behavior concern question - try multiple label patterns
      let group = findGroupByLabelPrefix('Main Behavior Concern');
      if (!group) group = findGroupByLabelPrefix('What feels hardest');
      if (!group) group = findGroupByLabelPrefix('behavior');
      if (!group) {
        // Fallback: find group with radio buttons containing "something else"
        const allGroups = form.querySelectorAll('.ff-el-group');
        for (const g of allGroups) {
          const labels = g.querySelectorAll('label');
          for (const l of labels) {
            if (/something else|mixed issues/i.test(l.textContent)) {
              group = g;
              break;
            }
          }
          if (group) break;
        }
      }
      if (!group) return;
      group.classList.add('ndt-main-behavior');

      // Find the specify/detail textarea - try multiple approaches
      let specifyGroup = null;
      
      // Try by name attribute
      const textareaByName = form.querySelector('textarea[name*="something"], textarea[name*="else"], textarea[name*="detail"], textarea[name*="specify"]');
      if (textareaByName) {
        specifyGroup = textareaByName.closest('.ff-el-group');
      }
      
      // Try finding a textarea that immediately follows this group
      if (!specifyGroup) {
        const allGroups = Array.from(form.querySelectorAll('.ff-el-group'));
        const groupIndex = allGroups.indexOf(group);
        if (groupIndex !== -1 && groupIndex < allGroups.length - 1) {
          const nextGroup = allGroups[groupIndex + 1];
          if (nextGroup.querySelector('textarea')) {
            specifyGroup = nextGroup;
          }
        }
      }
      
      // Try finding by label text
      if (!specifyGroup) {
        const allGroups = form.querySelectorAll('.ff-el-group');
        for (const g of allGroups) {
          const label = g.querySelector('.ff-el-input--label label, label');
          if (label && /please (describe|explain|specify)|tell us more|more detail/i.test(label.textContent)) {
            specifyGroup = g;
            break;
          }
        }
      }

      if (specifyGroup) {
        specifyGroup.classList.add('ndt-specify');
      }

      const radios = Array.from(group.querySelectorAll('input[type="radio"]'));
      const labels = Array.from(group.querySelectorAll('label'));

      const setSpecifyVisible = (show) => {
        if (!specifyGroup) return;
        if (show) {
          specifyGroup.classList.add('ndt-specify-visible');
        } else {
          specifyGroup.classList.remove('ndt-specify-visible');
        }
      };

      const refresh = () => {
        labels.forEach((l) => l.classList.remove('ndt-checked'));
        const selected = radios.find((r) => r.checked);
        if (!selected) {
          setSpecifyVisible(false);
          return;
        }
        const label = findLabelForInput(selected, group);
        if (label) {
          label.classList.add('ndt-checked');
          const text = label.textContent.trim();
          setSpecifyVisible(/something else|mixed issues/i.test(text));
        } else {
          setSpecifyVisible(false);
        }
      };

      labels.forEach((label) => {
        label.addEventListener('click', (e) => {
          e.preventDefault();
          const input = findInputForLabel(label, group);
          if (input) {
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            refresh();
          }
        });
      });

      radios.forEach((radio) => {
        radio.addEventListener('change', refresh);
      });

      refresh();
    };

    /* =========================================
       Contact method pills
       ========================================= */
    const setupContactPills = () => {
      const byClass = form.querySelector('.ndt-contact-pills');
      const group =
        (byClass && byClass.closest('.ff-el-group')) ||
        findGroupByLabelPrefix('Preferred Contact Method');
      if (!group) return;
      group.classList.add('ndt-contact-method');

      const radios = Array.from(group.querySelectorAll('input[type="radio"]'));
      const labels = Array.from(group.querySelectorAll('label'));

      const refresh = () => {
        labels.forEach((l) => l.classList.remove('ndt-checked'));
        const selected = radios.find((r) => r.checked);
        if (!selected) return;
        const label = findLabelForInput(selected, group);
        if (label) {
          label.classList.add('ndt-checked');
        }
      };

      labels.forEach((label) => {
        label.addEventListener('click', (e) => {
          e.preventDefault();
          const input = findInputForLabel(label, group);
          if (input) {
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            refresh();
          }
        });
      });

      radios.forEach((radio) => radio.addEventListener('change', refresh));
      refresh();
    };

    /* =========================================
       Custom select (start timing)
       ========================================= */
    const setupCustomSelect = () => {
      const group = findGroupByLabelPrefix('How soon are you hoping to start');
      if (!group) return;
      group.classList.add('ndt-start-timing');

      const nativeSelect = group.querySelector('select');
      if (!nativeSelect) return;
      if (group.querySelector('.ndt-select-trigger')) return;

      if (!nativeSelect.parentElement.classList.contains('ndt-select-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ndt-select-wrapper';
        nativeSelect.parentElement.insertBefore(wrapper, nativeSelect);
        wrapper.appendChild(nativeSelect);
      }

      const wrapper = nativeSelect.parentElement;
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'ndt-select-trigger ndt-placeholder';

      const dropdown = document.createElement('div');
      dropdown.className = 'ndt-select-dropdown';

      const options = Array.from(nativeSelect.options);
      const placeholderOption = options.find((opt) => opt.disabled || opt.value === '');
      trigger.textContent = placeholderOption ? placeholderOption.textContent : 'Select';

      options.forEach((opt) => {
        const optDiv = document.createElement('div');
        optDiv.className = 'ndt-select-option';
        optDiv.dataset.value = opt.value;
        optDiv.textContent = opt.textContent;
        if (opt.disabled || opt.value === '') {
          optDiv.classList.add('ndt-placeholder-option');
        }
        dropdown.appendChild(optDiv);
      });

      nativeSelect.style.position = 'absolute';
      nativeSelect.style.opacity = '0';
      nativeSelect.style.pointerEvents = 'none';
      nativeSelect.style.width = '0';
      nativeSelect.style.height = '0';
      nativeSelect.style.visibility = 'hidden';

      wrapper.appendChild(trigger);
      wrapper.appendChild(dropdown);

      const closeDropdown = () => {
        trigger.classList.remove('ndt-open');
        dropdown.classList.remove('ndt-open');
      };

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = trigger.classList.contains('ndt-open');
        closeDropdowns();
        if (!isOpen) {
          trigger.classList.add('ndt-open');
          dropdown.classList.add('ndt-open');
        }
      });

      dropdown.addEventListener('click', (e) => {
        const option = e.target.closest('.ndt-select-option');
        if (!option || option.classList.contains('ndt-placeholder-option')) return;
        const { value } = option.dataset;
        nativeSelect.value = value;
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        dropdown.querySelectorAll('.ndt-select-option').forEach((el) => el.classList.remove('ndt-selected'));
        option.classList.add('ndt-selected');
        trigger.textContent = option.textContent;
        trigger.classList.remove('ndt-placeholder');
        closeDropdown();
      });

      document.addEventListener('click', (event) => {
        if (!wrapper.contains(event.target)) {
          closeDropdown();
        }
      });

      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          trigger.click();
        }
      });
    };

    /* =========================================
       Progress bar header (bar + close button)
       ========================================= */
    const TOTAL_STEPS = 3; // Form has 3 sections
    let currentStep = 1;

    const ensureProgressHeader = () => {
      let header = dialog.querySelector('.ndt-eval-header');
      let progressContainer;
      let fill;
      let closeBtnInHeader;

      if (!header) {
        header = document.createElement('div');
        header.className = 'ndt-eval-header';

        // Progress bar
        progressContainer = document.createElement('div');
        progressContainer.className = 'ndt-eval-progress';

        const track = document.createElement('div');
        track.className = 'ndt-eval-progress-track';

        fill = document.createElement('div');
        fill.className = 'ndt-eval-progress-fill';
        track.appendChild(fill);
        progressContainer.appendChild(track);

        // Close button
        closeBtnInHeader = document.createElement('button');
        closeBtnInHeader.type = 'button';
        closeBtnInHeader.className = 'ndt-eval-close';
        closeBtnInHeader.setAttribute('aria-label', 'Close evaluation form');
        closeBtnInHeader.innerHTML = '×';
        closeBtnInHeader.addEventListener('click', (e) => {
          e.preventDefault();
          closeEvalModal();
        });

        header.appendChild(progressContainer);
        header.appendChild(closeBtnInHeader);

        // Insert header at the start of the dialog
        if (form) {
          form.parentElement?.insertBefore(header, form);
        } else {
          dialog.insertBefore(header, dialog.firstChild);
        }

        // Remove the old close button if it exists
        const oldCloseBtn = dialog.querySelector('.ndt-eval-close:not(.ndt-eval-header .ndt-eval-close)');
        if (oldCloseBtn && oldCloseBtn !== closeBtnInHeader) {
          oldCloseBtn.remove();
        }
      } else {
        fill = header.querySelector('.ndt-eval-progress-fill');
        closeBtnInHeader = header.querySelector('.ndt-eval-close');
      }

      return { header, fill, closeBtn: closeBtnInHeader };
    };

    const detectCurrentStep = () => {
      // Method 1: Check for submit button visible (last step)
      const submitBtn = form.querySelector('.ff-btn-submit');
      if (submitBtn && submitBtn.offsetParent !== null) {
        return TOTAL_STEPS;
      }

      // Method 2: Check for Previous button (means step 2 or 3)
      const prevBtn = form.querySelector('.ff-btn-prev');
      const hasPrev = prevBtn && prevBtn.offsetParent !== null;

      // Method 3: Parse Fluent Forms step indicator
      const stepText = form.querySelector('.ff-el-progress-status');
      if (stepText) {
        const match = stepText.textContent.match(/step\s*(\d+)/i);
        if (match) {
          return Math.min(parseInt(match[1], 10), TOTAL_STEPS);
        }
      }

      // Method 4: Check active step containers
      const stepContainers = Array.from(form.querySelectorAll('.ff-step-container, .ff_step_start, [class*="step"]'));
      for (let i = 0; i < stepContainers.length; i++) {
        const el = stepContainers[i];
        const isVisible = el.offsetParent !== null && 
                          !el.classList.contains('ff-hidden') && 
                          getComputedStyle(el).display !== 'none';
        if (isVisible) {
          return Math.min(i + 1, TOTAL_STEPS);
        }
      }

      // Fallback: if Previous visible, at least step 2
      if (hasPrev) return 2;

      return 1;
    };

    const { fill: progressFill } = ensureProgressHeader();

    const updateProgress = () => {
      currentStep = detectCurrentStep();
      const percent = (currentStep / TOTAL_STEPS) * 100;
      
      if (progressFill) {
        progressFill.style.width = `${percent}%`;
      }
    };

    // Listen for navigation button clicks
    let lastStep = 1;
    
    form.addEventListener('click', (e) => {
      const nextBtn = e.target.closest('.ff-btn-next');
      const prevBtn = e.target.closest('.ff-btn-prev');
      const submitBtn = e.target.closest('.ff-btn-submit');
      
      if (nextBtn || prevBtn || submitBtn) {
        const goingBack = !!prevBtn;
        
        // Add animation class after Fluent Forms transitions
        setTimeout(() => {
          const stepContainers = form.querySelectorAll('.ff-step-container');
          stepContainers.forEach((container) => {
            // Remove existing animation classes
            container.classList.remove('ndt-step-back');
            
            // Force reflow to restart animation
            void container.offsetWidth;
            
            // Add back class if going backwards
            if (goingBack) {
              container.classList.add('ndt-step-back');
            }
          });
          
          updateProgress();
        }, 50);
        
        setTimeout(updateProgress, 150);
        setTimeout(updateProgress, 300);
      }
    });

    // Watch for DOM changes (Fluent Forms step transitions)
    const observer = new MutationObserver(() => {
      setTimeout(updateProgress, 50);
    });
    observer.observe(form, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['class', 'style', 'hidden'] 
    });

    // Initial update
    updateProgress();

    /* =========================================
       Init feature groups
       ========================================= */
    setupBehaviorPills();
    setupContactPills();
    setupCustomSelect();
  });
})();


