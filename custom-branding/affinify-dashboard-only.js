// ============================================================================
// SISTEMA AFFINIFY DE CRÉDITOS E ECOSSISTEMA - VERSÃO DASHBOARD ONLY
// Data: 20 de Outubro de 2025
// Autor: Cursor AI Assistant
// 
// REGRAS:
// - Ícones aparecem APENAS no dashboard (após login)
// - Consome créditos ao enviar mensagem
// - Integra com API do Prodify
// - Não quebra funcionalidades existentes
// ============================================================================

console.log('🎯 SISTEMA AFFINIFY DE CRÉDITOS E ECOSSISTEMA - DASHBOARD ONLY');

// ============================================================================
// VARIÁVEIS GLOBAIS
// ============================================================================

let userCredits = 0;
let userIsPaid = false;
let affinityContainer = null;
let ecosystemPopup = null;
let isInitialized = false;

// URLs das aplicações do ecossistema
const ECOSYSTEM_APPS = [
    {
        name: 'Prodify',
        description: 'Task Management & Productivity',
        url: 'http://localhost:8001',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        letter: 'P'
    },
    {
        name: 'OnScope',
        description: 'Visual Web Editor',
        url: 'http://localhost:8002',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        letter: 'O'
    },
    {
        name: 'JazzUp',
        description: 'Collaborative Canvas',
        url: 'http://localhost:8003',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        letter: 'J'
    },
    {
        name: 'DeepQuest',
        description: 'AI-Powered Search Engine',
        url: 'http://localhost:8004',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        letter: 'D'
    },
    {
        name: 'OpenUIX',
        description: 'AI Interface Platform',
        url: 'http://localhost:5050',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        letter: 'O'
    },
    {
        name: 'TestPath',
        description: 'API Testing Tool',
        url: 'http://localhost:8006',
        gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        letter: 'T'
    }
];

// ============================================================================
// FUNÇÕES DE API - INTEGRAÇÃO COM PRODIFY
// ============================================================================

async function getCurrentUserEmail() {
    try {
        // Tenta pegar do localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('⚠️ Token não encontrado no localStorage');
            return null;
        }

        // Tenta buscar info do usuário da API
        const response = await fetch('/api/v1/auths/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Email do usuário obtido:', data.email);
            return data.email;
        }
    } catch (error) {
        console.log('⚠️ Erro ao obter email do usuário:', error);
    }
    return null;
}

