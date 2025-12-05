import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleProtectedRoute } from './components/ProtectedRoute';
import { detectEnvironment, getEnvironmentConfig } from './config/environment';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Asistencias from './pages/Asistencias';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';
import Auditoria from './pages/Auditoria';
import Configuracion from './pages/Configuracion';

// HACCP Pages
import RecepcionMercaderia from './pages/HACCP/RecepcionMercaderia';
import RecepcionAbarrotes from './pages/HACCP/RecepcionAbarrotes';
import ControlCoccion from './pages/HACCP/ControlCoccion';
import LavadoFrutas from './pages/HACCP/LavadoFrutas';
import LavadoManos from './pages/HACCP/LavadoManos';
import TemperaturaCamaras from './pages/HACCP/TemperaturaCamaras';




import Layout from './components/Layout';

// Tema tipo UNIFYDATA - Dashboard profesional y limpio
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1', // Indigo/Azul
      light: '#818CF8',
      dark: '#4F46E5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4ADE80', // Verde menta
      light: '#86EFAC',
      dark: '#22C55E',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#4ADE80',
      light: '#D1FAE5',
      dark: '#22C55E',
    },
    error: {
      main: '#F87171',
      light: '#FEE2E2',
      dark: '#EF4444',
    },
    warning: {
      main: '#FBBF24',
      light: '#FEF3C7',
      dark: '#F59E0B',
    },
    info: {
      main: '#60A5FA',
      light: '#DBEAFE',
      dark: '#3B82F6',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
    divider: 'rgba(0, 0, 0, 0.04)',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#1E293B',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#1E293B',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#1E293B',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#1E293B',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#334155',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#334155',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#475569',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#64748B',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.08)',
    '0px 2px 6px rgba(0, 0, 0, 0.1)',
    '0px 4px 12px rgba(0, 0, 0, 0.12)',
    '0px 8px 24px rgba(0, 0, 0, 0.14)',
    '0px 12px 32px rgba(0, 0, 0, 0.16)',
    ...Array(19).fill('0px 16px 40px rgba(0, 0, 0, 0.18)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Reducido de 12 a 8 para ser más formal
          padding: '8px 20px', // Reducido de '10px 24px' para ser menos alto
          fontSize: '0.875rem', // Reducido de '0.9375rem' para ser más compacto
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          minHeight: '36px', // Altura mínima más formal
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)', // Sombra más sutil
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem',
          minHeight: '32px',
        },
        sizeLarge: {
          padding: '10px 24px',
          fontSize: '0.9375rem',
          minHeight: '42px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Reducido de 12 a 8 para ser más formal
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Reducido de 12 a 8 para ser más formal
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          padding: '12px 16px', // Reducido de '16px' para ser más compacto
        },
        head: {
          fontWeight: 600,
          color: '#475569',
          backgroundColor: '#F8FAFC',
          borderBottom: '2px solid rgba(0, 0, 0, 0.08)',
          padding: '14px 16px', // Ligeramente más alto para encabezados
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6, // Reducido de 12 a 6 para ser más formal
          fontWeight: 500,
          fontSize: '0.8125rem',
          height: '28px', // Altura más compacta
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8, // Reducido de 12 a 8 para ser más formal
            backgroundColor: '#FFFFFF',
            transition: 'all 0.2s',
            '& .MuiOutlinedInput-input': {
              padding: '12px 14px', // Padding más compacto
            },
            '&:hover': {
              backgroundColor: '#F8FAFC',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8, // Reducido de 12 a 8 para ser más formal
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Reducido de 12 a 8 para ser más formal
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginBottom: '16px', // Espaciado consistente entre campos
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        item: {
          paddingTop: '8px !important', // Espaciado más compacto en grids
          paddingLeft: '8px !important',
        },
      },
    },
  },
});

function App() {
  // Inicializar configuración automática de entorno
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Inicializando configuración automática de entorno...');
        await detectEnvironment();
        console.log('✅ Configuración de entorno inicializada correctamente');
      } catch (error) {
        console.warn('⚠️ Error al inicializar configuración automática:', error.message);
        console.log('📝 La aplicación continuará con configuración por defecto');
      }
    };

    initializeApp();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="asistencias" element={
                <RoleProtectedRoute allowedRoles={['Supervisor', 'Empleador']}>
                  <Asistencias />
                </RoleProtectedRoute>
              } />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="auditoria" element={<Auditoria />} />
              <Route path="configuracion" element={<Configuracion />} />
              
              {/* HACCP Routes */}
              <Route path="haccp/recepcion-mercaderia" element={<RecepcionMercaderia />} />
              <Route path="haccp/recepcion-abarrotes" element={<RecepcionAbarrotes />} />
              <Route path="haccp/control-coccion" element={<ControlCoccion />} />
              <Route path="haccp/lavado-frutas" element={<LavadoFrutas />} />
              <Route path="haccp/lavado-manos" element={<LavadoManos />} />
              <Route path="haccp/temperatura-camaras" element={<TemperaturaCamaras />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
