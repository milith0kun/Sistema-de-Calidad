import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { haccpService } from '../../services/api';
import { exportarControlCoccion } from '../../utils/exportExcel';
import { format } from 'date-fns';

const ControlCoccion = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());

  const cargarRegistros = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await haccpService.getControlCoccion(mes, anio);
      if (response && response.success) {
        setRegistros(Array.isArray(response.data) ? response.data : []);
      } else {
        setRegistros([]);
        setError(response?.error || 'Error al cargar registros');
      }
    } catch (err) {
      setError('Error al cargar registros de control de cocción');
      setRegistros([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, [mes, anio]);

  const handleExportar = async () => {
    try {
      if (registros.length === 0) {
        setError('No hay registros para exportar');
        return;
      }
      setError(null);
      setLoading(true);
      await exportarControlCoccion(registros, mes, anio);
    } catch (err) {
      console.error('Error al exportar:', err);
      setError(`Error al exportar archivo Excel: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getProcesoTexto = (proceso) => {
    switch(proceso) {
      case 'H': return 'Horno';
      case 'P': return 'Plancha';
      case 'C': return 'Cocina';
      default: return proceso;
    }
  };

  const getConformidadColor = (conformidad) => {
    return conformidad === 'C' ? 'success' : 'error';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Control de Cocción
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registro de temperaturas y tiempos de cocción de alimentos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportar}
          disabled={registros.length === 0}
        >
          Exportar Excel
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper 
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}
      >
        <Box 
          sx={{ 
            pb: 2, 
            mb: 2, 
            borderBottom: '1px solid #e0e0e0' 
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Filtros de Búsqueda
          </Typography>
        </Box>
        
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
              Mes
            </Typography>
            <TextField
              type="number"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              fullWidth
              InputProps={{ inputProps: { min: 1, max: 12 } }}
              sx={{
                height: '56px',
                '& .MuiOutlinedInput-root': {
                  height: '56px',
                  fontSize: '14px',
                  padding: '0 14px',
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                  '&:hover': {
                    backgroundColor: '#f0f0f0'
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
              Año
            </Typography>
            <TextField
              type="number"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              fullWidth
              InputProps={{ inputProps: { min: 2020, max: 2030 } }}
              sx={{
                height: '56px',
                '& .MuiOutlinedInput-root': {
                  height: '56px',
                  fontSize: '14px',
                  padding: '0 14px',
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                  '&:hover': {
                    backgroundColor: '#f0f0f0'
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'transparent' }}>
              .
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={cargarRegistros}
              disabled={loading}
              sx={{
                height: '56px',
                fontSize: '14px',
                padding: '0 16px',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Hora</strong></TableCell>
              <TableCell><strong>Producto</strong></TableCell>
              <TableCell><strong>Proceso</strong></TableCell>
              <TableCell align="center"><strong>Temperatura (°C)</strong></TableCell>
              <TableCell align="center"><strong>Tiempo (min)</strong></TableCell>
              <TableCell align="center"><strong>Conformidad</strong></TableCell>
              <TableCell><strong>Responsable</strong></TableCell>
              <TableCell><strong>Acción Correctiva</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : registros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    No hay registros para el período seleccionado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              registros.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{format(new Date(row.fecha), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{row.hora}</TableCell>
                  <TableCell>{row.producto_cocinar}</TableCell>
                  <TableCell>{getProcesoTexto(row.proceso_coccion)}</TableCell>
                  <TableCell align="center">{row.temperatura_coccion}°C</TableCell>
                  <TableCell align="center">{row.tiempo_coccion_minutos} min</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.conformidad === 'C' ? 'Conforme' : 'No Conforme'}
                      color={getConformidadColor(row.conformidad)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{row.responsable_nombre}</TableCell>
                  <TableCell>{row.accion_correctiva || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ControlCoccion;
