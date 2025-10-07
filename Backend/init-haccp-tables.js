const { dbRaw } = require('./utils/database');

// Script para crear las tablas HACCP necesarias
const createHaccpTables = () => {
    return new Promise((resolve, reject) => {
        console.log('🔧 Iniciando creación de tablas HACCP...');

        // Tabla control_recepcion_mercaderia
        const createRecepcionMercaderiaTable = `
            CREATE TABLE IF NOT EXISTS control_recepcion_mercaderia (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mes INTEGER NOT NULL,
                anio INTEGER NOT NULL,
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                tipo_control TEXT NOT NULL,
                proveedor_id INTEGER,
                nombre_proveedor TEXT NOT NULL,
                producto_id INTEGER,
                nombre_producto TEXT NOT NULL,
                cantidad_solicitada REAL,
                peso_unidad_recibido REAL,
                unidad_medida TEXT,
                estado_producto TEXT,
                conformidad_integridad_producto TEXT,
                registro_sanitario_vigente TEXT,
                fecha_vencimiento_producto DATE,
                evaluacion_vencimiento TEXT,
                conformidad_empaque_primario TEXT,
                uniforme_completo TEXT,
                transporte_adecuado TEXT,
                puntualidad TEXT,
                responsable_registro_id INTEGER NOT NULL,
                responsable_registro_nombre TEXT NOT NULL,
                responsable_supervision_id INTEGER NOT NULL,
                responsable_supervision_nombre TEXT NOT NULL,
                observaciones TEXT,
                accion_correctiva TEXT,
                producto_rechazado BOOLEAN DEFAULT 0,
                timestamp_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (responsable_registro_id) REFERENCES usuarios (id),
                FOREIGN KEY (responsable_supervision_id) REFERENCES usuarios (id)
            )
        `;

        // Tabla control_coccion
        const createControlCoccionTable = `
            CREATE TABLE IF NOT EXISTS control_coccion (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                producto TEXT NOT NULL,
                temperatura_inicial REAL,
                temperatura_final REAL,
                tiempo_coccion INTEGER,
                responsable_registro_id INTEGER NOT NULL,
                responsable_registro_nombre TEXT NOT NULL,
                responsable_supervision_id INTEGER NOT NULL,
                responsable_supervision_nombre TEXT NOT NULL,
                observaciones TEXT,
                accion_correctiva TEXT,
                timestamp_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (responsable_registro_id) REFERENCES usuarios (id),
                FOREIGN KEY (responsable_supervision_id) REFERENCES usuarios (id)
            )
        `;

        // Tabla control_lavado_manos
        const createLavadoManosTable = `
            CREATE TABLE IF NOT EXISTS control_lavado_manos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                empleado_id INTEGER NOT NULL,
                empleado_nombre TEXT NOT NULL,
                lavado_correcto BOOLEAN NOT NULL,
                uso_jabon BOOLEAN NOT NULL,
                tiempo_lavado_adecuado BOOLEAN NOT NULL,
                secado_adecuado BOOLEAN NOT NULL,
                responsable_registro_id INTEGER NOT NULL,
                responsable_registro_nombre TEXT NOT NULL,
                responsable_supervision_id INTEGER NOT NULL,
                responsable_supervision_nombre TEXT NOT NULL,
                observaciones TEXT,
                accion_correctiva TEXT,
                timestamp_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (empleado_id) REFERENCES usuarios (id),
                FOREIGN KEY (responsable_registro_id) REFERENCES usuarios (id),
                FOREIGN KEY (responsable_supervision_id) REFERENCES usuarios (id)
            )
        `;

        // Tabla control_temperatura_camaras
        const createTemperaturaCamarasTable = `
            CREATE TABLE IF NOT EXISTS control_temperatura_camaras (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                camara_id INTEGER NOT NULL,
                camara_nombre TEXT NOT NULL,
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                temperatura REAL NOT NULL,
                temperatura_objetivo REAL,
                conforme BOOLEAN NOT NULL,
                responsable_registro_id INTEGER NOT NULL,
                responsable_registro_nombre TEXT NOT NULL,
                responsable_supervision_id INTEGER NOT NULL,
                responsable_supervision_nombre TEXT NOT NULL,
                observaciones TEXT,
                accion_correctiva TEXT,
                timestamp_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (responsable_registro_id) REFERENCES usuarios (id),
                FOREIGN KEY (responsable_supervision_id) REFERENCES usuarios (id)
            )
        `;

        // Tabla proveedores
        const createProveedoresTable = `
            CREATE TABLE IF NOT EXISTS proveedores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre_completo TEXT NOT NULL,
                ruc TEXT,
                telefono TEXT,
                email TEXT,
                direccion TEXT,
                activo BOOLEAN DEFAULT 1,
                fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Tabla productos
        const createProductosTable = `
            CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                categoria TEXT,
                unidad_medida TEXT,
                activo BOOLEAN DEFAULT 1,
                fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Ejecutar creación de tablas
        dbRaw.serialize(() => {
            dbRaw.run(createRecepcionMercaderiaTable, (err) => {
                if (err) {
                    console.error('❌ Error creando tabla control_recepcion_mercaderia:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Tabla control_recepcion_mercaderia creada');
            });

            dbRaw.run(createControlCoccionTable, (err) => {
                if (err) {
                    console.error('❌ Error creando tabla control_coccion:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Tabla control_coccion creada');
            });

            dbRaw.run(createLavadoManosTable, (err) => {
                if (err) {
                    console.error('❌ Error creando tabla control_lavado_manos:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Tabla control_lavado_manos creada');
            });

            dbRaw.run(createTemperaturaCamarasTable, (err) => {
                if (err) {
                    console.error('❌ Error creando tabla control_temperatura_camaras:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Tabla control_temperatura_camaras creada');
            });

            dbRaw.run(createProveedoresTable, (err) => {
                if (err) {
                    console.error('❌ Error creando tabla proveedores:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Tabla proveedores creada');
            });

            dbRaw.run(createProductosTable, (err) => {
                if (err) {
                    console.error('❌ Error creando tabla productos:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Tabla productos creada');
                
                // Insertar datos de prueba
                insertTestData().then(() => {
                    console.log('🎉 Todas las tablas HACCP creadas exitosamente');
                    resolve();
                }).catch(reject);
            });
        });
    });
};

// Función para insertar datos de prueba
const insertTestData = () => {
    return new Promise((resolve, reject) => {
        console.log('📝 Insertando datos de prueba...');

        // Insertar proveedores de prueba
        const insertProveedores = `
            INSERT OR IGNORE INTO proveedores (id, nombre_completo, ruc, telefono, email, direccion)
            VALUES 
                (1, 'Proveedor Frutas Lima', '20123456789', '01-2345678', 'frutas@lima.com', 'Av. Lima 123'),
                (2, 'Distribuidora Abarrotes SAC', '20987654321', '01-8765432', 'ventas@abarrotes.com', 'Jr. Comercio 456'),
                (3, 'Carnes Premium EIRL', '20555666777', '01-5556667', 'info@carnespremium.com', 'Av. Industrial 789')
        `;

        // Insertar productos de prueba
        const insertProductos = `
            INSERT OR IGNORE INTO productos (id, nombre, categoria, unidad_medida)
            VALUES 
                (1, 'Manzana Roja', 'Frutas', 'kg'),
                (2, 'Arroz Extra', 'Abarrotes', 'kg'),
                (3, 'Pollo Entero', 'Carnes', 'unidad'),
                (4, 'Lechuga Americana', 'Verduras', 'unidad'),
                (5, 'Aceite Vegetal', 'Abarrotes', 'litro')
        `;

        // Insertar datos de control de recepción de mercadería de prueba con fechas de Lima
        const insertRecepcionMercaderia = `
            INSERT OR IGNORE INTO control_recepcion_mercaderia (
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
            ) VALUES 
                (1, 2025, '2025-01-15', '08:30:00', 'Abarrotes',
                 1, 'Proveedor Frutas Lima', 1, 'Manzana Roja',
                 50.0, 48.5, 'kg', 'Excelente', 'Conforme',
                 'Vigente', '2025-02-15', 'Excelente', 'Conforme',
                 'Completo', 'Adecuado', 'Puntual',
                 2, 'Empleado Prueba - Empleado', 1, 'Administrador Sistema - Administrador',
                 'Producto en excelente estado', NULL, 0),
                (1, 2025, '2025-01-20', '09:15:00', 'Abarrotes',
                 2, 'Distribuidora Abarrotes SAC', 2, 'Arroz Extra',
                 100.0, 100.0, 'kg', 'Bueno', 'Conforme',
                 'Vigente', '2025-12-31', 'Excelente', 'Conforme',
                 'Completo', 'Adecuado', 'Puntual',
                 2, 'Empleado Prueba - Empleado', 1, 'Administrador Sistema - Administrador',
                 'Arroz de buena calidad', NULL, 0),
                (12, 2024, '2024-12-28', '10:00:00', 'Frutas y Verduras',
                 1, 'Proveedor Frutas Lima', 4, 'Lechuga Americana',
                 20.0, 19.0, 'unidad', 'Regular', 'Conforme',
                 'Vigente', '2025-01-05', 'Regular', 'Conforme',
                 'Completo', 'Adecuado', 'Puntual',
                 2, 'Empleado Prueba - Empleado', 1, 'Administrador Sistema - Administrador',
                 'Algunas lechugas con hojas amarillas', 'Separar productos en mal estado', 0)
        `;

        dbRaw.serialize(() => {
            dbRaw.run(insertProveedores, (err) => {
                if (err) {
                    console.error('❌ Error insertando proveedores:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Proveedores de prueba insertados');
            });

            dbRaw.run(insertProductos, (err) => {
                if (err) {
                    console.error('❌ Error insertando productos:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Productos de prueba insertados');
            });

            dbRaw.run(insertRecepcionMercaderia, (err) => {
                if (err) {
                    console.error('❌ Error insertando datos de recepción:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Datos de recepción de mercadería insertados');
                resolve();
            });
        });
    });
};

// Ejecutar si se llama directamente
if (require.main === module) {
    createHaccpTables()
        .then(() => {
            console.log('🎉 Inicialización de tablas HACCP completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en inicialización:', error);
            process.exit(1);
        });
}

module.exports = { createHaccpTables };