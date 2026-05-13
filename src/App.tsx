import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, saveLastRoute } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { BackendStatusProvider } from "@/contexts/BackendStatusContext";
import { TierProvider } from "@/contexts/TierContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import DataVault from "./pages/DataVault";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import ProfitLoss from "./pages/ProfitLoss";
import Overview from "./pages/Overview";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoicesInbox from "./pages/InvoicesInbox";
import NotFound from "./pages/NotFound";
import WhyProfix from "./pages/WhyProfix";
import Upgrade from "./pages/Upgrade";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "inventory") return <Navigate to="/data" replace />;
  return <Navigate to="/overview" replace />;
};

const RouteTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user && location.pathname !== "/login") {
      saveLastRoute(location.pathname);
    }
  }, [location.pathname, user]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BackendStatusProvider>
        <TierProvider initial="free">
        <PropertyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteTracker />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RootRedirect />} />
              {/* ── MVP Routes ─────────────────────────────── */}
              <Route path="/overview" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><Overview /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><Dashboard /></ProtectedRoute>} />
              <Route path="/pl" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><ProfitLoss /></ProtectedRoute>} />
              <Route path="/insights" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><Insights /></ProtectedRoute>} />
              <Route path="/data" element={<ProtectedRoute><DataVault /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/why-profix" element={<ProtectedRoute allowedRoles={["direction"]}><WhyProfix /></ProtectedRoute>} />
              <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
              {/* Invoice approval (mock data, v0 design) — reachable by URL, not in main nav */}
              <Route path="/invoices" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><InvoicesInbox /></ProtectedRoute>} />
              <Route path="/invoices/:id" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><InvoiceDetail /></ProtectedRoute>} />
              {/* Non-MVP routes removed from navigation but kept as catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PropertyProvider>
        </TierProvider>
        </BackendStatusProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
