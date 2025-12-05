import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Alert, Typography } from '@mui/material';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente para proteger rutas por roles específicos
export const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario tiene uno de los roles permitidos
  const hasAllowedRole = allowedRoles.length === 0 || allowedRoles.includes(user?.rol);

  if (!hasAllowedRole) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
        sx={{ p: 3 }}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Acceso Denegado
          </Typography>
          <Typography variant="body2">
            No tienes permisos para acceder a esta página. Solo los usuarios con rol de {allowedRoles.join(' o ')} pueden acceder.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Tu rol actual: <strong>{user?.rol || 'Desconocido'}</strong>
          </Typography>
        </Alert>
      </Box>
    );
  }

  return children;
};
