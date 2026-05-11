import { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { PackageTier, Tier } from "@/lib/saas-types";

interface Props {
  tiers: PackageTier[];
  onSelect?: (tier: Tier) => void;
  currentTier?: Tier;
}

export const PackagingTiers = forwardRef<HTMLDivElement, Props>(({ tiers, onSelect, currentTier }, ref) => (
  <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {tiers.map((t) => {
      const isCurrent = currentTier === t.tier;
      return (
        <Card
          key={t.tier}
          className={`p-5 flex flex-col ${
            t.highlighted ? "border-primary/40 ring-1 ring-primary/20 shadow-md" : ""
          } ${isCurrent ? "ring-2 ring-primary" : ""}`}
        >
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{t.name}</h3>
              {t.highlighted && (
                <Badge className="text-[9px] bg-primary text-primary-foreground">Most Popular</Badge>
              )}
              {isCurrent && (
                <Badge variant="outline" className="text-[9px]">Current plan</Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">{t.tagline}</p>
            <p className="text-xl font-semibold font-mono-data">
              {t.price}
              {t.price !== "Custom" && <span className="text-xs text-muted-foreground font-normal">/mo</span>}
            </p>
          </div>

          <ul className="space-y-2 flex-1 mb-4">
            {t.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-positive mt-0.5 shrink-0" />
                <span className="text-xs">{f}</span>
              </li>
            ))}
          </ul>

          <Button
            variant={t.highlighted ? "default" : "outline"}
            size="sm"
            className="w-full text-xs"
            disabled={isCurrent}
            onClick={() => onSelect?.(t.tier)}
          >
            {isCurrent ? "Current plan" : t.cta}
          </Button>
        </Card>
      );
    })}
  </div>
));

PackagingTiers.displayName = "PackagingTiers";
