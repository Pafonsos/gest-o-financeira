require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');

const emailRoutes = require('./routes/emailRoutes');
const { logger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// CONFIGURAÇÃO DO CORS - DINÂMICA
// ============================================

// Permitir múltiplas origens conforme ambiente
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL || 'http://localhost:3000'
].filter(url => url); // Remove duplicatas

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// Helmet simplificado
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));

// Body parser com limites MUITO MAIORES
app.use(express.json({ 
  limit: '100mb',
  parameterLimit: 1000000
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '100mb',
  parameterLimit: 1000000
}));

// ============================================
// ROTAS
// ============================================

app.use('/api/email', emailRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// TRATAMENTO DE ERROS
// ============================================

app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  
  if (error.type === 'entity.too.large' || error.status === 413) {
    return res.status(413).json({ 
      success: false,
      error: 'Payload muito grande',
      message: 'Reduza a quantidade de dados enviados'
    });
  }
  
  res.status(500).json({ 
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Erro no servidor'
  });
});

// ============================================
// CRIAR SERVIDOR HTTP COM CONFIGURAÇÕES CUSTOMIZADAS
// ============================================

const server = http.createServer(app);

// CONFIGURAÇÕES CRÍTICAS PARA RESOLVER 431
server.maxHeadersCount = 0;
server.headersTimeout = 0;
server.requestTimeout = 0;
server.timeout = 0;

// Iniciar servidor
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ SERVIDOR INICIADO COM SUCESSO');
  console.log('='.repeat(60));
  console.log(`🌐 Porta: ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend aceito: http://localhost:3000`); // ← MUDOU AQUI!
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('\n💡 Configurações aplicadas:');
  console.log('   ✓ CORS: http://localhost:3000');
  console.log('   ✓ Headers: SEM LIMITE');
  console.log('   ✓ Payload: 100MB');
  console.log('   ✓ Timeout: DESATIVADO\n');
});

server.on('error', (error) => {
  console.error('\n❌ ERRO DO SERVIDOR:', error);
  
  if (error.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Porta ${PORT} já está em uso!`);
    console.error('💡 Soluções:');
    console.error('   1. Mude a porta no .env');
    console.error('   2. Ou feche o processo usando a porta\n');
    process.exit(1);
  }
});

// Tratamento graceful de erros
process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
  logger.error('Unhandled Rejection:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⏹️  SIGTERM recebido. Encerrando...');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso\n');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⏹️  SIGINT recebido. Encerrando...');
  server.close(() => {
    console.log('✅ Servidor encerrado\n');
    process.exit(0);
  });
});