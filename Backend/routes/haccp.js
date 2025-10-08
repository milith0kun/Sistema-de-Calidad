// =====================================================
// RUTAS HACCP - Sistema de Calidad
// Endpoints para todos los formularios HACCP
// =====================================================

const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const { getCurrentPeruDate, formatDateForDB, formatTimeForDB } = require('../utils/timeUtils');

// =====================================================
// 1. RECEPCIÓN DE MERCADERÍA
// =====================================================

router.post('/recepcion-mercaderia', authenticateToken, async (req, res) => {
    console.log('=== INICIO POST /recepcion-mercaderia ===');
    console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    
    try {
        const {
            mes, anio, fecha, hora, tipo_control,
            proveedor_id, nombre_proveedor, producto_id, nombre_producto,
            cantidad_solicitada, peso_unidad_recibido, unidad_medida,
            // Campos FRUTAS_VERDURAS
            estado_producto, conformidad_integridad_producto,
            // Campos ABARROTES
            registro_sanitario_vigente, fecha_vencimiento_producto,
            evaluacion_vencimiento, conformidad_empaque_primario,
            // Evaluaciones comunes
            uniforme_completo, transporte_adecuado, puntualidad,
            observaciones, accion_correctiva, producto_rechazado,
            supervisor_id // Nuevo: ID del supervisor seleccionado
        } = req.body;

        const responsableRegistro = req.usuario; // Usuario logueado
        
        if (!responsableRegistro) {
            console.error('ERROR: req.usuario es undefined');
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }

        console.log('Responsable del registro:', responsableRegistro.nombre, responsableRegistro.apellido);
        console.log('ID del supervisor:', supervisor_id);

        // Obtener información del supervisor si se proporcionó
        let supervisor = null;
        if (supervisor_id) {
            supervisor = await db.get(
                'SELECT id, nombre, apellido, cargo FROM usuarios WHERE id = ? AND activo = 1',
                [supervisor_id]
            );

            if (!supervisor) {
                console.error('ERROR: Supervisor no encontrado o inactivo');
                return res.status(400).json({ success: false, error: 'Supervisor no encontrado' });
            }
            
            console.log('Supervisor encontrado:', supervisor.nombre, supervisor.apellido);
        }

        // Nombres completos
        const responsableRegistroNombre = `${responsableRegistro.nombre} ${responsableRegistro.apellido || ''} - ${responsableRegistro.cargo || ''}`.trim();
        const responsableSupervisionNombre = supervisor 
            ? `${supervisor.nombre} ${supervisor.apellido || ''} - ${supervisor.cargo || ''}`.trim()
            : responsableRegistroNombre; // Fallback si no hay supervisor

        const query = `
            INSERT INTO control_recepcion_mercaderia (
                mes, anio, fecha, hora, tipo_control,
                proveedor_id, nombre_proveedor, producto_id, nombre_producto,
                cantidad_solicitada, peso_unidad_recibido, unidad_medida,
                estado_producto, conformidad_integridad_producto,
                registro_sanitario_vigente, fecha_vencimiento_producto,
                evaluacion_vencimiento, conformidad_empaque_primario,
                uniforme_completo, transporte_adecuado, puntualidad,
                responsable_registro_id, responsable_registro_nombre,
                responsable_supervision_id, responsable_supervision_nombre,
                observaciones, accion_correctiva, producto_rechazado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.run(query, [
            mes, anio, fecha, hora, tipo_control,
            proveedor_id || null, nombre_proveedor,
            producto_id || null, nombre_producto,
            cantidad_solicitada, peso_unidad_recibido, unidad_medida,
            estado_producto, conformidad_integridad_producto,
            registro_sanitario_vigente, fecha_vencimiento_producto,
            evaluacion_vencimiento, conformidad_empaque_primario,
            uniforme_completo, transporte_adecuado, puntualidad,
            responsableRegistro.id, responsableRegistroNombre,
            supervisor ? supervisor.id : responsableRegistro.id, responsableSupervisionNombre,
            observaciones || null, accion_correctiva || null, producto_rechazado ? 1 : 0
        ]);

        console.log('✅ Recepción de mercadería registrada exitosamente, ID:', result.lastID);

        res.json({
            success: true,
            message: 'Recepción de mercadería registrada correctamente',
            data: {
                id: result.lastID,
                fecha, hora, tipo_control, nombre_proveedor, nombre_producto
            }
        });

    } catch (error) {
        console.error('Error al registrar recepción de mercadería:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar recepción de mercadería'
        });
    }
});

// Obtener historial de recepciones
router.get('/recepcion-mercaderia', authenticateToken, async (req, res) => {
    try {
        const { tipo, tipo_control, mes, anio, fecha_inicio, fecha_fin, limite = 100 } = req.query;

        let query = 'SELECT * FROM control_recepcion_mercaderia WHERE 1=1';
        const params = [];

        // Filtrar por tipo (tipo_control o tipo - ambos aceptados)
        const tipoFiltro = tipo || tipo_control;
        if (tipoFiltro) {
            query += ' AND tipo_control = ?';
            params.push(tipoFiltro);
        }

        // Filtrar por mes y año (prioridad)
        if (mes && anio) {
            // Convertir mes y año a formato de fecha
            const mesStr = String(mes).padStart(2, '0');
            query += ' AND strftime("%m", fecha) = ? AND strftime("%Y", fecha) = ?';
            params.push(mesStr);
            params.push(String(anio));
        } else if (fecha_inicio && fecha_fin) {
            // Fallback: filtrar por rango de fechas
            query += ' AND fecha >= ? AND fecha <= ?';
            params.push(fecha_inicio);
            params.push(fecha_fin);
        } else if (fecha_inicio) {
            query += ' AND fecha >= ?';
            params.push(fecha_inicio);
        } else if (fecha_fin) {
            query += ' AND fecha <= ?';
            params.push(fecha_fin);
        }

        query += ' ORDER BY fecha DESC, hora DESC LIMIT ?';
        params.push(parseInt(limite));

        console.log('Query recepcion-mercaderia:', query);
        console.log('Params:', params);

        const registros = await db.all(query, params);

        res.json({
            success: true,
            data: registros,
            total: registros.length
        });

    } catch (error) {
        console.error('Error al obtener recepciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener recepciones'
        });
    }
});

// POST /recepcion-abarrotes - Endpoint específico para recepción de abarrotes
// Este endpoint diferencia entre responsable del registro (usuario logueado) y supervisor del turno (seleccionado)
router.post('/recepcion-abarrotes', authenticateToken, async (req, res) => {
    console.log('=== INICIO POST /recepcion-abarrotes ===');
    console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    
    try {
        const {
            mes, anio, fecha, hora,
            nombreProveedor, nombreProducto, cantidadSolicitada,
            registroSanitarioVigente, evaluacionVencimiento, conformidadEmpaque,
            uniformeCompleto, transporteAdecuado, puntualidad,
            observaciones, accionCorrectiva, supervisorId
        } = req.body;

        const responsableRegistro = req.usuario; // Usuario logueado
        
        if (!responsableRegistro) {
            console.error('ERROR: req.usuario es undefined');
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }

        if (!supervisorId) {
            console.error('ERROR: supervisorId no proporcionado');
            return res.status(400).json({ success: false, error: 'Debe seleccionar un supervisor' });
        }

        console.log('Responsable del registro:', responsableRegistro.nombre, responsableRegistro.apellido);
        console.log('ID del supervisor del turno:', supervisorId);

        // Obtener información del supervisor
        const supervisor = await db.get(
            'SELECT id, nombre, apellido, cargo FROM usuarios WHERE id = ? AND activo = 1',
            [supervisorId]
        );

        if (!supervisor) {
            console.error('ERROR: Supervisor no encontrado o inactivo');
            return res.status(400).json({ success: false, error: 'Supervisor no encontrado o inactivo' });
        }

        console.log('Supervisor encontrado:', supervisor.nombre, supervisor.apellido);

        // Nombres completos para histórico
        const responsableRegistroNombre = `${responsableRegistro.nombre} ${responsableRegistro.apellido || ''} - ${responsableRegistro.cargo || ''}`.trim();
        const responsableSupervisionNombre = `${supervisor.nombre} ${supervisor.apellido || ''} - ${supervisor.cargo || ''}`.trim();

        // Nota: proveedor_id y producto_id se pueden buscar o dejar NULL si solo guardamos nombres
        // Por simplicidad, dejamos los IDs en NULL y solo guardamos nombres
        
        const query = `
            INSERT INTO control_recepcion_mercaderia (
                mes, anio, fecha, hora, tipo_control,
                proveedor_id, nombre_proveedor, 
                producto_id, nombre_producto,
                cantidad_solicitada, peso_unidad_recibido, unidad_medida,
                registro_sanitario_vigente, evaluacion_vencimiento, conformidad_empaque_primario,
                uniforme_completo, transporte_adecuado, puntualidad,
                responsable_registro_id, responsable_registro_nombre,
                responsable_supervision_id, responsable_supervision_nombre,
                observaciones, accion_correctiva, producto_rechazado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.run(query, [
            mes, anio, fecha, hora, 'ABARROTES',
            null, nombreProveedor,  // proveedor_id NULL, solo nombre
            null, nombreProducto,   // producto_id NULL, solo nombre
            cantidadSolicitada || null, null, null,  // peso_unidad_recibido y unidad_medida NULL para abarrotes
            registroSanitarioVigente ? 1 : 0, evaluacionVencimiento, conformidadEmpaque,
            uniformeCompleto, transporteAdecuado, puntualidad,
            responsableRegistro.id, responsableRegistroNombre,
            supervisor.id, responsableSupervisionNombre,
            observaciones || null, accionCorrectiva || null, 0  // producto_rechazado = 0 por defecto
        ]);

        console.log('✅ Recepción de abarrotes registrada exitosamente, ID:', result.lastID);

        res.json({
            success: true,
            message: 'Recepción de abarrotes registrada correctamente',
            data: {
                id: result.lastID,
                fecha, hora,
                nombreProveedor, nombreProducto,
                responsableRegistro: responsableRegistroNombre,
                supervisorTurno: responsableSupervisionNombre
            }
        });

    } catch (error) {
        console.error('❌ Error al registrar recepción de abarrotes:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error al registrar recepción de abarrotes',
            details: error.message
        });
    }
});

