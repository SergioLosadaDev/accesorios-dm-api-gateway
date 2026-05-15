const dotenv = require('dotenv');
dotenv.config();

const config = {
  port: process.env.PORT || 8002,
  services: {
    inventory: {
      host: 'accesorios-dm-inventory-service-dev',  // Nombre del contenedor
      port: 8082,
      basePath: '/api/v1'
    },
    security: {
      host: 'accesorios-dm-security-dev',  // Nombre del contenedor
      port: 8890,
      basePath: '/api/v1'
    },
    payment: {
      host: 'accesorios-dm-payment-dev',  // Nombre del contenedor
      port: 9002,
      basePath: '/api/v1'
    }
  }
};

module.exports = config;