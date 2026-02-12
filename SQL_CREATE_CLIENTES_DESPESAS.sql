-- Criar tabelas compartilhadas de clientes e despesas (sem RLS)

create extension if not exists pgcrypto;

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  legacy_id integer unique,
  pipefy_card_id text,
  nome_responsavel text not null,
  nome_empresa text not null,
  nome_fantasia text,
  email text,
  telefone text,
  cnpj text,
  cpf text,
  codigo_contrato text,
  contrato_nome text,
  contrato_data_url text,
  link_pagamento text,
  valor_total numeric(14,2) not null default 0,
  valor_pago numeric(14,2) not null default 0,
  parcelas integer not null default 1,
  parcelas_pagas integer not null default 0,
  valor_parcela numeric(14,2) not null default 0,
  data_venda date,
  proximo_vencimento date,
  observacoes text,
  historicos_pagamentos jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table clientes add column if not exists legacy_id integer;
alter table clientes add column if not exists pipefy_card_id text;
alter table clientes add column if not exists nome_responsavel text;
alter table clientes add column if not exists nome_empresa text;
alter table clientes add column if not exists nome_fantasia text;
alter table clientes add column if not exists email text;
alter table clientes add column if not exists telefone text;
alter table clientes add column if not exists cnpj text;
alter table clientes add column if not exists cpf text;
alter table clientes add column if not exists codigo_contrato text;
alter table clientes add column if not exists contrato_nome text;
alter table clientes add column if not exists contrato_data_url text;
alter table clientes add column if not exists link_pagamento text;
alter table clientes add column if not exists valor_total numeric(14,2) default 0;
alter table clientes add column if not exists valor_pago numeric(14,2) default 0;
alter table clientes add column if not exists parcelas integer default 1;
alter table clientes add column if not exists parcelas_pagas integer default 0;
alter table clientes add column if not exists valor_parcela numeric(14,2) default 0;
alter table clientes add column if not exists data_venda date;
alter table clientes add column if not exists proximo_vencimento date;
alter table clientes add column if not exists observacoes text;
alter table clientes add column if not exists historicos_pagamentos jsonb default '[]';
alter table clientes add column if not exists created_at timestamptz default now();
alter table clientes add column if not exists updated_at timestamptz default now();

-- Compatibilidade com schema legado:
-- 1) Projeto usa cnpj, mas tabela antiga tinha cpf_cnpj.
alter table clientes add column if not exists cnpj text;
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clientes'
      and column_name = 'cpf_cnpj'
  ) then
    update clientes
    set cnpj = cpf_cnpj
    where cnpj is null
      and cpf_cnpj is not null;
  end if;
end
$$;

-- 2) Projeto atual não envia user_id ao inserir cliente.
--    Se a coluna existir e estiver NOT NULL, remove a obrigatoriedade.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clientes'
      and column_name = 'user_id'
      and is_nullable = 'NO'
  ) then
    alter table clientes alter column user_id drop not null;
  end if;
end
$$;

alter table clientes alter column valor_total set default 0;
alter table clientes alter column valor_pago set default 0;
alter table clientes alter column parcelas set default 1;
alter table clientes alter column parcelas_pagas set default 0;
alter table clientes alter column valor_parcela set default 0;
alter table clientes alter column historicos_pagamentos set default '[]';
alter table clientes alter column created_at set default now();
alter table clientes alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clientes_legacy_id_unique'
  ) then
    alter table clientes
      add constraint clientes_legacy_id_unique unique (legacy_id);
  end if;
end
$$;

create unique index if not exists clientes_pipefy_card_id_unique
  on clientes(pipefy_card_id)
  where pipefy_card_id is not null;

create table if not exists despesas (
  id uuid primary key default gen_random_uuid(),
  fornecedor text not null,
  descricao text,
  valor numeric(14,2) not null,
  vencimento date not null,
  pago boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table despesas add column if not exists fornecedor text;
alter table despesas add column if not exists descricao text;
alter table despesas add column if not exists valor numeric(14,2);
alter table despesas add column if not exists vencimento date;
alter table despesas add column if not exists pago boolean default false;
alter table despesas add column if not exists created_at timestamptz default now();
alter table despesas add column if not exists updated_at timestamptz default now();

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_clientes_updated_at on clientes;
create trigger set_clientes_updated_at
before update on clientes
for each row execute function set_updated_at();

drop trigger if exists set_despesas_updated_at on despesas;
create trigger set_despesas_updated_at
before update on despesas
for each row execute function set_updated_at();
