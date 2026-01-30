# 🎯 INÍCIO RÁPIDO - 5 Minutos

## Está com pressa? Siga este guia!

---

## ✅ Passo 1: Rodar Localmente (2 minutos)

### Windows - Clique duplo em:
```
start-dev.bat
```

### Linux/Mac - Digite:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Resultado esperado:**
```
✅ Backend rodando em: http://localhost:5000
✅ Frontend rodando em: http://localhost:3000
```

---

## ✅ Passo 2: Testar (1 minuto)

1. Abra: http://localhost:3000
2. Deveria carregar a aplicação
3. Tente enviar um email
4. Se funcionar, próximo passo!

---

## ✅ Passo 3: Entender a Estrutura (1 minuto)

```
Antes:                          Depois:
/src (React)                   /frontend (React)
/backend (Express)       →      /backend-api (Express)
1 package.json                 2 package.json
Tudo junto                     Separado!
```

---

## ✅ Passo 4: Deploy no Vercel (Frontend)

### Conta e Projeto
1. Vá para: https://vercel.com
2. Login com GitHub
3. Clique: "New Project"
4. Selecione seu repositório
5. **IMPORTANTE**: Selecione `/frontend` como Root Directory

### Variáveis de Ambiente
1. Clique: "Environment Variables"
2. Adicione:
   ```
   REACT_APP_API_URL=https://financial-manager-api.onrender.com/api
   ```
3. Clique: "Deploy"

**Pronto! O frontend está online!** 🎉

---

## ✅ Passo 5: Deploy no Render (Backend)

### Conta e Projeto
1. Vá para: https://render.com
2. Login com GitHub
3. Clique: "New +" → "Web Service"
4. Selecione seu repositório
5. **IMPORTANTE**: Selecione `/backend-api`

### Configuração
| Campo | Valor |
|-------|-------|
| Name | `financial-manager-api` |
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |

### Variáveis de Ambiente
Clique: "Environment" e adicione:
```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://SEU-VERCEL-APP.vercel.app
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=ABCD EFGH IJKL MNOP (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

Clique: "Create Web Service"

**Pronto! O backend está online!** 🚀

---

## ⚠️ LEMBRE-SE:

### Após Deploy
1. Copie a URL do Render (ex: `https://financial-manager-api.onrender.com`)
2. Volta ao Vercel
3. Edite: `REACT_APP_API_URL=https://financial-manager-api.onrender.com/api`
4. Redeploy (botão "Redeploy")

---

## 🧪 Teste em Produção

1. Abra seu site do Vercel
2. Tente enviar um email
3. Se funcionar = ✅ Sucesso!

---

## 📚 Precisa de Mais Detalhes?

Leia um destes:
- **[ESTRUTURA_SEPARADA.md](ESTRUTURA_SEPARADA.md)** - Visão geral
- **[GUIA_DEPLOY_SEPARADO.md](GUIA_DEPLOY_SEPARADO.md)** - Detalhes completos
- **[GUIA_SEGURANCA.md](GUIA_SEGURANCA.md)** - Segurança

---

## ❓ Deu erro?

### Erro de CORS?
- Verificar se `FRONTEND_URL` está correto no Render
- Verificar se `REACT_APP_API_URL` está correto no Vercel

### Backend não responde?
- Ir ao Render, clicar no serviço
- Clicar "Manual Deploy" para reiniciar

### Email não envia?
- Verificar `EMAIL_USER` e `EMAIL_PASSWORD` no Render
- Usar Gmail App Password (não senha principal!)

---

## 🎉 Pronto!

Seu site está online e funcionando!

```
🎨 Frontend: https://seu-app.vercel.app
⚙️ Backend: https://financial-manager-api.onrender.com
📧 Emails: Funcionando!
```

---

**Sucesso! 🚀** 

Próximo passo: Compartilhar com outras pessoas!
