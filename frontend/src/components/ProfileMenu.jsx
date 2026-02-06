import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, Upload, X, Shield, Workflow, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ProfileMenu = () => {
  const { user, signOut, updateUserProfile, getUserProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    nome: '',
    email: user?.email || '',
    fotoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const carregarPerfil = async () => {
      if (user?.id) {
        try {
          const profile = await getUserProfile(user.id);
          if (profile) {
            setUserProfile({
              nome: profile.nome || '',
              email: profile.email || user?.email || '',
              fotoUrl: profile.foto_url || '',
            });
          } else {
            setUserProfile({
              nome: '',
              email: user?.email || '',
              fotoUrl: '',
            });
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
          // Usar email como fallback
          setUserProfile({
            nome: '',
            email: user?.email || '',
            fotoUrl: '',
          });
        }
      }
    };
    carregarPerfil();
  }, [user, getUserProfile]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Arquivo muito grande. Máximo 5MB.' });
      return;
    }

    setLoading(true);
    try {
      // Fazer upload da foto
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ foto_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUserProfile({ ...userProfile, fotoUrl: publicUrl });
      setMessage({ type: 'success', text: 'Foto atualizada com sucesso!' });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar foto' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile.nome.trim()) {
      setMessage({ type: 'error', text: 'Nome não pode estar vazio' });
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserProfile({
        nome: userProfile.nome,
        email: userProfile.email,
      });

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        setTimeout(() => {
          setShowEditModal(false);
          setMessage({ type: '', text: '' });
        }, 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const inicialNome = userProfile.nome
    ? userProfile.nome.split(' ')[0][0].toUpperCase()
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold hover:shadow-lg transition-all hover:scale-110 border-2 border-white"
      >
        {userProfile.fotoUrl ? (
          <img
            src={userProfile.fotoUrl}
            alt="Perfil"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          inicialNome
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
          {/* Cabeçalho do Perfil */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">
              {userProfile.nome || 'Usuário'}
            </p>
            <p className="text-xs text-gray-600 truncate">{userProfile.email}</p>
          </div>

          {/* Opções */}
          <button
            onClick={() => {
              setShowEditModal(true);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-left"
          >
            <Settings className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Configurações</span>
          </button>

          <button
            onClick={() => {
              navigate('/chat');
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors text-left"
          >
            <MessageCircle className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium">Chat</span>
          </button>

          {/* Painel Admin - Apenas para admins */}
          {isAdmin && (
            <button
              onClick={() => {
                navigate('/admin');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-purple-700 hover:bg-purple-50 transition-colors text-left"
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Painel de Admin</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                navigate('/pipefy');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-emerald-700 hover:bg-emerald-50 transition-colors text-left"
            >
              <Workflow className="w-5 h-5" />
              <span className="text-sm font-medium">Pipefy</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-700 hover:bg-red-50 transition-colors text-left border-t border-gray-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      )}

      {/* Modal de Edição de Perfil */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Editar Perfil</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setMessage({ type: '', text: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-4">
              {/* Foto de Perfil */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-2xl flex items-center justify-center mb-4 overflow-hidden border-4 border-gray-200">
                  {userProfile.fotoUrl ? (
                    <img
                      src={userProfile.fotoUrl}
                      alt="Perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    inicialNome
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={loading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {loading ? 'Enviando...' : 'Alterar Foto'}
                </button>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={userProfile.nome}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, nome: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite seu nome"
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>

              {/* Mensagem */}
              {message.text && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${
                    message.type === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setMessage({ type: '', text: '' });
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;















