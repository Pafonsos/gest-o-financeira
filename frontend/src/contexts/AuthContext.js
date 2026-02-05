import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const isMountedRef = React.useRef(true);

  // Função para buscar role do usuário
  const fetchUserRole = useCallback(async (userId) => {
    if (!isMounted) {
      console.log('⚠️ fetchUserRole: componente não montado');
      return;
    }
    
    try {
      if (isMounted) setRoleLoading(true);
      console.log('🔄 fetchUserRole: iniciando para user:', userId);
      
      if (!userId) {
        console.log('🔄 fetchUserRole: userId vazio, setRole(user)');
        if (isMounted) {
          setRole('user');
          setRoleLoading(false);
        }
        return;
      }

      console.log('🔄 fetchUserRole: fazendo query ao Supabase...');
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      console.log('🔄 fetchUserRole: resposta recebida', { data, error });

      if (!isMounted) {
        console.log('⚠️ fetchUserRole: componente desmontou durante query');
        return;
      }

      if (error) {
        console.warn('⚠️ fetchUserRole: erro na query', error.code, error.message);
        if (error.code !== 'PGRST116') {
          console.warn('⚠️ Erro ao buscar role:', error.message);
        }
        if (isMounted) {
          setRole('user');
          setRoleLoading(false);
        }
        return;
      }

      console.log('✅ fetchUserRole: role encontrado:', data?.role || 'user');
      if (isMounted) setRole(data?.role || 'user');
    } catch (error) {
      if (isMounted) {
        console.error('❌ fetchUserRole: erro no catch:', error.message);
        setRole('user');
      }
    } finally {
      if (isMounted) setRoleLoading(false);
    }
  }, [isMounted]);

  // Verificar sessão inicial
  const checkUser = useCallback(async () => {
    try {
      console.log('🔍 Verificando sessão inicial...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('📦 Resposta de getSession:', { hasSession: !!session, email: session?.user?.email, error });
      
      if (!isMounted) {
        console.log('⚠️ Componente desmontado após getSession, ignorando setUser');
        return;
      }

      if (error) {
        console.error('❌ Erro ao obter sessão:', error);
        setUser(null);
        setRole('user');
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('👤 Usuário encontrado:', session.user.id);
        setUser(session.user);
        setRole(null); // Default
        setRoleLoading(true);
        // Busca role em background (não bloqueia a renderização)
        if (isMountedRef.current) {
          fetchUserRole(session.user.id);
        }
      } else {
        console.log('🚫 Nenhuma sessão ativa na inicialização');
        setUser(null);
        setRole('user');
        setRoleLoading(false);
      }
    } catch (error) {
      if (isMounted) {
        console.error('❌ Erro na verificação de usuário:', error);
        setUser(null);
        setRole('user');
      }
    } finally {
      if (isMounted) {
        console.log('✓ Finalizando checkUser, setLoading(false)');
        setLoading(false);
      }
    }
  }, [fetchUserRole, isMounted]);

  useEffect(() => {
    console.log('🔐 AuthProvider iniciando...');
    setIsMounted(true);
    isMountedRef.current = true;
    
    // Verificar sessão atual
    checkUser();

    // Escutar mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (!isMounted) {
          console.log('⚠️ Componente desmontado, ignorando mudança de auth');
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          setRole(null); // Default - busca em background
          setRoleLoading(true);
          // Busca role em background (não bloqueia a renderização)
          if (isMountedRef.current) {
            fetchUserRole(session.user.id);
          }
        } else {
          setUser(null);
          setRole('user');
          setRoleLoading(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 Limpando AuthProvider...');
      setIsMounted(false);
      isMountedRef.current = false;
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [checkUser, fetchUserRole, isMounted]);

  const signUp = async (email, password, userData) => {
    try {
      console.log('📝 Iniciando cadastro para:', email);

      return { data: null, error: 'Cadastro desativado. Use o convite para acessar.' };
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

  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Primeiro tenta atualizar o auth email se mudou
      if (profileData.email && profileData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email
        });
        if (emailError) throw emailError;
      }

      // Depois atualiza ou cria o perfil
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      let result;
      if (existingProfile) {
        result = await supabase
          .from('profiles')
          .update({
            nome: profileData.nome,
            email: profileData.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      } else {
        result = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              nome: profileData.nome,
              email: profileData.email,
              created_at: new Date().toISOString()
            }
          ]);
      }

      if (result.error) throw result.error;
      return { data: result.data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    role,
    roleLoading,
    isAdmin: role === 'admin',
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    getUserProfile,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
