# Solução Alternativa: Build Local + Docker

## Problema Encontrado

O build dentro do Docker está falhando devido a conflitos de dependências no package.json, especificamente:

1. Conflito entre `@tiptap/extension-bubble-menu@2.26.1` e `@tiptap/core@3.0.7`
2. Módulo `@tiptap/suggestion` não encontrado

## Solução Recomendada

Fazer o **build local** do frontend e montar via volume no Docker.

### Passos:

#### 1. Build Local do Frontend

```bash
cd OpenUIX

# Instalar dependências
npm install --legacy-peer-deps

# Build do frontend
npm run build
```

#### 2. Atualizar docker-compose.dev.yml

Usar a imagem base e montar o build via volume:

```yaml
version: '3.8'

services:
  openui-dev:
    image: ghcr.io/open-webui/open-webui:main
    container_name: openui-dev
    ports:
      - "3003:8080"
    volumes:
      - openui-dev-data:/app/backend/data
      - ./build:/app/build  # Montar build local
      - ./custom-branding:/app/backend/static/custom
      - ./static/favicon.png:/app/backend/static/favicon.png
      - ./static/static/site.webmanifest:/app/backend/static/site.webmanifest
      - ./static/opensearch.xml:/app/backend/static/opensearch.xml
    environment:
      - ENV=development
      - WEBUI_NAME=OpenUIX
      - WEBUI_URL=http://localhost:3003
      - DEFAULT_LOCALE=en-US
      - ENABLE_OPENAI_API=true
      - OPENAI_API_KEY=sk-BKoQlwwMC5KkIu3Lr3S5BA
      - OPENAI_API_BASE_URL=http://host.docker.internal:4000/v1
      - LOG_LEVEL=debug
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped

volumes:
  openui-dev-data:
    driver: local
```

#### 3. Deploy

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Vantagens

- ✅ Evita problemas de dependências do Docker
- ✅ Build mais rápido (usa cache local)
- ✅ Facilita debugging durante desenvolvimento
- ✅ Mudanças no código requerem apenas rebuild local

### Desvantagens

- ❌ Requer Node.js instalado localmente
- ❌ Build manual necessário após mudanças
- ❌ Menos portátil (depende do ambiente local)

## Alternativa: Usar Imagem Base Sem Build

Se o build local também falhar, a última opção é:

1. Usar variáveis de ambiente para customizar o que é possível
2. Aceitar as limitações de branding da licença Open WebUI
3. Considerar obter uma licença enterprise para customização completa



