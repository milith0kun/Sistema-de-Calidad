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

// Conexión a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
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
                password TEXT NOT NULL,
                rol TEXT NOT NULL CHECK(rol IN ('ADMIN', 'EMPLEADO')),
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
                const supervisorPassword = await bcrypt.hash('supervisor123', 10);
                const colaboradorPassword = await bcrypt.hash('colaborador123', 10);

                // Insertar usuario supervisor
                const insertSupervisor = `
                    INSERT INTO usuarios (nombre, apellido, email, password, rol, cargo, area)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                // Insertar usuario colaborador
                const insertColaborador = `
                    INSERT INTO usuarios (nombre, apellido, email, password, rol, cargo, area)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                db.serialize(() => {
                    db.run(insertSupervisor, ['Supervisor', 'Sistema', 'supervisor@hotel.com', supervisorPassword, 'supervisor', 'Supervisor', 'Administración'], (err) => {
                        if (err) {
                            console.error('Error insertando supervisor:', err.message);
                            reject(err);
                            return;
                        }
                        console.log('Usuario supervisor creado');
                    });

                    db.run(insertColaborador, ['Colaborador', 'Prueba', 'colaborador@hotel.com', colaboradorPassword, 'colaborador', 'Colaborador', 'Operaciones'], (err) => {
                        if (err) {
                            console.error('Error insertando colaborador:', err.message);
                            reject(err);
                            return;
                        }
                        console.log('Usuario colaborador creado');
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