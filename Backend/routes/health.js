// Ruta temporal de health check para aplicativo móvil
const express = require('express');
const router = express.Router();
const { getPeruTimestamp } = require('../utils/timeUtils');

router.get('/', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: getPeruTimestamp(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'production',
        server: {
            name: 'HACCP Wino Backend',
            version: '1.0.0'
        },
        database: {
            connected: true
        }
    });
});

module.exports = router;
