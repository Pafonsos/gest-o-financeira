# ⚡ SETUP RÁPIDO - Criar Tabela user_roles

## 🔴 PROBLEMA DETECTADO
A tabela `user_roles` ainda não foi criada no Supabase!

---

## ✅ SOLUÇÃO - 3 PASSOS

### **PASSO 1: Abrir Supabase**
1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Clique em **SQL Editor** (lado esquerdo)

### **PASSO 2: Copiar SQL**
Copie todo o conteúdo de:
```
SQL_CREATE_USER_ROLES.sql
```

### **PASSO 3: Executar no Supabase**
1. No Supabase SQL Editor, clique em **New Query**
2. Cole todo o SQL
3. Clique em **▶️ RUN** (botão verde)
4. Aguarde "Execução bem-sucedida"

---

## ✨ Depois disso:
1. Recarregue o navegador (F5)
2. Faça login novamente
3. A app deve carregar agora!

---

## 🎯 Próximo passo:
Você precisa nomear a si mesmo como **admin**!

No SQL Editor do Supabase, execute:
```sql
-- COPIE SEU USER ID AQUI!
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID_AQUI', 'admin');
```

**Como encontrar seu User ID:**
1. No Supabase, vá para **Authentication → Users**
2. Clique no seu usuário
3. Copie o UUID
4. Substitua em `SEU_USER_ID_AQUI` acima
5. Execute!

---

Depois disso, seu painel de admin estará pronto! 🚀
