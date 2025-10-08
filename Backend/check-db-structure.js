// Script para verificar la estructura de la base de datos
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('Verificando estructura de la base de datos...');

db.serialize(() => {
    // Obtener estructura de la tabla usuarios
    db.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name='usuarios'`, (err, row) => {
        if (err) {
            console.error('Error obteniendo estructura:', err);
        } else if (row) {
            console.log('\nEstructura de la tabla usuarios:');
            console.log(row.sql);
        } else {
            console.log('Tabla usuarios no encontrada');
        }
    });

    // Obtener usuarios existentes
    db.all(`SELECT * FROM usuarios LIMIT 5`, (err, rows) => {
        if (err) {
            console.error('Error consultando usuarios:', err);
        } else {
            console.log('\nUsuarios existentes:');
            console.log(rows);
        }
        
        db.close();
    });
});