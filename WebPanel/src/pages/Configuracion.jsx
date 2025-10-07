import { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Alert,
    Grid,
    Card,
    CardContent,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Save as SaveIcon,
    MyLocation as MyLocationIcon,
    RadioButtonChecked as RadioIcon
} from '@mui/icons-material';
import { configuracionService } from '../services/api';

export default function Configuracion() {
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const [config, setConfig] = useState({
        latitud: '',
        longitud: '',
        radio_metros: 100,
        nombre: ''
    });

    const [configActual, setConfigActual] = useState(null);

    useEffect(() => {
        cargarConfiguracion();
    }, []);

    const cargarConfiguracion = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await configuracionService.getGPS();
            
            if (response.data) {
                setConfigActual(response.data);
                setConfig({
                    latitud: response.data.latitud || '',
                    longitud: response.data.longitud || '',
                    radio_metros: response.data.radio_metros || 100,
                    nombre: response.data.nombre || ''
                });
            }
        } catch (err) {
            console.error('Error al cargar configuración:', err);
            setError('No se pudo cargar la configuración GPS');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: name === 'radio_metros' ? parseInt(value) || 0 : value
        }));
    };

    const obtenerUbicacionActual = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Tu navegador no soporta geolocalización. Por favor, ingresa las coordenadas manualmente.');
            setLoading(false);
            return;
        }

        // Configuración de opciones para geolocalización más precisa
        const opciones = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setConfig(prev => ({
                    ...prev,
                    latitud: position.coords.latitude.toFixed(8),
                    longitud: position.coords.longitude.toFixed(8)
                }));
                setMensaje(`✅ Ubicación obtenida correctamente (precisión: ${Math.round(position.coords.accuracy)}m)`);
                setLoading(false);
            },
            (err) => {
                console.error('Error de geolocalización:', err);
                let errorMsg = '';
                
                if (err.code === 1) {
                    errorMsg = '❌ Acceso a ubicación denegado. Por favor, permite el acceso a la ubicación en tu navegador y vuelve a intentar.';
                } else if (err.code === 2) {
                    errorMsg = '❌ Ubicación no disponible. Verifica que tengas GPS activado o conexión a internet.';
                } else if (err.code === 3) {
                    errorMsg = '⏱️ Tiempo de espera agotado. Intenta nuevamente o ingresa las coordenadas manualmente.';
                } else {
                    errorMsg = '❌ Error desconocido al obtener la ubicación. Ingresa las coordenadas manualmente.';
                }
                
                setError(errorMsg);
                setLoading(false);
            },
            opciones
        );
    };

    const validarDatos = () => {
        if (!config.latitud || !config.longitud) {
            setError('Latitud y longitud son obligatorias');
            return false;
        }

        const lat = parseFloat(config.latitud);
        const lon = parseFloat(config.longitud);

        if (isNaN(lat) || lat < -90 || lat > 90) {
            setError('Latitud inválida. Debe estar entre -90 y 90');
            return false;
        }

        if (isNaN(lon) || lon < -180 || lon > 180) {
            setError('Longitud inválida. Debe estar entre -180 y 180');
            return false;
        }

        if (config.radio_metros < 10 || config.radio_metros > 10000) {
            setError('Radio debe estar entre 10 y 10000 metros');
            return false;
        }

        return true;
    };

    const handleGuardar = async () => {
        setError(null);
        setMensaje(null);

        if (!validarDatos()) {
            return;
        }

        try {
            setGuardando(true);
            const response = await configuracionService.updateGPS({
                latitud: parseFloat(config.latitud),
                longitud: parseFloat(config.longitud),
                radio_metros: parseInt(config.radio_metros),
                nombre: config.nombre || 'Ubicación de trabajo'
            });

            if (response.success) {
                setMensaje('Configuración GPS guardada correctamente');
                cargarConfiguracion();
            }
        } catch (err) {
            console.error('Error al guardar configuración:', err);
            setError(err.response?.data?.message || 'Error al guardar la configuración');
        } finally {
            setGuardando(false);
        }
    };

    if (loading && !configActual) {
        return (
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                    <LocationIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Typography variant="h4" component="h1">
                        Configuración de Ubicación GPS
                    </Typography>
                </Box>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Configure la ubicación de trabajo para validar el fichado de asistencia.
                    Solo los empleados dentro del radio configurado podrán marcar entrada/salida.
                </Typography>

                <Divider sx={{ mb: 4 }} />

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {mensaje && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMensaje(null)}>
                        {mensaje}
                    </Alert>
                )}

                {/* Configuración actual */}
                {configActual && configActual.latitud && (
                    <Card sx={{ mb: 4, bgcolor: 'primary.50', borderLeft: '4px solid', borderColor: 'primary.main' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                📍 Configuración Actual
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Ubicación:</strong> {configActual.nombre}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Radio:</strong> {configActual.radio_metros} metros
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Latitud:</strong> {configActual.latitud}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Longitud:</strong> {configActual.longitud}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                {/* Instrucciones para obtener coordenadas */}
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        📍 ¿Cómo configurar la ubicación?
                    </Typography>
                    <Typography variant="body2" component="div">
                        <strong>Opción 1 (Recomendada):</strong> Usa el botón "Usar mi ubicación actual" para obtener automáticamente las coordenadas GPS.<br />
                        <strong>Opción 2 (Manual):</strong> Si la ubicación automática no funciona:<br />
                        • Abre <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 'bold' }}>Google Maps</a> en otra pestaña<br />
                        • Busca la ubicación de tu empresa/restaurante<br />
                        • Haz clic derecho en el punto exacto → "¿Qué hay aquí?"<br />
                        • Copia las coordenadas (ejemplo: -13.50587746, -72.00980836)<br />
                        • Pégalas en los campos de Latitud y Longitud
                    </Typography>
                </Alert>

                {/* Formulario de configuración */}
                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleGuardar(); }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nombre de la ubicación"
                                name="nombre"
                                value={config.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Restaurante - Cusco"
                                helperText="Nombre descriptivo para identificar la ubicación"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Latitud"
                                name="latitud"
                                type="number"
                                inputProps={{ step: '0.00000001', min: -90, max: 90 }}
                                value={config.latitud}
                                onChange={handleChange}
                                placeholder="-13.50587746"
                                helperText="Entre -90 y 90"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Longitud"
                                name="longitud"
                                type="number"
                                inputProps={{ step: '0.00000001', min: -180, max: 180 }}
                                value={config.longitud}
                                onChange={handleChange}
                                placeholder="-72.00980836"
                                helperText="Entre -180 y 180"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Radio de cobertura (metros)"
                                name="radio_metros"
                                type="number"
                                inputProps={{ step: '10', min: 10, max: 10000 }}
                                value={config.radio_metros}
                                onChange={handleChange}
                                helperText="Distancia máxima permitida (10-10000m)"
                                InputProps={{
                                    startAdornment: <RadioIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} display="flex" alignItems="center">
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<MyLocationIcon />}
                                onClick={obtenerUbicacionActual}
                                disabled={loading}
                                sx={{ height: '56px' }}
                            >
                                Usar mi ubicación actual
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" gap={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    onClick={cargarConfiguracion}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={guardando ? <CircularProgress size={20} /> : <SaveIcon />}
                                    disabled={guardando}
                                >
                                    {guardando ? 'Guardando...' : 'Guardar Configuración'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Información adicional */}
                <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        ℹ️ Información importante:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2 }}>
                        <li>Esta configuración afecta a todos los usuarios del sistema</li>
                        <li>Los empleados solo podrán fichar si están dentro del radio configurado</li>
                        <li>Puedes usar Google Maps para obtener coordenadas exactas</li>
                        <li>Se recomienda un radio de 100-500 metros para áreas urbanas</li>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
