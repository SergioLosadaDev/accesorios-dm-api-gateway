require('dotenv').config();

const config = {
    port: process.env.PORT || 8001,
    env: process.env.NODE_ENV || 'qa',
    
    services: {
        inventory: {
            host: process.env.INVENTORY_HOST || 'accesorios-dm-inventory-service-qa',
            port: process.env.INVENTORY_PORT || 8081,
            basePath: '/api/v1'
        },
        security: {
            host: process.env.SECURITY_HOST || 'accesorios-dm-security-qa',
            port: process.env.SECURITY_PORT || 8889,
            basePath: '/api/v1'
        },
        payment: {
            host: process.env.PAYMENT_HOST || 'accesorios-dm-payment-qa',
            port: process.env.PAYMENT_PORT || 9001,
            basePath: '/api/v1'
        }
    }
};

module.exports = config;