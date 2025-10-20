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
import api, { haccpService } from '../../services/api';
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
  const [mes, setMes] = useState(new Date().getMonth() + 1); // Mes actual
  const [anio, setAnio] = useState(new Date().getFullYear()); // Año actual
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
      setError('');
      
      // Construir parámetros solo cuando hay filtros activos
      const params = {};
      
      // Solo agregar filtros de fecha si el usuario los ha aplicado explícitamente
      if (filtroTipo === 'dia' && fechaEspecifica) {
        params.fecha = fechaEspecifica;
      } else if (filtroTipo === 'mes' && showFilters) {
        // Solo aplicar filtro de mes/año si los filtros están visibles (usuario los activó)
        params.mes = mes;
        params.anio = anio;
      } else if (filtroTipo === 'anio' && showFilters) {
        // Solo aplicar filtro de año si los filtros están visibles
        params.anio = anio;
      }
      
      // Agregar filtros adicionales (solo proveedor y producto según especificaciones)
      if (proveedorSeleccionado) params.proveedor = proveedorSeleccionado;
      if (productoSeleccionado) params.producto = productoSeleccionado;
      
      const [registrosRes, supervisoresRes, proveedoresRes, productosRes] = await Promise.all([
        // Si no hay filtros activos, llamar sin parámetros para obtener todos los registros
        showFilters ? 
          haccpService.getRecepcionAbarrotes(params.mes, params.anio) : 
          haccpService.getRecepcionAbarrotes(),
        haccpService.getSupervisores(),
        api.get('/haccp/proveedores'),
        api.get('/haccp/productos-abarrotes'),
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

      const response = await api.post('/haccp/recepcion-abarrotes', data);

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
    if (value === 'Conforme' || value === 'SI') return 'success';
    if (value === 'No Conforme' || value === 'NO') return 'error';
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
          <Grid container spacing={3} alignItems="flex-start">
            {/* Tipo de Filtro */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Período
              </Typography>
              <ButtonGroup 
                variant="outlined" 
                fullWidth
                sx={{
                  height: '56px',
                  display: 'flex',
                  '& .MuiButton-root': {
                    flex: 1,
                    height: '56px',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                    '&.MuiButton-contained': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      }
                    }
                  }
                }}
              >
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

            {/* Fecha específica (solo para día) */}
            {filtroTipo === 'dia' && (
              <Grid item xs={12} md={3}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Fecha Específica
                </Typography>
                <TextField
                  type="date"
                  value={fechaEspecifica}
                  onChange={(e) => setFechaEspecifica(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    height: '56px',
                    '& .MuiOutlinedInput-root': {
                      height: '56px',
                      fontSize: '0.875rem',
                      borderRadius: '8px',
                      backgroundColor: '#fff',
                      '& input': {
                        padding: '16.5px 14px',
                      }
                    }
                  }}
                />
              </Grid>
            )}

            {/* Mes y Año (para mes y año) */}
            {(filtroTipo === 'mes' || filtroTipo === 'anio') && (
              <>
                {filtroTipo === 'mes' && (
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                      Mes
                    </Typography>
                    <TextField
                      type="number"
                      value={mes}
                      onChange={(e) => setMes(parseInt(e.target.value))}
                      inputProps={{ min: 1, max: 12 }}
                      fullWidth
                      sx={{
                        height: '56px',
                        '& .MuiOutlinedInput-root': {
                          height: '56px',
                          fontSize: '0.875rem',
                          borderRadius: '8px',
                          backgroundColor: '#fff',
                          '& input': {
                            padding: '16.5px 14px',
                          }
                        }
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={2}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Año
                  </Typography>
                  <TextField
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(parseInt(e.target.value))}
                    fullWidth
                    sx={{
                      height: '56px',
                      '& .MuiOutlinedInput-root': {
                        height: '56px',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        '& input': {
                          padding: '16.5px 14px',
                        }
                      }
                    }}
                  />
                </Grid>
              </>
            )}

            {/* Proveedor */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Proveedor
              </Typography>
              <Autocomplete
                options={proveedores}
                getOptionLabel={(option) => option.nombre || option}
                value={proveedorSeleccionado}
                onChange={(event, newValue) => setProveedorSeleccionado(newValue?.nombre || newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    sx={{
                      height: '56px',
                      '& .MuiOutlinedInput-root': {
                        height: '56px',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        '& input': {
                          padding: '16.5px 14px',
                        }
                      }
                    }}
                  />
                )}
                freeSolo
              />
            </Grid>

            {/* Producto */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Producto
              </Typography>
              <Autocomplete
                options={productos}
                getOptionLabel={(option) => option.nombre || option}
                value={productoSeleccionado}
                onChange={(event, newValue) => setProductoSeleccionado(newValue?.nombre || newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    sx={{
                      height: '56px',
                      '& .MuiOutlinedInput-root': {
                        height: '56px',
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        '& input': {
                          padding: '16.5px 14px',
                        }
                      }
                    }}
                  />
                )}
                freeSolo
              />
            </Grid>

            {/* Botones de acción */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, visibility: 'hidden' }}>
                Acciones
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={loadData}
                  disabled={loading}
                  sx={{ 
                    flex: 1,
                    height: '56px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    }
                  }}
                >
                  Buscar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={limpiarFiltros}
                  disabled={loading}
                  sx={{ 
                    flex: 1,
                    height: '56px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    }
                  }}
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

      <TableContainer 
          component={Paper} 
          className="custom-scrollbar"
          sx={{ 
            borderRadius: '12px', 
            overflow: 'auto',
            maxHeight: '70vh',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f3f4',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '4px',
              border: '1px solid #f1f3f4',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            },
          }}
        >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Uniforme</TableCell>
              <TableCell>Transporte</TableCell>
              <TableCell>Puntualidad</TableCell>
              <TableCell>Supervisor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary" py={3}>
                    No hay registros disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              registros.map((registro) => (
                <TableRow key={registro.id} hover>
                  <TableCell>
                    {(() => {
                      try {
                        // Convertir fecha dd/MM/yyyy a formato válido para JavaScript
                        const [day, month, year] = registro.fecha.split('/');
                        const fechaValida = new Date(year, month - 1, day);
                        return format(fechaValida, 'dd/MM/yyyy');
                      } catch (error) {
                        // Si hay error, mostrar la fecha original
                        return registro.fecha;
                      }
                    })()}
                  </TableCell>
                  <TableCell>{registro.hora}</TableCell>
                  <TableCell>{registro.nombre_proveedor}</TableCell>
                  <TableCell>{registro.nombre_producto}</TableCell>
                  <TableCell>{registro.cantidad_solicitada}</TableCell>
                  <TableCell>
                    <Chip
                      label={registro.uniforme_completo}
                      color={getChipColor(registro.uniforme_completo)}
                      size="small"
                      sx={{ borderRadius: '12px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={registro.transporte_adecuado}
                      color={getChipColor(registro.transporte_adecuado)}
                      size="small"
                      sx={{ borderRadius: '12px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={registro.puntualidad}
                      color={getChipColor(registro.puntualidad)}
                      size="small"
                      sx={{ borderRadius: '12px' }}
                    />
                  </TableCell>
                  <TableCell>{registro.supervisor_nombre}</TableCell>
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
                  <MenuItem value="Excelente">Excelente</MenuItem>
                  <MenuItem value="Bueno">Bueno</MenuItem>
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Malo">Malo</MenuItem>
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
                  <MenuItem value="Excelente">Excelente</MenuItem>
                  <MenuItem value="Bueno">Bueno</MenuItem>
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Malo">Malo</MenuItem>
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
                  <MenuItem value="C">C</MenuItem>
                  <MenuItem value="NC">NC</MenuItem>
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
                  <MenuItem value="C">C</MenuItem>
                  <MenuItem value="NC">NC</MenuItem>
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
                  <MenuItem value="C">C</MenuItem>
                  <MenuItem value="NC">NC</MenuItem>
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
