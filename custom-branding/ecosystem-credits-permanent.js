(function() {
    'use strict';
    
    // Função para criar os elementos
    function createEcosystemAndCredits() {
        // Remover elementos antigos
        document.querySelectorAll('[id*="credits"], [id*="ecosystem"], [id*="affinify"]').forEach(el => el.remove());
        
        // CRIAR CONTAINER PARA OS DOIS ELEMENTOS
        const container = document.createElement('div');
        container.id = 'affinify-container';
        container.style.cssText = `
            position: fixed !important;
            top: 15px !important;
            right: 200px !important;
            display: flex !important;
            gap: 10px !important;
            z-index: 99999 !important;
        `;
        
        // CRIAR ÍCONE DO ECOSSISTEMA (quadrado com 4 quadradinhos)
        const ecosystem = document.createElement('div');
        ecosystem.id = 'ecosystem-beautiful';
        ecosystem.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
        `;
        ecosystem.style.cssText = `
            width: 40px !important;
            height: 40px !important;
            background: #1f2937 !important;
            color: #10b981 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            border: 2px solid #10b981 !important;
            transition: all 0.3s ease !important;
            flex-shrink: 0 !important;
        `;
        
        // CRIAR CRÉDITOS (retângulo com moedas + 9 + Free)
        const credits = document.createElement('div');
        credits.id = 'credits-beautiful';
        credits.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px; padding: 0 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12l2 2 4-4"/>
                </svg>
                <span style="font-weight: 600; font-size: 14px;">9</span>
                <span style="font-weight: 500; font-size: 12px; opacity: 0.8;">Free</span>
            </div>
        `;
        credits.style.cssText = `
            height: 40px !important;
            background: #1f2937 !important;
            color: #10b981 !important;
            border-radius: 8px !important;
            border: 2px solid #10b981 !important;
            transition: all 0.3s ease !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
        `;
        
        // Adicionar elementos ao container
        container.appendChild(ecosystem);
        container.appendChild(credits);
        
        // Adicionar container ao body
        document.body.appendChild(container);
        
        console.log('✅ ELEMENTOS PERMANENTES CRIADOS!');
    }
    
    // Função para verificar se os elementos existem
    function checkElements() {
        const container = document.getElementById('affinify-container');
        if (!container) {
            createEcosystemAndCredits();
        }
    }
    
    // Executar quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createEcosystemAndCredits);
    } else {
        createEcosystemAndCredits();
    }
    
    // Verificar periodicamente se os elementos ainda existem
    setInterval(checkElements, 2000);
    
    // Observer para detectar mudanças no DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                checkElements();
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
})();