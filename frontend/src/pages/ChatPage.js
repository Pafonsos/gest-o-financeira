import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Plus, Users, X, Send, Paperclip } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import ProfileMenu from '../components/ProfileMenu';
import '../pages/AdminPage.css';
import './ChatPage.css';

const ChatPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const profileLookup = useMemo(() => {
    const map = new Map();
    profiles.forEach((p) => {
      if (p?.id) map.set(p.id, p);
    });
    return map;
  }, [profiles]);

  const memberMap = useMemo(() => {
    const map = new Map();
    members.forEach((m) => {
      if (m.userId) {
        map.set(m.userId, m.profile || profileLookup.get(m.userId) || null);
      }
    });
    return map;
  }, [members, profileLookup]);

  useEffect(() => {
    const loadProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, nome, email, foto_url, avatar_url');
      setProfiles(data || []);
    };
    loadProfiles();
  }, []);

  useEffect(() => {
    const loadRooms = async () => {
      if (!user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_room_members')
        .select('room_id, role, chat_rooms(id, name, created_by, created_at)')
        .eq('user_id', user.id);

      if (error) {
        setStatus('Erro ao carregar salas.');
        setLoading(false);
        return;
      }

      const mapped = (data || [])
        .map((item) => ({
          id: item.chat_rooms?.id,
          name: item.chat_rooms?.name,
          createdBy: item.chat_rooms?.created_by,
          createdAt: item.chat_rooms?.created_at,
          role: item.role
        }))
        .filter((r) => r.id);

      setRooms(mapped);
      if (!activeRoom && mapped.length > 0) {
        setActiveRoom(mapped[0]);
      }
      setLoading(false);
    };
    loadRooms();
  }, [user]);

  useEffect(() => {
    const loadRoomData = async () => {
      if (!activeRoom?.id) return;
      setLoading(true);
      const { data: membersData } = await supabase
        .from('chat_room_members')
        .select('user_id, role')
        .eq('room_id', activeRoom.id);

      const { data: messagesData } = await supabase
        .from('chat_messages')
        .select('id, room_id, user_id, content, attachment_url, attachment_name, attachment_type, attachment_size, created_at')
        .eq('room_id', activeRoom.id)
        .order('created_at', { ascending: true });

      setMembers(
        (membersData || []).map((m) => ({
          userId: m.user_id,
          role: m.role,
          profile: profileLookup.get(m.user_id) || null
        }))
      );

      const enriched = (messagesData || []).map((msg) => ({
        ...msg,
        profile: profileLookup.get(msg.user_id) || null
      }));
      setMessages(enriched);
      setLoading(false);
    };
    loadRoomData();
  }, [activeRoom?.id, profileLookup]);

  useEffect(() => {
    if (!activeRoom?.id) return;
    const channel = supabase
      .channel(`chat-room-${activeRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${activeRoom.id}`
        },
        (payload) => {
          const incoming = payload.new;
          setMessages((prev) => {
            if (prev.find((m) => m.id === incoming.id)) return prev;
            return [
              ...prev,
              { ...incoming, profile: memberMap.get(incoming.user_id) || null }
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom?.id, memberMap]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !user?.id) return;
    setLoading(true);
    setStatus('');

    const { data: roomData, error: roomError } = await supabase
      .from('chat_rooms')
      .insert([{ name: newRoomName.trim(), created_by: user.id }])
      .select('id, name, created_by, created_at')
      .single();

    if (roomError || !roomData) {
      setStatus('Erro ao criar sala.');
      setLoading(false);
      return;
    }

    const membersToInsert = [
      { room_id: roomData.id, user_id: user.id, role: 'owner' },
      ...selectedMemberIds
        .filter((id) => id !== user.id)
        .map((id) => ({ room_id: roomData.id, user_id: id, role: 'member' }))
    ];

    await supabase.from('chat_room_members').insert(membersToInsert);

    setRooms((prev) => [
      ...prev,
      {
        id: roomData.id,
        name: roomData.name,
        createdBy: roomData.created_by,
        createdAt: roomData.created_at,
        role: 'owner'
      }
    ]);
    setActiveRoom({
      id: roomData.id,
      name: roomData.name,
      createdBy: roomData.created_by,
      createdAt: roomData.created_at,
      role: 'owner'
    });
    setNewRoomName('');
    setSelectedMemberIds([]);
    setShowCreateModal(false);
    setLoading(false);
  };

  const handleAddMembers = async () => {
    if (!activeRoom?.id || selectedMemberIds.length === 0) return;
    setLoading(true);
    const payload = selectedMemberIds.map((id) => ({
      room_id: activeRoom.id,
      user_id: id,
      role: 'member'
    }));
    await supabase.from('chat_room_members').insert(payload);
    setSelectedMemberIds([]);
    setShowMembersModal(false);
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!activeRoom?.id || (!messageText.trim() && !attachment) || !user?.id) return;
    setLoading(true);
    setStatus('');

    let attachmentUrl = null;
    let attachmentName = null;
    let attachmentType = null;
    let attachmentSize = null;

    if (attachment) {
      if (attachment.size > 10 * 1024 * 1024) {
        setStatus('Arquivo muito grande. Máximo 10MB.');
        setLoading(false);
        return;
      }

      const safeName = attachment.name.replace(/\s+/g, '-');
      const filePath = `rooms/${activeRoom.id}/${user.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, attachment);

      if (uploadError) {
        setStatus('Erro ao enviar arquivo.');
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      attachmentUrl = publicUrl;
      attachmentName = attachment.name;
      attachmentType = attachment.type;
      attachmentSize = attachment.size;
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert([{
        room_id: activeRoom.id,
        user_id: user.id,
        content: messageText.trim(),
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
        attachment_size: attachmentSize
      }]);

    if (error) {
      setStatus('Erro ao enviar mensagem.');
    } else {
      setMessageText('');
      setAttachment(null);
    }
    setLoading(false);
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString('pt-BR');
  };

  const availableProfiles = profiles.filter((p) => !members.find((m) => m.userId === p.id));

  return (
    <div className="chat-page">
      <div className="admin-topbar chat-topbar">
        <Link to="/dashboard" className="admin-logo" aria-label="Voltar ao início">
          <img
            src="/logo-proteq.png"
            alt="PROTEQ Logo"
            className="admin-logo-image"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </Link>
        <ProfileMenu />
      </div>

      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <div className="chat-sidebar-title">
              <MessageCircle className="w-5 h-5" />
              <span>Conversas</span>
            </div>
            <button
              className="chat-action-button"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" />
              Nova sala
            </button>
          </div>

          <div className="chat-room-list">
            {rooms.length === 0 && (
              <p className="chat-empty">Nenhuma sala criada.</p>
            )}
            {rooms.map((room) => (
              <button
                key={room.id}
                className={`chat-room-item ${activeRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => setActiveRoom(room)}
              >
                <div className="chat-room-name">{room.name}</div>
                <div className="chat-room-meta">
                  {room.role === 'owner' ? 'Administrador' : 'Membro'}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="chat-main">
          {!activeRoom ? (
            <div className="chat-empty-state">
              <MessageCircle className="w-10 h-10" />
              <h2>Selecione uma sala</h2>
              <p>Crie ou escolha uma conversa para começar.</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div>
                  <h2>{activeRoom.name}</h2>
                  <p>{members.length} participantes</p>
                </div>
                <div className="chat-header-actions">
                  <button
                    className="chat-action-button ghost"
                    onClick={() => setShowMembersModal(true)}
                  >
                    <Users className="w-4 h-4" />
                    Adicionar membros
                  </button>
                </div>
              </div>

              <div className="chat-messages">
                {loading && <div className="chat-empty">Carregando...</div>}
                {!loading && messages.length === 0 && (
                  <div className="chat-empty">Nenhuma mensagem ainda.</div>
                )}
                {messages.map((msg) => {
                  const profile = msg.profile || memberMap.get(msg.user_id) || profileLookup.get(msg.user_id);
                  const initials = profile?.nome
                    ? profile.nome.split(' ')[0][0].toUpperCase()
                    : profile?.email?.[0]?.toUpperCase() || 'U';
                  const isOwn = msg.user_id === user?.id;
                  return (
                    <div key={msg.id} className={`chat-message ${isOwn ? 'own' : ''}`}>
                      <div className="chat-avatar">
                        {profile?.foto_url || profile?.avatar_url ? (
                          <img
                            src={profile.foto_url || profile.avatar_url}
                            alt={profile?.nome || profile?.email || 'Usuário'}
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="chat-bubble">
                        <div className="chat-bubble-header">
                          <span>{profile?.nome || profile?.email || 'Usuário'}</span>
                          <span>{formatDate(msg.created_at)}</span>
                        </div>
                        {msg.content && <p className="chat-text">{msg.content}</p>}
                        {msg.attachment_url && (
                          <a
                            href={msg.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="chat-attachment"
                          >
                            <Paperclip className="w-4 h-4" />
                            {msg.attachment_name || 'Arquivo'}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-composer">
                <button
                  className="chat-icon-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                />
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                />
                <button className="chat-send" onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                  Enviar
                </button>
              </div>
              {attachment && (
                <div className="chat-attachment-preview">
                  <span>{attachment.name}</span>
                  <button onClick={() => setAttachment(null)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {status && <div className="chat-status">{status}</div>}
            </>
          )}
        </main>
      </div>

      {showCreateModal && (
        <div className="chat-modal-backdrop">
          <div className="chat-modal">
            <div className="chat-modal-header">
              <h3>Criar sala</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="chat-modal-body">
              <label>Nome da sala</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Ex: Financeiro"
              />
              <label>Adicionar membros</label>
              <div className="chat-modal-list">
                {profiles.map((profile) => (
                  <label key={profile.id} className="chat-modal-item">
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.includes(profile.id)}
                      onChange={() => {
                        setSelectedMemberIds((prev) =>
                          prev.includes(profile.id)
                            ? prev.filter((id) => id !== profile.id)
                            : [...prev, profile.id]
                        );
                      }}
                    />
                    <span>{profile.nome || profile.email}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="chat-modal-actions">
              <button onClick={() => setShowCreateModal(false)} className="ghost">
                Cancelar
              </button>
              <button onClick={handleCreateRoom} className="primary" disabled={loading}>
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {showMembersModal && (
        <div className="chat-modal-backdrop">
          <div className="chat-modal">
            <div className="chat-modal-header">
              <h3>Adicionar membros</h3>
              <button onClick={() => setShowMembersModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="chat-modal-body">
              <label>Usuários disponíveis</label>
              <div className="chat-modal-list">
                {availableProfiles.length === 0 && (
                  <p className="chat-empty">Todos já estão na sala.</p>
                )}
                {availableProfiles.map((profile) => (
                  <label key={profile.id} className="chat-modal-item">
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.includes(profile.id)}
                      onChange={() => {
                        setSelectedMemberIds((prev) =>
                          prev.includes(profile.id)
                            ? prev.filter((id) => id !== profile.id)
                            : [...prev, profile.id]
                        );
                      }}
                    />
                    <span>{profile.nome || profile.email}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="chat-modal-actions">
              <button onClick={() => setShowMembersModal(false)} className="ghost">
                Cancelar
              </button>
              <button onClick={handleAddMembers} className="primary" disabled={loading}>
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
