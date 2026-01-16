import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const emailService = {
  sendBulkEmails: async (emailData) => {
    const response = await axios.post(`${API_BASE_URL}/email/send-bulk`, emailData);
    return response.data;
  },
  // ... outras funções
  getStatistics: async () => {
    const response = await axios.get(`${API_BASE_URL}/email/statistics`);
    return response.data;
  }
};

// ESTA LINHA É OBRIGATÓRIA:
export default emailService;