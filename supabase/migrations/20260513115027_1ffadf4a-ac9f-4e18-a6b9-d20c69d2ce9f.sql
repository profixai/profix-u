alter table public.invoices replica identity full;
alter publication supabase_realtime add table public.invoices;