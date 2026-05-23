-- Lock down invoices table to authenticated users only
DROP POLICY IF EXISTS "invoices_select_all" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert_all" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update_all" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete_all" ON public.invoices;

CREATE POLICY "invoices_select_authenticated"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "invoices_insert_authenticated"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "invoices_update_authenticated"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "invoices_delete_authenticated"
  ON public.invoices FOR DELETE
  TO authenticated
  USING (true);

-- Lock down invoice_extraction_attempts SELECT to authenticated only
DROP POLICY IF EXISTS "invoice_extraction_attempts_select_public" ON public.invoice_extraction_attempts;

CREATE POLICY "invoice_extraction_attempts_select_authenticated"
  ON public.invoice_extraction_attempts FOR SELECT
  TO authenticated
  USING (true);

-- Lock down 'invoices' storage bucket to authenticated users only
DROP POLICY IF EXISTS "invoices_storage_read" ON storage.objects;
DROP POLICY IF EXISTS "invoices_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "invoices_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "invoices_storage_delete" ON storage.objects;

CREATE POLICY "invoices_storage_read_auth"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'invoices');

CREATE POLICY "invoices_storage_insert_auth"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'invoices');

CREATE POLICY "invoices_storage_update_auth"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'invoices')
  WITH CHECK (bucket_id = 'invoices');

CREATE POLICY "invoices_storage_delete_auth"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'invoices');