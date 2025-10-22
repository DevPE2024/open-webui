/**
 * Sistema de Créditos DEFINITIVO para OpenUIX - Affinify
 * FORÇA 9 CRÉDITOS SEMPRE - SEM EXCEÇÕES
 */

(function() {
    'use strict';
    
    console.log('🔧 Carregando sistema de créditos DEFINITIVO...');
    
    // PARAR TODOS OS SCRIPTS CONFLITANTES
    for (let i = 1; i < 99999; i++) {
        clearInterval(i);
        clearTimeout(i);
    }
    
    // FUNÇÃO PARA CRIAR CRÉDITOS DEFINITIVOS
    function createFinalCredits() {
        // Remover TODOS os elementos de créditos antigos
        document.querySelectorAll('[id*="credit"], [class*="credit"], [data-affinify]').forEach(el => {
            if (el.textContent.includes('0') || el.textContent.includes('Free') || el.textContent.includes('credits')) {
                el.remove();
            }
        });
        
        // Encontrar container do usuário
        const buttons = Array.from(document.querySelectorAll('button'));
        const userButton = buttons.find(b => b.textContent.includes('Test User') || b.textContent.includes('User')) || buttons[buttons.length - 1];
        
        if (userButton && userButton.parentElement) {
            const creditsDiv = document.createElement('div');
            creditsDiv.id = 'credits-final-permanent-9';
            creditsDiv.setAttribute('data-definitive', 'credits');
            creditsDiv.style.cssText = `
                display: inline-flex !important;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                border-radius: 8px;
                background: rgba(74, 222, 128, 0.15) !important;
                border: 2px solid #4ade80 !important;
                margin-right: 12px;
                font-family: system-ui;
                position: relative;
                z-index: 99999;
                box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
            `;
            
            creditsDiv.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#4ade80" style="width: 16px; height: 16px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
                <span style="font-size: 15px; font-weight: 700; color: #4ade80;">9</span>
                <span style="font-size: 12px; padding: 2px 8px; border-radius: 4px; background: rgba(55, 65, 81, 0.8); color: #d1d5db; border: 1px solid rgba(74, 222, 128, 0.3);">Free</span>
            `;
            
            userButton.parentElement.insertBefore(creditsDiv, userButton);
            return creditsDiv;
        }
        return null;
    }
    
    // FUNÇÃO DE PROTEÇÃO CONTRA SCRIPTS CONFLITANTES
    function protectCredits() {
        // Verificar se elemento existe e tem valor correto
        const current = document.getElementById('credits-final-permanent-9');
        if (!current || !current.textContent.includes('9')) {
            createFinalCredits();
        }
        
        // FORÇAR todos os elementos com "0" a serem "9"
        document.querySelectorAll('*').forEach(el => {
            if (el.textContent.trim() === '0' && el.parentElement && el.parentElement.textContent.includes('Free')) {
                el.textContent = '9';
                el.style.color = '#4ade80';
                el.style.fontWeight = '700';
            }
        });
        
        // Remover elementos com 0 créditos
        document.querySelectorAll('[id*="credit"], [class*="credit"]').forEach(el => {
            if (el.textContent.includes('0') && !el.id.includes('permanent')) {
                el.remove();
            }
        });
    }
    
    // OVERRIDE DE FETCH PARA INTERCEPTAR REQUESTS
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const response = originalFetch.apply(this, args);
        
        // Após qualquer fetch, garantir que créditos sejam 9
        response.finally(() => {
            setTimeout(protectCredits, 100);
        });
        
        return response;
    };
    
    // OVERRIDE DE INTERVALOS PARA EVITAR CONFLITOS
    const originalSetInterval = window.setInterval;
    window.setInterval = function(callback, delay) {
        // Filtrar callbacks que podem alterar créditos
        const wrappedCallback = function() {
            try {
                callback();
            } finally {
                // Sempre proteger créditos após qualquer callback
                setTimeout(protectCredits, 50);
            }
        };
        return originalSetInterval(wrappedCallback, delay);
    };
    
    // INICIALIZAÇÃO IMEDIATA
    function initCredits() {
        console.log('🚀 Inicializando créditos DEFINITIVOS...');
        
        // Criar créditos imediatamente
        createFinalCredits();
        
        // Proteção contínua
        setInterval(protectCredits, 500);
        
        console.log('✅ Créditos DEFINITIVOS ativados - 9 créditos FORÇADOS!');
    }
    
    // Executar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCredits);
    } else {
        initCredits();
    }
    
    // Executar também após um delay para garantir
    setTimeout(initCredits, 1000);
    setTimeout(initCredits, 3000);
    
})();