// GET /recepcion-abarrotes - Obtener registros de recepción de abarrotes
router.get('/recepcion-abarrotes', authenticateToken, async (req, res) => {
    try {
        const registros = await db.all(`
            SELECT 
                ra.*,
                u.nombre || ' ' || u.apellido as responsable_nombre,
                s.nombre || ' ' || s.apellido as supervisor_nombre
            FROM recepcion_abarrotes ra
            LEFT JOIN usuarios u ON ra.responsable_registro_id = u.id
            LEFT JOIN usuarios s ON ra.supervisor_id = s.id
            ORDER BY ra.fecha DESC, ra.hora DESC
            LIMIT 100
        `);

        res.json({
            success: true,
            data: registros || []
        });
    } catch (error) {
        console.error('Error obteniendo recepción de abarrotes:', error);
        
        // Si la tabla no existe, devolver array vacío
        if (error.code === 'SQLITE_ERROR' && error.message.includes('no such table')) {
            return res.json({
                success: true,
                data: [],
                message: 'Tabla de recepción de abarrotes no creada aún'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Error al obtener registros',
            details: error.message
        });
    }
});

// =====================================================
// 2. CONTROL DE COCCIÓN
// =====================================================

router.post('/control-coccion', authenticateToken, (req, res) => {
    console.log('=== INICIO POST /control-coccion ===');
    console.log('Body recibido:', JSON.stringify(req.body));
    console.log('Usuario autenticado:', JSON.stringify(req.usuario));
    
    try {
        const {
            producto_cocinar, proceso_coccion,
            temperatura_coccion, tiempo_coccion_minutos,
            accion_correctiva
        } = req.body;

        const responsable = req.usuario;
        
        if (!responsable) {
            console.error('ERROR: req.usuario es undefined');
            return res.status(500).json({ success: false, error: 'Usuario no encontrado en request' });
        }
        
        console.log('Responsable:', responsable.nombre, responsable.apellido);
        
        // Generar fecha/hora automáticamente usando timeUtils (timezone Peru: UTC-5)
        const peruDate = getCurrentPeruDate();
        const anio = peruDate.getFullYear();
        const mes = peruDate.getMonth() + 1;
        const dia = peruDate.getDate();
        const fecha = formatDateForDB();
        const hora = formatTimeForDB();

        console.log('Fecha generada:', fecha, 'Hora:', hora);
        
        // Calcular conformidad: C si temperatura > 80, NC si no
        const conformidad = temperatura_coccion > 80 ? 'C' : 'NC';
        
        console.log('Datos - Producto:', producto_cocinar, 'Proceso:', proceso_coccion, 'Temp:', temperatura_coccion, 'Conformidad:', conformidad);

        // Nombres completos del responsable
        const responsableNombre = `${responsable.nombre} ${responsable.apellido || ''} - ${responsable.cargo || ''}`.trim();
        console.log('Responsable completo:', responsableNombre);

        const query = `
            INSERT INTO control_coccion (
                mes, anio, dia, fecha, hora,
                producto_cocinar, proceso_coccion,
                temperatura_coccion, tiempo_coccion_minutos,
                conformidad, accion_correctiva,
                responsable_id, responsable_nombre
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [
            mes, anio, dia, fecha, hora,
            producto_cocinar, proceso_coccion,
            temperatura_coccion, tiempo_coccion_minutos,
            conformidad, accion_correctiva,
            responsable.id, responsableNombre
        ], function(err) {
            if (err) {
                console.error('Error al insertar control de cocción:', err);
                console.error('Error code:', err.code);
                console.error('Error message:', err.message);
                return res.status(500).json({
                    success: false,
                    error: 'Error al registrar control de cocción',
                    details: err.message
                });
            }

            console.log('✅ Control de cocción registrado exitosamente, ID:', this.lastID);
            
            res.json({
                success: true,
                message: 'Control de cocción registrado correctamente',
                data: {
                    id: this.lastID,
                    fecha,
                    hora,
                    producto_cocinar,
                    temperatura_coccion,
                    conformidad,
                    responsable: responsableNombre
                }
            });
        });

    } catch (error) {
        console.error('=== ERROR EN CATCH PRINCIPAL ===');
        console.error('Error al registrar control de cocción:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Error al registrar control de cocción',
            message: error.message
        });
    }
});

// Obtener historial de cocciones
router.get('/control-coccion', authenticateToken, async (req, res) => {
    try {
        const { mes, anio, fecha_inicio, fecha_fin, limite = 100 } = req.query;

        let query = 'SELECT * FROM control_coccion WHERE 1=1';
        const params = [];

        // Filtrar por mes y año (prioridad)
        if (mes && anio) {
            const mesStr = String(mes).padStart(2, '0');
            query += ' AND strftime("%m", fecha) = ? AND strftime("%Y", fecha) = ?';
            params.push(mesStr);
            params.push(String(anio));
        } else if (fecha_inicio && fecha_fin) {
            query += ' AND fecha >= ? AND fecha <= ?';
            params.push(fecha_inicio);
            params.push(fecha_fin);
        } else if (fecha_inicio) {
            query += ' AND fecha >= ?';
            params.push(fecha_inicio);
        } else if (fecha_fin) {
            query += ' AND fecha <= ?';
            params.push(fecha_fin);
        }

        query += ' ORDER BY fecha DESC, hora DESC LIMIT ?';
        params.push(parseInt(limite));

        const registros = await db.all(query, params);

        res.json({
            success: true,
            data: registros,
            total: registros.length
        });

    } catch (error) {
        console.error('Error al obtener controles de cocción:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener controles de cocción'
        });
    }
});

// =====================================================
// 3. LAVADO Y DESINFECCIÓN DE FRUTAS
// =====================================================

router.post('/lavado-frutas', authenticateToken, (req, res) => {
    try {
        console.log('[LAVADO FRUTAS] Request body:', req.body);
        console.log('[LAVADO FRUTAS] Usuario autenticado:', req.usuario);
        
        const {
            mes: mesInput,
            anio: anioInput,
            producto_quimico,
            concentracion_producto,
            nombre_fruta_verdura,
            lavado_agua_potable,
            desinfeccion_producto_quimico,
            concentracion_correcta,
            tiempo_desinfeccion_minutos,
            acciones_correctivas
        } = req.body;

        const usuario = req.usuario;
        
        // Generar DÍA y HORA automáticamente usando timeUtils (timezone Peru: UTC-5)
        const peruDate = getCurrentPeruDate();
        
        // Usar MES y AÑO del frontend (input del usuario)
        const mes = mesInput || (peruDate.getMonth() + 1); // Si no envían, usar actual
        const anio = anioInput || peruDate.getFullYear(); // Si no envían, usar actual
        const dia = peruDate.getDate();
        const fecha = formatDateForDB();
        const hora = formatTimeForDB();

        console.log('[LAVADO FRUTAS] Fecha generada:', { mes, anio, dia, fecha, hora });
        console.log('[LAVADO FRUTAS] Supervisor:', `${usuario.nombre} ${usuario.apellido} - ${usuario.cargo}`);

        const query = `
            INSERT INTO control_lavado_desinfeccion_frutas (
                mes, anio, dia, fecha, hora,
                producto_quimico, concentracion_producto,
                nombre_fruta_verdura,
                lavado_agua_potable, desinfeccion_producto_quimico,
                concentracion_correcta, tiempo_desinfeccion_minutos,
                acciones_correctivas,
                supervisor_id, supervisor_nombre
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        console.log('[LAVADO FRUTAS] Ejecutando INSERT con valores:', {
            mes, anio, dia, fecha, hora,
            producto_quimico, concentracion_producto, nombre_fruta_verdura,
            lavado_agua_potable, desinfeccion_producto_quimico, concentracion_correcta,
            tiempo_desinfeccion_minutos, acciones_correctivas,
            supervisor_id: usuario.id,
            supervisor_nombre: `${usuario.nombre} ${usuario.apellido} - ${usuario.cargo}`
        });

        db.run(query, [
            mes, anio, dia, fecha, hora,
            producto_quimico, concentracion_producto,
            nombre_fruta_verdura,
            lavado_agua_potable, desinfeccion_producto_quimico,
            concentracion_correcta, tiempo_desinfeccion_minutos,
            acciones_correctivas,
            usuario.id, `${usuario.nombre} ${usuario.apellido} - ${usuario.cargo}`
        ], function(err) {
            if (err) {
                console.error('[LAVADO FRUTAS] Error al insertar:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al registrar lavado de frutas',
                    details: err.message
                });
            }
            
            console.log('[LAVADO FRUTAS] Registro exitoso, ID:', this.lastID);
            
            res.json({
                success: true,
                message: 'Control de lavado de frutas registrado correctamente',
                data: {
                    id: this.lastID,
                    fecha, 
                    hora,
                    mes,
                    anio,
                    nombre_fruta_verdura, 
                    producto_quimico,
                    supervisor: `${usuario.nombre} ${usuario.apellido}`
                }
            });
        });

    } catch (error) {
        console.error('[LAVADO FRUTAS] Error general:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar lavado de frutas',
            details: error.message
        });
    }
});

