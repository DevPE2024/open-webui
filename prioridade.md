# ✅ CONFIGURAÇÃO ATUALIZADA - OpenUIX Enterprise

## 🎯 **CONFIGURAÇÃO ATUAL:**
- **Porta Externa:** 5050 (disponível e funcional)
- **Porta Interna:** 8080 (padrão Open WebUI)
- **Mapeamento:** 5050:8080
- **Idioma:** 🌍 Inglês (en-US) - **CONFIGURADO NO BACKEND**
  - `DEFAULT_LOCALE=en-US` ✅
  - `FORCE_LOCALE=en-US` ✅
  - Usuários podem mudar nas configurações (se desejarem)
- **Nome:** OpenUIX Enterprise - Powered by Open WebUI

## 📋 **PORTAS EM USO (EVITAR):**
- **3003** - OpenUI (anterior)
- **4000** - LiteLLM
- **5432** - PostgreSQL 
- **9090** - Prometheus

## 🔧 **CONFIGURAÇÃO ATUAL:**
```yaml
ports:
  - "5050:8080"  # Nova porta - Livre! ✅
environment:
  - WEBUI_NAME=OpenUIX Enterprise - Powered by Open WebUI
  - DEFAULT_LOCALE=en-US
  - WEBUI_URL=http://localhost:5050
```

## ⚖️ **CONFORMIDADE LEGAL:**
✅ **Opção 1 & 2 Implementadas:**
- Branding "Open WebUI" mantido visível
- Possibilidade de até 50 usuários com marca customizada
- Nome comercial em conformidade com licença BSD-3-Clause

## 🌐 **ACESSO:**
- **URL Local:** http://localhost:5050
- **Interface:** 100% em Inglês
- **API LiteLLM:** http://localhost:4000

## 📝 **COMANDOS ÚTEIS:**
```bash
# Subir aplicação
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar aplicação
docker-compose -f docker-compose.dev.yml down
```

---
*Arquivo atualizado em: 2025-10-13 15:42*
