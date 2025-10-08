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
import { exportarLavadoManos } from '../../utils/exportExcel';
import { format } from 'date-fns';

const LavadoManos = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  
  // Estados para filtros avanzados
  const [filtroTipo, setFiltroTipo] = useState('mes'); // 'dia', 'mes', 'anio'
  const [fechaEspecifica, setFechaEspecifica] = useState(new Date().toISOString().split('T')[0]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [empleados, setEmpleados] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState('');
  const [areas, setAreas] = useState([]);
  const [filtroProcedimiento, setFiltroProcedimiento] = useState(''); // '', 'Sí', 'No'

  const cargarFiltros = async () => {
    try {
      // Cargar empleados
      const empleadosResponse = await haccpService.getEmpleados();
      if (empleadosResponse && empleadosResponse.success) {
        setEmpleados(Array.isArray(empleadosResponse.data) ? empleadosResponse.data : []);
      }
      
      // Cargar áreas
      const areasResponse = await haccpService.getAreas();
      if (areasResponse && areasResponse.success) {
        setAreas(Array.isArray(areasResponse.data) ? areasResponse.data : []);
      }
    } catch (err) {
      console.error('Error al cargar filtros:', err);
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
      
      // Agregar filtros adicionales
      if (empleadoSeleccionado) {
        params.empleado_id = empleadoSeleccionado;
      }
      if (areaSeleccionada) {
        params.area = areaSeleccionada;
      }
      if (filtroProcedimiento) {
        params.procedimiento_correcto = filtroProcedimiento;
      }
      
      const response = await haccpService.getLavadoManos(params);
      if (response && response.success) {
        let data = Array.isArray(response.data) ? response.data : [];
        
        // Filtrar por procedimiento si es necesario (filtro local adicional)
        if (filtroProcedimiento) {
          data = data.filter(registro => registro.procedimiento_correcto === filtroProcedimiento);
        }
        
        setRegistros(data);
      } else {
        setRegistros([]);
        setError(response?.error || 'Error al cargar registros');
      }
    } catch (err) {
      setError('Error al cargar registros de lavado de manos');
      setRegistros([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFiltros();
  }, []);

  useEffect(() => {
    cargarRegistros();
  }, [filtroTipo, fechaEspecifica, mes, anio, empleadoSeleccionado, areaSeleccionada, filtroProcedimiento]);

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
      await exportarLavadoManos(registros, mesExport, anioExport);
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
      
      // Exportar plantilla vacía para lavado de manos
      await exportarLavadoManos([], mesExport, anioExport);
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
    setEmpleadoSeleccionado('');
    setAreaSeleccionada('');
    setFiltroProcedimiento('');
    setMes(new Date().getMonth() + 1);
    setAnio(new Date().getFullYear());
  };

  const getProcedimientoColor = (correcto) => {
    return correcto === 'Sí' ? 'success' : 'error';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Lavado de Manos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registro de cumplimiento del procedimiento de lavado de manos del personal
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

          {/* Filtro por empleado */}
          <Grid item xs={12} sm={6} md={2}>
            <Autocomplete
              options={empleados}
              getOptionLabel={(option) => option.nombre || ''}
              value={empleados.find(e => e.id === empleadoSeleccionado) || null}
              onChange={(event, newValue) => {
                setEmpleadoSeleccionado(newValue ? newValue.id : '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Empleado"
                  placeholder="Todos los empleados"
                />
              )}
            />
          </Grid>

          {/* Filtro por área */}
          <Grid item xs={12} sm={6} md={2}>
            <Autocomplete
              options={areas}
              getOptionLabel={(option) => option.nombre || ''}
              value={areas.find(a => a.nombre === areaSeleccionada) || null}
              onChange={(event, newValue) => {
                setAreaSeleccionada(newValue ? newValue.nombre : '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Área"
                  placeholder="Todas las áreas"
                />
              )}
            />
          </Grid>

          {/* Filtro por procedimiento */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Procedimiento</InputLabel>
              <Select
                value={filtroProcedimiento}
                onChange={(e) => setFiltroProcedimiento(e.target.value)}
                label="Procedimiento"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Sí">Correcto</MenuItem>
                <MenuItem value="No">Incorrecto</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Botones de acción */}
          <Grid item xs={12} sm={6} md={1}>
            <Button
              variant="contained"
              onClick={cargarRegistros}
              disabled={loading}
              startIcon={<FilterListIcon />}
              fullWidth
            >
              Buscar
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={1}>
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
              <TableCell><strong>Hora</strong></TableCell>
              <TableCell><strong>Empleado</strong></TableCell>
              <TableCell><strong>Área</strong></TableCell>
              <TableCell><strong>Turno</strong></TableCell>
              <TableCell><strong>Firma</strong></TableCell>
              <TableCell align="center"><strong>Procedimiento Correcto</strong></TableCell>
              <TableCell><strong>Acción Correctiva</strong></TableCell>
              <TableCell><strong>Supervisor</strong></TableCell>
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
                  <TableCell>{row.empleado_nombre}</TableCell>
                  <TableCell>{row.area_estacion}</TableCell>
                  <TableCell>{row.turno}</TableCell>
                  <TableCell>{row.firma}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.procedimiento_correcto === 'Sí' ? 'SÍ' : 'NO'}
                      color={getProcedimientoColor(row.procedimiento_correcto)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{row.accion_correctiva || '-'}</TableCell>
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

export default LavadoManos;
