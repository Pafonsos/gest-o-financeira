const Joi = require('joi');

// Schema de email simples
const emailSchema = Joi.string().email().required();

// Schema para envio único
const singleEmailSchema = Joi.object({
  to: emailSchema,
  subject: Joi.string().required(),
  template: Joi.string().valid(
    'primeira-cobranca',
    'cobranca-7dias',
    'cobranca-15dias',
    'cobranca-30dias',
    'solicitacao-contato'
  ).required(),
  variables: Joi.object().optional()
});

// ============================================
// SCHEMA PARA ENVIO EM MASSA - CORRIGIDO
// ============================================
const bulkEmailSchema = Joi.object({
  recipients: Joi.array().items(
    Joi.alternatives().try(
      emailSchema,  // String simples
      Joi.object({
        // ========== OBRIGATÓRIOS ==========
        email: emailSchema,
        nomeResponsavel: Joi.string().required(),
        nomeEmpresa: Joi.string().required(),
        valorPendente: Joi.string().required(),
        parcelasAtraso: Joi.string().required(),
        
        // ========== OPCIONAIS SEM VALIDAÇÃO RÍGIDA ==========
        cnpj: Joi.string().allow('', null).optional(),
        proximoVencimento: Joi.string().allow('', null).optional(),
        
        // linkPagamento aceita qualquer string, inclusive '#' e vazias
        linkPagamento: Joi.string().allow('', null).optional()
        // Removemos a validação .uri() para aceitar '#'
      })
    )
  ).min(1).max(100).required(),
  subject: Joi.string().required(),
  template: Joi.string().valid(
    'primeira-cobranca',
    'cobranca-7dias',
    'cobranca-15dias',
    'cobranca-30dias',
    'solicitacao-contato'
  ).required(),
  variables: Joi.object().optional()
});

// Lista de domínios suspeitos
const suspiciousDomains = [
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org'
];

// Validar email simples
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const { error } = emailSchema.validate(email);
  return !error;
};

// Validar se email não é descartável
const isDisposableEmail = (email) => {
  if (!email) return false;
  
  const domain = email.split('@')[1];
  if (!domain) return false;
  
  return suspiciousDomains.some(suspiciousDomain => 
    domain.toLowerCase().includes(suspiciousDomain.toLowerCase())
  );
};

// Validar dados para envio único
const validateSingleEmailData = (data) => {
  const { error, value } = singleEmailSchema.validate(data);
  
  if (error) {
    return {
      isValid: false,
      error: error.details[0].message,
      field: error.details[0].path[0]
    };
  }

  if (isDisposableEmail(value.to)) {
    return {
      isValid: false,
      error: 'Email temporário ou descartável não permitido',
      field: 'to'
    };
  }

  return {
    isValid: true,
    value: value
  };
};

// Validar dados para envio em massa
const validateBulkEmailData = (data) => {
  console.log('\n🔍 VALIDANDO DADOS DE EMAIL EM MASSA');
  console.log('Recipients recebidos:', data.recipients?.length || 0);
  
  const { error, value } = bulkEmailSchema.validate(data, {
    abortEarly: false,
    stripUnknown: false
  });
  
  if (error) {
    console.error('❌ ERRO DE VALIDAÇÃO:');
    error.details.forEach((detail, index) => {
      console.error(`  ${index + 1}. ${detail.message}`);
      console.error(`     Path: ${detail.path.join('.')}`);
      console.error(`     Type: ${detail.type}`);
    });
    
    return {
      isValid: false,
      error: error.details[0].message,
      field: error.details[0].path.join('.'),
      allErrors: error.details.map(d => d.message)
    };
  }

  // Verificar emails descartáveis
  const disposableEmails = [];
  value.recipients.forEach((recipient, index) => {
    const email = typeof recipient === 'string' ? recipient : recipient.email;
    if (isDisposableEmail(email)) {
      disposableEmails.push(`Posição ${index + 1}: ${email}`);
    }
  });

  if (disposableEmails.length > 0) {
    console.warn('⚠️ Emails descartáveis encontrados:', disposableEmails);
    return {
      isValid: false,
      error: `Emails temporários encontrados: ${disposableEmails.join(', ')}`,
      field: 'recipients'
    };
  }

  // Remover duplicatas
  const uniqueRecipients = [];
  const emailSet = new Set();
  
  value.recipients.forEach(recipient => {
    const email = typeof recipient === 'string' ? recipient : recipient.email;
    const emailLower = email.toLowerCase();
    
    if (!emailSet.has(emailLower)) {
      emailSet.add(emailLower);
      uniqueRecipients.push(recipient);
    }
  });

  const duplicatesRemoved = value.recipients.length - uniqueRecipients.length;
  
  if (duplicatesRemoved > 0) {
    console.log(`📋 ${duplicatesRemoved} email(s) duplicado(s) removido(s)`);
  }

  console.log('✅ Validação concluída com sucesso');
  console.log(`   Total: ${uniqueRecipients.length} recipients`);

  return {
    isValid: true,
    value: {
      ...value,
      recipients: uniqueRecipients
    },
    duplicatesRemoved
  };
};

// Validar template de preview
const validatePreviewData = (data) => {
  const schema = Joi.object({
    template: Joi.string().valid(
      'cobranca-7dias',
      'primeira-cobranca',
      'cobranca-15dias',
      'cobranca-30dias',
      'solicitacao-contato'
    ).required(),
    variables: Joi.object().optional()
  });

  const { error, value } = schema.validate(data);
  
  if (error) {
    return {
      isValid: false,
      error: error.details[0].message,
      field: error.details[0].path[0]
    };
  }

  return {
    isValid: true,
    value: value
  };
};

// Sanitizar dados de entrada
const sanitizeEmailData = (data) => {
  if (typeof data !== 'object' || data === null) return data;

  const sanitized = {};
  
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      sanitized[key] = data[key]
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .trim();
    } else if (Array.isArray(data[key])) {
      sanitized[key] = data[key].map(item => sanitizeEmailData(item));
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      sanitized[key] = sanitizeEmailData(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  });

  return sanitized;
};

module.exports = {
  validateEmail,
  isDisposableEmail,
  validateSingleEmailData,
  validateBulkEmailData,
  validatePreviewData,
  sanitizeEmailData
};