// Obtener historial de lavado de frutas
router.get('/lavado-frutas', authenticateToken, (req, res) => {
    try {
        const { mes, anio, fecha_inicio, fecha_fin, limite = 100 } = req.query;

        let query = 'SELECT * FROM control_lavado_desinfeccion_frutas WHERE 1=1';
        const params = [];

        // Filtrar por mes y año (prioridad)
        if (mes && anio) {
            const mesStr = String(mes).padStart(2, '0');
            query += ' AND strftime("%m", fecha) = ? AND strftime("%Y", fecha) = ?';
            params.push(mesStr);
            params.push(String(anio));
        } else if (fecha_inicio && fecha_fin) {
            query += ' AND fecha >= ? AND fecha <= ?';
            params.push(fecha_inicio);
            params.push(fecha_fin);
        } else if (fecha_inicio) {
            query += ' AND fecha >= ?';
            params.push(fecha_inicio);
        } else if (fecha_fin) {
            query += ' AND fecha <= ?';
            params.push(fecha_fin);
        }

        query += ' ORDER BY fecha DESC, hora DESC LIMIT ?';
        params.push(parseInt(limite));

        db.all(query, params, (err, registros) => {
            if (err) {
                console.error('Error al obtener lavado de frutas:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al obtener lavado de frutas'
                });
            }

            res.json({
                success: true,
                data: registros,
                total: registros.length
            });
        });

    } catch (error) {
        console.error('Error al obtener lavado de frutas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener lavado de frutas'
        });
    }
});

