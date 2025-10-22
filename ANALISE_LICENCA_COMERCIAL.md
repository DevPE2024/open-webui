# Análise da Licença Open WebUI para Comercialização

## ⚠️ **ALERTA LEGAL IMPORTANTE**

### Cláusula de Branding (Cláusula 4)

A licença do Open WebUI **PROÍBE** alterar o branding, exceto em casos específicos:

**Texto da Licença:**
> "licensees are strictly prohibited from altering, removing, obscuring, or replacing any 'Open WebUI' branding, including but not limited to the name, logo, or any visual, textual, or symbolic identifiers..."

### ✅ **QUANDO VOCÊ PODE Alterar o Branding:**

#### Opção 1: Menos de 50 Usuários (✅ VOCÊ PODE)

**Cláusula 5(i):**
> "deployments or distributions where the total number of end users (defined as individual natural persons with direct access to the application) does not exceed fifty (50) within any rolling thirty (30) day period"

**Significa:**
- ✅ Se sua aplicação tiver **MENOS de 50 usuários** em qualquer período de 30 dias
- ✅ Você PODE remover/alterar o branding "Open WebUI"
- ✅ Você PODE usar "OpenUIX" como nome
- ✅ Você PODE usar "AO" como símbolo
- ✅ Você PODE comercializar

#### Opção 2: Contribuidor Oficial (Difícil)

**Cláusula 5(ii):**
- Você precisa ter código aceito no repositório oficial
- Precisa de permissão por escrito do autor
- **NÃO RECOMENDADO** para uso comercial rápido

#### Opção 3: Licença Enterprise (Pago)

**Cláusula 5(iii):**
- Comprar licença enterprise do Open WebUI
- Permite branding customizado sem limite de usuários
- Suporte técnico oficial
- **Site:** https://openwebui.com/

### 🚫 **O QUE VOCÊ NÃO PODE FAZER:**

Se você tiver **MAIS de 50 usuários**:
- ❌ NÃO pode remover "Open WebUI" do branding
- ❌ NÃO pode usar apenas "OpenUIX"
- ❌ Violação = Quebra de licença = Possíveis ações legais

## 📊 **RECOMENDAÇÃO PARA COMERCIALIZAÇÃO**

### Cenário 1: Startup/MVP (< 50 usuários)

**Você PODE comercializar assim:**
- ✅ Use "OpenUIX" como nome
- ✅ Remova branding "Open WebUI"
- ✅ Use símbolo "AO"
- ✅ **LEGAL e PERMITIDO pela licença**

**Documentação necessária:**
- Manter registro de número de usuários
- Garantir que não ultrapasse 50 usuários/30 dias
- Ter documentação que prove compliance

### Cenário 2: Crescimento (50-500 usuários)

**Opções:**
1. **Manter branding "Open WebUI"** + seu nome:
   - "OpenUIX powered by Open WebUI"
   - ✅ Legal
   - ❌ Menos exclusivo

2. **Comprar licença enterprise:**
   - Custo: Consultar Open WebUI
   - ✅ Branding 100% customizado
   - ✅ Suporte oficial

### Cenário 3: Escala (> 500 usuários)

**OBRIGATÓRIO:**
- 🔴 Licença Enterprise do Open WebUI
- Ou manter branding original

## 🔧 **POR QUE AS MUDANÇAS NÃO APARECEM?**

### Problema Técnico

**As mudanças nos arquivos fonte não aparecem porque:**

1. **A imagem Docker usa código PRÉ-COMPILADO**
   - A imagem `ghcr.io/open-webui/open-webui:main` já tem o frontend compilado
   - Mudanças em arquivos `.svelte`, `.ts`, `.json` não afetam a imagem

2. **É necessário REBUILD do frontend:**
   - Executar `npm run build` para gerar novos arquivos compilados
   - Montar o diretório `./build` via Docker
   - **OU** criar uma imagem Docker customizada

3. **O build está falhando:**
   - Falta o módulo `@tiptap/suggestion`
   - Conflitos de dependências no package.json
   - Instalamos o módulo, mas o build precisa completar

### O Que Funciona AGORA (Sem Build)

Com a configuração atual via **variáveis de ambiente**:
- ✅ Nome: "OpenUIX" (em alguns lugares)
- ✅ Idioma: Inglês
- ✅ Integração com LiteLLM

**Mas ainda mostra:**
- ⚠️ "Open WebUI" em alguns lugares (requer build)
- ⚠️ Favicon original "OI" (requer build)

## 📝 **RESUMO PARA COMERCIALIZAÇÃO**

### ✅ **VOCÊ PODE COMERCIALIZAR SE:**

1. **Tiver menos de 50 usuários ativos por mês**
   - Use "OpenUIX" puro
   - Remova todo branding "Open WebUI"
   - **LEGAL conforme Cláusula 5(i)**

2. **Mantiver o branding "Open WebUI"**
   - Use "OpenUIX powered by Open WebUI"
   - Mencione Open WebUI nos créditos
   - **LEGAL para qualquer número de usuários**

3. **Comprar licença enterprise**
   - Branding 100% customizado
   - Qualquer número de usuários
   - **LEGAL com suporte oficial**

### ❌ **VOCÊ NÃO PODE:**

- Remover "Open WebUI" completamente com mais de 50 usuários sem licença enterprise
- Vender como produto totalmente próprio sem mencionar Open WebUI (se > 50 usuários)

## 🎯 **RECOMENDAÇÃO FINAL**

Para **comercializar imediatamente**:

1. ✅ **Mantenha < 50 usuários** inicialmente
2. ✅ Use branding "OpenUIX" 
3. ✅ Documente o número de usuários
4. ✅ Quando crescer, **migre para licença enterprise**

**Isso é 100% LEGAL e está de acordo com a licença!**



