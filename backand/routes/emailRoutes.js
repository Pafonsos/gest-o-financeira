const express = require('express');
const router = express.Router();

const {
  sendBulkEmails,
  sendSingleEmailController,
  getTemplates,
  previewTemplate,
  getEmailStatistics
} = require('../controllers/emailController');

const {
  emailRateLimit,
  bulkEmailRateLimit,
  apiRateLimit
} = require('../middleware/rateLimiter');

const { 
  validateSingleEmailData,
  validateBulkEmailData,
  validatePreviewData,
  sanitizeEmailData
} = require('../utils/emailValidator');

const { logger, requestLogger } = require('../utils/logger');

// Middleware para todas as rotas de email
router.use(requestLogger);
router.use(apiRateLimit);

// Middleware de validação e sanitização
const validateAndSanitize = (validationFunction) => {
  return (req, res, next) => {
    try {
      // Sanitizar dados de entrada
      req.body = sanitizeEmailData(req.body);
      
      // Validar dados
      const validation = validationFunction(req.body);
      
      if (!validation.isValid) {
        logger.warn('Dados de entrada inválidos:', {
          error: validation.error,
          field: validation.field,
          ip: req.ip
        });
        
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          error: validation.error,
          field: validation.field
        });
      }
      
      // Adicionar dados validados ao request
      req.validatedData = validation.value;
      if (validation.duplicatesRemoved) {
        req.duplicatesRemoved = validation.duplicatesRemoved;
      }
      
      next();
    } catch (error) {
      logger.error('Erro na validação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno na validação'
      });
    }
  };
};

// Rotas

// GET /api/email/health - Verificar status do sistema
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de email funcionando',
    timestamp: new Date().toISOString()
  });
});

// GET /api/email/templates - Listar templates disponíveis
router.get('/templates', getTemplates);

// POST /api/email/preview - Preview de template
router.post('/preview', 
  validateAndSanitize(validatePreviewData),
  previewTemplate
);

// GET /api/email/statistics - Estatísticas de envio
router.get('/statistics', getEmailStatistics);

// POST /api/email/send - Enviar email único
router.post('/send',
  emailRateLimit,
  validateAndSanitize(validateSingleEmailData),
  (req, res, next) => {
    // Logar tentativa de envio
    logger.info('Tentativa de envio de email único:', {
      to: req.validatedData.to,
      subject: req.validatedData.subject,
      template: req.validatedData.template,
      ip: req.ip
    });
    next();
  },
  sendSingleEmailController
);

// POST /api/email/send-bulk - Enviar emails em massa
router.post('/send-bulk',
  bulkEmailRateLimit,
  validateAndSanitize(validateBulkEmailData),
  (req, res, next) => {
    // Logar tentativa de envio em massa
    logger.info('Tentativa de envio em massa:', {
      recipientCount: req.validatedData.recipients.length,
      duplicatesRemoved: req.duplicatesRemoved || 0,
      subject: req.validatedData.subject,
      template: req.validatedData.template,
      ip: req.ip
    });
    
    // Informar sobre duplicatas removidas
    if (req.duplicatesRemoved > 0) {
      logger.info(`${req.duplicatesRemoved} emails duplicados foram removidos da lista`);
    }
    
    next();
  },
  sendBulkEmails
);

// POST /api/email/test - Rota de teste (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  router.post('/test', (req, res) => {
    logger.info('Rota de teste acessada', { ip: req.ip });
    
    res.json({
      success: true,
      message: 'Rota de teste funcionando',
      receivedData: req.body,
      timestamp: new Date().toISOString()
    });
  });
}

// Middleware de tratamento de erros específico para rotas de email
router.use((error, req, res, next) => {
  logger.error('Erro nas rotas de email:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Erros específicos de email
  if (error.code === 'EAUTH') {
    return res.status(500).json({
      success: false,
      message: 'Erro de autenticação do email. Verifique as credenciais.'
    });
  }

  if (error.code === 'ECONNECTION') {
    return res.status(500).json({
      success: false,
      message: 'Erro de conexão com servidor de email.'
    });
  }

  if (error.responseCode === 550) {
    return res.status(400).json({
      success: false,
      message: 'Email rejeitado pelo destinatário.'
    });
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    message: 'Erro interno no sistema de email',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

module.exports = router;