// Script para esconder informações internas do sistema
(function() {
    'use strict';
    
    function hideInternalInfo() {
        // Esconder campos com URLs internas
        const inputs = document.querySelectorAll('input[type="text"], input[type="url"], input[type="password"]');
        inputs.forEach(input => {
            if (input.value && (
                input.value.includes('litellm:4000') ||
                input.value.includes('openuix-ollama-dev:11434') ||
                input.value.includes('sk-1234') ||
                input.value.includes('sk-BKoQlwwMC5KkIu3Lr3S5BA')
            )) {
                input.style.display = 'none';
                input.style.visibility = 'hidden';
                input.style.opacity = '0';
                input.style.height = '0';
                input.style.width = '0';
                input.style.overflow = 'hidden';
                
                // Esconder o container pai também
                let parent = input.parentElement;
                while (parent && parent !== document.body) {
                    if (parent.querySelector('input[value*="litellm"], input[value*="ollama"]')) {
                        parent.style.display = 'none';
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
        });
        
        // Esconder campos por placeholder
        const placeholderInputs = document.querySelectorAll('input[placeholder*="API Base URL"], input[placeholder*="Enter URL"], input[placeholder*="API Key"]');
        placeholderInputs.forEach(input => {
            input.style.display = 'none';
            input.style.visibility = 'hidden';
            input.style.opacity = '0';
            input.style.height = '0';
            input.style.width = '0';
            input.style.overflow = 'hidden';
        });
        
        // Esconder botões de editar
        const editButtons = document.querySelectorAll('button[aria-label*="edit"], button[title*="edit"], button[aria-label*="Edit"], button[title*="Edit"]');
        editButtons.forEach(button => {
            button.style.display = 'none';
        });
        
        // Esconder seções de conexão
        const connectionSections = document.querySelectorAll('[class*="connection"], [class*="api-settings"], [class*="openai-api"], [class*="ollama-api"]');
        connectionSections.forEach(section => {
            section.style.display = 'none';
        });
    }
    
    // Executar imediatamente
    hideInternalInfo();
    
    // Executar quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideInternalInfo);
    }
    
    // Executar quando houver mudanças no DOM
    const observer = new MutationObserver(hideInternalInfo);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['value', 'placeholder']
    });
    
    // Executar periodicamente para garantir que os elementos sejam escondidos
    setInterval(hideInternalInfo, 1000);
})();
