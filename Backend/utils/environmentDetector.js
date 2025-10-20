const axios = require('axios');
const os = require('os');

/**
 * Detector avanzado de entorno para el backend
 * Detecta automáticamente si está ejecutándose en AWS, local, o otros entornos
 */
class EnvironmentDetector {
    constructor() {
        this.detectionCache = null;
        this.lastDetection = null;
    }

    /**
     * Detecta si estamos ejecutándose en AWS EC2
     */
    async detectAWS() {
        try {
            console.log('🔍 Verificando si estamos en AWS EC2...');
            
            // Paso 1: Obtener token IMDSv2 para AWS EC2
            const tokenResponse = await axios.put(
                'http://169.254.169.254/latest/api/token',
                null,
                {
                    timeout: 2000,
                    headers: { 'X-aws-ec2-metadata-token-ttl-seconds': '21600' }
                }
            );
            
            const token = tokenResponse.data;
            console.log('✅ Token IMDSv2 obtenido exitosamente');
            
            // Paso 2: Obtener información de la instancia
            const [ipResponse, instanceResponse, regionResponse] = await Promise.all([
                // IP pública
                axios.get('http://169.254.169.254/latest/meta-data/public-ipv4', {
                    timeout: 2000,
                    headers: { 'X-aws-ec2-metadata-token': token }
                }).catch(() => ({ data: null })),
                
                // ID de instancia
                axios.get('http://169.254.169.254/latest/meta-data/instance-id', {
                    timeout: 2000,
                    headers: { 'X-aws-ec2-metadata-token': token }
                }).catch(() => ({ data: null })),
                
                // Región
                axios.get('http://169.254.169.254/latest/meta-data/placement/region', {
                    timeout: 2000,
                    headers: { 'X-aws-ec2-metadata-token': token }
                }).catch(() => ({ data: null }))
            ]);
            
            const awsInfo = {
                isAWS: true,
                publicIP: ipResponse.data?.trim() || null,
                instanceId: instanceResponse.data?.trim() || null,
                region: regionResponse.data?.trim() || null,
                detectedAt: new Date().toISOString()
            };
            
            console.log('✅ Entorno AWS detectado:', awsInfo);
            return awsInfo;
            
        } catch (error) {
            console.log('❌ No es AWS EC2 o no tiene acceso a metadata:', error.message);
            return { isAWS: false };
        }
    }

    /**
     * Detecta información del entorno local
     */
    async detectLocal() {
        try {
            console.log('🔍 Detectando información del entorno local...');
            
            // Obtener interfaces de red
            const interfaces = os.networkInterfaces();
            const networkInfo = [];
            
            for (const [name, ifaces] of Object.entries(interfaces)) {
                for (const iface of ifaces) {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        networkInfo.push({
                            interface: name,
                            address: iface.address,
                            netmask: iface.netmask,
                            mac: iface.mac
                        });
                    }
                }
            }
            
            // Intentar obtener IP pública desde servicios externos
            let publicIP = null;
            const ipServices = [
                'https://api.ipify.org?format=json',
                'https://ifconfig.me/ip',
                'https://icanhazip.com'
            ];
            
            for (const service of ipServices) {
                try {
                    const response = await axios.get(service, { timeout: 3000 });
                    const ip = typeof response.data === 'string' 
                        ? response.data.trim() 
                        : response.data.ip;
                    
                    if (ip && /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
                        publicIP = ip;
                        console.log(`✅ IP pública detectada desde ${service}: ${ip}`);
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            const localInfo = {
                isAWS: false,
                hostname: os.hostname(),
                platform: os.platform(),
                arch: os.arch(),
                publicIP: publicIP,
                localIPs: networkInfo,
                detectedAt: new Date().toISOString()
            };
            
            console.log('✅ Entorno local detectado:', {
                hostname: localInfo.hostname,
                platform: localInfo.platform,
                publicIP: localInfo.publicIP,
                localIPCount: localInfo.localIPs.length
            });
            
            return localInfo;
            
        } catch (error) {
            console.error('❌ Error detectando entorno local:', error);
            return {
                isAWS: false,
                hostname: os.hostname(),
                platform: os.platform(),
                publicIP: null,
                error: error.message
            };
        }
    }

    /**
     * Detecta el entorno completo (AWS o local)
     */
    async detectEnvironment() {
        // Si tenemos cache reciente (menos de 5 minutos), usarlo
        if (this.detectionCache && this.lastDetection) {
            const timeDiff = Date.now() - this.lastDetection;
            if (timeDiff < 5 * 60 * 1000) { // 5 minutos
                console.log('📋 Usando detección cacheada del entorno');
                return this.detectionCache;
            }
        }

        console.log('🔄 Iniciando detección completa del entorno...');
        
        // Primero intentar AWS
        const awsInfo = await this.detectAWS();
        
        if (awsInfo.isAWS) {
            this.detectionCache = awsInfo;
            this.lastDetection = Date.now();
            return awsInfo;
        }
        
        // Si no es AWS, detectar entorno local
        const localInfo = await this.detectLocal();
        this.detectionCache = localInfo;
        this.lastDetection = Date.now();
        
        return localInfo;
    }

    /**
     * Fuerza una nueva detección (ignora cache)
     */
    async forceDetection() {
        this.detectionCache = null;
        this.lastDetection = null;
        return await this.detectEnvironment();
    }

    /**
     * Obtiene configuración recomendada basada en el entorno detectado
     * @param {Object} envInfo - Información del entorno detectado
     * @returns {Object} Configuración recomendada
     */
    getRecommendedConfig(envInfo) {
        if (!envInfo) {
            return {
                host: '0.0.0.0',
                port: process.env.PORT || 3000,
                corsOrigins: [
                    'http://localhost:3000',
                    'http://localhost:5173',
                    'http://127.0.0.1:3000',
                    'http://127.0.0.1:5173'
                ],
                database: {
                    path: './data/haccp_wino.db',
                    backup: false
                }
            };
        }

        if (envInfo.isAWS) {
            return {
                host: '0.0.0.0',
                port: process.env.PORT || 3000,
                corsOrigins: [
                    `http://${envInfo.publicIP}:3000`,
                    `https://${envInfo.publicIP}:3000`,
                    `http://${envInfo.publicIP}:5173`,
                    `https://${envInfo.publicIP}:5173`,
                    'http://localhost:3000',
                    'http://localhost:5173'
                ],
                database: {
                    path: './data/haccp_wino.db',
                    backup: true
                }
            };
        } else {
            return {
                host: '0.0.0.0',
                port: process.env.PORT || 3000,
                corsOrigins: [
                    'http://localhost:3000',
                    'http://localhost:5173',
                    'http://127.0.0.1:3000',
                    'http://127.0.0.1:5173',
                    ...(envInfo.publicIP ? [
                        `http://${envInfo.publicIP}:3000`,
                        `http://${envInfo.publicIP}:5173`
                    ] : [])
                ],
                database: {
                    path: './data/haccp_wino.db',
                    backup: false
                }
            };
        }
    }
}

// Exportar instancia singleton
const environmentDetector = new EnvironmentDetector();

module.exports = {
    EnvironmentDetector,
    environmentDetector
};