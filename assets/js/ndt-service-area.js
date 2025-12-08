// =========================================
// NDT · Service Area Page Interactions
// #ndt-service-area, .ndt-sa-*
// =========================================

(function () {
  const ready = (cb) => {
    if (window.NDT && typeof window.NDT.onReady === 'function') {
      window.NDT.onReady(cb);
    } else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb);
    } else {
      cb();
    }
  };

  ready(() => {
    const root = document.getElementById('ndt-service-area');
    if (!root) return;

    /* Smooth scroll */
    const scrollTriggers = root.querySelectorAll('[data-ndt-scroll-target]');
    scrollTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        const selector = trigger.getAttribute('data-ndt-scroll-target');
        if (!selector) return;
        const target = document.querySelector(selector);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    /* Zone toggles */
    const toggles = Array.from(root.querySelectorAll('.ndt-sa-zone-toggle'));
    const panels = Array.from(root.querySelectorAll('.ndt-sa-zone-panel'));
    const ringMap = {
      core: root.querySelector('.ndt-sa-ring-core'),
      standard: root.querySelector('.ndt-sa-ring-standard'),
      extended: root.querySelector('.ndt-sa-ring-extended'),
    };
    const labelMap = {
      core: root.querySelector('.ndt-sa-rings-label-core'),
      standard: root.querySelector('.ndt-sa-rings-label-standard'),
      extended: root.querySelector('.ndt-sa-rings-label-extended'),
    };

    const activateZone = (zoneKey) => {
      if (!zoneKey) return;

      toggles.forEach((btn) => {
        const isMatch = btn.dataset.ndtZone === zoneKey;
        btn.classList.toggle('is-active', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });

      panels.forEach((panel) => {
        const isMatch = panel.id === `ndt-sa-zone-${zoneKey}`;
        panel.classList.toggle('is-active', isMatch);
        if (isMatch) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', 'hidden');
        }
      });

      Object.keys(ringMap).forEach((key) => {
        const ring = ringMap[key];
        if (ring) ring.classList.toggle('is-active', key === zoneKey);
      });

      Object.keys(labelMap).forEach((key) => {
        const label = labelMap[key];
        if (label) label.classList.toggle('is-active', key === zoneKey);
      });
    };

    toggles.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        const zoneKey = btn.dataset.ndtZone;
        if (zoneKey) {
          activateZone(zoneKey);
        }
      });
    });

    activateZone('core');

    /* City / ZIP quick check */
    const form = root.querySelector('.ndt-sa-check-form');
    const input = root.querySelector('#ndt-sa-check-input');
    const result = root.querySelector('.ndt-sa-check-result');

    if (form && input && result) {
      // Cities comfortably within ~30 miles (core + standard)
      const coreCities = [
        'newberry',
        'jonesville',
        'tioga',
        'town of tioga',
      ];

      const standardCities = [
        'gainesville',
        'archer',
        'alachua',
        'high springs',
      ];

      // Known ZIPs comfortably within ~30 miles
      const within30Zips = [
        '32669', // Newberry
        '32607', '32608', '32605', '32606', '32609', '32601', '32603', '32611', // Gainesville / UF
        '32615', // Alachua
        '32618', // Archer
        '32643', // High Springs
        '32653', // North Gainesville
        '32641', // SE Gainesville / still roughly in that band
      ];

      // Extended ~30–45 mile band:
      // places you may still be able to help via board & train, marathon sessions,
      // or limited trips with a travel fee.
      const extendedCities = [
        'ocala',
        'lake city',
        'starke',
        'keystone heights',
        'micanopy',
        'hawthorne',
        'waldo',
        'williston',
        'bronson',
        'trenton',
        'chiefland',
        'lake butler',
        'raiford',
        'lake geneva',
      ];

      const extendedZips = [
        '34471', '34470',       // Ocala
        '32621',                // Bronson
        '32626',                // Chiefland
        '32693',                // Trenton
        '32667',                // Micanopy
        '32640',                // Hawthorne
        '32694',                // Waldo
        '32656',                // Keystone Heights
        '32696',                // Williston
        '32091',                // Starke
        '32054',                // Lake Butler
        '32024', '32055',       // Lake City (on the far edge of your sanity)
      ];

      const resetMessage =
        'Type a city or ZIP to see how likely it is that you are within my in home service radius.';

      const clearStateClasses = () => {
        result.classList.remove(
          'ndt-sa-result-core',
          'ndt-sa-result-extended',
          'ndt-sa-result-outside'
        );
      };

      const setResult = (stateClass, message) => {
        clearStateClasses();
        if (stateClass) {
          result.classList.add(stateClass);
        }
        result.textContent = message;
      };

      const normalizeInput = (raw) => {
        if (!raw) {
          return { city: '', zip: null };
        }
        const trimmed = String(raw).trim().toLowerCase();

        // Extract first 5 digit ZIP if present
        const zipMatch = trimmed.match(/\b(\d{5})\b/);
        const zip = zipMatch ? zipMatch[1] : null;

        // Rough city guess: remove digits and some punctuation
        const city = trimmed.replace(/\d+/g, '').replace(/[-,]/g, ' ').trim();

        return { city, zip };
      };

      const inList = (value, list) => {
        if (!value || !list || !list.length) return false;
        const v = value.toLowerCase();
        return list.some((entry) => {
          const e = entry.toLowerCase();
          return v === e || v.includes(e);
        });
      };

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const raw = (input.value || '').trim();

        if (!raw) {
          setResult(null, resetMessage);
          return;
        }

        const { city, zip } = normalizeInput(raw);

        // 1) Clear "definitely inside" matches (roughly 0–30mi)
        const cityIsCore = inList(city, coreCities);
        const cityIsStandard = inList(city, standardCities);
        const zipIsWithin30 = zip && within30Zips.includes(zip);

        if (cityIsCore || cityIsStandard || zipIsWithin30) {
          setResult(
            'ndt-sa-result-core',
            'You are within my typical 30 mile radius. I can usually help with private lessons at your home, day training routes, or meeting at group and field trip locations with no travel fees.'
          );
          return;
        }

        // 2) Extended matches (~30–45mi) where you often still can help
        const cityIsExtended = inList(city, extendedCities);
        const zipIsExtended = zip && extendedZips.includes(zip);

        if (cityIsExtended || zipIsExtended) {
          setResult(
            'ndt-sa-result-extended',
            'You are a bit beyond my usual 30 mile radius, but still close enough that I may be able to help through board and train, a planned marathon session, or limited trips with a travel fee.'
          );
          return;
        }

        // 3) Unknown -> no fake confidence, just honest "not sure"
        if (zip) {
          setResult(
            'ndt-sa-result-outside',
            'I cannot tell for sure from that ZIP alone. You might still be close enough that it works. The easiest way to know is to include your full address in the evaluation form and I will confirm your options honestly.'
          );
        } else if (city) {
          setResult(
            'ndt-sa-result-outside',
            'I cannot tell for sure from that city name alone. You might still be close enough that it works. Add your full address in the evaluation form and I will double check your distance and the best way to work together.'
          );
        } else {
          setResult(
            'ndt-sa-result-outside',
            'I am not sure from that input. Use your city and ZIP in the evaluation form and I will confirm whether private lessons, day training routes, or board and train makes the most sense.'
          );
        }
      });
    }
  });
})();

// ========== NDT · Service Area Page – END ==========
