import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";
import { useTier, type Tier } from "@/contexts/TierContext";

interface TierGateProps {
  requires: Tier;
  children: ReactNode;
  feature?: string;
  /** Render a compact inline lock instead of a full card */
  compact?: boolean;
}

const tierLabel: Record<Tier, string> = {
  free: "Free",
  team: "Team",
  enterprise: "Enterprise",
};

export const TierGate = ({ requires, children, feature, compact }: TierGateProps) => {
  const { hasTier } = useTier();
  const navigate = useNavigate();
  if (hasTier(requires)) return <>{children}</>;

  if (compact) {
    return (
      <button
        onClick={() => navigate("/upgrade")}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted transition"
      >
        <Lock className="h-3 w-3" />
        {feature ?? "Locked"} — {tierLabel[requires]}
      </button>
    );
  }

  return (
    <Card className="flex flex-col items-center justify-center py-10 px-6 text-center border-dashed border-muted-foreground/20">
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center mb-3">
        <Lock className="h-4 w-4 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        {feature ? `${feature} — ` : ""}Available on {tierLabel[requires]} plan
      </h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Upgrade to unlock this capability for your team.
      </p>
      <Badge variant="outline" className="mt-3 text-[10px] text-muted-foreground border-muted-foreground/30">
        {tierLabel[requires]} tier
      </Badge>
      <Button
        size="sm"
        className="mt-3 text-xs gap-1.5"
        onClick={() => navigate("/upgrade")}
      >
        Upgrade to {tierLabel[requires]} <ArrowRight className="h-3 w-3" />
      </Button>
    </Card>
  );
};
