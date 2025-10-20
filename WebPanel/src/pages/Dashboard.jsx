import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { dashboardService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const StatCard = ({ title, value, icon, color }) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadDashboard();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardService.getAdmin();
      console.log('Dashboard response:', response);
      
      if (response && response.success) {
        // Validar y normalizar todos los arrays y datos
        const dashboardData = {
          ...response.data,
          // Empleados presentes hoy
          empleados_presentes_hoy: response.data?.empleados_presentes_hoy || 0,
          empleados_hoy: Array.isArray(response.data?.empleados_hoy)
            ? response.data.empleados_hoy
            : [],
          // Controles HACCP
          controles_haccp_hoy: response.data?.controles_haccp_hoy || 0,
          // No conformidades
          no_conformidades_mes: response.data?.no_conformidades_mes || 0,
          no_conformidades_por_tipo: Array.isArray(response.data?.no_conformidades_por_tipo)
            ? response.data.no_conformidades_por_tipo
            : [],
          // Productos rechazados
          productos_rechazados_detalle: Array.isArray(response.data?.productos_rechazados_detalle) 
            ? response.data.productos_rechazados_detalle 
            : [],
          productos_rechazados_semana: response.data?.productos_rechazados_semana || 0,
          // Asistencias
          asistencias_semana: Array.isArray(response.data?.asistencias_semana)
            ? response.data.asistencias_semana
            : []
        };
        setData(dashboardData);
        setUltimaActualizacion(new Date());
      } else {
        setError(response?.error || 'Error cargando dashboard');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header con controles mejorado */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={{ xs: 2, sm: 3 }}
        mb={{ xs: 2, sm: 3 }}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          p: { xs: 2, sm: 3 },
          boxShadow: 1
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              mb: 1
            }}
          >
            Dashboard
          </Typography>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={{ xs: 1, sm: 2 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Resumen general del sistema
            </Typography>
            {ultimaActualizacion && (
              <Chip
                icon={<ScheduleIcon />}
                label={`Actualizado: ${ultimaActualizacion.toLocaleTimeString()}`}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  height: { xs: 24, sm: 32 }
                }}
              />
            )}
          </Box>
        </Box>
        <Box 
          className="dashboard-controls"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            minWidth: { sm: 'fit-content' }
          }}
        >
          <Button
            variant={autoRefresh ? "contained" : "outlined"}
            color={autoRefresh ? "success" : "primary"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            startIcon={<TrendingUpIcon />}
            className={`dashboard-button ${autoRefresh ? 'auto-refresh-on' : 'auto-refresh-off'}`}
            fullWidth={isMobile}
            sx={{ 
              minWidth: { sm: 140 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="contained"
            onClick={loadDashboard}
            disabled={loading}
            startIcon={<RefreshIcon />}
            className="dashboard-button refresh-btn"
            fullWidth={isMobile}
            sx={{ 
              minWidth: { sm: 120 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* Grid de tarjetas estadísticas mejorado */}
      <Grid container spacing={{ xs: 2, sm: 3 }} mb={{ xs: 3, sm: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Empleados Presentes Hoy"
            value={data?.empleados_presentes_hoy || 0}
            icon={<PeopleIcon sx={{ fontSize: { xs: 24, sm: 30 } }} />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Controles HACCP Hoy"
            value={data?.controles_haccp_hoy || 0}
            icon={<AssignmentIcon sx={{ fontSize: { xs: 24, sm: 30 } }} />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="No Conformidades Mes"
            value={data?.no_conformidades_mes || 0}
            icon={<WarningIcon sx={{ fontSize: 30 }} />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Productos Rechazados"
            value={data?.productos_rechazados_semana || 0}
            icon={<CheckCircleIcon sx={{ fontSize: 30 }} />}
            color="#f44336"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              No Conformidades por Tipo
            </Typography>
            {data?.no_conformidades_por_tipo && data.no_conformidades_por_tipo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.no_conformidades_por_tipo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#2196f3" name="Total" />
                  <Bar dataKey="nc" fill="#f44336" name="No Conformes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" align="center" py={5}>
                No hay datos disponibles
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Asistencias del Mes
            </Typography>
            {data?.asistencias_mes && data.asistencias_mes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.asistencias_mes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#4caf50" name="Asistencias" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" align="center" py={5}>
                No hay datos disponibles
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Productos Rechazados Esta Semana
            </Typography>
            {data?.productos_rechazados_detalle && data.productos_rechazados_detalle.length > 0 ? (
              <Box>
                {data.productos_rechazados_detalle.map((item, index) => (
                  <Box key={index} py={1} borderBottom="1px solid #eee">
                    <Typography variant="body1" fontWeight="bold">
                      {item.nombre_producto}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Proveedor: {item.nombre_proveedor} | Fecha: {item.fecha} | Motivo: {item.observaciones || 'Sin especificar'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" align="center" py={3}>
                No hay productos rechazados esta semana
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
