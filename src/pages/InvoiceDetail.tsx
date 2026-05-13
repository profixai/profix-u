import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { InvoiceLayout } from "@/components/invoices/InvoiceLayout";
import { InvoiceHeader } from "@/components/invoices/InvoiceHeader";
import { InvoiceViewer } from "@/components/invoices/InvoiceViewer";
import { ExtractedDataCard } from "@/components/invoices/ExtractedDataCard";
import { getInvoice, getSignedUrl, rowToExtraction, type InvoiceRow } from "@/lib/invoices-api";
import { supabase } from "@/integrations/supabase/client";

export default function InvoiceDetail() {
  const { id = "" } = useParams();
  const [row, setRow] = useState<InvoiceRow | null>(null);
  const [src, setSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const r = await getInvoice(id);
      if (cancelled) return;
      setRow(r);
      if (r) {
        try { setSrc(await getSignedUrl(r.file_path)); } catch { setSrc(""); }
      }
      setLoading(false);
    };
    load();
    const ch = supabase
      .channel(`invoice-${id}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "invoices", filter: `id=eq.${id}` },
        (p) => setRow(p.new as InvoiceRow))
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [id]);

  if (loading) {
    return (
      <InvoiceLayout>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
        </div>
      </InvoiceLayout>
    );
  }

  if (!row) {
    return (
      <InvoiceLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm">
          <div className="text-muted-foreground">Invoice not found.</div>
          <Link to="/invoices"><Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back to inbox</Button></Link>
        </div>
      </InvoiceLayout>
    );
  }

  const extraction = rowToExtraction(row, src);
  const isExtracting = row.status === "pending_extraction";

  return (
    <InvoiceLayout>
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <Link to="/invoices"><Button variant="ghost" size="sm" className="h-8"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Inbox</Button></Link>
      </div>
      <InvoiceHeader invoice={extraction} />
      <div className="flex-1 overflow-hidden p-4">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg">
          <ResizablePanel defaultSize={55} minSize={35}>
            <div className="h-full pr-2">
              {src ? <InvoiceViewer src={src} /> : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No preview</div>
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={45} minSize={30}>
            <div className="h-full pl-2">
              {isExtracting ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Extracting fields with AI…
                </div>
              ) : (
                <ExtractedDataCard invoice={extraction} />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </InvoiceLayout>
  );
}
