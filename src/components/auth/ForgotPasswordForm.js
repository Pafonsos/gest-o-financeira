import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, ArrowLeft } from 'lucide-react';

export const ForgotPasswordForm = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-2xl shadow-2xl p-8 border border-purple-100/50">
        <button
          onClick={() => onToggleForm('login')}
          className="flex items-center gap-3 text-slate-600 hover:text-slate-900 mb-6 p-2 rounded-xl hover:bg-slate-100 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
              <img src="/logo-proteq.png" alt="PROTEQ" className="w-15 h-12" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Recuperar Senha</h1>
          <p className="text-slate-600 mt-2 font-medium">
            Enviaremos um link para redefinir sua senha
          </p>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium border border-red-200/50 shadow-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 p-6 rounded-xl text-center border border-emerald-200/50 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="font-bold text-lg mb-2">Email enviado!</p>
            <p className="text-sm">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
          </div>
        ) : (
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
                  className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/70 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};