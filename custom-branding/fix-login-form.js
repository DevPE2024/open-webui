// Fix para capturar senha do formulário de login
console.log('🔧 Affinify: Fix de autenticação carregado');

(function() {
    'use strict';
    
    // Interceptar fetch para corrigir requests de login
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const [url, options] = args;
        
        // Se é request de signin
        if (url && url.includes('/api/v1/auths/signin') && options && options.method === 'POST') {
            try {
                const body = JSON.parse(options.body);
                
                // Se password está vazio, tentar pegar do input
                if (!body.password || body.password === '') {
                    console.log('⚠️ Affinify: Senha vazia detectada, capturando do input...');
                    
                    const passwordInput = document.querySelector('input[type="password"]');
                    if (passwordInput && passwordInput.value) {
                        body.password = passwordInput.value;
                        options.body = JSON.stringify(body);
                        console.log('✅ Affinify: Senha capturada e corrigida!', {
                            email: body.email,
                            passwordLength: body.password.length
                        });
                    }
                }
            } catch (e) {
                console.error('Affinify: Erro ao processar request:', e);
            }
        }
        
        return originalFetch.apply(this, args);
    };
    
    console.log('✅ Affinify: Interceptador de login ativo!');
})();