// =====================================================
// 4. CONTROL DE LAVADO DE MANOS
// =====================================================

router.post('/lavado-manos', authenticateToken, (req, res) => {
    console.log('=== INICIO POST /lavado-manos ===');
    console.log('Body recibido:', JSON.stringify(req.body));
    console.log('Usuario autenticado:', JSON.stringify(req.usuario));
    
    try {
        const {
            area_estacion, turno,
            empleado_id, // Nuevo: ID del empleado seleccionado (si no viene, usa req.usuario)
            firma, procedimiento_correcto, accion_correctiva,
            supervisor_id // Nuevo: ID del supervisor que verifica
        } = req.body;

        console.log('Datos extraídos - area:', area_estacion, 'turno:', turno, 'empleado_id:', empleado_id, 'procedimiento:', procedimiento_correcto);

        // Si viene empleado_id, buscar ese empleado. Si no, usar el usuario logueado
        if (empleado_id) {
            console.log('Buscando empleado con ID:', empleado_id);
            db.get('SELECT id, nombre, apellido, cargo, area FROM usuarios WHERE id = ? AND activo = 1', [empleado_id], (err, empleadoEncontrado) => {
                if (err) {
                    console.error('Error al buscar empleado:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Error al buscar empleado'
                    });
                }

                if (!empleadoEncontrado) {
                    console.error('ERROR: Empleado no encontrado o inactivo');
                    return res.status(400).json({ success: false, error: 'Empleado no encontrado' });
                }

                console.log('Empleado encontrado:', empleadoEncontrado.nombre, empleadoEncontrado.apellido);
                procesarRegistro(empleadoEncontrado);
            });
        } else {
            // Usar usuario logueado
            const empleado = req.usuario;
            
            if (!empleado) {
                console.error('ERROR: req.usuario es undefined');
                return res.status(500).json({ success: false, error: 'Usuario no encontrado en request' });
            }
            
            console.log('Empleado (usuario logueado):', empleado.nombre, empleado.apellido);
            procesarRegistro(empleado);
        }

        function procesarRegistro(empleado) {
            console.log('=== PROCESANDO REGISTRO ===');
            console.log('Empleado:', empleado.nombre, empleado.apellido);
        
        // Generar fecha/hora automáticamente usando timeUtils (timezone Peru: UTC-5)
        const peruDate = getCurrentPeruDate();
        const anio = peruDate.getFullYear();
        const mes = String(peruDate.getMonth() + 1).padStart(2, '0');
        const fecha = formatDateForDB();
        const hora = formatTimeForDB();

        // Determinar turno automáticamente según hora si no se proporciona
        let turnoFinal = turno;
        if (!turnoFinal) {
            const hora24 = peruDate.getHours();
            if (hora24 >= 6 && hora24 < 14) {
                turnoFinal = 'MAÑANA';
            } else if (hora24 >= 14 && hora24 < 22) {
                turnoFinal = 'TARDE';
            } else {
                turnoFinal = 'NOCHE';
            }
        }

        // Nombres completos del empleado logueado
        const nombresApellidos = `${empleado.nombre} ${empleado.apellido || ''}`.trim();
        console.log('Nombres completos:', nombresApellidos);
        console.log('Fecha generada:', fecha, 'Hora:', hora, 'Turno:', turnoFinal);

        // Si hay supervisor_id, obtener sus datos
        if (supervisor_id) {
            console.log('Buscando supervisor con ID:', supervisor_id);
            db.get('SELECT nombre, apellido, cargo FROM usuarios WHERE id = ?', [supervisor_id], (err, supervisor) => {
                if (err) {
                    console.error('Error al obtener supervisor:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Error al validar supervisor'
                    });
                }

                const supervisorNombre = supervisor 
                    ? `${supervisor.nombre} ${supervisor.apellido || ''} - ${supervisor.cargo || 'Supervisor'}`.trim()
                    : null;

                insertarRegistro(supervisorNombre);
            });
        } else {
            insertarRegistro(null);
        }

        function insertarRegistro(supervisorNombre) {
            console.log('=== INSERTANDO REGISTRO ===');
            console.log('Supervisor nombre:', supervisorNombre);
            
            const query = `
                INSERT INTO control_lavado_manos (
                    mes, anio, fecha, hora,
                    area_estacion, turno,
                    empleado_id, nombres_apellidos, firma,
                    procedimiento_correcto, accion_correctiva,
                    supervisor_id, supervisor_nombre
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                mes, anio, fecha, hora,
                area_estacion, turnoFinal,
                empleado.id, nombresApellidos, firma || 'FIRMA_PENDIENTE',
                procedimiento_correcto, accion_correctiva,
                supervisor_id || null, supervisorNombre
            ];
            
            console.log('Parámetros del INSERT:', JSON.stringify(params));

            db.run(query, params, function(err) {
                if (err) {
                    console.error('Error al insertar lavado de manos:', err);
                    console.error('Error code:', err.code);
                    console.error('Error message:', err.message);
                    return res.status(500).json({
                        success: false,
                        error: 'Error al registrar lavado de manos',
                        details: err.message
                    });
                }
                
                console.log('✅ Registro insertado exitosamente, ID:', this.lastID);
                
                res.json({
                    success: true,
                    message: 'Control de lavado de manos registrado correctamente',
                    data: {
                        id: this.lastID,
                        fecha,
                        hora,
                        turno: turnoFinal,
                        nombres_apellidos: nombresApellidos,
                        area_estacion,
                        supervisor: supervisorNombre
                    }
                });
            });
        }
        } // Cierre de procesarRegistro

    } catch (error) {
        console.error('=== ERROR EN CATCH PRINCIPAL ===');
        console.error('Error al registrar lavado de manos:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Error al registrar lavado de manos',
            message: error.message
        });
    }
});

// Obtener historial de lavado de manos
router.get('/lavado-manos', authenticateToken, (req, res) => {
    try {
        const { mes, anio, fecha_inicio, fecha_fin, area_estacion, limite = 100 } = req.query;

        let query = 'SELECT * FROM control_lavado_manos WHERE 1=1';
        const params = [];

        // Filtrar por mes y año (prioridad)
        if (mes && anio) {
            const mesStr = String(mes).padStart(2, '0');
            query += ' AND strftime("%m", fecha) = ? AND strftime("%Y", fecha) = ?';
            params.push(mesStr);
            params.push(String(anio));
        } else if (fecha_inicio && fecha_fin) {
            query += ' AND fecha >= ? AND fecha <= ?';
            params.push(fecha_inicio);
            params.push(fecha_fin);
        } else if (fecha_inicio) {
            query += ' AND fecha >= ?';
            params.push(fecha_inicio);
        } else if (fecha_fin) {
            query += ' AND fecha <= ?';
            params.push(fecha_fin);
        }

        if (area_estacion) {
            query += ' AND area_estacion = ?';
            params.push(area_estacion);
        }

        query += ' ORDER BY fecha DESC, hora DESC LIMIT ?';
        params.push(parseInt(limite));

        db.all(query, params, (err, registros) => {
            if (err) {
                console.error('Error al obtener lavado de manos:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al obtener lavado de manos'
                });
            }

            res.json({
                success: true,
                data: registros,
                total: registros.length
            });
        });

    } catch (error) {
        console.error('Error al obtener lavado de manos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener lavado de manos'
        });
    }
});

// =====================================================
// 5. CONTROL DE TEMPERATURA DE CÁMARAS
// =====================================================

// Obtener lista de cámaras
router.get('/camaras', authenticateToken, (req, res) => {
    db.all('SELECT * FROM camaras_frigorificas WHERE activo = 1', [], (err, camaras) => {
        if (err) {
            console.error('Error al obtener cámaras:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener cámaras'
            });
        }

        res.json({
            success: true,
            data: camaras
        });
    });
});

router.post('/temperatura-camaras', authenticateToken, (req, res) => {
    try {
        const {
            camara_id,
            temperatura_manana, temperatura_tarde,
            acciones_correctivas
        } = req.body;

        const usuario = req.usuario;
        
        // Generar fecha automáticamente usando timeUtils
        const peruDate = getCurrentPeruDate();
        const anio = peruDate.getFullYear();
        const mes = String(peruDate.getMonth() + 1).padStart(2, '0');
        const dia = String(peruDate.getDate()).padStart(2, '0');
        const fecha = formatDateForDB();

        // Verificar si ya existe registro para esta cámara hoy
        db.get(
            'SELECT id FROM control_temperatura_camaras WHERE camara_id = ? AND fecha = ?',
            [camara_id, fecha],
            (err, existente) => {
                if (err) {
                    console.error('Error verificando registro existente:', err);
                    return res.status(500).json({ success: false, error: 'Error al verificar registro' });
                }

                // Calcular conformidad basado en rangos de cámara
                db.get('SELECT temperatura_minima, temperatura_maxima FROM camaras_frigorificas WHERE id = ?', [camara_id], (err, camara) => {
                    if (err || !camara) {
                        console.error('Error obteniendo cámara:', err);
                        return res.status(400).json({ success: false, error: 'Cámara no encontrada' });
                    }

                    const conformidadManana = (temperatura_manana != null && 
                        temperatura_manana >= camara.temperatura_minima && 
                        temperatura_manana <= camara.temperatura_maxima) ? 'C' : 'NC';
                    
                    const conformidadTarde = (temperatura_tarde != null && 
                        temperatura_tarde >= camara.temperatura_minima && 
                        temperatura_tarde <= camara.temperatura_maxima) ? 'C' : 'NC';

                    if (existente) {
                        // Actualizar registro existente
                        const query = `
                            UPDATE control_temperatura_camaras SET
                                temperatura_manana = COALESCE(?, temperatura_manana),
                                responsable_manana_id = COALESCE(?, responsable_manana_id),
                                responsable_manana_nombre = COALESCE(?, responsable_manana_nombre),
                                conformidad_manana = COALESCE(?, conformidad_manana),
                                temperatura_tarde = COALESCE(?, temperatura_tarde),
                                responsable_tarde_id = COALESCE(?, responsable_tarde_id),
                                responsable_tarde_nombre = COALESCE(?, responsable_tarde_nombre),
                                conformidad_tarde = COALESCE(?, conformidad_tarde),
                                acciones_correctivas = ?,
                                supervisor_id = ?,
                                supervisor_nombre = ?,
                                timestamp_modificacion = CURRENT_TIMESTAMP
                            WHERE id = ?
                        `;

                        db.run(query, [
                            temperatura_manana, usuario.id, `${usuario.nombre} ${usuario.apellido}`, conformidadManana,
                            temperatura_tarde, usuario.id, `${usuario.nombre} ${usuario.apellido}`, conformidadTarde,
                            acciones_correctivas, usuario.id, `${usuario.nombre} ${usuario.apellido}`,
                            existente.id
                        ], function(err) {
                            if (err) {
                                console.error('Error actualizando temperatura:', err);
                                return res.status(500).json({ success: false, error: 'Error al actualizar' });
                            }

                            res.json({
                                success: true,
                                message: 'Temperatura de cámara actualizada correctamente',
                                data: { id: existente.id, fecha, temperatura_manana, temperatura_tarde, updated: true }
                            });
                        });

                    } else {
                        // Crear nuevo registro
                        const query = `
                            INSERT INTO control_temperatura_camaras (
                                mes, anio, dia, fecha, camara_id,
                                hora_manana, temperatura_manana, responsable_manana_id, responsable_manana_nombre, conformidad_manana,
                                hora_tarde, temperatura_tarde, responsable_tarde_id, responsable_tarde_nombre, conformidad_tarde,
                                acciones_correctivas, supervisor_id, supervisor_nombre
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;

                        db.run(query, [
                            mes, anio, dia, fecha, camara_id,
                            '08:00', temperatura_manana, usuario.id, `${usuario.nombre} ${usuario.apellido}`, conformidadManana,
                            '16:00', temperatura_tarde, usuario.id, `${usuario.nombre} ${usuario.apellido}`, conformidadTarde,
                            acciones_correctivas, usuario.id, `${usuario.nombre} ${usuario.apellido}`
                        ], function(err) {
                            if (err) {
                                console.error('Error insertando temperatura:', err);
                                return res.status(500).json({ success: false, error: 'Error al registrar temperatura' });
                            }

                            res.json({
                                success: true,
                                message: 'Temperatura de cámara registrada correctamente',
                                data: { id: this.lastID, fecha, temperatura_manana, temperatura_tarde, created: true }
                            });
                        });
                    }
                });
            }
        );

    } catch (error) {
        console.error('Error al registrar temperatura de cámara:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar temperatura de cámara'
        });
    }
});

