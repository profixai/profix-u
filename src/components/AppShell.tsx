import { ReactNode, useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { AskProfixPanel } from "@/components/AskProfixPanel";
import { ContextBar } from "@/components/ContextBar";
import { GeoBg } from "@/components/GeoBg";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BarChart2,
  Sparkles,
  Settings,
  Upload,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
  Crown,
} from "lucide-react";
import { useTier, type Tier } from "@/contexts/TierContext";

const tierLabel: Record<Tier, string> = { free: "Free", team: "Team", enterprise: "Enterprise" };
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AskProfixContext {
  openAskProfix: (question: string, contextLabel: string) => void;
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
}

// ─── MVP-only navigation ──────────────────────────────────────
const navItems: NavItem[] = [
  { title: "Overview",   url: "/overview",   icon: LayoutDashboard, roles: ["manager", "direction"] },
  { title: "Dashboard",  url: "/dashboard",  icon: BarChart2,       roles: ["manager", "direction"] },
  { title: "P&L",        url: "/pl",         icon: BarChart2,       roles: ["manager", "direction"] },
  { title: "Insights",   url: "/insights",   icon: Sparkles,        roles: ["manager", "direction"] },
  { title: "Data Vault", url: "/data",       icon: Upload,          roles: ["manager", "direction", "inventory"] },
  { title: "Settings",   url: "/settings",   icon: Settings,        roles: ["manager", "direction", "inventory"] },
  { title: "Why Profix", url: "/why-profix", icon: Sparkles,        roles: ["direction"] },
];

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const { user, role, logout } = useAuth();
  const { tier, setTier } = useTier();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [prefill, setPrefill] = useState("");
  const [contextLabel, setContextLabel] = useState("");

  const openAskProfix = useCallback((question: string, label: string) => {
    setPrefill(question);
    setContextLabel(label);
    setAskOpen(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleNav = navItems.filter((item) => role && item.roles.includes(role));
  const isActive = (url: string) => location.pathname === url;

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <GeoBg />

      {/* ── Top Header ──────────────────────────────────────── */}
      <header className="h-14 border-b bg-card/80 backdrop-blur flex items-center justify-between px-4 lg:px-6 shrink-0 z-20 relative">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-widest text-foreground">
              PROFi<span className="text-primary">X</span>
            </span>
          </Link>
        </div>

        {/* ── Primary Nav (desktop) ─────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1">
          {visibleNav.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isActive(item.url)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* ── Right section ─────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-md border bg-background/60 px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary transition">
                <Crown className="h-3 w-3 text-primary" />
                {tierLabel[tier]} plan
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <div className="px-2 py-1.5 border-b">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Demo: switch tier</p>
              </div>
              {(["free", "team", "enterprise"] as Tier[]).map((t) => (
                <DropdownMenuItem
                  key={t}
                  onClick={() => setTier(t)}
                  className={`text-xs ${t === tier ? "font-semibold text-primary" : ""}`}
                >
                  {tierLabel[t]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="text-xs border-t" onClick={() => navigate("/upgrade")}>
                See plans →
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="relative p-1.5 rounded-md hover:bg-secondary transition-colors">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-semibold flex items-center justify-center text-destructive-foreground">
              3
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 p-1 rounded-md hover:bg-secondary transition-colors">
                <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-primary">
                    {user ? user.displayName.split(" ").map((w) => w[0]).join("") : "?"}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user && (
                <div className="px-2 py-1.5 border-b">
                  <p className="text-xs font-medium">{user.displayName}</p>
                  <p className="text-[10px] text-muted-foreground">{role}</p>
                </div>
              )}
              <DropdownMenuItem className="text-xs" onClick={() => navigate("/settings")}>
                <Settings className="h-3.5 w-3.5 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-destructive" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Mobile Nav ──────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b bg-card/90 backdrop-blur px-4 py-3 space-y-1 z-10 relative">
          {visibleNav.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                isActive(item.url)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      )}

      {/* ── Context Bar ─────────────────────────────────────── */}
      <ContextBar />

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-4 lg:p-6 relative z-[1]">
        {typeof children === "function"
          ? (children as (ctx: AskProfixContext) => ReactNode)({ openAskProfix })
          : children}
      </main>

      <AskProfixPanel
        externalOpen={askOpen}
        onClose={() => setAskOpen(false)}
        prefillQuestion={prefill}
        contextLabel={contextLabel}
      />
    </div>
  );
};
