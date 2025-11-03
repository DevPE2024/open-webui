/**
 * =====================================================
 * AFFINIFY TRACKER - Client-Side Analytics
 * =====================================================
 * Versão: 1.0.0
 * Data: 03/11/2025
 * 
 * Tracking automático para as 6 aplicações Affinify:
 * - Prodify
 * - OpenUIX
 * - JazzUp
 * - Perplexica
 * - TestPath
 * - Comunidade
 * =====================================================
 */

(function() {
  'use strict';

  // =====================================================
  // CONFIGURAÇÃO
  // =====================================================
  
  const CONFIG = {
    // URL da API de tracking (Monitor)
    apiUrl: window.AFFINIFY_TRACKER_API || 'http://localhost:3003/api/track',
    
    // ID da aplicação (deve ser configurado em cada app)
    appId: window.AFFINIFY_APP_ID || 'unknown',
    appName: window.AFFINIFY_APP_NAME || 'Unknown App',
    
    // Configurações de tracking
    autoTrackPageviews: true,
    autoTrackClicks: false,
    autoTrackForms: false,
    
    // Debounce para evitar múltiplos eventos
    debounceMs: 300,
    
    // Timeout para requisições
    requestTimeout: 5000,
    
    // Debug mode
    debug: window.AFFINIFY_DEBUG || false
  };

  // =====================================================
  // UTILITÁRIOS
  // =====================================================
  
  /**
   * Log de debug
   */
  function log(...args) {
    if (CONFIG.debug) {
      console.log('[Affinify Tracker]', ...args);
    }
  }

  /**
   * Log de erro
   */
  function logError(...args) {
    console.error('[Affinify Tracker]', ...args);
  }

  /**
   * Gerar UUID v4
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Obter ou criar session ID
   */
  function getSessionId() {
    const SESSION_KEY = 'affinify_session_id';
    const SESSION_DURATION = 30 * 60 * 1000; // 30 minutos
    
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      const timestamp = localStorage.getItem(SESSION_KEY + '_timestamp');
      
      if (stored && timestamp) {
        const elapsed = Date.now() - parseInt(timestamp);
        if (elapsed < SESSION_DURATION) {
          // Atualizar timestamp
          localStorage.setItem(SESSION_KEY + '_timestamp', Date.now().toString());
          return stored;
        }
      }
      
      // Criar nova sessão
      const sessionId = generateUUID();
      localStorage.setItem(SESSION_KEY, sessionId);
      localStorage.setItem(SESSION_KEY + '_timestamp', Date.now().toString());
      
      log('Nova sessão criada:', sessionId);
      return sessionId;
      
    } catch (e) {
      // Fallback se localStorage não estiver disponível
      logError('Erro ao acessar localStorage:', e);
      return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
  }

  /**
   * Obter user ID (se logado)
   */
  function getUserId() {
    try {
      // Tentar obter do localStorage (padrão das apps)
      const userId = localStorage.getItem('user_id') || 
                     localStorage.getItem('userId') ||
                     sessionStorage.getItem('user_id') ||
                     sessionStorage.getItem('userId');
      
      return userId || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Obter email do usuário (se disponível)
   */
  function getUserEmail() {
    try {
      const email = localStorage.getItem('user_email') || 
                    localStorage.getItem('userEmail') ||
                    sessionStorage.getItem('user_email') ||
                    sessionStorage.getItem('userEmail');
      
      return email || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Obter plano do usuário (se disponível)
   */
  function getUserPlan() {
    try {
      const plan = localStorage.getItem('user_plan') || 
                   localStorage.getItem('userPlan') ||
                   sessionStorage.getItem('user_plan') ||
                   sessionStorage.getItem('userPlan');
      
      return plan || 'free';
    } catch (e) {
      return 'free';
    }
  }

  // =====================================================
  // DETECÇÃO DE DEVICE E BROWSER
  // =====================================================
  
  /**
   * Detectar tipo de device
   */
  function getDeviceType() {
    const ua = navigator.userAgent;
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Detectar browser
   */
  function getBrowser() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = '';
    
    if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || '';
    } else if (ua.indexOf('Edg') > -1) {
      browser = 'Edge';
      version = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || '';
    } else if (ua.indexOf('Chrome') > -1) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || '';
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari';
      version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || '';
    } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
      browser = 'Internet Explorer';
      version = ua.match(/(?:MSIE |rv:)(\d+\.\d+)/)?.[1] || '';
    }
    
    return { browser, version };
  }

  /**
   * Detectar sistema operacional
   */
  function getOS() {
    const ua = navigator.userAgent;
    let os = 'Unknown';
    let version = '';
    
    if (ua.indexOf('Win') > -1) {
      os = 'Windows';
      if (ua.indexOf('Windows NT 10.0') > -1) version = '10';
      else if (ua.indexOf('Windows NT 6.3') > -1) version = '8.1';
      else if (ua.indexOf('Windows NT 6.2') > -1) version = '8';
      else if (ua.indexOf('Windows NT 6.1') > -1) version = '7';
    } else if (ua.indexOf('Mac') > -1) {
      os = 'MacOS';
      version = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
    } else if (ua.indexOf('Linux') > -1) {
      os = 'Linux';
    } else if (ua.indexOf('Android') > -1) {
      os = 'Android';
      version = ua.match(/Android (\d+\.\d+)/)?.[1] || '';
    } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
      os = 'iOS';
      version = ua.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
    }
    
    return { os, version };
  }

  /**
   * Obter resolução da tela
   */
  function getScreenResolution() {
    return `${screen.width}x${screen.height}`;
  }

  /**
   * Obter timezone
   */
  function getTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return 'Unknown';
    }
  }

  /**
   * Obter idioma
   */
  function getLanguage() {
    return navigator.language || navigator.userLanguage || 'en-US';
  }

  // =====================================================
  // DETECÇÃO DE UTM PARAMETERS
  // =====================================================
  
  /**
   * Extrair UTM parameters da URL
   */
  function getUTMParameters() {
    const params = new URLSearchParams(window.location.search);
    
    return {
      utm_source: params.get('utm_source') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_campaign: params.get('utm_campaign') || null,
      utm_term: params.get('utm_term') || null,
      utm_content: params.get('utm_content') || null
    };
  }

  /**
   * Salvar UTM parameters na sessão
   */
  function saveUTMParameters() {
    const utm = getUTMParameters();
    
    // Se houver UTM parameters, salvar no sessionStorage
    if (utm.utm_source || utm.utm_medium || utm.utm_campaign) {
      try {
        sessionStorage.setItem('affinify_utm', JSON.stringify(utm));
        log('UTM parameters salvos:', utm);
      } catch (e) {
        logError('Erro ao salvar UTM parameters:', e);
      }
    }
  }

  /**
   * Obter UTM parameters salvos
   */
  function getSavedUTMParameters() {
    try {
      const saved = sessionStorage.getItem('affinify_utm');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      logError('Erro ao recuperar UTM parameters:', e);
    }
    
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null
    };
  }

  // =====================================================
  // COLETA DE DADOS
  // =====================================================
  
  /**
   * Coletar dados base para tracking
   */
  function collectBaseData() {
    const browserInfo = getBrowser();
    const osInfo = getOS();
    const utm = getSavedUTMParameters();
    
    return {
      // Sessão e usuário
      session_id: getSessionId(),
      user_id: getUserId(),
      user_email: getUserEmail(),
      user_plan: getUserPlan(),
      
      // Aplicação
      app_id: CONFIG.appId,
      app_name: CONFIG.appName,
      
      // Página
      page_url: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
      referrer: document.referrer || null,
      
      // UTM Parameters
      ...utm,
      
      // Device e Browser
      device_type: getDeviceType(),
      browser: browserInfo.browser,
      browser_version: browserInfo.version,
      os: osInfo.os,
      os_version: osInfo.version,
      screen_resolution: getScreenResolution(),
      
      // Localização e idioma
      timezone: getTimezone(),
      language: getLanguage(),
      
      // Timestamp
      timestamp: new Date().toISOString()
    };
  }

  // =====================================================
  // ENVIO DE DADOS
  // =====================================================
  
  /**
   * Enviar evento para API
   */
  function sendEvent(eventData) {
    const data = {
      ...collectBaseData(),
      ...eventData
    };
    
    log('Enviando evento:', data);
    
    // Usar sendBeacon se disponível (mais confiável)
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const sent = navigator.sendBeacon(CONFIG.apiUrl, blob);
        
        if (sent) {
          log('Evento enviado via sendBeacon');
          return Promise.resolve();
        }
      } catch (e) {
        logError('Erro ao usar sendBeacon:', e);
      }
    }
    
    // Fallback para fetch
    return fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      keepalive: true // Manter requisição mesmo se página fechar
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      log('Evento enviado via fetch');
      return response.json();
    })
    .catch(error => {
      logError('Erro ao enviar evento:', error);
      throw error;
    });
  }

  // =====================================================
  // TRACKING DE EVENTOS
  // =====================================================
  
  /**
   * Track pageview
   */
  function trackPageview() {
    sendEvent({
      event_type: 'pageview',
      event_name: 'Page View'
    });
  }

  /**
   * Track evento customizado
   */
  function trackEvent(eventType, eventName, customData = {}) {
    sendEvent({
      event_type: eventType,
      event_name: eventName,
      custom_data: customData
    });
  }

  /**
   * Track signup
   */
  function trackSignup(userData = {}) {
    sendEvent({
      event_type: 'signup',
      event_name: 'User Signup',
      custom_data: userData
    });
  }

  /**
   * Track login
   */
  function trackLogin(userData = {}) {
    sendEvent({
      event_type: 'login',
      event_name: 'User Login',
      custom_data: userData
    });
  }

  /**
   * Track upgrade (conversão)
   */
  function trackUpgrade(planData = {}) {
    sendEvent({
      event_type: 'upgrade',
      event_name: 'Plan Upgrade',
      custom_data: planData
    });
  }

  /**
   * Track uso de feature
   */
  function trackFeatureUse(featureName, featureData = {}) {
    sendEvent({
      event_type: 'feature_use',
      event_name: featureName,
      custom_data: featureData
    });
  }

  // =====================================================
  // AUTO-TRACKING
  // =====================================================
  
  /**
   * Inicializar auto-tracking de pageviews
   */
  function initAutoPageviewTracking() {
    // Track pageview inicial
    trackPageview();
    
    // Track mudanças de URL (SPA)
    let lastUrl = window.location.href;
    
    // Observar mudanças no history
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        trackPageview();
      }
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        trackPageview();
      }
    };
    
    // Observar popstate (botão voltar/avançar)
    window.addEventListener('popstate', function() {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        trackPageview();
      }
    });
    
    log('Auto-tracking de pageviews inicializado');
  }

  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================
  
  /**
   * Inicializar tracker
   */
  function init() {
    log('Inicializando Affinify Tracker...');
    log('App:', CONFIG.appName, '(' + CONFIG.appId + ')');
    log('API:', CONFIG.apiUrl);
    
    // Salvar UTM parameters se presentes
    saveUTMParameters();
    
    // Inicializar auto-tracking
    if (CONFIG.autoTrackPageviews) {
      initAutoPageviewTracking();
    }
    
    log('Tracker inicializado com sucesso!');
  }

  // =====================================================
  // API PÚBLICA
  // =====================================================
  
  window.AffinifyTracker = {
    // Métodos de tracking
    trackPageview,
    trackEvent,
    trackSignup,
    trackLogin,
    trackUpgrade,
    trackFeatureUse,
    
    // Utilitários
    getSessionId,
    getUserId,
    
    // Configuração
    config: CONFIG,
    
    // Versão
    version: '1.0.0'
  };

  // =====================================================
  // AUTO-INICIALIZAÇÃO
  // =====================================================
  
  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
