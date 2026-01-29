# Configuração do Sistema de Perfil - Supabase

## Instruções para Configurar a Tabela de Perfis

Para que o sistema de perfil funcione completamente, você precisa criar a tabela `profiles` no seu banco de dados Supabase. Siga os passos abaixo:

### 1. Acessar o Supabase

1. Vá para [https://supabase.com](https://supabase.com)
2. Faça login com sua conta
3. Selecione seu projeto
4. Clique em "SQL Editor" na barra lateral esquerda

### 2. Executar o Script SQL

Cole o seguinte script SQL no editor e clique em "Run":

```sql
-- Criar tabela de perfis
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT NOT NULL UNIQUE,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para buscar por email
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Ativar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar política para usuários lerem seu próprio perfil
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Criar política para usuários atualizarem seu próprio perfil
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Criar política para usuários inserirem seu próprio perfil
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar o timestamp
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. Configurar Storage para Fotos de Perfil

Para o upload de fotos de perfil funcionar, você também precisa criar um bucket no Storage:

1. Clique em "Storage" na barra lateral
2. Clique em "New bucket"
3. Digite o nome: `perfil-imagens`
4. Deixe como "Public"
5. Clique em "Create bucket"

### 4. Configurar Políticas de RLS para Storage

1. Clique no bucket `perfil-imagens`
2. Clique em "Policies"
3. Clique em "New policy" e selecione "For SELECT"
4. Cole o seguinte:

```sql
-- Permitir leitura pública
CREATE POLICY "Public access to profile images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'perfil-imagens');

-- Permitir upload para usuários autenticados
CREATE POLICY "Allow users to upload profile images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'perfil-imagens' 
    AND auth.role() = 'authenticated'
  );

-- Permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Allow users to update their own profile images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'perfil-imagens'
    AND auth.uid()::text = owner
  );
```

## Recursos do Sistema de Perfil

### ✅ Avatar Circular
- O avatar aparece como uma bola no canto superior direito
- Mostra a inicial do nome do usuário ou a foto de perfil (se disponível)

### ✅ Menu Dropdown
Ao clicar no avatar, aparecem as seguintes opções:
- **Configurações**: Abre modal para editar nome, email e foto
- **Sair**: Faz logout do usuário

### ✅ Modal de Configurações
No modal você pode:
- **Alterar Foto de Perfil**: Fazer upload de uma imagem (até 5MB)
- **Editar Nome**: Mudar o nome de exibição
- **Editar Email**: Atualizar o email (será enviado um email de confirmação)

### ✅ Armazenamento de Dados
- O nome e email são salvos na tabela `profiles`
- A foto é armazenada em `storage/perfil-imagens`
- Todos os dados são sincronizados com a autenticação do Supabase

## Testando

1. Faça login na aplicação
2. Clique no avatar (bolinha) no canto superior direito
3. Clique em "Configurações"
4. Atualize seu nome e/ou foto
5. Clique em "Salvar"
6. Os dados devem ser salvos e a página deve atualizar

## Troubleshooting

### "Erro ao carregar perfil"
- Certifique-se de que as políticas RLS foram criadas corretamente
- Verifique se você executou todo o script SQL acima

### "Erro ao atualizar foto"
- Certifique-se de que o bucket `perfil-imagens` existe e é público
- Verifique o tamanho do arquivo (máximo 5MB)
- Confirme que as políticas de Storage foram criadas

### "Email não está sendo atualizado"
- Uma confirmação é enviada para o novo email
- Verifique a caixa de entrada do novo email
- O email só é atualizado após confirmar

## Notas de Segurança

- As políticas RLS garantem que cada usuário só possa ver e modificar seus próprios dados
- As imagens são validadas para tamanho máximo (5MB)
- O upload é feito apenas por usuários autenticados
- Todos os dados sensíveis são criptografados no Supabase

---

Se encontrar problemas, verifique o console do navegador (F12) para ver as mensagens de erro detalhadas.
