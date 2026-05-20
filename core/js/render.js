/**
 * render.js
 * Reads window.__CLIENT_CONFIG__ and populates the page.
 * Must be loaded AFTER the HTML body so the DOM is available.
 */
(function () {
  const cfg = window.__CLIENT_CONFIG__;
  if (!cfg) {
    console.warn('[render.js] No __CLIENT_CONFIG__ found. Page will show fallback content.');
    return;
  }

  // ── Utility: resolve a dot-path like "hero.headline" from cfg ──
  function get(path) {
    return path.split('.').reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), cfg);
  }

  // ── 1. Simple text replacements: data-config="path.to.value" ──
  document.querySelectorAll('[data-config]').forEach(el => {
    const val = get(el.dataset.config);
    if (val !== null) el.textContent = val;
  });

  // ── 2. Attribute replacements: data-config-attr="attr:path" ──
  document.querySelectorAll('[data-config-attr]').forEach(el => {
    const [attr, path] = el.dataset.configAttr.split(':');
    const val = get(path);
    if (val !== null) el.setAttribute(attr, val);
  });

  // ── 3. href replacements: data-config-href="path" ──
  document.querySelectorAll('[data-config-href]').forEach(el => {
    const val = get(el.dataset.configHref);
    if (val !== null) el.setAttribute('href', val);
  });

  // ── 4. <select> options: data-config-options="path.to.array" ──
  document.querySelectorAll('[data-config-options]').forEach(el => {
    const arr = get(el.dataset.configOptions);
    if (Array.isArray(arr)) {
      arr.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt; o.textContent = opt;
        el.appendChild(o);
      });
    }
  });

  // ── 5. Logo image (replaces text spans when brand.logo_image is set) ──
  if (cfg.brand && cfg.brand.logo_image) {
    const logoImg = () => {
      const img = document.createElement('img');
      img.src = cfg.brand.logo_image;
      img.alt = cfg.brand.name || '';
      img.className = 'logo-img';
      img.style.cssText = 'height:36px;width:auto;display:block;';
      return img;
    };
    const logoName = () => {
      const span = document.createElement('span');
      span.textContent = cfg.brand.name || '';
      return span;
    };
    const flexRow = 'display:flex;align-items:center;gap:10px;';
    // Nav logo
    document.querySelectorAll('.nav__logo').forEach(el => {
      el.innerHTML = '';
      el.style.cssText += flexRow;
      el.appendChild(logoImg());
      el.appendChild(logoName());
    });
    // Footer brand heading
    document.querySelectorAll('.footer__brand h3').forEach(el => {
      el.innerHTML = '';
      el.style.cssText += flexRow;
      el.appendChild(logoImg());
      el.appendChild(logoName());
    });
  }

  // ── 6. <html lang> ──
  if (cfg.meta && cfg.meta.language) {
    document.documentElement.setAttribute('lang', cfg.meta.language);
  }

  // ── 7. <title> ──
  if (cfg.meta && cfg.meta.site_title) {
    document.title = cfg.meta.site_title;
  }

  // ── 8. Template renderers ──

  // Stats
  renderList('stats-container', 'tpl-stat', cfg.stats || [], (el, item) => {
    el.querySelector('.stat__num').textContent  = item.number;
    el.querySelector('.stat__label').textContent = item.label;
  });

  // Services — homepage cards (first 3)
  renderList('services-home-container', 'tpl-service-card', (cfg.services && cfg.services.items || []).slice(0, 3), (el, item, i) => {
    el.querySelector('.card__icon').textContent = item.icon || '●';
    el.querySelector('h3').textContent = item.title;
    el.querySelector('p').textContent  = item.body;
    el.classList.add('fade-up-' + (i + 1));
  });

  // Services — full detail list
  renderList('services-detail-container', 'tpl-service-detail', cfg.services && cfg.services.items || [], (el, item, i) => {
    el.querySelector('.service-num').textContent   = String(i + 1).padStart(2, '0');
    el.querySelector('h3').textContent             = item.title;
    el.querySelector('.service-body').textContent  = item.body;
    const ul = el.querySelector('.service-features');
    if (item.features && ul) {
      item.features.forEach(f => {
        const li = document.createElement('li');
        li.textContent = f;
        ul.appendChild(li);
      });
    }
    el.classList.add('fade-up-' + ((i % 4) + 1));
  });

  // Process steps
  renderList('process-container', 'tpl-process-step', cfg.process && cfg.process.steps || [], (el, item, i) => {
    el.querySelector('.card__icon').textContent = String(i + 1).padStart(2, '0');
    el.querySelector('h3').textContent = item.title;
    el.querySelector('p').textContent  = item.body;
    el.classList.add('fade-up-' + (i + 1));
  });

  // Team
  renderList('team-container', 'tpl-person', cfg.about && cfg.about.team || [], (el, item, i) => {
    el.querySelector('.person__avatar').textContent = item.emoji || '👤';
    el.querySelector('.person__name').textContent   = item.name;
    el.querySelector('.person__role').textContent   = item.role;
    el.classList.add('fade-up-' + ((i % 4) + 1));
  });

  // Values
  renderList('values-container', 'tpl-value', cfg.about && cfg.about.values || [], (el, item, i) => {
    el.querySelector('.card__icon').textContent = item.icon || '●';
    el.querySelector('h3').textContent = item.title;
    el.querySelector('p').textContent  = item.body;
    el.classList.add('fade-up-' + (i + 1));
  });

  // Testimonials
  renderList('testimonials-container', 'tpl-testimonial', cfg.testimonials || [], (el, item) => {
    el.querySelector('.testimonial__text').textContent   = '\u201C' + item.text + '\u201D';
    el.querySelector('.testimonial__avatar').textContent = item.emoji || '👤';
    el.querySelector('.testimonial__name').textContent   = item.author;
    el.querySelector('.testimonial__role').textContent   = item.role;
  });

  // Footer services list
  renderList('footer-services', null, cfg.services && cfg.services.items || [], (el, item) => {
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.href = 'services.html'; a.textContent = item.title;
    li.appendChild(a); el.appendChild(li);
  }, true /* rawEl = the container itself */);

  // ── Helper ──
  function renderList(containerId, templateId, items, populate, rawEl) {
    const container = document.getElementById(containerId);
    if (!container || !items.length) return;
    const tpl = templateId ? document.getElementById(templateId) : null;

    if (rawEl) {
      // container IS the list (e.g. <ul>)
      items.forEach((item, i) => populate(container, item, i));
      return;
    }

    container.innerHTML = '';
    items.forEach((item, i) => {
      const clone = tpl ? tpl.content.cloneNode(true) : document.createElement('div');
      const el = clone.firstElementChild || clone;
      populate(el, item, i);
      container.appendChild(clone.firstElementChild ? clone : el);
    });
  }

  // ── 9. Contact form submit handler ──
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Message Sent ✓';
      btn.disabled = true;
      btn.style.opacity = '.7';
    });
  }

})();
