import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  Autocomplete,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DigitalSignature from './DigitalSignature';
import { haccpService } from '../services/api';

/**
 * Formulario para registrar control de lavado de manos
 * Incluye funcionalidad de firma digital
 */
const FormularioLavadoManos = ({ 
  open, 
  onClose, 
  onSuccess,
  empleados = [],
  supervisores = []
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    empleado_id: '',
    nombres_apellidos: '',
    area_estacion: 'Cocina',
    turno: '',
    procedimiento_correcto: 'Sí',
    accion_correctiva: '',
    supervisor_id: '',
    firma: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState(null);

  // Opciones para los selects
  const areas = [
    { value: 'Cocina', label: 'Cocina' },
    { value: 'Salon', label: 'Salón' }
  ];

  const turnos = [
    { value: 'Mañana', label: 'Mañana (00:00 - 12:00)' },
    { value: 'Tarde', label: 'Tarde (12:00 - 24:00)' }
  ];

  const procedimientos = [
    { value: 'Sí', label: 'Sí (Conforme)' },
    { value: 'No', label: 'No (No Conforme)' }
  ];

  // Calcular turno automáticamente basado en la hora actual
  // Mañana: 00:00 - 12:00, Tarde: 12:00 - 24:00
  const calcularTurno = () => {
    const hora = new Date().getHours();
    if (hora >= 0 && hora < 12) return 'Mañana';
    return 'Tarde';
  };

  // Inicializar formulario
  useEffect(() => {
    if (open) {
      setFormData({
        empleado_id: '',
        nombres_apellidos: '',
        area_estacion: 'Cocina',
        turno: calcularTurno(),
        procedimiento_correcto: 'Sí',
        accion_correctiva: '',
        supervisor_id: '',
        firma: null
      });
      setEmpleadoSeleccionado(null);
      setSupervisorSeleccionado(null);
      setError('');
    }
  }, [open]);

  // Manejar cambios en el empleado seleccionado
  const handleEmpleadoChange = (event, newValue) => {
    setEmpleadoSeleccionado(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        empleado_id: newValue.id,
        nombres_apellidos: newValue.nombres_apellidos || `${newValue.nombres} ${newValue.apellidos}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        empleado_id: '',
        nombres_apellidos: ''
      }));
    }
  };

  // Manejar cambios en el supervisor seleccionado
  const handleSupervisorChange = (event, newValue) => {
    setSupervisorSeleccionado(newValue);
    setFormData(prev => ({
      ...prev,
      supervisor_id: newValue ? newValue.id : ''
    }));
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar cambio de firma digital
  const handleSignatureChange = (signatureData) => {
    setFormData(prev => ({
      ...prev,
      firma: signatureData
    }));
  };

  // Validar formulario
  const isFormValid = () => {
    return (
      formData.empleado_id &&
      formData.nombres_apellidos &&
      formData.area_estacion &&
      formData.turno &&
      formData.procedimiento_correcto &&
      formData.firma &&
      (formData.procedimiento_correcto === 'Sí' || formData.accion_correctiva.trim())
    );
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const dataToSend = {
        empleado_id: parseInt(formData.empleado_id),
        area_estacion: formData.area_estacion,
        turno: formData.turno,
        firma: formData.firma, // Base64 de la firma digital
        procedimiento_correcto: formData.procedimiento_correcto,
        accion_correctiva: formData.accion_correctiva || null,
        supervisor_id: formData.supervisor_id ? parseInt(formData.supervisor_id) : null
      };

      console.log('Enviando datos:', dataToSend);

      const response = await haccpService.registrarLavadoManos(dataToSend);

      if (response.success) {
        onSuccess && onSuccess(response.data);
        onClose();
      } else {
        setError(response.error || 'Error al registrar el control de lavado de manos');
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setError(error.message || 'Error al registrar el control de lavado de manos');
    } finally {
      setLoading(false);
    }
  };

  // Cerrar formulario
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6" component="span" fontWeight={600}>
            Control de Lavado de Manos
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose} 
          disabled={loading}
          size="small"
          sx={{ 
            color: 'text.secondary',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 1,
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Información del empleado */}
          <Grid item xs={12}>
            <Typography 
              variant="subtitle1" 
              color="primary" 
              fontWeight={600}
              sx={{ 
                mb: 2,
                pb: 1,
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                display: 'inline-block',
              }}
            >
              Información del Empleado
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              value={empleadoSeleccionado}
              onChange={handleEmpleadoChange}
              options={empleados}
              getOptionLabel={(option) => 
                option.nombres_apellidos || `${option.nombres} ${option.apellidos}` || ''
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Empleado"
                  required
                  error={!formData.empleado_id}
                  helperText={!formData.empleado_id ? 'Seleccione un empleado' : ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa',
                    }
                  }}
                />
              )}
              disabled={loading}
              sx={{ mb: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Nombres y Apellidos"
              value={formData.nombres_apellidos}
              fullWidth
              disabled
              variant="filled"
              sx={{
                '& .MuiFilledInput-root': {
                  backgroundColor: '#f5f5f5',
                }
              }}
            />
          </Grid>

          {/* Información del control */}
          <Grid item xs={12}>
            <Typography 
              variant="subtitle1" 
              color="primary" 
              fontWeight={600}
              sx={{ 
                mb: 2,
                mt: 2,
                pb: 1,
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                display: 'inline-block',
              }}
            >
              Información del Control
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required sx={{ mb: 1 }}>
              <InputLabel>Área o Estación</InputLabel>
              <Select
                value={formData.area_estacion}
                onChange={(e) => handleInputChange('area_estacion', e.target.value)}
                label="Área o Estación"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fafafa',
                  }
                }}
              >
                {areas.map((area) => (
                  <MenuItem key={area.value} value={area.value}>
                    {area.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required sx={{ mb: 1 }}>
              <InputLabel>Turno</InputLabel>
              <Select
                value={formData.turno}
                onChange={(e) => handleInputChange('turno', e.target.value)}
                label="Turno"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fafafa',
                  }
                }}
              >
                {turnos.map((turno) => (
                  <MenuItem key={turno.value} value={turno.value}>
                    {turno.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required sx={{ mb: 1 }}>
              <InputLabel>Procedimiento Correcto</InputLabel>
              <Select
                value={formData.procedimiento_correcto}
                onChange={(e) => handleInputChange('procedimiento_correcto', e.target.value)}
                label="Procedimiento Correcto"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fafafa',
                  }
                }}
              >
                {procedimientos.map((proc) => (
                  <MenuItem key={proc.value} value={proc.value}>
                    {proc.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Acción correctiva */}
          {formData.procedimiento_correcto === 'No' && (
            <Grid item xs={12}>
              <TextField
                label="Acción Correctiva"
                value={formData.accion_correctiva}
                onChange={(e) => handleInputChange('accion_correctiva', e.target.value)}
                fullWidth
                multiline
                rows={3}
                required
                error={formData.procedimiento_correcto === 'No' && !formData.accion_correctiva.trim()}
                helperText={
                  formData.procedimiento_correcto === 'No' && !formData.accion_correctiva.trim()
                    ? 'Debe especificar la acción correctiva cuando el procedimiento no es correcto'
                    : 'Describa las medidas tomadas para corregir el procedimiento'
                }
                sx={{
                  mt: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fafafa',
                  }
                }}
                disabled={loading}
              />
            </Grid>
          )}

          {/* Supervisor */}
          <Grid item xs={12}>
            <Typography 
              variant="subtitle1" 
              color="primary" 
              fontWeight={600}
              sx={{ 
                mb: 2,
                mt: 2,
                pb: 1,
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                display: 'inline-block',
              }}
            >
              Supervisión
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              value={supervisorSeleccionado}
              onChange={handleSupervisorChange}
              options={supervisores}
              getOptionLabel={(option) => 
                option.nombres_apellidos || `${option.nombres} ${option.apellidos}` || ''
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Supervisor (Opcional)"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa',
                    }
                  }}
                />
              )}
              disabled={loading}
              sx={{ mb: 1 }}
            />
          </Grid>

          {/* Firma digital */}
          <Grid item xs={12}>
            <Typography 
              variant="subtitle1" 
              color="primary" 
              fontWeight={600}
              sx={{ 
                mb: 2,
                mt: 2,
                pb: 1,
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                display: 'inline-block',
              }}
            >
              Firma Digital
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ 
              border: '2px dashed',
              borderColor: formData.firma ? 'success.main' : 'grey.300',
              borderRadius: 2,
              p: 2,
              backgroundColor: formData.firma ? 'success.50' : 'grey.50',
              transition: 'all 0.2s',
            }}>
              <DigitalSignature
                onSignatureChange={handleSignatureChange}
                disabled={loading}
                required
              />
              {!formData.firma && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ mt: 1, display: 'block' }}
                >
                  * La firma digital es requerida para completar el registro
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        gap: 1,
      }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
          sx={{ 
            minWidth: 100,
            borderColor: 'grey.300',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'grey.400',
              backgroundColor: 'grey.50',
            }
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading || !isFormValid()}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          sx={{ 
            minWidth: 120,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            }
          }}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormularioLavadoManos;