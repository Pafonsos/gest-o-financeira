@echo off
REM Script para iniciar tanto o Frontend quanto o Backend
REM Windows (PowerShell)

echo.
echo ============================================
echo Financial Manager - Dev Environment
echo ============================================
echo.

REM Verificar se Node está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não está instalado!
    echo Instale em: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

REM Iniciar Backend em uma nova janela
echo 🚀 Iniciando Backend (Render em 5000)...
cd backend-api
start cmd /k "npm install && npm run dev"

REM Aguardar um pouco
timeout /t 3 /nobreak

REM Iniciar Frontend em uma nova janela
echo 🎨 Iniciando Frontend (Vercel em 5173)...
cd ..\frontend
start cmd /k "npm install && npm run dev"

echo.
echo ============================================
echo ✅ Ambos os servidores estão iniciando!
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000/api/health
echo ============================================
echo.
