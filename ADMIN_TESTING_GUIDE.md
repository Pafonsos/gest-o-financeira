🧪 GUIA DE TESTES - PAINEL DE ADMIN

═══════════════════════════════════════════════════════════════════════════

Siga este guia para testar todas as funcionalidades do painel de admin.

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 1: ACESSAR O PAINEL

PASSO A PASSO:
  1. Abra http://localhost:3000
  2. Faça login com sua conta
  3. Clique no avatar (superior direito)
  4. Você deve ver "🔐 Painel de Admin"

RESULTADO ESPERADO:
  ✓ Se for admin: Link aparece
  ✓ Se não for admin: Link não aparece
  ✓ Clicando em "Painel de Admin" abre a página

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 2: LISTAR USUÁRIOS

PASSO A PASSO:
  1. Abra o Painel de Admin
  2. A página carrega automaticamente

RESULTADO ESPERADO:
  ✓ Mostra tabela com usuários cadastrados
  ✓ Cada linha mostra: Email, Role, Status, Data de criação
  ✓ Você aparece como (Você) na lista

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 3: CONVIDAR NOVO USUÁRIO

PASSO A PASSO:
  1. Clique em "➕ Convidar novo usuário"
  2. Um modal aparece
  3. Digite um email válido (ex: novo@exemplo.com)
  4. Clique em "Convidar"

RESULTADO ESPERADO:
  ✓ Mensagem de sucesso aparece
  ✓ Modal fecha
  ✓ Novo usuário aparece na tabela com role "👤 User"
  ✓ Novo usuário tem status "🔴 Inativo" (precisa confirmar email)

TESTE ADICIONAL:
  • Tente convidar com email inválido → Deve mostrar erro
  • Tente convidar com email já existente → Pode gerar erro do Supabase

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 4: DESATIVAR USUÁRIO

PASSO A PASSO:
  1. Na tabela, encontre um usuário (não seja você!)
  2. Se status for 🟢 Ativo, clique no ícone 🔒 (cadeado fechado)
  3. Confirme no dialog

RESULTADO ESPERADO:
  ✓ Mensagem de sucesso: "foi desativado"
  ✓ Status muda para 🔴 Inativo
  ✓ Ícone muda para 🔓 (cadeado aberto)

TESTE ADICIONAL:
  • Tente desativar a si mesmo → Botão 🔒 fica desabilitado
  • Tente desativar inexistente → Deve retornar erro

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 5: REATIVAR USUÁRIO

PASSO A PASSO:
  1. Na tabela, encontre um usuário inativo
  2. Se status for 🔴 Inativo, clique no ícone 🔓 (cadeado aberto)
  3. Confirme no dialog

RESULTADO ESPERADO:
  ✓ Mensagem de sucesso: "foi reativado"
  ✓ Status muda para 🟢 Ativo
  ✓ Ícone muda para 🔒 (cadeado fechado)

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 6: PROMOVER PARA ADMIN

PASSO A PASSO:
  1. Na tabela, encontre um usuário com role 👤 User
  2. Clique no ícone ⬆️ (seta para cima)
  3. Confirme no dialog

RESULTADO ESPERADO:
  ✓ Mensagem de sucesso: "é agora admin"
  ✓ Role muda de 👤 User para 👑 Admin
  ✓ Ícone muda de ⬆️ para ⬇️

TESTE ADICIONAL:
  • Promova um usuário e faça login com ele
  • Você deve ver "Painel de Admin" no menu

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 7: REMOVER ADMIN

PASSO A PASSO:
  1. Na tabela, encontre um usuário com role 👑 Admin (que não seja você)
  2. Clique no ícone ⬇️ (seta para baixo)
  3. Confirme no dialog

RESULTADO ESPERADO:
  ✓ Mensagem de sucesso: "foi degradado"
  ✓ Role muda de 👑 Admin para 👤 User
  ✓ Ícone muda de ⬇️ para ⬆️

TESTE ADICIONAL:
  • Tente remover suas próprias permissões → Botão ⬇️ fica desabilitado

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 8: DELETAR USUÁRIO

PASSO A PASSO:
  1. Na tabela, encontre um usuário qualquer (que não seja você!)
  2. Clique no ícone 🗑️ (lixeira)
  3. Confirme no dialog (mensagem de aviso)

RESULTADO ESPERADO:
  ✓ Mensagem de sucesso: "foi deletado"
  ✓ Usuário desaparece da tabela
  ✓ Contagem de usuários diminui

TESTE ADICIONAL:
  • Tente deletar a si mesmo → Botão 🗑️ fica desabilitado
  • Verificar no Supabase que usuário foi realmente deletado

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 9: MENSAGENS DE ERRO E SUCESSO

PASSO A PASSO:
  1. Faça qualquer ação (convidar, promover, deletar)
  2. Observe as mensagens

