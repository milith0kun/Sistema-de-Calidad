const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Configuración de la base de datos
const dbDir = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDir, 'database.db');

console.log('=== CONFIGURACIÓN DE CÁMARAS FRIGORÍFICAS ===');
console.log('Ruta de la base de datos:', dbPath);

// Crear directorio si no existe
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Directorio de base de datos creado');
}

// Conectar a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error al conectar con la base de datos:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Conectado a la base de datos SQLite');
        setupCamaras();
    }
});

function setupCamaras() {
    console.log('\n📋 Configurando tabla camaras_frigorificas...');
    
    // Crear tabla camaras_frigorificas
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS camaras_frigorificas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('REFRIGERACION', 'CONGELACION')),
            temperatura_minima REAL NOT NULL,
            temperatura_maxima REAL NOT NULL,
            ubicacion TEXT,
            descripcion TEXT,
            activo BOOLEAN DEFAULT 1,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('❌ Error creando tabla camaras_frigorificas:', err.message);
            return;
        }
        
        console.log('✅ Tabla camaras_frigorificas creada correctamente');
        
        // Verificar si ya existen datos
        db.get('SELECT COUNT(*) as count FROM camaras_frigorificas', (err, row) => {
            if (err) {
                console.error('❌ Error verificando datos existentes:', err.message);
                return;
            }
            
            if (row.count > 0) {
                console.log(`ℹ️  Ya existen ${row.count} cámaras en la base de datos`);
                mostrarCamaras();
            } else {
                console.log('📝 Insertando cámaras con rangos HACCP...');
                insertarCamaras();
            }
        });
    });
}

function insertarCamaras() {
    const camaras = [
        {
            id: 1,
            nombre: 'REFRIGERACIÓN 1',
            tipo: 'REFRIGERACION',
            temperatura_minima: 0.0,
            temperatura_maxima: 4.0,
            ubicacion: 'Área de almacenamiento principal',
            descripcion: 'Cámara de refrigeración para productos frescos'
        },
        {
            id: 2,
            nombre: 'CONGELACIÓN 1',
            tipo: 'CONGELACION',
            temperatura_minima: -18.0,
            temperatura_maxima: -15.0,
            ubicacion: 'Área de congelados',
            descripcion: 'Cámara de congelación para productos congelados'
        },
        {
            id: 3,
            nombre: 'REFRIGERACIÓN 2',
            tipo: 'REFRIGERACION',
            temperatura_minima: 0.0,
            temperatura_maxima: 4.0,
            ubicacion: 'Área de almacenamiento secundaria',
            descripcion: 'Cámara de refrigeración adicional'
        }
    ];

    const insertSQL = `
        INSERT INTO camaras_frigorificas 
        (id, nombre, tipo, temperatura_minima, temperatura_maxima, ubicacion, descripcion) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    let insertedCount = 0;
    
    camaras.forEach((camara, index) => {
        db.run(insertSQL, [
            camara.id,
            camara.nombre,
            camara.tipo,
            camara.temperatura_minima,
            camara.temperatura_maxima,
            camara.ubicacion,
            camara.descripcion
        ], function(err) {
            if (err) {
                console.error(`❌ Error insertando cámara ${camara.nombre}:`, err.message);
            } else {
                console.log(`✅ Cámara insertada: ${camara.nombre} (${camara.temperatura_minima}°C a ${camara.temperatura_maxima}°C)`);
                insertedCount++;
            }
            
            // Si es la última cámara, mostrar resumen
            if (index === camaras.length - 1) {
                setTimeout(() => {
                    console.log(`\n📊 Resumen: ${insertedCount}/${camaras.length} cámaras insertadas correctamente`);
                    mostrarCamaras();
                }, 100);
            }
        });
    });
}

function mostrarCamaras() {
    console.log('\n📋 Cámaras configuradas:');
    
    db.all('SELECT * FROM camaras_frigorificas WHERE activo = 1 ORDER BY id', (err, rows) => {
        if (err) {
            console.error('❌ Error obteniendo cámaras:', err.message);
        } else {
            console.table(rows.map(row => ({
                ID: row.id,
                Nombre: row.nombre,
                Tipo: row.tipo,
                'Temp Min (°C)': row.temperatura_minima,
                'Temp Max (°C)': row.temperatura_maxima,
                Ubicación: row.ubicacion
            })));
        }
        
        console.log('\n✅ Configuración de cámaras completada');
        db.close((err) => {
            if (err) {
                console.error('❌ Error cerrando base de datos:', err.message);
            } else {
                console.log('🔒 Conexión a base de datos cerrada');
            }
        });
    });
}