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
  const TOPBAR_HEIGHT = 64;

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
          height={TOPBAR_HEIGHT}
          filterLeft={FILTER_LEFT}
          barWidth={barWidth}
        />

        {/* ================= FILTER BAR ================= */}
        <FilterBar
          collapsed={filtersCollapsed}
          onToggle={() => setFiltersCollapsed((v) => !v)}
          leftOffset={FILTER_LEFT}
          morph={scrolled}
          topbarHeight={TOPBAR_HEIGHT}
        />

        {/* ================= PAGE CONTENT ================= */}
        <main
          style={{
            position: "relative",
            zIndex: 3,
            paddingLeft: FILTER_LEFT + barWidth + 10,
            paddingTop: TOPBAR_HEIGHT + 16,
            transition: "padding-top 260ms ease",
          }}
        >
          {children}
        </main>
      </div>
    </UserProvider>
  );
}
