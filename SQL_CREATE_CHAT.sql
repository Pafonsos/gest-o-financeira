-- ============================================
-- CHAT: grupos + mensagens + anexos
-- Execute no SQL Editor do Supabase
-- ============================================

-- Extensões úteis
create extension if not exists "pgcrypto";

-- Tabelas
create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_room_members (
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text,
  attachment_url text,
  attachment_name text,
  attachment_type text,
  attachment_size integer,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.chat_rooms enable row level security;
alter table public.chat_room_members enable row level security;
alter table public.chat_messages enable row level security;

-- Policies: chat_rooms
do $$
begin
  create policy "chat_rooms_select_members"
    on public.chat_rooms for select
    using (
      exists (
        select 1 from public.chat_room_members m
        where m.room_id = chat_rooms.id
          and m.user_id = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "chat_rooms_select_owner"
    on public.chat_rooms for select
    using (auth.uid() = created_by);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "chat_rooms_insert_owner"
    on public.chat_rooms for insert
    with check (auth.uid() = created_by);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "chat_rooms_update_owner"
    on public.chat_rooms for update
    using (auth.uid() = created_by);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "chat_rooms_delete_owner"
    on public.chat_rooms for delete
    using (auth.uid() = created_by);
exception when duplicate_object then null;
end $$;

-- Policies: chat_room_members
drop policy if exists "chat_members_select_members" on public.chat_room_members;
do $$
begin
  create policy "chat_members_select_members"
    on public.chat_room_members for select
    using (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "chat_members_insert_owner"
    on public.chat_room_members for insert
    with check (
      exists (
        select 1 from public.chat_rooms r
        where r.id = chat_room_members.room_id
          and r.created_by = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "chat_members_delete_owner"
    on public.chat_room_members for delete
    using (
      exists (
        select 1 from public.chat_rooms r
        where r.id = chat_room_members.room_id
          and r.created_by = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

-- Policies: chat_messages
do $$
begin
  create policy "chat_messages_select_members"
    on public.chat_messages for select
    using (
      exists (
        select 1 from public.chat_room_members m
        where m.room_id = chat_messages.room_id
          and m.user_id = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "chat_messages_insert_members"
    on public.chat_messages for insert
    with check (
      auth.uid() = user_id
      and exists (
        select 1 from public.chat_room_members m
        where m.room_id = chat_messages.room_id
          and m.user_id = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "chat_messages_update_owner"
    on public.chat_messages for update
    using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "chat_messages_delete_owner"
    on public.chat_messages for delete
    using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- Profiles: leitura para usuários autenticados (se já existir, ignore)
do $$
begin
  create policy "profiles_select_authenticated"
    on public.profiles for select
    using (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

-- ============================================
-- Storage: crie o bucket "chat-files" como PUBLIC
-- Depois, habilite policies para upload/download (UI do Supabase)
-- ============================================