async function fetchUserCredits() {
    try {
        const userEmail = await getCurrentUserEmail();
        if (!userEmail) {
            console.log('⚠️ Usuário não autenticado - usando créditos padrão');
            userCredits = 9;
            userIsPaid = false;
            return false;
        }

        console.log('📡 Buscando créditos do Prodify para:', userEmail);
        
        const response = await fetch(
            `http://localhost:8001/api/external/openuix/credits?email=${encodeURIComponent(userEmail)}`
        );

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

    // Fallback
    userCredits = 9;
    userIsPaid = false;
    return false;
}

async function consumeCredit() {
    if (userCredits <= 0) {
        console.log('❌ Sem créditos disponíveis');
        return false;
    }

    try {
        const userEmail = await getCurrentUserEmail();
        if (!userEmail) {
            console.log('⚠️ Usuário não autenticado - usando fallback local');
            userCredits--;
            updateCreditsDisplay();
            updateSendButton();
            console.log('✅ Crédito consumido (fallback). Restam:', userCredits);
            return true;
        }

        console.log('📡 Consumindo crédito no Prodify...');
        
        const response = await fetch('http://localhost:8001/api/external/openuix/credits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                credits: 1
            })
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

    // Fallback local
    userCredits--;
    console.log('✅ Crédito consumido (fallback local). Restam:', userCredits);
    updateCreditsDisplay();
    updateSendButton();
    return true;
}

// ============================================================================
// FUNÇÕES DE UI - ATUALIZAÇÃO DA INTERFACE
// ============================================================================

function updateCreditsDisplay() {
    const creditsNumber = document.getElementById('affinify-credits-number');
    const creditsLabel = document.getElementById('affinify-credits-label');
    
    if (creditsNumber) {
        creditsNumber.textContent = userCredits;
    }
    
    if (creditsLabel) {
        creditsLabel.textContent = userIsPaid ? 'Paid' : 'Free';
    }
}

function updateSendButton() {
    // Procura pelo botão de envio em diferentes seletores possíveis
    const sendButtons = [
        document.querySelector('button[type="submit"]'),
        document.querySelector('button[aria-label="Send"]'),
        document.querySelector('button[aria-label="Send message"]'),
        document.querySelector('[data-testid="send-button"]'),
        document.querySelector('.send-button'),
        ...document.querySelectorAll('button')
    ].filter(btn => btn && (
        btn.textContent?.toLowerCase().includes('send') ||
        btn.textContent?.toLowerCase().includes('enviar') ||
        btn.getAttribute('aria-label')?.toLowerCase().includes('send')
    ));

    sendButtons.forEach(button => {
        if (userCredits <= 0) {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.title = 'Sem créditos disponíveis. Compre mais créditos no Prodify.';
        } else {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.title = `${userCredits} créditos disponíveis`;
        }
    });
}

// ============================================================================
// POPUP DO ECOSSISTEMA
// ============================================================================

function createEcosystemPopup() {
    if (ecosystemPopup) {
        ecosystemPopup.style.display = 'flex';
        console.log('🌐 Abrindo popup do ecossistema');
        return;
    }

    const popup = document.createElement('div');
    popup.id = 'affinify-ecosystem-popup';
    popup.className = 'affinify-ecosystem-popup';
    popup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: fadeIn 0.3s ease;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: #1a1a1a;
        border-radius: 20px;
        padding: 32px;
        max-width: 900px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    `;

    const title = document.createElement('div');
    title.innerHTML = `
        <h2 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Affinify Ecosystem</h2>
        <p style="color: #888; margin: 8px 0 0 0;">Choose an application to explore</p>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;
    closeBtn.style.cssText = `
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: background 0.2s;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    closeBtn.onmouseout = () => closeBtn.style.background = 'transparent';
    closeBtn.onclick = () => {
        popup.style.display = 'none';
        console.log('🌐 Popup do ecossistema fechado');
    };

    header.appendChild(title);
    header.appendChild(closeBtn);

    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
    `;

    ECOSYSTEM_APPS.forEach(app => {
        const card = document.createElement('div');
        card.className = 'ecosystem-card';
        card.style.cssText = `
            background: #2a2a2a;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s;
            border: 2px solid transparent;
        `;

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: ${app.gradient};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: bold;
                    color: white;
                    position: relative;
                ">
                    ${app.letter}
                    <svg style="position: absolute; bottom: -4px; right: -4px; background: white; border-radius: 50%;" 
                         width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="3">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </div>
                <div>
                    <h3 style="color: white; margin: 0; font-size: 18px; font-weight: 600;">${app.name}</h3>
                    <p style="color: #888; margin: 4px 0 0 0; font-size: 14px;">${app.description}</p>
                </div>
            </div>
        `;

        card.onmouseover = () => {
            card.style.background = '#333';
            card.style.borderColor = '#4a9eff';
            card.style.transform = 'translateY(-4px)';
        };
        card.onmouseout = () => {
            card.style.background = '#2a2a2a';
            card.style.borderColor = 'transparent';
            card.style.transform = 'translateY(0)';
        };
        card.onclick = () => {
            console.log(`🌐 Navegando para ${app.name}: ${app.url}`);
            window.location.href = app.url;
        };

        grid.appendChild(card);
    });

    const footer = document.createElement('p');
    footer.style.cssText = `
        color: #888;
        text-align: center;
        margin: 0;
        font-size: 14px;
    `;
    footer.textContent = 'All applications are part of the Affinify ecosystem and work seamlessly together';

    content.appendChild(header);
    content.appendChild(grid);
    content.appendChild(footer);
    popup.appendChild(content);

    // Fechar ao clicar fora
    popup.onclick = (e) => {
        if (e.target === popup) {
            popup.style.display = 'none';
            console.log('🌐 Popup do ecossistema fechado');
        }
    };

    document.body.appendChild(popup);
    ecosystemPopup = popup;
    console.log('🌐 Abrindo popup do ecossistema');
}

// ============================================================================
// INTERCEPTAÇÃO DE ENVIO DE MENSAGENS
// ============================================================================

function interceptMessageSend() {
    console.log('🔌 Configurando interceptação de mensagens...');

    // Intercepta ENTER no campo de mensagem (contenteditable)
    document.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const editable = e.target.closest('[contenteditable="true"]');
            
            if (editable) {
                const message = editable.textContent?.trim();
                
                if (message && message.length > 0) {
                    console.log('📝 Envio de mensagem detectado (Enter):', message.substring(0, 30) + '...');
                    
                    if (userCredits <= 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        alert('❌ Sem créditos disponíveis! Por favor, compre mais créditos no Prodify.');
                        console.log('❌ Envio bloqueado: sem créditos');
                        return false;
                    }

                    // Consome o crédito ANTES de enviar
                    console.log('💳 Tentando consumir 1 crédito...');
                    const success = await consumeCredit();
                    
                    if (!success) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        alert('⚠️ Erro ao processar crédito. Tente novamente.');
                        console.log('❌ Erro ao consumir crédito');
                        return false;
                    }
                    
                    console.log('✅ Crédito consumido! Permitindo envio...');
                }
            }
        }
    }, true);

    // Intercepta submissão de formulários
    document.addEventListener('submit', async (e) => {
        const form = e.target;
        
        // Verifica se é o formulário de chat (pode ter textarea OU contenteditable)
        const textarea = form.querySelector('textarea');
        const editable = form.querySelector('[contenteditable="true"]');
        
        const messageField = textarea || editable;
        const message = textarea ? textarea.value : editable?.textContent;
        const isMessageForm = messageField && message && message.trim().length > 0;
        
        if (isMessageForm) {
            console.log('📝 Envio de mensagem detectado (submit):', message.substring(0, 30) + '...');
            
            if (userCredits <= 0) {
                e.preventDefault();
                e.stopPropagation();
                alert('❌ Sem créditos disponíveis! Por favor, compre mais créditos no Prodify.');
                console.log('❌ Envio bloqueado: sem créditos');
                return false;
            }

            // Consome o crédito
            console.log('💳 Tentando consumir 1 crédito...');
            const success = await consumeCredit();
            if (!success) {
                e.preventDefault();
                e.stopPropagation();
                alert('⚠️ Erro ao processar crédito. Tente novamente.');
                console.log('❌ Erro ao consumir crédito');
                return false;
            }
            
            console.log('✅ Crédito consumido! Permitindo envio...');
        }
    }, true);

    // Intercepta cliques em botões de envio
    document.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const isSendButton = 
            button.type === 'submit' ||
            button.getAttribute('aria-label')?.toLowerCase().includes('send') ||
            button.textContent?.toLowerCase().includes('send') ||
            button.textContent?.toLowerCase().includes('enviar');

        if (isSendButton) {
            // Procurar mensagem (textarea OU contenteditable)
            const form = button.closest('form');
            const textarea = form?.querySelector('textarea') || document.querySelector('textarea');
            const editable = form?.querySelector('[contenteditable="true"]') || document.querySelector('[contenteditable="true"]');
            
            const messageField = textarea || editable;
            const message = textarea ? textarea.value : editable?.textContent;
            const hasMessage = message && message.trim().length > 0;

            if (hasMessage) {
                console.log('📝 Botão de envio clicado:', message.substring(0, 30) + '...');
                
                if (userCredits <= 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('❌ Sem créditos disponíveis! Por favor, compre mais créditos no Prodify.');
                    console.log('❌ Envio bloqueado: sem créditos');
                    return false;
                }
                
                // NÃO consumir aqui, pois o submit já vai consumir
                console.log('ℹ️ Botão de envio permitido (crédito será consumido no submit)');
            }
        }
    }, true);

    console.log('✅ Interceptação de envio de mensagens ativada');
}

// ============================================================================
// CRIAÇÃO DA UI - ÍCONES NO DASHBOARD
// ============================================================================

function createUI() {
    // Remove container anterior se existir
    if (affinityContainer) {
        affinityContainer.remove();
    }

    const container = document.createElement('div');
    container.id = 'affinify-credits-container';
    container.style.cssText = `
        position: fixed;
        top: 12px;
        left: 480px;
        display: flex;
        gap: 8px;
        z-index: 99999;
        align-items: center;
        pointer-events: auto;
    `;

    // Botão de Créditos - Compacto
    const creditsBtn = document.createElement('div');
    creditsBtn.id = 'affinify-credits-btn';
    creditsBtn.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    creditsBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/>
            <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">$</text>
        </svg>
        <span id="affinify-credits-number" style="color: white; font-weight: 700; font-size: 14px;">${userCredits}</span>
        <span id="affinify-credits-label" style="color: rgba(255,255,255,0.8); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">${userIsPaid ? 'Paid' : 'Free'}</span>
    `;

    creditsBtn.onmouseover = () => {
        creditsBtn.style.transform = 'translateY(-2px)';
        creditsBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    };
    creditsBtn.onmouseout = () => {
        creditsBtn.style.transform = 'translateY(0)';
        creditsBtn.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
    };

    // Botão do Ecossistema - Compacto
    const ecosystemBtn = document.createElement('div');
    ecosystemBtn.id = 'affinify-ecosystem-btn';
    ecosystemBtn.style.cssText = `
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    ecosystemBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
    `;

    ecosystemBtn.onmouseover = () => {
        ecosystemBtn.style.transform = 'translateY(-2px) scale(1.05)';
        ecosystemBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        ecosystemBtn.style.background = 'linear-gradient(135deg, #7c8ef1 0%, #8a5cb5 100%)';
    };
    ecosystemBtn.onmouseout = () => {
        ecosystemBtn.style.transform = 'translateY(0) scale(1)';
        ecosystemBtn.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
        ecosystemBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    };
    ecosystemBtn.onclick = createEcosystemPopup;

    container.appendChild(creditsBtn);
    container.appendChild(ecosystemBtn);
    document.body.appendChild(container);
    affinityContainer = container;

    console.log('✅ Ícones criados no dashboard');
}

// ============================================================================
// DETECÇÃO DE DASHBOARD VS LOGIN
// ============================================================================

function isDashboardPage() {
    // Verifica se NÃO está na página de login/auth
    const isAuthPage = window.location.pathname.includes('/auth') || 
                       window.location.pathname.includes('/login');
    
    // Verifica se tem token (usuário logado)
    const hasToken = !!localStorage.getItem('token');
    
    // Se não é auth e tem token, considera dashboard
    // (não precisa esperar textarea carregar)
    const isDashboard = !isAuthPage && hasToken;
    
    console.log('🔍 Verificação de página:', {
        pathname: window.location.pathname,
        isAuthPage,
        hasToken,
        isDashboard
    });
    
    return isDashboard;
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

async function init() {
    if (isInitialized) {
        console.log('⚠️ Sistema já inicializado');
        return;
    }

    console.log('🚀 Inicializando sistema Affinify...');

    // Aguarda um pouco para garantir que a página carregou
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verifica se está no dashboard
    if (!isDashboardPage()) {
        console.log('ℹ️ Não está no dashboard - aguardando login...');
        
        // Monitora mudanças de URL (login → dashboard)
        const observer = new MutationObserver(() => {
            if (isDashboardPage() && !isInitialized) {
                console.log('✅ Dashboard detectado - inicializando sistema...');
                init();
            }
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
        
        return;
    }

    // Busca créditos do Prodify
    await fetchUserCredits();

    // Cria UI
    createUI();

    // Configura interceptação de mensagens
    interceptMessageSend();

    // Atualiza botão de envio periodicamente
    setInterval(updateSendButton, 1000);

    isInitialized = true;
    console.log('✅ Sistema Affinify inicializado com sucesso!');
    console.log('📊 Créditos:', userCredits, '| Paid:', userIsPaid);
}

// Adiciona CSS de animações
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Inicia quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('📦 Script Affinify carregado - aguardando dashboard...');

