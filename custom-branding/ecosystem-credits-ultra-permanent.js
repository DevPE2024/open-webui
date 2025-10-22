(function() {
    'use strict';

    console.log('🌐 Affinify FINAL: Carregando sistema único de ecossistema e créditos...');

    let isInitialized = false;
    let mutationObserver = null;
    let forceInterval = null;

    // LIMPAR TODOS OS INTERVALOS E SCRIPTS CONFLITANTES
    function stopAllConflictingScripts() {
        // Parar todos os intervalos ativos
        const highestId = window.setInterval(() => {}, 0);
        for (let i = 0; i < highestId; i++) {
            window.clearInterval(i);
        }
        console.log('🛑 Affinify FINAL: Todos os intervalos conflitantes foram parados');
    }

    // Função para criar os elementos do ecossistema e créditos
    function createEcosystemAndCredits() {
        // Verificar se já existem os elementos corretos
        const existingEcosystem = document.getElementById('affinify-ecosystem-final');
        const existingCredits = document.getElementById('affinify-credits-final');
        
        if (existingEcosystem && existingCredits) {
            // Verificar se estão visíveis e na posição correta
            const ecosystemRect = existingEcosystem.getBoundingClientRect();
            const creditsRect = existingCredits.getBoundingClientRect();
            
            if (ecosystemRect.width > 0 && creditsRect.width > 0) {
                return; // Já estão OK
            }
        }

        // Remover TODOS os elementos antigos (conflitantes)
        document.querySelectorAll('[id*="ecosystem"], [id*="credit"], [id*="affinify"]').forEach(el => {
            if (!el.id.includes('final')) {
                el.remove();
            }
        });

        // Procurar especificamente pelo botão "Temporary Chat"
        let targetElement = document.getElementById('temporary-chat-button');
        
        // Se não encontrar pelo ID, procurar por elementos que contenham "Temporary" ou "Chat"
        if (!targetElement) {
            const allElements = Array.from(document.querySelectorAll('*'));
            for (const el of allElements) {
                const text = el.textContent?.toLowerCase() || '';
                if (text.includes('temporary') || text.includes('chat')) {
                    if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.closest('a, button')) { 
                        targetElement = el.closest('a, button') || el;
                        break;
                    }
                }
            }
        }

        // Se ainda não encontrar, usar posição fixa no canto superior direito
        if (!targetElement) {
            console.log('⚠️ Affinify: Elemento target não encontrado, usando posição fixa');    
            createFixedPositionElements();
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        console.log('✅ Affinify: Target encontrado, criando elementos...', rect);

        // Verificar se a posição é válida
        if (rect.top < 0 || rect.left < 0 || rect.right > window.innerWidth) {
            console.log('⚠️ Affinify: Posição inválida, usando posição fixa');
            createFixedPositionElements();
            return;
        }

        createElementsAtPosition(rect);
    }

    function createFixedPositionElements() {
        // Posição fixa no canto superior direito
        const rect = {
            top: 20,
            left: window.innerWidth - 200,
            right: window.innerWidth - 150
        };
        createElementsAtPosition(rect);
    }

    function createElementsAtPosition(rect) {
        // Posicionar à DIREITA do Temporary Chat
        // Calcular posições: Temporary Chat + 10px gap + Ecosystem Icon + 10px gap + Credits
        
        const ecosystemLeft = rect.right + 10; // 10px à direita do Temporary Chat
        const creditsLeft = ecosystemLeft + 36 + 10; // 10px à direita do Ecosystem Icon (36px de largura)
        
        // CRIAR ÍCONE DO ECOSSISTEMA
        const ecosystemIcon = document.createElement('button');
        ecosystemIcon.id = 'affinify-ecosystem-final';
        ecosystemIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">                                
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />                          
            </svg>
        `;

        ecosystemIcon.style.cssText = `
            position: fixed !important;
            top: ${rect.top}px !important;
            left: ${ecosystemLeft}px !important;
            width: 36px !important;
            height: 36px !important;
            border-radius: 8px !important;
            background: rgba(74, 222, 128, 0.1) !important;
            border: 2px solid #4ade80 !important;
            color: #4ade80 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 9999 !important;
            pointer-events: auto !important;
        `;

        // CRIAR ÍCONE DE CRÉDITOS
        const creditsIcon = document.createElement('div');
        creditsIcon.id = 'affinify-credits-final';
        creditsIcon.style.cssText = `
            position: fixed !important;
            top: ${rect.top}px !important;
            left: ${creditsLeft}px !important;
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            padding: 8px 12px !important;
            border-radius: 8px !important;
            background: rgba(74, 222, 128, 0.15) !important;
            border: 2px solid #4ade80 !important;
            font-family: system-ui !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            color: #4ade80 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
            z-index: 9999 !important;
            white-space: nowrap !important;
            flex-direction: row !important;
            justify-content: center !important;
            pointer-events: auto !important;
        `;

        const creditsContent = document.createElement('div');
        creditsContent.style.cssText = `
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            flex-direction: row !important;
            white-space: nowrap !important;
        `;

        creditsContent.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 16px; height: 16px; flex-shrink: 0; display: inline-block;">                                                                                           
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />                                               
            </svg>
            <span style="color: #4ade80; font-weight: 600; display: inline-block;">9</span>     
            <span style="color: #9ca3af; font-size: 12px; font-weight: 500; display: inline-block;">Free</span>                                                                                 
        `;

        creditsIcon.appendChild(creditsContent);

        // Adicionar ao body com prioridade máxima
        document.body.appendChild(ecosystemIcon);
        document.body.appendChild(creditsIcon);

        // Event listeners
        ecosystemIcon.addEventListener('click', () => {
            createEcosystemPopup();
        });

        ecosystemIcon.addEventListener('mouseenter', () => {
            ecosystemIcon.style.background = 'rgba(74, 222, 128, 0.2)';
            ecosystemIcon.style.transform = 'scale(1.1)';
        });

        ecosystemIcon.addEventListener('mouseleave', () => {
            ecosystemIcon.style.background = 'rgba(74, 222, 128, 0.1)';
            ecosystemIcon.style.transform = 'scale(1)';
        });

        console.log('✅ Affinify: Elementos ULTRA-PERMANENTES criados!');
    }

    // Função do popup do ecossistema
    function createEcosystemPopup() {
        const existingPopup = document.getElementById('affinify-ecosystem-popup-final');        
        if (existingPopup) {
            existingPopup.remove();
        }

        const popup = document.createElement('div');
        popup.id = 'affinify-ecosystem-popup-final';
        popup.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.7) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 99999 !important;
            font-family: system-ui, -apple-system, sans-serif !important;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: #1f2937 !important;
            border-radius: 16px !important;
            padding: 32px !important;
            max-width: 900px !important;
            width: 90% !important;
            max-height: 80vh !important;
            overflow-y: auto !important;
            border: 1px solid rgba(74, 222, 128, 0.3) !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
        `;

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">                                                                              
                <h2 style="color: #f9fafb; font-size: 28px; font-weight: 600; margin: 0;">🌐 Affinify Ecosystem</h2>                                                                            
                <button id="close-popup-affinify-final" style="background: transparent; border: none; color: #9ca3af; cursor: pointer; padding: 8px; border-radius: 8px;">                      
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 24px; height: 24px;">                        
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />                                                                                        
                    </svg>
                </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">                                                                                
                <div class="ecosystem-card" data-url="/" style="background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.3); border-radius: 12px; padding: 24px; cursor: pointer; transition: all 0.3s ease;">                                                               
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">                                                                                           
                        <div style="font-size: 32px;">🤖</div>
                        <div>
                            <h3 style="color: #4ade80; font-size: 18px; font-weight: 600; margin: 0;">OpenUIX</h3>                                                                              
                            <p style="color: #9ca3af; font-size: 14px; margin: 4px 0 0 0;">AI Assistant Platform</p>                                                                            
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; color: #4ade80; font-size: 14px;">                                                                                
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px;">                    
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />                                                                          
                        </svg>
                        <span>Atual</span>
                    </div>
                </div>
                <div class="ecosystem-card" data-url="http://localhost:8001" style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px; cursor: pointer; transition: all 0.3s ease;">                                           
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">                                                                                           
                        <div style="font-size: 32px;">📊</div>
                        <div>
                            <h3 style="color: #3b82f6; font-size: 18px; font-weight: 600; margin: 0;">Prodify</h3>                                                                              
                            <p style="color: #9ca3af; font-size: 14px; margin: 4px 0 0 0;">Productivity Dashboard</p>                                                                           
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; color: #3b82f6; font-size: 14px;">                                                                                
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px;">                    
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />                                                                          
                        </svg>
                        <span>Acessar</span>
                    </div>
                </div>
                <div class="ecosystem-card" data-url="http://localhost:3001" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; cursor: pointer; transition: all 0.3s ease;">                                           
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">                                                                                           
                        <div style="font-size: 32px;">🔍</div>
                        <div>
                            <h3 style="color: #8b5cf6; font-size: 18px; font-weight: 600; margin: 0;">Perplexica</h3>                                                                           
                            <p style="color: #9ca3af; font-size: 14px; margin: 4px 0 0 0;">Search Engine</p>                                                                                    
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; color: #8b5cf6; font-size: 14px;">                                                                                
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px;">                    
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />                                                                          
                        </svg>
                        <span>Acessar</span>
                    </div>
                </div>
                <div class="ecosystem-card" data-url="http://localhost:4000" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 24px; cursor: pointer; transition: all 0.3s ease;">                                           
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">                                                                                           
                        <div style="font-size: 32px;">⚡</div>
                        <div>
                            <h3 style="color: #f59e0b; font-size: 18px; font-weight: 600; margin: 0;">LiteLLM</h3>                                                                              
                            <p style="color: #9ca3af; font-size: 14px; margin: 4px 0 0 0;">LLM Proxy Server</p>                                                                                 
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 14px;">                                                                                
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px;">                    
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />                                                                          
                        </svg>
                        <span>Acessar</span>
                    </div>
                </div>
                <div class="ecosystem-card" data-url="http://localhost:5052" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 24px; cursor: pointer; transition: all 0.3s ease;">                                             
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">                                                                                           
                        <div style="font-size: 32px;">🦙</div>
                        <div>
                            <h3 style="color: #ef4444; font-size: 18px; font-weight: 600; margin: 0;">Ollama</h3>                                                                               
                            <p style="color: #9ca3af; font-size: 14px; margin: 4px 0 0 0;">Local LLM Runner</p>                                                                                 
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; color: #ef4444; font-size: 14px;">                                                                                
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px;">                    
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />                                                                          
                        </svg>
                        <span>Acessar</span>
                    </div>
                </div>
                <div class="ecosystem-card" data-url="http://localhost:8020" style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 24px; cursor: pointer; transition: all 0.3s ease;">                                             
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">                                                                                           
                        <div style="font-size: 32px;">🗄️</div>
                        <div>
                            <h3 style="color: #06b6d4; font-size: 18px; font-weight: 600; margin: 0;">PgAdmin</h3>                                                                              
                            <p style="color: #9ca3af; font-size: 14px; margin: 4px 0 0 0;">Database Management</p>                                                                              
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; color: #06b6d4; font-size: 14px;">                                                                                
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px;">                    
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />                                                                          
                        </svg>
                        <span>Acessar</span>
                    </div>
                </div>
            </div>
        `;

        popup.appendChild(content);
        document.body.appendChild(popup);

        // Event listeners
        document.getElementById('close-popup-affinify-final').addEventListener('click', () => { 
            popup.remove();
        });

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });

        // Card clicks
        document.querySelectorAll('.ecosystem-card').forEach(card => {
            card.addEventListener('click', () => {
                const url = card.getAttribute('data-url');
                if (url !== '/') {
                    window.open(url, '_blank');
                }
                popup.remove();
            });

            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
                card.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
            });
        });
    }

    // Função para interceptar tentativas de remoção dos elementos
    function protectElements() {
        if (mutationObserver) {
            mutationObserver.disconnect();
        }

        mutationObserver = new MutationObserver((mutations) => {
            let shouldRecreate = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.removedNodes.forEach((node) => {
                        if (node.id && (node.id.includes('affinify') || node.id.includes('ecosystem') || node.id.includes('credit'))) {
                            console.log('⚠️ Affinify: Elemento removido detectado, recriando...');
                            shouldRecreate = true;
                        }
                    });
                }
            });

            if (shouldRecreate) {
                setTimeout(createEcosystemAndCredits, 100);
            }
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Função para interceptar fetch requests que podem afetar os créditos
    function interceptFetch() {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const result = originalFetch.apply(this, args);
            
            // Interceptar requests de créditos
            if (args[0] && args[0].includes && args[0].includes('/api/v1/credits')) {
                result.then(response => {
                    if (response.ok) {
                        setTimeout(createEcosystemAndCredits, 500);
                    }
                });
            }
            
            return result;
        };
    }

    // Função de inicialização
    function initialize() {
        if (isInitialized) return;
        
        console.log('🚀 Affinify FINAL: Inicializando sistema único...');
        
        // PRIMEIRO: Parar todos os scripts conflitantes
        stopAllConflictingScripts();
        
        // Interceptar fetch
        interceptFetch();
        
        // Criar elementos iniciais
        createEcosystemAndCredits();
        
        // Proteger elementos
        protectElements();
        
        // Forçar recriação a cada 5 segundos (menos agressivo)
        forceInterval = setInterval(() => {
            const ecosystem = document.getElementById('affinify-ecosystem-final');
            const credits = document.getElementById('affinify-credits-final');
            
            if (!ecosystem || !credits) {
                console.log('🔄 Affinify: Elementos ausentes, recriando...');
                createEcosystemAndCredits();
            } else {
                // Verificar se estão visíveis
                const ecosystemRect = ecosystem.getBoundingClientRect();
                const creditsRect = credits.getBoundingClientRect();
                
                if (ecosystemRect.width === 0 || creditsRect.width === 0) {
                    console.log('🔄 Affinify: Elementos invisíveis, recriando...');
                    createEcosystemAndCredits();
                }
            }
        }, 5000);
        
        isInitialized = true;
        console.log('✅ Affinify: Sistema ULTRA-PERMANENTE inicializado!');
    }

    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Também inicializar após um delay para garantir
    setTimeout(initialize, 1000);

    console.log('✅ Affinify: Sistema ULTRA-PERMANENTE de ecossistema e créditos carregado!');
})();
