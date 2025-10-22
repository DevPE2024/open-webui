"""
Inicialização customizada para integração Affinify
Registra rotas de créditos e autenticação Prodify
"""
import logging
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from fastapi import FastAPI

log = logging.getLogger(__name__)

def init_affinify_routes(app: "FastAPI"):
    """
    Inicializa rotas customizadas do Affinify
    """
    try:
        # Importar routers
        from open_webui.routers import credits, prodify_auth, sso_auth
        
        # Registrar rotas de créditos
        app.include_router(
            credits.router,
            prefix="/api/v1/credits",
            tags=["credits"]
        )
        log.info("✅ Rotas de créditos registradas em /api/v1/credits")
        
        # Registrar autenticação SSO (Single Sign-On)
        app.include_router(
            sso_auth.router,
            prefix="/api/v1/auths",
            tags=["auth", "sso"]
        )
        log.info("✅ Autenticação SSO registrada em /api/v1/auths/sso")
        
        # Registrar autenticação Prodify na rota padrão (sobrescreve a rota do OpenUIX)
        # Isso faz com que a autenticação Prodify seja usada automaticamente
        app.include_router(
            prodify_auth.router,
            prefix="/api/v1/auths",
            tags=["auth"]
        )
        log.info("✅ Autenticação Prodify registrada em /api/v1/auths/signin (rota padrão)")
        
        log.info("🎉 Affinify integração inicializada com sucesso!")
        
    except Exception as e:
        log.error(f"❌ Erro ao inicializar rotas Affinify: {e}")
        import traceback
        traceback.print_exc()

