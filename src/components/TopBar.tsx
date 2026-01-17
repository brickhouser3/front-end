import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useLocation } from "@docusaurus/router";
import { useDashboard, BRAND_CODES } from "../context/DashboardContext"; 
import { useFilterOptions } from "../hooks/useFilterOptions"; 
import { ChevronDown, Calendar, Package, ToggleLeft, ToggleRight, Filter, Map, MapPin, Store, ShoppingCart, Check, Clock } from "lucide-react";

// ... (Keep TopBarDropdown component exactly as it was) ...
/* ================= MULTI-SELECT DROPDOWN ================= */
function TopBarDropdown({ label, icon: Icon, options, value, onChange, compact, loading, multi }: any) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const toggleOpen = () => {
    if (open) setOpen(false);
    else if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 180) });
      setOpen(true);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (buttonRef.current?.contains(e.target as Node)) return;
      if ((e.target as HTMLElement).closest("[data-portal-menu]")) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const handleSelect = (val: string) => {
      if (multi) {
          const current = Array.isArray(value) ? value : [];
          const exists = current.includes(val);
          let next;
          if (exists) next = current.filter((v: string) => v !== val);
          else next = [...current, val];
          onChange(next);
      } else {
          onChange(val);
          setOpen(false);
      }
  };

  const displayLabel = useMemo(() => {
      if (loading) return "Loading...";
      if (multi && Array.isArray(value)) {
          if (value.length === 0) return "Select...";
          if (value.length === 1) return options.find((o:any) => o.value === value[0])?.label || value[0];
          return `${value.length} Selected`;
      }
      if (!value || value === "ALL") return "All";
      return options.find((o:any) => o.value === value)?.label || value;
  }, [value, options, loading, multi]);

  const padding = compact ? "4px 8px" : "6px 12px";
  const iconSize = compact ? 12 : 14;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleOpen}
        disabled={loading}
        style={{
          background: open ? "rgba(15,23,42,0.08)" : "rgba(15,23,42,0.03)",
          border: "1px solid rgba(15,23,42,0.12)", borderRadius: "8px", padding,
          display: "flex", alignItems: "center", gap: 6, cursor: loading ? "wait" : "pointer", 
          transition: "all 0.2s ease", opacity: loading ? 0.6 : 1, flexShrink: 0 
        }}
      >
        <Icon size={iconSize} className="text-slate-500" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 0.9 }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{label}</span>
            <span style={{ fontSize: compact ? "0.7rem" : "0.75rem", fontWeight: 700, color: "#334155", whiteSpace: "nowrap", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayLabel}
            </span>
        </div>
        <ChevronDown size={iconSize} className="text-slate-400" />
      </button>

      {open && createPortal(
        <div data-portal-menu style={{
            position: "fixed", top: coords.top, left: coords.left, minWidth: coords.width, maxHeight: 300, overflowY: "auto",
            background: "#ffffff", border: "1px solid rgba(15,23,42,0.1)", borderRadius: "8px", 
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)", zIndex: 99999, padding: 4, display: "flex", flexDirection: "column"
          }}>
           {options.map((opt: any, i: number) => {
             const isSelected = multi ? value.includes(opt.value) : value === opt.value;
             return (
                <div key={i} onClick={() => handleSelect(opt.value)}
                  style={{
                    padding: "8px 12px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", borderRadius: 4,
                    color: isSelected ? "#0f172a" : "#64748b", background: isSelected ? "#f1f5f9" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}
                  onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {opt.label}
                  {isSelected && <Check size={14} className="text-blue-600" />}
                </div>
             );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

/* ================= TOP BAR ================= */
export default function TopBar({ visible = true, height = 64 }: { visible?: boolean; height?: number; }) {
  const faviconUrl = useBaseUrl("/img/mbmc_favicon.png");
  const { pathname } = useLocation();
  const compact = !visible;

  // ✅ Consume new includeAO state
  const { selectedPeriod, setSelectedPeriod, updateFilter, filters, timeScope, setTimeScope, includeAO, setIncludeAO } = useDashboard();

  const { options: regionOptions, loading: regLoad } = useFilterOptions("sls_regn_cd", "mbmc_actuals_volume");
  const { options: stateOptions, loading: stLoad } = useFilterOptions("mktng_st_cd", "mbmc_actuals_volume");
  const { options: wholesalerOptions, loading: wslrLoad } = useFilterOptions("wslr_nbr", "mbmc_actuals_volume");
  const { options: channelOptions, loading: chanLoad } = useFilterOptions("channel", "mbmc_actuals_volume");

  const monthOptions = [
      { label: "Dec 2025", value: "202512" }, { label: "Nov 2025", value: "202511" },
      { label: "Oct 2025", value: "202510" }, { label: "Sep 2025", value: "202509" },
      { label: "Aug 2025", value: "202508" }, { label: "Jul 2025", value: "202507" },
      { label: "Jun 2025", value: "202506" }, { label: "May 2025", value: "202505" }
  ];
  
  const brandOptions = [ { label: "All Brands", value: "ALL" }, ...Object.entries(BRAND_CODES).map(([label, code]) => ({ label, value: code })) ];
  const getVal = (key: keyof typeof filters) => filters[key]?.[0] || "ALL";

  let activeLabel = "DASHBOARD";
  if (pathname.includes("executive_summary")) activeLabel = "EXECUTIVE SUMMARY";
  else if (pathname.includes("diagnostic")) activeLabel = "DIAGNOSTIC";
  else if (pathname.includes("builder")) activeLabel = "BUILDER";
  else if (pathname.includes("support")) activeLabel = "SUPPORT";

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: compact ? 48 : height, transition: "height 0.2s ease" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: compact ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.98)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(15, 23, 42, 0.10)", boxShadow: compact ? "0 4px 10px rgba(0,0,0,0.05)" : "0 10px 24px rgba(0,0,0,0.06)" }} />

      <div style={{ position: "relative", zIndex: 2, height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 24, paddingLeft: 14 }}>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img src={faviconUrl} alt="MC" style={{ width: compact ? 24 : 28, height: compact ? 24 : 28, opacity: 0.95 }} />
            {!compact && (
                <div style={{ marginLeft: 12, display: "flex", flexDirection: "column", lineHeight: 0.82, gap: 4 }}>
                    <div style={{ fontFamily: "var(--mc-font-brand)", fontSize: 9, letterSpacing: "0.28em", fontWeight: 800, color: "rgba(15,23,42,0.60)", textTransform: "uppercase" }}>Mission Control</div>
                    <div style={{ fontFamily: "var(--mc-font-brand)", fontSize: 17, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(38, 65, 90, 0.95)" }}>{activeLabel}</div>
                </div>
            )}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 4 }}>
                <Filter size={14} className="text-slate-400" />
                {!compact && <span style={{fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.05em", color: "#94a3b8"}}>GLOBAL:</span>}
            </div>

            {/* ✅ PRODUCT TOGGLE (Core vs +AO) */}
            <div onClick={() => setIncludeAO(!includeAO)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: compact ? "4px 8px" : "6px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", userSelect: "none" }}>
                <span style={{fontSize: "0.75rem", fontWeight: 700, color: !includeAO ? "#0f172a" : "#94a3b8"}}>Core</span>
                {!includeAO ? <ToggleLeft size={20} className="text-slate-400"/> : <ToggleRight size={20} className="text-blue-600"/>}
                <span style={{fontSize: "0.75rem", fontWeight: 700, color: includeAO ? "#0f172a" : "#94a3b8"}}>+ AO</span>
            </div>

            {/* TIME TOGGLE */}
            <div onClick={() => setTimeScope(timeScope === "MTD" ? "YTD" : "MTD")} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: compact ? "4px 8px" : "6px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", userSelect: "none" }}>
                <span style={{fontSize: "0.75rem", fontWeight: 700, color: timeScope === "MTD" ? "#0f172a" : "#94a3b8"}}>MTD</span>
                {timeScope === "MTD" ? <ToggleLeft size={20} className="text-slate-400"/> : <ToggleRight size={20} className="text-blue-600"/>}
                <span style={{fontSize: "0.75rem", fontWeight: 700, color: timeScope === "YTD" ? "#0f172a" : "#94a3b8"}}>YTD</span>
            </div>

            <TopBarDropdown label="Periods" icon={Calendar} options={monthOptions} value={selectedPeriod} onChange={setSelectedPeriod} compact={compact} multi={true} />
            <TopBarDropdown label="Region" icon={Map} options={regionOptions} loading={regLoad} value={getVal("sls_regn_cd")} onChange={(v: string) => updateFilter("sls_regn_cd", v)} compact={compact} />
            <TopBarDropdown label="State" icon={MapPin} options={stateOptions} loading={stLoad} value={getVal("mktng_st_cd")} onChange={(v: string) => updateFilter("mktng_st_cd", v)} compact={compact} />
            <TopBarDropdown label="Wholesaler" icon={Store} options={wholesalerOptions} loading={wslrLoad} value={getVal("wslr_nbr")} onChange={(v: string) => updateFilter("wslr_nbr", v)} compact={compact} />
            <TopBarDropdown label="Channel" icon={ShoppingCart} options={channelOptions} loading={chanLoad} value={getVal("channel")} onChange={(v: string) => updateFilter("channel", v)} compact={compact} />
            <TopBarDropdown label="Brand" icon={Package} options={brandOptions} value={getVal("megabrand")} onChange={(v: string) => updateFilter("megabrand", v)} compact={compact} />
        </div>
      </div>
    </div>
  );
}