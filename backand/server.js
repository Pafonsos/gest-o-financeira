require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const emailRoutes = require('./routes/emailRoutes');
const { logger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/email', emailRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de email funcionando',
    timestamp: new Date().toISOString()
  });
});

app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (error) => {
  console.error('Erro do servidor:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Exceção não capturada:', error);
});