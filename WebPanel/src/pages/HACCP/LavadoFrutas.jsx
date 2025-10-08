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
import { exportarLavadoFrutas, exportarFormularioVacioLavadoFrutas } from '../../utils/exportExcel';
import { format } from 'date-fns';

const LavadoFrutas = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [productoQuimico, setProductoQuimico] = useState('');
  const [concentracion, setConcentracion] = useState('');
  
  // Estados para filtros avanzados
  const [filtroTipo, setFiltroTipo] = useState('mes'); // 'dia', 'mes', 'anio'
  const [fechaEspecifica, setFechaEspecifica] = useState('');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [areaSeleccionada, setAreaSeleccionada] = useState('');
  const [frutaSeleccionada, setFrutaSeleccionada] = useState('');
  const [filtroConformidad, setFiltroConformidad] = useState(''); // '', 'C', 'NC'
  
  // Estados para opciones de filtros
  const [empleados, setEmpleados] = useState([]);
  const [areas, setAreas] = useState([]);
  const [frutas, setFrutas] = useState([]);

  const cargarRegistros = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar parámetros según el tipo de filtro
      let params = {};
      
      if (filtroTipo === 'dia' && fechaEspecifica) {
        params.fecha = fechaEspecifica;
      } else if (filtroTipo === 'mes') {
        params.mes = mes;
        params.anio = anio;
      } else if (filtroTipo === 'anio') {
        params.anio = anio;
      }
      
      // Agregar filtros adicionales
      if (empleadoSeleccionado) params.empleado_id = empleadoSeleccionado;
      if (areaSeleccionada) params.area = areaSeleccionada;
      if (frutaSeleccionada) params.fruta = frutaSeleccionada;
      if (filtroConformidad) params.conformidad = filtroConformidad;
      
      const response = await haccpService.getLavadoFrutas(params.mes || null, params.anio || null, params);
      if (response && response.success) {
        setRegistros(Array.isArray(response.data) ? response.data : []);
      } else {
        setRegistros([]);
        setError(response?.error || 'Error al cargar registros');
      }
    } catch (err) {
      setError('Error al cargar registros de lavado de frutas');
      setRegistros([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

      // Cargar frutas/verduras
      const frutasResponse = await haccpService.getFrutasVerduras();
      if (frutasResponse && frutasResponse.success) {
        setFrutas(Array.isArray(frutasResponse.data) ? frutasResponse.data : []);
      }
    } catch (err) {
      console.error('Error al cargar filtros:', err);
    }
  };

  useEffect(() => {
    cargarFiltros();
  }, []);

  useEffect(() => {
    cargarRegistros();
  }, [filtroTipo, fechaEspecifica, mes, anio, empleadoSeleccionado, areaSeleccionada, frutaSeleccionada, filtroConformidad]);

  const handleExportar = () => {
    if (registros.length === 0) {
      // Si no hay registros, exportar plantilla vacía
      handleExportarPlantilla();
      return;
    }
    exportarLavadoFrutas(registros, mes, anio, productoQuimico, concentracion);
  };

  const handleExportarPlantilla = () => {
    exportarFormularioVacioLavadoFrutas(mes, anio, productoQuimico, concentracion);
  };

  const limpiarFiltros = () => {
    setFiltroTipo('mes');
    setFechaEspecifica('');
    setEmpleadoSeleccionado('');
    setAreaSeleccionada('');
    setFrutaSeleccionada('');
    setFiltroConformidad('');
    setMes(new Date().getMonth() + 1);
    setAnio(new Date().getFullYear());
    setProductoQuimico('');
    setConcentracion('');
  };

  const getConformidadColor = (conformidad) => {
    return conformidad === 'C' ? 'success' : 'error';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Lavado y Desinfección de Frutas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registro de procedimientos de lavado y desinfección de frutas y verduras
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
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
            {registros.length === 0 ? 'Exportar Plantilla' : 'Exportar Datos'}
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

          {/* Filtro por fruta/verdura */}
          <Grid item xs={12} sm={6} md={2}>
            <Autocomplete
              options={frutas}
              getOptionLabel={(option) => option.nombre || ''}
              value={frutas.find(f => f.nombre === frutaSeleccionada) || null}
              onChange={(event, newValue) => {
                setFrutaSeleccionada(newValue ? newValue.nombre : '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Fruta/Verdura"
                  placeholder="Todas las frutas"
                />
              )}
            />
          </Grid>

          {/* Filtro por conformidad */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Conformidad</InputLabel>
              <Select
                value={filtroConformidad}
                onChange={(e) => setFiltroConformidad(e.target.value)}
                label="Conformidad"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="C">Conforme</MenuItem>
                <MenuItem value="NC">No Conforme</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Campos adicionales para exportación */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Producto Químico"
              value={productoQuimico}
              onChange={(e) => setProductoQuimico(e.target.value)}
              fullWidth
              placeholder="Ej: Cloro"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Concentración"
              value={concentracion}
              onChange={(e) => setConcentracion(e.target.value)}
              fullWidth
              placeholder="Ej: 200 ppm"
            />
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
              <TableCell><strong>Fruta/Verdura</strong></TableCell>
              <TableCell><strong>Producto Químico</strong></TableCell>
              <TableCell><strong>Concentración</strong></TableCell>
              <TableCell align="center"><strong>Lavado Agua Potable</strong></TableCell>
              <TableCell align="center"><strong>Desinfección</strong></TableCell>
              <TableCell align="center"><strong>Concentración Correcta</strong></TableCell>
              <TableCell align="center"><strong>Tiempo (min)</strong></TableCell>
              <TableCell><strong>Acciones Correctivas</strong></TableCell>
              <TableCell><strong>Supervisor</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : registros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 5 }}>
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
                  <TableCell>{row.nombre_fruta_verdura}</TableCell>
                  <TableCell>{row.producto_quimico}</TableCell>
                  <TableCell>{row.concentracion_producto}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.lavado_agua_potable === 'C' ? 'Conforme' : 'No Conforme'}
                      color={getConformidadColor(row.lavado_agua_potable)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.desinfeccion_producto_quimico === 'C' ? 'Conforme' : 'No Conforme'}
                      color={getConformidadColor(row.desinfeccion_producto_quimico)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.concentracion_correcta === 'C' ? 'Conforme' : 'No Conforme'}
                      color={getConformidadColor(row.concentracion_correcta)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{row.tiempo_desinfeccion_minutos} min</TableCell>
                  <TableCell>{row.acciones_correctivas || '-'}</TableCell>
                  <TableCell>{row.supervisor_nombre}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LavadoFrutas;
