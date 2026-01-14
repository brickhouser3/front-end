import React, { useEffect, useState } from "react";
import FilterBar from "./FilterBar";
import TopBar from "./TopBar";
import { UserProvider } from "../context/UserContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ====== FILTER BAR DIMENSIONS (single source of truth) ======
  const WIDTH_EXPANDED = 250;
  const WIDTH_COLLAPSED = 58;
  const barWidth = filtersCollapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED;

  const FILTER_LEFT = 30;

  // ====== TOPBAR HEIGHTS (Option B) ======
  // Expanded header height (your original)
  const TOPBAR_EXPANDED_HEIGHT = 64;

  // Compact header height (when scrolled)
  // ✅ adjust this if your compact TopBar ends up slightly different (e.g., 46)
  const TOPBAR_COMPACT_HEIGHT = 44;

  // ✅ Effective height used to position/center FilterBar in the "safe viewport"
  const effectiveTopbarHeight = scrolled
    ? TOPBAR_COMPACT_HEIGHT
    : TOPBAR_EXPANDED_HEIGHT;

  // ====== SCROLL DETECTION ======
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll(); // initialize
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <UserProvider>
      <div
        className="min-h-screen w-full font-sans text-slate-900"
        style={{ position: "relative", overflowX: "hidden" }}
      >
        {/* ================= TOP BAR ================= */}
        <TopBar
          visible={!scrolled}
          height={TOPBAR_EXPANDED_HEIGHT}
          filterLeft={FILTER_LEFT}
          barWidth={barWidth}
        />

        {/* ================= FILTER BAR ================= */}
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
    </UserProvider>
  );
}
