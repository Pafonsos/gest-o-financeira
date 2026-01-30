# ✅ Checklist - Deploy Separado Frontend + Backend

## 🏠 Local (Desenvolvimento)

### Backend
- [ ] Navegar até `cd backend-api`
- [ ] Executar `npm install`
- [ ] Verificar arquivo `.env` com configurações corretas
- [ ] Executar `npm start`
- [ ] Testar: `http://localhost:5000/api/health` (deve retornar JSON)

### Frontend
- [ ] Navegar até `cd frontend`
- [ ] Executar `npm install`
- [ ] Verificar arquivo `.env.local`:
  ```env
  REACT_APP_API_URL=http://localhost:5000/api
  ```
- [ ] Executar `npm start`
- [ ] Testar: `http://localhost:3000` (deve abrir a aplicação)

### Integração
- [ ] Testar envio de emails (deve conectar ao backend em localhost:5000)
- [ ] Abrir DevTools (F12) e verificar se há erros de CORS
- [ ] Verificar se os logs do backend mostram requisições

---

## 🚀 Produção (Render + Vercel)

### Backend - Render

1. **Preparação**
   - [ ] Criar conta em [render.com](https://render.com)
   - [ ] Conectar repositório GitHub
   - [ ] Selecionar pasta `backend-api`

2. **Configuração no Render**
   - [ ] Nome do serviço: `financial-manager-api`
   - [ ] Ambiente: `Node`
   - [ ] Build Command: `npm install`
   - [ ] Start Command: `npm start`
   - [ ] Environment Variables:
     ```
     PORT=5000
     NODE_ENV=production
     FRONTEND_URL=https://seu-app.vercel.app
     EMAIL_USER=seu-email@gmail.com
     EMAIL_PASSWORD=sua-senha-de-app
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     ```

3. **Após Deploy**
   - [ ] Copiar URL do Render (ex: `https://financial-manager-api.onrender.com`)
   - [ ] Testar health check: `https://financial-manager-api.onrender.com/api/health`

### Frontend - Vercel

1. **Preparação**
   - [ ] Criar conta em [vercel.com](https://vercel.com)
   - [ ] Conectar repositório GitHub
   - [ ] Selecionar pasta `frontend`

2. **Configuração no Vercel**
   - [ ] Framework: `React`
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `build`
   - [ ] Root Directory: `frontend`
   - [ ] Environment Variable:
     ```
     REACT_APP_API_URL=https://financial-manager-api.onrender.com/api
     REACT_APP_ENV=production
     ```

3. **Após Deploy**
   - [ ] Copiar URL do Vercel (ex: `https://seu-app.vercel.app`)
   - [ ] Testar aplicação funcionando
   - [ ] Testar envio de emails

---

## 🔧 Configurações Críticas

### CORS (Backend)
```javascript
// backend-api/server.js
// ✅ Aceita http://localhost:3000 (dev)
// ✅ Aceita https://seu-app.vercel.app (prod)
// ✅ Baseado em variável FRONTEND_URL
```

### API URL (Frontend)
```javascript
// frontend/services/emailService.js
// ✅ Lê de process.env.REACT_APP_API_URL
// ✅ Default: http://localhost:5000/api
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| **CORS Error** | Verificar `FRONTEND_URL` no backend e `REACT_APP_API_URL` no frontend |
| **API não responde** | Reiniciar container no Render (Manual Deploy) |
| **Porta já em uso** | `netstat -ano \| findstr :5000` + `taskkill /PID <PID> /F` |
| **Email não envia** | Verificar `EMAIL_USER` e `EMAIL_PASSWORD` no `.env` |
| **Build falha** | `npm install` está rodando? Dependências corretas? |

---

## 📞 Links Úteis

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

---

**Boa sorte com o deploy! 🎉**
