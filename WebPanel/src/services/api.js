import axios from 'axios';
import { getApiUrl, getEnvironmentConfig } from '../config/environment.js';

// Variable para almacenar la URL de la API detectada
let API_URL = import.meta.env.VITE_API_URL || '/api';
let apiInitialized = false;

// Función para inicializar la configuración de la API
const initializeApi = async () => {
  if (apiInitialized) return;
  
  try {
    console.log('🔧 Inicializando configuración de API...');
    const detectedApiUrl = await getApiUrl();
    API_URL = detectedApiUrl;
    
    // Actualizar la baseURL de la instancia de axios
    api.defaults.baseURL = API_URL;
    
    const config = await getEnvironmentConfig();
    console.log('✅ API configurada:', {
      environment: config.environment,
      apiUrl: API_URL,
      backendUrl: config.backendUrl
    });
    
    apiInitialized = true;
  } catch (error) {
    console.error('❌ Error inicializando API:', error);
    // Usar configuración por defecto
    API_URL = import.meta.env.VITE_API_URL || '/api';
    api.defaults.baseURL = API_URL;
    apiInitialized = true;
  }
};

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inicializar API y añadir token a todas las peticiones
api.interceptors.request.use(
  async (config) => {
    // Inicializar API si no se ha hecho
    await initializeApi();
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🔍 Interceptor de axios ejecutándose:', {
      status: error.response?.status,
      url: error.config?.url,
      isVerifyCall: error.config?.url?.includes('/auth/verify'),
      isLoginCall: error.config?.url?.includes('/auth/login')
    });
    
    // Solo hacer logout automático en casos muy específicos
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isTokenVerification = error.config?.url?.includes('/auth/verify');
      const isLoginCall = error.config?.url?.includes('/auth/login');
      const isHealthCheck = error.config?.url?.includes('/health');
      
      // NO hacer logout automático en estos casos:
      // 1. Verificación inicial de token
      // 2. Intentos de login
      // 3. Health checks
      // 4. Errores de red (sin response del servidor)
      if (isTokenVerification || isLoginCall || isHealthCheck) {
        console.warn('⚠️ Error 401/403 en operación especial, manteniendo sesión');
        return Promise.reject(error);
      }
      
      // Solo hacer logout si es un error claro de autenticación en operaciones normales
      // Y solo si el error viene del servidor (no errores de red)
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || error.response.data.error || '';
        
        // Hacer logout solo si el mensaje indica token expirado o inválido
        if (errorMessage.toLowerCase().includes('token') || 
            errorMessage.toLowerCase().includes('expired') ||
            errorMessage.toLowerCase().includes('invalid') ||
            errorMessage.toLowerCase().includes('unauthorized')) {
          
          console.log('🚨 Token claramente inválido/expirado, ejecutando logout...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Usar setTimeout para evitar conflictos con React
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        } else {
          console.warn('⚠️ Error 401/403 sin indicación clara de token inválido, manteniendo sesión');
        }
      } else {
        console.warn('⚠️ Error 401/403 sin respuesta del servidor (posible error de red), manteniendo sesión');
      }
    } else {
      console.log('ℹ️ Error no relacionado con autenticación:', error.response?.status);
    }
    return Promise.reject(error);
  }
);

// =====================================================
// AUTENTICACIÓN
// =====================================================

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// =====================================================
// DASHBOARD
// =====================================================

export const dashboardService = {
  getHoy: async () => {
    const response = await api.get('/dashboard/hoy');
    return response.data;
  },

  getResumen: async (mes, anio) => {
    const response = await api.get(`/dashboard/resumen?mes=${mes}&anio=${anio}`);
    return response.data;
  },

  getAdmin: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },
};

// =====================================================
// FICHADO / ASISTENCIAS
// =====================================================

export const fichadoService = {
  getHistorial: async (mes, anio) => {
    const response = await api.get(`/fichado/historial?mes=${mes}&anio=${anio}`);
    return response.data;
  },

  getEstadoHoy: async () => {
    const response = await api.get('/fichado/estado-hoy');
    return response.data;
  },
};

// =====================================================
// HACCP
// =====================================================

