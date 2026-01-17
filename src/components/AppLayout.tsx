import React, { useEffect, useState } from "react";
import FilterBar from "./FilterBar";
import TopBar from "./TopBar";
import { UserProvider } from "../context/UserContext";
import { DashboardProvider } from "../context/DashboardContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // DIMENSIONS
  const WIDTH_EXPANDED = 250;
  const WIDTH_COLLAPSED = 58;
  const barWidth = filtersCollapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED;
  const FILTER_LEFT = 30;
  const TOPBAR_EXPANDED_HEIGHT = 50;
  const TOPBAR_COMPACT_HEIGHT = 40;
  const effectiveTopbarHeight = scrolled ? TOPBAR_COMPACT_HEIGHT : TOPBAR_EXPANDED_HEIGHT;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); 
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <UserProvider>
      <DashboardProvider>
        <div className="min-h-screen w-full font-sans text-slate-900" style={{ position: "relative", overflowX: "hidden" }}>
          
          {/* ================= TOP BAR ================= */}
          {/* Wrapper to hold space, but allow visual overflow */}
          <div style={{ position: "relative", zIndex: 50 }}> 
            <TopBar
              visible={!scrolled}
              height={TOPBAR_EXPANDED_HEIGHT}
              filterLeft={FILTER_LEFT}
              barWidth={barWidth}
            />
          </div>

          {/* ================= FILTER BAR (SIDE NAV) ================= */}
          <FilterBar
            collapsed={filtersCollapsed}
            onToggle={() => setFiltersCollapsed((v) => !v)}
            leftOffset={FILTER_LEFT}
            morph={scrolled}
            topbarHeight={effectiveTopbarHeight}
          />

          {/* ================= PAGE CONTENT ================= */}
          <main
            style={{
              position: "relative",
              zIndex: 3,
              paddingLeft: FILTER_LEFT + barWidth + 10,
              paddingTop: TOPBAR_EXPANDED_HEIGHT + 16,
              transition: "padding-top 260ms ease",
            }}
          >
            {children}
          </main>
        </div>
      </DashboardProvider>
    </UserProvider>
  );
}