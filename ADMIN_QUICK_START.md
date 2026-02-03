🔐 QUICK START - PAINEL DE ADMIN DE USUÁRIOS

═══════════════════════════════════════════════════════════════════

⏱️ IMPLEMENTAÇÃO RÁPIDA (5 MINUTOS):

1. SUPABASE:
   → SQL Editor
   → Colar conteúdo de: SQL_CREATE_USER_ROLES.sql
   → Executar

2. BACKEND (.env):
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (do Supabase Settings → API)

3. SUPABASE (SQL):
   INSERT INTO user_roles (user_id, role) VALUES ('SEU_ID', 'admin');

4. TERMINAL:
   cd backend-api && npm start

5. BROWSER:
   http://localhost:3000 → Login → Avatar → "Painel de Admin" ✅

═══════════════════════════════════════════════════════════════════

🎛️ FUNCIONALIDADES:

┌─────────────────────────────────────────────┐
│ 🔐 ADMINISTRAÇÃO DE ACESSOS                 │
├─────────────────────────────────────────────┤
│ ➕ Convidar novo usuário                    │
│ 👥 Lista de usuários (email, role, status) │
│ 🔒 Desativar/🔓 Reativar acesso             │
│ ⬆️ Promover para admin                      │
│ ⬇️ Remover admin                             │
│ 🗑️ Deletar usuário                          │
└─────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

🗂️ ARQUIVOS IMPORTANTE SABER:

BACKEND:
  backend-api/services/adminService.js      ← Lógica
  backend-api/controllers/adminController.js ← API
  backend-api/routes/adminRoutes.js         ← Endpoints

FRONTEND:
  frontend/src/components/AdminPanel.js     ← Interface
  frontend/src/pages/AdminPage.js           ← Página
  frontend/src/AppRouter.js                 ← Rotas

DATABASE:
  SQL_CREATE_USER_ROLES.sql                 ← Script

═══════════════════════════════════════════════════════════════════

🔗 ENDPOINTS:

GET  /api/admin/me                      ← Meu role
POST /api/admin/invite                  ← Convidar usuário
GET  /api/admin/users                   ← Listar usuários
PUT  /api/admin/users/:id/disable       ← Desativar
PUT  /api/admin/users/:id/enable        ← Reativar
PUT  /api/admin/users/:id/promote       ← Promover admin
PUT  /api/admin/users/:id/demote        ← Remover admin
DEL  /api/admin/users/:id               ← Deletar

═══════════════════════════════════════════════════════════════════

💡 IMPORTANTE:

✓ Service Role Key fica apenas no backend (.env)
✓ Token JWT verificado em cada requisição
✓ Apenas admins conseguem acessar as rotas
✓ Usuários não podem fazer ações em si mesmos
✓ RLS (Row Level Security) protege banco de dados

═══════════════════════════════════════════════════════════════════

❌ ERROS COMUNS:

"Erro: Service Role Key não configurada"
  → Adicione SUPABASE_SERVICE_ROLE_KEY no .env

"Acesso negado ao painel"
  → Verifique se é admin (não aparece se não for)
  → Faça logout e login

"Usuário convidado não consegue fazer login"
  → Procure pelo email de confirmação
  → Tente reconvidad

═══════════════════════════════════════════════════════════════════

📱 INTERFACE:

┌──────────────────────────────────────────────────────┐
│ 🔐 Administração de Acessos                          │
├──────────────────────────────────────────────────────┤
│ [➕ Convidar novo usuário] [🔄 Atualizar]            │
├──────────────────────────────────────────────────────┤
│ Email          │ Role    │ Status │ Criado │ Ações   │
├──────────────────────────────────────────────────────┤
│ admin@ex.com   │ 👑Admin │ 🟢 OK  │ 01/01 │ 🔒⬆️🗑️ │
│ user1@ex.com   │ 👤User  │ 🟢 OK  │ 02/01 │ 🔓⬆️🗑️ │
│ user2@ex.com   │ 👤User  │ 🔴 Ban │ 03/01 │ 🔓⬆️🗑️ │
└──────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

✨ Seu sistema de admin está pronto! 🚀

Acesse: Menu → Avatar → "🔐 Painel de Admin"

═══════════════════════════════════════════════════════════════════
