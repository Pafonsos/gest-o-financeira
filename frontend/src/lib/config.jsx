const isDev = (import.meta && import.meta.env && import.meta.env.DEV) || false;

const getEnv = (key, fallback) => {
  const viteValue = import.meta && import.meta.env ? import.meta.env[key] : undefined;
  if (viteValue !== undefined && viteValue !== '') return viteValue;

  if (typeof process !== 'undefined' && process.env) {
    const reactAppKey = key.startsWith('VITE_') ? key.replace('VITE_', 'REACT_APP_') : key;
    const reactValue = process.env[reactAppKey];
    if (reactValue !== undefined && reactValue !== '') return reactValue;
  }

  return fallback;
};

export const config = {
  isDev,
  apiUrl: getEnv('VITE_API_URL', 'http://localhost:5000/api'),
  supabaseUrl: getEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnv('VITE_SUPABASE_ANON_KEY'),
};











