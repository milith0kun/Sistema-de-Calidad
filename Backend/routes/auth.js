const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { db } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const { config } = require('../config-app-universal');

const router = express.Router();

// Cliente de OAuth2 de Google - Client ID real del token JWT (audience)
const GOOGLE_CLIENT_ID = '888160830168-0uo7dusf7eiij5pgq9nkctl2luih6vuu.apps.googleusercontent.com';
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

            // Determinar rol por defecto (Empleado para usuarios de Google nuevos)
            const rolPorDefecto = 'Empleado';

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

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
    console.log('=== DEBUG REGISTER START ===');
    console.log('Request body:', req.body);
    
    try {
        const { nombre, apellido, email, password, cargo, area } = req.body;
        
        // Validar datos requeridos
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos',
                message: 'Nombre, apellido, email y contraseña son requeridos'
            });
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Email inválido',
                message: 'El formato del email no es válido'
            });
        }
        
        // Validar longitud de contraseña
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Contraseña débil',
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }
        
        // Verificar si el usuario ya existe
        console.log('Verificando si el email ya existe...');
        const existingUser = await db.get(
            'SELECT id, email FROM usuarios WHERE email = ?',
            [email]
        );
        
        if (existingUser) {
            console.log('Usuario ya existe:', existingUser.email);
            return res.status(409).json({
                success: false,
                error: 'Usuario existente',
                message: 'Ya existe una cuenta con este correo electrónico'
            });
        }
        
        // Encriptar contraseña
        console.log('Encriptando contraseña...');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Crear usuario
        console.log('Creando nuevo usuario...');
        const result = await db.run(
            `INSERT INTO usuarios (nombre, apellido, email, password, rol, cargo, area, activo, auth_provider)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'local')`,
            [
                nombre,
                apellido,
                email,
                hashedPassword,
                'Empleado', // Rol por defecto
                cargo || 'Personal',
                area || 'General'
            ]
        );
        
        console.log('Usuario creado con ID:', result.lastID);
        
        // Obtener usuario recién creado
        const newUser = await db.get(
            'SELECT id, nombre, apellido, email, rol, cargo, area, activo FROM usuarios WHERE id = ?',
            [result.lastID]
        );
        
        // Generar token JWT
        const token = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                rol: newUser.rol
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
        
        console.log('Registro exitoso para:', newUser.email);
        
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                apellido: newUser.apellido,
                email: newUser.email,
                rol: newUser.rol,
                cargo: newUser.cargo,
                area: newUser.area,
                activo: Boolean(newUser.activo),
                auth_provider: 'local'
            }
        });
        
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// POST /api/auth/forgot-password - Solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
    console.log('=== DEBUG FORGOT PASSWORD START ===');
    console.log('Request body:', req.body);
    
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email requerido',
                message: 'Debe proporcionar un email'
            });
        }
        
        // Buscar usuario
        const user = await db.get(
            'SELECT id, email, nombre FROM usuarios WHERE email = ? AND activo = 1',
            [email]
        );
        
        // Por seguridad, siempre respondemos éxito (aunque el usuario no exista)
        // Esto evita que se pueda verificar si un email está registrado
        if (!user) {
            console.log('Usuario no encontrado, pero responde éxito por seguridad');
            return res.json({
                success: true,
                message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña'
            });
        }
        
        // TODO: Aquí se debería:
        // 1. Generar un token de recuperación único
        // 2. Guardarlo en la base de datos con expiración (ej: 1 hora)
        // 3. Enviar email con el enlace de recuperación
        // Por ahora, solo registramos el intento
        
        console.log('Solicitud de recuperación para:', user.email);
        
        // Respuesta temporal
        res.json({
            success: true,
            message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña',
            // En desarrollo, devolver info adicional
            ...(process.env.NODE_ENV === 'development' && {
                debug: {
                    userFound: true,
                    userId: user.id,
                    note: 'Sistema de email no implementado. Contacta al administrador.'
                }
            })
        });
        
    } catch (error) {
        console.error('Error en forgot-password:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;