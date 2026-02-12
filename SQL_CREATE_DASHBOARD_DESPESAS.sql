-- Correct table for Dashboard expense distribution
-- Schema aligned with DashboardAprimorado (categoria, valor, tipo)

create extension if not exists pgcrypto;

create table if not exists dashboard_despesas (
  id uuid primary key default gen_random_uuid(),
  categoria text not null,
  valor numeric(14,2) not null default 0,
  tipo text not null default 'fixa' check (tipo in ('fixa', 'variavel')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dashboard_despesas_created_at
  on dashboard_despesas(created_at);

create or replace function set_dashboard_despesas_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_dashboard_despesas_updated_at on dashboard_despesas;
create trigger trg_dashboard_despesas_updated_at
before update on dashboard_despesas
for each row
execute function set_dashboard_despesas_updated_at();
