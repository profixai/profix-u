import { supabase } from "@/integrations/supabase/client";
import type { InvoiceExtraction, InvoiceStatus, USALISplit } from "./mock-invoices";

export interface InvoiceRow {
  id: string;
  property_id: string;
  file_path: string;
  file_name: string | null;
  status: string;
  vendor: any;
  invoice_number: any;
  amount: any;
  invoice_date: any;
  due_date: any;
  gl_code: any;
  splits: any;
  error: string | null;
  created_at: string;
}

const fwc = <T,>(v: any, fallback: T): { value: T; confidence: number } => ({
  value: (v?.value ?? fallback) as T,
  confidence: typeof v?.confidence === "number" ? v.confidence : 0,
});

export function rowToExtraction(row: InvoiceRow, documentSrc: string): InvoiceExtraction {
  const status: InvoiceStatus =
    row.status === "approved" ? "approved" :
    row.status === "rejected" ? "rejected" : "pending_approval";
  const splits: USALISplit[] = Array.isArray(row.splits) ? row.splits.map((s: any, i: number) => ({
    id: s.id ?? `split-${i + 1}`,
    percent: typeof s.percent === "number" ? s.percent : 100,
    category: fwc(s.category, ""),
    subcategory: fwc(s.subcategory, ""),
  })) : [];
  return {
    id: row.id,
    status,
    vendor: fwc(row.vendor, row.file_name ?? "—"),
    invoiceNumber: fwc(row.invoice_number, row.id.slice(0, 8)),
    amount: fwc<number>(row.amount, 0),
    invoiceDate: fwc(row.invoice_date, ""),
    dueDate: fwc(row.due_date, ""),
    glCode: fwc(row.gl_code, ""),
    splits,
    documentSrc,
  };
}

export async function listInvoices(): Promise<InvoiceRow[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as InvoiceRow[];
}

export async function getInvoice(id: string): Promise<InvoiceRow | null> {
  const { data, error } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as InvoiceRow) ?? null;
}

export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from("invoices").createSignedUrl(path, 3600);
  if (error || !data) throw error ?? new Error("signed url failed");
  return data.signedUrl;
}

export async function uploadInvoice(file: File, uploadedBy: string): Promise<InvoiceRow> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("invoices").upload(path, file, {
    contentType: file.type || undefined,
  });
  if (upErr) throw upErr;

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      file_path: path,
      file_name: file.name,
      status: "pending_extraction",
      uploaded_by: uploadedBy,
    })
    .select("*")
    .single();
  if (error) throw error;

  // Trigger extraction (fire & forget)
  supabase.functions.invoke("extract-invoice", { body: { invoice_id: data.id, triggered_by: "upload" } })
    .catch((e) => console.error("extract-invoice invoke failed", e));

  return data as InvoiceRow;
}

export async function updateStatus(id: string, status: "approved" | "rejected") {
  const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function reExtractInvoice(id: string) {
  const { error } = await supabase
    .from("invoices")
    .update({ status: "pending_extraction", error: null, raw_extraction: null })
    .eq("id", id);
  if (error) throw error;

  supabase.functions.invoke("extract-invoice", { body: { invoice_id: id, triggered_by: "manual_rerun" } })
    .catch((e) => console.error("extract-invoice invoke failed", e));
}
