const config = {
    server: {
        host: '0.0.0.0'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_2024',
        expiresIn: '24h'
    }
};

const displayConfig = () => {
    console.log('Configuración cargada:', {
        server: config.server,
        jwt: { secret: '[OCULTO]', expiresIn: config.jwt.expiresIn }
    });
};

module.exports = { config, displayConfig };