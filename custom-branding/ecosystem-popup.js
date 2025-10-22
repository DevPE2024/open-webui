/**
 * Sistema de Ecossistema para OpenUIX - Affinify
 * Implementa popup com 6 cards do ecossistema similar ao Prodify
 */

(function() {
    'use strict';
    
    console.log('🌐 Carregando sistema de ecossistema OpenUIX...');
    
    // Dados dos 6 cards do ecossistema
    const ecosystemCards = [
        {
            id: 'openuix',
            title: 'OpenUIX',
            description: 'AI Assistant Platform',
            icon: '🤖',
            url: '/',
            color: '#4ade80',
            bgColor: 'rgba(74, 222, 128, 0.1)'
        },
        {
            id: 'prodify',
            title: 'Prodify',
            description: 'Productivity Dashboard',
            icon: '📊',
            url: 'http://localhost:8001',
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.1)'
        },
        {
            id: 'perplexica',
            title: 'Perplexica',
            description: 'Search Engine',
            icon: '🔍',
            url: 'http://localhost:3001',
            color: '#8b5cf6',
            bgColor: 'rgba(139, 92, 246, 0.1)'
        },
        {
            id: 'litellm',
            title: 'LiteLLM',
            description: 'LLM Proxy Server',
            icon: '⚡',
            url: 'http://localhost:4000',
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)'
        },
        {
            id: 'ollama',
            title: 'Ollama',
            description: 'Local LLM Runner',
            icon: '🦙',
            url: 'http://localhost:5052',
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.1)'
        },
        {
            id: 'pgadmin',
            title: 'PgAdmin',
            description: 'Database Management',
            icon: '🗄️',
            url: 'http://localhost:8020',
            color: '#06b6d4',
            bgColor: 'rgba(6, 182, 212, 0.1)'
        }
    ];
    
    // Função para criar o ícone do ecossistema
    function createEcosystemIcon() {
        const ecosystemIcon = document.createElement('button');
        ecosystemIcon.id = 'ecosystem-icon';
        ecosystemIcon.setAttribute('data-affinify', 'ecosystem');
        ecosystemIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        `;
        
        ecosystemIcon.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: rgba(55, 65, 81, 0.5);
            border: 1px solid rgba(156, 163, 175, 0.3);
            color: #d1d5db;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-right: 8px;
        `;
        
        ecosystemIcon.addEventListener('mouseenter', () => {
            ecosystemIcon.style.background = 'rgba(74, 222, 128, 0.1)';
            ecosystemIcon.style.borderColor = '#4ade80';
            ecosystemIcon.style.color = '#4ade80';
        });
        
        ecosystemIcon.addEventListener('mouseleave', () => {
            ecosystemIcon.style.background = 'rgba(55, 65, 81, 0.5)';
            ecosystemIcon.style.borderColor = 'rgba(156, 163, 175, 0.3)';
            ecosystemIcon.style.color = '#d1d5db';
        });
        
        ecosystemIcon.addEventListener('click', () => {
            toggleEcosystemPopup();
        });
        
        return ecosystemIcon;
    }
    
    // Função para criar o popup do ecossistema
    function createEcosystemPopup() {
        const popup = document.createElement('div');
        popup.id = 'ecosystem-popup';
        popup.setAttribute('data-affinify', 'ecosystem-popup');
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        
        const popupContent = document.createElement('div');
        popupContent.style.cssText = `
            background: #1f2937;
            border-radius: 12px;
            padding: 24px;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            border: 1px solid rgba(156, 163, 175, 0.3);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        `;
        
        const title = document.createElement('h2');
        title.textContent = 'Affinify Ecosystem';
        title.style.cssText = `
            color: #f9fafb;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
        `;
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
        closeButton.style.cssText = `
            background: transparent;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            transition: all 0.2s ease;
        `;
        
        closeButton.addEventListener('click', () => {
            popup.style.display = 'none';
        });
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        const cardsGrid = document.createElement('div');
        cardsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        `;
        
        ecosystemCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.style.cssText = `
                background: ${card.bgColor};
                border: 1px solid ${card.color}40;
                border-radius: 8px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                color: inherit;
            `;
            
            cardElement.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="font-size: 24px;">${card.icon}</div>
                    <div>
                        <h3 style="color: ${card.color}; font-size: 16px; font-weight: 600; margin: 0;">${card.title}</h3>
                        <p style="color: #9ca3af; font-size: 14px; margin: 4px 0 0 0;">${card.description}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: ${card.color}; font-size: 14px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    <span>Acessar</span>
                </div>
            `;
            
            cardElement.addEventListener('mouseenter', () => {
                cardElement.style.transform = 'translateY(-2px)';
                cardElement.style.boxShadow = `0 8px 25px ${card.color}20`;
            });
            
            cardElement.addEventListener('mouseleave', () => {
                cardElement.style.transform = 'translateY(0)';
                cardElement.style.boxShadow = 'none';
            });
            
            cardElement.addEventListener('click', () => {
                if (card.id === 'openuix') {
                    // Para OpenUIX, apenas fechar o popup
                    popup.style.display = 'none';
                } else {
                    // Para outros serviços, abrir em nova aba
                    window.open(card.url, '_blank');
                    popup.style.display = 'none';
                }
            });
            
            cardsGrid.appendChild(cardElement);
        });
        
        popupContent.appendChild(header);
        popupContent.appendChild(cardsGrid);
        popup.appendChild(popupContent);
        
        // Fechar popup ao clicar fora
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none';
            }
        });
        
        document.body.appendChild(popup);
        return popup;
    }
    
    // Função para alternar popup
    function toggleEcosystemPopup() {
        let popup = document.getElementById('ecosystem-popup');
        if (!popup) {
            popup = createEcosystemPopup();
        }
        
        if (popup.style.display === 'none' || popup.style.display === '') {
            popup.style.display = 'flex';
        } else {
            popup.style.display = 'none';
        }
    }
    
    // Função para injetar o ícone do ecossistema
    function injectEcosystemIcon() {
        // Remover ícone existente se houver
        const existingIcon = document.getElementById('ecosystem-icon');
        if (existingIcon) {
            existingIcon.remove();
        }
        
        // Encontrar container do header
        const header = document.querySelector('header') || 
                      document.querySelector('[class*="header"]') ||
                      document.querySelector('nav') ||
                      document.querySelector('div[class*="nav"]');
        
        if (header) {
            const ecosystemIcon = createEcosystemIcon();
            
            // Inserir no início do header (lado direito)
            const headerContent = header.querySelector('div') || header;
            headerContent.appendChild(ecosystemIcon);
            
            console.log('✅ Ícone do ecossistema injetado!');
            return true;
        }
        
        return false;
    }
    
    // Função principal de inicialização
    function initEcosystem() {
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(injectEcosystemIcon, 1000);
            });
        } else {
            setTimeout(injectEcosystemIcon, 1000);
        }
        
        // Monitorar mudanças no DOM para reinjetar se necessário
        setInterval(() => {
            if (!document.getElementById('ecosystem-icon')) {
                injectEcosystemIcon();
            }
        }, 3000);
        
        console.log('🌐 Sistema de ecossistema inicializado!');
    }
    
    // Inicializar
    initEcosystem();
    
})();
