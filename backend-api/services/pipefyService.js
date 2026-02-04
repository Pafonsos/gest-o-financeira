const https = require('https');
const { logger } = require('../utils/logger');

const PIPEFY_API_HOST = 'api.pipefy.com';
const PIPEFY_API_PATH = '/graphql';

const request = (query, variables = {}, apiToken) => {
  return new Promise((resolve, reject) => {
    const token = apiToken || process.env.PIPEFY_API_TOKEN;
    if (!token) {
      return reject(new Error('PIPEFY_API_TOKEN não configurado no backend'));
    }

    const payload = JSON.stringify({ query, variables });

    const req = https.request(
      {
        hostname: PIPEFY_API_HOST,
        path: PIPEFY_API_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.errors && json.errors.length > 0) {
              const message = json.errors.map(e => e.message).join(' | ');
              return reject(new Error(message));
            }
            return resolve(json.data);
          } catch (error) {
            return reject(error);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

const pipefyService = {
  async testConnection(apiToken) {
    const query = `
      query {
        me {
          id
          name
          email
        }
      }
    `;
    return request(query, {}, apiToken);
  },

  async getPipeFields(pipeId, apiToken) {
    const query = `
      query($pipeId: ID!) {
        pipe(id: $pipeId) {
          id
          name
          start_form_fields {
            id
            label
          }
          phases {
            id
            name
          }
        }
      }
    `;
    return request(query, { pipeId }, apiToken);
  },

  async createCard(pipeId, title, fieldsAttributes = [], apiToken) {
    const mutation = `
      mutation($pipeId: ID!, $title: String!, $fields: [FieldValueInput]) {
        createCard(input: {
          pipe_id: $pipeId,
          title: $title,
          fields_attributes: $fields
        }) {
          card {
            id
            title
          }
        }
      }
    `;
    return request(mutation, { pipeId, title, fields: fieldsAttributes }, apiToken);
  },

  async listCards(pipeId, limit = 50, apiToken) {
    const query = `
      query($pipeId: ID!, $limit: Int) {
        cards(pipe_id: $pipeId, first: $limit) {
          edges {
            node {
              id
              title
              current_phase {
                id
                name
              }
              fields {
                name
                value
                field {
                  id
                  label
                }
              }
            }
          }
        }
      }
    `;
    return request(query, { pipeId, limit }, apiToken);
  }
  ,
  async moveCardPhase(cardId, phaseId, apiToken) {
    const mutation = `
      mutation($cardId: ID!, $phaseId: ID!) {
        moveCardToPhase(input: { card_id: $cardId, destination_phase_id: $phaseId }) {
          card {
            id
          }
        }
      }
    `;
    return request(mutation, { cardId, phaseId }, apiToken);
  }
};

module.exports = pipefyService;
