# 🔗 INTEGRAÇÃO PRODIFY - SSO (Single Sign-On)

**Data:** 13/10/2025  
**Status:** ✅ Implementado e Funcional

---

## 🎯 **O QUE FOI IMPLEMENTADO?**

Sistema de **autenticação integrada** entre **Prodify** e **OpenUIX Enterprise**.

### **Funcionamento:**
- Usuários cadastrados no **Prodify** podem fazer login no **OpenUIX** automaticamente
- **SSO (Single Sign-On):** Uma única conta para ambas aplicações
- **Sincronização automática:** Dados do usuário são sincronizados entre os sistemas

---

## 🔄 **COMO FUNCIONA O FLUXO DE AUTENTICAÇÃO?**

```
1. Usuário tenta fazer login no OpenUIX
   ↓
2. Sistema verifica PRIMEIRO no banco do Prodify (PostgreSQL)
   ↓
3. Se usuário existir no Prodify:
   - ✅ Valida senha usando bcrypt
   - ✅ Cria/atualiza usuário no OpenUIX
   - ✅ Autentica e retorna token
   ↓
4. Se NÃO existir no Prodify:
   - Tenta autenticar localmente no OpenUIX (SQLite)
   - Funciona como fallback
```

---

## 📊 **ESTRUTURA DE DADOS**

### **Prodify (PostgreSQL - Porta 8010)**
```sql
User {
  id: String (CUID)
  name: String
  surname: String?
  username: String (único)
  email: String (único)
  hashedPassword: String  -- bcrypt hash
  image: String?
}
```

### **OpenUIX (SQLite)**
```sql
User {
  id: String
  name: String
  email: String (único)
  username: String?
  role: String  -- admin, user, pending
  profile_image_url: String
}

Auth {
  id: String
  email: String
  password: String  -- bcrypt hash
}
```

---

## 🔧 **CONFIGURAÇÃO**

### **Variáveis de Ambiente (docker-compose.dev.yml)**

```yaml
# 🔗 INTEGRAÇÃO PRODIFY - SSO
- PRODIFY_AUTH_ENABLED=true            # Habilitar integração
- PRODIFY_DB_HOST=host.docker.internal # Host do PostgreSQL
- PRODIFY_DB_PORT=8010                 # Porta do PostgreSQL
- PRODIFY_DB_NAME=super_productive     # Nome do banco
- PRODIFY_DB_USER=postgres             # Usuário do banco
- PRODIFY_DB_PASSWORD=password         # Senha do banco
```

---

## 📝 **ARQUIVOS CRIADOS/MODIFICADOS**

### **1. Novo Arquivo: `backend/open_webui/utils/prodify_auth.py`**
```python
- ProdifyAuth.get_connection()             # Conecta ao PostgreSQL do Prodify
- ProdifyAuth.get_user_by_email()          # Busca usuário por email
- ProdifyAuth.get_user_by_username()       # Busca usuário por username  
- ProdifyAuth.verify_password()            # Verifica senha bcrypt
- ProdifyAuth.authenticate_prodify_user()  # Autentica usuário completo
```

### **2. Modificado: `backend/open_webui/models/auths.py`**
```python
# Função authenticate_user() modificada para:
1. Tentar autenticar no Prodify primeiro
2. Se encontrar, criar/sincronizar usuário no OpenUIX
3. Se não encontrar, autenticar localmente (fallback)
```

### **3. Atualizado: `docker-compose.dev.yml`**
```yaml
# Adicionadas variáveis de ambiente para conexão Prodify
```

---

## 🚀 **COMO USAR?**

### **Cenário 1: Usuário Já Existe no Prodify**

1. **Usuário acessa:** http://localhost:5050
2. **Tela de login:** Insere email/senha do Prodify
3. **Sistema verifica:**
   - Busca no banco do Prodify (PostgreSQL)
   - Valida senha
   - Cria conta no OpenUIX automaticamente
4. **Login com sucesso!** ✅

**Dados sincronizados:**
- Nome completo (name + surname)
- Email
- Username
- Imagem de perfil
- Primeiro usuário do Prodify vira **admin** no OpenUIX

---

### **Cenário 2: Usuário Só Existe no OpenUIX**

1. **Usuário acessa:** http://localhost:5050
2. **Sistema verifica:**
   - Não encontra no Prodify
   - Busca no banco local (SQLite)
3. **Login local funciona normalmente** ✅

---

### **Cenário 3: Novo Usuário**

1. **Criar conta no Prodify primeiro**
2. **Fazer login no OpenUIX**
3. **Conta sincronizada automaticamente** ✅

---

## 🔐 **SEGURANÇA**

### **✅ Pontos de Segurança:**

1. **Senhas Criptografadas:**
   - Prodify usa **bcrypt** para hash
   - OpenUIX usa **bcrypt** para hash
   - Senhas nunca armazenadas em texto plano

2. **Validação Dupla:**
   - Verifica email/username
   - Valida senha criptografada

