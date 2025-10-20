// =====================================================
// RUTAS DE GESTIÓN DE USUARIOS
// =====================================================

const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// =====================================================
// OBTENER SOLO SUPERVISORES (Para formularios HACCP)
// =====================================================
router.get('/supervisores/lista', authenticateToken, async (req, res) => {
    try {
        console.log('=== GET /api/usuarios/supervisores/lista ===');
        console.log('Usuario solicitante:', req.user);

        // Solo devolver usuarios con rol supervisor activos
        // Los formularios HACCP deben ser llenados por colaboradores y supervisados por supervisores
        const supervisores = await db.all(`
            SELECT 
                id,
                nombre,
                apellido,
                email,
                cargo,
                area,
                rol
            FROM usuarios
            WHERE rol = 'Supervisor' AND activo = 1
            ORDER BY nombre ASC
        `);

        res.json({
            success: true,
            data: supervisores,
            message: `${supervisores.length} supervisor(es) disponible(s)`
        });

    } catch (error) {
        console.error('Error al obtener supervisores:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener lista de supervisores'
        });
    }
});

// =====================================================
// OBTENER TODOS LOS USUARIOS (Solo admin)
// =====================================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        console.log('=== GET /api/usuarios ===');
        console.log('Usuario solicitante:', req.user);

        // Verificar que sea supervisor o empleador
        if (req.user.rol !== 'Supervisor' && req.user.rol !== 'Empleador') {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. Se requieren permisos de Supervisor o Empleador.'
            });
        }

        const usuarios = await db.all(`
            SELECT 
                id,
                nombre,
                apellido,
                email,
                cargo,
                area,
                rol,
                activo,
                fecha_creacion
            FROM usuarios
            ORDER BY nombre ASC
        `);

        res.json({
            success: true,
            data: usuarios
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener lista de usuarios'
        });
    }
});

// =====================================================
// OBTENER USUARIO POR ID
// =====================================================
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await db.get(`
            SELECT 
                id,
                nombre,
                apellido,
                email,
                cargo,
                area,
                rol,
                activo,
                fecha_creacion
            FROM usuarios
            WHERE id = ?
        `, [id]);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: usuario
        });

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener usuario'
        });
    }
});

// =====================================================
// CREAR NUEVO USUARIO (Solo admin)
// =====================================================
router.post('/', authenticateToken, async (req, res) => {
    try {
        console.log('=== POST /api/usuarios ===');
        
        // Verificar que sea supervisor o empleador
        if (req.user.rol !== 'Supervisor' && req.user.rol !== 'Empleador') {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. Se requieren permisos de Supervisor o Empleador.'
            });
        }

        const {
            nombre,
            apellido,
            email,
            password,
            cargo,
            area,
            rol
        } = req.body;

        // Validaciones
        if (!nombre || !apellido || !email || !password || !rol) {
            return res.status(400).json({
                success: false,
                error: 'Nombre, apellido, email, contraseña y rol son obligatorios'
            });
        }

        // Verificar que el email no exista
        const existingUser = await db.get(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Ya existe un usuario con ese email'
            });
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario
        const result = await db.run(`
            INSERT INTO usuarios (
                nombre, apellido, email, password, cargo, area, rol, activo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `, [nombre, apellido, email, hashedPassword, cargo || null, area || null, rol]);

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: {
                id: result.lastID,
                nombre,
                apellido,
                email,
                cargo,
                area,
                rol
            }
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear usuario'
        });
    }
});

// =====================================================
// ACTUALIZAR USUARIO (Solo admin)
// =====================================================
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar que sea supervisor o empleador
        if (req.user.rol !== 'Supervisor' && req.user.rol !== 'Empleador') {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. Se requieren permisos de Supervisor o Empleador.'
            });
        }

        const {
            nombre,
            apellido,
            email,
            cargo,
            area,
            rol,
            activo
        } = req.body;

        // Verificar que el usuario existe
        const usuario = await db.get('SELECT id FROM usuarios WHERE id = ?', [id]);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // Si se cambió el email, verificar que no exista
        if (email) {
            const existingEmail = await db.get(
                'SELECT id FROM usuarios WHERE email = ? AND id != ?',
                [email, id]
            );
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    error: 'Ya existe otro usuario con ese email'
                });
            }
        }

        // Actualizar usuario
        await db.run(`
            UPDATE usuarios 
            SET 
                nombre = COALESCE(?, nombre),
                apellido = COALESCE(?, apellido),
                email = COALESCE(?, email),
                cargo = COALESCE(?, cargo),
                area = COALESCE(?, area),
                rol = COALESCE(?, rol),
                activo = COALESCE(?, activo)
            WHERE id = ?
        `, [nombre, apellido, email, cargo, area, rol, activo, id]);

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar usuario'
        });
    }
});

// =====================================================
// CAMBIAR CONTRASEÑA
// =====================================================
router.put('/:id/password', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        // Solo empleador o el mismo usuario puede cambiar su contraseña
        if (req.user.rol !== 'Empleador' && req.user.id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                error: 'No tiene permisos para cambiar esta contraseña'
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.run(
            'UPDATE usuarios SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cambiar contraseña'
        });
    }
});

// =====================================================
// ELIMINAR/DESACTIVAR USUARIO (Solo admin)
// =====================================================
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que sea supervisor o empleador
        if (req.user.rol !== 'Supervisor' && req.user.rol !== 'Empleador') {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. Se requieren permisos de Supervisor o Empleador.'
            });
        }

        // No permitir eliminar al propio usuario supervisor
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({
                success: false,
                error: 'No puedes desactivar tu propia cuenta'
            });
        }

        // En lugar de eliminar, desactivamos el usuario
        await db.run(
            'UPDATE usuarios SET activo = 0 WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Usuario desactivado exitosamente'
        });

    } catch (error) {
        console.error('Error al desactivar usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al desactivar usuario'
        });
    }
});

module.exports = router;
