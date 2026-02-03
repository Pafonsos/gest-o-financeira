import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminPanel from '../components/AdminPanel';
import './AdminPage.css';

// ============================================
// PÁGINA DE ADMINISTRAÇÃO
// Apenas admins podem acessar
// ============================================

const AdminPage = () => {
  const { user, loading, isAdmin } = useAuth();

  // Carregando
  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Não autenticado
  if (!user) {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <h1>🔐 Acesso Negado</h1>
          <p>Você precisa estar autenticado para acessar esta página.</p>
          <a href="/login" className="btn btn-primary">
            Ir para Login
          </a>
        </div>
      </div>
    );
  }

  // Não é admin
  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <h1>🚫 Sem Permissão</h1>
          <p>Apenas administradores podem acessar o painel de administração.</p>
          <a href="/dashboard" className="btn btn-secondary">
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Admin pode acessar
  return (
    <div className="admin-page">
      <AdminPanel />
    </div>
  );
};

export default AdminPage;
