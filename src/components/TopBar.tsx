import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function TopBar({
  visible = true,
  height = 64,

  // where the FilterBar sits (same x you pass to FilterBar via leftOffset)
  filterLeft = 30,

  // current FilterBar width (58 when collapsed, 250 when expanded)
  barWidth = 250,

  // ✅ stable lockup width so it never jumps when barWidth shrinks
  lockupWidth = 250,
}: {
  visible?: boolean;
  height?: number;
  filterLeft?: number;
  barWidth?: number;
  lockupWidth?: number;
}) {
  const faviconUrl = useBaseUrl("/img/mbmc_favicon.png");

  // ✅ center the lockup over the bar WHEN possible,
  // but never let it shift left offscreen when the bar collapses.
  const centerOffset = (barWidth - lockupWidth) / 2; // negative when collapsed
  const lockupLeft = filterLeft + Math.max(0, centerOffset);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,

        transform: visible ? "translateY(0)" : "translateY(-110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 320ms ease, opacity 220ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        style={{
          height,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(15, 23, 42, 0.10)",
          boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* ✅ Brand lockup positioned above FilterBar, stable width (no jump) */}
        <div
          style={{
            position: "absolute",
            left: lockupLeft,
            width: lockupWidth,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,

            paddingLeft: 6,
            paddingRight: 6,

            // ✅ ensure it never causes horizontal scroll
            maxWidth: "calc(100vw - 24px)",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              background: "rgba(15,23,42,0.04)",
              border: "1px solid rgba(15,23,42,0.10)",
              boxShadow: "0 10px 18px rgba(15,23,42,0.06)",
              flexShrink: 0,
            }}
          >
            <img
              src={faviconUrl}
              alt="Mission Control"
              style={{ width: 20, height: 20, opacity: 0.95 }}
            />
          </div>

          <div
            style={{
              fontFamily: "Spantaran, Inter, system-ui",
              fontSize: 18,
              letterSpacing: "0.14em",
              fontWeight: 800,
              color: "rgba(15,23,42,0.86)",
              textTransform: "uppercase",
              lineHeight: 1,
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            Mission Control
          </div>
        </div>
      </div>
    </div>
  );
}
