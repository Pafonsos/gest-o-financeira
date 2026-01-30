# 🚀 Guia de Deploy Separado - Frontend + Backend

## ✅ Estrutura do Projeto Separado

```
/faculdade
├── /frontend          # React.js - para Vercel
├── /backend-api       # Express.js - para Render
└── /public            # Arquivos públicos
```

---

## 📦 PASSO 1: Deploy do Backend no Render

### 1.1 Preparar o Backend

1. Acesse a pasta `backend-api` do seu projeto
2. Verifique se o arquivo `.env` está configurado:

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://seu-app.vercel.app
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 1.2 Criar Repositório do Backend (Opcional)

Se quiser um repositório separado, você pode:

```bash
cd backend-api
git init
git add .
git commit -m "Initial commit"
```

### 1.3 Fazer Deploy no Render

1. Acesse [render.com](https://render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Configure as seguintes opções:

| Campo | Valor |
|-------|-------|
| **Name** | `financial-manager-api` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Branch** | `main` |
| **Plan** | `Free` (ou pago se precisar) |

5. Clique em **"Environment"** e adicione as variáveis:

```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://seu-app.vercel.app
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

6. Clique em **"Create Web Service"**

7. Copie a URL gerada (ex: `https://financial-manager-api.onrender.com`)

---

## 🎨 PASSO 2: Deploy do Frontend no Vercel

### 2.1 Preparar o Frontend

1. Acesse a pasta `frontend`
2. Certifique-se de que o `.env.production` está configurado:

```env
REACT_APP_API_URL=https://financial-manager-api.onrender.com/api
REACT_APP_ENV=production
```

### 2.2 Deploy no Vercel

#### Opção A: Usando Dashboard do Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Selecione o repositório GitHub
4. Configure:
   - **Framework**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Clique em **"Environment Variables"** e adicione:

```
REACT_APP_API_URL=https://financial-manager-api.onrender.com/api
REACT_APP_ENV=production
```

6. Clique em **"Deploy"**

#### Opção B: Usando CLI do Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Entrar na pasta do frontend
cd frontend

# Deploy
vercel
```

---

## 🧪 TESTE EM DESENVOLVIMENTO LOCAL

### Testar o Backend

```bash
cd backend-api
npm install
npm start
# Acesso em: http://localhost:5000/api/health
```

### Testar o Frontend

```bash
cd frontend
npm install
npm start
# Acesso em: http://localhost:3000
```

---

## 🔧 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE

### Frontend (`.env.local` para dev, `.env.production` para prod)

```env
# Desenvolvimento
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development

# Produção (Vercel)
REACT_APP_API_URL=https://financial-manager-api.onrender.com/api
REACT_APP_ENV=production
```

### Backend (`.env` no Render)

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://seu-app.vercel.app

# Email (Gmail com App Password)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app

# Banco de Dados / APIs externas
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-publica
```

---

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### Erro: "CORS Error" ou "Cannot POST /api/email/send-bulk"

**Causa**: O frontend não consegue acessar o backend.

**Solução**:
1. Verifique se a URL no `REACT_APP_API_URL` está correta
2. Verifique o `FRONTEND_URL` no backend
3. Reinicie o Render e Vercel

```bash
# No Render, clique em "Manual Deploy"
# No Vercel, faça um novo git push
```

### Erro: "Port already in use"

**Solução**:
```bash
# Matar processo na porta 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Timeout ao enviar emails

**Solução**: Aumente o timeout no frontend:
```javascript
// frontend/services/emailService.js
timeout: 60000  // 60 segundos ao invés de 30
```

---

## 📊 MONITORAR LOGS

### Logs do Backend (Render)

1. Acesse [render.com](https://render.com)
2. Clique no seu serviço
3. Vá em **"Logs"**

### Logs do Frontend (Vercel)

1. Acesse [vercel.com](https://vercel.com)
2. Clique no seu projeto
3. Vá em **"Deployments"** → **"Logs"**

---

## 🔐 SEGURANÇA

### Recomendações

1. **Nunca** commit `.env` com informações sensíveis
2. Use **App Passwords** do Gmail, não sua senha principal
3. Configure **rate limiting** no backend (já configurado em server.js)
4. Use **HTTPS** em produção (Vercel e Render fornecem automaticamente)
5. Mantenha dependências atualizadas: `npm audit` e `npm update`

---

## 🎯 CHECKLIST FINAL

- [ ] Backend rodando em http://localhost:5000
- [ ] Frontend rodando em http://localhost:3000
- [ ] Emails sendo enviados corretamente
- [ ] Variáveis de ambiente configuradas no Render
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] URL do backend está correta no Vercel
- [ ] CORS configurado para aceitar domínio do Vercel
- [ ] Testes em produção funcionando

---

## 📞 SUPORTE

Se tiver problemas:

1. Verifique os logs no Render e Vercel
2. Teste a conexão: `curl https://financial-manager-api.onrender.com/api/health`
3. Verifique o `REACT_APP_API_URL` no navegador (F12 → Console)

---

**Pronto para produção! 🚀**
