import React, { useState } from "react";
import FilterBar from "./FilterBar";
import { UserProvider } from "../context/UserContext";
import TopBar from "./TopBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  // Keep in sync with FilterBar
  const WIDTH_EXPANDED = 250;
  const WIDTH_COLLAPSED = 58;

  const barWidth = filtersCollapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED;

  const OUTER_GAP = 30; // window → bar
  const INNER_GAP = 10; // bar → content

  const filterLeft = OUTER_GAP;
  const contentLeft = filterLeft + barWidth + INNER_GAP;

  return (
    <UserProvider>
      <div
        className="min-h-screen w-full font-sans text-slate-900"
        style={{ position: "relative", overflowX: "hidden" }}
      >
        {/* ✅ LUNAR BACKGROUND (behind everything) */}
        <div aria-hidden className="mc-lunar-bg" />

        {/* Rail tint: ends exactly at the content band start */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            width: contentLeft,
            pointerEvents: "none",
            background:
              "linear-gradient(90deg, rgba(11,30,58,0.08) 0%, rgba(11,30,58,0.045) 55%, rgba(11,30,58,0.00) 100%)",
            zIndex: 2, // ✅ above lunar layers
          }}
        />

        <TopBar leftOffset={contentLeft} />

        {/* Filter (unchanged — keep collapse working) */}
        <FilterBar
          collapsed={filtersCollapsed}
          onToggle={() => setFiltersCollapsed((c) => !c)}
          leftOffset={filterLeft}
        />

        {/* Content */}
        <main
          style={{
            position: "relative",
            zIndex: 3,
            paddingLeft: contentLeft,
            paddingTop: 25,
          }}
        >
          <div style={{ padding: "14px 16px" }}>{children}</div>
        </main>
      </div>
    </UserProvider>
  );
}
