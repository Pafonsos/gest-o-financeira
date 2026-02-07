import { createClient } from '@supabase/supabase-js';
import { config } from './config';

const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;

if (config.isDev) {
  console.log('DEBUG - Variáveis de ambiente:');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO: Variáveis do Supabase não configuradas!');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey);
  console.error('Verifique o arquivo .env na raiz do projeto');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);








