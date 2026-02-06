import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingState from './ui/LoadingState';
import AccessDenied from './ui/AccessDenied';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Carregando sessão..." />;
  }

  return user ? children : <Navigate to="/auth" />;
};

// ============================================
// ROTA PROTEGIDA PARA ADMINS
// ============================================
export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin, roleLoading } = useAuth();

  if (loading || roleLoading) {
    return <LoadingState message="Validando permissões..." />;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (!isAdmin) {
    return <AccessDenied message="Somente administradores podem acessar esta página." />;
  }

  return children;
};











