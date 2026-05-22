import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Clock,
  FileCheck2,
  Linkedin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GeoBg } from "@/components/GeoBg";
import profixLogo from "@/assets/profix-logo.png";

const CONTACT_URL = "https://www.linkedin.com/in/naghdiyashar";

const capabilities = [
  {
    icon: TrendingUp,
    title: "USALI-Native P&L",
    body: "Automated profit & loss statements formatted to the Uniform System of Accounts for the Lodging Industry — no manual reformatting.",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    body: "Variance detection with contextual narrative analysis. Spot cost overruns 48 hours earlier than manual review.",
  },
  {
    icon: AlertTriangle,
    title: "Real-Time Alerts",
    body: "Critical GOP gaps, margin breaks, and inventory drift pushed to Telegram, email, or webhooks the moment they happen.",
  },
  {
    icon: FileCheck2,
    title: "Audit-Ready Exports",
    body: "One-click CSV, PDF, and API exports. Full data portability — your numbers are always yours.",
  },
];

const outcomes = [
  { label: "Time saved", value: "~2.5h / week per manager" },
  { label: "Variance flagged", value: "GOP gaps within 24h" },
  { label: "Consolidation", value: "Zero manual P&L work" },
  { label: "Audit prep", value: "Weeks → hours" },
];

const why = [
  {
    title: "Hotel finance is stuck in spreadsheets",
    body: "Controllers spend 12+ hours every month rebuilding the same P&L. By the time it lands on the GM's desk, the month is already lost.",
  },
  {
    title: "Generic BI tools don't speak USALI",
    body: "Off-the-shelf dashboards lack hospitality structure. Enterprise suites cost €50K+ and take 6 months to deploy.",
  },
  {
    title: "Profix closes the loop in weeks",
    body: "Upload, map, and run. AI watches the lines that move the margin, and tells you what to do about it — in plain language.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <GeoBg />

      {/* Nav */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={profixLogo}
              alt="PROFiX"
              className="h-6 w-auto [filter:brightness(0)_invert(1)]"
              draggable={false}
            />
          </div>
          <nav className="flex items-center gap-2">
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Contact
            </a>
            <Button size="sm" variant="ghost" onClick={() => navigate("/login")} className="text-xs">
              Sign in
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <Badge variant="outline" className="text-[10px] mb-5 border-primary/30 text-primary">
            AI-Driven Cost Clarity for Hotel Finance
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
            The P&L copilot for hotel{" "}
            <span className="text-primary">finance teams</span> who refuse to wait for month-end.
          </h1>
          <p className="text-base text-muted-foreground mt-5 leading-relaxed max-w-2xl">
            Profix turns raw operational data into USALI-compliant statements, flags variances in
            real time, and tells your controllers what's actually moving the margin — before the
            month closes.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Button onClick={() => navigate("/login")} className="gap-2">
              Sign in to your workspace <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline">
              <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" className="gap-2">
                <Linkedin className="h-4 w-4" /> Request a walkthrough
              </a>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Outcomes bar */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Outcomes Profix delivers</h2>
            <span className="text-[10px] text-muted-foreground italic">
              Based on pilot feedback
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {outcomes.map((o) => (
              <div
                key={o.label}
                className="flex items-start gap-2.5 p-3 rounded-md border bg-muted/30"
              >
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                    {o.label}
                  </p>
                  <p className="text-xs font-semibold mt-0.5 leading-tight">{o.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* What it does */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-wider text-primary font-medium mb-2">
            What it does
          </p>
          <h2 className="text-2xl font-semibold">A finance stack that thinks in USALI</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilities.map((c) => (
            <Card key={c.title} className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <c.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{c.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Why it matters */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-wider text-primary font-medium mb-2">
            Why it matters
          </p>
          <h2 className="text-2xl font-semibold">
            Margin lives in the lines you don't have time to read
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {why.map((w, i) => (
            <Card key={w.title} className="p-5">
              <div className="text-[10px] font-mono-data text-muted-foreground mb-2">
                0{i + 1}
              </div>
              <h3 className="text-sm font-semibold">{w.title}</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{w.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <Card className="p-5 bg-muted/30 border-dashed">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold">Built for governed environments</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Role-based access, audit logging, EU-hosted infrastructure, and full data export.
                No vendor lock-in. Enterprise SSO and SAML available.
              </p>
            </div>
            <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0 ml-auto hidden md:block" />
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold">Ready to see your P&L in real time?</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
            Sign in to your workspace, or reach out directly to request access for your property.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Button onClick={() => navigate("/login")} className="gap-2">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline">
              <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" className="gap-2">
                <Linkedin className="h-4 w-4" /> Contact us on LinkedIn
              </a>
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src={profixLogo}
              alt="PROFiX"
              className="h-5 w-auto [filter:brightness(0)_invert(1)] opacity-80"
              draggable={false}
            />
            <span className="text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} Profix. AI-Driven Cost Clarity.
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <Linkedin className="h-3.5 w-3.5" /> Contact
            </a>
            <Link to="/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
