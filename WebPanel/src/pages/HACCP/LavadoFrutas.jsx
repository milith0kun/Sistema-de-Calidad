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
  
  // Estados para filtros simplificados según especificaciones HACCP
  const [filtroTipo, setFiltroTipo] = useState('mes'); // 'dia', 'mes', 'anio'
  const [fechaEspecifica, setFechaEspecifica] = useState('');
  const [areaSeleccionada, setAreaSeleccionada] = useState('');
  const [frutaSeleccionada, setFrutaSeleccionada] = useState('');
  
  // Estados para opciones de filtros
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
      
      // Agregar filtros adicionales (solo área y fruta según especificaciones)
      if (areaSeleccionada) params.area = areaSeleccionada;
      if (frutaSeleccionada) params.fruta = frutaSeleccionada;
      
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
  }, [filtroTipo, fechaEspecifica, mes, anio, areaSeleccionada, frutaSeleccionada]);

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
    setAreaSeleccionada('');
    setFrutaSeleccionada('');
    setMes(new Date().getMonth() + 1);
    setAnio(new Date().getFullYear());
    setProductoQuimico('');
    setConcentracion('');
  };

  const getConformidadColor = (conformidad) => {
    return conformidad === 'C' ? 'success' : 'error';
  };

  return (
    <Box 
      sx={{ 
        p: 3, 
        backgroundColor: '#f8f9fa', 
        minHeight: '100vh' 
      }}
    >
      {/* Encabezado de la página */}
      <Box 
        sx={{ 
          mb: 4, 
          pb: 2, 
          borderBottom: '2px solid #e0e0e0' 
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: '#2c3e50', 
            mb: 1,
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
          }}
        >
          Lavado y Desinfección de Frutas
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#6c757d', 
            fontSize: '1.1rem' 
          }}
        >
          Registro de procedimientos de lavado y desinfección de frutas y verduras
        </Typography>
      </Box>

      {/* Botones de exportación */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2, 
          mb: 3 
        }}
      >
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportarPlantilla}
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 40
          }}
        >
          Plantilla Vacía
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportar}
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 40
          }}
        >
          {registros.length === 0 ? 'Exportar Plantilla' : 'Exportar Datos'}
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2
          }} 
          onClose={() => setError(null)}
        >
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
            <FilterListIcon />
            Filtros de Búsqueda
          </Typography>
        </Box>
        
        <Grid container spacing={2} alignItems="flex-start">
          {/* Primera fila: Período y filtros de fecha/mes/año */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
              Período
            </Typography>
            <ButtonGroup 
              fullWidth 
              variant="outlined"
              sx={{ height: '56px' }}
            >
              <Button
                variant={filtroTipo === 'dia' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('dia')}
                sx={{
                  borderRadius: '8px 0 0 8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  height: '56px'
                }}
              >
                Día
              </Button>
              <Button
                variant={filtroTipo === 'mes' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('mes')}
                sx={{
                  borderRadius: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                  height: '56px'
                }}
              >
                Mes
              </Button>
              <Button
                variant={filtroTipo === 'anio' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('anio')}
                sx={{
                  borderRadius: '0 8px 8px 0',
                  textTransform: 'none',
                  fontWeight: 600,
                  height: '56px'
                }}
              >
                Año
              </Button>
            </ButtonGroup>
          </Grid>

          {/* Selector de fecha específica (solo para día) */}
          {filtroTipo === 'dia' && (
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
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
          )}

          {/* Selectores de mes y año (para mes y año) */}
          {(filtroTipo === 'mes' || filtroTipo === 'anio') && (
            <>
              {filtroTipo === 'mes' && (
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                    Mes
                  </Typography>
                  <FormControl fullWidth sx={{
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
                  }}>
                    <Select
                      value={mes}
                      onChange={(e) => setMes(Number(e.target.value))}
                      displayEmpty
                    >
                      {[
                        { value: 1, label: 'Enero' },
                        { value: 2, label: 'Febrero' },
                        { value: 3, label: 'Marzo' },
                        { value: 4, label: 'Abril' },
                        { value: 5, label: 'Mayo' },
                        { value: 6, label: 'Junio' },
                        { value: 7, label: 'Julio' },
                        { value: 8, label: 'Agosto' },
                        { value: 9, label: 'Septiembre' },
                        { value: 10, label: 'Octubre' },
                        { value: 11, label: 'Noviembre' },
                        { value: 12, label: 'Diciembre' }
                      ].map((month) => (
                        <MenuItem key={month.value} value={month.value}>
                          {month.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                  Año
                </Typography>
                <FormControl fullWidth sx={{
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
                }}>
                  <Select
                    value={anio}
                    onChange={(e) => setAnio(Number(e.target.value))}
                    displayEmpty
                  >
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {/* Filtros adicionales en la misma fila */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
              Área
            </Typography>
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
                  placeholder="Todas las áreas"
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
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
              Fruta/Verdura
            </Typography>
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
                  placeholder="Todas las frutas"
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
              )}
            />
          </Grid>

          {/* Segunda fila: Campos adicionales y botones */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
              Producto Químico
            </Typography>
            <TextField
              value={productoQuimico}
              onChange={(e) => setProductoQuimico(e.target.value)}
              fullWidth
              placeholder="Ej: Cloro"
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

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
              Concentración
            </Typography>
            <TextField
              value={concentracion}
              onChange={(e) => setConcentracion(e.target.value)}
              fullWidth
              placeholder="Ej: 200 ppm"
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

          {/* Botones de acción */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'transparent' }}>
              .
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={cargarRegistros}
                disabled={loading}
                startIcon={<FilterListIcon />}
                sx={{
                  height: '56px',
                  fontSize: '14px',
                  padding: '0 16px',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  flex: 1,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }}
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                onClick={limpiarFiltros}
                disabled={loading}
                startIcon={<ClearIcon />}
                sx={{
                  height: '56px',
                  fontSize: '14px',
                  padding: '0 16px',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  flex: 1,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          py={6}
          sx={{
            backgroundColor: '#fafafa',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {!loading && (
        <Paper 
          elevation={2}
          sx={{
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{
              p: 2,
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#f8f9fa'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              Registros de Lavado de Frutas ({registros.length})
            </Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Hora</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fruta/Verdura</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Producto Químico</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Concentración</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Lavado Agua Potable</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Desinfección</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Concentración Correcta</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Tiempo (min)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acciones Correctivas</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Supervisor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      <Box py={4}>
                        <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 500, color: '#666' }}>
                          No se encontraron registros
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  registros.map((row, index) => (
                    <TableRow 
                      key={index}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f8f9fa'
                        }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>
                        {format(new Date(row.fecha), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{row.hora}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {row.nombre_fruta_verdura}
                      </TableCell>
                      <TableCell>{row.producto_quimico}</TableCell>
                      <TableCell>{row.concentracion_producto}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.lavado_agua_potable === 'C' ? 'Conforme' : 'No Conforme'}
                          color={getConformidadColor(row.lavado_agua_potable)}
                          size="small"
                          sx={{ 
                            borderRadius: 2,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.desinfeccion_producto_quimico === 'C' ? 'Conforme' : 'No Conforme'}
                          color={getConformidadColor(row.desinfeccion_producto_quimico)}
                          size="small"
                          sx={{ 
                            borderRadius: 2,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.concentracion_correcta === 'C' ? 'Conforme' : 'No Conforme'}
                          color={getConformidadColor(row.concentracion_correcta)}
                          size="small"
                          sx={{ 
                            borderRadius: 2,
                            fontWeight: 500
                          }}
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
        </Paper>
      )}
    </Box>
  );
};

export default LavadoFrutas;
