#!/usr/bin/env python3
"""
Proxy para injetar automaticamente o sistema Affinify no OpenUIX
Intercepta requisições e injeta o script sem modificar arquivos originais
"""

import asyncio
import aiohttp
from aiohttp import web
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Script completo do Affinify
AFFINIFY_SCRIPT = """
// SISTEMA COMPLETO DE CRÉDITOS E ECOSSISTEMA AFFINIFY
console.log('🎯 Affinify: Sistema completo carregado via proxy');

(function() {
    'use strict';

    const CONFIG = {
        COLORS: {
            primary: '#10b981',
            primaryHover: 'rgba(16, 185, 129, 0.1)',
            disabled: '#6b7280',
            disabledBg: 'rgba(107, 114, 128, 0.1)'
        }
    };

    const IDS = {
        container: 'affinify-icons-container',
        ecosystem: 'affinify-ecosystem-btn',
        credits: 'affinify-credits-pill',
        popup: 'affinify-ecosystem-popup'
    };

    const ECOSYSTEM_APPS = [
        {
            name: "Prodify",
            description: "Task Management & Productivity",
            url: "http://localhost:8001/en",
            gradient: "from-purple-500 via-blue-500 to-pink-500",
            icon: "P"
        },
        {
            name: "OnScope", 
            description: "Visual Web Editor",
            url: "http://localhost:8002/en",
            gradient: "from-red-500 via-orange-500 to-pink-500",
            icon: "O"
        },
        {
            name: "JazzUp",
            description: "Collaborative Canvas", 
            url: "http://localhost:8003/en",
            gradient: "from-blue-400 via-cyan-400 to-green-400",
            icon: "J"
        },
        {
            name: "DeepQuest",
            description: "AI-Powered Search Engine",
            url: "http://localhost:3001",
            gradient: "from-purple-600 via-blue-600 to-pink-600", 
            icon: "D"
        },
        {
            name: "OpenUIX",
            description: "AI Interface Platform",
            url: "http://localhost:5050",
            gradient: "from-pink-500 via-yellow-500 to-blue-500",
            icon: "O"
        },
        {
            name: "TestPath",
            description: "API Testing Tool",
            url: "http://localhost:8006/en", 
            gradient: "from-teal-400 via-pink-400 to-purple-400",
            icon: "T"
        }
    ];

    let userCredits = 9;
    let isPopupOpen = false;
    let messageButton = null;

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
        
        try {
            const response = await fetch('/api/v1/credits/consume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 1 })
            });
            
            if (response.ok) {
                userCredits--;
                updateCreditsDisplay();
                updateMessageButton();
                return true;
            }
        } catch (error) {
            console.log('Erro ao consumir crédito:', error);
        }
        
        userCredits--;
        updateCreditsDisplay();
        updateMessageButton();
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

    function findMessageButton() {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const text = btn.textContent?.toLowerCase() || '';
            const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
            const hasSendIcon = btn.querySelector('svg') && btn.querySelector('svg').innerHTML.includes('path');
            
            if (text.includes('send') || ariaLabel.includes('send') || 
                (hasSendIcon && btn.offsetWidth > 30 && btn.offsetHeight > 30)) {
                return btn;
            }
        }
        return null;
    }

    function updateMessageButton() {
        if (!messageButton) {
            messageButton = findMessageButton();
        }
        
        if (messageButton) {
            if (userCredits <= 0) {
                messageButton.style.opacity = '0.5';
                messageButton.style.pointerEvents = 'none';
                messageButton.disabled = true;
            } else {
                messageButton.style.opacity = '1';
                messageButton.style.pointerEvents = 'auto';
                messageButton.disabled = false;
            }
        }
    }

    function interceptMessageSending() {
        document.addEventListener('submit', async (e) => {
            const form = e.target;
            if (form.tagName === 'FORM' && form.querySelector('input[type="text"], textarea')) {
                e.preventDefault();
                
                if (userCredits <= 0) {
                    alert('Você não tem créditos suficientes. Compre mais créditos para continuar.');
                    return;
                }
                
                const success = await consumeCredit();
                if (success) {
                    form.submit();
                }
            }
        });

        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            const text = btn.textContent?.toLowerCase() || '';
            const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
            
            if ((text.includes('send') || ariaLabel.includes('send')) && 
                btn !== messageButton) {
                e.preventDefault();
                
                if (userCredits <= 0) {
                    alert('Você não tem créditos suficientes. Compre mais créditos para continuar.');
                    return;
                }
                
                const success = await consumeCredit();
                if (success) {
                    btn.click();
                }
            }
        });
    }

    function createEcosystemPopup() {
        if (isPopupOpen) return;

        const popup = document.createElement('div');
        popup.id = IDS.popup;
        popup.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 16px;">
                <div style="background: #1f2937; border-radius: 16px; border: 1px solid #374151; max-width: 1024px; width: 100%; max-height: 80vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 24px; border-bottom: 1px solid #374151;">
                        <div>
                            <h2 style="font-size: 24px; font-weight: bold; color: white; margin: 0;">Affinify Ecosystem</h2>
                            <p style="color: #9ca3af; margin: 4px 0 0 0;">Choose an application to explore</p>
                        </div>
                        <button id="close-popup" style="padding: 8px; background: transparent; border: none; color: #9ca3af; cursor: pointer; border-radius: 8px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div style="padding: 24px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                            ${ECOSYSTEM_APPS.map(app => `
                                <div class="ecosystem-app" style="position: relative; overflow: hidden; border-radius: 12px; border: 1px solid #374151; cursor: pointer; transition: all 0.3s; background: linear-gradient(135deg, ${app.gradient.replace('from-', '').replace('via-', '').replace('to-', '').replace('-500', '').replace('-400', '').replace('-600', '')});">
                                    <div style="padding: 24px; height: 128px; display: flex; flex-direction: column; justify-content: space-between;">
                                        <div style="display: flex; align-items: center; justify-content: space-between;">
                                            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.3);">
                                                <span style="font-size: 24px; font-weight: bold; color: white;">${app.icon}</span>
                                            </div>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: rgba(255, 255, 255, 0.7);">
                                                <path d="M7 17L17 7"></path>
                                                <path d="M7 7h10v10"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 style="font-size: 20px; font-weight: bold; color: white; margin: 0 0 4px 0;">${app.name}</h3>
                                            <p style="font-size: 14px; color: rgba(255, 255, 255, 0.8); margin: 0;">${app.description}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div style="padding: 24px; border-top: 1px solid #374151; background: rgba(31, 41, 55, 0.5);">
                        <p style="text-align: center; color: #9ca3af; font-size: 14px; margin: 0;">All applications are part of the Affinify ecosystem and work seamlessly together</p>
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
                app.style.transform = 'scale(1.05)';
                app.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            };
            
            app.onmouseleave = () => {
                app.style.transform = 'scale(1)';
                app.style.boxShadow = 'none';
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
        
        # Preparar headers (remover alguns que podem causar problemas)
        headers = dict(request.headers)
        headers.pop('host', None)
        headers.pop('connection', None)
        
        async with aiohttp.ClientSession() as session:
            async with session.request(
                method=request.method,
                url=target_url,
                headers=headers,
                data=await request.read()
            ) as response:
                
                # Se é o index.html, injetar o script
                if request.path == '/' and 'text/html' in response.headers.get('content-type', ''):
                    try:
                        content = await response.text(encoding='utf-8')
                    except:
                        content = await response.text(encoding='latin-1')
                    
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