// Obtener historial de temperaturas
router.get('/temperatura-camaras', authenticateToken, (req, res) => {
    try {
        const { mes, anio, fecha_inicio, fecha_fin, camara_id, limite = 100 } = req.query;

        let query = `
            SELECT t.*, c.nombre as camara_nombre, c.tipo as camara_tipo,
                   c.temperatura_minima, c.temperatura_maxima
            FROM control_temperatura_camaras t
            JOIN camaras_frigorificas c ON t.camara_id = c.id
            WHERE 1=1
        `;
        const params = [];

        // Filtrar por mes y año (prioridad)
        if (mes && anio) {
            const mesStr = String(mes).padStart(2, '0');
            query += ' AND strftime("%m", t.fecha) = ? AND strftime("%Y", t.fecha) = ?';
            params.push(mesStr);
            params.push(String(anio));
        } else if (fecha_inicio && fecha_fin) {
            query += ' AND t.fecha >= ? AND t.fecha <= ?';
            params.push(fecha_inicio);
            params.push(fecha_fin);
        } else if (fecha_inicio) {
            query += ' AND t.fecha >= ?';
            params.push(fecha_inicio);
        } else if (fecha_fin) {
            query += ' AND t.fecha <= ?';
            params.push(fecha_fin);
        }

        if (camara_id) {
            query += ' AND t.camara_id = ?';
            params.push(camara_id);
        }

        query += ' ORDER BY t.fecha DESC LIMIT ?';
        params.push(parseInt(limite));

        db.all(query, params, (err, registros) => {
            if (err) {
                console.error('Error al obtener temperaturas de cámaras:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al obtener temperaturas de cámaras'
                });
            }

            res.json({
                success: true,
                data: registros,
                total: registros.length
            });
        });

    } catch (error) {
        console.error('Error al obtener temperaturas de cámaras:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener temperaturas de cámaras'
        });
    }
});

