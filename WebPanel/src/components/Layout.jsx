import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Collapse from '@mui/material/Collapse';
import Footer from './Footer';

const drawerWidth = 280;
const mobileDrawerWidth = 260; // Ancho más pequeño para móviles

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [haccpOpen, setHaccpOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Asistencias', icon: <AccessTimeIcon />, path: '/asistencias' },
  ];

  const haccpItems = [
    { text: 'Recepción Abarrotes', path: '/haccp/recepcion-abarrotes' },
    { text: 'Recepción Mercadería (Legacy)', path: '/haccp/recepcion-mercaderia' },
    { text: 'Control Cocción', path: '/haccp/control-coccion' },
    { text: 'Lavado Frutas', path: '/haccp/lavado-frutas' },
    { text: 'Lavado Manos', path: '/haccp/lavado-manos' },
    { text: 'Temperatura Cámaras', path: '/haccp/temperatura-camaras' },
  ];

  const bottomMenuItems = [
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/usuarios' },
    { text: 'Reportes', icon: <AssessmentIcon />, path: '/reportes' },
    { text: 'Auditoría', icon: <HistoryIcon />, path: '/auditoria' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/configuracion' },
  ];

  const drawer = (
    <div style={{ background: '#1a1d2e', height: '100%', color: '#fff' }}>
      <Toolbar sx={{ 
        bgcolor: '#1a1d2e', 
        color: 'white',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.2rem'
          }}>
            H
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            SISTEMA HACCP
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '8px',
                margin: '2px 8px',
                padding: '8px 16px',
                color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.8)',
                bgcolor: location.pathname === item.path ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: location.pathname === item.path ? 'rgba(79, 70, 229, 0.3)' : 'rgba(255,255,255,0.08)',
                  transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(79, 70, 229, 0.2)',
                  borderLeft: '3px solid #4f46e5',
                  '&:hover': {
                    bgcolor: 'rgba(79, 70, 229, 0.3)',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: 'inherit', 
                minWidth: 36,
                '& .MuiSvgIcon-root': {
                  fontSize: '1.25rem',
                },
              }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* HACCP Collapsible Menu */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            onClick={() => setHaccpOpen(!haccpOpen)}
            sx={{
              borderRadius: '8px',
              margin: '2px 8px',
              padding: '8px 16px',
              color: 'rgba(255,255,255,0.8)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.08)',
                transform: 'translateX(4px)',
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: 'inherit', 
              minWidth: 36,
              '& .MuiSvgIcon-root': {
                fontSize: '1.25rem',
              },
            }}>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="HACCP" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
            {haccpOpen ? <ExpandLess sx={{ color: 'inherit' }} /> : <ExpandMore sx={{ color: 'inherit' }} />}
          </ListItemButton>
        </ListItem>
        <Collapse in={haccpOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 1 }}>
            {haccpItems.map((item) => (
              <ListItemButton
                key={item.text}
                sx={{ 
                  pl: 4,
                  py: 0.5,
                  borderRadius: '8px',
                  margin: '1px 8px 1px 16px',
                  padding: '6px 16px 6px 24px',
                  color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.7)',
                  bgcolor: location.pathname === item.path ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: location.pathname === item.path ? 'rgba(79, 70, 229, 0.25)' : 'rgba(255,255,255,0.06)',
                    transform: 'translateX(2px)',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(79, 70, 229, 0.15)',
                    borderLeft: '2px solid #4f46e5',
                    '&:hover': {
                      bgcolor: 'rgba(79, 70, 229, 0.25)',
                    }
                  }
                }}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 400 }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>

      <Divider sx={{ 
        borderColor: 'rgba(255,255,255,0.12)', 
        margin: '8px 12px',
      }} />

      <List sx={{ px: 2 }}>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '8px',
                margin: '2px 8px',
                padding: '8px 16px',
                color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.8)',
                bgcolor: location.pathname === item.path ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: location.pathname === item.path ? 'rgba(79, 70, 229, 0.3)' : 'rgba(255,255,255,0.08)',
                  transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(79, 70, 229, 0.2)',
                  borderLeft: '3px solid #4f46e5',
                  '&:hover': {
                    bgcolor: 'rgba(79, 70, 229, 0.3)',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: 'inherit', 
                minWidth: 36,
                '& .MuiSvgIcon-root': {
                  fontSize: '1.25rem',
                },
              }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#FFFFFF',
          color: '#1F2937',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#1F2937', fontWeight: 600 }}>
            Panel Administrativo
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user?.nombre} ({user?.rol})
            </Typography>
            <IconButton
              onClick={handleMenuClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={anchorEl ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={anchorEl ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.nombre?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                {user?.email}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: mobileDrawerWidth,
              maxWidth: '85vw', // Máximo 85% del ancho de la pantalla
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' }, // Solo mostrar en desktop
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#1e293b',
              color: 'white',
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)', // Sombra más sutil
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#F8F9FA',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 },
          overflowX: 'hidden' 
        }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
