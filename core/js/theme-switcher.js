/**
 * theme-switcher.js
 *
 * A Theme = Layout + curated set of Styles.
 * Switching Style within same theme  → instant CSS swap, no reload.
 * Switching Theme                    → page reload into new layout subfolder,
 *                                      carrying style preference forward.
 *
 * Only rendered when __CLIENT_CONFIG__.demo_mode === true.
 *
 * localStorage keys:
 *   theme_override  — e.g. "modern" or "sober"
 *   style_override  — e.g. "style-1-editorial"
 */
(function () {
  const cfg = window.__CLIENT_CONFIG__;
  if (!cfg || !cfg.demo_mode) return;

  // ── Theme → Layout + Styles registry ──────────────────────
  const THEMES = {
    modern: {
      label:  'Modern',
      layout: 'modern',
      styles: [
        { id: 'style-1-editorial',  label: 'Editorial',       swatch: '#C49A3C' },
        { id: 'style-2-terminal',   label: 'Terminal',        swatch: '#00FF88' },
        { id: 'style-3-garden',     label: 'Garden',          swatch: '#C4623A' },
        { id: 'style-4-studio',     label: 'Studio',          swatch: '#2B5BFF' },
        { id: 'style-5-bold',       label: 'Bold',            swatch: '#FFE135' },
        { id: 'style-6-industrial', label: 'Industrial',      swatch: '#E8841A' },
      ]
    },
    sober: {
      label:  'Sober',
      layout: 'sober',
      styles: [
        { id: 'style-6-industrial',      label: 'Industrial',      swatch: '#E8841A' },
        { id: 'style-7-industrial-blue', label: 'Industrial Blue', swatch: '#0099CC' },
        { id: 'style-8-corporate-red',   label: 'Corporate Red',   swatch: '#C8102E' },
      ]
    }
  };

  // ── Read / write state ────────────────────────────────────
  function getThemeId() {
    try { return localStorage.getItem('theme_override') || cfg.theme || 'modern'; }
    catch(e) { return cfg.theme || 'modern'; }
  }
  function getStyleId(themeId) {
    try {
      const stored = localStorage.getItem('style_override');
      // Only honour stored style if it belongs to this theme
      if (stored && THEMES[themeId] && THEMES[themeId].styles.some(s => s.id === stored)) {
        return stored;
      }
    } catch(e) {}
    // Default to config style if it fits, otherwise first style in theme
    const theme = THEMES[themeId];
    if (!theme) return '';
    const cfgStyle = cfg.style || '';
    return theme.styles.some(s => s.id === cfgStyle)
      ? cfgStyle
      : theme.styles[0].id;
  }

  function saveTheme(themeId) {
    try { localStorage.setItem('theme_override', themeId); } catch(e) {}
  }
  function saveStyle(styleId) {
    try { localStorage.setItem('style_override', styleId); } catch(e) {}
  }

  // ── Apply style (CSS swap only) ───────────────────────────
  function applyStyle(styleId) {
    const link = document.getElementById('theme-stylesheet');
    if (link) link.href = '../styles/' + styleId + '.css';
    saveStyle(styleId);
    // Update active state in panel
    document.querySelectorAll('.ts-style-btn').forEach(btn => {
      btn.classList.toggle('ts-item--active', btn.dataset.styleId === styleId);
    });
  }

  // ── Switch theme (requires reload into correct layout) ────
  function switchTheme(newThemeId) {
    if (!THEMES[newThemeId]) return;
    saveTheme(newThemeId);
    // Pick best style for the new theme
    const bestStyle = getStyleId(newThemeId);
    saveStyle(bestStyle);
    // Determine current page filename
    const page = location.pathname.split('/').pop() || 'index.html';
    // Reload into the new layout's subfolder
    window.location.href = '/' + newThemeId + '/' + page;
  }

  // ── Build the switcher DOM ────────────────────────────────
  const activeThemeId = getThemeId();
  const activeStyleId = getStyleId(activeThemeId);

  function buildPanel(themeId) {
    const theme = THEMES[themeId] || THEMES.modern;
    const stylesHtml = theme.styles.map(s => `
      <button class="ts-item ts-style-btn${s.id === activeStyleId ? ' ts-item--active' : ''}"
              data-style-id="${s.id}">
        <span class="ts-swatch" style="background:${s.swatch}"></span>
        <span class="ts-name">${s.label}</span>
      </button>
    `).join('');

    return `
      <div id="ts-panel">
        <div class="ts-section-label">Theme</div>
        <div class="ts-theme-row">
          ${Object.entries(THEMES).map(([id, t]) => `
            <button class="ts-theme-btn${id === themeId ? ' ts-theme-btn--active' : ''}"
                    data-theme-id="${id}">${t.label}</button>
          `).join('')}
        </div>
        <div class="ts-divider"></div>
        <div class="ts-section-label">Style</div>
        ${stylesHtml}
      </div>
    `;
  }

  const wrapper = document.createElement('div');
  wrapper.id = 'theme-switcher';
  wrapper.innerHTML = `
    <button id="ts-toggle" aria-label="Switch theme" title="Themes &amp; Styles">🎨</button>
    ${buildPanel(activeThemeId)}
  `;

  // ── Styles ────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #theme-switcher {
      position: fixed;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      z-index: 9999;
      display: flex;
      align-items: center;
      flex-direction: row-reverse;
      gap: 0;
      font-family: system-ui, sans-serif;
    }
    #ts-toggle {
      width: 40px;
      height: 40px;
      border-radius: 8px 0 0 8px;
      border: 1px solid rgba(0,0,0,.15);
      border-right: none;
      background: #fff;
      cursor: pointer;
      font-size: 1.1rem;
      box-shadow: -2px 0 12px rgba(0,0,0,.1);
      transition: background .2s;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    #ts-toggle:hover { background: #f5f5f5; }

    #ts-panel {
      display: none;
      flex-direction: column;
      gap: 3px;
      background: #fff;
      border: 1px solid rgba(0,0,0,.12);
      border-radius: 10px;
      padding: 12px 10px;
      box-shadow: -4px 0 24px rgba(0,0,0,.12);
      min-width: 160px;
      margin-right: 4px;
    }
    #ts-panel.open { display: flex; }

    .ts-section-label {
      font-size: .62rem;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #aaa;
      padding: 4px 8px 6px;
    }
    .ts-section-label:not(:first-child) {
      margin-top: 4px;
    }

    .ts-theme-row {
      display: flex;
      gap: 6px;
      padding: 0 4px 4px;
    }
    .ts-theme-btn {
      flex: 1;
      padding: 6px 4px;
      border: 1.5px solid #ddd;
      border-radius: 6px;
      background: transparent;
      font-size: .75rem;
      font-weight: 600;
      color: #555;
      cursor: pointer;
      transition: all .15s;
      text-align: center;
    }
    .ts-theme-btn:hover { border-color: #aaa; color: #222; }
    .ts-theme-btn--active {
      border-color: #222;
      background: #222;
      color: #fff;
    }

    .ts-divider {
      height: 1px;
      background: #eee;
      margin: 4px 4px 2px;
    }

    .ts-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      transition: background .15s;
      text-align: left;
      width: 100%;
    }
    .ts-item:hover { background: #f5f5f5; }
    .ts-item--active { background: #f0f0f0; }

    .ts-swatch {
      width: 13px;
      height: 13px;
      border-radius: 50%;
      flex-shrink: 0;
      border: 1.5px solid rgba(0,0,0,.12);
    }
    .ts-name {
      font-size: .8rem;
      color: #333;
    }
    .ts-item--active .ts-name { font-weight: 700; color: #000; }

    /* Reload indicator */
    .ts-theme-btn--loading {
      opacity: .5;
      cursor: wait;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(wrapper);

  // ── Wire up toggle ────────────────────────────────────────
  document.getElementById('ts-toggle').addEventListener('click', () => {
    document.getElementById('ts-panel').classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) {
      document.getElementById('ts-panel').classList.remove('open');
    }
  });

  // ── Wire up theme buttons ─────────────────────────────────
  wrapper.addEventListener('click', e => {
    const themeBtn = e.target.closest('.ts-theme-btn');
    if (themeBtn) {
      const newThemeId = themeBtn.dataset.themeId;
      if (newThemeId === getThemeId()) return; // already active
      // Show loading state
      themeBtn.classList.add('ts-theme-btn--loading');
      themeBtn.textContent = '...';
      switchTheme(newThemeId);
      return;
    }

    const styleBtn = e.target.closest('.ts-style-btn');
    if (styleBtn) {
      applyStyle(styleBtn.dataset.styleId);
      document.getElementById('ts-panel').classList.remove('open');
    }
  });

  // ── Apply the active style on load ───────────────────────
  applyStyle(activeStyleId);

})();
