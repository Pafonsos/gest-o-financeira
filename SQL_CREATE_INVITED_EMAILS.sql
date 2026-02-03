-- ============================================
-- CLEANUP: remover mecanismo de cadastro por convite
-- (agora o convite é feito via Supabase Auth)
-- ============================================

-- Remover trigger e função que bloqueavam cadastro
DROP TRIGGER IF EXISTS trg_enforce_invite_on_signup ON auth.users;
DROP FUNCTION IF EXISTS public.enforce_invite_on_signup();

-- Remover função RPC usada no cadastro por convite
DROP FUNCTION IF EXISTS public.is_email_invited(TEXT);

-- Remover tabela de convites (não usada neste fluxo)
DROP TABLE IF EXISTS public.invited_emails;
