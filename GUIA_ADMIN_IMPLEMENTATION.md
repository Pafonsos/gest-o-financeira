># 🔐 GUIA DE IMPLEMENTAÇÃO - PAINEL ADMIN DE USUÁRIOS

## 📋 Resumo

Você tem tudo pronto para gerenciar usuários sem precisar abrir o Supabase! O sistema é formado por 3 partes:

### ✅ Backend (Node.js)
- Service que usa Service Role Key (chave secreta)
- Rotas protegidas com verificação de admin
- Funções para convidar, listar, ativar/desativar e promover

### ✅ Frontend (React)
- Componente AdminPanel com interface visual
- Página AdminPage protegida (só admins podem acessar)
- Link no menu de perfil

### ✅ Banco de Dados (Supabase)
- Tabela `user_roles` com RLS configurado
- Políticas de segurança para proteger dados

---

## 🚀 PASSO A PASSO - IMPLEMENTAÇÃO

### **PASSO 1: Executar SQL no Supabase**

1. Acesse https://app.supabase.com
2. Vá para **SQL Editor**
3. Cole o código de `SQL_CREATE_USER_ROLES.sql`
4. Execute (clique em ▶️)

Isso vai criar a tabela `user_roles` com as políticas de segurança.

---

### **PASSO 2: Configurar Variáveis de Ambiente**

No backend (`backend-api/.env`), adicione/confirme:

```env
# Existentes
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...

# Novos - CRÍTICO!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Como obter a Service Role Key:**
1. No Supabase, vá para **Settings → API**
2. Copie a `service_role key` (é a chave secreta!)
3. Cole no `.env` do backend

⚠️ **IMPORTANTE:** Nunca compartilhe esta chave!

---

### **PASSO 3: Nomear o Primeiro Admin**

No Supabase SQL Editor, execute:

```sql
-- Substitua SEU_USER_ID_AQUI pelo seu ID real
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID_AQUI', 'admin');
```

**Como encontrar seu User ID:**
1. No Supabase, vá para **Authentication → Users**
2. Clique no seu usuário
3. Copie o `UUID`
4. Substitua no SQL acima

---

### **PASSO 4: Reiniciar o Backend**

```bash
cd backend-api
npm start
```

Verifique se não há erros:
```
✅ Service de Admin inicializado
✅ SERVIDOR INICIADO COM SUCESSO
```

---

### **PASSO 5: Testar no Frontend**

1. Acesse http://localhost:3000
2. Faça login com sua conta
3. Clique no avatar no canto superior direito
4. Você verá "🔐 Painel de Admin" (só aparece se for admin!)
5. Clique para abrir

---

## 🎯 COMO USAR O PAINEL ADMIN

### 1️⃣ **Convidar Novo Usuário**
- Clique em "➕ Convidar novo usuário"
- Digite o email
- Clique em "Convidar"
- O usuário receberá um link para set senha

### 2️⃣ **Ver Lista de Usuários**
- Todos aparecem na tabela automaticamente
- Mostra: Email, Role, Status, Data de criação

### 3️⃣ **Desativar/Reativar Usuário**
- Clique no ícone 🔒 (desativar) ou 🔓 (reativar)
- O usuário não consegue fazer login se desativado

### 4️⃣ **Promover para Admin**
- Clique no ícone ⬆️ (promover)
- O usuário agora pode gerenciar outros

### 5️⃣ **Remover Admin**
- Clique no ícone ⬇️ (remover admin)
- O usuário volta a ser um user comum

### 6️⃣ **Deletar Usuário**
- Clique no ícone 🗑️ (deletar)
- Cuidado: não é reversível!

---

## 📱 ESTRUTURA DE ARQUIVOS

### Backend Criados:
```
backend-api/
├── services/
│   └── adminService.js          ← Lógica do admin
├── controllers/
│   └── adminController.js       ← Rotas do admin
├── middleware/
│   └── authMiddleware.js        ← Verificação de token
└── routes/
    └── adminRoutes.js           ← Endpoints
