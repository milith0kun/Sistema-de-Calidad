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
import { exportarTemperaturaCamaras, exportarFormularioVacioTemperaturaCamaras } from '../../utils/exportExcel';
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

      // Usar función local para exportar plantilla vacía
      await exportarFormularioVacioTemperaturaCamaras(mesExport, anioExport);
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
    <Box sx={{
      p: 3,
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Encabezado de la página */}
      <Box sx={{
        mb: 4,
        pb: 3,
        borderBottom: '2px solid #e0e0e0'
      }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1976d2',
            mb: 1,
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
          }}
        >
          Control de Temperatura de Cámaras
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: '#666',
            fontWeight: 400
          }}
        >
          Monitoreo diario de temperaturas de cámaras refrigeradas y congeladas
        </Typography>
      </Box>

      {/* Botones de exportación */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mb: 3,
        gap: 2
      }}>
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
          {registros.length > 0 ? 'Exportar Datos' : 'Exportar Plantilla'}
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

      {/* Filtros de búsqueda */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e0e0'
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          pb: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <FilterListIcon />
            Filtros de Búsqueda
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="flex-start">
          {/* Período */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#333',
                mb: 1,
                fontSize: '0.875rem'
              }}
            >
              Período
            </Typography>
            <ButtonGroup
              fullWidth
              variant="outlined"
              sx={{
                height: '56px',
                display: 'flex',
                '& .MuiButton-root': {
                  flex: 1,
                  height: '56px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white'
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

          {/* Fecha Específica (solo para día) */}
          {filtroTipo === 'dia' && (
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: '#333',
                  mb: 1,
                  fontSize: '0.875rem'
                }}
              >
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
                  '& .MuiInputBase-root': {
                    height: '56px'
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem',
                    padding: '14px 16px'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2
                    }
                  }
                }}
              />
            </Grid>
          )}

          {/* Mes (para filtro mes) */}
          {filtroTipo === 'mes' && (
            <Grid item xs={6} sm={3} md={2}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: '#333',
                  mb: 1,
                  fontSize: '0.875rem'
                }}
              >
                Mes
              </Typography>
              <TextField
                type="number"
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                fullWidth
                inputProps={{ min: 1, max: 12 }}
                sx={{
                  height: '56px',
                  '& .MuiInputBase-root': {
                    height: '56px'
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem',
                    padding: '14px 16px'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2
                    }
                  }
                }}
              />
            </Grid>
          )}

          {/* Año */}
          {(filtroTipo === 'mes' || filtroTipo === 'anio') && (
            <Grid item xs={6} sm={3} md={2}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: '#333',
                  mb: 1,
                  fontSize: '0.875rem'
                }}
              >
                Año
              </Typography>
              <TextField
                type="number"
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                fullWidth
                inputProps={{ min: 2020, max: 2030 }}
                sx={{
                  height: '56px',
                  '& .MuiInputBase-root': {
                    height: '56px'
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem',
                    padding: '14px 16px'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2
                    }
                  }
                }}
              />
            </Grid>
          )}

          {/* Filtro por cámara */}
          <Grid item xs={12} sm={8} md={3}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#333',
                mb: 1,
                fontSize: '0.875rem'
              }}
            >
              Cámara
            </Typography>
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
                  placeholder="Todas las cámaras"
                  sx={{
                    height: '56px',
                    '& .MuiInputBase-root': {
                      height: '56px'
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.875rem',
                      padding: '14px 16px'
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: 2
                      }
                    }
                  }}
                />
              )}
            />
          </Grid>

          {/* Botón Buscar */}
          <Grid item xs={12} sm={4} md={1}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#333',
                mb: 1,
                fontSize: '0.875rem'
              }}
            >
              &nbsp;
            </Typography>
            <Button
              variant="contained"
              onClick={cargarRegistros}
              disabled={loading}
              startIcon={<FilterListIcon />}
              fullWidth
              sx={{
                height: '56px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.5)'
                }
              }}
            >
              Buscar
            </Button>
          </Grid>

          {/* Botón Limpiar */}
          <Grid item xs={12} sm={4} md={1}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#333',
                mb: 1,
                fontSize: '0.875rem'
              }}
            >
              &nbsp;
            </Typography>
            <Button
              variant="outlined"
              onClick={limpiarFiltros}
              disabled={loading}
              startIcon={<ClearIcon />}
              fullWidth
              sx={{
                height: '56px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none'
              }}
            >
              Limpiar
            </Button>
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
              Registros de Temperatura ({registros.length})
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Cámara</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Temp. Mañana (°C)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Temp. Tarde (°C)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Conformidad Mañana</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Conformidad Tarde</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acciones Correctivas</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Supervisor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
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
                      <TableCell sx={{ fontWeight: 500 }}>
                        {row.camara_nombre}
                      </TableCell>
                      <TableCell>{row.temperatura_manana}°C</TableCell>
                      <TableCell>{row.temperatura_tarde}°C</TableCell>
                      <TableCell>
                        <Chip
                          label={row.conformidad_manana === 'C' ? 'Conforme' : 'No Conforme'}
                          color={getConformidadColor(row.conformidad_manana)}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.conformidad_tarde === 'C' ? 'Conforme' : 'No Conforme'}
                          color={getConformidadColor(row.conformidad_tarde)}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            fontWeight: 500
                          }}
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
        </Paper>
      )}
    </Box>
  );
};

export default TemperaturaCamaras;
