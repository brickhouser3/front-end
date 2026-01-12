import React, { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import useBaseUrl from "@docusaurus/useBaseUrl";

import { useUser } from "../../context/UserContext";

export default function LandingUI() {
  const [launching, setLaunching] = useState(false);
  const [boost, setBoost] = useState(false);

  // 👇 Local display name (authoritative for landing page)
  const [displayName, setDisplayName] = useState("Traveler");

  const { firstName: contextFirstName } = useUser();
  const execUrl = useBaseUrl("/executive_summary");

  /* ======================================================
     NAME RESOLUTION (SINGLE SOURCE OF TRUTH)
  ====================================================== */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("firstName");

    if (stored) {
      setDisplayName(stored);
    } else if (contextFirstName) {
      // fallback to context once
      localStorage.setItem("firstName", contextFirstName);
      setDisplayName(contextFirstName);
    } else {
      localStorage.setItem("firstName", "Traveler");
      setDisplayName("Traveler");
    }
  }, [contextFirstName]);

  const handleLaunch = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    setBoost(true);
    setTimeout(() => setLaunching(true), 120);
    setTimeout(() => {
      window.location.href = execUrl;
    }, 750);
  };

  return (
    <div className={`launch-bg ${launching ? "launching" : ""}`}>
      {/* DARK OVERLAY */}
      <div className="dark-overlay" />

      {/* CONTENT STAGE */}
      <div className={`shake-layer ${boost ? "shake" : ""}`}>
        {/* STARFIELDS */}
        <div className="stars stars-slow" />
        <div className="stars stars-medium" />
        <div className="stars stars-fast" />

        {/* ✅ CORRECT NAME */}
        <div className="welcome-text">
          Welcome, {displayName}
        </div>

        {/* LOGO */}
        <div className={`logo-glow-wrapper ${boost ? "boost" : ""}`}>
          <img
            src={useBaseUrl("/img/mbmc_logo.png")}
            alt="Mission Control"
            className="logo-img"
          />
          <div className="logo-thrust" />
        </div>

        {/* CTA */}
        <a href={execUrl} className="launch-cta" onClick={handleLaunch}>
          <span className="launch-text">LAUNCH</span>
          <ArrowDown className="launch-arrow" size={22} />
        </a>
      </div>

      {/* =============================
         STYLES
      ==============================*/}
      <style>{`
        .launch-bg {
          position: fixed;
          inset: 0;
          background-image: url('${useBaseUrl("/img/launch_bg.png")}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          color: #ffffff;
          overflow: hidden;
          isolation: isolate;
          font-family: Inter, system-ui, sans-serif;
        }

        .launch-bg.launching {
          transform: translateY(-100vh);
          opacity: 0;
          transition:
            transform 0.75s cubic-bezier(0.22,1,0.36,1),
            opacity 0.6s ease;
        }

        .dark-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            rgba(6, 14, 38, 0.7),
            rgba(4, 8, 26, 0.9)
          );
          z-index: 0;
        }

        .shake-layer {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          max-width: 960px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .shake-layer.shake {
          animation: cameraShake 0.12s linear;
        }

        @keyframes cameraShake {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-1px, 1px); }
          50% { transform: translate(1px, -1px); }
          75% { transform: translate(-1px, 0); }
          100% { transform: translate(0, 0); }
        }

        .stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .stars-slow {
          background-image:
            radial-gradient(1px 6px at 20% 20%, rgba(255,255,255,0.45), transparent),
            radial-gradient(1px 6px at 60% 70%, rgba(212,175,55,0.45), transparent);
          animation: starsRiseSlow 22s linear infinite;
        }

        .stars-medium {
          background-image:
            radial-gradient(1px 8px at 35% 50%, rgba(255,255,255,0.55), transparent),
            radial-gradient(1px 8px at 75% 15%, rgba(212,175,55,0.55), transparent);
          animation: starsRiseMedium 12s linear infinite;
        }

        .stars-fast {
          background-image:
            radial-gradient(1px 10px at 50% 30%, rgba(255,255,255,0.65), transparent),
            radial-gradient(1px 10px at 85% 55%, rgba(212,175,55,0.65), transparent);
          animation: starsRiseFast 6s linear infinite;
        }

        @keyframes starsRiseSlow { to { background-position: 0 -180px; } }
        @keyframes starsRiseMedium { to { background-position: 0 -320px; } }
        @keyframes starsRiseFast { to { background-position: 0 -520px; } }

        .welcome-text {
          font-size: 0.9rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.8;
          margin-bottom: 1rem;
        }

        .logo-glow-wrapper {
          position: relative;
          margin-bottom: 2.25rem;
        }

        .logo-glow-wrapper::before {
          content: "";
          position: absolute;
          inset: -30%;
          background: radial-gradient(
            circle,
            rgba(212,175,55,0.35),
            transparent 65%
          );
          filter: blur(42px);
        }

        .logo-img {
          width: min(360px, 75vw);
          max-width: 100%;
          height: auto;
          display: block;
        }

        .logo-thrust {
          position: absolute;
          top: 100%;
          left: 50%;
          width: 110px;
          height: 200px;
          transform: translateX(-50%);
          background: radial-gradient(
            ellipse at top,
            rgba(212,175,55,0.4),
            transparent 70%
          );
          filter: blur(26px);
          animation: thrustIdle 1.2s ease-in-out infinite;
        }

        .boost .logo-thrust {
          animation: thrustBoost 0.2s ease-out forwards;
        }

        @keyframes thrustIdle {
          0% { opacity: 0.6; }
          50% { opacity: 0.85; }
          100% { opacity: 0.6; }
        }

        @keyframes thrustBoost {
          from { opacity: 0.7; transform: translateX(-50%) scaleY(1); }
          to { opacity: 1; transform: translateX(-50%) scaleY(1.35); }
        }

        .launch-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          color: #ffffff;
          text-decoration: none;
          margin-top: 0.5rem;
        }

        .launch-text {
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.22em;
        }

        .launch-arrow {
          animation: launchBob 1.8s ease-in-out infinite;
        }

        @keyframes launchBob {
          0% { transform: translateY(0); }
          50% { transform: translateY(10px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
