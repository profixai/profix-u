import { Bell, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useTier, type Tier } from "@/contexts/TierContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tierLabel: Record<Tier, string> = { free: "Free", team: "Team", enterprise: "Enterprise" };

export const TopBar = () => {
  const { user } = useAuth();
  const { tier, setTier } = useTier();
  const navigate = useNavigate();

  return (
    <header className="h-12 border-b bg-card flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-sm font-semibold text-foreground">Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted transition">
            <Crown className="h-3 w-3 text-primary" />
            {tierLabel[tier]} plan
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-[11px]">Demo: switch tier</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["free", "team", "enterprise"] as Tier[]).map((t) => (
              <DropdownMenuItem
                key={t}
                onClick={() => setTier(t)}
                className={`text-xs ${t === tier ? "font-semibold text-primary" : ""}`}
              >
                {tierLabel[t]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" onClick={() => navigate("/upgrade")}>
              See plans →
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <span className="text-xs text-muted-foreground hidden sm:block">
            {user.displayName}
          </span>
        )}
        <button className="relative p-1.5 rounded-md hover:bg-muted transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-semibold flex items-center justify-center text-destructive-foreground">
            3
          </span>
        </button>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs font-semibold text-muted-foreground">
            {user ? user.displayName.split(" ").map(w => w[0]).join("") : "?"}
          </span>
        </div>
      </div>
    </header>
  );
};
