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
  Card,
  CardContent,
} from '@mui/material';
import {
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';
import { haccpService } from '../../services/api';
import { exportarLavadoManos, exportarFormularioVacioLavadoManos } from '../../utils/exportExcel';
import { format } from 'date-fns';
import FormularioLavadoManos from '../../components/FormularioLavadoManos';

const LavadoManos = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtros simplificados según especificaciones HACCP
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [filtroTipo, setFiltroTipo] = useState('mes');
  const [fechaEspecifica, setFechaEspecifica] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Eliminado: filtro por área ya que todos los reportes son de "Salón y Cocina"

  // Estados para el formulario
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  const [supervisores, setSupervisores] = useState([]);

  // Eliminado: áreas fijas ya que no se necesita filtro

  // Función para cargar registros sin filtro de área
  const cargarRegistros = async () => {
    try {
      setLoading(true);
      setError('');

      let params = {};

      // Filtrado por fecha según tipo seleccionado
      if (filtroTipo === 'dia') {
        params.fecha = fechaEspecifica;
      } else if (filtroTipo === 'mes') {
        params.mes = mes;
        params.anio = anio;
      } else if (filtroTipo === 'anio') {
        params.anio = anio;
      }

      // Eliminado: filtro por área ya que todos los datos son de "Salón y Cocina"

      const response = await haccpService.getLavadoManos(params);
      setRegistros(response.data || []);
    } catch (error) {
      console.error('Error al cargar registros:', error);
      setError('Error al cargar los registros de lavado de manos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  useEffect(() => {
    cargarRegistros();
  }, [filtroTipo, fechaEspecifica, mes, anio]); // Eliminado: areaSeleccionada

  // Cargar empleados y supervisores al montar el componente
  useEffect(() => {
    cargarEmpleados();
    cargarSupervisores();
  }, []);

  // Función para cargar empleados
  const cargarEmpleados = async () => {
    try {
      const response = await haccpService.getEmpleados();
      setEmpleados(response.data || []);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  };

  // Función para cargar supervisores
  const cargarSupervisores = async () => {
    try {
      const response = await haccpService.getSupervisores();
      setSupervisores(response.data || []);
    } catch (error) {
      console.error('Error al cargar supervisores:', error);
    }
  };

  // Manejar éxito del formulario
  const handleFormularioExito = (nuevoRegistro) => {
    // Recargar registros para mostrar el nuevo
    cargarRegistros();
    setFormularioAbierto(false);
  };

  const handleExportar = async () => {
    try {
      setError('');
      setLoading(true);

      const mesExport = filtroTipo === 'dia' ? new Date(fechaEspecifica).getMonth() + 1 : mes;
      const anioExport = filtroTipo === 'dia' ? new Date(fechaEspecifica).getFullYear() : anio;

      // Obtener TODOS los registros sin filtrar por área para el Excel
      let paramsExport = {};

      // Solo filtrar por fecha, NO por área
      if (filtroTipo === 'dia') {
        paramsExport.fecha = fechaEspecifica;
      } else if (filtroTipo === 'mes') {
        paramsExport.mes = mes;
        paramsExport.anio = anio;
      } else if (filtroTipo === 'anio') {
        paramsExport.anio = anio;
      }

      // Obtener todos los registros para el Excel (sin filtro de área)
      const responseExport = await haccpService.getLavadoManos(paramsExport);
      const registrosParaExcel = responseExport.data || [];

      if (registrosParaExcel.length === 0) {
        // Exportar plantilla vacía
        await handleExportarPlantilla();
        return;
      }

      // Exportar con TODOS los datos (sin filtrar por área)
      await exportarLavadoManos(registrosParaExcel, mesExport, anioExport);
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
      await exportarFormularioVacioLavadoManos(mesExport, anioExport);
    } catch (err) {
      console.error('Error al exportar plantilla:', err);
      setError(`Error al exportar plantilla Excel: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setMes(new Date().getMonth() + 1);
    setAnio(new Date().getFullYear());
    setFiltroTipo('mes');
    setFechaEspecifica(format(new Date(), 'yyyy-MM-dd'));
    // Eliminado: setAreaSeleccionada('');
  };

  const getProcedimientoColor = (correcto) => {
    return correcto === 'Sí' ? 'success' : 'error';
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
        pb: 2,
        borderBottom: '2px solid',
        borderColor: 'primary.main'
      }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            mb: 1
          }}
        >
          Control de Lavado de Manos
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ fontWeight: 400 }}
        >
          Registro y seguimiento de controles de higiene
        </Typography>
      </Box>

      {/* Botones de exportar */}
      <Box sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        flexWrap: 'wrap'
      }}>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportarPlantilla}
          disabled={loading}
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 40
          }}
        >
          Plantilla Vacía
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportar}
          disabled={loading}
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 40
          }}
        >
          {registros.length === 0 ? 'Exportar Plantilla' : 'Exportar Datos'}
        </Button>
      </Box>

      {/* Sección de controles */}
      <Card sx={{
        mb: 3,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 1
            }}
          >
            Filtros y Acciones
          </Typography>

          <Grid container spacing={3} alignItems="flex-start">
            {/* Selector de tipo de filtro */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
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

            {/* Selector de fecha específica (solo para día) */}
            {filtroTipo === 'dia' && (
              <Grid item xs={12} sm={6} md={3}>
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

            {/* Selectores de mes y año */}
            {(filtroTipo === 'mes' || filtroTipo === 'anio') && (
              <>
                {filtroTipo === 'mes' && (
                  <Grid item xs={12} sm={6} md={2}>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
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
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
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

            {/* Botones de acción */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, visibility: 'hidden' }}>
                Acciones
              </Typography>
              <Box sx={{
                display: 'flex',
                gap: 1.5,
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setFormularioAbierto(true)}
                  sx={{
                    height: '56px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: '8px',
                    flex: 1,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    }
                  }}
                >
                  Nuevo
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GetAppIcon />}
                  onClick={handleExportar}
                  disabled={loading}
                  sx={{
                    height: '56px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: '8px',
                    flex: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    }
                  }}
                >
                  Exportar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Mensaje de error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 1
          }}
        >
          {error}
        </Alert>
      )}

      {/* Tabla de registros */}
      <Card sx={{
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{
            p: 3,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Registros de Control
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {registros.length} registro{registros.length !== 1 ? 's' : ''} encontrado{registros.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <Box className="table-container">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Hora</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Área</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Empleado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Turno</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Procedimiento</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acción Correctiva</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Supervisor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <CircularProgress />
                        <Typography color="text.secondary">
                          Cargando registros...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : registros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography color="text.secondary" variant="h6">
                          No hay registros
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          No se encontraron registros para el período seleccionado
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  registros.map((registro, index) => (
                    <TableRow
                      key={registro.id || index}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f8f9fa'
                        }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>
                        {format(new Date(registro.fecha), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{registro.hora}</TableCell>
                      <TableCell>
                        <Chip
                          label={registro.area_trabajo}
                          size="small"
                          sx={{
                            borderRadius: 1,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {registro.empleado_nombre}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={registro.turno || 'No especificado'}
                          size="small"
                          color="info"
                          sx={{
                            borderRadius: 1,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={registro.procedimiento_correcto === 'C' ? 'Conforme' : 'No Conforme'}
                          size="small"
                          color={registro.procedimiento_correcto === 'C' ? 'success' : 'error'}
                          sx={{
                            borderRadius: 1,
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {registro.accion_correctiva || '-'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {registro.supervisor_nombre}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      {/* Formulario para nuevo registro */}
      <FormularioLavadoManos
        open={formularioAbierto}
        onClose={() => setFormularioAbierto(false)}
        onSuccess={handleFormularioExito}
        empleados={empleados}
        supervisores={supervisores}
      />
    </Box>
  );
};

export default LavadoManos;
