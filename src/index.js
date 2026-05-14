const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

const config = require('./config');

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
    timestamp: new Date().toISOString()
  });
});

// Rutas de los microservicios
// Inventory Service
app.use('/api/v1/inventory', createProxyMiddleware({
  target: `http://${config.services.inventory.host}:${config.services.inventory.port}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/inventory': '/api/v1'
  },
  onError: (err, req, res) => {
    console.error('Error en Inventory Service:', err.message);
    res.status(503).json({ error: 'Inventory Service no disponible' });
  }
}));

// Security Service
app.use('/api/v1/security', createProxyMiddleware({
  target: `http://${config.services.security.host}:${config.services.security.port}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/security': '/api/v1'
  },
  onError: (err, req, res) => {
    console.error('Error en Security Service:', err.message);
    res.status(503).json({ error: 'Security Service no disponible' });
  }
}));

// Payment Service
app.use('/api/v1/payment', createProxyMiddleware({
  target: `http://${config.services.payment.host}:${config.services.payment.port}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/payment': '/api/v1'
  },
  onError: (err, req, res) => {
    console.error('Error en Payment Service:', err.message);
    res.status(503).json({ error: 'Payment Service no disponible' });
  }
}));

// Ruta directa a health de cada microservicio (sin prefijo)
app.use('/api/v1/health/inventory', createProxyMiddleware({
  target: `http://${config.services.inventory.host}:${config.services.inventory.port}/api/v1/health`,
  changeOrigin: true,
  onError: (err, req, res) => {
    res.status(503).json({ error: 'Inventory Service no disponible' });
  }
}));

app.use('/api/v1/health/security', createProxyMiddleware({
  target: `http://${config.services.security.host}:${config.services.security.port}/api/v1/health`,
  changeOrigin: true,
  onError: (err, req, res) => {
    res.status(503).json({ error: 'Security Service no disponible' });
  }
}));

app.use('/api/v1/health/payment', createProxyMiddleware({
  target: `http://${config.services.payment.host}:${config.services.payment.port}/api/v1/health`,
  changeOrigin: true,
  onError: (err, req, res) => {
    res.status(503).json({ error: 'Payment Service no disponible' });
  }
}));

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.originalUrl}` });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Inventory Service: http://${config.services.inventory.host}:${config.services.inventory.port}`);
  console.log(`Security Service: http://${config.services.security.host}:${config.services.security.port}`);
  console.log(`Payment Service: http://${config.services.payment.host}:${config.services.payment.port}`);
});