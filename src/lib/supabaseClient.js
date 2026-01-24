import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Debug: mostrar se as variáveis estão carregadas
console.log('🔍 DEBUG - Variáveis de ambiente:');
console.log('process.env.REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('process.env.REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY);
console.log('process.env:', process.env);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Variáveis do Supabase não configuradas!');
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl);
  console.error('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey);
  console.error('Verifique o arquivo .env na raiz do projeto');
} else {
  console.log('✅ Supabase configurado com sucesso');
  console.log('URL:', supabaseUrl);
  console.log('KEY:', supabaseAnonKey.substring(0, 20) + '...');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);