import React, { useState } from "react";

/**
 * 01: BayesianCurveSvg
 * Rich SVG visualization showing prior Bayesian distribution shifting toward converged mastery P(L) >= 0.920.
 * Calibrated to the Espresso & Warm Cream/Lavender editorial palette.
 */
export const BayesianCurveSvg: React.FC = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="p-3.5 rounded-xl bg-[#22130B]/90 border border-[#5A3825]/60 transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-mono text-[11px] font-medium text-[#C4B39F]">
          Bayesian Prior P(L)
        </span>
        <span className="font-mono text-[12px] font-bold text-[#CEA4F2]">
          {hovered ? "0.942 (Mastered)" : "0.58 → 0.94"}
        </span>
      </div>

      {/* SVG Curve Canvas */}
      <div className="relative w-full h-16 my-1">
        <svg
          viewBox="0 0 240 64"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="bayesianGradientEspresso" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CEA4F2" stopOpacity="0.10" />
              <stop offset="60%" stopColor="#CEA4F2" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#F3DEBE" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="lineStrokeEspresso" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8D6B4E" />
              <stop offset="50%" stopColor="#CEA4F2" />
              <stop offset="100%" stopColor="#F3DEBE" />
            </linearGradient>
          </defs>

          {/* Grid Guideline */}
          <line
            x1="0"
            y1="50"
            x2="240"
            y2="50"
            stroke="#4A2E1D"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Floor Threshold Line P(L)=0.92 */}
          <line
            x1="180"
            y1="5"
            x2="180"
            y2="55"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <text
            x="183"
            y="14"
            fill="#34D399"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="bold"
          >
            0.920 FLOOR
          </text>

          {/* Fill Area Under Curve */}
          <path
            d="M 10 50 Q 70 48 110 35 T 180 14 T 230 10 L 230 50 L 10 50 Z"
            fill="url(#bayesianGradientEspresso)"
            className="transition-all duration-700 ease-out"
            style={{
              transformOrigin: "bottom",
              transform: hovered ? "scaleY(1.08)" : "scaleY(1)",
            }}
          />

          {/* Primary Curve Path */}
          <path
            d="M 10 50 Q 70 48 110 35 T 180 14 T 230 10"
            fill="none"
            stroke="url(#lineStrokeEspresso)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Active Data Convergence Point */}
          <circle
            cx="210"
            cy="11"
            r={hovered ? "5" : "3.5"}
            fill="#F3DEBE"
            className="transition-all duration-300"
          />
          <circle
            cx="210"
            cy="11"
            r="8"
            fill="#CEA4F2"
            opacity="0.3"
            className="animate-ping"
          />
        </svg>
      </div>

      <div className="flex justify-between items-center mt-1 text-[10px] font-mono text-[#A89682]">
        <span>Slip: 0.05</span>
        <span>Guess: 0.10</span>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          P(L) Converged
        </span>
      </div>
    </div>
  );
};

/**
 * 02: SandboxTerminalSvg
 * SVG & CSS interactive code sandbox preview with live test assertions.
 */
