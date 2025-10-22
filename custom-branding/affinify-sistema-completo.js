/**
 * SISTEMA COMPLETO AFFINIFY - OPENUI X
 * 
 * Funcionalidades:
 * 1. Sistema de créditos (começa com 9 Free, consome 1 por mensagem)
 * 2. Desabilita botão de envio quando créditos = 0
 * 3. Popup do ecossistema (igual ao Prodify)
 * 4. Ícones posicionados no canto superior direito
 */

console.log('🎯 Affinify: Sistema completo inicializado');

(function() {
    'use strict';

    // ============================================================================
    // CONFIGURAÇÕES
    // ============================================================================
    
    const CONFIG = {
        COLORS: {
            primary: '#10b981',
            primaryHover: 'rgba(16, 185, 129, 0.1)',
            disabled: '#6b7280',
            disabledBg: 'rgba(107, 114, 128, 0.1)'
        },
        GRADIENT_COLORS: {
            'from-purple-500 via-blue-500 to-pink-500': 'linear-gradient(135deg, #a855f7, #3b82f6, #ec4899)',
            'from-red-500 via-orange-500 to-pink-500': 'linear-gradient(135deg, #ef4444, #f97316, #ec4899)',
            'from-blue-400 via-cyan-400 to-green-400': 'linear-gradient(135deg, #60a5fa, #22d3ee, #4ade80)',
            'from-purple-600 via-blue-600 to-pink-600': 'linear-gradient(135deg, #9333ea, #2563eb, #db2777)',
            'from-pink-500 via-yellow-500 to-blue-500': 'linear-gradient(135deg, #ec4899, #eab308, #3b82f6)',
            'from-teal-400 via-pink-400 to-purple-400': 'linear-gradient(135deg, #2dd4bf, #f472b6, #c084fc)'
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

    // ============================================================================
    // ESTADO GLOBAL
    // ============================================================================
    
    let userCredits = 9; // Começa com 9 créditos Free
    let userIsPaid = false; // Se true, mostra créditos pagos
    let isPopupOpen = false;
    let sendButton = null;
    let originalSendHandler = null;

    // ============================================================================
    // FUNÇÕES DE CRÉDITOS
    // ============================================================================

    async function fetchUserCredits() {
        try {
            // Buscar email do usuário autenticado
            const userEmail = await getCurrentUserEmail();
            if (!userEmail) {
                console.log('⚠️ Usuário não autenticado');
                return false;
            }

            // Consultar créditos no Prodify
            const response = await fetch(`http://localhost:8001/api/external/openuix/credits?email=${encodeURIComponent(userEmail)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    userCredits = data.credits || 0;
                    userIsPaid = data.planName !== 'Free';
                    console.log('✅ Créditos carregados do Prodify:', userCredits, 'Plan:', data.planName);
                    return true;
                }
            }
        } catch (error) {
            console.log('⚠️ Erro ao buscar créditos do Prodify:', error);
        }
        
        // Fallback: 9 créditos free
        userCredits = 9;
        userIsPaid = false;
        return false;
    }

    async function getCurrentUserEmail() {
        try {
            // Tentar buscar do localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.email) return user.email;

            // Tentar buscar da API do OpenUIX
            const response = await fetch('/api/v1/auths/');
            if (response.ok) {
                const data = await response.json();
                return data.email || null;
            }
        } catch (error) {
            console.log('⚠️ Erro ao buscar email do usuário:', error);
        }
        return null;
    }

    async function consumeCredit() {
        if (userCredits <= 0) {
            console.log('❌ Sem créditos disponíveis');
            return false;
        }

        try {
            const userEmail = await getCurrentUserEmail();
            if (!userEmail) {
                console.log('⚠️ Usuário não autenticado');
                return false;
            }

            // Consumir crédito no Prodify
            const response = await fetch('http://localhost:8001/api/external/openuix/credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, credits: 1 })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    userCredits = data.credits;
                    console.log('✅ Crédito consumido no Prodify. Restam:', userCredits);
                    updateCreditsDisplay();
                    updateSendButton();
                    return true;
                }
            }
        } catch (error) {
            console.log('⚠️ Erro ao consumir crédito no Prodify:', error);
        }
        
        // Fallback: decrementa localmente
        userCredits--;
        console.log('✅ Crédito consumido (fallback local). Restam:', userCredits);
        updateCreditsDisplay();
        updateSendButton();
        return true;
    }

    function updateCreditsDisplay() {
        const creditsPill = document.getElementById(IDS.credits);
        if (!creditsPill) return;

        const creditsSpan = creditsPill.querySelector('span[data-credits]');
        const statusSpan = creditsPill.querySelector('span[data-status]');
        
        if (creditsSpan) {
            creditsSpan.textContent = userCredits;
        }
        
        if (statusSpan) {
            statusSpan.textContent = userIsPaid ? 'Paid' : 'Free';
        }

        // Atualizar cor baseado nos créditos
        const svg = creditsPill.querySelector('svg');
        if (userCredits <= 0) {
            creditsPill.style.borderColor = CONFIG.COLORS.disabled;
            if (creditsSpan) creditsSpan.style.color = CONFIG.COLORS.disabled;
            if (statusSpan) statusSpan.style.color = CONFIG.COLORS.disabled;
            if (svg) svg.style.stroke = CONFIG.COLORS.disabled;
        } else {
            creditsPill.style.borderColor = CONFIG.COLORS.primary;
            if (creditsSpan) creditsSpan.style.color = CONFIG.COLORS.primary;
            if (statusSpan) statusSpan.style.color = CONFIG.COLORS.primary;
            if (svg) svg.style.stroke = CONFIG.COLORS.primary;
        }
    }

    // ============================================================================
    // FUNÇÕES PARA DESABILITAR BOTÃO DE ENVIO
    // ============================================================================

    function findSendButton() {
        // Procurar pelo botão de envio
        const buttons = document.querySelectorAll('button');
        
        for (const btn of buttons) {
            // Verificar se é o botão de envio por aria-label, ícone ou posição
            const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
            const hasUpArrow = btn.querySelector('svg path[d*="M12"]'); // Seta para cima
            const isInMessageBar = btn.closest('[class*="message"]') || btn.closest('form');
            
            if (ariaLabel.includes('send') || ariaLabel.includes('submit') || 
                (hasUpArrow && isInMessageBar)) {
                console.log('✅ Botão de envio encontrado');
                return btn;
            }
        }
        
        console.log('⚠️ Botão de envio não encontrado');
        return null;
    }

    function updateSendButton() {
        if (!sendButton) {
            sendButton = findSendButton();
        }
        
        if (sendButton) {
            if (userCredits <= 0) {
                // DESABILITAR botão quando créditos = 0
                sendButton.disabled = true;
                sendButton.style.opacity = '0.5';
                sendButton.style.pointerEvents = 'none';
                sendButton.style.cursor = 'not-allowed';
                console.log('🚫 Botão de envio DESABILITADO');
            } else {
                // HABILITAR botão quando tem créditos
                sendButton.disabled = false;
                sendButton.style.opacity = '1';
                sendButton.style.pointerEvents = 'auto';
                sendButton.style.cursor = 'pointer';
                console.log('✅ Botão de envio HABILITADO');
            }
        }
    }

    // ============================================================================
    // INTERCEPTAR ENVIO DE MENSAGENS
    // ============================================================================

    function interceptMessageSending() {
        // Interceptar cliques em qualquer botão
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
            const text = btn.textContent?.toLowerCase() || '';
            const hasUpArrow = btn.querySelector('svg path[d*="M12"]');
            
            // Se for botão de envio
            if (ariaLabel.includes('send') || ariaLabel.includes('submit') || 
                text.includes('send') || hasUpArrow) {
                
                console.log('🎯 Clique no botão de envio detectado');
                
                // Verificar créditos ANTES de enviar
                if (userCredits <= 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    alert('❌ Você não tem créditos suficientes!\n\nCompre mais créditos para continuar enviando mensagens.');
                    console.log('❌ Envio bloqueado - sem créditos');
                    return false;
                }
                
                // Consumir crédito
                console.log('💳 Consumindo crédito...');
                await consumeCredit();
            }
        }, true); // Use capture para pegar primeiro
        
        // Interceptar submit de formulários
        document.addEventListener('submit', async (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                console.log('📝 Submit de formulário detectado');
                
                if (userCredits <= 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('❌ Você não tem créditos suficientes!');
                    console.log('❌ Submit bloqueado - sem créditos');
                    return false;
                }
                
                await consumeCredit();
            }
        }, true);
        
        console.log('✅ Interceptação de envio de mensagens ativada');
    }

    // ============================================================================
    // POPUP DO ECOSSISTEMA (IGUAL AO PRODIFY)
    // ============================================================================

    function createEcosystemPopup() {
        if (isPopupOpen) return;
        
        console.log('🌐 Abrindo popup do ecossistema');

        const popup = document.createElement('div');
        popup.id = IDS.popup;
        popup.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 16px;';
        
        const modal = document.createElement('div');
        modal.style.cssText = 'background: #111827; border-radius: 16px; border: 1px solid #374151; max-width: 1024px; width: 100%; max-height: 80vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);';
        
        // Header
        const header = document.createElement('div');
        header.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 24px; border-bottom: 1px solid #374151;';
        header.innerHTML = `
            <div>
                <h2 style="font-size: 24px; font-weight: bold; color: white; margin: 0;">Affinify Ecosystem</h2>
                <p style="color: #9ca3af; margin: 4px 0 0 0; font-size: 14px;">Choose an application to explore</p>
            </div>
            <button id="close-ecosystem-popup" style="padding: 8px; background: transparent; border: none; color: #9ca3af; cursor: pointer; border-radius: 8px; transition: background 0.2s;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
        // Apps Grid
        const content = document.createElement('div');
        content.style.cssText = 'padding: 24px;';
        
        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;';
        
        ECOSYSTEM_APPS.forEach(app => {
            const card = document.createElement('div');
            card.className = 'ecosystem-app-card';
            const gradient = CONFIG.GRADIENT_COLORS[app.gradient] || CONFIG.GRADIENT_COLORS['from-purple-500 via-blue-500 to-pink-500'];
            card.style.cssText = `
                position: relative;
                overflow: hidden;
                border-radius: 12px;
                border: 1px solid #374151;
                cursor: pointer;
                transition: all 0.3s;
                background: ${gradient};
                height: 128px;
            `;
            
            card.innerHTML = `
                <div style="padding: 24px; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.3);">
                            <span style="font-size: 24px; font-weight: bold; color: white;">${app.icon}</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2">
                            <path d="M7 17L17 7"></path>
                            <path d="M7 7h10v10"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 style="font-size: 20px; font-weight: bold; color: white; margin: 0 0 4px 0;">${app.name}</h3>
                        <p style="font-size: 14px; color: rgba(255, 255, 255, 0.8); margin: 0;">${app.description}</p>
                    </div>
                </div>
                <div class="hover-overlay" style="position: absolute; inset: 0; background: rgba(255, 255, 255, 0.05); opacity: 0; transition: opacity 0.3s;"></div>
            `;
            
            card.onclick = () => {
                console.log('🚀 Navegando para:', app.name, app.url);
                window.open(app.url, '_blank');
            };
            
            card.onmouseenter = () => {
                card.style.transform = 'scale(1.05)';
                card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
                card.querySelector('.hover-overlay').style.opacity = '1';
            };
            
            card.onmouseleave = () => {
                card.style.transform = 'scale(1)';
                card.style.boxShadow = 'none';
                card.querySelector('.hover-overlay').style.opacity = '0';
            };
            
            grid.appendChild(card);
        });
        
        content.appendChild(grid);
        
        // Footer
        const footer = document.createElement('div');
        footer.style.cssText = 'padding: 24px; border-top: 1px solid #374151; background: rgba(17, 24, 39, 0.5);';
        footer.innerHTML = '<p style="text-align: center; color: #9ca3af; font-size: 14px; margin: 0;">All applications are part of the Affinify ecosystem and work seamlessly together</p>';
        
        modal.appendChild(header);
        modal.appendChild(content);
        modal.appendChild(footer);
        popup.appendChild(modal);
        document.body.appendChild(popup);
        
        isPopupOpen = true;
        
        // Event listeners
        document.getElementById('close-ecosystem-popup').onclick = closeEcosystemPopup;
        popup.onclick = (e) => {
            if (e.target === popup) closeEcosystemPopup();
        };
        
        // Fechar com ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeEcosystemPopup();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    function closeEcosystemPopup() {
        const popup = document.getElementById(IDS.popup);
        if (popup) {
            popup.remove();
            isPopupOpen = false;
            console.log('🌐 Popup do ecossistema fechado');
        }
    }

    // ============================================================================
    // CRIAR UI DOS ÍCONES
    // ============================================================================

    function createIconsUI() {
        // Remover ícones anteriores
        document.getElementById(IDS.container)?.remove();

        const container = document.createElement('div');
        container.id = IDS.container;
        container.style.cssText = 'position: fixed; top: 16px; right: 200px; display: flex; gap: 10px; z-index: 99999; pointer-events: auto;';

        // Pill de Créditos
        const credPill = document.createElement('div');
        credPill.id = IDS.credits;
        credPill.innerHTML = `
            <div style="display:flex;align-items:center;gap:6px;padding:0 12px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.COLORS.primary}" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v12"/>
                    <path d="M6 12h12"/>
                </svg>
                <span data-credits style="font-weight:600;font-size:14px;color:${CONFIG.COLORS.primary};">${userCredits}</span>
                <span data-status style="font-weight:500;font-size:12px;color:${CONFIG.COLORS.primary};opacity:0.9;">${userIsPaid ? 'Paid' : 'Free'}</span>
            </div>
        `;
        credPill.style.cssText = `height: 34px; background: transparent; border: 2px solid ${CONFIG.COLORS.primary}; border-radius: 10px; display: flex; align-items: center; cursor: pointer; transition: all 0.2s;`;
        credPill.onmouseenter = () => credPill.style.background = CONFIG.COLORS.primaryHover;
        credPill.onmouseleave = () => credPill.style.background = 'transparent';
        credPill.onclick = () => {
            alert(`💳 Você tem ${userCredits} créditos ${userIsPaid ? 'pagos' : 'gratuitos'}.\n\nCada mensagem consome 1 crédito.`);
        };

        // Botão Ecosystem
        const ecoBtn = document.createElement('div');
        ecoBtn.id = IDS.ecosystem;
        ecoBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.COLORS.primary}" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
            </svg>
        `;
        ecoBtn.style.cssText = `width: 34px; height: 34px; background: transparent; border: 2px solid ${CONFIG.COLORS.primary}; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;`;
        ecoBtn.onmouseenter = () => ecoBtn.style.background = CONFIG.COLORS.primaryHover;
        ecoBtn.onmouseleave = () => ecoBtn.style.background = 'transparent';
        ecoBtn.onclick = createEcosystemPopup;

        container.appendChild(credPill);
        container.appendChild(ecoBtn);
        document.body.appendChild(container);
        
        console.log('✅ Ícones criados no canto superior direito');
    }

    // ============================================================================
    // INICIALIZAÇÃO
    // ============================================================================

    async function init() {
        console.log('🚀 Inicializando sistema Affinify...');
        
        // Remover implementações anteriores
        document.querySelectorAll('[id*="affinify-"]').forEach(el => el.remove());
        
        // Buscar créditos do usuário (se API disponível)
        await fetchUserCredits();
        
        // Criar UI dos ícones
        createIconsUI();
        
        // Configurar interceptação de mensagens
        interceptMessageSending();
        
        // Encontrar e atualizar botão de envio
        setTimeout(() => {
            sendButton = findSendButton();
            updateSendButton();
        }, 1000);
        
        // Observar mudanças no DOM para pegar novos botões
        const observer = new MutationObserver(() => {
            if (!sendButton || !document.body.contains(sendButton)) {
                sendButton = findSendButton();
                updateSendButton();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Atualizar periodicamente
        setInterval(() => {
            updateSendButton();
        }, 2000);
        
        console.log('✅ Sistema Affinify inicializado com sucesso!');
        console.log('📊 Créditos:', userCredits, '| Paid:', userIsPaid);
    }

    // Iniciar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
