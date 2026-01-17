import React, { useState } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useLocation } from "@docusaurus/router";
import { Upload, Satellite, LayoutDashboard, Activity, Hammer, LifeBuoy } from "lucide-react";

type FilterBarProps = {
  collapsed: boolean;
  onToggle: () => void;
  leftOffset?: number;
  morph?: boolean;
  topbarHeight: number;
};

function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  React.useEffect(() => { if (!open) setFile(null); }, [open]);
  if (!open) return null;
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(6, 10, 18, 0.62)", backdropFilter: "blur(10px)" }}>
      <div style={{ width: "min(640px, 92vw)", borderRadius: 18, background: "rgba(18, 26, 40, 0.86)", border: "1px solid rgba(242,214,117,0.22)", boxShadow: "0 22px 60px rgba(0,0,0,0.55)", padding: 24, color: "white" }}>
         <h3>Submit Data File</h3>
         <button onClick={onClose} style={{marginTop: 20, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "white", border: "none", cursor: "pointer"}}>Close</button>
      </div>
    </div>
  );
}

export default function FilterBar({ collapsed, onToggle, leftOffset, morph = false, topbarHeight }: FilterBarProps) {
  const bgUrl = useBaseUrl("/img/mbmc_filterbar_bg.png");
  const [uploadOpen, setUploadOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Summary", to: "/executive_summary", icon: LayoutDashboard },
    { label: "Diagnostic", to: "/diagnostic", icon: Activity },
    { label: "Builder", to: "/builder", icon: Hammer },
    { label: "Support", to: "/support", icon: LifeBuoy },
  ];

  const width = collapsed ? 58 : 250;
  const x = leftOffset ?? 50;
  const EDGE_GAP = 14;
  const safeHeight = `calc(100vh - ${topbarHeight}px - ${EDGE_GAP * 2}px)`;
  const top = `calc(${topbarHeight}px + ${EDGE_GAP}px + (100vh - ${topbarHeight}px - ${EDGE_GAP * 2}px) / 2)`;

  return (
    <>
      <style>{`
        /* === STARFIELD ANIMATION === */
        .shooting-stars { position: absolute; inset: 0; pointer-events: none; overflow: hidden; opacity: 0.6; }
        
        .shooting-stars .stars-slow { 
            position: absolute; inset: -200%; 
            background-image: 
                radial-gradient(2px 7px at 20% 25%, rgba(255, 255, 255, 0.22), transparent), 
                radial-gradient(2px 7px at 55% 60%, rgba(210, 210, 210, 0.2), transparent), 
                radial-gradient(2px 7px at 80% 40%, rgba(212, 175, 55, 0.24), transparent);
            background-size: 200px 200px; 
            animation: starsRiseSlow 70s linear infinite; 
        }
        .shooting-stars .stars-medium { 
            position: absolute; inset: -200%; 
            background-image: 
                radial-gradient(4px 12px at 30% 35%, rgba(255, 255, 255, 0.45), transparent), 
                radial-gradient(4px 12px at 65% 70%, rgba(212, 175, 55, 0.45), transparent);
            background-size: 320px 320px; 
            animation: starsRiseMedium 48s linear infinite; 
        }
        .shooting-stars .stars-fast { 
            position: absolute; inset: -200%; 
            background-image: 
                radial-gradient(8px 22px at 45% 45%, rgba(255, 255, 255, 0.65), transparent), 
                radial-gradient(9px 26px at 70% 65%, rgba(212, 175, 55, 0.7), transparent);
            background-size: 480px 480px; 
            filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.45));
            animation: starsRiseFast 36s linear infinite; 
        }

        @keyframes starsRiseSlow { to { background-position: 0 -900px; } }
        @keyframes starsRiseMedium { to { background-position: 0 -1300px; } }
        @keyframes starsRiseFast { to { background-position: 0 -1800px; } }
        
        /* Nav Buttons */
        .nav-btn { text-decoration: none !important; width: 100%; border-radius: 16px; display: flex; align-items: center; cursor: pointer; backdrop-filter: blur(6px); transition: all 0.2s ease; background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.8); }
        .nav-btn:hover { background: linear-gradient(90deg, rgba(242,214,117,0.30), rgba(255,215,0,0.15)); border-color: rgba(242,214,117,0.9); box-shadow: 0 0 15px rgba(242,214,117,0.3); color: #ffffff; transform: translateX(2px); }
        .nav-btn.active { background: linear-gradient(90deg, rgba(242,214,117,0.40), rgba(242,214,117,0.20)); border-color: rgba(242,214,117,1); color: #F7E9A6; box-shadow: 0 0 20px rgba(242,214,117,0.4); }
      `}</style>

      <aside style={{ position: "fixed", top, left: 0, transform: `translate3d(${x}px, -50%, 0)`, width, height: `min(85vh, ${safeHeight})`, zIndex: 90, borderRadius: "45px", boxShadow: "0 20px 40px -12px rgba(0,0,0,0.45)", overflow: "hidden", backgroundColor: "#0b1e3a", display: "flex", flexDirection: "column", transition: "all 260ms ease" }}>
        
        {/* BG IMAGE */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(4px) brightness(1.05)", transform: "scale(1.05)" }} />
        
        {/* STARS */}
        <div className="shooting-stars">
            <div className="stars-slow" />
            <div className="stars-medium" />
            <div className="stars-fast" />
        </div>

        <div className="scrollbar-hide" style={{ position: "relative", zIndex: 2, flex: 1, overflowY: "auto", overflowX: "clip", padding: collapsed ? "0.95rem 0.4rem" : "1.1rem 0.9rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "1.0rem" }}>
            <button onClick={onToggle} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              <div style={{ width: collapsed ? 42 : 78, height: collapsed ? 42 : 78, borderRadius: 22, display: "grid", placeItems: "center", backdropFilter: "blur(6px)", transition: "all 0.2s" }}>
                <Satellite size={collapsed ? 20 : 30} color="rgba(247,233,166,0.95)" />
              </div>
            </button>
          </div>

          <button onClick={() => setUploadOpen(true)} style={{ position: "relative", width: "100%", borderRadius: "20px", padding: collapsed ? "0.68rem 0.42rem" : "0.72rem 0.8rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, rgba(255,241,186,0.98) 0%, rgba(242,214,117,0.92) 45%, rgba(212,175,55,0.92) 100%)", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
             <Upload size={18} color="#000" />
             {!collapsed && <span style={{ marginLeft: 8, fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", color: "#000" }}>UPLOAD</span>}
          </button>

          <div style={{display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.5rem"}}>
            {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                    <Link key={item.to} to={item.to} className={`nav-btn ${isActive ? "active" : ""}`} style={{ padding: collapsed ? "0.7rem 0" : "0.75rem 0.8rem", justifyContent: collapsed ? "center" : "flex-start" }}>
                        <item.icon size={18} />
                        {!collapsed && <span style={{ marginLeft: "0.8rem", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.label}</span>}
                    </Link>
                );
            })}
          </div>
        </div>
      </aside>
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}