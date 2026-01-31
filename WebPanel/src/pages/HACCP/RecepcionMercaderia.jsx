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
  exportarRecepcionFrutasVerduras, 
  exportarFormularioVacioFrutasVerduras
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

  useEffect(() => {
    loadData();
  }, [filtroTipo, fechaEspecifica, mes, anio]);

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
        response = await haccpService.getRecepcionFrutasVerduras(mesEspecifico, anioEspecifico);
        
        // Filtrar por día específico
        if (response && response.success && Array.isArray(response.data)) {
          const fechaFiltro = format(fecha, 'yyyy-MM-dd');
          response.data = response.data.filter(item => {
            const fechaItem = format(new Date(item.fecha), 'yyyy-MM-dd');
            return fechaItem === fechaFiltro;
          });
        }
      } else if (filtroTipo === 'mes') {
        response = await haccpService.getRecepcionFrutasVerduras(mes, anio);
      } else if (filtroTipo === 'anio') {
        // Para año completo, obtener todos los meses
        response = { success: true, data: [] };
        for (let m = 1; m <= 12; m++) {
          try {
            const mesResponse = await haccpService.getRecepcionFrutasVerduras(m, anio);
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
      
      await exportarRecepcionFrutasVerduras(data, mesExport, anioExport);
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
      
      // Usar la función unificada para exportar plantilla vacía
      await exportarFormularioVacioFrutasVerduras(mesExport, anioExport);
    } catch (err) {
      console.error('Error al exportar plantilla:', err);
      setError(`Error al exportar plantilla Excel: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
          Recepción de Frutas y Verduras
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: '#666', 
            fontWeight: 400 
          }}
        >
          Control y registro de frutas y verduras recibidas
        </Typography>
      </Box>

      {/* Botones de exportación */}
      <Box className="export-buttons-container">
        <Button
          variant="outlined"
          color="primary"
          onClick={handleExportarPlantilla}
          disabled={loading}
          startIcon={<FileDownloadIcon />}
          className="export-button"
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
          color="success"
          onClick={handleExportar}
          disabled={loading}
          startIcon={<FileDownloadIcon />}
          className="export-button"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 40
          }}
        >
          {data.length > 0 ? 'Exportar Datos' : 'Exportar Plantilla'}
        </Button>
      </Box>

      {/* Filtros de búsqueda */}
      <Paper 
        elevation={2} 
        className="filters-container"
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
              color: '#333' 
            }}
          >
            Filtros de Búsqueda
          </Typography>
        </Box>
        <Grid container spacing={3} sx={{ mb: 3 }} alignItems="flex-start">
           <Grid item xs={12} md={3}>
             <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
               Período
             </Typography>
             <ButtonGroup 
               variant="outlined" 
               fullWidth 
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
           
           {filtroTipo === 'dia' && (
             <Grid item xs={12} md={3}>
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
           
           {(filtroTipo === 'mes' || filtroTipo === 'anio') && (
             <>
               {filtroTipo === 'mes' && (
                 <Grid item xs={12} md={2}>
                   <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                     Mes
                   </Typography>
                   <FormControl 
                     fullWidth 
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
                   >
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
              
              <Grid item xs={12} md={2}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                  Año
                </Typography>
                <FormControl 
                  fullWidth
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
                >
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
           
           <Grid item xs={12} md={2}>
             <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'transparent' }}>
               .
             </Typography>
             <Button
               variant="contained"
               onClick={loadData}
               disabled={loading}
               fullWidth
               sx={{ 
                 height: '56px',
                 fontSize: '14px',
                 padding: '0 16px',
                 borderRadius: 2,
                 textTransform: 'none',
                 fontWeight: 600,
                 '&:hover': {
                   transform: 'translateY(-1px)',
                   boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                 }
               }}
             >
               Buscar
             </Button>
           </Grid>
         </Grid>
       </Paper>

       {error && (
         <Alert 
           severity="error" 
           sx={{ 
             mb: 3,
             borderRadius: 2
           }}
         >
           {error}
         </Alert>
       )}

      {loading ? (
         <Box 
           sx={{ 
             display: 'flex', 
             justifyContent: 'center', 
             alignItems: 'center',
             py: 8,
             backgroundColor: 'white',
             borderRadius: 3,
             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
           }}
         >
           <CircularProgress />
         </Box>
       ) : (
         <Paper 
           elevation={2}
           sx={{
             borderRadius: 3,
             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
             border: '1px solid #e0e0e0',
             overflow: 'hidden'
           }}
         >
           {/* Encabezado de la tabla */}
           <Box sx={{ 
             p: 3, 
             borderBottom: '1px solid #e0e0e0',
             backgroundColor: '#fafafa'
           }}>
             <Typography 
               variant="h6" 
               sx={{ 
                 fontWeight: 600, 
                 color: '#333' 
               }}
             >
               Registros de Frutas y Verduras
               {data.length > 0 && (
                 <Typography 
                   component="span" 
                   sx={{ 
                     ml: 2, 
                     color: '#666', 
                     fontWeight: 400,
                     fontSize: '0.9rem'
                   }}
                 >
                   ({data.length} registro{data.length !== 1 ? 's' : ''})
                 </Typography>
               )}
             </Typography>
           </Box>

           <TableContainer>
             <Table size="small">
               <TableHead>
                 <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                   <TableCell sx={{ minWidth: 100, fontWeight: 600 }}>Fecha</TableCell>
                   <TableCell sx={{ minWidth: 120, fontWeight: 600 }}>Hora</TableCell>
                   <TableCell sx={{ minWidth: 150, fontWeight: 600 }}>Proveedor</TableCell>
                   <TableCell sx={{ minWidth: 150, fontWeight: 600 }}>Producto</TableCell>
                   <TableCell sx={{ minWidth: 100, fontWeight: 600 }}>Cantidad</TableCell>
                   <TableCell sx={{ minWidth: 120, fontWeight: 600 }}>Estado</TableCell>
                   <TableCell sx={{ minWidth: 120, fontWeight: 600 }}>Conformidad</TableCell>
                   <TableCell sx={{ minWidth: 110, fontWeight: 600 }}>Uniforme</TableCell>
                   <TableCell sx={{ minWidth: 110, fontWeight: 600 }}>Transporte</TableCell>
                   <TableCell sx={{ minWidth: 110, fontWeight: 600 }}>Puntualidad</TableCell>
                   <TableCell sx={{ minWidth: 150, fontWeight: 600 }}>Responsable</TableCell>
                   <TableCell sx={{ minWidth: 200, fontWeight: 600 }}>Observaciones</TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {data.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={12} align="center">
                       <Box sx={{ py: 6 }}>
                         <Typography 
                           color="text.secondary" 
                           sx={{ 
                             fontSize: '1.1rem',
                             fontWeight: 500
                           }}
                         >
                           No hay registros para los filtros seleccionados
                         </Typography>
                       </Box>
                     </TableCell>
                   </TableRow>
                 ) : (
                   data.map((row, index) => (
                     <TableRow 
                       key={index} 
                       sx={{
                         '&:hover': {
                           backgroundColor: '#f5f5f5'
                         }
                       }}
                     >
                       <TableCell sx={{ fontWeight: 500 }}>
                         {format(new Date(row.fecha), 'dd/MM/yyyy')}
                       </TableCell>
                       <TableCell>{row.hora}</TableCell>
                       <TableCell sx={{ fontWeight: 500 }}>
                         {row.nombre_proveedor}
                       </TableCell>
                       <TableCell>{row.nombre_producto}</TableCell>
                       <TableCell>
                         {row.peso_unidad_recibido ? `${row.peso_unidad_recibido} ${row.unidad_medida}` : row.cantidad_solicitada || 'N/A'}
                       </TableCell>
                       <TableCell>
                         <Chip
                           label={row.estado_producto || 'N/A'}
                           size="small"
                           sx={{
                             borderRadius: 2,
                             fontWeight: 600
                           }}
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
                           sx={{
                             borderRadius: 2,
                             fontWeight: 600
                           }}
                           color={
                             (row.conformidad_general === 'CONFORME' || !row.producto_rechazado) ? 'success' : 'error'
                           }
                         />
                       </TableCell>
                       <TableCell>
                         <Chip
                           label={row.uniforme_completo ? 'SÍ' : 'NO'}
                           size="small"
                           sx={{
                             borderRadius: 2,
                             fontWeight: 600
                           }}
                           color={row.uniforme_completo ? 'success' : 'error'}
                         />
                       </TableCell>
                       <TableCell>
                         <Chip
                           label={row.transporte_adecuado ? 'SÍ' : 'NO'}
                           size="small"
                           sx={{
                             borderRadius: 2,
                             fontWeight: 600
                           }}
                           color={row.transporte_adecuado ? 'success' : 'error'}
                         />
                       </TableCell>
                       <TableCell>
                         <Chip
                           label={row.puntualidad ? 'SÍ' : 'NO'}
                           size="small"
                           sx={{
                             borderRadius: 2,
                             fontWeight: 600
                           }}
                           color={row.puntualidad ? 'success' : 'error'}
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
         </Paper>
       )}
    </Box>
  );
};

export default RecepcionMercaderia;
