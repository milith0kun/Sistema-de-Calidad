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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Autocomplete,
} from '@mui/material';
import { 
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { haccpService } from '../../services/api';
import { exportarTemperaturaCamaras } from '../../utils/exportExcel';
import { format } from 'date-fns';

const TemperaturaCamaras = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  
  // Estados para filtros simplificados según especificaciones HACCP
  const [filtroTipo, setFiltroTipo] = useState('mes'); // 'dia', 'mes', 'anio'
  const [fechaEspecifica, setFechaEspecifica] = useState(new Date().toISOString().split('T')[0]);
  const [camaraSeleccionada, setCamaraSeleccionada] = useState('');
  const [camaras, setCamaras] = useState([]);

  const cargarCamaras = async () => {
    try {
      const response = await haccpService.getCamaras();
      if (response && response.success) {
        setCamaras(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error al cargar cámaras:', err);
    }
  };

  const cargarRegistros = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let params = {};
      
      // Configurar parámetros según el tipo de filtro
      if (filtroTipo === 'dia') {
        params.fecha_especifica = fechaEspecifica;
      } else if (filtroTipo === 'mes') {
        params.mes = mes;
        params.anio = anio;
      } else if (filtroTipo === 'anio') {
        params.anio = anio;
      }
      
      // Agregar filtros adicionales (solo cámara según especificaciones)
      if (camaraSeleccionada) {
        params.camara_id = camaraSeleccionada;
      }
      
      const response = await haccpService.getTemperaturaCamaras(params);
      if (response && response.success) {
        let data = Array.isArray(response.data) ? response.data : [];
        setRegistros(data);
      } else {
        setRegistros([]);
        setError(response?.error || 'Error al cargar registros');
      }
    } catch (err) {
      setError('Error al cargar registros de temperatura de cámaras');
      setRegistros([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCamaras();
  }, []);

  useEffect(() => {
    cargarRegistros();
  }, [filtroTipo, fechaEspecifica, mes, anio, camaraSeleccionada]);

  const handleExportar = async () => {
    try {
      setError('');
      setLoading(true);
      
      const mesExport = filtroTipo === 'dia' ? new Date(fechaEspecifica).getMonth() + 1 : mes;
      const anioExport = filtroTipo === 'dia' ? new Date(fechaEspecifica).getFullYear() : anio;
      
      if (registros.length === 0) {
        // Exportar plantilla vacía
        await handleExportarPlantilla();
        return;
      }
      
      // Exportar con datos filtrados
      await exportarTemperaturaCamaras(registros, mesExport, anioExport);
    } catch (err) {
      console.error('Error al exportar:', err);
      setError(`Error al exportar archivo Excel: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPlantilla = async () => {
    try {
      setError('');
      setLoading(true);
      
      const mesExport = filtroTipo === 'dia' ? new Date(fechaEspecifica).getMonth() + 1 : mes;
      const anioExport = filtroTipo === 'dia' ? new Date(fechaEspecifica).getFullYear() : anio;
      
      // Exportar plantilla vacía para temperatura de cámaras
      await exportarTemperaturaCamaras([], mesExport, anioExport);
    } catch (err) {
      console.error('Error al exportar plantilla:', err);
      setError(`Error al exportar plantilla Excel: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltroTipo('mes');
    setFechaEspecifica(new Date().toISOString().split('T')[0]);
    setCamaraSeleccionada('');
    setMes(new Date().getMonth() + 1);
    setAnio(new Date().getFullYear());
  };

  const getConformidadColor = (conformidad) => {
    return conformidad === 'C' ? 'success' : 'error';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Control de Temperatura de Cámaras
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitoreo diario de temperaturas de cámaras refrigeradas y congeladas
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportarPlantilla}
            disabled={loading}
          >
            Plantilla Vacía
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportar}
            disabled={loading}
          >
            {registros.length > 0 ? 'Exportar Datos' : 'Exportar Plantilla'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon />
          Filtros de Búsqueda
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          {/* Selector de tipo de filtro */}
          <Grid item xs={12} sm={6} md={3}>
            <ButtonGroup fullWidth variant="outlined">
              <Button
                variant={filtroTipo === 'dia' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('dia')}
              >
                Día
              </Button>
              <Button
                variant={filtroTipo === 'mes' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('mes')}
              >
                Mes
              </Button>
              <Button
                variant={filtroTipo === 'anio' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('anio')}
              >
                Año
              </Button>
            </ButtonGroup>
          </Grid>

          {/* Selector de fecha específica (solo para día) */}
          {filtroTipo === 'dia' && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Fecha Específica"
                type="date"
                value={fechaEspecifica}
                onChange={(e) => setFechaEspecifica(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          {/* Selectores de mes y año (para mes y año) */}
          {(filtroTipo === 'mes' || filtroTipo === 'anio') && (
            <>
              {filtroTipo === 'mes' && (
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Mes"
                    type="number"
                    value={mes}
                    onChange={(e) => setMes(Number(e.target.value))}
                    fullWidth
                    InputProps={{ inputProps: { min: 1, max: 12 } }}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Año"
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(Number(e.target.value))}
                  fullWidth
                  InputProps={{ inputProps: { min: 2020, max: 2030 } }}
                />
              </Grid>
            </>
          )}

          {/* Filtro por cámara */}
          <Grid item xs={12} sm={6} md={2}>
            <Autocomplete
              options={camaras}
              getOptionLabel={(option) => option.nombre || ''}
              value={camaras.find(c => c.id === camaraSeleccionada) || null}
              onChange={(event, newValue) => {
                setCamaraSeleccionada(newValue ? newValue.id : '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cámara"
                  placeholder="Todas las cámaras"
                />
              )}
            />
          </Grid>



          {/* Botones de acción */}
          <Grid item xs={12} sm={6} md={2}>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                onClick={cargarRegistros}
                disabled={loading}
                startIcon={<FilterListIcon />}
                fullWidth
              >
                Buscar
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              onClick={limpiarFiltros}
              disabled={loading}
              startIcon={<ClearIcon />}
              fullWidth
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Cámara</strong></TableCell>
              <TableCell align="center"><strong>Temp. Mañana (°C)</strong></TableCell>
              <TableCell align="center"><strong>Temp. Tarde (°C)</strong></TableCell>
              <TableCell align="center"><strong>Conformidad Mañana</strong></TableCell>
              <TableCell align="center"><strong>Conformidad Tarde</strong></TableCell>
              <TableCell><strong>Acciones Correctivas</strong></TableCell>
              <TableCell><strong>Supervisor</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : registros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    No hay registros para el período seleccionado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              registros.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{format(new Date(row.fecha), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{row.camara_nombre}</TableCell>
                  <TableCell align="center">{row.temperatura_manana}°C</TableCell>
                  <TableCell align="center">{row.temperatura_tarde}°C</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.conformidad_manana === 'C' ? 'Conforme' : 'No Conforme'}
                      color={getConformidadColor(row.conformidad_manana)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.conformidad_tarde === 'C' ? 'Conforme' : 'No Conforme'}
                      color={getConformidadColor(row.conformidad_tarde)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{row.acciones_correctivas || '-'}</TableCell>
                  <TableCell>{row.supervisor_nombre || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TemperaturaCamaras;
