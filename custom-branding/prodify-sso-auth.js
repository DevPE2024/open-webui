// ============================================================================
// SISTEMA DE SSO (Single Sign-On) PRODIFY → OPENUIX
// Data: 20 de Outubro de 2025
// 
// FLUXO COMPLETO:
// 1. Usuário está logado no Prodify
// 2. Clica em OpenUIX no ecossistema
// 3. Prodify redireciona com sso_token e email na URL
// 4. OpenUIX valida o token via endpoint /api/v1/auths/sso
// 5. Cria sessão automaticamente no OpenUIX
// 6. Redireciona para o dashboard
// ============================================================================

console.log('🔐 Sistema SSO Prodify → OpenUIX carregado');

(async function() {
    'use strict';

    // Verificar se está na rota de SSO
    const urlParams = new URLSearchParams(window.location.search);
    const ssoToken = urlParams.get('sso_token');
    const userEmail = urlParams.get('email');

    if (ssoToken && userEmail) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔑 SSO DETECTADO!');
        console.log('📧 Email:', userEmail);
        console.log('🎫 Token:', ssoToken.substring(0, 20) + '...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Mostrar tela de loading imediatamente
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'sso-loading';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        loadingDiv.innerHTML = `
            <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 50px; border-radius: 24px; backdrop-filter: blur(10px); box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="margin-bottom: 30px;">
                    <svg width="80" height="80" viewBox="0 0 50 50" style="animation: spin 1s linear infinite;">
                        <circle cx="25" cy="25" r="20" stroke="white" stroke-width="4" fill="none" stroke-dasharray="80" stroke-dashoffset="60" stroke-linecap="round"/>
                    </svg>
                </div>
                <div style="font-size: 28px; font-weight: 700; margin-bottom: 15px; letter-spacing: -0.5px;">
                    🔐 Conectando com Prodify
                </div>
                <div style="font-size: 16px; opacity: 0.95; margin-bottom: 8px; font-weight: 500;">
                    ${userEmail}
                </div>
                <div style="font-size: 14px; opacity: 0.75; margin-top: 20px;">
                    Autenticação automática em andamento...
                </div>
                <div style="margin-top: 25px; padding: 12px 24px; background: rgba(255,255,255,0.1); border-radius: 12px; display: inline-block;">
                    <div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">
                        SSO - Affinify Ecosystem
                    </div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loadingDiv);

        try {
            console.log('📡 Enviando requisição SSO para OpenUIX...');
            
            // Fazer requisição para o endpoint SSO
            const response = await fetch('/api/v1/auths/sso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userEmail,
                    sso_token: ssoToken,
                    provider: 'prodify'
                })
            });

            console.log('📥 Resposta SSO recebida:', response.status);

            if (response.ok) {
                const data = await response.json();
                
                console.log('✅ SSO Autenticado com sucesso!');
                console.log('   User ID:', data.id);
                console.log('   Nome:', data.name);
                console.log('   Role:', data.role);
                
                // Salvar token no localStorage
                localStorage.setItem('token', data.token);
                console.log('💾 Token salvo no localStorage');
                
                // Aguardar um pouco para mostrar a mensagem
                await new Promise(resolve => setTimeout(resolve, 800));
                
                console.log('↻ Redirecionando para dashboard...');
                
                // Limpar parâmetros SSO da URL
                const cleanUrl = window.location.pathname;
                window.history.replaceState({}, '', cleanUrl);
                
                // Redirecionar para o dashboard
                window.location.href = '/';
                
            } else {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                console.error('❌ Erro na autenticação SSO:');
                console.error('   Status:', response.status);
                console.error('   Erro:', errorData.detail || errorData);
                
                // Remover loading
                const loading = document.getElementById('sso-loading');
                if (loading) loading.remove();
                
                // Mostrar mensagem de erro apropriada
                let errorMsg = 'Erro na autenticação SSO.';
                
                if (response.status === 404) {
                    errorMsg = 'Usuário não encontrado no OpenUIX. Por favor, sincronize os usuários primeiro.';
                } else if (response.status === 401) {
                    errorMsg = 'Token SSO expirado. Por favor, tente novamente.';
                } else if (response.status === 400) {
                    errorMsg = 'Token SSO inválido.';
                }
                
                alert(errorMsg);
                
                // Redirecionar para login com email pré-preenchido
                window.location.href = `/auth?email=${encodeURIComponent(userEmail)}&from=prodify`;
            }
            
        } catch (error) {
            console.error('❌ Erro fatal no SSO:', error);
            
            // Remover loading
            const loading = document.getElementById('sso-loading');
            if (loading) loading.remove();
            
            alert('Erro de conexão com o servidor. Por favor, tente novamente.');
            window.location.href = '/auth';
        }
    } else {
        console.log('ℹ️ Não é um acesso SSO (sem parâmetros sso_token ou email)');
        
        // Verificar se vem do Prodify pelo referrer
        if (document.referrer && document.referrer.includes('localhost:8001')) {
            console.log('🌐 Acesso vindo do Prodify (referrer detectado)');
        }
    }

})();
