import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';

export const RegisterForm = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      nome: formData.nome
    });

    if (error) {
      setError(error);
    } else {
      setSuccess(true);
      setTimeout(() => onToggleForm('login'), 2000);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-gradient-to-br from-white via-emerald-50/30 to-green-50/30 rounded-2xl shadow-2xl p-8 border border-emerald-100/50">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
              <img src="/logo-proteq.png" alt="PROTEQ" className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Criar Conta</h1>
          <p className="text-slate-600 mt-2 font-medium">Acesse o sistema PROTEQ</p>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium border border-red-200/50 shadow-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 p-4 rounded-xl mb-6 text-sm font-medium border border-emerald-200/50 shadow-sm">
            Conta criada! Redirecionando para login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="João Silva"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-14 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="••••••••"
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

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 flex items-center justify-center gap-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Criar Conta
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Já tem uma conta?{' '}
            <button
              onClick={() => onToggleForm('login')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};