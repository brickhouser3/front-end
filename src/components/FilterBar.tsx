import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  ChevronDown,
  Clock,
  Map,
  Layers,
  Target,
  Package,
} from "lucide-react";

/* ======================================================
   DROPDOWN
====================================================== */

function Dropdown({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(options[0]);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
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
          }}
        >
          {options.map(opt => (
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
                  opt === value
                    ? "rgba(255,255,255,0.14)"
                    : "transparent",
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
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          border: "1px solid rgba(242,214,117,0.28)",
          borderRadius: "9px",
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
   FILTER BAR
====================================================== */

export default function FilterBar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const width = collapsed ? 64 : 260;
  const bgUrl = useBaseUrl("/img/mbmc_filterbar_bg.png");
  const logoUrl = useBaseUrl("/img/mbmc_logo.png");

  const firstName =
    typeof window !== "undefined"
      ? localStorage.getItem("firstName") || "Traveler"
      : "Traveler";

  return (
    <aside
      className="filterbar-root"
      style={{
        width,
        minWidth: width,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "width 220ms ease",
      }}
    >
      {/* BACKGROUND */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "auto 100%",
          filter: "blur(4px) brightness(1.05)",
          transform: "scale(1.05)",
        }}
      />

      {/* STARS */}
      <div className="stars stars-slow" />
      <div className="stars stars-medium" />
      <div className="stars stars-fast" />

      {/* CONTENT */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          padding: collapsed ? "0.9rem 0.45rem" : "1.1rem 0.9rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* LOGO */}
        <div
          className="logo-hover-zone"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "1.4rem",
          }}
        >
          <button
            onClick={onToggle}
            className="logo-float-wrapper"
            style={{ background: "none", border: "none", padding: 0 }}
          >
            <img
              src={logoUrl}
              alt="Filters"
              className="logo-float"
              style={{
                width: collapsed ? 72 : 115,
                transition: "width 220ms ease",
              }}
            />
          </button>

          <div className="logo-hover-text">
            {collapsed ? "FILTER" : "COLLAPSE"}
          </div>
        </div>

        {/* FILTER GROUPS */}
        {!collapsed && (
          <>
            <Section title="Time" icon={Clock}>
              <Dropdown label="Period" options={["YTD", "QTD", "MTD", "L4W", "L12W", "L52W"]} />
            </Section>

            <Section title="Geography" icon={Map}>
              <Dropdown label="Level" options={["Region", "State", "Wholesaler"]} />
            </Section>

            <Section title="Channel" icon={Layers}>
              <Dropdown label="View" options={["Macro", "Planning", "Sub"]} />
            </Section>

            <Section title="Decision Point" icon={Target}>
              <Dropdown label="Type" options={["Position", "Name"]} />
            </Section>

            <Section title="Product" icon={Package}>
              <Dropdown label="Dimension" options={["Brand Flag", "Type", "Megabrand", "WAMP"]} />
            </Section>
          </>
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
            }}
          >
            Welcome, {firstName}
          </div>
        )}
      </div>

      {/* =============================
         ANIMATIONS
      ==============================*/}
      <style>{`
        .stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .stars-slow {
          background-image:
            radial-gradient(1px 6px at 20% 20%, rgba(255,255,255,0.35), transparent),
            radial-gradient(1px 6px at 70% 80%, rgba(212,175,55,0.35), transparent);
          animation: starsRiseSlow 22s linear infinite;
        }

        .stars-medium {
          background-image:
            radial-gradient(1px 8px at 40% 60%, rgba(255,255,255,0.45), transparent),
            radial-gradient(1px 8px at 80% 30%, rgba(212,175,55,0.45), transparent);
          animation: starsRiseMedium 14s linear infinite;
        }

        .stars-fast {
          background-image:
            radial-gradient(1px 10px at 55% 40%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 10px at 90% 70%, rgba(212,175,55,0.6), transparent);
          animation: starsRiseFast 8s linear infinite;
        }

        @keyframes starsRiseSlow { to { background-position: 0 -180px; } }
        @keyframes starsRiseMedium { to { background-position: 0 -320px; } }
        @keyframes starsRiseFast { to { background-position: 0 -520px; } }

        .logo-float {
          animation: zeroGravity 7.5s ease-in-out infinite;
          filter: drop-shadow(0 0 18px rgba(242,214,117,0.35));
        }

        .logo-float-wrapper:hover .logo-float {
          animation-play-state: paused;
          filter: drop-shadow(0 0 30px rgba(242,214,117,0.6));
          transform: scale(1.04);
        }

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

        .logo-hover-zone:hover .logo-hover-text {
          opacity: 0.85;
        }
      `}</style>
    </aside>
  );
}
