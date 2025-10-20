// Configuración dinámica basada en el entorno detectado
const config = {
    server: {
        host: '0.0.0.0',
        // Configuraciones específicas por entorno
        local: {
            defaultPort: 3000,
            corsOrigins: [
                'http://localhost:3000', 
                'http://127.0.0.1:3000',
                'http://localhost:5173', // WebPanel en desarrollo
                'http://127.0.0.1:5173',
                'http://localhost:80',
                'http://127.0.0.1:80'
            ],
            allowedHosts: ['localhost', '127.0.0.1']
        },
        aws: {
            defaultPort: 80,
            corsOrigins: ['*'], // Más permisivo en AWS
            allowedHosts: ['*']
        }
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_2024',
        expiresIn: '24h'
    },
    database: {
        path: process.env.DB_PATH || './database/database.db',
        // Configuraciones específicas por entorno
        local: {
            backupEnabled: true,
            backupInterval: '0 2 * * *' // Cada día a las 2 AM
        },
        aws: {
            backupEnabled: true,
            backupInterval: '0 1 * * *' // Cada día a la 1 AM
        }
    }
};

// Función para obtener configuración específica del entorno
const getEnvironmentConfig = (isAWS = false) => {
    const environment = isAWS ? 'aws' : 'local';
    return {
        ...config,
        currentEnvironment: environment,
        server: {
            ...config.server,
            ...config.server[environment]
        },
        database: {
            ...config.database,
            ...config.database[environment]
        }
    };
};

const displayConfig = (isAWS = false) => {
    const envConfig = getEnvironmentConfig(isAWS);
    console.log('Configuración cargada:', {
        environment: envConfig.currentEnvironment.toUpperCase(),
        server: {
            host: envConfig.server.host,
            defaultPort: envConfig.server.defaultPort,
            corsOrigins: envConfig.server.corsOrigins
        },
        database: {
            path: envConfig.database.path,
            backupEnabled: envConfig.database.backupEnabled
        },
        jwt: { secret: '[OCULTO]', expiresIn: envConfig.jwt.expiresIn }
    });
};

module.exports = { config, getEnvironmentConfig, displayConfig };