export const haccpService = {
  // Recepción Mercadería - Función legacy que combina ambos tipos
  getRecepcionMercaderia: async (mes, anio, tipo = null) => {
    try {
      if (tipo === 'ABARROTES') {
        const response = await api.get(`/haccp/recepcion-abarrotes?mes=${mes}&anio=${anio}`);
        return response.data;
      } else if (tipo === 'FRUTAS_VERDURAS') {
        const response = await api.get(`/haccp/recepcion-frutas-verduras?mes=${mes}&anio=${anio}`);
        return response.data;
      } else {
        // Si no se especifica tipo, obtener ambos y combinarlos
        const [abarrotes, frutasVerduras] = await Promise.all([
          api.get(`/haccp/recepcion-abarrotes?mes=${mes}&anio=${anio}`),
          api.get(`/haccp/recepcion-frutas-verduras?mes=${mes}&anio=${anio}`)
        ]);
        
        return {
          success: true,
          data: [...(abarrotes.data.data || []), ...(frutasVerduras.data.data || [])],
          total: (abarrotes.data.total || 0) + (frutasVerduras.data.total || 0)
        };
      }
    } catch (error) {
      console.error('Error al obtener recepción mercadería:', error);
      throw error;
    }
  },

  // Recepción Abarrotes - Endpoint específico
  getRecepcionAbarrotes: async (mes = null, anio = null) => {
    let url = '/haccp/recepcion-abarrotes';
    const params = new URLSearchParams();
    
    // Solo agregar parámetros si se proporcionan
    if (mes) params.append('mes', mes);
    if (anio) params.append('anio', anio);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Recepción Frutas y Verduras - Endpoint específico
  getRecepcionFrutasVerduras: async (mes, anio) => {
    const response = await api.get(`/haccp/recepcion-frutas-verduras?mes=${mes}&anio=${anio}`);
    return response.data;
  },

  // Control Cocción
  getControlCoccion: async (mes, anio) => {
    const response = await api.get(`/haccp/control-coccion?mes=${mes}&anio=${anio}`);
    return response.data;
  },

  // Lavado Frutas
  getLavadoFrutas: async (mes, anio) => {
    const response = await api.get(`/haccp/lavado-frutas?mes=${mes}&anio=${anio}`);
    return response.data;
  },

  // Lavado Manos
  getLavadoManos: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Agregar parámetros de fecha
    if (params.mes) queryParams.append('mes', params.mes);
    if (params.anio) queryParams.append('anio', params.anio);
    if (params.fecha) queryParams.append('fecha_inicio', params.fecha);
    if (params.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
    if (params.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);
    
    // Agregar parámetro de área (mapear 'area' a 'area_estacion')
    if (params.area) queryParams.append('area_estacion', params.area);
    if (params.area_estacion) queryParams.append('area_estacion', params.area_estacion);
    
    // Agregar límite si se especifica
    if (params.limite) queryParams.append('limite', params.limite);
    
    const response = await api.get(`/haccp/lavado-manos?${queryParams.toString()}`);
    return response.data;
  },

  // Temperatura Cámaras
  getTemperaturaCamaras: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Agregar parámetros de fecha
    if (params.mes) queryParams.append('mes', params.mes);
    if (params.anio) queryParams.append('anio', params.anio);
    if (params.fecha_especifica) queryParams.append('fecha', params.fecha_especifica);
    if (params.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
    if (params.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);
    
    // Agregar parámetro de cámara
    if (params.camara_id) queryParams.append('camara_id', params.camara_id);
    
    // Agregar límite si se especifica
    if (params.limite) queryParams.append('limite', params.limite);
    
    const response = await api.get(`/haccp/temperatura-camaras?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener cámaras
  getCamaras: async () => {
    const response = await api.get('/haccp/camaras');
    return response.data;
  },

  // Obtener empleados
  getEmpleados: async (area = null) => {
    let url = '/haccp/empleados';
    if (area) url += `?area=${area}`;
    const response = await api.get(url);
    return response.data;
  },

  // Obtener supervisores
  getSupervisores: async (area = null) => {
    let url = '/haccp/supervisores';
    if (area) url += `?area=${area}`;
    const response = await api.get(url);
    return response.data;
  },

  // Obtener áreas únicas
  getAreas: async () => {
    const response = await api.get('/haccp/areas');
    return response.data;
  },

  // Obtener frutas/verduras
  getFrutasVerduras: async () => {
    const response = await api.get('/haccp/frutas-verduras');
    return response.data;
  },

  // Registrar lavado de manos
  registrarLavadoManos: async (data) => {
    const response = await api.post('/haccp/lavado-manos', data);
    return response.data;
  },
};

// =====================================================
// USUARIOS
// =====================================================

export const usuariosService = {
  getAll: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  getSupervisores: async () => {
    const response = await api.get('/usuarios/supervisores/lista');
    return response.data;
  },

  create: async (usuario) => {
    const response = await api.post('/usuarios', usuario);
    return response.data;
  },

  update: async (id, usuario) => {
    const response = await api.put(`/usuarios/${id}`, usuario);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  changePassword: async (id, password) => {
    const response = await api.put(`/usuarios/${id}/password`, { password });
    return response.data;
  },
};

// =====================================================
// AUDITORÍA
// =====================================================

export const auditoriaService = {
  getLogs: async (fechaDesde, fechaHasta, usuario = null, accion = null) => {
    let url = `/auditoria/logs?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
    if (usuario) url += `&usuario=${usuario}`;
    if (accion) url += `&accion=${accion}`;
    const response = await api.get(url);
    return response.data;
  },
  
  getFiltros: async () => {
    const response = await api.get('/auditoria/filtros');
    return response.data;
  },
};

// =====================================================
// REPORTES
// =====================================================

export const reportesService = {
  getNoConformidades: async (mes, anio) => {
    const response = await api.get(`/reportes/no-conformidades?mes=${mes}&anio=${anio}`);
    return response.data;
  },

  getProveedoresNC: async (mes, anio) => {
    const response = await api.get(`/reportes/proveedores-nc?mes=${mes}&anio=${anio}`);
    return response.data;
  },

  getEmpleadosNC: async (mes, anio) => {
    const response = await api.get(`/reportes/empleados-nc?mes=${mes}&anio=${anio}`);
    return response.data;
  },

  getTemperaturasAlerta: async () => {
    const response = await api.get('/reportes/temperaturas-alerta');
    return response.data;
  },
};

// =====================================================
// CONFIGURACIÓN DEL SISTEMA
// =====================================================

export const configuracionService = {
  getGPS: async () => {
    const response = await api.get('/configuracion/gps');
    return response.data;
  },

  updateGPS: async (config) => {
    const response = await api.post('/configuracion/gps', config);
    return response.data;
  },

  getRoles: async () => {
    const response = await api.get('/configuracion/roles');
    return response.data;
  },
};

// Función para obtener la configuración actual de la API
export const getApiConfig = async () => {
  await initializeApi();
  const config = await getEnvironmentConfig();
  return {
    apiUrl: API_URL,
    environment: config.environment,
    backendInfo: config.backendInfo,
    detectedAt: config.detectedAt
  };
};

// Función para forzar reinicialización de la API
export const reinitializeApi = async () => {
  apiInitialized = false;
  await initializeApi();
  return await getApiConfig();
};

export default api;
