#!/bin/bash
# Startup script para OpenUIX com integração Affinify

echo "🚀 Iniciando OpenUIX com integração Affinify..."

# Copiar arquivos de integração
echo "📦 Copiando arquivos de integração..."
cp -f /tmp/affinify-files/prodify_sync.py /app/backend/open_webui/utils/ 2>/dev/null || true
cp -f /tmp/affinify-files/prodify_auth.py /app/backend/open_webui/routers/ 2>/dev/null || true
cp -f /tmp/affinify-files/credits.py /app/backend/open_webui/routers/ 2>/dev/null || true
cp -f /tmp/affinify-files/credits_utils.py /app/backend/open_webui/utils/credits.py 2>/dev/null || true
cp -f /tmp/affinify-files/affinify_init.py /app/backend/open_webui/utils/ 2>/dev/null || true

# Copiar scripts para o frontend
echo "🎨 Configurando frontend..."
mkdir -p /app/build/static/js
cp -f /tmp/affinify-files/credits-affinify.js /app/build/static/js/ 2>/dev/null || true
cp -f /tmp/affinify-files/fix-login-form.js /app/build/static/js/ 2>/dev/null || true
cp -f /tmp/affinify-files/ecosystem-credits-permanent.js /app/build/static/js/ 2>/dev/null || true

# Adicionar scripts no HTML se não existirem
if ! grep -q "fix-login-form.js" /app/build/index.html 2>/dev/null; then
    echo "📝 Adicionando fix de login no HTML..."
    sed -i 's|<head>|<head><script src="/static/js/fix-login-form.js"></script>|g' /app/build/index.html 2>/dev/null || true
fi

if ! grep -q "credits-affinify.js" /app/build/index.html 2>/dev/null; then
    echo "📝 Adicionando script de créditos no HTML..."
    sed -i 's|</head>|<script src="/static/js/credits-affinify.js" defer></script></head>|g' /app/build/index.html 2>/dev/null || true
fi

if ! grep -q "ecosystem-credits-permanent.js" /app/build/index.html 2>/dev/null; then
    echo "📝 Adicionando script permanente de ecossistema e créditos no HTML..."
    sed -i 's|</head>|<script src="/static/js/ecosystem-credits-permanent.js" defer></script></head>|g' /app/build/index.html 2>/dev/null || true
fi

# Forçar carregamento do módulo Affinify NO INÍCIO do main.py
echo "🔧 Configurando auto-carregamento..."
if ! grep -q "Affinify Integration" /app/backend/open_webui/main.py 2>/dev/null; then
    # Encontrar linha após 'app = FastAPI' e adicionar logo depois
    python3 << 'PYTHON_INJECT'
import re

main_path = "/app/backend/open_webui/main.py"
try:
    with open(main_path, 'r') as f:
        content = f.read()
    
    # Procurar por 'app = FastAPI(' e adicionar logo após o fechamento dos parênteses
    pattern = r'(app = FastAPI\([^)]*\))'
    match = re.search(pattern, content, re.DOTALL)
    
    affinify_code = '''

# Affinify Integration - Load FIRST to override default routes
try:
    from open_webui.utils import affinify_init
    affinify_init.init_affinify_routes(app)
except Exception as e:
    import logging
    logging.getLogger(__name__).error(f'Failed to load Affinify integration: {e}')
'''
    
    if match:
        insert_pos = match.end()
        content = content[:insert_pos] + affinify_code + content[insert_pos:]
        
        with open(main_path, 'w') as f:
            f.write(content)
        
        print("✅ Auto-carregamento configurado no início do main.py")
    else:
        print("⚠️ Não encontrou 'app = FastAPI', adicionando no final")
        with open(main_path, 'a') as f:
            f.write(affinify_code)
except Exception as e:
    print(f"❌ Erro ao injetar código: {e}")
PYTHON_INJECT
else
    echo "ℹ️  Auto-carregamento já configurado"
fi

echo "✅ Integração Affinify configurada!"
echo "🎯 Iniciando servidor..."

# Executar o comando original do container
exec "$@"

