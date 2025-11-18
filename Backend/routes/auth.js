const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { db } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const { config } = require('../config-app-universal');

const router = express.Router();

// Cliente de OAuth2 de Google
const GOOGLE_CLIENT_ID = '802542269966-jb3ubba1iiq9o4qpm7eakh7d7epheqqu.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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

// POST /api/auth/google - Login con Google
router.post('/google', async (req, res) => {
    console.log('=== DEBUG GOOGLE LOGIN START ===');
    console.log('Request body:', req.body);
    
    try {
        const { idToken } = req.body;
        
        if (!idToken) {
            return res.status(400).json({
                success: false,
                error: 'Token de Google no proporcionado',
                message: 'El idToken es requerido'
            });
        }
        
        // Verificar el token de Google
        console.log('Verificando token de Google...');
        let ticket;
        try {
            ticket = await googleClient.verifyIdToken({
                idToken: idToken,
                audience: GOOGLE_CLIENT_ID
            });
        } catch (error) {
            console.error('Error verificando token de Google:', error.message);
            return res.status(401).json({
                success: false,
                error: 'Token de Google inválido',
                message: 'No se pudo verificar el token de Google'
            });
        }
        
        const payload = ticket.getPayload();
        console.log('Token de Google verificado. Payload:', {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            sub: payload.sub
        });
        
        const googleId = payload.sub;
        const email = payload.email;
        const nombre = payload.given_name || payload.name || 'Usuario';
        const apellido = payload.family_name || '';
        const photo = payload.picture || null;
        
        // Buscar usuario por Google ID o email
        console.log('Buscando usuario en base de datos...');
        let user = await db.get(
            'SELECT id, nombre, apellido, email, rol, cargo, area, activo, google_id, google_photo, auth_provider FROM usuarios WHERE google_id = ? OR email = ?',
            [googleId, email]
        );
        
        if (user) {
            console.log('Usuario encontrado:', user.email);
            
            // Verificar que el usuario esté activo
            if (!user.activo) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario inactivo',
                    message: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
                });
            }
            
            // Actualizar información de Google si cambió
            if (!user.google_id || user.google_photo !== photo) {
                console.log('Actualizando información de Google del usuario...');
                await db.run(
                    'UPDATE usuarios SET google_id = ?, google_photo = ?, auth_provider = ? WHERE id = ?',
                    [googleId, photo, 'google', user.id]
                );
            }
            
        } else {
            // Usuario no existe - crearlo automáticamente
            console.log('Usuario no encontrado. Creando nuevo usuario de Google...');
            
            // Determinar rol por defecto (Supervisor para usuarios de Google nuevos)
            const rolPorDefecto = 'Supervisor';
            
            try {
                const result = await db.run(
                    `INSERT INTO usuarios (nombre, apellido, email, password, google_id, google_photo, auth_provider, rol, cargo, area, activo) 
                     VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, 1)`,
                    [nombre, apellido, email, googleId, photo, 'google', rolPorDefecto, 'Personal', 'General']
                );
                
                user = await db.get(
                    'SELECT id, nombre, apellido, email, rol, cargo, area, activo, google_id, google_photo, auth_provider FROM usuarios WHERE id = ?',
                    [result.lastID]
                );
                
                console.log('Nuevo usuario creado:', user.email);
                
            } catch (error) {
                console.error('Error creando usuario de Google:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Error creando usuario',
                    message: 'No se pudo crear el usuario en la base de datos'
                });
            }
        }
        
        // Generar token JWT
        console.log('Generando token JWT...');
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                rol: user.rol
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
        
        console.log('Token JWT generado. Login con Google exitoso.');
        
        // Respuesta exitosa
        res.json({
            success: true,
            message: 'Login con Google exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                rol: user.rol,
                cargo: user.cargo,
                area: user.area,
                activo: Boolean(user.activo),
                google_photo: user.google_photo,
                auth_provider: user.auth_provider || 'google'
            }
        });
        
    } catch (error) {
        console.error('Error en login con Google:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

module.exports = router;