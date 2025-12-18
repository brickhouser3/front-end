import React, { useState } from "react";
import FilterBar from "./FilterBar";
import { UserProvider } from "../context/UserContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  return (
    <UserProvider>
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#ffffff",
          overflow: "auto",
        }}
      >
        {/* ================= FILTER BAR ================= */}
        <div
          style={{
            flexShrink: 0,
            zIndex: 10,
            height: "100%", // allow sidebar to inherit full height
            display: "flex",
          }}
        >
          <FilterBar
            collapsed={filtersCollapsed}
            onToggle={() => setFiltersCollapsed(c => !c)}
          />
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            backgroundColor: "#ffffff",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "auto", // pages control scrolling
          }}
        >
          {children}
        </div>
      </div>
    </UserProvider>
  );
}
