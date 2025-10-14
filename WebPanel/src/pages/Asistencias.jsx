import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Autocomplete
} from '@mui/material';
import { Download as DownloadIcon, FilterList as FilterListIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { fichadoService } from '../services/api';
import { exportarAsistencias } from '../utils/exportExcel';
import { format } from 'date-fns';

const Asistencias = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  
  // Nuevos estados para filtros avanzados
  const [filtroTipo, setFiltroTipo] = useState('mes'); // 'dia', 'mes', 'anio'
  const [fechaEspecifica, setFechaEspecifica] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    loadUsuarios();
  }, []);

  useEffect(() => {
    loadData();
  }, [filtroTipo, fechaEspecifica, mes, anio, usuarioSeleccionado]);

  const loadUsuarios = async () => {
    try {
      // Obtener lista de usuarios únicos de las asistencias
      const response = await fichadoService.getHistorial(new Date().getMonth() + 1, new Date().getFullYear());
      if (response && response.success && Array.isArray(response.data)) {
        const usuariosUnicos = response.data.reduce((acc, item) => {
          const usuario = {
            id: item.usuario_id,
            nombre: `${item.nombre} ${item.apellido}`,
            cargo: item.cargo,
            area: item.area
          };
          if (!acc.find(u => u.id === usuario.id)) {
            acc.push(usuario);
          }
          return acc;
        }, []);
        setUsuarios(usuariosUnicos);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (filtroTipo === 'dia') {
        // Para día específico, obtener el mes y año de la fecha
        const fecha = new Date(fechaEspecifica);
        const mesEspecifico = fecha.getMonth() + 1;
        const anioEspecifico = fecha.getFullYear();
        response = await fichadoService.getHistorial(mesEspecifico, anioEspecifico);
        
        // Filtrar por día específico
        if (response && response.success && Array.isArray(response.data)) {
          const fechaFiltro = format(fecha, 'yyyy-MM-dd');
          response.data = response.data.filter(item => {
            const fechaItem = format(new Date(item.fecha), 'yyyy-MM-dd');
            return fechaItem === fechaFiltro;
          });
        }
      } else if (filtroTipo === 'mes') {
        response = await fichadoService.getHistorial(mes, anio);
      } else if (filtroTipo === 'anio') {
        // Para año completo, obtener todos los meses
        response = { success: true, data: [] };
        for (let m = 1; m <= 12; m++) {
          try {
            const mesResponse = await fichadoService.getHistorial(m, anio);
            if (mesResponse && mesResponse.success && Array.isArray(mesResponse.data)) {
              response.data = [...response.data, ...mesResponse.data];
            }
          } catch (err) {
            console.warn(`Error cargando mes ${m}:`, err);
          }
        }
      }
      
      if (response && response.success) {
        let dataFiltrada = Array.isArray(response.data) ? response.data : [];
        
        // Filtrar por usuario si está seleccionado
        if (usuarioSeleccionado) {
          dataFiltrada = dataFiltrada.filter(item => item.usuario_id === usuarioSeleccionado.id);
        }
        
        setData(dataFiltrada);
      } else {
        setError(response?.error || 'Error cargando datos');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    try {
      setError('');
      setLoading(true);
      
      const mesExport = filtroTipo === 'dia' ? new Date(fechaEspecifica).getMonth() + 1 : mes;
      const anioExport = filtroTipo === 'dia' ? new Date(fechaEspecifica).getFullYear() : anio;
      
      if (data.length === 0) {
        // Exportar plantilla vacía
        await exportarAsistencias([], mesExport, anioExport);
      } else {
        // Exportar con datos filtrados
        await exportarAsistencias(data, mesExport, anioExport);
      }
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
      
      await exportarAsistencias([], mesExport, anioExport);
    } catch (err) {
      console.error('Error al exportar plantilla:', err);
      setError(`Error al exportar plantilla Excel: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PUNTUAL':
        return 'success';
      case 'TARDANZA':
        return 'warning';
      case 'FALTA':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          Asistencias
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexDirection: isMobile ? "column" : "row" }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleExportarPlantilla}
            disabled={loading}
            startIcon={!isMobile && <FileDownloadIcon />}
            fullWidth={isMobile}
            size={isMobile ? "medium" : "large"}
          >
            Plantilla Vacía
          </Button>
          <Button
            variant="contained"
            startIcon={!isMobile && <FileDownloadIcon />}
            onClick={handleExportar}
            disabled={loading}
            fullWidth={isMobile}
            size={isMobile ? "medium" : "large"}
          >
            {data.length > 0 ? 'Exportar Datos' : 'Exportar Plantilla'}
          </Button>
        </Box>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <ButtonGroup variant="outlined" fullWidth>
              <Button
                variant={filtroTipo === 'dia' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('dia')}
                startIcon={<FilterListIcon />}
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
          
          {filtroTipo === 'dia' && (
            <Grid item xs={12} md={2}>
              <TextField
                type="date"
                label="Fecha Específica"
                value={fechaEspecifica}
                onChange={(e) => setFechaEspecifica(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}
          
          {(filtroTipo === 'mes' || filtroTipo === 'anio') && (
            <Grid item xs={12} md={2}>
              <TextField
                label="Mes"
                type="number"
                fullWidth
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                inputProps={{ min: 1, max: 12 }}
                disabled={filtroTipo === 'anio'}
              />
            </Grid>
          )}
          
          <Grid item xs={12} md={2}>
            <TextField
              label="Año"
              type="number"
              fullWidth
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              inputProps={{ min: 2020, max: 2030 }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={usuarios}
              getOptionLabel={(option) => `${option.nombre} - ${option.cargo || 'Sin cargo'}`}
              value={usuarioSeleccionado}
              onChange={(event, newValue) => setUsuarioSeleccionado(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filtrar por Usuario"
                  placeholder="Seleccionar usuario..."
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
            />
          </Grid>
          
          <Grid item xs={12} md={1}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={loadData}
              disabled={loading}
              sx={{ height: '56px' }}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Fecha</strong></TableCell>
                <TableCell><strong>Usuario</strong></TableCell>
                <TableCell><strong>Cargo</strong></TableCell>
                <TableCell><strong>Área</strong></TableCell>
                <TableCell><strong>Entrada</strong></TableCell>
                <TableCell><strong>Salida</strong></TableCell>
                <TableCell><strong>Horas</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Método</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="text.secondary" py={3}>
                      No hay registros para el período seleccionado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(new Date(row.fecha), 'dd/MM/yyyy')}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.nombre} {row.apellido}</TableCell>
                    {!isMobile && <TableCell>{row.cargo || '-'}</TableCell>}
                    {!isMobile && <TableCell>{row.area || '-'}</TableCell>}
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.hora_entrada || '-'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.hora_salida || '-'}</TableCell>
                    <TableCell>{row.horas_trabajadas ? `${row.horas_trabajadas}h` : '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.estado || 'N/A'}
                        color={getEstadoColor(row.estado)}
                        size="small"
                      />
                    </TableCell>
                    {!isMobile && <TableCell>{row.metodo_fichado || '-'}</TableCell>}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Asistencias;
