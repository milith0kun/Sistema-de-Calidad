// Configuración automática de entorno para el WebPanel
import axios from 'axios';

// URL del backend en Dokploy
const DOKPLOY_BACKEND_URL = 'https://api-haccp.ecosdelseo.com';

// Configuraciones por entorno usando variables de entorno
const environments = {
  local: {
    name: 'local',
    apiUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api',
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3000',
    detectUrls: [
      'http://127.0.0.1:3000',
      'http://192.168.1.23:3000',
      'http://192.168.1.100:3000',
      'http://10.0.0.100:3000'
    ],
    timeouts: {
      api: parseInt(import.meta.env.VITE_API_TIMEOUT) || 5000,
      healthCheck: parseInt(import.meta.env.VITE_HEALTH_CHECK_TIMEOUT) || 2000
    }
  },
  production: {
    name: 'production',
    apiUrl: import.meta.env.VITE_API_URL || `${DOKPLOY_BACKEND_URL}/api`,
    backendUrl: import.meta.env.VITE_BACKEND_URL || DOKPLOY_BACKEND_URL,
    detectUrls: [
      DOKPLOY_BACKEND_URL, // Backend en Dokploy
      'http://18.216.180.19:3000', // Servidor AWS backup
    ],
    timeouts: {
      api: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
      healthCheck: parseInt(import.meta.env.VITE_HEALTH_CHECK_TIMEOUT) || 5000
    }
  }
};

// Cache para la configuración detectada
let cachedConfig = null;
let detectionPromise = null;

/**
 * Detecta automáticamente el entorno y la configuración del backend
 */
export const detectEnvironment = async () => {
  // Si ya tenemos una detección en curso, esperar a que termine
  if (detectionPromise) {
    return detectionPromise;
  }

  // Si ya tenemos configuración cacheada, devolverla
  if (cachedConfig) {
    return cachedConfig;
  }

  detectionPromise = performDetection();
  const result = await detectionPromise;
  detectionPromise = null;

  return result;
};

/**
 * Realiza la detección del entorno
 */
const performDetection = async () => {
  console.log('🔍 Detectando configuración del entorno...');
  console.log('🔍 Información del navegador:', {
    hostname: window.location.hostname,
    port: window.location.port,
    protocol: window.location.protocol,
    origin: window.location.origin
  });

  // Primero intentar detectar si estamos en desarrollo local
  const isLocalDevelopment = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '5173' || // Puerto de Vite
    window.location.port === '3000';   // Puerto del backend

  if (isLocalDevelopment) {
    console.log('📍 Entorno detectado: DESARROLLO LOCAL');
    return await detectLocalBackend();
  } else {
    console.log('📍 Entorno detectado: PRODUCCIÓN');
    return await detectProductionBackend();
  }
};

/**
 * Detecta la configuración del backend en entorno local
 */
