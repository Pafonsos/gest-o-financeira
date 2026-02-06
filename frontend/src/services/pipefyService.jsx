import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const API_BASE_URL =
  (import.meta?.env?.VITE_API_URL) ||
  (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : undefined) ||
  'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const withAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    throw new Error('Usuário não autenticado');
  }
  return {
    Authorization: `Bearer ${token}`
  };
};

const pipefyService = {
  testConnection: async (apiToken) => {
    const headers = await withAuthHeaders();
    const response = await axiosInstance.post('/pipefy/test', { apiToken }, { headers });
    return response.data;
  },

  getPipeFields: async (pipeId, apiToken) => {
    const headers = await withAuthHeaders();
    const response = await axiosInstance.post('/pipefy/pipe-fields', { pipeId, apiToken }, { headers });
    return response.data;
  },

  pushClients: async ({ pipeId, clients, fieldMap, apiToken }) => {
    const headers = await withAuthHeaders();
    const response = await axiosInstance.post(
      '/pipefy/push-clients',
      { pipeId, clients, fieldMap, apiToken },
      { headers }
    );
    return response.data;
  },

  pullCards: async ({ pipeId, limit, apiToken }) => {
    const headers = await withAuthHeaders();
    const response = await axiosInstance.post('/pipefy/pull-cards', { pipeId, limit, apiToken }, { headers });
    return response.data;
  },

  moveCard: async ({ cardId, phaseId, apiToken }) => {
    const headers = await withAuthHeaders();
    const response = await axiosInstance.post('/pipefy/move-card', { cardId, phaseId, apiToken }, { headers });
    return response.data;
  }
};

export default pipefyService;
