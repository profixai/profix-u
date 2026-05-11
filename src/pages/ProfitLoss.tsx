import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  TrendingUp, TrendingDown, ChevronDown, ChevronRight,
  AlertTriangle, Download, X, Send,
} from "lucide-react";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { usePL } from "@/hooks/usePL";
import { PLRow as PLRowType } from "@/services/api";
import { sendTelegramMessage, formatInsightMessage, getTelegramConfig } from "@/services/telegram";
import { toast } from "sonner";
import { useProperty } from "@/contexts/PropertyContext";
import { useTier } from "@/contexts/TierContext";
import { Lock } from "lucide-react";

const fmt = (v: number, f: string) => {
  if (f === "pct") return `${v}%`;
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v}`;
};

const MiniSparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 20;
  const w = 60;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
    </svg>
  );
};

const PLRowComponent = ({ row, depth = 0 }: { row: PLRowType; depth?: number }) => {
  const [open, setOpen] = useState(false);
  const variance = row.actual - row.budget;
  const variancePct = row.budget ? ((variance / row.budget) * 100).toFixed(1) : "0.0";
  const isPositive = variance >= 0;

  return (
    <>
      <TableRow className={row.isSummary ? "bg-muted/50 font-semibold" : ""}>
        <TableCell style={{ paddingLeft: `${depth * 20 + 12}px` }} className="flex items-center gap-1">
          {row.children ? (
            <button onClick={() => setOpen(!open)} className="p-0.5 hover:bg-muted rounded">
              {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="w-4" />
          )}
          <span className="text-xs">{row.label}</span>
        </TableCell>
        <TableCell className="text-right font-mono-data text-xs">€{row.actual.toLocaleString()}</TableCell>
        <TableCell className="text-right font-mono-data text-xs text-muted-foreground">€{row.budget.toLocaleString()}</TableCell>
        <TableCell className={`text-right font-mono-data text-xs ${isPositive ? "text-positive" : "text-destructive"}`}>
          {isPositive ? "+" : ""}€{variance.toLocaleString()}
        </TableCell>
        <TableCell className={`text-right font-mono-data text-xs ${isPositive ? "text-positive" : "text-destructive"}`}>
          {isPositive ? "+" : ""}{variancePct}%
        </TableCell>
        <TableCell className="text-center">
          <MiniSparkline data={row.sparkline} />
        </TableCell>
      </TableRow>
      {open && row.children?.map((child) => (
        <PLRowComponent key={child.id} row={child} depth={depth + 1} />
      ))}
    </>
  );
};

const FB_THRESHOLD = 32;

const ProfitLoss = () => {
  const { propertyId, period, setPeriod } = useProperty();
  const [month, setMonth] = useState(period.month);
  const [showBanner, setShowBanner] = useState(true);
  const navigate = useNavigate();
  const { hasTier } = useTier();
  const hasHistory = hasTier("team");
  const canExport = hasTier("team");

  const { data, loading, error } = usePL({
    property: propertyId,
    year: period.year,
    month,
    period: period.granularity,
  });

  const fbCostKpi = data?.kpis.find((k) => k.label === "F&B Cost %");
  const fbCostPct = fbCostKpi?.value ?? 0;
  const bannerVisible = showBanner && fbCostPct > FB_THRESHOLD;

  const exportCSV = () => {
    if (!data) return;
    if (!canExport) {
      navigate("/upgrade");
      return;
    }
    const headers = ["Line Item", "Actual", "Budget", "Variance €", "Variance %"];
    const flatten = (rows: PLRowType[]): string[][] =>
      rows.flatMap((r) => {
        const v = r.actual - r.budget;
        const vp = r.budget ? ((v / r.budget) * 100).toFixed(1) : "0.0";
        const line = [r.label, r.actual.toString(), r.budget.toString(), v.toString(), `${vp}%`];
        return [line, ...(r.children ? flatten(r.children) : [])];
      });
    const csv = [headers, ...flatten(data.rows)].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pl_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendBannerTelegram = async () => {
    const config = getTelegramConfig();
    if (!config) {
      toast.error("Telegram not configured. Go to Settings → Notifications.");
      return;
    }
    const message = formatInsightMessage({
      severity: "critical",
      title: `F&B Cost % at ${fbCostPct}%`,
      metric: "F&B Cost %",
      actual: fbCostPct,
      threshold: FB_THRESHOLD,
      recommendation: "Review cost-of-sales and portion control.",
    });
    const success = await sendTelegramMessage(message);
    toast(success ? "Sent to Telegram" : "Send failed — check Settings.");
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Sticky filter bar — period tabs + month + export */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pb-3 pt-1 flex flex-wrap items-center gap-3 border-b">
          <Tabs
            value={period.granularity}
            onValueChange={(v) => setPeriod({ ...period, granularity: v as any })}
          >
            <TabsList className="h-8">
              <TabsTrigger value="daily" className="text-xs px-3 h-6">Daily</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3 h-6">Monthly</TabsTrigger>
              <TabsTrigger value="ytd" className="text-xs px-3 h-6">YTD</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={month} onValueChange={hasHistory ? setMonth : () => navigate("/upgrade")}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => {
                const locked = !hasHistory && m.toLowerCase() !== month;
                return (
                  <SelectItem key={m} value={m.toLowerCase()} disabled={locked}>
                    <span className="inline-flex items-center gap-1.5">
                      {m}
                      {locked && <Lock className="h-2.5 w-2.5 text-muted-foreground" />}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {!hasHistory && (
            <button
              onClick={() => navigate("/upgrade")}
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted transition"
            >
              <Lock className="h-3 w-3" /> 12-month history — Team
            </button>
          )}

          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={exportCSV}
              disabled={loading}
              title={canExport ? "Download CSV" : "Upgrade to Team to export"}
            >
              {canExport ? <Download className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              Export CSV
            </Button>
          </div>
        </div>

        {/* AI Insight banner */}
        {bannerVisible && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-xs text-foreground flex-1">
              <strong>F&B Cost %</strong> is at {fbCostPct}%, exceeding the {FB_THRESHOLD}% threshold. Review cost-of-sales and portion control.
            </p>
            <Button variant="outline" size="sm" className="h-7 text-xs">Review</Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleSendBannerTelegram}>
              <Send className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <button onClick={() => setShowBanner(false)} className="p-1 hover:bg-muted rounded">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Content states */}
        {loading ? (
          <LoadingState message="Loading P&L data…" rows={8} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : !data ? (
          <EmptyState
            message="No P&L data available. Upload a financial report to get started."
            actionLabel="Upload Data"
            onAction={() => navigate("/data")}
          />
        ) : (
          <>
            {/* KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {data.kpis.map((kpi) => {
                const delta = kpi.budget ? ((kpi.value - kpi.budget) / kpi.budget * 100).toFixed(1) : "0.0";
                const positive = kpi.value >= kpi.budget;
                const isCost = kpi.label.includes("Cost");
                const isGood = isCost ? !positive : positive;

                return (
                  <Card key={kpi.label} className="p-3 space-y-1">
                    <p className="text-[10px] text-muted-foreground font-medium truncate">{kpi.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold font-mono-data">{fmt(kpi.value, kpi.format)}</span>
                      {isGood ? (
                        <TrendingUp className="h-3 w-3 text-positive" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${isGood ? "text-positive border-positive/30" : "text-destructive border-destructive/30"}`}>
                      {positive ? "+" : ""}{delta}% vs budget
                    </Badge>
                  </Card>
                );
              })}
            </div>

            {/* P&L Table */}
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[240px]">Line Item</TableHead>
                    <TableHead className="text-xs text-right w-[100px]">Actual</TableHead>
                    <TableHead className="text-xs text-right w-[100px]">Budget</TableHead>
                    <TableHead className="text-xs text-right w-[100px]">Var €</TableHead>
                    <TableHead className="text-xs text-right w-[80px]">Var %</TableHead>
                    <TableHead className="text-xs text-center w-[80px]">6-Mo Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((row) => (
                    <PLRowComponent key={row.id} row={row} />
                  ))}
                </TableBody>
              </Table>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default ProfitLoss;
