const Joi = require('joi');

// Schema de validação para email
const emailSchema = Joi.string()
  .email({ 
    minDomainSegments: 2,
    tlds: { allow: ['com', 'net', 'org', 'br', 'gov', 'edu', 'mil'] }
  })
  .required();

// Schema de validação para envio único
const singleEmailSchema = Joi.object({
  to: emailSchema,
  subject: Joi.string().min(1).max(200).required(),
  template: Joi.string().valid('cobranca-7dias', 'primeira-cobranca', 'cobranca-15dias', 'cobranca-30dias', 'solicitacao-contato').required(),
  variables: Joi.object().optional()
});

/// Schema de validação para envio em massa
const bulkEmailSchema = Joi.object({
  recipients: Joi.array().items(
    Joi.alternatives().try(
      emailSchema, // string de email simples
      Joi.object({
        email: emailSchema,
        nomeResponsavel: Joi.string().optional(),
        nomeEmpresa: Joi.string().optional(),
        cnpj: Joi.string().optional(), // ← ADICIONAR
        valorPendente: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        parcelasAtraso: Joi.string().optional(), // ← ADICIONAR
        proximoVencimento: Joi.string().optional(),
        dataVencimento: Joi.string().optional(), // ← ADICIONAR
        linkPagamento: Joi.string().allow('', '#', null).optional()
      })
    )
  ).min(1).max(50).required(), // máximo 50 emails por vez
  subject: Joi.string().min(1).max(200).required(),
  template: Joi.string().valid('cobranca-7dias', 'primeira-cobranca', 'cobranca-15dias', 'cobranca-30dias', 'solicitacao-contato').required(),
  variables: Joi.object().optional()
});

// Lista de domínios comuns suspeitos/descartáveis
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

  // Verificar se é email descartável
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
  const { error, value } = bulkEmailSchema.validate(data);
  
  if (error) {
    return {
      isValid: false,
      error: error.details[0].message,
      field: error.details[0].path.join('.')
    };
  }

  // Verificar emails descartáveis na lista
  const disposableEmails = [];
  value.recipients.forEach((recipient, index) => {
    const email = typeof recipient === 'string' ? recipient : recipient.email;
    if (isDisposableEmail(email)) {
      disposableEmails.push(`Posição ${index + 1}: ${email}`);
    }
  });

  if (disposableEmails.length > 0) {
    return {
      isValid: false,
      error: `Emails temporários encontrados: ${disposableEmails.join(', ')}`,
      field: 'recipients'
    };
  }

  // Remover emails duplicados
  const uniqueRecipients = [];
  const emailSet = new Set();
  
  value.recipients.forEach(recipient => {
    const email = typeof recipient === 'string' ? recipient : recipient.email;
    if (!emailSet.has(email.toLowerCase())) {
      emailSet.add(email.toLowerCase());
      uniqueRecipients.push(recipient);
    }
  });

  return {
    isValid: true,
    value: {
      ...value,
      recipients: uniqueRecipients
    },
    duplicatesRemoved: value.recipients.length - uniqueRecipients.length
  };
};

// Validar template de preview
const validatePreviewData = (data) => {
  const schema = Joi.object({
    template: Joi.string().valid('cobranca-7dias', 'primeira-cobranca', 'cobranca-15dias', 'cobranca-30dias', 'solicitacao-contato').required(),
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
  if (typeof data !== 'object') return data;

  const sanitized = {};
  
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      // Remover caracteres perigosos e espaços extras
      sanitized[key] = data[key]
        .replace(/[<>]/g, '') // Remove < e >
        .replace(/javascript:/gi, '') // Remove javascript:
        .trim();
    } else if (Array.isArray(data[key])) {
      sanitized[key] = data[key].map(item => sanitizeEmailData(item));
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