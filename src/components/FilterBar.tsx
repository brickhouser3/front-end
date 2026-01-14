import React, { useMemo, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  ChevronDown,
  Clock,
  Map,
  Layers,
  Target,
  Package,
  Upload,
  X,
  FileSpreadsheet,
  Satellite,
} from "lucide-react";

/* ======================================================
   UPLOAD MODAL (local, decoupled from AppLayout)
====================================================== */
function UploadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  React.useEffect(() => {
    if (!open) setFile(null);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = () => {
    if (!file) return;
    console.log("Upload submit (stub):", {
      name: file.name,
      size: file.size,
      type: file.type,
    });
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "rgba(6, 10, 18, 0.62)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload file"
        style={{
          width: "min(640px, 92vw)",
          borderRadius: 18,
          overflow: "hidden",
          background: "rgba(18, 26, 40, 0.86)",
          border: "1px solid rgba(242,214,117,0.22)",
          boxShadow: "0 22px 60px rgba(0,0,0,0.55)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 16px 12px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                background: "rgba(242,214,117,0.10)",
                border: "1px solid rgba(242,214,117,0.22)",
              }}
            >
              <Upload size={18} color="rgba(242,214,117,0.95)" />
            </div>

            <div style={{ lineHeight: 1.1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.92)",
                  letterSpacing: 0.2,
                  fontFamily: "Inter, system-ui",
                }}
              >
                Submit Data File
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.60)",
                  fontFamily: "Inter, system-ui",
                }}
              >
                Accepted formats: .csv, .xlsx
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.06)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <X size={18} color="rgba(255,255,255,0.78)" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 16 }}>
          <input
            id="mbmc-upload-input"
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ display: "none" }}
          />

          <div
            style={{
              borderRadius: 16,
              border: "1px dashed rgba(242,214,117,0.28)",
              background: "rgba(255,255,255,0.04)",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <FileSpreadsheet size={22} color="rgba(255,255,255,0.88)" />
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.90)",
                    fontFamily: "Inter, system-ui",
                  }}
                >
                  Choose a file to upload
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.60)",
                    fontFamily: "Inter, system-ui",
                  }}
                >
                  UI-only for now (no backend wired)
                </div>
              </div>

              <label
                htmlFor="mbmc-upload-input"
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(242,214,117,0.28)",
                  background: "rgba(242,214,117,0.10)",
                  color: "rgba(255,255,255,0.92)",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 0.2,
                  fontFamily: "Inter, system-ui",
                  userSelect: "none",
                }}
              >
                Browse
              </label>
            </div>

            {/* Selected filename */}
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(10, 14, 22, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "Inter, system-ui",
                  }}
                >
                  Selected file
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: file
                      ? "rgba(255,255,255,0.92)"
                      : "rgba(255,255,255,0.45)",
                    maxWidth: "440px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "Inter, system-ui",
                  }}
                  title={file?.name ?? ""}
                >
                  {file?.name ?? "None"}
                </div>
              </div>

              {file ? (
                <button
                  onClick={() => setFile(null)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.85)",
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: 12,
                    fontFamily: "Inter, system-ui",
                  }}
                >
                  Clear
                </button>
              ) : (
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.42)",
                    fontFamily: "Inter, system-ui",
                  }}
                >
                  .csv / .xlsx
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 16,
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.85)",
                cursor: "pointer",
                fontWeight: 900,
                fontSize: 12,
                letterSpacing: 0.2,
                fontFamily: "Inter, system-ui",
              }}
            >
              Cancel
            </button>

            <button
              onClick={submit}
              disabled={!file}
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                border: "1px solid rgba(242,214,117,0.30)",
                background: file
                  ? "rgba(242,214,117,0.14)"
                  : "rgba(242,214,117,0.06)",
                color: file
                  ? "rgba(255,255,255,0.92)"
                  : "rgba(255,255,255,0.45)",
                cursor: file ? "pointer" : "not-allowed",
                fontWeight: 900,
                fontSize: 12,
                letterSpacing: 0.35,
                fontFamily: "Inter, system-ui",
              }}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   DROPDOWN
