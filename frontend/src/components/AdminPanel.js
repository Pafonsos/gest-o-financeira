import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import './AdminPanel.css';

// ============================================
// PAINEL DE ADMINISTRAÇÃO
// ============================================

const AdminPanel = () => {
  const { user } = useAuth();

  // ESTADOS
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal de convite
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitingUser, setInvitingUser] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: '', user: null });

  // Obter token do usuário
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  // ============================================
  // FUNÇÕES
  // ============================================

  // Carregar lista de usuários
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const token = await getAuthToken();
      if (!token) {
        throw new Error('Não autenticado');
      }

      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao carregar usuários');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setSuccess(`${data.count} usuário(s) encontrado(s)`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Convidar novo usuário
  const handleInviteUser = async (e) => {
    e.preventDefault();
    
    try {
      setInvitingUser(true);
      setError('');

      if (!inviteEmail.includes('@')) {
        throw new Error('Email inválido');
      }

      const token = await getAuthToken();
      if (!token) {
        throw new Error('Não autenticado');
      }

      const response = await fetch('http://localhost:5000/api/admin/invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: inviteEmail })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao convidar usuário');
      }

      await response.json();
      setSuccess(`Usuário ${inviteEmail} convidado com sucesso!`);
      setInviteEmail('');
      setShowInviteModal(false);
      setTimeout(() => setSuccess(''), 3000);
      
      // Recarregar lista
      loadUsers();
    } catch (err) {
      console.error('Erro ao convidar:', err);
      setError(err.message || 'Erro ao convidar usuário');
    } finally {
      setInvitingUser(false);
    }
  };

  // Desativar usuário
  const handleDisableUser = async (userId, email) => {
    try {
      setError('');

      const token = await getAuthToken();
      if (!token) {
        throw new Error('Não autenticado');
      }

      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/disable`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao desativar usuário');
      }

      setSuccess(`${email} foi desativado`);
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao desativar');
    }
  }, []);

  // Reativar usuário
  const handleEnableUser = async (userId, email) => {
    try {
      setError('');

      const token = await getAuthToken();
      if (!token) {
        throw new Error('Não autenticado');
      }

      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/enable`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao reativar usuário');
      }

      setSuccess(`${email} foi reativado`);
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao reativar');
    }
  };

  // Promover para admin
  const handlePromoteUser = async (userId, email) => {
    try {
      setError('');

      const token = await getAuthToken();
      if (!token) {
        throw new Error('Não autenticado');
      }

      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/promote`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao promover usuário');
      }

      setSuccess(`${email} é agora admin!`);
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao promover');
    }
  };

  // Remover admin
  const handleDemoteUser = async (userId, email) => {
    try {
      setError('');

      const token = await getAuthToken();
      if (!token) {
        throw new Error('Não autenticado');
      }

      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/demote`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao remover admin');
      }

      setSuccess(`${email} não é mais admin`);
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao remover admin');
    }
  };

  // Deletar usuário
  const handleDeleteUser = async (userId, email) => {
    try {
      setError('');

      const token = await getAuthToken();
      if (!token) {
        throw new Error('Não autenticado');
      }

      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao deletar usuário');
      }

      setSuccess(`${email} foi deletado`);
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao deletar');
    }
  };

  const openConfirm = (action, user) => {
    setConfirmModal({ open: true, action, user });
  };

  const confirmMessage = () => {
    const email = confirmModal.user?.email || '';
    switch (confirmModal.action) {
      case 'disable':
        return `Desativar acesso de ${email}?`;
      case 'enable':
        return `Reativar acesso de ${email}?`;
      case 'promote':
        return `Promover ${email} para admin?`;
      case 'demote':
        return `Remover permissão de admin de ${email}?`;
      case 'delete':
        return `Deletar usuário ${email}? Esta ação é irreversível.`;
      default:
        return 'Confirmar ação?';
    }
  };

  const handleConfirmAction = async () => {
    const target = confirmModal.user;
    if (!target) return;
    setConfirmModal({ open: false, action: '', user: null });
    switch (confirmModal.action) {
      case 'disable':
        return handleDisableUser(target.id, target.email);
      case 'enable':
        return handleEnableUser(target.id, target.email);
      case 'promote':
        return handlePromoteUser(target.id, target.email);
      case 'demote':
        return handleDemoteUser(target.id, target.email);
      case 'delete':
        return handleDeleteUser(target.id, target.email);
      default:
        return null;
    }
  };

  // Carregar usuários no montar
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🔐 Administração de Acessos</h1>
        <p>Gerencie usuários e permissões do sistema</p>
      </div>

      {/* MENSAGENS */}
      {error && (
        <div className="alert alert-error">
          <span>❌ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')}>✕</button>
        </div>
      )}

      {/* BARRA DE AÇÕES */}
      <div className="admin-actions">
        <button
          className="btn btn-primary"
          onClick={() => setShowInviteModal(true)}
        >
          ➕ Convidar novo usuário
        </button>
        <button
          className="btn btn-secondary"
          onClick={loadUsers}
          disabled={loading}
        >
          {loading ? '⏳ Carregando...' : '🔄 Atualizar'}
        </button>
      </div>

      {/* MODAL DE CONVITE */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Convidar novo usuário</h2>
            <form onSubmit={handleInviteUser}>
              <input
                type="email"
                placeholder="Email do novo usuário"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                disabled={invitingUser}
              />
              <div className="modal-buttons">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={invitingUser}
                >
                  {invitingUser ? '⏳ Convidando...' : 'Convidar'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowInviteModal(false)}
                  disabled={invitingUser}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABELA DE USUÁRIOS */}
      <div className="users-section">
        <h2>👥 Lista de Usuários ({users.length})</h2>

        {users.length === 0 ? (
          <p className="empty-state">Nenhum usuário encontrado</p>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div className="col-email">Email</div>
              <div className="col-role">Role</div>
              <div className="col-status">Status</div>
              <div className="col-created">Criado em</div>
              <div className="col-actions">Ações</div>
            </div>

            {users.map((u) => (
              <div key={u.id} className="table-row">
                <div className="col-email">
                  <div className="user-avatar">
                    {(u.profile_photo || u.foto_url || u.avatar_url) ? (
                      <img src={u.profile_photo || u.foto_url || u.avatar_url} alt="Perfil" />
                    ) : (
                      <span>
                        {(u.profile_name || u.email || 'U')[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="user-info">
                    <span>{u.email}</span>
                    {u.profile_name && (
                      <span className="user-name">{u.profile_name}</span>
                    )}
                  </div>
                  {u.id === user?.id && <span className="badge-you">(Você)</span>}
                </div>

                <div className="col-role">
                  <span className={`role-badge ${u.role}`}>
                    {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </span>
                </div>

                <div className="col-status">
                  <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                    {u.is_active ? '🟢 Ativo' : '🔴 Inativo'}
                  </span>
                </div>

                <div className="col-created">
                  {new Date(u.created_at).toLocaleDateString('pt-BR')}
                </div>

                <div className="col-actions">
                  {u.id !== user?.id && (
                    <>
                      {u.is_active ? (
                        <button
                          className="btn-icon btn-disable"
                          onClick={() => openConfirm('disable', u)}
                          title="Desativar acesso"
                        >
                          🔒
                        </button>
                      ) : (
                        <button
                          className="btn-icon btn-enable"
                          onClick={() => openConfirm('enable', u)}
                          title="Reativar acesso"
                        >
                          🔓
                        </button>
                      )}

                      {u.role === 'user' ? (
                        <button
                          className="btn-icon btn-promote"
                          onClick={() => openConfirm('promote', u)}
                          title="Promover para admin"
                        >
                          ⬆️
                        </button>
                      ) : (
                        <button
                          className="btn-icon btn-demote"
                          onClick={() => openConfirm('demote', u)}
                          title="Remover admin"
                        >
                          ⬇️
                        </button>
                      )}

                      <button
                        className="btn-icon btn-delete"
                        onClick={() => openConfirm('delete', u)}
                        title="Deletar usuário"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmModal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirmar Ação</h2>
            <p className="confirm-text">{confirmMessage()}</p>
            <div className="modal-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmModal({ open: false, action: '', user: null })}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmAction}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
