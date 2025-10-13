# 🌍 CONFIGURAÇÃO DE IDIOMA - OpenUIX Enterprise

**Data:** 13/10/2025  
**Status:** ✅ Configurado para Inglês (en-US)

---

## 📋 **CONFIGURAÇÃO ATUAL**

### ✅ **Idioma Padrão: INGLÊS (en-US)**

A aplicação está configurada para usar **inglês como idioma padrão** em toda a interface.

---

## 🔧 **COMO FUNCIONA?**

### 1. **Sistema de Detecção de Idioma (i18next)**

O OpenUIX usa o **i18next** para internacionalização com a seguinte ordem de prioridade:

```
1. localStorage.locale (idioma salvo pelo usuário)
   ↓
2. backendConfig.default_locale (configuração do servidor)
   ↓
3. navigator.language (idioma do navegador)
   ↓
4. Fallback: en-US
```

### 2. **Configurações Aplicadas no Docker**

No arquivo `docker-compose.dev.yml`:

```yaml
environment:
  # Idioma - FORÇADO para Inglês
  - DEFAULT_LOCALE=en-US
  - FORCE_LOCALE=en-US
```

**O que faz:**
- `DEFAULT_LOCALE=en-US`: Define inglês como idioma padrão do backend
- `FORCE_LOCALE=en-US`: Tentativa de forçar inglês (variável custom)

---

## 🎯 **COMO O USUÁRIO PODE MUDAR O IDIOMA?**

### **Opção 1: Nas Configurações da Interface**

1. **Acesse:** Settings ⚙️ (Configurações)
2. **Vá em:** General (Geral)
3. **Procure por:** "Language" ou "Idioma"
4. **Selecione:** O idioma desejado no dropdown

![image](https://via.placeholder.com/600x100/333/fff?text=Settings+>+General+>+Language)

### **Opção 2: Via localStorage (Desenvolvedor)**

```javascript
// Abrir console do navegador (F12) e executar:
localStorage.setItem('locale', 'en-US');
location.reload();
```

---

## 🌐 **IDIOMAS DISPONÍVEIS**

A aplicação suporta **80+ idiomas**, incluindo:

| Código | Idioma |
|--------|--------|
| **en-US** | English (US) ✅ **PADRÃO** |
| en-GB | English (GB) |
| pt-BR | Portuguese (Brasil) |
| pt-PT | Portuguese (Portugal) |
| es-ES | Spanish (España) |
| fr-FR | French (France) |
| de-DE | German (Deutsch) |
| it-IT | Italian (Italiano) |
| ja-JP | Japanese (日本語) |
| ko-KR | Korean (한국어) |
| zh-CN | Chinese Simplified (简体中文) |
| ... | 70+ outros idiomas |

**Arquivo completo:** `src/lib/i18n/locales/languages.json`

---

## 🔐 **FORÇAR INGLÊS PERMANENTEMENTE**

### **Método 1: Remover Seletor de Idioma (Código)**

Editar: `src/lib/components/chat/Settings/General.svelte`

**Linha 220-238** - Comentar ou remover:

```svelte
<!-- REMOVIDO: Seletor de Idioma
<div class=" flex w-full justify-between">
  <div class=" self-center text-xs font-medium">{$i18n.t('Language')}</div>
  <div class="flex items-center relative">
    <select ...>
      ...
    </select>
  </div>
</div>
-->
```

### **Método 2: Forçar no Frontend (JavaScript)**

Editar: `src/routes/+layout.svelte`

**Linha 593** - Substituir por:

```javascript
// Forçar inglês sempre
initI18n('en-US');
localStorage.setItem('locale', 'en-US'); // Forçar no storage
```

### **Método 3: Configuração de Ambiente (Mais Simples)**

Adicionar ao `docker-compose.dev.yml`:

```yaml
environment:
  - DEFAULT_LOCALE=en-US
  - ENABLE_LOCALE_SELECTION=false  # Desabilitar seleção (se implementado)
```

---

## 📝 **VERIFICAR IDIOMA ATUAL**

### **Via Interface:**
1. Abrir a aplicação: http://localhost:5050
2. Ir em **Settings** → **General**
3. Verificar campo **"Language"**
4. Deve estar: **"English (US)"** ✅

### **Via Console do Navegador (F12):**

```javascript
// Ver idioma atual
console.log(localStorage.getItem('locale'));
// Deve retornar: "en-US" ou null (usa padrão)

// Ver idioma do i18next
console.log(document.documentElement.getAttribute('lang'));
// Deve retornar: "en-US"
```

---

## ⚠️ **IMPORTANTE: PRIMEIRA EXECUÇÃO**

### **Na PRIMEIRA vez que um usuário acessa:**

1. Se não houver `localStorage.locale` definido
2. A aplicação usa `DEFAULT_LOCALE=en-US`
3. O idioma fica **INGLÊS por padrão** ✅

### **Se o usuário JÁ acessou antes:**

1. Se ele mudou o idioma manualmente
2. O `localStorage.locale` pode ter outro valor
3. **Solução:** Limpar cache do navegador ou usar localStorage

---

## 🚀 **TESTAR CONFIGURAÇÃO**

### **Teste 1: Novo Usuário (Navegador Anônimo)**

```bash
1. Abrir navegador em modo anônimo/privado
2. Acessar: http://localhost:5050
3. Verificar: Interface deve estar em INGLÊS ✅
```

### **Teste 2: Forçar Português (Teste)**

```javascript
// Console do navegador (F12)
localStorage.setItem('locale', 'pt-BR');
location.reload();
// Interface muda para Português
```

### **Teste 3: Voltar para Inglês**

```javascript
// Console do navegador (F12)
localStorage.setItem('locale', 'en-US');
location.reload();
// Interface volta para Inglês ✅
```

---

## 📊 **STATUS ATUAL**

| Item | Status | Observação |
|------|--------|------------|
| **Idioma Padrão** | ✅ Inglês (en-US) | Configurado via `DEFAULT_LOCALE` |
| **Seletor de Idioma** | ✅ Habilitado | Usuário pode mudar nas configurações |
| **Fallback** | ✅ Inglês (en-US) | Se idioma não encontrado |
| **Suporte Multi-idioma** | ✅ 80+ idiomas | Via i18next |
| **Forçar Inglês** | ⚠️ Parcial | Padrão é inglês, mas usuário pode mudar |

---

## 🔄 **PRÓXIMOS PASSOS (Opcional)**

### **Para BLOQUEAR mudança de idioma:**

1. **Remover seletor** da interface (Método 1)
2. **Forçar no código** (Método 2)
3. **Rebuild e restart** da aplicação

```bash
# Rebuild necessário após mudanças no código
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## 📚 **REFERÊNCIAS**

- **i18next Docs:** https://www.i18next.com/
- **Open WebUI i18n:** `src/lib/i18n/index.ts`
- **Configurações:** `src/lib/components/chat/Settings/General.svelte`
- **Idiomas disponíveis:** `src/lib/i18n/locales/languages.json`

---

## ✅ **CONCLUSÃO**

### **Estado Atual:**
- ✅ **Idioma padrão configurado para INGLÊS (en-US)**
- ✅ **Novos usuários veem interface em inglês**
- ✅ **Configuração aplicada e funcional**
- ⚠️ **Usuários PODEM mudar idioma manualmente (se desejarem)**

### **Para forçar 100% inglês sem opção de mudança:**
- **Editar código fonte** (remover seletor)
- **Ou** aceitar que é um **padrão sugerido**, mas não imposto

---

**🎯 Aplicação está configurada para INGLÊS como padrão!** ✅

