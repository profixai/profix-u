import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { PackagingTiers } from "@/components/saas/PackagingTiers";
import { packageTiers } from "@/lib/saas-data";
import { useTier } from "@/contexts/TierContext";
import type { Tier } from "@/lib/saas-types";
import { toast } from "sonner";

const tierLabel: Record<Tier, string> = { free: "Free", team: "Team", enterprise: "Enterprise" };

const Upgrade = () => {
  const navigate = useNavigate();
  const { tier, setTier } = useTier();

  const handleSelect = (next: Tier) => {
    if (next === "enterprise") {
      toast.success("Sales team will reach out within 1 business day.");
      return;
    }
    if (next === tier) return;
    // In production: redirect to Stripe Checkout. For now, simulate upgrade.
    setTier(next);
    toast.success(`You're now on the ${tierLabel[next]} plan. Premium features unlocked.`);
    setTimeout(() => navigate(-1), 800);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
          <span className="text-[11px] text-muted-foreground">
            Current plan: <strong className="text-foreground">{tierLabel[tier]}</strong>
          </span>
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] text-primary">
            <Sparkles className="h-3 w-3" /> Unlock advanced workflows
          </div>
          <h1 className="text-2xl font-semibold">Choose the plan that fits your operation</h1>
          <p className="text-sm text-muted-foreground">
            Upgrade to access AI Insights, Ask Profix, full P&L history, CSV exports, and team collaboration.
          </p>
        </div>

        <PackagingTiers tiers={packageTiers} onSelect={handleSelect} currentTier={tier} />

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3">What you unlock with Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {[
              "AI-powered variance detection and natural-language insights",
              "Ask Profix conversational analyst",
              "Full 12-month P&L history with month-over-month comparison",
              "CSV export of every report",
              "Telegram alerts on critical thresholds",
              "Up to 5 properties with portfolio benchmarking",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-positive mt-0.5 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </Card>

        <p className="text-[11px] text-muted-foreground text-center">
          Billing is monthly and cancellable anytime. Need procurement, SSO, or audit-ready reporting? Contact sales for Enterprise.
        </p>
      </div>
    </AppShell>
  );
};

export default Upgrade;
