const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configuração do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
      }, null, 2);
    })
  ),
  defaultMeta: {
    service: 'email-system'
  },
  transports: [
    // Logs de erro em arquivo separado
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Todos os logs em arquivo geral
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    
    // Logs específicos de email
    new winston.transports.File({
      filename: path.join(logsDir, 'emails.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          // Filtrar apenas logs relacionados a emails
          if (message.includes('email') || message.includes('Email') || meta.to || meta.messageId) {
            return `${timestamp} [${level.toUpperCase()}] ${message} ${JSON.stringify(meta)}`;
          }
          return '';
        })
      )
    })
  ],
  
  // Tratar exceções não capturadas
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],
  
  // Tratar rejeições de promises não tratadas
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ]
});

// Em ambiente de desenvolvimento, também logar no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}] ${message} ${metaString}`;
      })
    )
  }));
}

// Função para logar eventos de email especificamente
const logEmailEvent = (event, data) => {
  logger.info(`Email Event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...data
  });
};

// Função para logar tentativas de spam
const logSpamAttempt = (ip, reason, data = {}) => {
  logger.warn(`Possível tentativa de spam detectada`, {
    ip,
    reason,
    timestamp: new Date().toISOString(),
    userAgent: data.userAgent,
    ...data
  });
};

// Função para logar rate limiting
const logRateLimit = (ip, endpoint, limit) => {
  logger.warn(`Rate limit atingido`, {
    ip,
    endpoint,
    limit,
    timestamp: new Date().toISOString()
  });
};

// Função para logar estatísticas diárias
const logDailyStats = (stats) => {
  logger.info('Estatísticas diárias de email', {
    date: new Date().toISOString().split('T')[0],
    ...stats
  });
};

// Middleware para logar requests HTTP
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Capturar o end original
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const duration = Date.now() - start;
    
    logger.info(`HTTP ${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Chamar o end original
    originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = {
  logger,
  logEmailEvent,
  logSpamAttempt,
  logRateLimit,
  logDailyStats,
  requestLogger
};