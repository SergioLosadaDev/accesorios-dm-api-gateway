require('dotenv').config();

const config = {
    port: process.env.PORT || 8002,
    env: process.env.NODE_ENV || 'development',
    
    services: {
        inventory: {
            host: process.env.INVENTORY_HOST || 'accesorios-dm-inventory-service-dev',
            port: process.env.INVENTORY_PORT || 8082,
            basePath: '/api/v1'
        },
        security: {
            host: process.env.SECURITY_HOST || 'accesorios-dm-security-dev',
            port: process.env.SECURITY_PORT || 8890,
            basePath: '/api/v1'
        },
        payment: {
            host: process.env.PAYMENT_HOST || 'accesorios-dm-payment-dev',
            port: process.env.PAYMENT_PORT || 9002,
            basePath: '/api/v1'
        }
    }
};

module.exports = config;