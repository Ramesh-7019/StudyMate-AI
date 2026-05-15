
-- Move vector extension out of public
create schema if not exists extensions;
alter extension vector set schema extensions;

-- Re-create search function as SECURITY INVOKER (relies on RLS) and use the relocated vector type
create or replace function public.match_document_chunks(
  query_embedding extensions.vector(1536),
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
security invoker
set search_path = public, extensions
as $$
begin
  return query
  select c.id, c.document_id, c.content, c.page, c.chunk_index,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  where (match_document_id is null or c.document_id = match_document_id)
    and c.embedding is not null
  order by c.embedding <=> query_embedding
  limit match_count;
end;
$$;

revoke all on function public.match_document_chunks(extensions.vector, uuid, int) from public, anon;
grant execute on function public.match_document_chunks(extensions.vector, uuid, int) to authenticated;
