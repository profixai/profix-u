
CREATE TABLE public.invoice_extraction_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'started',
  model text,
  error text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  duration_ms integer,
  triggered_by text
);

CREATE INDEX idx_iea_invoice_id ON public.invoice_extraction_attempts(invoice_id, started_at DESC);

ALTER TABLE public.invoice_extraction_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY iea_select_all ON public.invoice_extraction_attempts FOR SELECT USING (true);
CREATE POLICY iea_insert_all ON public.invoice_extraction_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY iea_update_all ON public.invoice_extraction_attempts FOR UPDATE USING (true);
CREATE POLICY iea_delete_all ON public.invoice_extraction_attempts FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.invoice_extraction_attempts;
ALTER TABLE public.invoice_extraction_attempts REPLICA IDENTITY FULL;
