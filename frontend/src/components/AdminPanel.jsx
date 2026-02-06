import React, {useState, useEffect, useCallback} from 'react';
import { UserX, UserCheck, Shield, ShieldOff, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import LoadingState from './ui/LoadingState';
import './AdminPanel.css';

// ============================================
// PAINEL DE ADMINISTRAÇÃO
// ============================================

const LANDING_SLIDES_KEY = 'proteq-landing-slides';
const defaultLandingSlides = [
  { title: 'Equipe Proteq', subtitle: 'Gente focada em resultado', image: '' },
  { title: 'Operação', subtitle: 'Processos organizados e confiáveis', image: '' },
  { title: 'Relacionamento', subtitle: 'Cuidado com cada cliente', image: '' }
];

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
  const [landingSlides, setLandingSlides] = useState(defaultLandingSlides);
  const [activeAdminTab, setActiveAdminTab] = useState('users');

  // Obter token do Usuário
  const getAuthToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }, []);

  // ============================================
  // FUN•.ES
  // ============================================

  // Carregar lista de Usuários
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const token = await getAuthToken();
      if (!token) {
        throw new Error('não autenticado');
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
        throw new Error(data.error || 'Erro ao carregar Usuários');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setSuccess(`${data.count} Usuário(s) encontrado(s)`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erro ao carregar Usuários:', err);
      setError(err.message || 'Erro ao carregar Usuários');
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  const loadLandingSlides = useCallback(() => {
    try {
      const raw = localStorage.getItem(LANDING_SLIDES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLandingSlides(parsed);
          return;
        }
      }
      setLandingSlides(defaultLandingSlides);
    } catch {
      setLandingSlides(defaultLandingSlides);
    }
  }, []);

  const saveLandingSlides = () => {
    localStorage.setItem(LANDING_SLIDES_KEY, JSON.stringify(landingSlides));
    setSuccess('Carrossel atualizado com sucesso');
    setTimeout(() => setSuccess(''), 2500);
  };

  const resetLandingSlides = () => {
    setLandingSlides(defaultLandingSlides);
    localStorage.setItem(LANDING_SLIDES_KEY, JSON.stringify(defaultLandingSlides));
    setSuccess('Carrossel restaurado para o padrão');
    setTimeout(() => setSuccess(''), 2500);
  };

  const handleSlideChange = (index, field, value) => {
    setLandingSlides((prev) =>
      prev.map((slide, i) => (i === index ? { ...slide, [field]: value } : slide))
    );
  };

  const handleAddSlide = () => {
    if (landingSlides.length >= 5) {
      setError('Limite de 5 imagens no carrossel');
      setTimeout(() => setError(''), 2500);
      return;
    }
    setLandingSlides((prev) => ([
      ...prev,
      { title: 'Novo slide', subtitle: 'Descrição curta', image: '' }
    ]));
  };

  const handleRemoveSlide = (index) => {
    setLandingSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSlide = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (typeof result === 'string') {
        handleSlideChange(index, 'image', result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Convidar novo Usuário
  const handleInviteUser = async (e) => {
    e.preventDefault();
    
    try {
      setInvitingUser(true);
      setError('');
      if (!inviteEmail || !/\S+@\S+\.\S+/.test(inviteEmail)) {
        throw new Error('Informe um email válido');
      }

      if (!inviteEmail.includes('@')) {
        throw new Error('Email inválido');
      }

      const token = await getAuthToken();
      if (!token) {
        throw new Error('não autenticado');
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
        throw new Error(data.error || 'Erro ao convidar Usuário');
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
      setError(err.message || 'Erro ao convidar Usuário');
    } finally {
      setInvitingUser(false);
    }
  };

  // Desativar Usuário
  const handleDisableUser = useCallback(async (userId, email) => {
    try {
      setError('');

      const token = await getAuthToken();
      if (!token) {
        throw new Error('não autenticado');
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
        throw new Error(data.error || 'Erro ao desativar Usuário');
      }

      setSuccess(`${email} foi desativado`);
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao desativar');
    }
  }, [getAuthToken, loadUsers]);

  // Reativar Usuário
  const handleEnableUser = async (userId, email) => {
    try {
      setError('');

      const token = await getAuthToken();
      if (!token) {
        throw new Error('não autenticado');
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
        throw new Error(data.error || 'Erro ao reativar Usuário');
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
        throw new Error('não autenticado');
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
        throw new Error(data.error || 'Erro ao promover Usuário');
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
        throw new Error('não autenticado');
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

  // Deletar Usuário
  const handleDeleteUser = async (userId, email) => {
    try {
      setError('');

      const token = await getAuthToken();
      if (!token) {
        throw new Error('não autenticado');
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
        throw new Error(data.error || 'Erro ao deletar Usuário');
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
        return `Deletar Usuário ${email}? Esta ação é irreversível.`;
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

  // Carregar Usuários no montar
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadLandingSlides();
  }, [loadLandingSlides]);

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1> Administração de Acessos</h1>
        <p>Gerencie Usuários e permissões do sistema</p>
      </div>

      {/* MENSAGENS */}
      {error && (
        <div className="alert alert-error">
          <span> {error}</span>
          <button onClick={() => setError('')}>.</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>. {success}</span>
          <button onClick={() => setSuccess('')}>.</button>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeAdminTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('users')}
        >
          Usuários
        </button>
        <button
          className={`tab-btn ${activeAdminTab === 'carousel' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('carousel')}
        >
          Carrossel
        </button>
      </div>

      {activeAdminTab === 'users' && (
        <>
          {/* BARRA DE A•.ES */}
          <div className="admin-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowInviteModal(true)}
            >
              . Convidar novo Usuário
            </button>
            <button
              className="btn btn-secondary"
              onClick={loadUsers}
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>
        </>
      )}

      {/* MODAL DE CONVITE */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Convidar novo Usuário</h2>
            <form onSubmit={handleInviteUser}>
              <input
                type="email"
                placeholder="Email do novo Usuário"
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
                  {invitingUser ? 'Convidando...' : 'Convidar'}
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

      {activeAdminTab === 'users' && (
        <div className="users-section">
          <h2>Lista de Usuários ({users.length})</h2>

          {loading && <LoadingState message="Carregando usuários..." />}

          {users.length === 0 ? (
            <p className="empty-state">Nenhum Usuário encontrado</p>
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
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>

                  <div className="col-status">
                    <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                      {u.is_active ? 'Ativo' : ' Inativo'}
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
                            className="btn-icon btn-action btn-disable"
                            onClick={() => openConfirm('disable', u)}
                            title="Desativar acesso"
                          >
                            <UserX size={16} />
                            <span>Desativar</span>
                          </button>
                        ) : (
                          <button
                            className="btn-icon btn-action btn-enable"
                            onClick={() => openConfirm('enable', u)}
                            title="Reativar acesso"
                          >
                            <UserCheck size={16} />
                            <span>Reativar</span>
                          </button>
                        )}

                        {u.role === 'user' ? (
                          <button
                            className="btn-icon btn-action btn-promote"
                            onClick={() => openConfirm('promote', u)}
                            title="Promover para admin"
                          >
                            <Shield size={16} />
                            <span>Promover</span>
                          </button>
                        ) : (
                          <button
                            className="btn-icon btn-action btn-demote"
                            onClick={() => openConfirm('demote', u)}
                            title="Remover admin"
                          >
                            <ShieldOff size={16} />
                            <span>Remover</span>
                          </button>
                        )}

                        <button
                          className="btn-icon btn-action btn-delete"
                          onClick={() => openConfirm('delete', u)}
                          title="Deletar Usuário"
                        >
                          <Trash2 size={16} />
                          <span>Excluir</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeAdminTab === 'carousel' && (
        <div className="landing-manager">
          <h2>Carrossel da página inicial</h2>
          <p>Máximo de 5 imagens.</p>

          <div className="landing-actions">
            <button className="btn btn-secondary" type="button" onClick={handleAddSlide}>
              Adicionar slide
            </button>
            <button className="btn btn-primary" type="button" onClick={saveLandingSlides}>
              Salvar alterações
            </button>
            <button className="btn btn-ghost" type="button" onClick={resetLandingSlides}>
              Restaurar padrão
            </button>
          </div>

          <div className="landing-slides">
            {landingSlides.map((slide, idx) => (
              <div key={`slide-${idx}`} className="landing-slide">
                <div
                  className="landing-preview"
                  style={slide.image ? { backgroundImage: `url(${slide.image})` } : undefined}
                >
                  {!slide.image && <span>Sem imagem</span>}
                </div>

                <div className="landing-fields">
                  <label>
                    URL da imagem
                    <input
                      type="text"
                      value={slide.image}
                      placeholder="https://..."
                      onChange={(e) => handleSlideChange(idx, 'image', e.target.value)}
                    />
                  </label>
                  <label className="file-input">
                    Enviar imagem
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadSlide(idx, e.target.files?.[0])}
                    />
                  </label>
                </div>

                <div className="landing-slide-actions">
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => handleRemoveSlide(idx)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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























