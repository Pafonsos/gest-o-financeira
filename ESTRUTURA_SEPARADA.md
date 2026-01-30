# Financial Manager - Estrutura Separada Frontend + Backend

## ✨ O que foi feito?

Seu projeto foi reorganizado para que o **frontend** e **backend** sejam totalmente independentes, permitindo deploy em plataformas diferentes:

- **Frontend** (React) → Vercel
- **Backend** (Express) → Render

## 📁 Estrutura do Projeto

```
/faculdade
├── /frontend              # React.js - para Vercel ✨
│   ├── /public
│   ├── /src
│   ├── package.json       # Dependências do Frontend
│   ├── .env.local         # Dev (http://localhost:5000)
│   └── .env.production    # Prod (https://render.com)
│
├── /backend-api           # Express.js - para Render ✨
│   ├── /routes
│   ├── /controllers
│   ├── /services
│   ├── /templates
│   ├── /utils
│   ├── package.json       # Dependências do Backend
│   ├── server.js
│   └── .env               # Configurações do Backend
│
├── GUIA_DEPLOY_SEPARADO.md  # 📖 LEIA ISSO PRIMEIRO!
└── ... (outros arquivos)
```

## 🚀 Como Começar?

### 1️⃣ Rodando Localmente (Desenvolvimento)

**Terminal 1 - Backend:**
```bash
cd backend-api
npm install
npm start
# http://localhost:5000/api/health
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
# http://localhost:3000
```

### 2️⃣ Deploy em Produção

Leia o arquivo [GUIA_DEPLOY_SEPARADO.md](GUIA_DEPLOY_SEPARADO.md) com instruções passo a passo para:
- Render (Backend)
- Vercel (Frontend)

## 🔧 Configurações Importantes

### Frontend - `.env.local` (desenvolvimento)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Frontend - `.env.production` (produção)
```env
REACT_APP_API_URL=https://sua-url-do-render.onrender.com/api
```

### Backend - `.env`
```env
PORT=5000
FRONTEND_URL=http://localhost:3000  # ou sua URL do Vercel
```

## ✅ Mudanças Realizadas

- ✅ Backend separado em `/backend-api`
- ✅ Frontend separado em `/frontend` com seu próprio `package.json`
- ✅ CORS configurado para aceitar múltiplas origens
- ✅ Variáveis de ambiente dinâmicas (`REACT_APP_API_URL`)
- ✅ Documentação de deploy pronta
- ✅ Pronto para Vercel + Render

## 📚 Arquivos de Referência

| Arquivo | Descrição |
|---------|-----------|
| `frontend/README.md` | Instruções específicas do Frontend |
| `backend-api/README.md` | Instruções específicas do Backend |
| `GUIA_DEPLOY_SEPARADO.md` | **Guia Completo de Deploy** |

## 🎯 Próximos Passos

1. ✅ Teste localmente (rodando ambos os servidores)
2. 📖 Leia o `GUIA_DEPLOY_SEPARADO.md`
3. 🚀 Crie conta no Render e Vercel
4. 🔑 Configure as variáveis de ambiente
5. 🎉 Faça deploy!

---

**Tudo pronto! Seu projeto está separado e pronto para produção.** 🎊
