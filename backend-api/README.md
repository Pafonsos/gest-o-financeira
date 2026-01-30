# Financial Manager - Backend API

Express.js backend para gerenciamento de emails e integração com o frontend.

## 🚀 Instalação Rápida

```bash
cd backend-api
npm install
npm start
```

Servidor rodando em: http://localhost:5000

## 📝 Variáveis de Ambiente

Crie um arquivo `.env`:

```env
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Email Configuration (Gmail)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app

# Outros
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## 📌 Rotas Disponíveis

### Health Check
```
GET /api/health
```

### Enviar Emails em Massa
```
POST /api/email/send-bulk
Content-Type: application/json

{
  "recipients": [
    {
      "email": "cliente@exemplo.com",
      "nomeResponsavel": "João Silva",
      "nomeEmpresa": "Empresa XYZ",
      "cnpj": "12.345.678/0001-90",
      "valorPendente": "R$ 1.500,00",
      "parcelasAtraso": "2",
      "proximoVencimento": "2024-02-15",
      "linkPagamento": "https://..."
    }
  ],
  "subject": "Notificação de Pagamento",
  "template": "primeira-cobranca"
}
```

## 📂 Templates Disponíveis

- `primeira-cobranca` - Primeira notificação
- `cobranca-7dias` - Cobrança leve (≥7 dias atraso)
- `cobranca-15dias` - Cobrança moderada (≥15 dias atraso)
- `cobranca-30dias` - Cobrança pesada (≥30 dias atraso)
- `solicitacao-contato` - Cliente entrar em contato

## 🔧 Desenvolvimento

```bash
# Rodar com nodemon (auto-restart)
npm run dev

# Testar email
npm run test
```

## 📦 Build para Produção

Não há build necessário. Apenas execute:

```bash
npm install --production
npm start
```

## 🎯 Para Deploy no Render

1. Configure as variáveis de ambiente no painel do Render
2. Configure o `FRONTEND_URL` com a URL do Vercel
3. Use `npm start` como Start Command

---

Veja [GUIA_DEPLOY_SEPARADO.md](../GUIA_DEPLOY_SEPARADO.md) para instruções completas.