const detectLocalBackend = async () => {
  const localConfig = environments.local;

  console.log('🔍 URLs a probar:', localConfig.detectUrls);

  for (const url of localConfig.detectUrls) {
    try {
      console.log(`🔍 Probando conexión con: ${url}`);

      // Primero probar health check simple
      const healthResponse = await axios.get(`${url}/health`, {
        timeout: localConfig.timeouts.healthCheck,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (healthResponse.data && healthResponse.data.status === 'OK') {
        console.log(`✅ Health check exitoso en: ${url}`);

        // Ahora probar el endpoint de configuración
        try {
          const configResponse = await axios.get(`${url}/api/config/environment`, {
            timeout: localConfig.timeouts.api,
            headers: {
              'Accept': 'application/json'
            }
          });

          if (configResponse.data && configResponse.data.success) {
            const backendConfig = configResponse.data.data;

            const config = {
              environment: 'local',
              apiUrl: `${url}/api`,
              backendUrl: url,
              backendInfo: backendConfig,
              detectedAt: new Date().toISOString()
            };

            console.log('✅ Backend local detectado con configuración completa:', config);
            cachedConfig = config;
            return config;
          }
        } catch (configError) {
          console.log(`⚠️ Health OK pero error en config para ${url}:`, configError.message);
          // Continuar con configuración básica
          const config = {
            environment: 'local',
            apiUrl: `${url}/api`,
            backendUrl: url,
            backendInfo: { server: { host: url } },
            detectedAt: new Date().toISOString()
          };

          console.log('✅ Backend local detectado (configuración básica):', config);
          cachedConfig = config;
          return config;
        }
      }
    } catch (error) {
      console.log(`❌ No se pudo conectar a ${url}:`, error.message);
      continue;
    }
  }

  // Si no se encuentra ningún backend, usar configuración por defecto
  console.log('⚠️ No se detectó backend local, usando configuración por defecto');
  const defaultConfig = {
    environment: 'local',
    apiUrl: localConfig.apiUrl,
    backendUrl: localConfig.backendUrl,
    backendInfo: null,
    detectedAt: new Date().toISOString()
  };

  cachedConfig = defaultConfig;
  return defaultConfig;
};

/**
 * Detecta la configuración del backend en entorno de producción
 */
const detectProductionBackend = async () => {
  const prodConfig = environments.production;

  try {
    console.log('🔍 Detectando configuración del backend en producción...');
    console.log('🔍 Probando URL del backend:', prodConfig.backendUrl);

    // Usar URL absoluta del backend de Dokploy
    const response = await axios.get(`${prodConfig.backendUrl}/api/config/environment`, {
      timeout: prodConfig.timeouts.api,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.data && response.data.success) {
      const backendConfig = response.data.data;

      const config = {
        environment: 'production',
        apiUrl: `${prodConfig.backendUrl}/api`,
        backendUrl: prodConfig.backendUrl,
        backendInfo: backendConfig,
        detectedAt: new Date().toISOString()
      };

      console.log('✅ Backend de producción detectado:', config);
      cachedConfig = config;
      return config;
    }
  } catch (error) {
    console.log('❌ Error detectando backend de producción:', error.message);
  }

  // Configuración por defecto para producción - usar URL de Dokploy
  console.log('⚠️ Usando configuración por defecto para producción (Dokploy)');
  const defaultConfig = {
    environment: 'production',
    apiUrl: prodConfig.apiUrl,
    backendUrl: prodConfig.backendUrl,
    backendInfo: null,
    detectedAt: new Date().toISOString()
  };

  cachedConfig = defaultConfig;
  return defaultConfig;
};

/**
 * Obtiene la configuración actual (desde cache o detecta nueva)
 */
export const getEnvironmentConfig = async () => {
  if (cachedConfig) {
    return cachedConfig;
  }

  return await detectEnvironment();
};

/**
 * Fuerza una nueva detección del entorno
 */
export const refreshEnvironmentConfig = async () => {
  cachedConfig = null;
  detectionPromise = null;
  // Limpiar también el localStorage si existe
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('environment_config');
  }
  return await detectEnvironment();
};

/**
 * Obtiene solo la URL de la API
 */
export const getApiUrl = async () => {
  const config = await getEnvironmentConfig();
  return config.apiUrl;
};

/**
 * Verifica si el backend está disponible
 */
export const checkBackendHealth = async () => {
  try {
    const config = await getEnvironmentConfig();
    const envConfig = config.environment === 'local' ? environments.local : environments.production;

    const response = await axios.get(`${config.backendUrl}/health`, {
      timeout: envConfig.timeouts.healthCheck
    });

    return {
      available: true,
      status: response.data.status,
      data: response.data,
      config: config
    };
  } catch (error) {
    return {
      available: false,
      error: error.message
    };
  }
};

export default {
  detectEnvironment,
  getEnvironmentConfig,
  refreshEnvironmentConfig,
  getApiUrl,
  checkBackendHealth
};