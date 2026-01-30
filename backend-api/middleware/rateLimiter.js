const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger');

// Rate limiter para API de email
const emailRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 requests por hora por IP
  message: {
    success: false,
    message: 'Muitas tentativas de envio de email. Tente novamente em 1 hora.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de envio de email. Tente novamente em 1 hora.',
      retryAfter: 3600
    });
  }
});

// Rate limiter mais restritivo para envio em massa
const bulkEmailRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 envios em massa por hora
  message: {
    success: false,
    message: 'Limite de envio em massa excedido. Máximo 3 por hora.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit de envio em massa excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Limite de envio em massa excedido. Máximo 3 por hora.',
      retryAfter: 3600
    });
  }
});

// Rate limiter geral para API
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por 15 minutos por IP
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 15 minutos.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  emailRateLimit,
  bulkEmailRateLimit,
  apiRateLimit
};