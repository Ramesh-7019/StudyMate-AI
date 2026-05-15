
-- Enable pgvector
create extension if not exists vector;

-- Documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  file_path text not null,
  page_count int default 0,
  status text not null default 'processing', -- processing | ready | failed
  error text,
  created_at timestamptz not null default now()
);
create index on public.documents(user_id, created_at desc);
alter table public.documents enable row level security;

create policy "doc_select_own" on public.documents for select using (auth.uid() = user_id);
create policy "doc_insert_own" on public.documents for insert with check (auth.uid() = user_id);
create policy "doc_update_own" on public.documents for update using (auth.uid() = user_id);
create policy "doc_delete_own" on public.documents for delete using (auth.uid() = user_id);

-- Chunks (1536-dim openai-compatible embeddings)
create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null,
  chunk_index int not null,
  content text not null,
  page int,
  embedding vector(1536),
  created_at timestamptz not null default now()
);
create index on public.document_chunks(document_id);
create index on public.document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
alter table public.document_chunks enable row level security;

create policy "chunk_select_own" on public.document_chunks for select using (auth.uid() = user_id);
create policy "chunk_insert_own" on public.document_chunks for insert with check (auth.uid() = user_id);
create policy "chunk_delete_own" on public.document_chunks for delete using (auth.uid() = user_id);

-- Conversations
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  document_id uuid references public.documents(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.conversations(user_id, updated_at desc);
alter table public.conversations enable row level security;
create policy "conv_select_own" on public.conversations for select using (auth.uid() = user_id);
create policy "conv_insert_own" on public.conversations for insert with check (auth.uid() = user_id);
create policy "conv_update_own" on public.conversations for update using (auth.uid() = user_id);
create policy "conv_delete_own" on public.conversations for delete using (auth.uid() = user_id);

-- Messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  citations jsonb,
  created_at timestamptz not null default now()
);
create index on public.messages(conversation_id, created_at);
alter table public.messages enable row level security;
create policy "msg_select_own" on public.messages for select using (auth.uid() = user_id);
create policy "msg_insert_own" on public.messages for insert with check (auth.uid() = user_id);
create policy "msg_delete_own" on public.messages for delete using (auth.uid() = user_id);

-- Vector similarity search function (security definer; filters by user_id passed in)
create or replace function public.match_document_chunks(
  query_embedding vector(1536),
  match_user_id uuid,
  match_document_id uuid,
  match_count int default 6
) returns table (
  id uuid,
  document_id uuid,
  content text,
  page int,
  chunk_index int,
  similarity float
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select c.id, c.document_id, c.content, c.page, c.chunk_index,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  where c.user_id = match_user_id
    and (match_document_id is null or c.document_id = match_document_id)
    and c.embedding is not null
  order by c.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Private storage bucket for PDFs
insert into storage.buckets (id, name, public) values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;

-- Storage policies: users can only access files in a folder named with their user id
create policy "pdf_select_own" on storage.objects for select
  using (bucket_id = 'pdfs' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "pdf_insert_own" on storage.objects for insert
  with check (bucket_id = 'pdfs' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "pdf_delete_own" on storage.objects for delete
  using (bucket_id = 'pdfs' and auth.uid()::text = (storage.foldername(name))[1]);