export const SandboxTerminalSvg: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);

  const handleRerun = () => {
    if (running) return;
    setRunning(true);
    setTimeout(() => {
      setTick((t) => t + 1);
      setRunning(false);
    }, 600);
  };

  return (
    <div className="p-3.5 rounded-xl bg-[#1D1009]/95 border border-[#5A3825]/60 font-mono text-[12px]">
      <div className="flex items-center justify-between text-[11px] text-[#A89682] border-b border-[#3E2416] pb-1 mb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#E6CAA4]"></span>
          <span className="text-[#EDE4D8]">python 3.11 sandbox</span>
        </span>
        <button
          onClick={handleRerun}
          disabled={running}
          className="text-emerald-400 font-bold flex items-center gap-1 hover:text-emerald-300 transition active:scale-95 cursor-pointer"
          title="Re-run invariant suite"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              running ? "bg-amber-400 animate-spin" : "bg-emerald-400 animate-pulse"
            }`}
          />
          {running ? "TESTING..." : "PASS 100%"}
        </button>
      </div>

      <div className="text-[11px] text-[#D5C4B1] space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span className="truncate">&gt; test_memory_layout...</span>
          <span className="text-[#F3DEBE] font-bold ml-2">OK ({2 + (tick % 3)}ms)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="truncate">&gt; test_closure_scope...</span>
          <span className="text-[#F3DEBE] font-bold ml-2">OK ({1 + (tick % 2)}ms)</span>
        </div>
        <div className="flex items-center justify-between border-t border-[#3E2416] pt-1 mt-1">
          <span className="text-[#A89682]">&gt; invariant_assertions</span>
          <span className="text-emerald-400 font-bold">14/14 PASS</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 03: VivaChamberWaveformSvg
 * Socratic oral defense audio waveform with pure CSS transform/opacity motion.
 */
export const VivaChamberWaveformSvg: React.FC = () => {
  return (
    <div className="p-3.5 rounded-xl bg-[#22130B]/90 border border-[#5A3825]/60">
      <div className="flex justify-between items-center text-[11px] font-mono text-[#A89682] mb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CEA4F2] animate-pulse"></span>
          <span className="text-[#EDE4D8]">Socratic Viva Turn #2</span>
        </span>
        <span className="text-[#CEA4F2] font-bold">Trade-Off Defense</span>
      </div>

      {/* Audio Waveform Equalizer Bars */}
      <div className="flex items-center justify-center gap-1 h-7 my-1 px-2 bg-[#1A0E08]/80 rounded-lg border border-[#44281A]">
        {[0.4, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8, 0.3, 0.7, 0.95, 0.4, 0.6, 0.85, 0.5].map(
          (baseHeight, i) => (
            <div
              key={i}
              className="w-1 bg-[#CEA4F2] rounded-full transition-transform duration-300"
              style={{
                height: "100%",
                transform: `scaleY(${baseHeight})`,
                animation: `waveformPulse 1.4s ease-in-out infinite alternate ${i * 0.08}s`,
                transformOrigin: "center",
              }}
            />
          )
        )}
      </div>

      <p className="text-[11px] text-[#CFC2B4] italic mt-2">
        "Explain why generators preserve O(1) memory during high-volume stream ingestion."
      </p>
    </div>
  );
};

/**
 * 04: CryptographicSealSvg
 * Ed25519 verifiable credential seal with rotating geometric ring and signature details.
 */
export const CryptographicSealSvg: React.FC = () => {
  return (
    <div className="p-3.5 rounded-xl bg-[#22130B]/90 border border-[#5A3825]/60 font-mono">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] text-[#A89682] uppercase">Cryptographic Seal</div>
        <div className="text-[10px] font-mono text-[#F3DEBE] font-bold bg-[#381F13] px-1.5 py-0.5 rounded border border-[#5A3825]">
          Ed25519 SHA-256
        </div>
      </div>

      <div className="flex items-center gap-3 my-1">
        {/* SVG Concentric Security Seal */}
        <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke="#E6CAA4"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              className="origin-center"
              style={{ animation: "spinSlow 16s linear infinite" }}
            />
            <circle
              cx="20"
              cy="20"
              r="13"
              fill="#341E15"
              stroke="#CEA4F2"
              strokeWidth="1"
            />
          </svg>
          <span className="material-symbols-outlined text-[15px] text-[#E6CAA4] absolute">
            verified
          </span>
        </div>

        <div className="min-w-0">
          <div className="text-[11.5px] text-[#FEF5E5] font-bold truncate">
            CERT-2026-PY-88914
          </div>
          <div className="text-[9.5px] text-[#A89682] truncate font-mono">
            sig: 9f8a...3b21-ed25519
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-[#3E2416] flex items-center justify-between text-[10px] text-[#A89682]">
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">check_circle</span>
          Verified Dossier
        </span>
        <span className="text-[#EDE4D8] font-medium">Foundation Tier</span>
      </div>
    </div>
  );
};
