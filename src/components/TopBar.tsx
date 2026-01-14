import React, { useMemo } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useLocation } from "@docusaurus/router";

type NavItem = {
  label: string;
  to: string;
  exact?: boolean;
};

export default function TopBar({
  // ✅ reinterpret visible: true = expanded, false = compact (no hide)
  visible = true,
  height = 64,

  filterLeft = 30,
  barWidth = 250,
  lockupWidth = 250,
}: {
  visible?: boolean;
  height?: number;
  filterLeft?: number;
  barWidth?: number;
  lockupWidth?: number;
}) {
  const faviconUrl = useBaseUrl("/img/mbmc_favicon.png");
  const { pathname } = useLocation();

  const compact = !visible;

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Executive", to: "/exec", exact: true },
      { label: "Diagnostic", to: "/diagnostic" },
      { label: "Builder", to: "/builder" },
      { label: "Support", to: "/support" },
    ],
    []
  );

  // keep your lockup positioning math (expanded mode)
  const centerOffset = (barWidth - lockupWidth) / 2;
  const lockupLeft = filterLeft + Math.max(0, centerOffset);

  // nav starts to the right of lockup in expanded mode, otherwise after favicon
  const expandedNavLeft = lockupLeft + lockupWidth + 28;
  const compactNavLeft = 64; // space after favicon
  const navLeftGutter = compact ? compactNavLeft : expandedNavLeft;

  const isActive = (item: NavItem) => {
    const resolved = useBaseUrl(item.to);
    if (item.exact) return pathname === resolved;
    return pathname === resolved || pathname.startsWith(resolved + "/");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          height: compact ? 44 : height,
          background: compact ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(15, 23, 42, 0.10)",
          boxShadow: compact
            ? "0 6px 14px rgba(15,23,42,0.06)"
            : "0 10px 24px rgba(15,23,42,0.06)",
          display: "flex",
          alignItems: "center",
          position: "relative",
          transition: "height 260ms ease, background 260ms ease, box-shadow 260ms ease",
        }}
      >
        {/* ✅ Animated favicon (far-left) */}
        <div
          style={{
            position: "absolute",
            left: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: compact ? 28 : 32,
              height: compact ? 28 : 32,
              display: "grid",
              placeItems: "center",
              border: "none",
              flexShrink: 0,
              transition: "width 260ms ease, height 260ms ease, background 260ms ease",
            }}
          >
            <style>{`
              @keyframes mcFloat {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-2px); }
                100% { transform: translateY(0px); }
              }
              @keyframes mcGlow {
                0% { filter: drop-shadow(0 0 0 rgba(120,170,255,0.0)); }
                50% { filter: drop-shadow(0 0 10px rgba(120,170,255,0.35)); }
                100% { filter: drop-shadow(0 0 0 rgba(120,170,255,0.0)); }
              }
            `}</style>

            <img
              src={faviconUrl}
              alt="Mission Control"
              style={{
                width: compact ? 18 : 20,
                height: compact ? 18 : 20,
                opacity: 0.95,
                animation: "mcFloat 2.8s ease-in-out infinite, mcGlow 3.6s ease-in-out infinite",
              }}
            />
          </div>

          {/* ✅ Expanded label only */}
          {!compact && (
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
          )}
        </div>

        {/* ✅ Keep “alignment above FilterBar” anchor (no visual content) */}
        {!compact && (
          <div
            style={{
              position: "absolute",
              left: lockupLeft,
              width: lockupWidth,
              maxWidth: "calc(100vw - 24px)",
              opacity: 0,
              pointerEvents: "none",
            }}
            aria-hidden="true"
          >
            <div style={{ height: 1 }} />
          </div>
        )}

        {/* ✅ Nav rail */}
        <div
          style={{
            marginLeft: navLeftGutter,
            width: `calc(100vw - ${navLeftGutter}px)`,
            paddingRight: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            minWidth: 0,
          }}
        >
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              maxWidth: "100%",
              overflowX: "auto",
              overflowY: "hidden",
              overscrollBehaviorX: "contain",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
            }}
          >
            {/* @ts-ignore */}
            <style>{`
              nav::-webkit-scrollbar { display: none; }
            `}</style>

            {navItems.map((item, idx) => {
              const active = isActive(item);

              return (
                <React.Fragment key={item.to}>
                  {idx !== 0 && (
                    <span
                      style={{
                        width: 1,
                        height: compact ? 14 : 18,
                        background: "rgba(15,23,42,0.10)",
                        margin: compact ? "0 10px" : "0 14px",
                        flexShrink: 0,
                        transition: "margin 260ms ease, height 260ms ease",
                      }}
                    />
                  )}

                  <Link
                    to={item.to}
                    style={{
                      fontFamily: "Inter, system-ui",
                      fontSize: compact ? 12 : 13,
                      fontWeight: active ? 700 : 600,
                      letterSpacing: "0.02em",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      padding: compact ? "6px 8px" : "8px 10px",
                      borderRadius: 10,
                      transition:
                        "background 140ms ease, color 140ms ease, box-shadow 140ms ease, padding 260ms ease, font-size 260ms ease",
                      color: active ? "rgba(15,23,42,0.92)" : "rgba(15,23,42,0.62)",
                      background: active ? "rgba(15,23,42,0.06)" : "transparent",
                      boxShadow: active ? "0 8px 18px rgba(15,23,42,0.06)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      if (!active) {
                        el.style.background = "rgba(15,23,42,0.045)";
                        el.style.color = "rgba(15,23,42,0.80)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      if (!active) {
                        el.style.background = "transparent";
                        el.style.color = "rgba(15,23,42,0.62)";
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
