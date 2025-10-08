import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Autocomplete,
  Collapse,
  IconButton,
  Chip,
} from '@mui/material';
import { 
  Download as DownloadIcon, 
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  GetApp as GetAppIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportesService } from '../services/api';
import { exportarResumenNC } from '../utils/exportExcel';

const Reportes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [noConformidades, setNoConformidades] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  
  // Estados para filtros avanzados
  const [showFilters, setShowFilters] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('mes'); // 'mes', 'trimestre', 'anio'
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoReporte, setTipoReporte] = useState('general'); // 'general', 'detallado', 'comparativo'
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(''); // 'RECEPCION', 'COCCION', etc.
  const [umbralNC, setUmbralNC] = useState(10); // Umbral de no conformidades para alertas
  
  // Estados para datos adicionales
  const [empleadosNC, setEmpleadosNC] = useState([]);
  const [tendencias, setTendencias] = useState([]);
  const [alertas, setAlertas] = useState([]);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar parámetros según el tipo de filtro
      let params = { mes, anio };
      
      if (filtroTipo === 'trimestre') {
        const trimestre = Math.ceil(mes / 3);
        params.trimestre = trimestre;
      } else if (filtroTipo === 'rango' && fechaInicio && fechaFin) {
        params.fecha_inicio = fechaInicio;
        params.fecha_fin = fechaFin;
      }
      
      if (grupoSeleccionado) {
        params.grupo = grupoSeleccionado;
      }
      
      if (umbralNC) {
        params.umbral_nc = umbralNC;
      }
      
      const promises = [
        reportesService.getNoConformidades(params.mes || mes, params.anio || anio),
        reportesService.getProveedoresNC(params.mes || mes, params.anio || anio)
      ];
      
      // Agregar llamadas adicionales según el tipo de reporte
      if (tipoReporte === 'detallado') {
        promises.push(reportesService.getEmpleadosNC(params.mes || mes, params.anio || anio));
      }
      
      if (tipoReporte === 'comparativo') {
        promises.push(reportesService.getTemperaturasAlerta());
      }
      
      const responses = await Promise.all(promises);
      
      // Extraer datos de las respuestas
      const ncData = responses[0]?.data && Array.isArray(responses[0].data) ? responses[0].data : [];
      const provData = responses[1]?.data && Array.isArray(responses[1].data) ? responses[1].data : [];
      
      setNoConformidades(ncData);
      setProveedores(provData);
      
      // Procesar datos adicionales si están disponibles
      if (responses[2] && tipoReporte === 'detallado') {
        const empData = responses[2]?.data && Array.isArray(responses[2].data) ? responses[2].data : [];
        setEmpleadosNC(empData);
      }
      
      if (responses[2] && tipoReporte === 'comparativo') {
        const alertData = responses[2]?.data && Array.isArray(responses[2].data) ? responses[2].data : [];
        setAlertas(alertData);
      }
      
      // Generar alertas basadas en el umbral
      generarAlertas(ncData);
      
    } catch (err) {
      setError('Error al cargar reportes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generarAlertas = (data) => {
    const alertasGeneradas = data
      .filter(item => item.porcentaje_nc > umbralNC)
      .map(item => ({
        tipo: 'warning',
        mensaje: `${formatTipoControl(item.tipo_control)} supera el umbral de NC (${item.porcentaje_nc.toFixed(2)}%)`,
        valor: item.porcentaje_nc
      }));
    
    setAlertas(alertasGeneradas);
  };

  const limpiarFiltros = () => {
    setFiltroTipo('mes');
    setFechaInicio('');
    setFechaFin('');
    setTipoReporte('general');
    setGrupoSeleccionado('');
    setUmbralNC(10);
    setMes(new Date().getMonth() + 1);
    setAnio(new Date().getFullYear());
  };

  useEffect(() => {
    cargarReportes();
  }, [mes, anio, filtroTipo, fechaInicio, fechaFin, tipoReporte, grupoSeleccionado, umbralNC]);

  const handleExportar = () => {
    if (noConformidades.length === 0) {
      setError('No hay datos para exportar');
      return;
    }
    
    const nombreArchivo = `reporte_${tipoReporte}_${anio}_${mes.toString().padStart(2, '0')}`;
    
    if (tipoReporte === 'detallado') {
      exportarReporteDetallado(nombreArchivo);
    } else if (tipoReporte === 'comparativo') {
      exportarReporteComparativo(nombreArchivo);
    } else {
      exportarResumenNC(noConformidades, mes, anio);
    }
  };

  const exportarReporteDetallado = (nombreArchivo) => {
    const datosCompletos = {
      noConformidades,
      proveedores,
      empleados: empleadosNC,
      alertas,
      parametros: {
        mes,
        anio,
        filtroTipo,
        grupoSeleccionado,
        umbralNC
      }
    };
    
    // Aquí se podría implementar una función más completa de exportación
    exportarResumenNC(noConformidades, mes, anio, nombreArchivo);
  };

  const exportarReporteComparativo = (nombreArchivo) => {
    const datosComparativos = {
      noConformidades,
      alertas,
      tendencias,
      parametros: {
        mes,
        anio,
        filtroTipo,
        umbralNC
      }
    };
    
    // Aquí se podría implementar una función específica para reportes comparativos
    exportarResumenNC(noConformidades, mes, anio, nombreArchivo);
  };

  const exportarPlantillaVacia = async (tipoFormulario) => {
    try {
      setLoading(true);
      await descargarFormularioVacio(tipoFormulario);
    } catch (error) {
      setError('Error al descargar la plantilla');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const descargarFormularioVacio = async (tipo) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/formularios-haccp/formulario-vacio/${tipo}/${mes}/${anio}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      // Verificar que el contenido sea realmente un archivo Excel
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('spreadsheetml')) {
        throw new Error('El servidor no devolvió un archivo Excel válido');
      }
      
      const blob = await response.blob();
      
      // Verificar que el blob no esté vacío
      if (blob.size === 0) {
        throw new Error('El archivo descargado está vacío');
      }
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Formulario_HACCP_${tipo}_${mes.toString().padStart(2, '0')}_${anio}.xlsx`;
      
      // Agregar al DOM, hacer clic y limpiar
      document.body.appendChild(a);
      a.click();
      
      // Limpiar después de un pequeño delay para asegurar la descarga
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log(`Formulario ${tipo} descargado exitosamente`);
      
    } catch (err) {
      console.error('Error al descargar formulario:', err);
      setError(`Error al descargar formulario: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const descargarReporte = async (tipo) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/formularios-haccp/reporte/${tipo}/${mes}/${anio}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      // Verificar que el contenido sea realmente un archivo Excel
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('spreadsheetml')) {
        throw new Error('El servidor no devolvió un archivo Excel válido');
      }
      
      const blob = await response.blob();
      
      // Verificar que el blob no esté vacío
      if (blob.size === 0) {
        throw new Error('El archivo descargado está vacío');
      }
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Reporte_HACCP_${tipo}_${mes.toString().padStart(2, '0')}_${anio}.xlsx`;
      
      // Agregar al DOM, hacer clic y limpiar
      document.body.appendChild(a);
      a.click();
      
      // Limpiar después de un pequeño delay para asegurar la descarga
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log(`Reporte ${tipo} descargado exitosamente`);
      
    } catch (err) {
      console.error('Error al descargar reporte:', err);
      setError(`Error al descargar reporte: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTipoControl = (tipo) => {
    const tipos = {
      'RECEPCION': 'Recepción Mercadería',
      'COCCION': 'Control de Cocción',
      'LAVADO_FRUTAS': 'Lavado Frutas',
      'LAVADO_MANOS': 'Lavado de Manos',
      'TEMPERATURA': 'Temperatura Cámaras'
    };
    return tipos[tipo] || tipo;
  };

  const chartData = Array.isArray(noConformidades) ? noConformidades.map(item => ({
    name: formatTipoControl(item.tipo_control).replace('Control de ', ''),
    'No Conformidades': item.no_conformidades,
    'Total Registros': item.total_registros,
  })) : [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Reportes y Estadísticas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Análisis de no conformidades y estadísticas del sistema HACCP
          </Typography>
          {alertas.length > 0 && (
            <Box mt={1}>
              {alertas.map((alerta, index) => (
                <Chip
                  key={index}
                  icon={<WarningIcon />}
                  label={alerta.mensaje}
                  color="warning"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => exportarPlantillaVacia('general')}
            disabled={loading}
          >
            Plantilla Vacía
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportar}
            disabled={loading || noConformidades.length === 0}
          >
            {noConformidades.length === 0 ? 'Exportar Plantilla' : `Exportar ${tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1)}`}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Sección de Filtros Avanzados */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Filtros de Búsqueda
            </Typography>
          </Box>
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={showFilters}>
          <Grid container spacing={3}>
            {/* Tipo de Filtro Temporal */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Período</InputLabel>
                <Select
                  value={filtroTipo}
                  label="Tipo de Período"
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <MenuItem value="mes">Por Mes</MenuItem>
                  <MenuItem value="trimestre">Por Trimestre</MenuItem>
                  <MenuItem value="anio">Por Año</MenuItem>
                  <MenuItem value="rango">Rango de Fechas</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Tipo de Reporte */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Reporte</InputLabel>
                <Select
                  value={tipoReporte}
                  label="Tipo de Reporte"
                  onChange={(e) => setTipoReporte(e.target.value)}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="detallado">Detallado</MenuItem>
                  <MenuItem value="comparativo">Comparativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Grupo de Control */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Grupo de Control</InputLabel>
                <Select
                  value={grupoSeleccionado}
                  label="Grupo de Control"
                  onChange={(e) => setGrupoSeleccionado(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="RECEPCION">Recepción</MenuItem>
                  <MenuItem value="COCCION">Cocción</MenuItem>
                  <MenuItem value="TEMPERATURA">Temperatura</MenuItem>
                  <MenuItem value="LAVADO">Lavado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Campos condicionales según el tipo de filtro */}
            {filtroTipo === 'rango' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Fecha Inicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Fecha Fin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            {/* Umbral de No Conformidades */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Umbral de Alerta NC (%)"
                type="number"
                value={umbralNC}
                onChange={(e) => setUmbralNC(Number(e.target.value))}
                fullWidth
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                helperText="Porcentaje mínimo para generar alertas"
              />
            </Grid>

            {/* Botones de Acción */}
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={2} justifyContent="flex-end" alignItems="center" height="100%">
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={cargarReportes}
                  disabled={loading}
                >
                  Aplicar Filtros
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={limpiarFiltros}
                  disabled={loading}
                >
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Mes"
              type="number"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              fullWidth
              InputProps={{ inputProps: { min: 1, max: 12 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Año"
              type="number"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              fullWidth
              InputProps={{ inputProps: { min: 2020, max: 2030 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              onClick={cargarReportes}
              disabled={loading}
              startIcon={<AssessmentIcon />}
            >
              Generar Reporte
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Sección de Formularios HACCP */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Formularios HACCP
          </Typography>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => exportarPlantillaVacia('todos')}
            disabled={loading}
          >
            Descargar Todos
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {/* Recepción de Abarrotes */}
          <Grid item xs={12} md={6} lg={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Recepción de Abarrotes</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Control de recepción de productos secos, enlatados y abarrotes
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<DescriptionIcon />}
                  onClick={() => exportarPlantillaVacia('abarrotes')}
                  disabled={loading}
                >
                  Plantilla
                </Button>
                <Button
                  size="small"
                  startIcon={<GetAppIcon />}
                  onClick={() => descargarReporte('abarrotes')}
                  disabled={loading}
                  variant="contained"
                >
                  Con Datos
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Recepción de Frutas y Verduras */}
          <Grid item xs={12} md={6} lg={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Recepción de Mercadería</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Control de recepción de productos frescos, frutas y verduras
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<DescriptionIcon />}
                  onClick={() => exportarPlantillaVacia('mercaderia')}
                  disabled={loading}
                >
                  Plantilla
                </Button>
                <Button
                  size="small"
                  startIcon={<GetAppIcon />}
                  onClick={() => descargarReporte('mercaderia')}
                  disabled={loading}
                  variant="contained"
                >
                  Con Datos
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Control de Cocción */}
          <Grid item xs={12} md={6} lg={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Control de Cocción</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Registro de temperaturas y tiempos de cocción
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<DescriptionIcon />}
                  onClick={() => exportarPlantillaVacia('coccion')}
                  disabled={loading}
                >
                  Plantilla
                </Button>
                <Button
                  size="small"
                  startIcon={<GetAppIcon />}
                  onClick={() => descargarReporte('coccion')}
                  disabled={loading}
                  variant="contained"
                >
                  Con Datos
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Temperatura de Cámaras */}
          <Grid item xs={12} md={6} lg={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Temperatura de Cámaras</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Monitoreo de temperaturas en cámaras frigoríficas
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<DescriptionIcon />}
                  onClick={() => exportarPlantillaVacia('temperatura')}
                  disabled={loading}
                >
                  Plantilla
                </Button>
                <Button
                  size="small"
                  startIcon={<GetAppIcon />}
                  onClick={() => descargarReporte('temperatura')}
                  disabled={loading}
                  variant="contained"
                >
                  Con Datos
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Lavado de Manos */}
          <Grid item xs={12} md={6} lg={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Lavado de Manos</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Control de higiene y lavado de manos del personal
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<DescriptionIcon />}
                  onClick={() => exportarPlantillaVacia('lavado-manos')}
                  disabled={loading}
                >
                  Plantilla
                </Button>
                <Button
                  size="small"
                  startIcon={<GetAppIcon />}
                  onClick={() => descargarReporte('lavado-manos')}
                  disabled={loading}
                  variant="contained"
                >
                  Con Datos
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Lavado de Frutas */}
          <Grid item xs={12} md={6} lg={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Lavado de Frutas</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Control de lavado y desinfección de frutas y verduras
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<DescriptionIcon />}
                  onClick={() => exportarPlantillaVacia('lavado-frutas')}
                  disabled={loading}
                >
                  Plantilla
                </Button>
                <Button
                  size="small"
                  startIcon={<GetAppIcon />}
                  onClick={() => descargarReporte('lavado-frutas')}
                  disabled={loading}
                  variant="contained"
                >
                  Con Datos
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Indicadores de Rendimiento */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {noConformidades.reduce((acc, item) => acc + item.total_registros, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Registros
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="error" fontWeight="bold">
                  {noConformidades.reduce((acc, item) => acc + item.no_conformidades, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No Conformidades
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {noConformidades.length > 0 
                    ? ((noConformidades.reduce((acc, item) => acc + item.no_conformidades, 0) / 
                       noConformidades.reduce((acc, item) => acc + item.total_registros, 0)) * 100).toFixed(1)
                    : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  % Promedio NC
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {alertas.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Alertas Activas
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Gráfico de No Conformidades */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                No Conformidades por Tipo de Control
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUpIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Período: {mes}/{anio}
                </Typography>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => `Control: ${label}`}
                />
                <Legend />
                <Bar dataKey="No Conformidades" fill="#f44336" name="No Conformidades" />
                <Bar dataKey="Total Registros" fill="#2196f3" name="Total Registros" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Tabla Resumen de No Conformidades */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Resumen de No Conformidades
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Tipo de Control</strong></TableCell>
                    <TableCell align="center"><strong>Total Registros</strong></TableCell>
                    <TableCell align="center"><strong>No Conformidades</strong></TableCell>
                    <TableCell align="center"><strong>% NC</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {noConformidades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                        <Typography color="text.secondary">
                          No hay datos para el período seleccionado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    noConformidades.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{formatTipoControl(row.tipo_control)}</TableCell>
                        <TableCell align="center">{row.total_registros}</TableCell>
                        <TableCell align="center">
                          <Typography 
                            color={row.no_conformidades > 0 ? 'error' : 'success'}
                            fontWeight="bold"
                          >
                            {row.no_conformidades}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            color={row.porcentaje_nc > 10 ? 'error' : 'text.secondary'}
                            fontWeight={row.porcentaje_nc > 10 ? 'bold' : 'normal'}
                          >
                            {row.porcentaje_nc.toFixed(2)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Tabla de Proveedores con Más NC */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Proveedores con Más No Conformidades
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Proveedor</strong></TableCell>
                    <TableCell align="center"><strong>Total Entregas</strong></TableCell>
                    <TableCell align="center"><strong>Productos Rechazados</strong></TableCell>
                    <TableCell align="center"><strong>% Rechazo</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proveedores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                        <Typography color="text.secondary">
                          No hay datos de proveedores para el período seleccionado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    proveedores.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{row.proveedor_nombre}</TableCell>
                        <TableCell align="center">{row.total_entregas}</TableCell>
                        <TableCell align="center">
                          <Typography 
                            color={row.total_rechazos > 0 ? 'error' : 'success'}
                            fontWeight="bold"
                          >
                            {row.total_rechazos}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            color={row.porcentaje_rechazo > 10 ? 'error' : 'text.secondary'}
                            fontWeight={row.porcentaje_rechazo > 10 ? 'bold' : 'normal'}
                          >
                            {row.porcentaje_rechazo.toFixed(2)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Reportes;
