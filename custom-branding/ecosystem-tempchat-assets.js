(function() {
  'use strict';

  const ECOSYSTEM_SVG_SRC = '/static/assets/ecosystem.svg';
  const CREDIT_TICK_SVG_SRC = '/static/assets/credit-tick.svg';

  const IDS = {
    container: 'affinify-tempchat-container',
    ecosystem: 'affinify-tempchat-ecosystem',
    credits: 'affinify-tempchat-credits'
  };

  function queryTemporaryChatElement() {
    // Try common selectors first
    const byId = document.getElementById('temporary-chat-button');
    if (byId) return byId;

    // Look for elements that contain the text "Temporary Chat"
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null);
    const candidates = [];
    while (walker.nextNode()) {
      const el = walker.currentNode;
      if (!el) continue;
      const text = (el.textContent || '').trim();
      if (!text) continue;
      const t = text.toLowerCase();
      if (t.includes('temporary chat') || (t.includes('temporary') && t.includes('chat'))) {
        candidates.push(el);
      }
    }
    // Prefer elements that are visible and near top-right
    const visible = candidates.filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0;
    });
    if (visible.length === 0) return null;
    visible.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right);
    return visible[0];
  }

  function ensureStyles(el, styles) {
    for (const [k, v] of Object.entries(styles)) {
      el.style.setProperty(k, v, 'important');
    }
  }

  function createUI(targetRect) {
    // Remove previous
    document.getElementById(IDS.container)?.remove();

    const container = document.createElement('div');
    container.id = IDS.container;
    ensureStyles(container, {
      position: 'fixed',
      top: `${Math.round(targetRect.top + 6)}px`,
      left: `${Math.round(targetRect.right + 12)}px`,
      display: 'flex',
      gap: '10px',
      'z-index': '99999',
      'pointer-events': 'auto'
    });

    // Ecosystem button
    const eco = document.createElement('div');
    eco.id = IDS.ecosystem;
    eco.innerHTML = `<img src="${ECOSYSTEM_SVG_SRC}" alt="ecosystem" style="width:20px;height:20px;filter:invert(64%) sepia(34%) saturate(602%) hue-rotate(111deg) brightness(92%) contrast(90%);" />`;
    ensureStyles(eco, {
      width: '42px',
      height: '42px',
      background: 'transparent',
      color: '#10b981',
      border: '2px solid #10b981',
      'border-radius': '10px',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      cursor: 'pointer'
    });

    // Credits pill
    const cred = document.createElement('div');
    cred.id = IDS.credits;
    cred.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;padding:0 12px;">
        <img src="${CREDIT_TICK_SVG_SRC}" alt="credit" style="width:16px;height:16px;filter:invert(64%) sepia(34%) saturate(602%) hue-rotate(111deg) brightness(92%) contrast(90%);" />
        <span style="font-weight:600;font-size:14px;color:#10b981;">9</span>
        <span style="font-weight:500;font-size:12px;color:#10b981;opacity:0.9;">Free</span>
      </div>`;
    ensureStyles(cred, {
      height: '42px',
      background: 'transparent',
      color: '#10b981',
      border: '2px solid #10b981',
      'border-radius': '10px',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center'
    });

    container.appendChild(eco);
    container.appendChild(cred);
    document.body.appendChild(container);
  }

  function refreshPosition() {
    const target = queryTemporaryChatElement();
    if (!target) return;
    const rect = target.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    createUI(rect);
  }

  function init() {
    // Remove other previous implementations to avoid duplicates
    document.querySelectorAll('[id*="affinify-"]').forEach((el) => el.remove());
    refreshPosition();

    // Reposition on resize/scroll and periodically as fallback
    window.addEventListener('resize', refreshPosition);
    window.addEventListener('scroll', refreshPosition, { passive: true });
    setInterval(refreshPosition, 3000);

    // Observe DOM changes that might affect the target
    const obs = new MutationObserver(() => refreshPosition());
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
