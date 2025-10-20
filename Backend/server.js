const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const os = require('os');
const { initializeDatabase } = require('./utils/database');
const { config, getEnvironmentConfig, displayConfig } = require('./config-app-universal');
const { getPeruTimestamp } = require('./utils/timeUtils');
const { iniciarCronJobs } = require('./utils/cronJobs');
const { environmentDetector } = require('./utils/environmentDetector');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Variables globales para detección de entorno
let PUBLIC_IP = null;
let IS_AWS = false;
let DETECTED_PORT = null;
let ENVIRONMENT_INFO = null;

// Función para detectar puerto disponible automáticamente
async function detectAvailablePort() {
    // Detectar puerto desde .env o usar 3000 por defecto (nginx hace proxy al 80)
    const port = process.env.EXTERNAL_PORT || process.env.PORT || 3000;
    return parseInt(port);
}

// Configuración inicial del puerto (se actualizará automáticamente al iniciar)
let PORT = process.env.EXTERNAL_PORT || process.env.PORT || 3000;
const HOST = process.env.HOST || config.server.host || '0.0.0.0';

// Token de ngrok desde variables de entorno (eliminado)
// const NGROK_TOKEN = process.env.NGROK_TOKEN;

// Dominio estático de ngrok (eliminado)
// const NGROK_DOMAIN = process.env.NGROK_DOMAIN || null;

// Configuración de CORS flexible para máxima compatibilidad
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'User-Agent', 'X-Requested-With', 'Accept'],
    credentials: true
};

