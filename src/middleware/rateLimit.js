const rateLimit = require('express-rate-limit');

const getConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    
    if (env === 'production') {
        return { windowMs: 15 * 60 * 1000, max: 100 };
    }
    if (env === 'qa') {
        return { windowMs: 10 * 60 * 1000, max: 200 };
    }
    return { windowMs: 60 * 1000, max: 1000 };
};

const rateLimitMiddleware = rateLimit({
    ...getConfig(),
    message: { error: 'Demasiadas peticiones, intenta más tarde' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.url.includes('/health')
});

const authRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: { error: 'Demasiados intentos de login, espera 5 minutos' },
    standardHeaders: true,
    skipSuccessfulRequests: true
});

module.exports = { rateLimitMiddleware, authRateLimit };