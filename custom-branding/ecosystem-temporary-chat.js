(function() {
    'use strict';
    
    console.log('🎯 Affinify: Localizando Temporary Chat e posicionando elementos...');
    
    function createEcosystemAndCredits() {
        // Remover elementos antigos
        document.querySelectorAll('[id*="ecosystem"], [id*="credit"], [id*="affinify"]').forEach(el => {
            el.remove();
        });
        
        // Localizar o botão Temporary Chat
        const temporaryChatButton = document.getElementById('temporary-chat-button');
        
        if (!temporaryChatButton) {
            console.log('❌ Temporary Chat button não encontrado!');
            return;
        }
        
        const rect = temporaryChatButton.getBoundingClientRect();
        console.log('✅ Temporary Chat encontrado:', rect);
        
        // Usar coordenadas FIXAS baseadas no que sabemos:
        // Temporary Chat: left: 1014, right: 1048
        // Posicionar IMEDIATAMENTE à direita
        
        const ecosystemLeft = 1048 + 2; // 1050px - colado no Temporary Chat
        const creditsLeft = ecosystemLeft + 40 + 2; // 1092px - 2px à direita do Ecosystem
        
        // CRIAR ÍCONE DO ECOSSISTEMA
        const ecosystemIcon = document.createElement('button');
        ecosystemIcon.id = 'affinify-ecosystem-temp';
        ecosystemIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">                                
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />                          
            </svg>
        `;
        
        ecosystemIcon.style.cssText = `
            position: fixed !important;
            top: ${rect.top + 10}px !important;
            left: ${ecosystemLeft}px !important;
            width: 40px !important;
            height: 40px !important;
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
        creditsIcon.id = 'affinify-credits-temp';
        creditsIcon.style.cssText = `
            position: fixed !important;
            top: ${rect.top + 10}px !important;
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
        
        // Adicionar ao body
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
        
        console.log('✅ Elementos criados ao lado do Temporary Chat!');
    }
    
    // Função do popup do ecossistema
    function createEcosystemPopup() {
        const existingPopup = document.getElementById('affinify-ecosystem-popup-temp');        
        if (existingPopup) {
            existingPopup.remove();
        }
        
        const popup = document.createElement('div');
        popup.id = 'affinify-ecosystem-popup-temp';
        popup.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 600px !important;
            max-width: 90vw !important;
            background: rgba(17, 24, 39, 0.95) !important;
            border: 2px solid #4ade80 !important;
            border-radius: 16px !important;
            padding: 24px !important;
            z-index: 10000 !important;
            backdrop-filter: blur(10px) !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
        `;
        
        popup.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #4ade80; font-size: 20px; font-weight: 600; margin: 0;">Ecosystem</h2>
                <button id="close-popup-affinify-temp" style="background: none; border: none; color: #9ca3af; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                <div class="ecosystem-card" data-app="openuix" style="padding: 16px; border: 1px solid #374151; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: rgba(74, 222, 128, 0.05);">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <div style="width: 40px; height: 40px; background: #4ade80; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <svg style="width: 20px; height: 20px; color: white;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                        <h3 style="color: #4ade80; font-size: 16px; font-weight: 600; margin: 0;">OpenUIX</h3>
                    </div>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px 0;">AI Assistant Platform</p>
                    <button style="background: #4ade80; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">Atual</button>
                </div>
                <div class="ecosystem-card" data-app="prodify" style="padding: 16px; border: 1px solid #374151; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <svg style="width: 20px; height: 20px; color: white;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                        <h3 style="color: #3b82f6; font-size: 16px; font-weight: 600; margin: 0;">Prodify</h3>
                    </div>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px 0;">Productivity Dashboard</p>
                    <button style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">Acessar</button>
                </div>
                <div class="ecosystem-card" data-app="perplexica" style="padding: 16px; border: 1px solid #374151; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <div style="width: 40px; height: 40px; background: #8b5cf6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <svg style="width: 20px; height: 20px; color: white;" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3z"/></svg>
                        </div>
                        <h3 style="color: #8b5cf6; font-size: 16px; font-weight: 600; margin: 0;">Perplexica</h3>
                    </div>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px 0;">AI Search Engine</p>
                    <button style="background: #8b5cf6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">Acessar</button>
                </div>
                <div class="ecosystem-card" data-app="litellm" style="padding: 16px; border: 1px solid #374151; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <div style="width: 40px; height: 40px; background: #f59e0b; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <svg style="width: 20px; height: 20px; color: white;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                        <h3 style="color: #f59e0b; font-size: 16px; font-weight: 600; margin: 0;">LiteLLM</h3>
                    </div>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px 0;">LLM Proxy Server</p>
                    <button style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">Acessar</button>
                </div>
                <div class="ecosystem-card" data-app="ollama" style="padding: 16px; border: 1px solid #374151; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <div style="width: 40px; height: 40px; background: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <svg style="width: 20px; height: 20px; color: white;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                        <h3 style="color: #10b981; font-size: 16px; font-weight: 600; margin: 0;">Ollama</h3>
                    </div>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px 0;">Local LLM Server</p>
                    <button style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">Acessar</button>
                </div>
                <div class="ecosystem-card" data-app="pgadmin" style="padding: 16px; border: 1px solid #374151; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <div style="width: 40px; height: 40px; background: #ef4444; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <svg style="width: 20px; height: 20px; color: white;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                        <h3 style="color: #ef4444; font-size: 16px; font-weight: 600; margin: 0;">PgAdmin</h3>
                    </div>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px 0;">Database Admin</p>
                    <button style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">Acessar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Event listeners
        document.getElementById('close-popup-affinify-temp').addEventListener('click', () => {
            popup.remove();
        });
        
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });
        
        // Cards hover effects
        document.querySelectorAll('.ecosystem-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = '#4ade80';
                card.style.background = 'rgba(74, 222, 128, 0.1)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = '#374151';
                card.style.background = 'rgba(74, 222, 128, 0.05)';
            });
            
            card.addEventListener('click', () => {
                const app = card.dataset.app;
                if (app === 'openuix') return;
                
                const urls = {
                    'prodify': 'http://localhost:8001',
                    'perplexica': 'http://localhost:3000',
                    'litellm': 'http://localhost:4000',
                    'ollama': 'http://localhost:11434',
                    'pgadmin': 'http://localhost:5051'
                };
                
                if (urls[app]) {
                    window.open(urls[app], '_blank');
                    popup.remove();
                }
            });
        });
    }
    
    // Executar quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createEcosystemAndCredits);
    } else {
        createEcosystemAndCredits();
    }
    
    // Verificar a cada 2 segundos se os elementos ainda estão lá
    setInterval(() => {
        const ecosystem = document.getElementById('affinify-ecosystem-temp');
        const credits = document.getElementById('affinify-credits-temp');
        
        if (!ecosystem || !credits) {
            console.log('🔄 Recriando elementos...');
            createEcosystemAndCredits();
        }
    }, 2000);
    
})();
