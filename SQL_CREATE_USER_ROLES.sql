-- ============================================
-- TABELA: user_roles
-- Gerencia permissões de admin/user
-- ============================================

-- Criar tabela se não existir
DROP TABLE IF EXISTS public.user_roles CASCADE;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS - SIMPLIFICADAS (SEM RECURSÃO)
-- ============================================

-- Política 1: Cada usuário pode ver sua própria role
CREATE POLICY "users_can_view_own_role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política 2: Service Role pode fazer tudo (via API)
-- (Não precisa de política - service role ignora RLS)

-- Política 3: Usuários autenticados podem ler (para admin panel)
-- Apenas se forem admins - mas sem recursão!
-- Vamos usar uma abordagem diferente: criar uma função

-- FUNÇÃO: Verificar se usuário é admin (sem recursão)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = check_user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política 4: Admins podem ver todos os roles
CREATE POLICY "admins_can_view_all_roles"
  ON public.user_roles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Política 5: Apenas admins podem atualizar
CREATE POLICY "admins_can_update_roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Política 6: Apenas admins podem deletar
CREATE POLICY "admins_can_delete_roles"
  ON public.user_roles
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================
-- PASSO FINAL: Inserir primeiro admin
-- Substitua 'SEU_USER_ID_AQUI' pelo seu ID do Supabase
-- ============================================
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('SEU_USER_ID_AQUI', 'admin');