====================================================== */
function Dropdown({ label, options }: { label: string; options: string[] }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(options[0]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("[data-dropdown-root]")) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div data-dropdown-root style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: "7px",
          padding: "0.45rem 0.55rem",
          fontSize: "0.7rem",
          color: "#ffffff",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backdropFilter: "blur(6px)",
        }}
      >
        <span>
          {label}: <strong>{value}</strong>
        </span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            right: 0,
            background: "#0b1e3a",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "7px",
            zIndex: 50,
            boxShadow: "0 14px 30px rgba(0,0,0,0.45)",
            overflow: "hidden",
          }}
        >
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                setValue(opt);
                setOpen(false);
              }}
              style={{
                padding: "0.45rem 0.6rem",
                fontSize: "0.7rem",
                cursor: "pointer",
                color: "#ffffff",
                background:
                  opt === value ? "rgba(255,255,255,0.14)" : "transparent",
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================================================
   SECTION
====================================================== */
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ marginBottom: "0.4rem" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          border: "1px solid rgba(242,214,117,0.28)",
          borderRadius: "15px",
          padding: "0.5rem 0.55rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          boxShadow:
            "inset 0 0 0.5px rgba(255,255,255,0.25), 0 0 12px rgba(242,214,117,0.18)",
          backdropFilter: "blur(6px)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontFamily: "Inter, system-ui",
            fontSize: "0.78rem",
            fontWeight: 500,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#F7E9A6",
            textShadow:
              "0 1px 2px rgba(0,0,0,0.6), 0 0 10px rgba(242,214,117,0.45)",
          }}
        >
          <Icon size={18} />
          {title}
        </span>

        <ChevronDown
          size={16}
          style={{
            color: "#F7E9A6",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 150ms ease",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            paddingTop: "0.45rem",
            paddingLeft: "0.3rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.45rem",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ======================================================
   FILTER BAR (Main)
====================================================== */
export default function FilterBar({
  collapsed,
  onToggle,
  leftOffset,
  morph = false,
  topbarHeight,
}: {
  collapsed: boolean;
  onToggle: () => void;
  leftOffset?: number;
  morph?: boolean;
  topbarHeight: number; // ✅ pass effective height from AppLayout
}) {
  const bgUrl = useBaseUrl("/img/mbmc_filterbar_bg.png");
  const [uploadOpen, setUploadOpen] = useState(false);

  const firstName =
    typeof window !== "undefined"
      ? localStorage.getItem("firstName") || "Traveler"
      : "Traveler";

  const INSET_X = 50;

  const WIDTH_COLLAPSED = 58;
  const WIDTH_EXPANDED = 250;
  const width = collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED;

  const x = leftOffset ?? INSET_X;

  // ✅ Safe-center (always) in the viewport BELOW the TopBar
  const EDGE_GAP = 14;
  const safeHeight = `calc(100vh - ${topbarHeight}px - ${EDGE_GAP * 2}px)`;

  // One reliable calc: center of safe viewport
  const top = `calc(
    ${topbarHeight}px + ${EDGE_GAP}px +
    (100vh - ${topbarHeight}px - ${EDGE_GAP * 2}px) / 2
  )`;

  const y = -50;

  // ✅ SAME HEIGHT in both states (clamped so it never goes under TopBar)
  const barHeight = `min(85vh, ${safeHeight})`;

  /* ======================================================
     GOLD CTA BUTTON STYLES (Option 2)
  ====================================================== */
  const uploadBtn = useMemo<React.CSSProperties>(
    () => ({
      position: "relative",
      overflow: "hidden",
      width: "100%",
      borderRadius: "20px",
      padding: collapsed ? "0.68rem 0.42rem" : "0.72rem 0.8rem",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: collapsed ? 0 : "0.6rem",
      background:
        "linear-gradient(180deg, rgba(255,241,186,0.98) 0%, rgba(242,214,117,0.92) 45%, rgba(212,175,55,0.92) 100%)",
      border: "1px solid rgba(255,255,255,0.42)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.55), " +
        "inset 0 -10px 22px rgba(0,0,0,0.18), " +
        "0 18px 34px rgba(0,0,0,0.40)",
      backdropFilter: "blur(6px)",
      transition:
        "transform 160ms ease, box-shadow 180ms ease, border 180ms ease, filter 180ms ease",
    }),
    [collapsed]
  );

  const onUploadEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget as HTMLButtonElement;
    el.style.transform = "translateY(-2px)";
    el.style.border = "1px solid rgba(255,255,255,0.60)";
    el.style.boxShadow =
      "inset 0 1px 0 rgba(255,255,255,0.62), " +
      "inset 0 -12px 26px rgba(0,0,0,0.20), " +
      "0 24px 42px rgba(0,0,0,0.48), " +
      "0 0 26px rgba(242,214,117,0.18)";
    el.style.filter = "brightness(1.03) saturate(1.05)";
  };

  const onUploadLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget as HTMLButtonElement;
    el.style.transform = "translateY(0)";
    el.style.border = "1px solid rgba(255,255,255,0.42)";
    el.style.boxShadow =
      "inset 0 1px 0 rgba(255,255,255,0.55), " +
      "inset 0 -10px 22px rgba(0,0,0,0.18), " +
      "0 18px 34px rgba(0,0,0,0.40)";
    el.style.filter = "brightness(1) saturate(1)";
  };

  return (
    <>
      <aside
        className="filterbar-root"
        style={{
          position: "fixed",
          top,
          left: 0,
          transform: `translate3d(${x}px, ${y}%, 0)`,
          willChange: "transform, width, top, height",

          width,
          maxWidth: "calc(100vw - 24px)",
          zIndex: 90,

          height: barHeight,

          borderRadius: "45px",
          boxShadow: morph
            ? "0 26px 60px -20px rgba(0,0,0,0.55)"
            : "0 20px 40px -12px rgba(0,0,0,0.45)",

          overflow: "hidden",
          backgroundColor: morph ? "rgba(11, 30, 58, 0.86)" : "#0b1e3a",

          display: "flex",
          flexDirection: "column",

          transition:
            "transform 260ms ease, width 260ms ease, top 260ms ease, height 260ms ease, box-shadow 260ms ease, background-color 260ms ease",
        }}
      >
        {/* BACKGROUND */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(4px) brightness(1.05)",
            transform: "scale(1.05)",
          }}
        />

        {/* ✅ optional morph highlight */}
        {morph && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 42,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.00))",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}

        {/* STARS */}
        <div className="stars stars-slow" />
        <div className="stars stars-medium" />
        <div className="stars stars-fast" />

        {/* CONTENT */}
        <div
          className="scrollbar-hide"
          style={{
            position: "relative",
            zIndex: 2,
            flex: 1,
            overflowY: "auto",
            overflowX: "clip",
            padding: collapsed ? "0.95rem 0.4rem" : "1.1rem 0.9rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            minWidth: 0,
          }}
        >
          {/* ✅ MAIN TOGGLE ICON (space-themed) */}
          <div
            className="logo-hover-zone"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "1.0rem",
              flexShrink: 0,
            }}
          >
            <button
              onClick={onToggle}
              className="logo-float-wrapper"
              aria-label="Toggle filters"
              title="Toggle filters"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "transform 160ms ease",
              }}
            >
              <div
                className="logo-float"
                style={{
                  width: collapsed ? 42 : 78,
                  height: collapsed ? 42 : 78,
                  borderRadius: 22,
                  display: "grid",
                  placeItems: "center",
                  transition: "width 220ms ease, height 220ms ease",

                  background: "none",
                  border: "none",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >

                <Satellite
                  size={collapsed ? 20 : 30}
                  color="rgba(247,233,166,0.95)"
                  style={{
                    filter: "drop-shadow(0 0 16px rgba(242,214,117,0.26))",
                  }}
                />
              </div>
            </button>

            <div className="logo-hover-text">
              {collapsed ? "FILTER" : "COLLAPSE"}
            </div>
          </div>

          {/* ✅ ACTION BUTTON (Gold Pill CTA) */}
          <button
            onClick={() => setUploadOpen(true)}
            style={uploadBtn}
            className="upload-btn"
            aria-label="Target upload"
            title="Target upload"
            onMouseEnter={onUploadEnter}
            onMouseLeave={onUploadLeave}
          >
            {/* GOLD SHINE SWEEP */}
            <span
              aria-hidden
              className="upload-shine"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "20px",
                background:
                  "linear-gradient(110deg, rgba(255,255,255,0.0) 28%, rgba(255,255,255,0.32) 45%, rgba(255,255,255,0.0) 62%)",
                transform: "translateX(-120%)",
                transition: "transform 700ms ease",
                pointerEvents: "none",
                mixBlendMode: "soft-light",
              }}
            />

            {/* CONTENT */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: collapsed ? 0 : "0.6rem",

                color: "rgba(12, 16, 26, 0.92)",
                fontFamily: "Inter, system-ui",
                fontSize: "0.74rem",
                fontWeight: 900,
                letterSpacing: "0.30em",
                textTransform: "uppercase",

                textShadow: "0 1px 0 rgba(255,255,255,0.35)",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Upload size={18} />
              {!collapsed && "TARGET UPLOAD"}
            </span>
          </button>

          {/* GROUPS */}
          {!collapsed && (
            <div className="flex-1 space-y-2">
              <Section title="Time" icon={Clock}>
                <Dropdown
                  label="Period"
                  options={["YTD", "QTD", "MTD", "L4W", "L12W", "L52W"]}
                />
              </Section>
              <Section title="Geography" icon={Map}>
                <Dropdown
                  label="Level"
                  options={["Region", "State", "Wholesaler"]}
                />
              </Section>
              <Section title="Channel" icon={Layers}>
                <Dropdown label="View" options={["Macro", "Planning", "Sub"]} />
              </Section>
              <Section title="Decision Point" icon={Target}>
                <Dropdown label="Type" options={["Position", "Name"]} />
              </Section>
              <Section title="Product" icon={Package}>
                <Dropdown
                  label="Dimension"
                  options={["Brand Flag", "Type", "Megabrand", "WAMP"]}
                />
              </Section>
            </div>
          )}

          {/* USER */}
          {!collapsed && (
            <div
              style={{
                marginTop: "auto",
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                opacity: 0.65,
                color: "#F7E9A6",
                textAlign: "center",
                paddingTop: "1rem",
                flexShrink: 0,
              }}
            >
              Welcome, {firstName}
            </div>
          )}
        </div>

        {/* STYLES */}
        <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

          .stars { position: absolute; inset: 0; pointer-events: none; }
          .stars-slow {
            background-image: radial-gradient(1px 6px at 20% 20%, rgba(255,255,255,0.35), transparent),
                              radial-gradient(1px 6px at 70% 80%, rgba(212,175,55,0.35), transparent);
            animation: starsRiseSlow 22s linear infinite;
          }
          .stars-medium {
            background-image: radial-gradient(1px 8px at 40% 60%, rgba(255,255,255,0.45), transparent),
                              radial-gradient(1px 8px at 80% 30%, rgba(212,175,55,0.45), transparent);
            animation: starsRiseMedium 14s linear infinite;
          }
          .stars-fast {
            background-image: radial-gradient(1px 10px at 55% 40%, rgba(255,255,255,0.6), transparent),
                              radial-gradient(1px 10px at 90% 70%, rgba(212,175,55,0.6), transparent);
            animation: starsRiseFast 8s linear infinite;
          }

          @keyframes starsRiseSlow { to { background-position: 0 -180px; } }
          @keyframes starsRiseMedium { to { background-position: 0 -320px; } }
          @keyframes starsRiseFast { to { background-position: 0 -520px; } }

          .logo-float {
            animation: zeroGravity 7.5s ease-in-out infinite;
            filter: drop-shadow(0 0 18px rgba(242,214,117,0.22));
          }

          .logo-float-wrapper:hover .logo-float {
            animation-play-state: paused;
            filter: drop-shadow(0 0 30px rgba(242,214,117,0.45));
          }
          .logo-float-wrapper:hover { transform: scale(1.04); }

          @keyframes zeroGravity {
            0% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-4px) rotate(-0.4deg); }
            50% { transform: translateY(2px) rotate(0.3deg); }
            75% { transform: translateY(-3px) rotate(-0.2deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }

          .logo-hover-text {
            margin-top: 0.35rem;
            font-size: 0.55rem;
            letter-spacing: 0.3em;
            font-weight: 700;
            color: #F7E9A6;
            opacity: 0;
            transition: opacity 150ms ease;
            text-transform: uppercase;
          }
          .logo-hover-zone:hover .logo-hover-text { opacity: 0.85; }

          .upload-btn:hover .upload-shine { transform: translateX(120%); }
        `}</style>
      </aside>

      {/* ✅ Modal outside bar for clean stacking */}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
