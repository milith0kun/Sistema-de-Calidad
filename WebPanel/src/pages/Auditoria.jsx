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
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TablePagination,
  ButtonGroup,
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { auditoriaService } from '../services/api';
import { format } from 'date-fns';

const Auditoria = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Nuevos estados para filtros avanzados
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroTabla, setFiltroTabla] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [acciones, setAcciones] = useState([]);
  const [tablas, setTablas] = useState([]);
  
  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalLogs, setTotalLogs] = useState(0);

  const cargarLogs = async (resetPage = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: resetPage ? 0 : page,
        limit: rowsPerPage
      };
      
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      if (filtroAccion) params.accion = filtroAccion;
      if (filtroTabla) params.tabla = filtroTabla;
      if (filtroUsuario) params.usuario = filtroUsuario;
      
      const response = await auditoriaService.getLogs(params);
      
      if (response.success) {
        setLogs(response.data?.logs || []);
        setTotalLogs(response.data?.total || 0);
        if (resetPage) setPage(0);
      } else {
        setError(response.error || 'Error al cargar los logs');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error('Error cargando logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    setFechaHasta(hoy.toISOString().split('T')[0]);
    setFechaDesde(hace30Dias.toISOString().split('T')[0]);
    
    cargarFiltros();
    cargarLogs();
  }, []);

  // Cargar cuando cambie la página
  useEffect(() => {
    if (fechaDesde && fechaHasta) {
      cargarLogs(false);
    }
  }, [page, rowsPerPage]);

  const cargarFiltros = async () => {
    try {
      const response = await auditoriaService.getFiltros();
      if (response.success) {
        setUsuarios(response.data?.usuarios || []);
        setAcciones(response.data?.acciones || []);
        setTablas(response.data?.tablas || []);
      }
    } catch (err) {
      console.error('Error cargando filtros:', err);
    }
  };

  const limpiarFiltros = () => {
    setFiltroAccion('');
    setFiltroTabla('');
    setFiltroUsuario('');
    cargarLogs();
  };

  const exportarLogs = async () => {
    try {
      const params = {};
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      if (filtroAccion) params.accion = filtroAccion;
      if (filtroTabla) params.tabla = filtroTabla;
      if (filtroUsuario) params.usuario = filtroUsuario;
      
      const response = await auditoriaService.exportarLogs(params);
      
      if (response.success) {
        // Crear y descargar archivo
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auditoria_${fechaDesde}_${fechaHasta}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError('Error al exportar logs');
      console.error('Error exportando:', err);
    }
  };

  useEffect(() => {
    if (fechaDesde && fechaHasta) {
      cargarLogs();
    }
  }, [fechaDesde, fechaHasta]);

  const getAccionColor = (accion) => {
    const colores = {
      'LOGIN': 'info',
      'LOGOUT': 'default',
      'CREATE': 'success',
      'UPDATE': 'warning',
      'DELETE': 'error',
    };
    return colores[accion] || 'default';
  };

  const handleVerDetalles = (log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLog(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          Auditoría del Sistema
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ fontWeight: 400 }}
        >
          Registro completo de todas las acciones realizadas en el sistema
        </Typography>
      </Box>

      {/* Mensajes de estado */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 1
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Sección de filtros */}
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <FilterListIcon />
            Filtros de Búsqueda
          </Typography>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={exportarLogs}
            disabled={loading || logs.length === 0}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 40
            }}
          >
            Exportar Excel
          </Button>
        </Box>
        
        <Grid container spacing={3} alignItems="center">
          {/* Filtros de fecha */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Fecha Desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#fff'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Fecha Hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#fff'
                }
              }}
            />
          </Grid>
          
          {/* Filtros avanzados */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl 
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#fff'
                }
              }}
            >
              <InputLabel>Acción</InputLabel>
              <Select
                value={filtroAccion}
                onChange={(e) => setFiltroAccion(e.target.value)}
                label="Acción"
              >
                <MenuItem value="">Todas</MenuItem>
                {acciones.map((accion) => (
                  <MenuItem key={accion} value={accion}>
                    {accion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl 
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#fff'
                }
              }}
            >
              <InputLabel>Tabla</InputLabel>
              <Select
                value={filtroTabla}
                onChange={(e) => setFiltroTabla(e.target.value)}
                label="Tabla"
              >
                <MenuItem value="">Todas</MenuItem>
                {tablas.map((tabla) => (
                  <MenuItem key={tabla} value={tabla}>
                    {tabla}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={2}>
            <Autocomplete
              options={usuarios}
              getOptionLabel={(option) => option.nombre || option.email || ''}
              value={usuarios.find(u => u.id === filtroUsuario) || null}
              onChange={(event, newValue) => setFiltroUsuario(newValue?.id || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Usuario"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: '#fff'
                    }
                  }}
                />
              )}
            />
          </Grid>
        </Grid>

        {/* Botones de acción */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mt: 3,
          justifyContent: 'flex-end'
        }}>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={limpiarFiltros}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 40
            }}
          >
            Limpiar Filtros
          </Button>
        </Box>
      </Paper>

      {/* Tabla de logs */}
      <Paper sx={{ 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        {/* Encabezado de la tabla */}
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
            Registros de Auditoría
            {logs.length > 0 && (
              <Typography 
                component="span" 
                variant="body2" 
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                ({logs.length} registros)
              </Typography>
            )}
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Fecha y Hora</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Acción</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tabla</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>ID Registro</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Detalles</TableCell>
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
                        Cargando logs de auditoría...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
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
                        No hay logs de auditoría para el período seleccionado
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => (
                  <TableRow 
                    key={index} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f8f9fa'
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>
                      {format(new Date(log.fecha_hora), 'dd/MM/yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {log.usuario_nombre || log.usuario_email || 'Sistema'}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={log.accion}
                        color={getAccionColor(log.accion)}
                        size="small"
                        sx={{ 
                          borderRadius: 1,
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>{log.tabla_afectada || '-'}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500 }}>
                      {log.registro_id || '-'}
                    </TableCell>
                    <TableCell>{log.ip_address || '-'}</TableCell>
                    <TableCell align="center">
                      {log.datos_json && (
                        <Tooltip title="Ver detalles completos">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleVerDetalles(log)}
                            sx={{
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'white'
                              }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={totalLogs}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        />
      </Paper>

      {/* Diálogo para ver detalles del log */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontWeight: 600
        }}>
          Detalles del Log de Auditoría
          <IconButton 
            onClick={handleCloseDialog}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'white'
              }
            }}
          >
            <ClearIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ pt: 3 }}>
          {selectedLog && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Fecha y Hora:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                    {format(new Date(selectedLog.fecha_hora), 'dd/MM/yyyy HH:mm:ss')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Usuario:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                    {selectedLog.usuario_nombre || selectedLog.usuario_email || 'Sistema'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Acción:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={selectedLog.accion}
                      color={getAccionColor(selectedLog.accion)}
                      size="small"
                      sx={{ 
                        borderRadius: 1,
                        fontWeight: 500
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Tabla Afectada:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                    {selectedLog.tabla_afectada || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    ID del Registro:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                    {selectedLog.registro_id || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Dirección IP:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                    {selectedLog.ip_address || '-'}
                  </Typography>
                </Grid>
                {selectedLog.datos_json && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                      Datos JSON:
                    </Typography>
                    <Paper sx={{ 
                      p: 2, 
                      backgroundColor: '#f8f9fa',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <pre style={{ 
                        margin: 0, 
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {JSON.stringify(selectedLog.datos_json, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{
          p: 3,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Button 
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 100,
              minHeight: 40
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Auditoria;
