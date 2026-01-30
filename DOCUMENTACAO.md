# 📚 Índice de Documentação - Projeto Separado

## 🎯 Comece por aqui!

### 👉 **[ESTRUTURA_SEPARADA.md](ESTRUTURA_SEPARADA.md)** ← **LEIA PRIMEIRO**
Visão geral da nova estrutura do projeto.

---

## 📖 Guias de Uso

### 🚀 [GUIA_DEPLOY_SEPARADO.md](GUIA_DEPLOY_SEPARADO.md)
**Guia completo para fazer deploy:**
- Como preparar o backend para Render
- Como preparar o frontend para Vercel
- Variáveis de ambiente
- Troubleshooting de erros comuns

### ✅ [CHECKLIST_DEPLOYMENT.md](CHECKLIST_DEPLOYMENT.md)
**Checklist rápido passo a passo:**
- Desenvolvimento local
- Produção (Render + Vercel)
- Configurações críticas
- Troubleshooting rápido

### 🔒 [GUIA_SEGURANCA.md](GUIA_SEGURANCA.md)
**Tudo sobre segurança:**
- Como configurar credenciais do Gmail
- CORS seguro
- Rate limiting
- Boas práticas

---

## 📂 Documentação por Pasta

### Frontend (React)
- 📍 Localização: `/frontend`
- 📄 Arquivo: `[frontend/README.md](frontend/README.md)`
- 🎨 Framework: React.js
- 🏠 URL local: `http://localhost:3000`
- 🌐 Deploy: Vercel

### Backend (Express)
- 📍 Localização: `/backend-api`
- 📄 Arquivo: `[backend-api/README.md](backend-api/README.md)`
- 🔧 Framework: Express.js
- 🏠 URL local: `http://localhost:5000`
- 🌐 Deploy: Render

---

## 🚀 Início Rápido (5 minutos)

### Local Development

**Terminal 1 - Backend:**
```bash
cd backend-api
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

### Ou use o script automatizado:

**Windows:**
```bash
.\start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

---

## 🎯 Fluxo de Desenvolvimento

```
1. Fazer mudanças no código
   ↓
2. Backend responde às requisições (localhost:5000)
   ↓
3. Frontend consome a API (localhost:3000)
   ↓
4. Fazer git commit e push
   ↓
5. Vercel e Render fazem deploy automático
   ↓
6. Site ao vivo em produção! 🎉
```

---

## 🔑 Configurações Essenciais

### Frontend
```env
# .env.local (desenvolvimento)
REACT_APP_API_URL=http://localhost:5000/api

# .env.production (produção)
REACT_APP_API_URL=https://financial-manager-api.onrender.com/api
```

### Backend
```env
# .env
PORT=5000
FRONTEND_URL=http://localhost:3000  # ou https://seu-app.vercel.app

# Email
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=senha-de-app (16 caracteres)
```

---

## 🔗 Links Importantes

### Plataformas
- [Render](https://render.com) - Backend
- [Vercel](https://vercel.com) - Frontend
- [Gmail](https://myaccount.google.com) - Credenciais

### Documentação
- [Express.js Docs](https://expressjs.com)
- [React Docs](https://react.dev)
- [Node.js Docs](https://nodejs.org/docs)

### Ferramentas
- [Postman](https://www.postman.com) - Testar APIs
- [GitHub Desktop](https://desktop.github.com) - Gerenciar Git
- [VS Code](https://code.visualstudio.com) - Editor

---

## ❓ FAQ Rápido

### P: Posso usar o mesmo repositório para ambos?
R: Sim! O Render e Vercel podem ler da mesma repo se configurar o Root Directory corretamente.

### P: Como atualizar a URL do backend no Vercel?
R: Environment Variables → `REACT_APP_API_URL` → Alterar → Redeploy.

### P: O CORS está dando erro, o que faço?
R: Verificar `FRONTEND_URL` no backend e `REACT_APP_API_URL` no frontend.

### P: Quanto custa? 💰
R: Render (Free com limitações) + Vercel (Free com limitações).

### P: Como debugar erros?
R: 
- Backend: Ver logs no painel Render
- Frontend: F12 (DevTools) no navegador

---

## 📞 Estrutura de Pastas Completa

```
faculdade/
├── frontend/                          # React.js - Deploy no Vercel
│   ├── src/
│   ├── public/
│   ├── package.json                   # Dependências apenas do frontend
│   ├── .env.local                     # Dev
│   ├── .env.production                # Prod
│   ├── vercel.json                    # Config do Vercel
│   └── README.md
│
├── backend-api/                       # Express.js - Deploy no Render
│   ├── routes/
│   ├── services/
│   ├── templates/
│   ├── package.json                   # Dependências apenas do backend
│   ├── server.js
│   ├── .env                           # Configurações sensíveis
│   └── README.md
│
├── ESTRUTURA_SEPARADA.md              # Visão geral (LEIA PRIMEIRO!)
├── GUIA_DEPLOY_SEPARADO.md            # Como fazer deploy
├── CHECKLIST_DEPLOYMENT.md            # Checklist passo a passo
├── GUIA_SEGURANCA.md                  # Segurança e credenciais
├── DOCUMENTACAO.md                    # Este arquivo
├── start-dev.bat                      # Script para Windows
├── start-dev.sh                       # Script para Linux/Mac
└── ... (outros arquivos)
```

---

## ✨ O Que Mudou?

### Antes
```
/faculdade
├── /src (React)
├── /backend (Express)
├── package.json (Frontend + Backend)
└── Tudo misturado
```

### Depois ✅
```
/faculdade
├── /frontend (React)
├── /backend-api (Express)
├── Cada um com seu package.json
└── Deploy em plataformas diferentes
```

---

## 🎯 Próximas Ações

- [ ] Leia [ESTRUTURA_SEPARADA.md](ESTRUTURA_SEPARADA.md)
- [ ] Teste localmente com `start-dev.bat` ou `start-dev.sh`
- [ ] Leia [GUIA_DEPLOY_SEPARADO.md](GUIA_DEPLOY_SEPARADO.md)
- [ ] Crie contas em Render e Vercel
- [ ] Faça o primeiro deploy
- [ ] Comemore! 🎉

---

**Parabéns! Seu projeto está pronto para produção!** 🚀