3. **Fallback Seguro:**
   - Se Prodify DB estiver offline, autenticação local funciona
   - Logs de erro detalhados

4. **Roles/Permissões:**
   - Primeiro usuário do Prodify → admin no OpenUIX
   - Demais usuários → user (padrão)

---

## 📋 **DEPENDÊNCIAS**

### **Python Packages:**
```python
psycopg2-binary==2.9.9  # Conexão PostgreSQL (já instalado)
bcrypt==4.3.0           # Hash de senhas (já instalado)
```

### **Banco de Dados:**
- **Prodify PostgreSQL:** Porta 8010
- **OpenUIX SQLite:** Local (padrão)

---

## 🧪 **TESTAR INTEGRAÇÃO**

### **1. Verificar Prodify DB está rodando:**
```bash
docker ps --filter name=super-productive-db
```

### **2. Criar usuário de teste no Prodify:**
```sql
-- Ver arquivo: Prodify/super_productive-desh/create_test_user.sql
```

### **3. Testar Login no OpenUIX:**
```
1. Acessar: http://localhost:5050
2. Email: test@test.com
3. Senha: test123
4. Deve logar automaticamente!
```

### **4. Verificar Logs:**
```bash
docker logs openui-dev --tail=50 | grep "Prodify"
```

**Logs esperados:**
```
✅ Usuário autenticado no Prodify: test@test.com
Sincronizando usuário existente: test@test.com
```
Ou:
```
✅ Usuário autenticado no Prodify: test@test.com
Criando novo usuário do Prodify no OpenUIX: test@test.com
✅ Usuário do Prodify criado no OpenUIX: test@test.com
```

---

## ⚙️ **CONFIGURAÇÕES AVANÇADAS**

### **Desabilitar Integração Prodify:**
```yaml
# docker-compose.dev.yml
- PRODIFY_AUTH_ENABLED=false  # Desabilitar
```

### **Usar PostgreSQL Remoto:**
```yaml
- PRODIFY_DB_HOST=192.168.1.100  # IP remoto
- PRODIFY_DB_PORT=5432           # Porta padrão
```

### **Logs de Debug:**
```yaml
- LOG_LEVEL=debug
```

---

## 🔍 **TROUBLESHOOTING**

### **Problema: "Erro ao conectar ao Prodify DB"**
**Solução:**
```bash
# Verificar se Prodify DB está rodando
docker ps | grep super-productive-db

# Verificar porta
docker port super-productive-db-dev
```

### **Problema: "Senha incorreta para usuário do Prodify"**
**Solução:**
- Verificar se a senha está correta no Prodify
- Hash bcrypt deve estar correto no banco

### **Problema: "psycopg2 não está instalado"**
**Solução:**
```bash
# Rebuild container com dependências postgres
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## 📊 **STATUS DA INTEGRAÇÃO**

| Recurso | Status | Observação |
|---------|--------|------------|
| **Autenticação Prodify** | ✅ Implementado | SSO funcional |
| **Sincronização de Dados** | ✅ Implementado | Nome, email, imagem |
| **Fallback Local** | ✅ Implementado | Se Prodify offline |
| **Verificação bcrypt** | ✅ Implementado | Senhas seguras |
| **Variáveis de Ambiente** | ✅ Configurado | Via docker-compose |
| **Logs Detalhados** | ✅ Implementado | Debug completo |

---

## ✅ **BENEFÍCIOS**

### **Para Usuários:**
- ✅ **Login Único:** Uma conta para Prodify e OpenUIX
- ✅ **Sem Recadastro:** Usa conta do Prodify automaticamente
- ✅ **Sincronização:** Dados sempre atualizados

### **Para Administradores:**
- ✅ **Gestão Centralizada:** Gerenciar usuários no Prodify
- ✅ **Segurança:** Autenticação unificada
- ✅ **Escalabilidade:** Fácil adicionar mais apps

---

## 🎯 **PRÓXIMOS PASSOS (Opcional)**

### **Melhorias Futuras:**
1. **Sincronização Bidirecional:**
   - Criar webhook para sincronizar mudanças do Prodify → OpenUIX
   
2. **OAuth 2.0:**
   - Implementar OAuth completo para SSO enterprise

3. **Perfis Compartilhados:**
   - Sincronizar avatar, bio, preferências

4. **Audit Log:**
   - Registrar tentativas de login de ambos sistemas

---

## 📚 **REFERÊNCIAS**

- **Prodify Schema:** `Prodify/super_productive-desh/prisma/schema.prisma`
- **OpenUIX Auth:** `OpenUIX/backend/open_webui/models/auths.py`
- **Prodify Auth:** `OpenUIX/backend/open_webui/utils/prodify_auth.py`
- **Docker Compose:** `OpenUIX/docker-compose.dev.yml`

---

**🎉 Integração Prodify-OpenUIX Concluída e Funcional!**

Usuários do Prodify podem agora fazer login no OpenUIX automaticamente! 🚀

