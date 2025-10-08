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
    <Box>
      {/* Header con controles */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Auditoría del Sistema
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registro completo de todas las acciones realizadas en el sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={exportarLogs}
          disabled={loading || logs.length === 0}
        >
          Exportar Excel
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom startIcon={<FilterListIcon />}>
          Filtros de Búsqueda
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          {/* Filtros de fecha */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Fecha Desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
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
            />
          </Grid>
          
          {/* Filtros avanzados */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
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
            <FormControl fullWidth>
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
                <TextField {...params} label="Usuario" fullWidth />
              )}
            />
          </Grid>
          
          {/* Botones de acción */}
          <Grid item xs={12}>
            <ButtonGroup variant="contained" sx={{ mt: 2 }}>
              <Button
                onClick={() => cargarLogs()}
                disabled={loading}
                startIcon={<FilterListIcon />}
              >
                Buscar
              </Button>
              <Button
                onClick={limpiarFiltros}
                disabled={loading}
                startIcon={<ClearIcon />}
                color="secondary"
              >
                Limpiar
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Fecha y Hora</strong></TableCell>
              <TableCell><strong>Usuario</strong></TableCell>
              <TableCell align="center"><strong>Acción</strong></TableCell>
              <TableCell><strong>Tabla</strong></TableCell>
              <TableCell align="center"><strong>ID Registro</strong></TableCell>
              <TableCell><strong>IP</strong></TableCell>
              <TableCell align="center"><strong>Detalles</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    No hay logs de auditoría para el período seleccionado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    {format(new Date(log.fecha_hora), 'dd/MM/yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    {log.usuario_nombre || log.usuario_email || 'Sistema'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={log.accion}
                      color={getAccionColor(log.accion)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.tabla_afectada || '-'}</TableCell>
                  <TableCell align="center">{log.registro_id || '-'}</TableCell>
                  <TableCell>{log.ip_address || '-'}</TableCell>
                  <TableCell align="center">
                    {log.datos_json && (
                      <Tooltip title="Ver detalles completos">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleVerDetalles(log)}
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
      />

      {/* Dialog para ver detalles del log */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles del Log de Auditoría
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Fecha y Hora:</strong>
                  </Typography>
                  <Typography variant="body1" mb={2}>
                    {format(new Date(selectedLog.fecha_hora), 'dd/MM/yyyy HH:mm:ss')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Usuario:</strong>
                  </Typography>
                  <Typography variant="body1" mb={2}>
                    {selectedLog.usuario_nombre || selectedLog.usuario_email || 'Sistema'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Acción:</strong>
                  </Typography>
                  <Typography variant="body1" mb={2}>
                    <Chip
                      label={selectedLog.accion}
                      color={getAccionColor(selectedLog.accion)}
                      size="small"
                    />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Tabla Afectada:</strong>
                  </Typography>
                  <Typography variant="body1" mb={2}>
                    {selectedLog.tabla_afectada || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>ID Registro:</strong>
                  </Typography>
                  <Typography variant="body1" mb={2}>
                    {selectedLog.registro_id || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>IP:</strong>
                  </Typography>
                  <Typography variant="body1" mb={2}>
                    {selectedLog.ip_address || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    <strong>Datos JSON:</strong>
                  </Typography>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: '#f5f5f5', 
                      maxHeight: 300, 
                      overflow: 'auto' 
                    }}
                  >
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {selectedLog.datos_json 
                        ? JSON.stringify(JSON.parse(selectedLog.datos_json), null, 2)
                        : 'Sin datos adicionales'}
                    </pre>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Auditoria;
