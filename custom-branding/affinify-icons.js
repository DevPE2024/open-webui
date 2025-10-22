(function() {
  'use strict';

  const CONFIG = {
    ECOSYSTEM_SVG: '/static/assets/ecosystem.svg',
    CREDITS_SVG: '/static/assets/credits.svg',
    COLORS: {
      primary: '#10b981',
      primaryHover: 'rgba(16, 185, 129, 0.1)'
    }
  };

  const IDS = {
    container: 'affinify-icons-container',
    ecosystem: 'affinify-ecosystem-btn',
    credits: 'affinify-credits-pill'
  };

  let userCredits = 9; // Começa com 9 créditos free

  function queryTemporaryChatElement() {
    const byId = document.getElementById('temporary-chat-button');
    if (byId) return byId;

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
    
    const containerWidth = 156;
    ensureStyles(container, {
      position: 'fixed',
      top: `${Math.round(targetRect.top + 1)}px`,
      left: `${Math.round(targetRect.left - containerWidth)}px`,
      display: 'flex',
      gap: '10px',
      'z-index': '99999',
      'pointer-events': 'auto'
    });

    // Pill de Créditos PRIMEIRO (à esquerda)
    const credPill = document.createElement('div');
    credPill.id = IDS.credits;
    credPill.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;padding:0 12px;">
        <img src="${CONFIG.CREDITS_SVG}" alt="credit" style="width:16px;height:16px;filter:invert(64%) sepia(34%) saturate(602%) hue-rotate(111deg) brightness(92%) contrast(90%);" />
        <span style="font-weight:600;font-size:14px;color:${CONFIG.COLORS.primary};">${userCredits}</span>
        <span style="font-weight:500;font-size:12px;color:${CONFIG.COLORS.primary};opacity:0.9;">Free</span>
      </div>
    `;
    ensureStyles(credPill, {
      height: '34px',
      background: 'transparent',
      border: `2px solid ${CONFIG.COLORS.primary}`,
      'border-radius': '10px',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      cursor: 'pointer',
      transition: 'all 0.2s'
    });
    credPill.onmouseenter = () => credPill.style.background = CONFIG.COLORS.primaryHover;
    credPill.onmouseleave = () => credPill.style.background = 'transparent';

    // Botão Ecosystem SEGUNDO (no meio)
    const ecoBtn = document.createElement('div');
    ecoBtn.id = IDS.ecosystem;
    ecoBtn.innerHTML = `<img src="${CONFIG.ECOSYSTEM_SVG}" alt="ecosystem" style="width:20px;height:20px;filter:invert(64%) sepia(34%) saturate(602%) hue-rotate(111deg) brightness(92%) contrast(90%);" />`;
    ensureStyles(ecoBtn, {
      width: '34px',
      height: '34px',
      background: 'transparent',
      border: `2px solid ${CONFIG.COLORS.primary}`,
      'border-radius': '10px',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      cursor: 'pointer',
      transition: 'all 0.2s'
    });
    ecoBtn.onmouseenter = () => ecoBtn.style.background = CONFIG.COLORS.primaryHover;
    ecoBtn.onmouseleave = () => ecoBtn.style.background = 'transparent';
    
    // Por enquanto, apenas um alert simples
    ecoBtn.onclick = () => {
      alert('Ecosystem popup será implementado na próxima etapa!');
    };

    container.appendChild(credPill);
    container.appendChild(ecoBtn);
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
    // Remove other previous implementations
    document.querySelectorAll('[id*="affinify-"]').forEach((el) => el.remove());
    
    // Criar UI
    refreshPosition();
    
    // Reposition on resize/scroll and periodically as fallback
    window.addEventListener('resize', refreshPosition);
    window.addEventListener('scroll', refreshPosition, { passive: true });
    setInterval(refreshPosition, 3000);

    // Observe DOM changes
    const obs = new MutationObserver(() => refreshPosition());
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
