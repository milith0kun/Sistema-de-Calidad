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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header mejorado */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'center', sm: 'center' }}
        gap={{ xs: 2, sm: 3 }}
        mb={{ xs: 3, sm: 4 }}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 3,
          p: { xs: 3, sm: 4 },
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.1)'
        }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          fontWeight="bold"
          sx={{ 
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
            flex: 1,
            textAlign: { xs: 'center', sm: 'left' },
            color: 'primary.main',
            letterSpacing: '-0.02em'
          }}
        >
          Asistencias
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            gap: { xs: 2, sm: 3 }, 
            flexDirection: { xs: "column", sm: "row" },
            width: { xs: '100%', sm: 'auto' },
            minWidth: { sm: 'fit-content' },
            alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'flex-end' }
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={handleExportarPlantilla}
            disabled={loading}
            startIcon={!isMobile && <FileDownloadIcon />}
            fullWidth={isMobile}
            size={isMobile ? "large" : "large"}
            sx={{ 
              minWidth: { xs: '100%', sm: 160 },
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 600,
              height: { xs: '48px', sm: '52px' },
              borderRadius: 2,
              textTransform: 'none',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }
            }}
          >
            Plantilla Vacía
          </Button>
          <Button
            variant="contained"
            startIcon={!isMobile && <FileDownloadIcon />}
            onClick={handleExportar}
            disabled={loading}
            fullWidth={isMobile}
            size={isMobile ? "large" : "large"}
            sx={{ 
              minWidth: { xs: '100%', sm: 160 },
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 600,
              height: { xs: '48px', sm: '52px' },
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(99, 102, 241, 0.5)'
              }
            }}
          >
            {data.length > 0 ? 'Exportar Datos' : 'Exportar Plantilla'}
          </Button>
        </Box>
      </Box>

      {/* Panel de filtros mejorado */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 4, sm: 5, md: 6 }, 
          mb: { xs: 4, sm: 5 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
          border: '1px solid rgba(99, 102, 241, 0.12)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.08)'
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            mb: 4,
            fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.5rem' },
            fontWeight: 700,
            color: 'primary.main',
            textAlign: { xs: 'center', sm: 'left' },
            letterSpacing: '-0.01em'
          }}
        >
          Filtros de Búsqueda
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="flex-start">
          {/* Filtro de tipo de período */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              Período
            </Typography>
            <ButtonGroup 
              variant="outlined" 
              fullWidth
              size={isMobile ? "small" : "medium"}
              sx={{
                height: '56px',
                display: 'flex',
                '& .MuiButton-root': {
                  flex: 1,
                  height: '56px',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: 0,
                  '&:first-of-type': {
                    borderTopLeftRadius: '8px',
                    borderBottomLeftRadius: '8px'
                  },
                  '&:last-of-type': {
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px'
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    borderColor: 'primary.main'
                  },
                  '&.MuiButton-contained': {
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none'
                    }
                  }
                }
              }}
            >
              <Button
                variant={filtroTipo === 'dia' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('dia')}
                startIcon={!isMobile && <FilterListIcon />}
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
          
          {/* Filtro de fecha específica */}
          {filtroTipo === 'dia' && (
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                Fecha Específica
              </Typography>
              <TextField
                type="date"
                value={fechaEspecifica}
                onChange={(e) => setFechaEspecifica(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="medium"
                sx={{
                  '& .MuiInputBase-root': {
                    height: '56px'
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
              />
            </Grid>
          )}
          
          {/* Filtro de mes */}
          {(filtroTipo === 'mes' || filtroTipo === 'anio') && (
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                Mes
              </Typography>
              <TextField
                type="number"
                fullWidth
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                inputProps={{ min: 1, max: 12 }}
                disabled={filtroTipo === 'anio'}
                size="medium"
                sx={{
                  '& .MuiInputBase-root': {
                    height: '56px'
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem'
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
              />
            </Grid>
          )}
          
          {/* Filtro de año */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              Año
            </Typography>
            <TextField
              type="number"
              fullWidth
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              inputProps={{ min: 2020, max: 2030 }}
              size="medium"
              sx={{
                '& .MuiInputBase-root': {
                  height: '56px'
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem'
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            />
          </Grid>
          
          {/* Filtro de usuario */}
          <Grid item xs={12} sm={8} md={3}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              Usuario
            </Typography>
            <Autocomplete
              options={usuarios}
              getOptionLabel={(option) => `${option.nombre} - ${option.cargo || 'Sin cargo'}`}
              value={usuarioSeleccionado}
              onChange={(event, newValue) => setUsuarioSeleccionado(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Seleccionar usuario..."
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '56px'
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.875rem'
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              size="medium"
            />
          </Grid>
          
          {/* Botón de búsqueda */}
          <Grid item xs={12} sm={4} md={2}>
            <Typography variant="body2" color="transparent" sx={{ mb: 1, fontWeight: 500 }}>
              .
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={loadData}
              disabled={loading}
              size="large"
              sx={{ 
                height: '56px',
                fontSize: '0.875rem',
                fontWeight: 500,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none'
                }
              }}
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
        <TableContainer 
          component={Paper} 
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: 'auto',
            maxHeight: { xs: '70vh', sm: '80vh' },
            border: '1px solid rgba(224, 224, 224, 1)',
            // Scrollbar personalizado
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
            },
            // Mejoras para móviles
            '@media (max-width: 600px)': {
              maxHeight: '60vh',
              '& .MuiTableCell-root': {
                padding: '8px 4px',
                fontSize: '0.75rem',
              },
              '& .MuiTableHead-root .MuiTableCell-root': {
                fontSize: '0.8rem',
                fontWeight: 600,
              }
            }
          }}
        >
          <Table stickyHeader>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minWidth: { xs: '80px', sm: '100px' }
                }}>
                  <strong>Fecha</strong>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minWidth: { xs: '120px', sm: '150px' }
                }}>
                  <strong>Usuario</strong>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minWidth: { xs: '80px', sm: '100px' },
                  display: { xs: 'none', sm: 'table-cell' }
                }}>
                  <strong>Cargo</strong>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minWidth: { xs: '80px', sm: '100px' },
                  display: { xs: 'none', md: 'table-cell' }
                }}>
                  <strong>Área</strong>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minWidth: { xs: '70px', sm: '80px' }
                }}>
                  <strong>Entrada</strong>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minWidth: { xs: '70px', sm: '80px' }
                }}>
                  <strong>Salida</strong>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minWidth: { xs: '60px', sm: '70px' },
                  display: { xs: 'none', sm: 'table-cell' }
                }}>
                  <strong>Horas</strong>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minWidth: { xs: '80px', sm: '100px' }
                }}>
                  <strong>Estado</strong>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minWidth: { xs: '80px', sm: '100px' },
                  display: { xs: 'none', md: 'table-cell' }
                }}>
                  <strong>Método</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={9} 
                    align="center"
                    sx={{ py: { xs: 2, sm: 3 } }}
                  >
                    <Typography 
                      color="text.secondary" 
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      No hay registros para el período seleccionado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow 
                    key={index} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      '& .MuiTableCell-root': {
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        padding: { xs: '8px 4px', sm: '16px' }
                      }
                    }}
                  >
                    <TableCell sx={{ 
                      whiteSpace: 'nowrap',
                      fontWeight: 500
                    }}>
                      {format(new Date(row.fecha), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell sx={{ 
                      whiteSpace: 'nowrap',
                      maxWidth: { xs: '120px', sm: '200px' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {row.nombre} {row.apellido}
                    </TableCell>
                    <TableCell sx={{ 
                      display: { xs: 'none', sm: 'table-cell' },
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {row.cargo || '-'}
                    </TableCell>
                    <TableCell sx={{ 
                      display: { xs: 'none', md: 'table-cell' },
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {row.area || '-'}
                    </TableCell>
                    <TableCell sx={{ 
                      whiteSpace: 'nowrap',
                      color: row.hora_entrada ? 'success.main' : 'text.secondary'
                    }}>
                      {row.hora_entrada || '-'}
                    </TableCell>
                    <TableCell sx={{ 
                      whiteSpace: 'nowrap',
                      color: row.hora_salida ? 'info.main' : 'text.secondary'
                    }}>
                      {row.hora_salida || '-'}
                    </TableCell>
                    <TableCell sx={{ 
                      display: { xs: 'none', sm: 'table-cell' },
                      fontWeight: 500
                    }}>
                      {row.horas_trabajadas ? `${row.horas_trabajadas}h` : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.estado || 'N/A'}
                        color={getEstadoColor(row.estado)}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                          height: { xs: 20, sm: 24 },
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      display: { xs: 'none', md: 'table-cell' },
                      fontSize: '0.8rem',
                      color: 'text.secondary'
                    }}>
                      {row.metodo_fichado || '-'}
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

export default Asistencias;
