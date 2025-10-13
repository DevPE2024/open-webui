# Build customizado para OpenUIX
FROM ghcr.io/open-webui/open-webui:main

# Copiar arquivos modificados
COPY src/app.html /app/src/app.html
COPY src/lib/i18n/locales/en-US/translation.json /app/src/lib/i18n/locales/en-US/translation.json
COPY src/lib/components/common/SensitiveInput.svelte /app/src/lib/components/common/SensitiveInput.svelte
COPY static/favicon.png /app/static/favicon.png
COPY static/static/favicon.png /app/static/static/favicon.png
COPY custom-branding/ /app/backend/static/custom/

# Expor porta
EXPOSE 8082

# Comando padrão
CMD ["bash", "/app/backend/start.sh"]