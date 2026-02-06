import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta?.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' ? process.env.REACT_APP_SUPABASE_URL : undefined);
const supabaseAnonKey =
  (import.meta?.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' ? process.env.REACT_APP_SUPABASE_ANON_KEY : undefined);

// Debug: mostrar se as variáveis estão carregadas
console.log('🔍 DEBUG - Variáveis de ambiente:');
console.log('VITE_SUPABASE_URL:', import.meta?.env?.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta?.env?.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Variáveis do Supabase não configuradas!');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey);
  console.error('Verifique o arquivo .env na raiz do projeto');
} else {
  console.log('✅ Supabase configurado com sucesso');
  console.log('URL:', supabaseUrl);
  console.log('KEY:', supabaseAnonKey.substring(0, 20) + '...');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
