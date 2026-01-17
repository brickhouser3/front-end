import React, { createContext, useContext, useState, ReactNode } from "react";

export type FilterState = {
  megabrand: string[];
  sls_regn_cd: string[];
  mktng_st_cd: string[];
  wslr_nbr: string[];
  channel: string[];
};

type DashboardContextType = {
  filters: FilterState;
  selectedPeriod: string[]; 
  timeScope: "MTD" | "YTD";
  includeAO: boolean; // ✅ NEW STATE
  setSelectedPeriod: (periods: string[]) => void;
  setTimeScope: (scope: "MTD" | "YTD") => void;
  setIncludeAO: (val: boolean) => void; // ✅ NEW SETTER
  updateFilter: (key: keyof FilterState, value: string | string[]) => void;
  clearFilters: () => void;
};

export const BRAND_CODES: Record<string, string> = {
  "MICHELOB ULTRA": "MUL", "BUD LIGHT": "BDL", "BUSCH LIGHT": "BHL",
  "BUDWEISER": "BUD", "STELLA ARTOIS": "STA", "NUTRL": "NUTRL",
  "KONA BIG WAVE": "KGA", "CUTWATER": "CWFM"
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({ megabrand: [], sls_regn_cd: [], mktng_st_cd: [], wslr_nbr: [], channel: [] });
  const [selectedPeriod, setSelectedPeriod] = useState<string[]>(["202512"]); 
  const [timeScope, setTimeScope] = useState<"MTD" | "YTD">("YTD");
  const [includeAO, setIncludeAO] = useState(false); // ✅ Default to excluding AO

  const updateFilter = (key: keyof FilterState, value: string | string[]) => {
      if (value === "ALL" || (Array.isArray(value) && value.includes("ALL"))) {
          setFilters(prev => ({ ...prev, [key]: [] }));
          return;
      }
      let finalVal = value;
      if (key === "megabrand" && typeof value === "string" && BRAND_CODES[value]) finalVal = BRAND_CODES[value];
      setFilters(prev => ({ ...prev, [key]: Array.isArray(finalVal) ? finalVal : [finalVal as string] }));
  };

  const clearFilters = () => setFilters({ megabrand: [], sls_regn_cd: [], mktng_st_cd: [], wslr_nbr: [], channel: [] });

  return (
    <DashboardContext.Provider value={{ filters, selectedPeriod, timeScope, includeAO, setSelectedPeriod, setTimeScope, setIncludeAO, updateFilter, clearFilters }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
}