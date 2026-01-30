const fs = require('fs').promises;
const path = require('path');
const { createEmailTransporter, emailDefaults, rateLimits } = require('../config/emailConfig');
const { validateEmail } = require('../utils/emailValidator');
const { logger } = require('../utils/logger');

// Controle de rate limiting em memória
let emailsSentThisHour = 0;
let emailsSentToday = 0;
let lastHourReset = new Date().getHours();
let lastDayReset = new Date().getDate();

// Reset contadores de rate limiting
const resetCounters = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDate();

  if (currentHour !== lastHourReset) {
    emailsSentThisHour = 0;
    lastHourReset = currentHour;
  }

  if (currentDay !== lastDayReset) {
    emailsSentToday = 0;
    lastDayReset = currentDay;
  }
};

// Carregar template de email
const loadTemplate = async (templateName) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    const template = await fs.readFile(templatePath, 'utf8');
    return template;
  } catch (error) {
    logger.error(`Erro ao carregar template ${templateName}:`, error);
    throw new Error(`Template ${templateName} não encontrado`);
  }
};

// Substituir variáveis no template
const replaceTemplateVariables = (template, variables) => {
  let processedTemplate = template;
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedTemplate = processedTemplate.replace(regex, variables[key] || '');
  });

  return processedTemplate;
};

// Função para formatar valor com ponto de milhar
const formatarValorBR = (valorString) => {
  if (!valorString) return 'R$ 0,00';
  
  // Remove R$ e espaços se existirem
  const limpo = valorString.toString().replace(/R\$\s?/g, '').trim();
  
  // Separa por vírgula
  const partes = limpo.split(',');
  const inteiro = partes[0];
  const decimal = partes[1] || '00';
  
  // Adiciona pontos de milhar
  const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `R$ ${inteiroFormatado},${decimal}`;
};

// Enviar email único com logo anexada
const sendSingleEmail = async (to, subject, template, variables = {}) => {
  let transporter;
  
  try {
    // Validar email
    if (!validateEmail(to)) {
      throw new Error(`Email inválido: ${to}`);
    }

    // Criar transporter
    transporter = createEmailTransporter();

    // Carregar e processar template
    const htmlTemplate = await loadTemplate(template);
    const processedHtml = replaceTemplateVariables(htmlTemplate, {
      ...variables,
      currentYear: new Date().getFullYear()
    });

    // Caminho da logo
    const logoPath = path.join(__dirname, '..', 'assets', 'logo-proteq.png');

    // Configurar email com logo anexada
    const mailOptions = {
      from: emailDefaults.from,
      to: to,  // CORRIGIDO: era recipient.email
      subject: subject,
      html: processedHtml,
      attachments: [{
        filename: 'logo-proteq.png',
        path: logoPath,
        cid: 'logo-proteq' 
      }]
    };

    // Enviar email
    const result = await transporter.sendMail(mailOptions);
    
    logger.info(`Email enviado com sucesso para ${to}`, {
      messageId: result.messageId,
      to: to,
      subject: subject,
      template: template
    });

    return {
      success: true,
      messageId: result.messageId,
      to: to,
      subject: subject
    };

  } catch (error) {
    logger.error(`Erro ao enviar email para ${to}:`, error);
    return {
      success: false,
      error: error.message,
      to: to,
      subject: subject
    };
  } finally {
    // Fechar conexão do transporter se existir
    if (transporter) {
      transporter.close();
    }
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Controller para envio em massa
const sendBulkEmails = async (req, res) => {
  try {
    resetCounters();

    const { recipients, subject, template, variables = {} } = req.body;

    // Validações
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de destinatários é obrigatória'
      });
    }

    if (!subject || !template) {
      return res.status(400).json({
        success: false,
        message: 'Assunto e template são obrigatórios'
      });
    }

    // Validar quantidade de destinatários
    if (recipients.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Número máximo de destinatários excedido (máx: 1000)'
      });
    }

    // Verificar rate limits
    if (emailsSentThisHour + recipients.length > rateLimits.maxEmailsPerHour) {
      return res.status(429).json({
        success: false,
        message: `Limite de emails por hora excedido. Máximo: ${rateLimits.maxEmailsPerHour}`
      });
    }

    if (emailsSentToday + recipients.length > rateLimits.maxEmailsPerDay) {
      return res.status(429).json({
        success: false,
        message: `Limite de emails por dia excedido. Máximo: ${rateLimits.maxEmailsPerDay}`
      });
    }

    logger.info(`Iniciando envio em massa para ${recipients.length} destinatários`);

    const results = [];
    
    // Enviar emails com delay
    for (const recipient of recipients) {
      const recipientData = typeof recipient === 'string' 
        ? { email: recipient } 
        : recipient;

      // Validar se o email existe
      if (!recipientData.email) {
        results.push({
          success: false,
          error: 'Email não fornecido',
          to: 'N/A',
          subject: subject
        });
        continue;
      }

      const personalizedVariables = {
        ...variables,
        nomeCliente: recipientData.nomeResponsavel || recipientData.nome || 'Cliente',
        nomeEmpresa: recipientData.nomeEmpresa || recipientData.empresa || '',
        cnpj: recipientData.cnpj || 'Não informado',
        valorPendente: formatarValorBR(recipientData.valorPendente),
        parcelasAtraso: recipientData.parcelasAtraso || '0 parcelas',
        dataVencimento: recipientData.proximoVencimento || recipientData.dataVencimento || 'Não informado',
        linkPagamento: recipientData.linkPagamento || '#'
      };

      const result = await sendSingleEmail(
        recipientData.email,
        subject,
        template,
        personalizedVariables
      );

      results.push(result);

      if (result.success) {
        emailsSentThisHour++;
        emailsSentToday++;
      }

      // Adicionar delay apenas se não for o último email
      if (recipients.indexOf(recipient) < recipients.length - 1) {
        await delay(rateLimits.delayBetweenEmails);
      }
    }

    // Estatísticas do envio
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    logger.info(`Envio em massa concluído: ${successful} sucessos, ${failed} falhas`);

    res.json({
      success: true,
      message: 'Envio em massa concluído',
      statistics: {
        total: recipients.length,
        successful,
        failed,
        successRate: recipients.length > 0 
          ? ((successful / recipients.length) * 100).toFixed(2) + '%' 
          : '0%'
      },
      results: results
    });

  } catch (error) {
    logger.error('Erro no envio em massa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no envio de emails',
      error: error.message
    });
  }
};

