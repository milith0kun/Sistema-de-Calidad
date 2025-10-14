import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthContext useEffect ejecutándose...');
    // Verificar si hay token al cargar
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('📋 Estado inicial:', { 
      hasToken: !!token, 
      hasSavedUser: !!savedUser,
      tokenPreview: token ? token.substring(0, 20) + '...' : null
    });
    
    if (token && savedUser) {
      console.log('✅ Token y usuario encontrados, estableciendo usuario...');
      setUser(JSON.parse(savedUser));
      
      // Verificar que el token siga siendo válido (sin logout automático)
      console.log('🔍 Iniciando verificación de token...');
      authService.verifyToken()
        .then(() => {
          console.log('✅ Verificación de token exitosa');
        })
        .catch((error) => {
          console.warn('⚠️ Token verification failed:', error);
          // No hacer logout automático, solo log del error
          // El interceptor de axios manejará la redirección si es necesario
        });
    } else {
      console.log('❌ No hay token o usuario guardado');
    }
    
    setLoading(false);
    console.log('🏁 AuthContext useEffect completado');
  }, []);

  const login = async (email, password) => {
    console.log('🚀 Iniciando proceso de login para:', email);
    try {
      const response = await authService.login(email, password);
      console.log('📡 Respuesta del servidor:', response);
      
      if (response.success) {
        console.log('✅ Login exitoso, guardando datos...');
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        
        console.log('💾 Datos guardados en localStorage:', {
          token: response.token.substring(0, 20) + '...',
          user: response.user.nombre
        });
        
        // Verificar que se guardó correctamente
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        console.log('🔍 Verificación post-guardado:', {
          tokenSaved: !!savedToken,
          userSaved: !!savedUser
        });
        
        return { success: true };
      } else {
        console.log('❌ Login fallido:', response.error);
        return { success: false, error: response.error || 'Login fallido' };
      }
    } catch (error) {
      console.error('💥 Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error de conexión' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'ADMIN',
    isSupervisor: user?.rol === 'supervisor',
    isColaborador: user?.rol === 'colaborador',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
