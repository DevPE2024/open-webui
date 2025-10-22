# Implementação de Customização OpenUIX

## Resumo das Mudanças

### Arquivos Modificados

1. **`src/lib/constants.ts`**
   - `APP_NAME = 'OpenUIX'`

2. **`static/static/site.webmanifest`**
   - `name: "OpenUIX"`
   - `short_name: "AO"`

3. **`backend/open_webui/static/site.webmanifest`**
   - `name: "OpenUIX"`
   - `short_name: "AO"`

4. **`static/opensearch.xml`**
   - `ShortName: "OpenUIX"`

5. **`src/lib/i18n/locales/en-US/translation.json`**
   - Traduções em inglês aplicadas

6. **`src/lib/components/common/SensitiveInput.svelte`**
   - Símbolo "AO" no botão de visibilidade de senha

### Arquivos Criados

1. **`.dockerignore`**
   - Ignora arquivos desnecessários no build

2. **`Dockerfile.custom`**
   - Build multi-stage:
     - Stage 1: Build do frontend com Node.js
     - Stage 2: Copia build customizado para imagem Open WebUI

3. **`docker-compose.dev.yml` (atualizado)**
   - Usa `Dockerfile.custom` para build
   - Adiciona `DEFAULT_LOCALE=en-US`

## Comandos de Build e Deploy

### Build da Imagem Customizada

```bash
cd OpenUIX
docker-compose -f docker-compose.dev.yml build
```

### Subir Aplicação

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Verificar Logs

```bash
docker logs openui-dev -f
```

### Parar e Remover Volumes

```bash
docker-compose -f docker-compose.dev.yml down -v
```

## Verificações Pós-Deploy

- [ ] Título da aba mostra "OpenUIX"
- [ ] Favicon mostra "AO"
- [ ] Textos em inglês
- [ ] Logo customizado da empresa
- [ ] Símbolo "AO" no campo de senha

## Nota sobre Licença

⚠️ **IMPORTANTE**: A licença Open WebUI (BSD-3-Clause modificada) proíbe alterar o branding para deployments com mais de 50 usuários, exceto se:

- Você for um contribuidor oficial do projeto
- Você tiver uma licença enterprise

Para uso comercial com mais de 50 usuários, considere obter uma licença enterprise.

## Tempo de Build Estimado

- Build da imagem: 5-15 minutos (dependendo do hardware)
- Deploy: 1-2 minutos
- **Total: 6-17 minutos**



