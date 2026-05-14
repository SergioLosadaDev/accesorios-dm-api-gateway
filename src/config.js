const dotenv = require('dotenv');
dotenv.config();

const config = {
  // Gateway
  port: process.env.PORT || 8002,
  
  // Microservicios
  services: {
    inventory: {
      host: process.env.INVENTORY_HOST || 'localhost',
      port: process.env.INVENTORY_PORT || 8082,
      basePath: '/api/v1'
    },
    security: {
      host: process.env.SECURITY_HOST || 'localhost',
      port: process.env.SECURITY_PORT || 8890,
      basePath: '/api/v1'
    },
    payment: {
      host: process.env.PAYMENT_HOST || 'localhost',
      port: process.env.PAYMENT_PORT || 9002,
      basePath: '/api/v1'
    }
  }
};

module.exports = config;