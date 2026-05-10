import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export type Tier = "free" | "team" | "enterprise";

const TIER_RANK: Record<Tier, number> = { free: 0, team: 1, enterprise: 2 };
const STORAGE_KEY = "pp_tier";

interface TierContextType {
  tier: Tier;
  setTier: (t: Tier) => void;
  hasTier: (required: Tier) => boolean;
}

const TierContext = createContext<TierContextType>({
  tier: "free",
  setTier: () => {},
  hasTier: () => false,
});

export const TierProvider = ({ children, initial = "free" }: { children: ReactNode; initial?: Tier }) => {
  const [tier, setTierState] = useState<Tier>(() => {
    if (typeof window === "undefined") return initial;
    const stored = localStorage.getItem(STORAGE_KEY) as Tier | null;
    return stored && stored in TIER_RANK ? stored : initial;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, tier); } catch { /* ignore */ }
  }, [tier]);

  const setTier = useCallback((t: Tier) => setTierState(t), []);
  const hasTier = useCallback(
    (required: Tier) => TIER_RANK[tier] >= TIER_RANK[required],
    [tier],
  );

  return (
    <TierContext.Provider value={{ tier, setTier, hasTier }}>
      {children}
    </TierContext.Provider>
  );
};

export const useTier = () => useContext(TierContext);
