#!/usr/bin/env python3
"""
Proxy simples para injetar o sistema Affinify no OpenUIX
"""

import asyncio
import aiohttp
from aiohttp import web
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Script simplificado do Affinify
AFFINIFY_SCRIPT = """
console.log('🎯 Affinify: Sistema carregado via proxy');

(function() {
    'use strict';

    const CONFIG = {
        COLORS: {
            primary: '#10b981',
            primaryHover: 'rgba(16, 185, 129, 0.1)',
            disabled: '#6b7280'
        }
    };

    const IDS = {
        container: 'affinify-icons-container',
        ecosystem: 'affinify-ecosystem-btn',
        credits: 'affinify-credits-pill',
        popup: 'affinify-ecosystem-popup'
    };

    const ECOSYSTEM_APPS = [
        { name: "Prodify", url: "http://localhost:8001/en", icon: "P" },
        { name: "OnScope", url: "http://localhost:8002/en", icon: "O" },
        { name: "JazzUp", url: "http://localhost:8003/en", icon: "J" },
        { name: "DeepQuest", url: "http://localhost:3001", icon: "D" },
        { name: "OpenUIX", url: "http://localhost:5050", icon: "O" },
        { name: "TestPath", url: "http://localhost:8006/en", icon: "T" }
    ];

    let userCredits = 9;
    let isPopupOpen = false;

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

    async function consumeCredit() {
        if (userCredits <= 0) return false;
        userCredits--;
        updateCreditsDisplay();
        return true;
    }

    function updateCreditsDisplay() {
        const creditsPill = document.getElementById(IDS.credits);
        if (!creditsPill) return;

        const creditsText = creditsPill.querySelector('span');
        if (creditsText) {
            creditsText.textContent = userCredits;
        }

        if (userCredits <= 0) {
            creditsPill.style.borderColor = CONFIG.COLORS.disabled;
            creditsPill.style.color = CONFIG.COLORS.disabled;
        } else {
            creditsPill.style.borderColor = CONFIG.COLORS.primary;
            creditsPill.style.color = CONFIG.COLORS.primary;
        }
    }

    function interceptMessageSending() {
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            const text = btn.textContent?.toLowerCase() || '';
            const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
            
            if (text.includes('send') || ariaLabel.includes('send')) {
                if (userCredits <= 0) {
                    e.preventDefault();
                    alert('Você não tem créditos suficientes!');
                    return;
                }
                
                const success = await consumeCredit();
                if (!success) {
                    e.preventDefault();
                }
            }
        });
    }

    function createEcosystemPopup() {
        if (isPopupOpen) return;

        const popup = document.createElement('div');
        popup.id = IDS.popup;
        popup.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 16px;">
                <div style="background: #1f2937; border-radius: 16px; border: 1px solid #374151; max-width: 600px; width: 100%; padding: 24px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                        <h2 style="font-size: 24px; font-weight: bold; color: white; margin: 0;">Affinify Ecosystem</h2>
                        <button id="close-popup" style="padding: 8px; background: transparent; border: none; color: #9ca3af; cursor: pointer;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                        ${ECOSYSTEM_APPS.map(app => `
                            <div class="ecosystem-app" style="padding: 16px; background: #374151; border-radius: 8px; cursor: pointer; text-align: center; transition: background 0.2s;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;">
                                    <span style="font-size: 20px; font-weight: bold; color: white;">${app.icon}</span>
                                </div>
                                <h3 style="font-size: 16px; font-weight: bold; color: white; margin: 0;">${app.name}</h3>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        isPopupOpen = true;

        document.getElementById('close-popup').onclick = () => {
            popup.remove();
            isPopupOpen = false;
        };
        
        document.querySelectorAll('.ecosystem-app').forEach((app, index) => {
            app.onclick = () => {
                window.open(ECOSYSTEM_APPS[index].url, '_blank');
            };
            
            app.onmouseenter = () => {
                app.style.background = '#4b5563';
            };
            
            app.onmouseleave = () => {
                app.style.background = '#374151';
            };
        });
    }

    function createUI(targetRect) {
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

        const credPill = document.createElement('div');
        credPill.id = IDS.credits;
        credPill.innerHTML = `
            <div style="display:flex;align-items:center;gap:6px;padding:0 12px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v12"/>
                    <path d="M6 12h12"/>
                </svg>
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

        const ecoBtn = document.createElement('div');
        ecoBtn.id = IDS.ecosystem;
        ecoBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
            </svg>
        `;
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
            transition: 'all 0.2s',
            color: CONFIG.COLORS.primary
        });
        ecoBtn.onmouseenter = () => ecoBtn.style.background = CONFIG.COLORS.primaryHover;
        ecoBtn.onmouseleave = () => ecoBtn.style.background = 'transparent';
        ecoBtn.onclick = createEcosystemPopup;

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

    async function init() {
        document.querySelectorAll('[id*="affinify-"]').forEach((el) => el.remove());
        refreshPosition();
        interceptMessageSending();
        
        window.addEventListener('resize', refreshPosition);
        window.addEventListener('scroll', refreshPosition, { passive: true });
        setInterval(refreshPosition, 3000);

        const obs = new MutationObserver(() => refreshPosition());
        obs.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
"""

async def proxy_handler(request):
    """Handler principal do proxy"""
    try:
        target_url = f"http://localhost:5050{request.path_qs}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(target_url) as response:
                
                # Se é HTML, injetar o script
                if request.path == '/' and 'text/html' in response.headers.get('content-type', ''):
                    content = await response.text()
                    
                    # Injetar script antes do </body>
                    script_injection = f"""
<script>
{AFFINIFY_SCRIPT}
</script>
</body>
"""
                    content = content.replace('</body>', script_injection)
                    
                    return web.Response(
                        text=content,
                        status=response.status,
                        headers={'Content-Type': 'text/html; charset=utf-8'}
                    )
                
                # Para outros arquivos, retornar normalmente
                body = await response.read()
                return web.Response(
                    body=body,
                    status=response.status,
                    headers=dict(response.headers)
                )
                
    except Exception as e:
        logger.error(f"Erro no proxy: {e}")
        return web.Response(
            text=f"Erro no proxy: {str(e)}",
            status=500
        )

async def main():
    """Inicializar o proxy"""
    app = web.Application()
    app.router.add_route('*', '/{path:.*}', proxy_handler)
    
    runner = web.AppRunner(app)
    await runner.setup()
    
    site = web.TCPSite(runner, 'localhost', 5051)
    await site.start()
    
    logger.info("🚀 Proxy Affinify rodando em http://localhost:5051")
    logger.info("📱 Acesse o OpenUIX em http://localhost:5051 para ver os ícones!")
    
    try:
        await asyncio.Future()  # Rodar indefinidamente
    except KeyboardInterrupt:
        logger.info("🛑 Parando proxy...")
    finally:
        await runner.cleanup()

if __name__ == '__main__':
    asyncio.run(main())
