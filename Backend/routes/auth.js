const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const { config } = require('../config-app-universal');

const router = express.Router();

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
    console.log('=== DEBUG LOGIN START ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    try {
        const { email, password } = req.body;
        console.log('Extracted email:', email);
        console.log('Extracted password length:', password ? password.length : 'undefined');

        // Validar datos de entrada
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos',
                message: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario en la base de datos
        console.log('Searching for user with email:', email);
        const user = await db.get(
            'SELECT id, nombre, apellido, email, password, rol, cargo, area, activo FROM usuarios WHERE email = ? AND activo = 1',
            [email]
        );
        
        console.log('User found:', user ? 'YES' : 'NO');
        if (user) {
            console.log('User details:', {
                id: user.id,
                email: user.email,
                rol: user.rol,
                activo: user.activo,
                activoType: typeof user.activo,
                hasPassword: !!user.password
            });
        }

        if (!user) {
            console.log('User not found or inactive');
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas',
                message: 'Email o contraseña incorrectos'
            });
        }

        // Verificar contraseña
        console.log('Comparing password...');
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', passwordMatch);
        
        if (!passwordMatch) {
            console.log('Password does not match');
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas',
                message: 'Email o contraseña incorrectos'
            });
        }

        console.log('Password matches, generating token...');
        // Generar token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                rol: user.rol
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
        
        console.log('Token generated successfully');

        // Respuesta exitosa
        console.log('Sending successful response');
        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                rol: user.rol,
                cargo: user.cargo,
                area: user.area,
                activo: Boolean(user.activo) // Convertir a boolean
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/auth/verify - Verificar token
router.get('/verify', authenticateToken, (req, res) => {
    // Si llegamos aquí, el token es válido (verificado por el middleware)
    res.json({
        success: true,
        message: 'Token válido',
        user: {
            id: req.user.id,
            nombre: req.user.nombre,
            apellido: req.user.apellido,
            email: req.user.email,
            rol: req.user.rol,
            cargo: req.user.cargo,
            area: req.user.area,
            activo: req.user.activo
        }
    });
});

// POST /api/auth/refresh - Renovar token (opcional)
router.post('/refresh', authenticateToken, (req, res) => {
    try {
        // Generar nuevo token
        const newToken = jwt.sign(
            {
                id: req.user.id,
                email: req.user.email,
                rol: req.user.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Token renovado',
            token: newToken,
            user: {
                id: req.user.id,
                nombre: req.user.nombre,
                apellido: req.user.apellido,
                email: req.user.email,
                rol: req.user.rol,
                cargo: req.user.cargo,
                area: req.user.area,
                activo: req.user.activo
            }
        });

    } catch (error) {
        console.error('Error renovando token:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// POST /api/auth/logout - Cerrar sesión (opcional, principalmente para logs)
router.post('/logout', authenticateToken, (req, res) => {
    // En JWT no hay logout real del lado del servidor
    // Esto es principalmente para logging
    console.log(`Usuario ${req.user.email} cerró sesión`);
    
    res.json({
        success: true,
        message: 'Sesión cerrada correctamente'
    });
});

module.exports = router;