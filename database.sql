-- Remover tabelas existentes e suas dependências
DROP TABLE IF EXISTS points_log CASCADE;
DROP TABLE IF EXISTS monthly_history CASCADE;
DROP TABLE IF EXISTS monthly_points_history CASCADE;
DROP TABLE IF EXISTS participants CASCADE;

-- Criar tabela de participantes
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tag VARCHAR(50),
    points INTEGER DEFAULT 0,
    image_url TEXT,
    spreadsheet_id TEXT,
    spreadsheet_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de histórico mensal de pontos
CREATE TABLE monthly_points_history (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER REFERENCES participants(id),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(participant_id, month, year)
);

-- Criar índices para melhor performance
CREATE INDEX idx_participants_points ON participants(points DESC);
CREATE INDEX idx_monthly_points_history_participant ON monthly_points_history(participant_id);
CREATE INDEX idx_monthly_points_history_date ON monthly_points_history(year DESC, month DESC);

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar o updated_at
CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
alter table public.participants enable row level security;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir leitura para todos" ON public.participants;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON public.participants;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON public.participants;
DROP POLICY IF EXISTS "Permitir deleção para usuários autenticados" ON public.participants;

-- Criar políticas de acesso
-- Permitir leitura para todos
create policy "Permitir leitura para todos"
  on public.participants for select
  using (true);

-- Permitir inserção apenas para usuários autenticados
create policy "Permitir inserção para usuários autenticados"
  on public.participants for insert
  with check (auth.role() = 'authenticated');

-- Permitir atualização apenas para usuários autenticados
create policy "Permitir atualização para usuários autenticados"
  on public.participants for update
  using (auth.role() = 'authenticated');

-- Permitir deleção apenas para usuários autenticados
create policy "Permitir deleção para usuários autenticados"
  on public.participants for delete
  using (auth.role() = 'authenticated');

-- Criar bucket para armazenamento de imagens (se ainda não existir)
insert into storage.buckets (id, name, public)
select 'participants', 'participants', true
where not exists (
  select 1 from storage.buckets where id = 'participants'
);

-- Remover políticas de armazenamento existentes
DROP POLICY IF EXISTS "Imagens públicas para leitura" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de imagens para usuários autenticados" ON storage.objects;

-- Criar política de armazenamento para imagens
create policy "Imagens públicas para leitura"
  on storage.objects for select
  using ( bucket_id = 'participants' );

create policy "Permitir upload de imagens para usuários autenticados"
  on storage.objects for insert
  with check ( bucket_id = 'participants' AND auth.role() = 'authenticated' ); 