// =====================================================
// ENDPOINTS AUXILIARES
// =====================================================

// Obtener proveedores
router.get('/proveedores', authenticateToken, (req, res) => {
    db.all(
        'SELECT id, nombre_completo, tipo_productos FROM proveedores WHERE activo = 1 ORDER BY nombre_completo',
        [],
        (err, proveedores) => {
            if (err) {
                console.error('Error al obtener proveedores:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al obtener proveedores'
                });
            }

            res.json({
                success: true,
                data: proveedores
            });
        }
    );
});

// Obtener productos
router.get('/productos', authenticateToken, (req, res) => {
    try {
        const { categoria_id } = req.query;
        
        let query = 'SELECT id, nombre, categoria_id, unidad_medida FROM productos WHERE activo = 1';
        const params = [];

        if (categoria_id) {
            query += ' AND categoria_id = ?';
            params.push(categoria_id);
        }

        query += ' ORDER BY nombre';

        db.all(query, params, (err, productos) => {
            if (err) {
                console.error('Error al obtener productos:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al obtener productos'
                });
            }

            res.json({
                success: true,
                data: productos
            });
        });

    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos'
        });
    }
});

// Obtener empleados
router.get('/empleados', authenticateToken, (req, res) => {
    try {
        const { area } = req.query;

        let query = `
            SELECT id, nombre || ' ' || apellido as nombre, cargo, area
            FROM usuarios
            WHERE activo = 1
        `;
        const params = [];

        if (area) {
            query += ' AND area = ?';
            params.push(area);
        }

        query += ' ORDER BY nombre, apellido';

        db.all(query, params, (err, empleados) => {
            if (err) {
                console.error('Error al obtener empleados:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al obtener empleados'
                });
            }

            res.json({
                success: true,
                data: empleados
            });
        });

    } catch (error) {
        console.error('Error al obtener empleados:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener empleados'
        });
    }
});

