#!/bin/bash

# Script para iniciar tanto o Frontend quanto o Backend
# Linux / macOS

echo ""
echo "============================================"
echo "Financial Manager - Dev Environment"
echo "============================================"
echo ""

# Verificar se Node está instalado
if ! command -v node &> /dev/null
then
    echo "❌ Node.js não está instalado!"
    echo "Instale em: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js encontrado"
echo ""

# Iniciar Backend
echo "🚀 Iniciando Backend (Render em 5000)..."
cd backend-api
npm install
npm start &
BACKEND_PID=$!

# Aguardar um pouco
sleep 3

# Iniciar Frontend
echo "🎨 Iniciando Frontend (Vercel em 3000)..."
cd ../frontend
npm install
npm start &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "✅ Ambos os servidores estão iniciando!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000/api/health"
echo ""
echo "Para parar: Ctrl+C ou execute:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "============================================"
echo ""

# Aguardar os processos
wait $BACKEND_PID $FRONTEND_PID
