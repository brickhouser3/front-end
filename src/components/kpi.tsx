import React from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Share2,
  MapPin,
  Activity,
  Megaphone,
  Target,
} from "lucide-react";

/* =========================
   ICON MAP
========================= */
const ICONS: Record<string, React.ReactNode> = {
  volume: <BarChart3 size={18} />,
  revenue: <DollarSign size={18} />,
  share: <Share2 size={18} />,
  pods: <MapPin size={18} />,
  taps: <Activity size={18} />,
  displays: <Megaphone size={18} />,
  avd: <Activity size={18} />,
  adshare: <Share2 size={18} />,
};

/* =========================
   KPI CARD
========================= */
export default function KPI({
  label,
  labelColor,
  value,
  vsYTD,
  vsLastMonth,
  vsTarget,          // ✅ NEW
  icon,
  iconBg,
  active,
  onIconClick,
}: {
  label: string;
  labelColor?: string;
  value: string;
  vsYTD: number;
  vsLastMonth: number;
  vsTarget?: number; // percent vs target
  icon: string;
  iconBg?: string;
  active?: boolean;
  onIconClick?: () => void;
}) {
  return (
    <div
      onClick={onIconClick}
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        cursor: "pointer",

        boxShadow: active
          ? `0 0 0 2px ${iconBg ?? "#CBD5E1"}, 0 12px 26px rgba(10,22,51,0.14)`
          : "0 8px 20px rgba(10,22,51,0.08)",

        transform: active ? "translateY(-1px)" : "translateY(0)",
        transition: "transform 140ms ease, box-shadow 140ms ease",
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 12px 26px rgba(10,22,51,0.14)";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 8px 20px rgba(10,22,51,0.08)";
        }
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.85rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: labelColor ?? "#0A1633",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>

        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: iconBg ?? "#E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0A1633",
            transform: active ? "scale(1.05)" : "scale(1)",
            transition: "transform 200ms ease",
          }}
        >
          {ICONS[icon]}
        </div>
      </div>

      {/* MAIN VALUE */}
      <div
        style={{
          fontSize: "1.65rem",
          fontWeight: 700,
          color: "#0A1633",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>

      {/* AGAINST TARGET (NEW) */}
      {typeof vsTarget === "number" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.7rem",
            fontWeight: 600,
            color: vsTarget >= 0 ? "#166534" : "#b91c1c",
            opacity: 0.9,
          }}
        >
          <Target size={13} />
          vs Target: {vsTarget >= 0 ? "+" : ""}
          {vsTarget}%
        </div>
      )}

      {/* COMPARISONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.75rem",
          marginTop: "0.15rem",
        }}
      >
        <Comparison label="YTD" value={vsYTD} />
        <Comparison label="MoM" value={vsLastMonth} />
      </div>
    </div>
  );
}

/* =========================
   COMPARISON CHIP
========================= */
function Comparison({ label, value }: { label: string; value: number }) {
  const positive = value > 0;

  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        alignItems: "center",
        color: positive ? "#166534" : "#b91c1c",
        fontWeight: 600,
      }}
    >
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {label}: {positive ? "+" : ""}
      {value}%
    </div>
  );
}
