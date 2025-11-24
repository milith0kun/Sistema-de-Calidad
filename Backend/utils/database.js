const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Crear directorio database si no existe
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'database.db');

// Agregar logging para diagnosticar la ruta de la base de datos
console.log('=== CONFIGURACIÓN DE BASE DE DATOS ===');
console.log('Directorio de base de datos:', dbDir);
console.log('Ruta completa de la base de datos:', dbPath);
console.log('¿Existe el archivo de base de datos?:', fs.existsSync(dbPath));
if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log('Tamaño del archivo de base de datos:', stats.size, 'bytes');
    console.log('Última modificación:', stats.mtime);
}
console.log('=======================================');

// Conexión a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
        // Nota: la tabla `camaras_frigorificas` es opcional en runtime.
        // El backend puede usar un catálogo estático para evitar depender de esta tabla.
        // Evitamos aquí una consulta que genere logs repetidos si la tabla no existe.
        console.log('La tabla camaras_frigorificas es opcional; se utilizará catálogo estático si falta.');
    }
});

// Función para inicializar las tablas
const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        // Crear tabla usuarios
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                apellido TEXT,
                email TEXT UNIQUE NOT NULL,
                password TEXT,
                google_id TEXT UNIQUE,
                google_photo TEXT,
                auth_provider TEXT DEFAULT 'local' CHECK(auth_provider IN ('local', 'google')),
                rol TEXT NOT NULL CHECK(rol IN ('Empleador', 'Supervisor')),
                cargo TEXT,
                area TEXT,
                activo BOOLEAN DEFAULT 1,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Crear tabla asistencia
        const createAttendanceTable = `
            CREATE TABLE IF NOT EXISTS asistencia (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                fecha DATE NOT NULL,
                hora_entrada TIME,
                hora_salida TIME,
                latitud REAL,
                longitud REAL,
                latitud_salida REAL,
                longitud_salida REAL,
                ubicacion_valida BOOLEAN DEFAULT 0,
                codigo_qr TEXT,
                metodo_fichado TEXT DEFAULT 'GPS' CHECK(metodo_fichado IN ('MANUAL', 'GPS', 'QR')),
                observaciones TEXT,
                timestamp_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
            )
        `;

        // Crear tabla códigos QR (para futuro)
        const createQRTable = `
            CREATE TABLE IF NOT EXISTS codigos_qr_locales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo TEXT UNIQUE NOT NULL,
                ubicacion TEXT NOT NULL,
                descripcion TEXT,
                activo BOOLEAN DEFAULT 1,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Ejecutar creación de tablas
        db.serialize(() => {
            db.run(createUsersTable, (err) => {
                if (err) {
                    console.error('Error creando tabla usuarios:', err.message);
                    reject(err);
                    return;
                }
                console.log('Tabla usuarios creada o ya existe');
            });

            db.run(createAttendanceTable, (err) => {
                if (err) {
                    console.error('Error creando tabla asistencia:', err.message);
                    reject(err);
                    return;
                }
                console.log('Tabla asistencia creada o ya existe');
                
                // Agregar columnas de GPS de salida si no existen
                db.run(`ALTER TABLE asistencia ADD COLUMN latitud_salida REAL`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Error agregando columna latitud_salida:', err.message);
                    }
                });
                
                db.run(`ALTER TABLE asistencia ADD COLUMN longitud_salida REAL`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Error agregando columna longitud_salida:', err.message);
                    }
                });
            });

            db.run(createQRTable, (err) => {
                if (err) {
                    console.error('Error creando tabla códigos QR:', err.message);
                    reject(err);
                    return;
                }
                console.log('Tabla códigos QR creada o ya existe');
                
                // Agregar columnas de Google si no existen
                db.run(`ALTER TABLE usuarios ADD COLUMN google_id TEXT UNIQUE`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.log('Info: columna google_id ya existe o no se pudo agregar');
                    }
                });
                
                db.run(`ALTER TABLE usuarios ADD COLUMN google_photo TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.log('Info: columna google_photo ya existe o no se pudo agregar');
                    }
                });
                
                db.run(`ALTER TABLE usuarios ADD COLUMN auth_provider TEXT DEFAULT 'local'`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.log('Info: columna auth_provider ya existe o no se pudo agregar');
                    }
                });
                
                // Insertar usuarios por defecto después de crear todas las tablas
                insertDefaultUsers().then(() => {
                    resolve();
                }).catch(reject);
            });
        });
    });
};

// Función para insertar usuarios por defecto
const insertDefaultUsers = async () => {
    return new Promise((resolve, reject) => {
        // Verificar si ya existen usuarios
        db.get("SELECT COUNT(*) as count FROM usuarios", async (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (row.count > 0) {
                console.log('Usuarios por defecto ya existen');
                resolve();
                return;
            }

            try {
                // Hash de las contraseñas
                const empleadorPassword = await bcrypt.hash('empleador123', 10);
                const supervisorPassword = await bcrypt.hash('supervisor123', 10);

                // Insertar usuario empleador
                const insertEmpleador = `
                    INSERT INTO usuarios (nombre, apellido, email, password, rol, cargo, area)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                // Insertar usuario supervisor
                const insertSupervisor = `
                    INSERT INTO usuarios (nombre, apellido, email, password, rol, cargo, area)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                db.serialize(() => {
                    db.run(insertEmpleador, ['Empleador', 'Sistema', 'empleador@hotel.com', empleadorPassword, 'Empleador', 'Empleador', 'Administración'], (err) => {
                        if (err) {
                            console.error('Error insertando empleador:', err.message);
                            reject(err);
                            return;
                        }
                        console.log('Usuario empleador creado');
                    });

                    db.run(insertSupervisor, ['Supervisor', 'Prueba', 'supervisor@hotel.com', supervisorPassword, 'Supervisor', 'Supervisor', 'Operaciones'], (err) => {
                        if (err) {
                            console.error('Error insertando supervisor:', err.message);
                            reject(err);
                            return;
                        }
                        console.log('Usuario supervisor creado');
                        resolve();
                    });
                });

            } catch (error) {
                reject(error);
            }
        });
    });
};

// Wrappers híbridos: soportan tanto promesas como callbacks
const dbHybrid = {
    all: (sql, params, callback) => {
        // Si hay callback, usar modo callback
        if (typeof callback === 'function') {
            return db.all(sql, params, callback);
        }
        // Si params es función, es el callback
        if (typeof params === 'function') {
            return db.all(sql, [], params);
        }
        // Modo promesa
        return new Promise((resolve, reject) => {
            db.all(sql, params || [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    },
    get: (sql, params, callback) => {
        if (typeof callback === 'function') {
            return db.get(sql, params, callback);
        }
        if (typeof params === 'function') {
            return db.get(sql, [], params);
        }
        return new Promise((resolve, reject) => {
            db.get(sql, params || [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },
    run: (sql, params, callback) => {
        if (typeof callback === 'function') {
            return db.run(sql, params, callback);
        }
        if (typeof params === 'function') {
            return db.run(sql, [], params);
        }
        return new Promise((resolve, reject) => {
            db.run(sql, params || [], function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }
};

module.exports = {
    db: dbHybrid, // Exportar versión híbrida (promesas + callbacks)
    dbRaw: db,    // Exportar versión raw sqlite3
    initializeDatabase
};