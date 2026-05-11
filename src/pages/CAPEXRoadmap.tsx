import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { AskProfixPanel } from "@/components/AskProfixPanel";
import { ExplainButton } from "@/components/ExplainButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { mockCAPEXActions, type CAPEXAction } from "@/lib/mock-data";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v}`;
};

const statusStyles: Record<string, string> = {
  "Planned": "bg-muted text-muted-foreground",
  "In Progress": "bg-accent/15 text-accent",
  "Deployed - Tracking": "bg-positive/10 text-positive",
};

function Sparkline({ predicted, actual }: { predicted: number[]; actual: number[] }) {
  if (actual.length === 0) return <span className="text-xs text-muted-foreground">—</span>;

  const data = predicted.map((p, i) => ({
    month: i + 1,
    predicted: p,
    actual: actual[i] ?? null,
  }));

  return (
    <div className="w-28 h-8 border border-solid">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line type="monotone" dataKey="predicted" stroke="hsl(35, 12%, 75%)" strokeWidth={1} strokeDasharray="3 3" dot={false} />
          <Line type="monotone" dataKey="actual" stroke="hsl(152, 63%, 29%)" strokeWidth={1.5} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CAPEXRoadmap() {
  const [askOpen, setAskOpen] = useState(false);

  const totalCapex = mockCAPEXActions.reduce((s, a) => s + a.capex, 0);
  const totalCO2 = mockCAPEXActions.reduce((s, a) => s + a.co2Reduction, 0);
  const totalWater = mockCAPEXActions.reduce((s, a) => s + a.waterSaving, 0);
  const deployed = mockCAPEXActions.filter((a) => a.status === "Deployed - Tracking").length;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Action & CAPEX Roadmap</h1>
            <p className="text-sm text-muted-foreground">
              Traceable interventions with predicted vs. actual savings
            </p>
          </div>
          <div className="flex gap-2">
            <ExplainButton onClick={() => setAskOpen(true)} />
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" /> Export CSV
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Add Action
            </Button>
          </div>
        </div>

        {/* Summary strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total CAPEX", value: formatCurrency(totalCapex) },
            { label: "CO₂ Reduction", value: `${(totalCO2 / 1000).toFixed(1)}t/yr` },
            { label: "Water Saving", value: `${totalWater} m³/yr` },
            { label: "Deployed & Tracking", value: `${deployed}/${mockCAPEXActions.length}` },
          ].map((m) => (
            <div key={m.label} className="bg-card rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-lg font-bold font-mono-data mt-0.5">{m.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-lg border overflow-x-auto"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground bg-muted/30">
                <th className="text-left py-3 px-4 font-medium">Action</th>
                <th className="text-left py-3 px-4 font-medium">Target</th>
                <th className="text-right py-3 px-4 font-medium">CAPEX (€)</th>
                <th className="text-right py-3 px-4 font-medium">Payback</th>
                <th className="text-left py-3 px-4 font-medium">Impact ROI</th>
                <th className="text-right py-3 px-4 font-medium">CO₂ kg/yr</th>
                <th className="text-right py-3 px-4 font-medium">Water m³/yr</th>
                <th className="text-center py-3 px-4 font-medium">Status</th>
                <th className="text-center py-3 px-4 font-medium">Predicted vs Actual</th>
              </tr>
            </thead>
            <tbody>
              {mockCAPEXActions.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-medium">{a.action}</span>
                    {a.deployedQuarter && (
                      <span className="block text-[10px] text-muted-foreground">Since {a.deployedQuarter}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px]">{a.materialityTarget}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-mono-data">
                    {a.capex > 0 ? formatCurrency(a.capex) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-data">
                    {a.financialROI > 0 ? `${a.financialROI}mo` : "—"}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{a.impactROI}</td>
                  <td className="py-3 px-4 text-right font-mono-data">
                    {a.co2Reduction > 0 ? a.co2Reduction.toLocaleString() : "—"}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-data">
                    {a.waterSaving > 0 ? a.waterSaving : "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${statusStyles[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex justify-center">
                    <Sparkline predicted={a.predicted} actual={a.actual} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      <AskProfixPanel
        externalOpen={askOpen}
        onClose={() => setAskOpen(false)}
        prefillQuestion="Summarise our CAPEX roadmap — which deployed actions are tracking ahead of predictions, and where should we invest next?"
        contextLabel="CAPEX Roadmap"
      />
    </AppShell>
  );
}
