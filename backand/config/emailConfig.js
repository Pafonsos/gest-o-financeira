const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

// Configuração do transporter do Gmail
const createEmailTransporter = () => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true para 465, false para outras portas
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // App Password do Gmail
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verificar conexão apenas se temos dados válidos
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && !process.env.EMAIL_USER.includes('teste')) {
      transporter.verify((error, success) => {
        if (error) {
          logger.error('Erro na configuração do email:', error);
        } else {
          logger.info('Servidor de email configurado com sucesso');
        }
      });
    }

    return transporter;
  } catch (error) {
    logger.error('Erro ao criar transporter de email:', error);
    throw error;
  }
};

// Configurações padrão para evitar spam
const emailDefaults = {
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Financial Manager',
    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
  },
  // Delay entre emails para evitar ser marcado como spam
  delayBetweenEmails: 1000, // 1 segundo
  // Configurações para melhor deliverability
  headers: {
    'X-Priority': '3',
    'X-MSMail-Priority': 'Normal',
    'X-Mailer': 'Financial Manager System',
    'X-MimeOLE': 'Produced By Financial Manager'
  }
};

// Configurações de rate limiting
const rateLimits = {
  maxEmailsPerHour: parseInt(process.env.MAX_EMAILS_PER_HOUR) || 50,
  maxEmailsPerDay: parseInt(process.env.MAX_EMAILS_PER_DAY) || 200,
  delayBetweenEmails: 1000 // 1 segundo entre emails
};

// Configurações de templates
const templatePaths = {
  'primeira-cobranca': './templates/primeira-cobranca.html',
  'cobranca-7dias': './templates/cobranca-7dias.html',
  'cobranca-15dias': './templates/cobranca-15dias.html',
  'cobranca-30dias': './templates/cobranca-30dias.html',
  'solicitacao-contato': './templates/solicitacao-contato.html'
};

// Função para validar configurações (apenas se não for teste)
const validateEmailConfig = () => {
  const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.warn(`Variáveis de ambiente de email não encontradas: ${missingVars.join(', ')} - usando configuração de teste`);
    return false;
  }

  // Validar formato do email (apenas se não for teste)
  if (!process.env.EMAIL_USER.includes('teste')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(process.env.EMAIL_USER)) {
      logger.error('EMAIL_USER não é um email válido');
      return false;
    }
  }

  logger.info('Configurações de email validadas com sucesso');
  return true;
};

module.exports = {
  createEmailTransporter,
  emailDefaults,
  rateLimits,
  templatePaths,
  validateEmailConfig
};