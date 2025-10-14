import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Alert,
  ButtonGroup,
  Autocomplete,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import haccpService from '../../services/api';
import { exportarRecepcionAbarrotes } from '../../utils/exportExcel';

const RecepcionAbarrotes = () => {
  const [registros, setRegistros] = useState([]);
  const [supervisores, setSupervisores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para filtros simplificados según especificaciones HACCP
  const [showFilters, setShowFilters] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('mes'); // 'dia', 'mes', 'anio'
  const [fechaEspecifica, setFechaEspecifica] = useState('');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  
  // Estados para opciones de filtros
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);

  const [formData, setFormData] = useState({
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora: format(new Date(), 'HH:mm'),
    nombreProveedor: '',
    nombreProducto: '',
    cantidadSolicitada: '',
    registroSanitarioVigente: '',
    evaluacionVencimiento: '',
    conformidadEmpaque: '',
    uniformeCompleto: '',
    transporteAdecuado: '',
    puntualidad: '',
    observaciones: '',
    accionCorrectiva: '',
    supervisorId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [filtroTipo, fechaEspecifica, mes, anio, proveedorSeleccionado, productoSeleccionado]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Preparar parámetros de filtro
      let params = {};
      
      if (filtroTipo === 'dia' && fechaEspecifica) {
        params.fecha = fechaEspecifica;
      } else if (filtroTipo === 'mes') {
        params.mes = mes;
        params.anio = anio;
      } else if (filtroTipo === 'anio') {
        params.anio = anio;
      }
      
      // Agregar filtros adicionales (solo proveedor y producto según especificaciones)
      if (proveedorSeleccionado) params.proveedor = proveedorSeleccionado;
      if (productoSeleccionado) params.producto = productoSeleccionado;
      
      const [registrosRes, supervisoresRes, proveedoresRes, productosRes] = await Promise.all([
        haccpService.get('/haccp/recepcion-abarrotes', { params }),
        haccpService.get('/haccp/supervisores'),
        haccpService.get('/haccp/proveedores'),
        haccpService.get('/haccp/productos-abarrotes'),
      ]);

      console.log('Registros abarrotes response:', registrosRes);

      if (registrosRes && registrosRes.success) {
        setRegistros(Array.isArray(registrosRes.data) ? registrosRes.data : []);
      } else {
        setRegistros([]);
      }

      if (supervisoresRes && supervisoresRes.success) {
        setSupervisores(Array.isArray(supervisoresRes.data) ? supervisoresRes.data : []);
      } else {
        setSupervisores([]);
      }

      if (proveedoresRes && proveedoresRes.success) {
        setProveedores(Array.isArray(proveedoresRes.data) ? proveedoresRes.data : []);
      } else {
        setProveedores([]);
      }

      if (productosRes && productosRes.success) {
        setProductos(Array.isArray(productosRes.data) ? productosRes.data : []);
      } else {
        setProductos([]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
      setRegistros([]);
      setSupervisores([]);
      setProveedores([]);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltroTipo('mes');
    setFechaEspecifica('');
    setMes(new Date().getMonth() + 1);
    setAnio(new Date().getFullYear());
    setProveedorSeleccionado('');
    setProductoSeleccionado('');
  };

  const handleOpenDialog = (registro = null) => {
    if (registro) {
      setEditingId(registro.id);
      setFormData({
        fecha: registro.fecha,
        hora: registro.hora,
        nombreProveedor: registro.nombre_proveedor || '',
        nombreProducto: registro.nombre_producto || '',
        cantidadSolicitada: registro.cantidad_solicitada || '',
        registroSanitarioVigente: registro.registro_sanitario_vigente || '',
        evaluacionVencimiento: registro.evaluacion_vencimiento || '',
        conformidadEmpaque: registro.conformidad_empaque || '',
        uniformeCompleto: registro.uniforme_completo || '',
        transporteAdecuado: registro.transporte_adecuado || '',
        puntualidad: registro.puntualidad || '',
        observaciones: registro.observaciones || '',
        accionCorrectiva: registro.accion_correctiva || '',
        supervisorId: registro.supervisor_id || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        fecha: format(new Date(), 'yyyy-MM-dd'),
        hora: format(new Date(), 'HH:mm'),
        nombreProveedor: '',
        nombreProducto: '',
        cantidadSolicitada: '',
        registroSanitarioVigente: '',
        evaluacionVencimiento: '',
        conformidadEmpaque: '',
        uniformeCompleto: '',
        transporteAdecuado: '',
        puntualidad: '',
        observaciones: '',
        accionCorrectiva: '',
        supervisorId: '',
      });
    }
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      // Validaciones
      if (!formData.nombreProveedor || !formData.nombreProducto || !formData.supervisorId) {
        setError('Por favor complete todos los campos obligatorios');
        return;
      }

      const data = {
        ...formData,
        mes: parseInt(format(new Date(formData.fecha), 'M')),
        anio: parseInt(format(new Date(formData.fecha), 'yyyy')),
      };

      console.log('Enviando datos:', data);

      const response = await haccpService.post('/haccp/recepcion-abarrotes', data);

      if (response && response.success) {
        setSuccess('Registro guardado exitosamente');
        handleCloseDialog();
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response?.error || 'Error al guardar el registro');
      }
    } catch (err) {
      console.error('Error saving:', err);
      setError('Error de conexión al guardar');
    }
  };

  const handleExport = async () => {
    try {
      if (registros.length === 0) {
        // Si no hay registros, exportar plantilla vacía
        handleExportarPlantilla();
        return;
      }
      
      await exportarRecepcionAbarrotes(registros, mes, anio);
      setSuccess('Excel exportado correctamente');
    } catch (err) {
      console.error('Error al exportar:', err);
      setError('Error al exportar el archivo Excel');
    }
  };

  const handleExportarPlantilla = async () => {
    try {
      // Exportar plantilla vacía con estructura básica
      const plantillaVacia = [];
      await exportarRecepcionAbarrotes(plantillaVacia, mes, anio);
      setSuccess('Plantilla vacía exportada correctamente');
    } catch (err) {
      console.error('Error al exportar plantilla:', err);
      setError('Error al exportar la plantilla Excel');
    }
  };

  const getChipColor = (value) => {
    if (value === 'SI' || value === 'CONFORME') return 'success';
    if (value === 'NO' || value === 'NO CONFORME') return 'error';
    return 'default';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1E293B' }}>
          Recepción de Abarrotes
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportarPlantilla}
            disabled={loading}
            sx={{ borderRadius: '12px' }}
          >
            Plantilla Vacía
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            disabled={loading}
            sx={{ borderRadius: '12px' }}
          >
            {registros.length === 0 ? 'Exportar Plantilla' : 'Exportar Datos'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: '12px' }}
          >
            Nuevo Registro
          </Button>
        </Box>
      </Box>

      {/* Sección de Filtros */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1, color: '#1976d2' }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Filtros de Búsqueda
          </Typography>
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            sx={{ ml: 1 }}
          >
            {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={showFilters}>
          <Grid container spacing={3}>
            {/* Tipo de Filtro */}
            <Grid item xs={12} md={3}>
              <ButtonGroup variant="outlined" fullWidth>
                <Button
                  variant={filtroTipo === 'dia' ? 'contained' : 'outlined'}
                  onClick={() => setFiltroTipo('dia')}
                  size="small"
                >
                  Día
                </Button>
                <Button
                  variant={filtroTipo === 'mes' ? 'contained' : 'outlined'}
                  onClick={() => setFiltroTipo('mes')}
                  size="small"
                >
                  Mes
                </Button>
                <Button
                  variant={filtroTipo === 'anio' ? 'contained' : 'outlined'}
                  onClick={() => setFiltroTipo('anio')}
                  size="small"
                >
                  Año
                </Button>
              </ButtonGroup>
            </Grid>

            {/* Fecha específica (solo para día) */}
            {filtroTipo === 'dia' && (
              <Grid item xs={12} md={3}>
                <TextField
                  label="Fecha"
                  type="date"
                  value={fechaEspecifica}
                  onChange={(e) => setFechaEspecifica(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
            )}

            {/* Mes y Año (para mes y año) */}
            {(filtroTipo === 'mes' || filtroTipo === 'anio') && (
              <>
                {filtroTipo === 'mes' && (
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Mes"
                      type="number"
                      value={mes}
                      onChange={(e) => setMes(parseInt(e.target.value))}
                      inputProps={{ min: 1, max: 12 }}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={2}>
                  <TextField
                    label="Año"
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(parseInt(e.target.value))}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </>
            )}

            {/* Proveedor */}
            <Grid item xs={12} md={3}>
              <Autocomplete
                options={proveedores}
                getOptionLabel={(option) => option.nombre || option}
                value={proveedorSeleccionado}
                onChange={(event, newValue) => setProveedorSeleccionado(newValue?.nombre || newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Proveedor"
                    size="small"
                    fullWidth
                  />
                )}
                freeSolo
              />
            </Grid>

            {/* Producto */}
            <Grid item xs={12} md={3}>
              <Autocomplete
                options={productos}
                getOptionLabel={(option) => option.nombre || option}
                value={productoSeleccionado}
                onChange={(event, newValue) => setProductoSeleccionado(newValue?.nombre || newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Producto"
                    size="small"
                    fullWidth
                  />
                )}
                freeSolo
              />
            </Grid>



            {/* Botones de acción */}
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={loadData}
                  disabled={loading}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Buscar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={limpiarFiltros}
                  disabled={loading}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Reg. Sanitario</TableCell>
              <TableCell>Vencimiento</TableCell>
              <TableCell>Empaque</TableCell>
              <TableCell>Supervisor</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography color="text.secondary" py={3}>
                    No hay registros disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              registros.map((registro) => (
                <TableRow key={registro.id} hover>
                  <TableCell>{format(new Date(registro.fecha), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{registro.hora}</TableCell>
                  <TableCell>{registro.nombre_proveedor}</TableCell>
                  <TableCell>{registro.nombre_producto}</TableCell>
                  <TableCell>{registro.cantidad_solicitada}</TableCell>
                  <TableCell>
                    <Chip
                      label={registro.registro_sanitario_vigente}
                      color={getChipColor(registro.registro_sanitario_vigente)}
                      size="small"
                      sx={{ borderRadius: '12px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={registro.evaluacion_vencimiento}
                      color={getChipColor(registro.evaluacion_vencimiento)}
                      size="small"
                      sx={{ borderRadius: '12px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={registro.conformidad_empaque}
                      color={getChipColor(registro.conformidad_empaque)}
                      size="small"
                      sx={{ borderRadius: '12px' }}
                    />
                  </TableCell>
                  <TableCell>{registro.supervisor_nombre}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(registro)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Registro' : 'Nuevo Registro de Recepción de Abarrotes'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha"
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hora"
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del Proveedor"
                name="nombreProveedor"
                value={formData.nombreProveedor}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del Producto"
                name="nombreProducto"
                value={formData.nombreProducto}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cantidad Solicitada"
                name="cantidadSolicitada"
                value={formData.cantidadSolicitada}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Registro Sanitario Vigente</InputLabel>
                <Select
                  name="registroSanitarioVigente"
                  value={formData.registroSanitarioVigente}
                  onChange={handleChange}
                  label="Registro Sanitario Vigente"
                >
                  <MenuItem value="SI">SI</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Evaluación Vencimiento</InputLabel>
                <Select
                  name="evaluacionVencimiento"
                  value={formData.evaluacionVencimiento}
                  onChange={handleChange}
                  label="Evaluación Vencimiento"
                >
                  <MenuItem value="CONFORME">CONFORME</MenuItem>
                  <MenuItem value="NO CONFORME">NO CONFORME</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Conformidad Empaque</InputLabel>
                <Select
                  name="conformidadEmpaque"
                  value={formData.conformidadEmpaque}
                  onChange={handleChange}
                  label="Conformidad Empaque"
                >
                  <MenuItem value="CONFORME">CONFORME</MenuItem>
                  <MenuItem value="NO CONFORME">NO CONFORME</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Uniforme Completo</InputLabel>
                <Select
                  name="uniformeCompleto"
                  value={formData.uniformeCompleto}
                  onChange={handleChange}
                  label="Uniforme Completo"
                >
                  <MenuItem value="SI">SI</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Transporte Adecuado</InputLabel>
                <Select
                  name="transporteAdecuado"
                  value={formData.transporteAdecuado}
                  onChange={handleChange}
                  label="Transporte Adecuado"
                >
                  <MenuItem value="SI">SI</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Puntualidad</InputLabel>
                <Select
                  name="puntualidad"
                  value={formData.puntualidad}
                  onChange={handleChange}
                  label="Puntualidad"
                >
                  <MenuItem value="SI">SI</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Supervisor del Turno</InputLabel>
                <Select
                  name="supervisorId"
                  value={formData.supervisorId}
                  onChange={handleChange}
                  label="Supervisor del Turno"
                >
                  {supervisores.map((sup) => (
                    <MenuItem key={sup.id} value={sup.id}>
                      {sup.nombre} {sup.apellido} - {sup.cargo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Acción Correctiva"
                name="accionCorrectiva"
                value={formData.accionCorrectiva}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: '12px' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ borderRadius: '12px' }}
          >
            {editingId ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecepcionAbarrotes;
