# 🎨 GUIA DE BRANDING - OpenUIX

**Data:** 13/10/2025  
**Aplicação:** OpenUIX (Powered by Open WebUI)

---

## ⚠️ IMPORTANTE: CONFORMIDADE DE LICENÇA

Conforme análise em `CONFORMIDADE_COMERCIAL.md`, existem **restrições de licença** para alteração de branding.

### ✅ Estratégia Aprovada: 
**"OpenUIX Enterprise - Powered by Open WebUI"**

- **Manter branding "Open WebUI" visível**
- **Adicionar "OpenUIX" como marca de serviço**
- Comercializar como serviço gerenciado premium

---

## 📁 ESTRUTURA DE ARQUIVOS

```
OpenUIX/
├── custom-branding/
│   ├── Gemini_Generated_Image_67xz7867xz7867xz.png  (Logo 1)
│   ├── Gemini_Generated_Image_j0orhlj0orhlj0or.png  (Logo 2)
│   ├── Gemini_Generated_Image_k4c1yyk4c1yyk4c1.png  (Logo 3)
│   └── Gemini_Generated_Image_rmmlzzrmmlzzrmml.png  (Logo 4)
├── docker-compose.openui.yml
└── GUIA_BRANDING.md (este arquivo)
```

---

## 🎯 CONFIGURAÇÃO DE BRANDING

### 1. **Logo Principal**

**Recomendação:** Escolha uma das 4 imagens fornecidas como logo principal.

**Opções disponíveis:**
- `Gemini_Generated_Image_67xz7867xz7867xz.png`
- `Gemini_Generated_Image_j0orhlj0orhlj0or.png`
- `Gemini_Generated_Image_k4c1yyk4c1yyk4c1.png`
- `Gemini_Generated_Image_rmmlzzrmmlzzrmml.png`

**Renomear para uso:**
```bash
# Escolha uma imagem e renomeie:
cd custom-branding
copy Gemini_Generated_Image_67xz7867xz7867xz.png logo-openui.png
```

---

### 2. **Variantes de Logo Necessárias**

Para melhor apresentação, crie variantes:

```
custom-branding/
├── logo.png           (Logo principal - modo claro)
├── logo-dark.png      (Logo para modo escuro)
├── logo-light.png     (Logo para modo claro - alternativa)
├── favicon.ico        (Ícone do navegador)
└── splash.png         (Tela de carregamento)
```

**Criar variantes:**
```bash
# Dentro de custom-branding/
copy logo-openui.png logo.png
copy logo-openui.png logo-dark.png
copy logo-openui.png logo-light.png
```

---

### 3. **Configuração no Docker Compose**

O arquivo `docker-compose.openui.yml` já está configurado com volume para branding:

```yaml
volumes:
  - ./custom-branding:/app/backend/static/custom
```

**Variáveis de ambiente para personalização:**

```yaml
environment:
  - WEBUI_NAME=OpenUIX Enterprise
  - WEBUI_FAVICON_URL=/static/custom/favicon.ico
  - WEBUI_LOGO_URL=/static/custom/logo.png
  - WEBUI_LOGO_DARK_URL=/static/custom/logo-dark.png
  - WEBUI_LOGO_LIGHT_URL=/static/custom/logo-light.png
```

---

### 4. **Texto de Branding (Conformidade)**

**❌ NÃO FAZER:**
```
WEBUI_NAME=OpenUIX
```

**✅ FAZER (Conforme licença):**
```
WEBUI_NAME=OpenUIX - Powered by Open WebUI
```

**Outras opções conformes:**
- `OpenUIX Enterprise (Open WebUI)`
- `OpenUIX | Built on Open WebUI`
- `Open WebUI - OpenUIX Edition`

---

## 🚀 IMPLEMENTAÇÃO PASSO A PASSO

### Passo 1: Preparar Logos

```powershell
# Navegar para pasta de branding
cd OpenUIX\custom-branding

# Selecionar e renomear logo principal (escolha uma)
copy Gemini_Generated_Image_67xz7867xz7867xz.png logo.png
copy Gemini_Generated_Image_67xz7867xz7867xz.png logo-dark.png
copy Gemini_Generated_Image_67xz7867xz7867xz.png logo-light.png

# Criar favicon (pode usar ferramenta online para converter PNG para ICO)
# Ou usar: https://www.icoconverter.com/
```

### Passo 2: Atualizar Docker Compose

Editar `docker-compose.openui.yml`:

