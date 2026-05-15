const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const config = require('./config');
const apiRoutes = require('./routes');

dotenv.config();

const app = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check del gateway
app.get('/api/v1/gateway/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'api-gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      inventory: `http://${config.services.inventory.host}:${config.services.inventory.port}`,
      security: `http://${config.services.security.host}:${config.services.security.port}`,
      payment: `http://${config.services.payment.host}:${config.services.payment.port}`
    }
  });
});

// Rutas de la API
app.use('/api/v1', apiRoutes);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: `Ruta no encontrada: ${req.originalUrl}`,
    available_routes: [
      '/api/v1/gateway/health',
      '/api/v1/health/all',
      '/api/v1/health/inventory',
      '/api/v1/health/security',
      '/api/v1/health/payment',
      '/api/v1/inventory/*',
      '/api/v1/security/*',
      '/api/v1/payment/*'
    ]
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('\n--- Servicios configurados ---');
  console.log(`Inventory: http://${config.services.inventory.host}:${config.services.inventory.port}`);
  console.log(`Security:  http://${config.services.security.host}:${config.services.security.port}`);
  console.log(`Payment:   http://${config.services.payment.host}:${config.services.payment.port}`);
  console.log('\n--- Endpoints disponibles ---');
  console.log(`Gateway Health: http://localhost:${PORT}/api/v1/gateway/health`);
  console.log(`All Services Health: http://localhost:${PORT}/api/v1/health/all`);
  console.log(`Inventory: http://localhost:${PORT}/api/v1/inventory/...`);
  console.log(`Security:  http://localhost:${PORT}/api/v1/security/...`);
  console.log(`Payment:   http://localhost:${PORT}/api/v1/payment/...`);
});