```

### Frontend Criados:
```
frontend/src/
├── components/
│   ├── AdminPanel.js            ← Interface visual
│   ├── AdminPanel.css           ← Estilos
│   └── ProtectedRoute.js        ← ATUALIZADO com AdminRoute
├── pages/
│   ├── AdminPage.js             ← Página admin
│   └── AdminPage.css            ← Estilos
├── AppRouter.js                 ← NOVO: Rotas centralizadas
└── index.js                     ← ATUALIZADO: Usa AppRouter
```

### Banco de Dados:
```
SQL_CREATE_USER_ROLES.sql       ← Script para criar tabela
```

---

## 🔐 API ENDPOINTS

Todos os endpoints começam com `/api/admin`

### Sem Autenticação (apenas autenticado):
```
GET /api/admin/me
  ↳ Retorna role do usuário atual
  ↳ Response: { userId, role, isAdmin }
```

### Com Autenticação (requer admin):
```
POST /api/admin/invite
  ↳ Body: { email, userData? }
  ↳ Response: { userId, email }

GET /api/admin/users
  ↳ Response: { count, users[] }

PUT /api/admin/users/:userId/disable
  ↳ Response: { success, message }

PUT /api/admin/users/:userId/enable
  ↳ Response: { success, message }

PUT /api/admin/users/:userId/promote
  ↳ Response: { userId, role: 'admin' }

PUT /api/admin/users/:userId/demote
  ↳ Response: { userId, role: 'user' }

DELETE /api/admin/users/:userId
  ↳ Response: { success, message }
```

---

## 🧪 TESTES RECOMENDADOS

### 1. Testar Convite
```bash
curl -X POST http://localhost:5000/api/admin/invite \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "novo@exemplo.com"}'
```

### 2. Testar Listar Usuários
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 3. Testar Obter Role
```bash
curl -X GET http://localhost:5000/api/admin/me \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🐛 TROUBLESHOOTING

### ❌ "Erro: Service Role Key não configurada"
- Verifique o `.env` do backend
- Adicione `SUPABASE_SERVICE_ROLE_KEY`
- Reinicie o backend

### ❌ "Acesso negado ao painel admin"
- Verifique se você é admin: Menu → Painel de Admin
- Se não aparecer, execute o SQL do PASSO 3
- Faça logout e login novamente

### ❌ "Usuários convidados não conseguem fazer login"
- Verifique se receberam o email de confirmação
- Tente reconvidá-los

### ❌ "Erro 401 - Token inválido"
- Faça logout e login novamente
- Verifique se o token expirou

---

## 📊 FLUXO DE SEGURANÇA

```
1. Usuário faz login
   ↓
2. Frontend obtém token JWT
   ↓
3. Frontend busca role no banco (user_roles)
   ↓
4. AuthContext armazena: isAdmin = (role === 'admin')
   ↓
5. Se tentar acessar /admin:
   - AdminRoute verifica isAdmin
   - Se true → Mostra AdminPanel
   - Se false → Redireciona para /dashboard
   ↓
6. AdminPanel envia requisições com token
   ↓
7. Backend verifica:
   - Token válido?
   - É admin? (consultando user_roles)
   - Se sim → Executa ação
   - Se não → Retorna 403 Forbidden
```

---

## 🎨 CUSTOMIZAÇÕES

### Mudar cores:
Edite `AdminPanel.css` e `AdminPage.css`

### Mudar ícones:
Substitua emojis nas templates

### Adicionar campos:
Edite o formulário em `AdminPanel.js`

---

## 📞 SUPORTE

Se algo não funcionar:

1. Verifique o console do navegador (F12)
2. Verifique logs do backend (terminal)
3. Verifique se as variáveis de ambiente estão corretas
4. Teste manualmente com curl

---

## ✨ RESUMO DO QUE FOI CRIADO

| Componente | Arquivo | Função |
|-----------|---------|--------|
| **Backend Service** | `adminService.js` | Gerencia usuários com Service Role |
| **Backend Controller** | `adminController.js` | Processa requisições HTTP |
| **Backend Middleware** | `authMiddleware.js` | Verifica token JWT |
| **Backend Rotas** | `adminRoutes.js` | Define endpoints |
| **Frontend Component** | `AdminPanel.js/css` | Interface visual |
| **Frontend Page** | `AdminPage.js/css` | Página protegida |
| **Frontend Router** | `AppRouter.js` | Gerencia rotas |
| **Banco de Dados** | `SQL_CREATE_USER_ROLES.sql` | Tabela com RLS |

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Executar SQL
2. ✅ Adicionar Service Role Key
3. ✅ Nomear primeiro admin
4. ✅ Reiniciar backend
5. ✅ Testar no frontend
6. ✅ Convidar novos usuários
7. ✅ Gerenciar permissões

**Pronto! Seu painel de admin está operacional! 🚀**
