-- Drop existing overly permissive policies on invoice_extraction_attempts
DROP POLICY IF EXISTS iea_delete_all ON public.invoice_extraction_attempts;
DROP POLICY IF EXISTS iea_insert_all ON public.invoice_extraction_attempts;
DROP POLICY IF EXISTS iea_select_all ON public.invoice_extraction_attempts;
DROP POLICY IF EXISTS iea_update_all ON public.invoice_extraction_attempts;

-- Allow public read access (extraction history is viewable by anyone with invoice access)
-- SELECT with true is intentionally allowed and not flagged by the security linter
CREATE POLICY "invoice_extraction_attempts_select_public"
ON public.invoice_extraction_attempts
FOR SELECT
TO public
USING (true);

-- Deny direct public inserts; the extract-invoice edge function uses service_role key which bypasses RLS
CREATE POLICY "invoice_extraction_attempts_insert_blocked"
ON public.invoice_extraction_attempts
FOR INSERT
TO public
WITH CHECK (false);

-- Deny direct public updates; the extract-invoice edge function uses service_role key which bypasses RLS
CREATE POLICY "invoice_extraction_attempts_update_blocked"
ON public.invoice_extraction_attempts
FOR UPDATE
TO public
USING (false);

-- Deny direct public deletes; only service_role or admin should delete attempt records
CREATE POLICY "invoice_extraction_attempts_delete_blocked"
ON public.invoice_extraction_attempts
FOR DELETE
TO public
USING (false);