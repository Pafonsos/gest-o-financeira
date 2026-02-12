import { createClient } from '@supabase/supabase-js';
import { config } from './config';

const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO: variaveis do Supabase nao configuradas.');
  console.error('Verifique o arquivo .env na raiz do projeto');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);








