import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a todas las peticiones
api.interceptors.request.use(
  (config) => {
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
      isVerifyCall: error.config?.url?.includes('/auth/verify')
    });
    
    // Solo hacer logout automático si NO es una verificación de token inicial
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Verificar si es una llamada a /auth/verify (verificación inicial)
      const isTokenVerification = error.config?.url?.includes('/auth/verify');
      
      if (!isTokenVerification) {
        // Token expirado o inválido en operaciones normales
        console.log('🚨 Error 401/403 en llamada NO-verify, ejecutando logout...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        // Es una verificación inicial, solo log del error sin logout
        console.warn('⚠️ Verificación inicial de token falló, pero manteniendo sesión');
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
  // Recepción Mercadería
  getRecepcionMercaderia: async (mes, anio, tipo = null) => {
    let url = `/haccp/recepcion-mercaderia?mes=${mes}&anio=${anio}`;
    if (tipo) url += `&tipo=${tipo}`;
    const response = await api.get(url);
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
  getLavadoManos: async (mes, anio) => {
    const response = await api.get(`/haccp/lavado-manos?mes=${mes}&anio=${anio}`);
    return response.data;
  },

  // Temperatura Cámaras
  getTemperaturaCamaras: async (mes, anio) => {
    const response = await api.get(`/haccp/temperatura-camaras?mes=${mes}&anio=${anio}`);
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

export default api;
