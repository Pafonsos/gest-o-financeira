import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export const SetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const init = async () => {
      setError('');

      // Trocar o code da URL por sessão (link de convite)
      if (window.location.href.includes('code=')) {
        // Garantir que não estamos reutilizando uma sessão antiga
        await supabase.auth.signOut();

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (exchangeError) {
          setError('Link inválido ou expirado. Solicite um novo convite.');
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        setError('Sessão inválida. Abra o link do convite novamente.');
        return;
      }

      setReady(true);
    };

    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password
    });

    if (updateError) {
      setError(updateError.message || 'Erro ao definir senha.');
      setLoading(false);
      return;
    }

    setSuccess('Senha definida com sucesso! Redirecionando...');
    setLoading(false);
    setTimeout(() => navigate('/dashboard'), 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-2xl shadow-2xl p-8 border border-blue-100/50">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <img src="/logo-proteq.png" alt="PROTEQ" className="w-15 h-12" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Definir Senha
            </h1>
            <p className="text-slate-600 mt-2 font-medium">
              Crie sua senha para acessar o sistema
            </p>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium border border-red-200/50 shadow-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium border border-green-200/50 shadow-sm">
              {success}
            </div>
          )}

          {!ready ? (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Nova senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Confirmar senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Definir senha'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
