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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ButtonGroup,
} from '@mui/material';
import { FileDownload as FileDownloadIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { haccpService } from '../../services/api';
import { 
  exportarRecepcionMercaderia, 
  exportarFormularioVacioFrutasVerduras,
  exportarFormularioVacioAbarrotes 
} from '../../utils/exportExcel';
import { format } from 'date-fns';

const RecepcionMercaderia = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('mes'); // 'dia', 'mes', 'anio'
  const [fechaEspecifica, setFechaEspecifica] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [tipo, setTipo] = useState('FRUTAS_VERDURAS');

  useEffect(() => {
    loadData();
  }, [filtroTipo, fechaEspecifica, mes, anio, tipo]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (filtroTipo === 'dia') {
        // Extraer mes y año de la fecha específica
        const fecha = new Date(fechaEspecifica);
        const mesEspecifico = fecha.getMonth() + 1;
        const anioEspecifico = fecha.getFullYear();
        response = await haccpService.getRecepcionMercaderia(mesEspecifico, anioEspecifico, tipo);
        
        // Filtrar por día específico
        if (response && response.success && Array.isArray(response.data)) {
          const fechaFiltro = format(fecha, 'yyyy-MM-dd');
          response.data = response.data.filter(item => {
            const fechaItem = format(new Date(item.fecha), 'yyyy-MM-dd');
            return fechaItem === fechaFiltro;
          });
        }
      } else if (filtroTipo === 'mes') {
        response = await haccpService.getRecepcionMercaderia(mes, anio, tipo);
      } else if (filtroTipo === 'anio') {
        // Para año completo, obtener todos los meses
        response = { success: true, data: [] };
        for (let m = 1; m <= 12; m++) {
          try {
            const mesResponse = await haccpService.getRecepcionMercaderia(m, anio, tipo);
            if (mesResponse && mesResponse.success && Array.isArray(mesResponse.data)) {
              response.data = [...response.data, ...mesResponse.data];
            }
          } catch (err) {
            console.warn(`Error cargando mes ${m}:`, err);
          }
        }
      }
      
      if (response && response.success) {
        setData(Array.isArray(response.data) ? response.data : []);
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
      
      if (data.length === 0) {
        // Exportar plantilla vacía
        await handleExportarPlantilla();
        return;
      }
      
      // Exportar con datos filtrados
      const mesExport = filtroTipo === 'dia' ? new Date(fechaEspecifica).getMonth() + 1 : mes;
      const anioExport = filtroTipo === 'dia' ? new Date(fechaEspecifica).getFullYear() : anio;
      
      await exportarRecepcionMercaderia(data, mesExport, anioExport, tipo);
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
      
      if (tipo === 'FRUTAS_VERDURAS') {
        await exportarFormularioVacioFrutasVerduras(mesExport, anioExport);
      } else {
        await exportarFormularioVacioAbarrotes(mesExport, anioExport);
      }
    } catch (err) {
      console.error('Error al exportar plantilla:', err);
      setError(`Error al exportar plantilla Excel: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Recepción de Mercadería
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
             variant="outlined"
             color="primary"
             onClick={handleExportarPlantilla}
             disabled={loading}
             startIcon={<FileDownloadIcon />}
           >
             Plantilla Vacía
           </Button>
           <Button
             variant="contained"
             color="success"
             onClick={handleExportar}
             disabled={loading}
             startIcon={<FileDownloadIcon />}
           >
             {data.length > 0 ? 'Exportar Datos' : 'Exportar Plantilla'}
           </Button>
        </Box>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Producto</InputLabel>
              <Select
                value={tipo}
                label="Tipo de Producto"
                onChange={(e) => setTipo(e.target.value)}
              >
                <MenuItem value="ABARROTES">Abarrotes</MenuItem>
                <MenuItem value="FRUTAS_VERDURAS">Frutas y Verduras</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <ButtonGroup variant="outlined" fullWidth>
               <Button
                 variant={filtroTipo === 'dia' ? 'contained' : 'outlined'}
                 onClick={() => setFiltroTipo('dia')}
                 startIcon={<FilterListIcon />}
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
              <FormControl fullWidth disabled={filtroTipo === 'anio'}>
                <InputLabel>Mes</InputLabel>
                <Select
                  value={mes}
                  label="Mes"
                  onChange={(e) => setMes(Number(e.target.value))}
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
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Año</InputLabel>
              <Select
                value={anio}
                label="Año"
                onChange={(e) => setAnio(Number(e.target.value))}
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
          
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              onClick={loadData}
              disabled={loading}
              fullWidth
              sx={{ height: '56px' }}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ minWidth: 100 }}><strong>Fecha</strong></TableCell>
                <TableCell sx={{ minWidth: 120 }}><strong>Hora</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>Proveedor</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>Producto</strong></TableCell>
                <TableCell sx={{ minWidth: 100 }}><strong>Cantidad</strong></TableCell>
                <TableCell sx={{ minWidth: 120 }}><strong>Estado</strong></TableCell>
                <TableCell sx={{ minWidth: 120 }}><strong>Conformidad</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>Responsable</strong></TableCell>
                <TableCell sx={{ minWidth: 200 }}><strong>Observaciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="text.secondary" py={3}>
                      No hay registros para los filtros seleccionados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{format(new Date(row.fecha), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{row.hora}</TableCell>
                    <TableCell>{row.nombre_proveedor}</TableCell>
                    <TableCell>{row.nombre_producto}</TableCell>
                    <TableCell>
                      {row.peso_unidad_recibido ? `${row.peso_unidad_recibido} ${row.unidad_medida}` : row.cantidad_solicitada || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.estado_producto || 'N/A'}
                        size="small"
                        color={
                          row.estado_producto === 'EXCELENTE' ? 'success' : 
                          row.estado_producto === 'REGULAR' ? 'warning' : 
                          row.estado_producto === 'PESIMO' ? 'error' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.conformidad_general || (row.producto_rechazado ? 'NO_CONFORME' : 'CONFORME')}
                        size="small"
                        color={
                          (row.conformidad_general === 'CONFORME' || !row.producto_rechazado) ? 'success' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>{row.responsable_registro_nombre}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.observaciones || '-'}
                    </TableCell>
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

export default RecepcionMercaderia;