RESULTADO ESPERADO:
  ✓ Mensagem de sucesso aparece no topo (verde)
  ✓ Mensagem some após 3 segundos automaticamente
  ✓ Mensagem de erro aparece no topo (vermelho)
  ✓ Há botão X para fechar manualmente

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 10: BOTÃO ATUALIZAR

PASSO A PASSO:
  1. Convidar um novo usuário
  2. Clicar no botão 🔄 Atualizar

RESULTADO ESPERADO:
  ✓ Tabela se recarrega
  ✓ Novo usuário aparece
  ✓ Dados estão atualizados

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 11: SEGURANÇA - NÃO-ADMIN

PASSO A PASSO:
  1. Crie um usuário comum (não admin)
  2. Faça login com esse usuário
  3. Tente acessar http://localhost:3000/admin

RESULTADO ESPERADO:
  ✓ Página mostra "🚫 Sem Permissão"
  ✓ Há botão para voltar ao Dashboard
  ✓ Link "Painel de Admin" NÃO aparece no menu

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 12: SEGURANÇA - NÃO-AUTENTICADO

PASSO A PASSO:
  1. Faça logout
  2. Tente acessar http://localhost:3000/admin

RESULTADO ESPERADO:
  ✓ Página mostra "🔐 Acesso Negado"
  ✓ Há botão "Ir para Login"
  ✓ Você é redirecionado para /auth

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 13: RESPONSIVIDADE

PASSO A PASSO:
  1. Abra o Painel de Admin
  2. Redimensione o navegador (ou abra DevTools F12)
  3. Teste em diferentes tamanhos: 320px, 768px, 1024px

RESULTADO ESPERADO:
  ✓ Em telas pequenas: tabela vira cards
  ✓ Em telas médias: tabela aparece compacta
  ✓ Em telas grandes: tabela aparece espaçosa
  ✓ Botões ficam sempre clicáveis

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 14: PERFORMANCE

PASSO A PASSO:
  1. Abra DevTools (F12)
  2. Vá para aba Network
  3. Abra o Painel de Admin
  4. Observe as requisições

RESULTADO ESPERADO:
  ✓ GET /api/admin/users retorna dados em < 1s
  ✓ POST /api/admin/invite retorna em < 1s
  ✓ Nenhuma requisição retorna erro 5xx

═══════════════════════════════════════════════════════════════════════════

✅ TESTE 15: LOGOUT E LOGIN

PASSO A PASSO:
  1. Esteja no Painel de Admin
  2. Clique no avatar → "Sair"
  3. Faça login novamente
  4. Abra o Painel de Admin

RESULTADO ESPERADO:
  ✓ Role é recarregado do banco após login
  ✓ Painel funciona normalmente
  ✓ Dados estão atualizados

═══════════════════════════════════════════════════════════════════════════

🧪 TESTES COM CURL (Backend):

TESTE 1: Verificar se é admin
  curl -X GET "http://localhost:5000/api/admin/me" \
    -H "Authorization: Bearer SEU_TOKEN"

  Resposta esperada:
  {
    "success": true,
    "userId": "...",
    "role": "admin",
    "isAdmin": true
  }

TESTE 2: Listar usuários
  curl -X GET "http://localhost:5000/api/admin/users" \
    -H "Authorization: Bearer SEU_TOKEN"

  Resposta esperada:
  {
    "success": true,
    "count": 3,
    "users": [
      {
        "id": "...",
        "email": "admin@exemplo.com",
        "role": "admin",
        "is_active": true
      }
    ]
  }

TESTE 3: Convidar usuário
  curl -X POST "http://localhost:5000/api/admin/invite" \
    -H "Authorization: Bearer SEU_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"email": "novo@exemplo.com"}'

  Resposta esperada:
  {
    "success": true,
    "userId": "...",
    "email": "novo@exemplo.com",
    "message": "Usuário novo@exemplo.com convidado com sucesso"
  }

═══════════════════════════════════════════════════════════════════════════

📊 CHECKLIST DE TESTES:

  ☐ Teste 1: Acessar painel
  ☐ Teste 2: Listar usuários
  ☐ Teste 3: Convidar novo usuário
  ☐ Teste 4: Desativar usuário
  ☐ Teste 5: Reativar usuário
  ☐ Teste 6: Promover para admin
  ☐ Teste 7: Remover admin
  ☐ Teste 8: Deletar usuário
  ☐ Teste 9: Mensagens
  ☐ Teste 10: Atualizar
  ☐ Teste 11: Segurança (não-admin)
  ☐ Teste 12: Segurança (não-autenticado)
  ☐ Teste 13: Responsividade
  ☐ Teste 14: Performance
  ☐ Teste 15: Logout/Login
  ☐ Teste com CURL

═══════════════════════════════════════════════════════════════════════════

✅ SE TODOS OS TESTES PASSAREM:

Parabéns! 🎉 Seu painel de admin está totalmente funcional e seguro!

═══════════════════════════════════════════════════════════════════════════
