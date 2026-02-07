import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UiContext';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export const LoginForm = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const { showMessage } = useUI();
  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
  console.log(' signIn no LoginForm:', signIn); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) {
      const message = 'Informe um email válido';
      setError(message);
      showMessage({ title: 'Email inválido', message, type: 'warning' });
      return;
    }
    if (!password || password.length < 6) {
      const message = 'A senha deve ter pelo menos 6 caracteres';
      setError(message);
      showMessage({ title: 'Senha inválida', message, type: 'warning' });
      return;
    }
    setLoading(true);

    const result = await signIn(email, password); // . CORRETO

    if (result.error) {
      const message = 'Email ou senha incorretos';
      setError(message);
      showMessage({ title: 'Falha no login', message, type: 'error' });
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-2xl shadow-2xl p-8 border border-blue-100/50">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <img src="/logo-proteq.png" alt="PROTEQ" className="w-15 h-12" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Financial Manager</h1>
          <p className="text-slate-600 mt-2 font-medium">Entre na sua conta</p>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium border border-red-200/50 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-14 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="••••••••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-3 text-sm text-slate-600 font-medium">Lembrar-me</span>
            </label>
            <button
              type="button"
              onClick={() => onToggleForm('forgot')}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Acesso somente por convite.
          </p>
        </div>
      </div>
    </div>
  );
};














