const pipefyService = require('../services/pipefyService');
const { logger } = require('../utils/logger');

const getPipeIdFromRequest = (req) => {
  return req.body?.pipeId || process.env.PIPEFY_PIPE_ID;
};

const getTokenFromRequest = (req) => {
  return req.body?.apiToken;
};

const testConnection = async (req, res) => {
  try {
    const apiToken = getTokenFromRequest(req);
    const data = await pipefyService.testConnection(apiToken);
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Erro ao testar conexão Pipefy:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao testar conexão Pipefy',
      message: error.message
    });
  }
};

const getPipeFields = async (req, res) => {
  try {
    const pipeId = getPipeIdFromRequest(req);
    if (!pipeId) {
      return res.status(400).json({
        success: false,
        error: 'pipeId obrigatório',
        message: 'Informe o pipeId ou configure PIPEFY_PIPE_ID no backend'
      });
    }

    const apiToken = getTokenFromRequest(req);
    const data = await pipefyService.getPipeFields(pipeId, apiToken);
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Erro ao buscar campos do Pipefy:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar campos do Pipefy',
      message: error.message
    });
  }
};

const pushClients = async (req, res) => {
  try {
    const pipeId = getPipeIdFromRequest(req);
    const clients = req.body?.clients || [];
    const fieldMap = req.body?.fieldMap || {};
    const titleField = req.body?.titleField || 'nomeFantasia';
    const apiToken = getTokenFromRequest(req);

    if (!pipeId) {
      return res.status(400).json({
        success: false,
        error: 'pipeId obrigatório',
        message: 'Informe o pipeId ou configure PIPEFY_PIPE_ID no backend'
      });
    }

    if (!Array.isArray(clients) || clients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum cliente informado',
        message: 'Envie uma lista de clientes para sincronizar'
      });
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const client of clients) {
      const title =
        client?.[titleField] ||
        client?.nomeFantasia ||
        client?.nomeEmpresa ||
        client?.nomeResponsavel ||
        client?.email ||
        'Cliente';

      const fieldsAttributes = Object.entries(fieldMap)
        .map(([localKey, fieldId]) => {
          if (!fieldId) return null;
          const value = client?.[localKey];
          if (value === undefined || value === null || value === '') return null;
          return {
            field_id: fieldId,
            field_value: typeof value === 'string' ? value : String(value)
          };
        })
        .filter(Boolean);

      try {
        const data = await pipefyService.createCard(pipeId, title, fieldsAttributes, apiToken);
        results.push({
          success: true,
          client: client?.email || client?.nomeEmpresa || title,
          cardId: data?.createCard?.card?.id || null
        });
        successCount += 1;
      } catch (error) {
        results.push({
          success: false,
          client: client?.email || client?.nomeEmpresa || title,
          error: error.message
        });
        failureCount += 1;
      }
    }

    res.json({
      success: failureCount === 0,
      total: clients.length,
      successCount,
      failureCount,
      results
    });
  } catch (error) {
    logger.error('Erro ao enviar clientes para Pipefy:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar clientes para Pipefy',
      message: error.message
    });
  }
};

const pullCards = async (req, res) => {
  try {
    const pipeId = getPipeIdFromRequest(req);
    const limit = req.body?.limit || 50;
    const apiToken = getTokenFromRequest(req);

    if (!pipeId) {
      return res.status(400).json({
        success: false,
        error: 'pipeId obrigatório',
        message: 'Informe o pipeId ou configure PIPEFY_PIPE_ID no backend'
      });
    }

    const data = await pipefyService.listCards(pipeId, limit, apiToken);
    const cards = data?.cards?.edges?.map(edge => edge.node) || [];

    res.json({
      success: true,
      count: cards.length,
      cards
    });
  } catch (error) {
    logger.error('Erro ao puxar cards do Pipefy:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao puxar cards do Pipefy',
      message: error.message
    });
  }
};

const moveCard = async (req, res) => {
  try {
    const { cardId, phaseId } = req.body || {};
    const apiToken = getTokenFromRequest(req);

    if (!cardId || !phaseId) {
      return res.status(400).json({
        success: false,
        error: 'cardId e phaseId são obrigatórios'
      });
    }

    const data = await pipefyService.moveCardPhase(cardId, phaseId, apiToken);
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Erro ao mover card no Pipefy:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao mover card no Pipefy',
      message: error.message
    });
  }
};

module.exports = {
  testConnection,
  getPipeFields,
  pushClients,
  pullCards,
  moveCard
};
