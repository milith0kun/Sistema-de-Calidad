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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { usuariosService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Usuarios = () => {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados del diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'Supervisor',
    cargo: '',
    area: '',
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usuariosService.getAll();
      console.log('Response usuarios:', response);
      
      if (response && response.success) {
        setUsuarios(Array.isArray(response.data) ? response.data : []);
      } else {
        setUsuarios([]);
        setError(response?.error || 'Error cargando usuarios');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      setUsuarios([]);
      console.error('Error loading usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        password: '',
        rol: user.rol,
        cargo: user.cargo || '',
        area: user.area || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        rol: 'Supervisor',
        cargo: '',
        area: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'Supervisor',
      cargo: '',
      area: '',
    });
  };

  const handleSaveUser = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const userData = { ...formData };
      
      // Si estamos editando y no se cambió la contraseña, no la enviamos
      if (editingUser && !userData.password) {
        delete userData.password;
      }

      const response = editingUser
        ? await usuariosService.update(editingUser.id, userData)
        : await usuariosService.create(userData);
      
      if (response.success) {
        setSuccess(editingUser ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
        handleCloseDialog();
        loadUsuarios();
      } else {
        setError(response.error || 'Error guardando usuario');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Verificar si intenta eliminar su propia cuenta
    // Convertir ambos a número para comparación segura
    const currentUserId = currentUser ? parseInt(currentUser.id) : null;
    const targetUserId = parseInt(userId);
    
    console.log('Intentando eliminar usuario:', { currentUserId, targetUserId, currentUser });
    
    if (currentUserId && currentUserId === targetUserId) {
      setError('No puedes eliminar tu propia cuenta');
      return;
    }

    if (!window.confirm('¿Está seguro de desactivar este usuario? Esta acción desactivará el usuario pero no eliminará sus registros.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('Llamando a usuariosService.delete con ID:', userId);
      const response = await usuariosService.delete(userId);
      console.log('Respuesta del servidor:', response);
      
      if (response.success) {
        setSuccess('Usuario desactivado correctamente');
        loadUsuarios();
      } else {
        setError(response.error || 'Error desactivando usuario');
        console.error('Error en la respuesta:', response);
      }
    } catch (err) {
      // Capturar el error específico del backend
      console.error('Error completo al eliminar usuario:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Error de conexión al servidor';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPasswordDialog = (userId) => {
    setSelectedUserId(userId);
    setNewPassword('');
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setSelectedUserId(null);
    setNewPassword('');
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await usuariosService.changePassword(selectedUserId, newPassword);
      
      if (response.success) {
        setSuccess('Contraseña actualizada correctamente');
        handleClosePasswordDialog();
      } else {
        setError(response.error || 'Error cambiando contraseña');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case 'Supervisor':
        return 'primary';
      case 'Empleador':
        return 'error';
      default:
        return 'default';
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
          Gestión de Usuarios
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ fontWeight: 400 }}
        >
          Administración de usuarios del sistema
        </Typography>
      </Box>

      {/* Sección de controles */}
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
            color: 'text.primary'
          }}
        >
          Lista de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 40
          }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {/* Mensajes de estado */}
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
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            borderRadius: 1
          }}
        >
          {success}
        </Alert>
      )}

      {/* Tabla de usuarios */}
      <Paper sx={{ 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Nombre Completo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cargo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Área</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
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
                        Cargando usuarios...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Typography color="text.secondary" variant="h6">
                        No hay usuarios
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        No hay usuarios registrados en el sistema
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((usuario) => (
                  <TableRow 
                    key={usuario.id} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f8f9fa'
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>
                      {usuario.nombre} {usuario.apellido}
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.rol}
                        color={getRolColor(usuario.rol)}
                        size="small"
                        sx={{ 
                          borderRadius: 1,
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>{usuario.cargo || '-'}</TableCell>
                    <TableCell>{usuario.area || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.activo ? 'Activo' : 'Inactivo'}
                        color={usuario.activo ? 'success' : 'default'}
                        size="small"
                        sx={{ 
                          borderRadius: 1,
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(usuario)}
                            sx={{
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'white'
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={currentUser && parseInt(currentUser.id) === parseInt(usuario.id) ? "No puedes desactivar tu propio usuario" : "Desactivar"}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(usuario.id)}
                              disabled={currentUser && parseInt(currentUser.id) === parseInt(usuario.id)}
                              sx={{
                                borderRadius: 1,
                                '&:hover': {
                                  backgroundColor: 'error.light',
                                  color: 'white'
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Diálogo para crear/editar usuario */}
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
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                fullWidth
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#fff'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Apellido"
                fullWidth
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#fff'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#fff'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#fff'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#fff'
                  }
                }}
              >
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.rol}
                  label="Rol"
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                >
                  <MenuItem value="Supervisor">Supervisor</MenuItem>
                  <MenuItem value="Empleador">Empleador</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cargo"
                fullWidth
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#fff'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Área"
                fullWidth
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: '#fff'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{
          p: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1.5
        }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 100,
              minHeight: 40
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 100,
              minHeight: 40
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                Guardando...
              </Box>
            ) : (
              editingUser ? 'Actualizar' : 'Crear'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Usuarios;
