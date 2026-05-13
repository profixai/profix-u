-- Invoices table
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  property_id text not null default 'demo',
  file_path text not null,
  file_name text,
  status text not null default 'pending_extraction',
  vendor jsonb,
  invoice_number jsonb,
  amount jsonb,
  invoice_date jsonb,
  due_date jsonb,
  gl_code jsonb,
  splits jsonb,
  raw_extraction jsonb,
  error text,
  uploaded_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

-- Mock-auth era: permissive policies. Tighten once Supabase auth lands.
create policy "invoices_select_all" on public.invoices for select using (true);
create policy "invoices_insert_all" on public.invoices for insert with check (true);
create policy "invoices_update_all" on public.invoices for update using (true);
create policy "invoices_delete_all" on public.invoices for delete using (true);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

-- Storage bucket (private)
insert into storage.buckets (id, name, public) values ('invoices', 'invoices', false)
on conflict (id) do nothing;

create policy "invoices_storage_read" on storage.objects for select using (bucket_id = 'invoices');
create policy "invoices_storage_insert" on storage.objects for insert with check (bucket_id = 'invoices');
create policy "invoices_storage_update" on storage.objects for update using (bucket_id = 'invoices');
create policy "invoices_storage_delete" on storage.objects for delete using (bucket_id = 'invoices');