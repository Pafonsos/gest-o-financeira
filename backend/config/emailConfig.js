const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

// Configuração do transporter do Gmail
const createEmailTransporter = () => {
  try {
    const transporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
      },
      tls: { 
        rejectUnauthorized: false 
      }
    });

    // Verificar configuração apenas se as credenciais existirem
    if (process.env.EMAIL_USER && 
        process.env.EMAIL_PASS && 
        !process.env.EMAIL_USER.includes('teste')) {
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

const emailDefaults = {
  from: {
    name: process.env.EMAIL_FROM_NAME || 'PROTEQ - Financeiro',
    address: process.env.EMAIL_USER
  }
};

const rateLimits = {
  maxEmailsPerHour: parseInt(process.env.MAX_EMAILS_PER_HOUR) || 50,
  maxEmailsPerDay: parseInt(process.env.MAX_EMAILS_PER_DAY) || 200,
  delayBetweenEmails: 1500
};

const templatePaths = {
  'primeira-cobranca': './templates/primeira-cobranca.html',
  'cobranca-7dias': './templates/cobranca-7dias.html',
  'cobranca-15dias': './templates/cobranca-15dias.html',
  'cobranca-30dias': './templates/cobranca-30dias.html',
  'solicitacao-contato': './templates/solicitacao-contato.html'
};

const validateEmailConfig = () => {
  const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.warn(`Variáveis de ambiente de email não encontradas: ${missingVars.join(', ')}`);
    return false;
  }
  return true;
};

module.exports = {
  createEmailTransporter,
  emailDefaults,
  rateLimits,
  templatePaths,
  validateEmailConfig
};