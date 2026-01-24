import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    checkUser();

    // Escutar mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      console.log('📝 Iniciando cadastro para:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        console.error('❌ Erro ao cadastrar:', error.message);
        throw error;
      }

      console.log('✅ Usuário criado com sucesso');

      // ⚠️ TEMPORARIAMENTE DESABILITADO: Criação de perfil na tabela profiles
      // Está causando erro de RLS. Para reabilitar, configure as políticas no Supabase
      /*
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: email,
                nome: userData.nome,
                created_at: new Date().toISOString()
              }
            ]);

          if (profileError) {
            console.warn('⚠️ Aviso ao criar perfil:', profileError.message);
          }
        } catch (err) {
          console.warn('⚠️ Erro ao criar perfil (ignorado):', err.message);
        }
      }
      */

      return { data, error: null };
    } catch (error) {
      console.error('❌ Erro completo:', error);
      return { data: null, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Iniciando login para:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erro ao fazer login:', error.message);
        console.error('Código do erro:', error.status);
        throw error;
      }

      console.log('✅ Login realizado com sucesso');
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erro completo no login:', error);
      return { data: null, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