// Controller para envio único
const sendSingleEmailController = async (req, res) => {
  try {
    resetCounters();

    const { to, subject, template, variables = {} } = req.body;

    // Validações
    if (!to || !subject || !template) {
      return res.status(400).json({
        success: false,
        message: 'Email, assunto e template são obrigatórios'
      });
    }

    // Verificar rate limits
    if (emailsSentThisHour >= rateLimits.maxEmailsPerHour) {
      return res.status(429).json({
        success: false,
        message: `Limite de emails por hora excedido. Máximo: ${rateLimits.maxEmailsPerHour}`
      });
    }

    const result = await sendSingleEmail(to, subject, template, variables);

    if (result.success) {
      emailsSentThisHour++;
      emailsSentToday++;
    }

    res.json(result);

  } catch (error) {
    logger.error('Erro no envio de email único:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no envio de email',
      error: error.message
    });
  }
};

// Controller para obter templates disponíveis
const getTemplates = async (req, res) => {
  try {
    const templatesDir = path.join(__dirname, '..', 'templates');
    const files = await fs.readdir(templatesDir);
    
    const templates = files
      .filter(file => file.endsWith('.html'))
      .map(file => {
        const name = file.replace('.html', '');
        return {
          name: name,
          displayName: name.charAt(0).toUpperCase() + name.slice(1)
        };
      });

    res.json({
      success: true,
      templates: templates
    });

  } catch (error) {
    logger.error('Erro ao obter templates:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar templates'
    });
  }
};

// Controller para preview de template
const previewTemplate = async (req, res) => {
  try {
    const { template, variables = {} } = req.body;

    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Nome do template é obrigatório'
      });
    }

    const htmlTemplate = await loadTemplate(template);
    const processedHtml = replaceTemplateVariables(htmlTemplate, {
      ...variables,
      currentYear: new Date().getFullYear()
    });

    res.json({
      success: true,
      html: processedHtml
    });

  } catch (error) {
    logger.error('Erro no preview do template:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar preview',
      error: error.message
    });
  }
};

// Controller para estatísticas
const getEmailStatistics = (req, res) => {
  resetCounters();

  res.json({
    success: true,
    statistics: {
      emailsSentThisHour,
      emailsSentToday,
      limitsPerHour: rateLimits.maxEmailsPerHour,
      limitsPerDay: rateLimits.maxEmailsPerDay,
      remainingThisHour: Math.max(0, rateLimits.maxEmailsPerHour - emailsSentThisHour),
      remainingToday: Math.max(0, rateLimits.maxEmailsPerDay - emailsSentToday)
    }
  });
};

module.exports = {
  sendBulkEmails,
  sendSingleEmailController,
  getTemplates,
  previewTemplate,
  getEmailStatistics
};