// Middleware básico
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware especial para bypass completo y compatibilidad total
app.use((req, res, next) => {
    try {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    } catch (error) {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
    
    // Headers para máxima compatibilidad
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent, X-Requested-With, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Headers adicionales
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Responder inmediatamente a preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    next();
});

// Rutas principales - con prefijo /api para compatibilidad con WebPanel y APK
app.use('/api/auth', require('./routes/auth'));
app.use('/api/fichado', require('./routes/fichado'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/tiempo-real', require('./routes/tiempo-real'));
app.use('/api/haccp', require('./routes/haccp'));
app.use('/api/haccp-daily', require('./routes/haccp-daily')); // Nuevos endpoints para datos diarios
app.use('/api/formularios-haccp', require('./routes/formularios-haccp'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/auditoria', require('./routes/auditoria'));
app.use('/api/health', require('./routes/health'));
app.use('/api/configuracion', require('./routes/configuracion'));

// Ruta de health check sin prefijo (para compatibilidad)
app.get('/health', (req, res) => {
    try {
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            server: {
                host: HOST,
                port: PORT
            },
            database: {
                connected: true
            }
        });
    } catch (error) {
        console.error('Error en /health:', error);
        res.status(500).json({
            status: 'ERROR',
            error: error.message
        });
    }
});

// Endpoint para configuración del entorno (para WebPanel)
app.get('/api/config/environment', (req, res) => {
    try {
        const envConfig = getEnvironmentConfig(IS_AWS);
        const recommendedConfig = ENVIRONMENT_INFO ? 
            environmentDetector.getRecommendedConfig(ENVIRONMENT_INFO) : null;
        
        res.json({
            success: true,
            data: {
                environment: IS_AWS ? 'aws' : 'local',
                isAWS: IS_AWS,
                server: {
                    host: PUBLIC_IP || HOST,
                    port: PORT,
                    publicUrl: `http://${PUBLIC_IP || HOST}${PORT === 80 ? '' : ':' + PORT}`
                },
                config: {
                    corsOrigins: envConfig.server.corsOrigins,
                    allowedHosts: envConfig.server.allowedHosts
                },
                detection: ENVIRONMENT_INFO ? {
                    region: ENVIRONMENT_INFO.region,
                    instanceId: ENVIRONMENT_INFO.instanceId,
                    availabilityZone: ENVIRONMENT_INFO.availabilityZone,
                    networkInterfaces: ENVIRONMENT_INFO.networkInterfaces,
                    recommendedConfig: recommendedConfig
                } : null,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error en /api/config/environment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Ruta raíz eliminada: no exponer información pública. Las rutas disponibles comienzan en /api/*

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`
    });
});

// Función para detectar la IP pública automáticamente
async function detectPublicIP() {
    try {
        console.log('🔍 Detectando entorno e IP pública...');
        
        // Primero intentar detectar si estamos en AWS
        const awsDetection = await detectEnvironment();
        
        if (awsDetection.isAWS && awsDetection.ip) {
            console.log(`✅ Entorno AWS detectado`);
            console.log(`✅ IP pública (AWS): ${awsDetection.ip}`);
            IS_AWS = true;
            return awsDetection.ip;
        }
        
        console.log('📍 Entorno: LOCAL');
        
        // Si no es AWS, intentar obtener IP desde servicios públicos
        const services = [
            'https://api.ipify.org?format=json',
            'https://ifconfig.me/ip',
            'https://icanhazip.com'
        ];
        
        for (const service of services) {
            try {
                const response = await axios.get(service, { timeout: 5000 });
                const ip = typeof response.data === 'string' 
                    ? response.data.trim() 
                    : response.data.ip;
                
                if (ip && /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
                    console.log(`✅ IP pública detectada: ${ip}`);
                    return ip;
                }
            } catch (error) {
                // Intentar con el siguiente servicio
                continue;
            }
        }
        
        // Si no se puede detectar desde internet, intentar obtener IP local
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    console.log(`⚠️  Usando IP local: ${iface.address}`);
                    return iface.address;
                }
            }
        }
        
        console.log('⚠️  No se pudo detectar IP pública');
        return 'localhost';
    } catch (error) {
        console.error('❌ Error detectando IP:', error.message);
        return 'localhost';
    }
}

// Variable global para almacenar el listener de ngrok (eliminado)
// let ngrokListener = null;

// Función para inicializar ngrok automáticamente (eliminada)
// async function initializeNgrok() { /* eliminado */ }

// Función principal para inicializar el servidor
const startServer = async () => {
    try {
        console.log('🔄 Inicializando servidor HACCP Wino...');
        
        // Detectar entorno usando el nuevo detector
        ENVIRONMENT_INFO = await environmentDetector.detectEnvironment();
        IS_AWS = ENVIRONMENT_INFO.isAWS;
        PUBLIC_IP = ENVIRONMENT_INFO.publicIP;
        
        console.log(`📍 Entorno detectado: ${IS_AWS ? 'AWS' : 'LOCAL'}`);
        console.log(`🏷️  Región: ${ENVIRONMENT_INFO.region || 'N/A'}`);
        console.log(`🆔 Instance ID: ${ENVIRONMENT_INFO.instanceId || 'N/A'}`);
        
        // Obtener configuración específica del entorno
        const envConfig = getEnvironmentConfig(IS_AWS);
        
        // Detectar puerto disponible automáticamente
        if (!process.env.PORT) {
            PORT = envConfig.server.defaultPort;
            console.log(`🔧 Puerto por defecto para ${envConfig.currentEnvironment}: ${PORT}`);
        } else {
            PORT = parseInt(process.env.PORT);
            console.log(`🔧 Puerto configurado manualmente: ${PORT}`);
        }
        
        DETECTED_PORT = PORT;
        
        // Mostrar configuración recomendada
        const recommendedConfig = environmentDetector.getRecommendedConfig(ENVIRONMENT_INFO);
        console.log('\n📋 Configuración recomendada:');
        console.log(`   • Host: ${recommendedConfig.host}`);
        console.log(`   • Puerto: ${recommendedConfig.port}`);
        console.log(`   • CORS Origins: ${recommendedConfig.corsOrigins.join(', ')}`);
        
        console.log('📊 Inicializando base de datos...');
        await initializeDatabase();
        console.log('✅ Base de datos inicializada correctamente');
        
        console.log('⏰ Inicializando cron jobs...');
        iniciarCronJobs();
        console.log('✅ Cron jobs configurados correctamente');
        
        // Mostrar configuración del entorno
        displayConfig(IS_AWS);

        // Iniciar servidor en HOST y PORT configurados - Forzar 0.0.0.0 para AWS
        const LISTEN_HOST = '0.0.0.0'; // Forzar para acceso externo
        const server = app.listen(PORT, LISTEN_HOST, async () => {
            const ENVIRONMENT = IS_AWS ? 'AWS' : 'LOCAL';
            const PUBLIC_URL = `http://${PUBLIC_IP}${PORT === 80 ? '' : ':' + PORT}`;
            
            console.log(`\n🚀 SERVIDOR HACCP WINO INICIADO! 🚀`);
            console.log('==========================================');
            console.log(`📍 Entorno: ${ENVIRONMENT}`);
            console.log(`🏠 Servidor: ${LISTEN_HOST}:${PORT}`);
            console.log(`🌐 IP Pública: ${PUBLIC_IP}`);
            console.log(`🌍 URL Acceso: ${PUBLIC_URL}`);
            console.log(`🏥 Node ENV: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📋 Health: ${PUBLIC_URL}/health`);
            console.log('==========================================\n');
            
            // Ngrok eliminado: siempre acceso directo
            console.log('📡 Acceso directo por IP');
            console.log('==========================================');
            console.log(`🌐 URL Pública: ${PUBLIC_URL}`);
            console.log(`🏠 Local: http://localhost:${PORT}`);
            console.log('==========================================\n');
        });

        // Configurar cierre elegante
        const gracefulShutdown = async () => {
            console.log('\n🛑 Cerrando servidor...');
            
            // Cerrar servidor HTTP
        server.close(() => {
            console.log('✅ Servidor cerrado correctamente');
            process.exit(0);
        });
        };

        // Manejo de señales de cierre
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
        
    } catch (error) {
        console.error('❌ Error al inicializar el servidor:', error);
        process.exit(1);
    }
};

// Iniciar servidor automáticamente
startServer();