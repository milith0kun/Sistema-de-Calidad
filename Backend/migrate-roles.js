// Script para migrar la estructura de la tabla usuarios y actualizar roles
// Convierte ADMIN -> supervisor, SUPERVISOR -> supervisor, EMPLEADO -> colaborador

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('Iniciando migración de estructura y roles...');

db.serialize(() => {
    // Paso 1: Crear tabla temporal con la nueva estructura
    console.log('Creando tabla temporal...');
    db.run(`
        CREATE TABLE usuarios_temp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellido TEXT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            cargo TEXT,
            area TEXT,
            rol TEXT NOT NULL CHECK(rol IN ('colaborador', 'supervisor')),
            activo BOOLEAN DEFAULT 1,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, function(err) {
        if (err) {
            console.error('Error creando tabla temporal:', err);
            return;
        }
        console.log('Tabla temporal creada exitosamente');
    });

    // Paso 2: Migrar datos existentes con conversión de roles
    console.log('Migrando datos existentes...');
    db.run(`
        INSERT INTO usuarios_temp (id, nombre, apellido, email, password, cargo, area, rol, activo, fecha_creacion)
        SELECT 
            id,
            nombre,
            '' as apellido,
            email,
            password,
            '' as cargo,
            '' as area,
            CASE 
                WHEN rol IN ('ADMIN', 'SUPERVISOR') THEN 'supervisor'
                WHEN rol = 'EMPLEADO' THEN 'colaborador'
                ELSE 'colaborador'
            END as rol,
            activo,
            fecha_creacion
        FROM usuarios
    `, function(err) {
        if (err) {
            console.error('Error migrando datos:', err);
            return;
        }
        console.log(`${this.changes} usuarios migrados exitosamente`);
    });

    // Paso 3: Eliminar tabla original
    console.log('Eliminando tabla original...');
    db.run(`DROP TABLE usuarios`, function(err) {
        if (err) {
            console.error('Error eliminando tabla original:', err);
            return;
        }
        console.log('Tabla original eliminada');
    });

    // Paso 4: Renombrar tabla temporal
    console.log('Renombrando tabla temporal...');
    db.run(`ALTER TABLE usuarios_temp RENAME TO usuarios`, function(err) {
        if (err) {
            console.error('Error renombrando tabla:', err);
            return;
        }
        console.log('Tabla renombrada exitosamente');
    });

    // Paso 5: Verificar los cambios
    db.all(`SELECT id, nombre, apellido, email, rol FROM usuarios`, (err, rows) => {
        if (err) {
            console.error('Error consultando usuarios:', err);
        } else {
            console.log('\nUsuarios después de la migración:');
            rows.forEach(user => {
                console.log(`- ${user.nombre} ${user.apellido || ''} (${user.email}): ${user.rol}`);
            });
        }
        
        // Paso 6: Verificar nueva estructura
        db.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name='usuarios'`, (err, row) => {
            if (err) {
                console.error('Error obteniendo nueva estructura:', err);
            } else if (row) {
                console.log('\nNueva estructura de la tabla usuarios:');
                console.log(row.sql);
            }
            
            db.close((err) => {
                if (err) {
                    console.error('Error cerrando base de datos:', err);
                } else {
                    console.log('\nMigración completada exitosamente.');
                }
            });
        });
    });
});