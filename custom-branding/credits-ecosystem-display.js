(function() {
    'use strict';
    
    console.log('🎯 Affinify: Mostrando créditos e ecossistema...');
    
    function showCreditsAndEcosystem() {
        // Remover elementos antigos se existirem
        const oldEcosystem = document.getElementById('credits-ecosystem-display');
        const oldCredits = document.getElementById('credits-display-only');
        if (oldEcosystem) oldEcosystem.remove();
        if (oldCredits) oldCredits.remove();
        
        // CRIAR ÍCONE DO ECOSSISTEMA
        const ecosystem = document.createElement('div');
        ecosystem.id = 'credits-ecosystem-display';
        ecosystem.innerHTML = '🌐';
        ecosystem.style.cssText = `
            position: fixed !important;
            top: 10px !important;
            right: 200px !important;
            width: 50px !important;
            height: 50px !important;
            background: #4ade80 !important;
            color: white !important;
            font-size: 24px !important;
            z-index: 99999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 10px !important;
            cursor: pointer !important;
        `;
        
        // CRIAR CRÉDITOS
        const credits = document.createElement('div');
        credits.id = 'credits-display-only';
        credits.innerHTML = '💰 9 Free';
        credits.style.cssText = `
            position: fixed !important;
            top: 10px !important;
            right: 120px !important;
            padding: 15px !important;
            background: #4ade80 !important;
            color: white !important;
            font-size: 18px !important;
            font-weight: bold !important;
            z-index: 99999 !important;
            border-radius: 10px !important;
        `;
        
        // Adicionar ao body
        document.body.appendChild(ecosystem);
        document.body.appendChild(credits);
        
        console.log('✅ Créditos e Ecossistema exibidos!');
    }
    
    // Executar quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showCreditsAndEcosystem);
    } else {
        showCreditsAndEcosystem();
    }
    
    // Verificar a cada 3 segundos se ainda estão lá
    setInterval(() => {
        const ecosystem = document.getElementById('credits-ecosystem-display');
        const credits = document.getElementById('credits-display-only');
        
        if (!ecosystem || !credits) {
            console.log('🔄 Recriando créditos e ecossistema...');
            showCreditsAndEcosystem();
        }
    }, 3000);
    
})();