// GET /supervisores - Obtener supervisores para verificación (NUEVO)
router.get('/supervisores', authenticateToken, (req, res) => {
    try {
        const { turno, area } = req.query;

        let query = `
            SELECT 
                id,
                nombre || ' ' || apellido as nombre,
                cargo,
                area,
                rol
            FROM usuarios 
            WHERE activo = 1 
              AND rol IN ('SUPERVISOR', 'ADMIN')
        `;

        const params = [];

        if (area) {
            query += ' AND area = ?';
            params.push(area);
        }

        query += ' ORDER BY nombre, apellido';

        db.all(query, params, (err, supervisores) => {
            if (err) {
                console.error('Error al obtener supervisores:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al obtener supervisores'
                });
            }

            res.json({
                success: true,
                data: supervisores
            });
        });

    } catch (error) {
        console.error('Error al obtener supervisores:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener supervisores'
        });
    }
});

// Ruta para obtener áreas únicas de usuarios
router.get('/areas', authenticateToken, (req, res) => {
    try {
        console.log('📍 GET /haccp/areas - Obteniendo áreas únicas');

        const query = `
            SELECT DISTINCT area 
            FROM usuarios 
            WHERE area IS NOT NULL 
            AND area != '' 
            AND activo = 1
            ORDER BY area ASC
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('❌ Error al obtener áreas:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al obtener áreas'
                });
            }

            // Convertir a array de strings para compatibilidad con frontend
            const areas = rows.map(row => row.area);

            console.log(`✅ Áreas obtenidas: ${areas.length} áreas encontradas`);
            res.json({
                success: true,
                data: areas
            });
        });

    } catch (error) {
        console.error('Error al obtener áreas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener áreas'
        });
    }
});

// Ruta para obtener productos de la categoría Abarrotes
router.get('/productos-abarrotes', authenticateToken, (req, res) => {
    try {
        console.log('📍 GET /haccp/productos-abarrotes - Obteniendo productos de abarrotes');

        const query = `
            SELECT id, nombre, categoria, unidad_medida
            FROM productos 
            WHERE categoria = 'Abarrotes' 
            AND activo = 1
            ORDER BY nombre ASC
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('❌ Error al obtener productos de abarrotes:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al obtener productos de abarrotes'
                });
            }

            console.log(`✅ Productos de abarrotes obtenidos: ${rows.length} productos encontrados`);
            res.json({
                success: true,
                data: rows
            });
        });

    } catch (error) {
        console.error('Error al obtener productos de abarrotes:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos de abarrotes'
        });
    }
});

module.exports = router;