```yaml
services:
  open-webui:
    environment:
      # Branding (Conforme Licença)
      - WEBUI_NAME=OpenUIX - Powered by Open WebUI
      - WEBUI_FAVICON_URL=/static/custom/favicon.ico
      - WEBUI_LOGO_URL=/static/custom/logo.png
      - WEBUI_LOGO_DARK_URL=/static/custom/logo-dark.png
      - WEBUI_LOGO_LIGHT_URL=/static/custom/logo-light.png
      
      # Customização adicional
      - WEBUI_DESCRIPTION=Plataforma empresarial de IA com múltiplos modelos LLM
      - WEBUI_SUPPORT_EMAIL=suporte@openui.com
```

### Passo 3: Customização CSS (Opcional)

Criar arquivo `custom-branding/custom.css`:

```css
/* Cores corporativas */
:root {
  --primary-color: #your-brand-color;
  --secondary-color: #your-secondary-color;
}

/* Logo customizado */
.logo-container {
  /* Seus estilos */
}

/* Manter créditos Open WebUI visíveis (Conformidade) */
.powered-by {
  display: block !important;
  opacity: 1 !important;
}
```

Adicionar no docker-compose:
```yaml
volumes:
  - ./custom-branding/custom.css:/app/backend/static/custom/custom.css
```

---

## 🎨 RECOMENDAÇÕES DE DESIGN

### Logo Principal
- **Formato:** PNG com transparência
- **Dimensões:** 512x512px (ideal)
- **Fundo:** Transparente
- **Cores:** Compatível com modo claro e escuro

### Favicon
- **Formato:** ICO ou PNG
- **Dimensões:** 32x32px ou 64x64px
- **Cores:** Simplificado, alta legibilidade

### Splash Screen
- **Formato:** PNG ou WebP
- **Dimensões:** 1920x1080px (Full HD)
- **Design:** Incluir logo + loading indicator

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Branding Básico
- [ ] Escolher logo principal das 4 opções
- [ ] Criar variantes (logo.png, logo-dark.png, logo-light.png)
- [ ] Criar ou converter favicon.ico
- [ ] Atualizar WEBUI_NAME com créditos Open WebUI
- [ ] Configurar variáveis de ambiente no Docker Compose

### Branding Avançado (Opcional)
- [ ] Criar splash screen personalizada
- [ ] Desenvolver custom.css
- [ ] Adicionar meta tags personalizadas
- [ ] Configurar PWA manifest
- [ ] Criar documentação de marca

### Conformidade Legal
- [ ] Verificar que "Open WebUI" está visível
- [ ] Manter créditos originais
- [ ] Não ocultar/remover branding Open WebUI
- [ ] Documentar conformidade

---

## 🔧 TROUBLESHOOTING

### Logo não aparece
```bash
# Verificar permissões
ls -la custom-branding/

# Verificar volume montado
docker exec openui-app ls /app/backend/static/custom/
```

### Branding não atualiza
```bash
# Limpar cache do container
docker-compose -f docker-compose.openui.yml down
docker-compose -f docker-compose.openui.yml up -d --force-recreate
```

### CSS customizado não aplica
```yaml
# Adicionar no docker-compose:
environment:
  - WEBUI_CUSTOM_CSS_URL=/static/custom/custom.css
```

---

## 📊 MONITORAMENTO DE CONFORMIDADE

### Verificação Periódica
1. ✅ Branding "Open WebUI" está visível?
2. ✅ Créditos originais estão presentes?
3. ✅ Logs não mostram tentativas de ocultação?
4. ✅ Documentação reflete conformidade?

### Auditoria Anual
- Revisar conformidade com licença
- Atualizar documentação de branding
- Verificar mudanças na licença upstream
- Consultar advogado se necessário

---

## 📞 SUPORTE E RECURSOS

### Open WebUI
- **Documentação:** https://docs.openwebui.com/
- **Discord:** https://discord.gg/5rJgQTnV4s
- **GitHub:** https://github.com/open-webui/open-webui

### Licença Enterprise
- **Email:** sales@openwebui.com
- **Docs:** https://docs.openwebui.com/enterprise

---

## 🎯 PRÓXIMOS PASSOS

1. **Escolher logo principal** das 4 opções disponíveis
2. **Renomear e organizar** arquivos de branding
3. **Atualizar docker-compose.openui.yml** com configurações
4. **Testar** branding em ambiente de desenvolvimento
5. **Validar conformidade** com licença
6. **Deploy** em produção

---

**✨ Lembre-se:** Um branding bem implementado e em conformidade legal é fundamental para o sucesso comercial do OpenUIX!

