import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InvoiceLayout } from "@/components/invoices/InvoiceLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { listInvoices, uploadInvoice, type InvoiceRow } from "@/lib/invoices-api";
import { supabase } from "@/integrations/supabase/client";

const statusLabel: Record<string, { label: string; tone: string }> = {
  pending_extraction: { label: "Extracting…", tone: "bg-muted text-foreground" },
  pending_approval: { label: "Pending approval", tone: "bg-primary/15 text-primary" },
  approved: { label: "Approved", tone: "bg-emerald-500/15 text-emerald-300" },
  rejected: { label: "Rejected", tone: "bg-destructive/15 text-destructive" },
  extraction_failed: { label: "Extraction failed", tone: "bg-destructive/15 text-destructive" },
};

export default function InvoicesInbox() {
  const { user } = useAuth();
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setRows(await listInvoices());
    } catch (e) {
      toast.error("Failed to load invoices");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("invoices-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        await uploadInvoice(f, user?.username ?? "unknown");
      }
      toast.success(`Uploaded ${files.length} invoice${files.length > 1 ? "s" : ""}. Extracting…`);
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <InvoiceLayout>
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h1 className="text-base font-semibold tracking-tight">Invoices</h1>
          <p className="text-xs text-muted-foreground">Upload invoices to extract fields automatically with AI.</p>
        </div>
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Upload invoice
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <Card
            className="flex flex-col items-center justify-center gap-3 border-dashed p-12 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          >
            <FileText className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm font-medium">No invoices yet</div>
            <div className="text-xs text-muted-foreground">Drop a PDF or image here, or click upload.</div>
          </Card>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => {
              const s = statusLabel[r.status] ?? { label: r.status, tone: "bg-muted" };
              const vendor = r.vendor?.value ?? r.file_name ?? "—";
              const amount = typeof r.amount?.value === "number" ? r.amount.value : null;
              return (
                <Link key={r.id} to={`/invoices/${r.id}`}>
                  <Card className="flex items-center justify-between p-3 hover:bg-accent/40">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{vendor}</div>
                        <div className="truncate text-xs text-muted-foreground">{r.file_name ?? r.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {amount !== null && (
                        <span className="font-mono-data text-sm tabular-nums">
                          €{amount.toLocaleString()}
                        </span>
                      )}
                      <Badge className={`${s.tone} border-0`}>{s.label}</Badge>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </InvoiceLayout>
  );
}
