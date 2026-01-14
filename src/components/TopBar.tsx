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
      { label: "Summary", to: "/executive_summary", exact: true },
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
        background: compact
          ? "rgba(255,255,255,0.70)"
          : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(15, 23, 42, 0.10)",
        boxShadow: compact
          ? "0 6px 14px rgba(15,23,42,0.06)"
          : "0 10px 24px rgba(15,23,42,0.06)",
        display: "flex",
        alignItems: "center",
        position: "relative",
        transition:
          "height 260ms ease, background 260ms ease, box-shadow 260ms ease",
      }}
    >
      {(() => {
        const LOGO_SIZE = compact ? 20 : 28; // icon size
        const WRAP_SIZE = compact ? 28 : 44; // hitbox
        const GAP_LEFT = 14;

        const barCollapsed = barWidth <= 60; // 58 in your app
        const filterCenterX = filterLeft + barWidth / 2;
        const leftWhenCollapsed = Math.round(filterCenterX - WRAP_SIZE / 2);
        const left = barCollapsed ? leftWhenCollapsed : GAP_LEFT;

        const activeItem =
          navItems.find((it) => isActive(it)) ??
          navItems.find((it) => it.to === "/") ??
          navItems[0];

        const activeLabel = activeItem?.label ?? "";

        return (
          <div
            style={{
              position: "absolute",
              left,
              top: "50%",
              transform: "translateY(-50%)",

              display: "flex",
              alignItems: "center",
              gap: 1,

              transition: "left 260ms ease",
            }}
          >
            <div
              style={{
                width: WRAP_SIZE,
                height: WRAP_SIZE,
                display: "grid",
                placeItems: "center",
                border: "none",
                flexShrink: 0,
                transition: "width 260ms ease, height 260ms ease",
              }}
            >
              <img
                src={faviconUrl}
                alt="Mission Control"
                style={{
                  width: LOGO_SIZE,
                  height: LOGO_SIZE,
                  opacity: 0.95,
                }}
              />
            </div>

            {/* ✅ Expanded lockup: Mission Control (small) + Active page (bigger) */}
            {!compact && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  lineHeight: 0.82,
                  gap: 4,
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
              >
<div
  style={{
    fontFamily: "var(--mc-font-brand)",
    fontSize: 9,
    letterSpacing: "0.28em",
    fontWeight: 800,
    color: "rgba(15,23,42,0.60)",
    textTransform: "uppercase",
  }}
>
  Mission Control
</div>

<div
  style={{
    fontFamily: "var(--mc-font-brand)",
    fontSize: 17,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "rgba(38, 65, 90, 0.95)",
    transition: "color 180ms ease",
  }}
>
  {activeLabel}
</div>

              </div>
            )}
          </div>
        );
      })()}

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
              let style = {};

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
                      fontFamily: "var(--mc-font-topbar)",
                      letterSpacing: compact ? "0.18em" : "0.22em",
                      textTransform: "uppercase",
                      fontSize: compact ? 8 : 10,
                      fontWeight: active ? 700 : 600,
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
