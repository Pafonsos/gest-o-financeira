# Financial Manager - Frontend

React.js application para gerenciamento de finanças e envio de emails.

## 🚀 Instalação Rápida

```bash
cd frontend
npm install
npm start
```

Acesso em: http://localhost:3000

## 📝 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 📦 Build para Produção

```bash
npm run build
```

## 🎯 Para Deploy no Vercel

1. Conecte seu repositório GitHub no Vercel
2. Configure o "Root Directory" como `frontend`
3. Adicione a variável de ambiente `REACT_APP_API_URL` apontando para o backend hospedado

---

Veja [GUIA_DEPLOY_SEPARADO.md](../GUIA_DEPLOY_SEPARADO.md) para instruções completas.
