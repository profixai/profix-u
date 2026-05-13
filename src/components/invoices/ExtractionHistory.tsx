import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Attempt {
  id: string;
  status: string;
  model: string | null;
  error: string | null;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  triggered_by: string | null;
}

export function ExtractionHistory({ invoiceId }: { invoiceId: string }) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("invoice_extraction_attempts")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("started_at", { ascending: false })
        .limit(20);
      if (!cancelled) {
        setAttempts((data ?? []) as Attempt[]);
        setLoading(false);
      }
    };
    load();
    const ch = supabase
      .channel(`attempts-${invoiceId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "invoice_extraction_attempts", filter: `invoice_id=eq.${invoiceId}` },
        () => load())
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [invoiceId]);

  if (loading) {
    return <div className="text-xs text-muted-foreground">Loading history…</div>;
  }
  if (attempts.length === 0) {
    return <div className="text-xs text-muted-foreground">No extraction attempts recorded.</div>;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Extraction History ({attempts.length})
      </div>
      <ul className="space-y-1.5">
        {attempts.map((a) => {
          const Icon = a.status === "succeeded" ? CheckCircle2
            : a.status === "failed" ? XCircle
            : a.status === "started" ? Loader2 : Clock;
          const iconClass = a.status === "succeeded" ? "text-emerald-500"
            : a.status === "failed" ? "text-destructive"
            : "text-muted-foreground animate-spin";
          return (
            <li key={a.id} className="rounded-md border border-border bg-card/50 px-3 py-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
                  <span className="font-medium capitalize">{a.status}</span>
                  {a.triggered_by && (
                    <span className="text-muted-foreground">· {a.triggered_by}</span>
                  )}
                </div>
                <span className="text-muted-foreground" title={new Date(a.started_at).toLocaleString()}>
                  {formatDistanceToNow(new Date(a.started_at), { addSuffix: true })}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground">
                {a.model && <span>{a.model}</span>}
                {a.duration_ms != null && <span>{(a.duration_ms / 1000).toFixed(1)}s</span>}
              </div>
              {a.error && (
                <div className="mt-1 rounded bg-destructive/10 px-2 py-1 text-destructive break-words">
                  {a.error}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
