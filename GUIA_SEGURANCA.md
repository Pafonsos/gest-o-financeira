# 🔒 Guia de Segurança - Frontend + Backend Separado

## ⚠️ Checklist de Segurança

### Backend (Render)

- [ ] **Senha do Email**: Use **App Password** do Gmail, não sua senha principal
  ```
  ❌ ERRADO: EMAIL_PASSWORD=minhaSenha123
  ✅ CORRETO: EMAIL_PASSWORD=abcd efgh ijkl mnop  (16 caracteres do Gmail)
  ```

- [ ] **JWT Secret**: Use uma chave aleatória e forte
  ```bash
  # Gerar no terminal:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] **Rate Limiting**: Já configurado em `server.js` ✅
  - Limite: 100 requisições por 15 minutos

- [ ] **CORS**: Apenas origens autorizadas
  ```javascript
  // Aceita apenas seu domínio do Vercel
  origin: 'https://seu-app.vercel.app'
  ```

- [ ] **Helmet.js**: Já ativado para headers de segurança ✅

- [ ] **Variáveis sensíveis**: Nunca comitar `.env` no Git
  ```bash
  # Adicionar ao .gitignore (já feito)
  .env
  .env.local
  .env.*.local
  ```

### Frontend (Vercel)

- [ ] **Nunca armazenar senhas** no código ou localStorage
  - ❌ Não salve: `localStorage.setItem('password', password)`
  - ✅ Use: JWT tokens com segurança

- [ ] **API URL**: Usar variável de ambiente, não hardcoded
  ```javascript
  // ❌ ERRADO
  const API = 'https://api.exemplo.com'
  
  // ✅ CORRETO
  const API = process.env.REACT_APP_API_URL
  ```

- [ ] **Validação de entrada**: Validar dados antes de enviar
  ```javascript
  if (!email || !email.includes('@')) {
    alert('Email inválido');
    return;
  }
  ```

- [ ] **HTTPS**: Vercel fornece automaticamente ✅

---

## 🔐 Credenciais do Gmail (Correto)

### Passo 1: Ativar 2FA
1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Clique em "Security" (Segurança)
3. Ative "2-Step Verification"

### Passo 2: Criar App Password
1. Volte para "Security"
2. Procure por "App passwords" (apenas com 2FA ativo)
3. Selecione: App = Mail, Device = Windows/Android/etc
4. Google gera 16 caracteres
5. Use esse código como `EMAIL_PASSWORD` no `.env`

**Exemplo:**
```env
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

---

## 🛡️ CORS Configuração Segura

### Desenvolvimento (localhost)
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Produção (Vercel + Render)
```javascript
const allowedOrigins = [
  'https://seu-app.vercel.app',
  'https://seu-app-staging.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## 📋 .gitignore Completo

Certifique-se que esses arquivos NÃO estão no Git:

```plaintext
# Ambiente
.env
.env.local
.env.*.local
.env.production.local
.env.development.local

# Dependências
node_modules/
npm-debug.log*
yarn-debug.log*

# Build
/build
/dist
/.cache

# IDE
.vscode/
.idea/
*.swp
*.swo

# Sistema
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Misc
.eslintcache
.stylelintcache
```

---

## 🚨 Como Identificar Vazamento de Credenciais

### 1️⃣ Check de Histórico Git
```bash
# Ver se .env está no histórico
git log --all --full-history -- backend-api/.env

# Se estiver, fazer limpeza:
git filter-branch --tree-filter 'rm -f backend-api/.env' HEAD
```

### 2️⃣ Monitorar Alertas
- GitHub: Settings → Security → Secret scanning
- Render: Logs → verificar erros de autenticação

### 3️⃣ Se houver Vazamento
- ⚠️ **Alterar senha do Gmail imediatamente**
- ⚠️ **Recriar App Password**
- ⚠️ **Atualizar variável em Render**

---

## 🔑 Melhorias Futuras de Segurança

### OAuth 2.0
```javascript
// Ao invés de armazenar senhas, use OAuth
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);
```

### Rate Limiting Avançado
```javascript
// Limitar por IP, não só globalmente
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.ip,
  skip: (req) => req.user && req.user.admin
});
```

### Request Signing
```javascript
// Assinar requisições com HMAC
const crypto = require('crypto');

const signature = crypto
  .createHmac('sha256', JWT_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
```

---

## 📞 Verificação de Segurança Semanal

- [ ] Verificar logs do Render (erros de autenticação?)
- [ ] Executar `npm audit` e atualizar dependências
- [ ] Revisar variables de ambiente (não estão expostas?)
- [ ] Testar rate limiting (está ativo?)
- [ ] Verificar CORS (apenas domínios autorizados?)

---

## 🎯 Resumo Rápido

| Item | Status | Como |
|------|--------|------|
| Senha Email | ⚠️ Crítico | Use Gmail App Password |
| JWT Secret | ⚠️ Crítico | Gerar com `crypto.randomBytes` |
| CORS | ✅ Configurado | Apenas seu domínio Vercel |
| Rate Limit | ✅ Ativo | 100 req/15min |
| HTTPS | ✅ Automático | Vercel + Render |
| .env no Git | ✅ Ignorado | Arquivo `.gitignore` |

---

**Segurança é responsabilidade de todos! 🔒**
