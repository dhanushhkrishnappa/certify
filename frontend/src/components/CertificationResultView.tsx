import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext.js";

interface CertificationResultViewProps {
  courseSlug: string;
  onNavigate: (view: string) => void;
  onViewCredential?: (credId: string) => void;
  onReturnDashboard?: () => void;
}

export const CertificationResultView: React.FC<CertificationResultViewProps> = ({
  courseSlug: _courseSlug,
  onNavigate,
  onViewCredential,
}) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [copied, setCopied] = useState(false);
  const credentialId = "CERT-PY-2026-001842";

  const handleCopyId = () => {
    navigator.clipboard.writeText(credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewCert = () => {
    if (onViewCredential) {
      onViewCredential(credentialId);
    } else {
      onNavigate("credential-details");
    }
  };

  return (
    <div className={`space-y-6 pb-12 font-sans transition-colors duration-300 ${
      isLight ? "text-slate-900" : "text-slate-100"
    }`}>
      {/* Page Header Title Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm font-medium mb-1 ${
            isLight ? "text-slate-700" : "text-purple-200/70"
          }`}>
            <button onClick={() => onNavigate("credentials")} className={`transition ${isLight ? "hover:text-purple-900 cursor-pointer" : "hover:text-white"}`}>
              My Credentials
            </button>
            <span className={isLight ? "text-purple-900/40 font-normal" : "text-purple-300/40 font-normal"}>&gt;</span>
            <button onClick={() => onNavigate("course-details")} className={`transition ${isLight ? "hover:text-purple-900 cursor-pointer" : "hover:text-white"}`}>
              Python Fundamentals
            </button>
            <span className={isLight ? "text-purple-900/40 font-normal" : "text-purple-300/40 font-normal"}>&gt;</span>
            <span className={isLight ? "text-purple-950 font-bold" : "text-white font-semibold"}>Result</span>
          </nav>
          <h1 className={`text-3xl font-['Newsreader',serif] font-bold tracking-tight ${
            isLight ? "text-slate-900" : "text-white"
          }`}>
            Certification Result
          </h1>
          <p className={`text-sm mt-1 font-normal ${
            isLight ? "text-slate-700" : "text-purple-200/80"
          }`}>
            Here's how you performed and how your certification was earned.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "Certify Result - Python Fundamentals",
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer ${
              isLight
                ? "border-purple-900/15 bg-white hover:bg-purple-50 text-slate-800 shadow-sm"
                : "border-white/[0.08] bg-[#111111] hover:bg-white/[0.05] text-white"
            }`}
          >
            <svg className={`w-4 h-4 ${isLight ? "text-purple-600" : "text-neutral-400"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Share Result
          </button>
          <button
            onClick={handleViewCert}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5d3df3] hover:bg-[#4e2fe0] text-white text-xs font-semibold shadow-md transition active:scale-[0.98] cursor-pointer"
          >
            View Certificate
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Grid: Left Main Panel (Col 9) + Right Rail (Col 3) */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Primary Column */}
        <div className="col-span-12 xl:col-span-9 space-y-6">
          {/* Hero Celebration Card */}
          <section className={`relative overflow-hidden rounded-2xl border p-7 shadow-sm transition-all duration-300 ${
            isLight
              ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
              : "bg-[#111111] border-white/[0.08] text-white"
          }`}>
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Info Details */}
              <div className="max-w-xl space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-sm p-2 flex-shrink-0 ${
                    isLight ? "bg-purple-50 border-purple-200" : "bg-neutral-900 border-white/[0.08]"
                  }`}>
                    <svg className="w-full h-full" fill="none" viewBox="0 0 110 110">
                      <path d="M54.1 2C27.5 2 29.1 13.5 29.1 13.5L29.2 25.4H55V29H18.2C1.7 29 0 42.4 0 42.4L0 55.4C0 67.5 10.7 68.3 10.7 68.3H18.1V58C18.1 45.4 29 45.6 29 45.6H54.4C64.6 45.6 64.9 35.8 64.9 35.8V11.8C64.9 11.8 66.8 2 54.1 2ZM39.6 9.4C43.1 9.4 46 12.3 46 15.8C46 19.3 43.1 22.2 39.6 22.2C36.1 22.2 33.2 19.3 33.2 15.8C33.2 12.3 36.1 9.4 39.6 9.4Z" fill="#387eb8" />
                      <path d="M55.9 108C82.5 108 80.9 96.5 80.9 96.5L80.8 84.6H55V81H91.8C108.3 81 110 67.6 110 67.6L110 54.6C110 42.5 99.3 41.7 99.3 41.7H91.9V52C91.9 64.6 81 64.4 81 64.4H55.6C45.4 64.4 45.1 74.2 45.1 74.2V98.2C45.1 98.2 43.2 108 55.9 108ZM70.4 100.6C66.9 100.6 64 97.7 64 94.2C64 90.7 66.9 87.8 70.4 87.8C73.9 87.8 76.8 90.7 76.8 94.2C76.8 97.7 73.9 100.6 70.4 100.6Z" fill="#ffe052" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif] leading-snug ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}>
                      Python Fundamentals
                    </h2>
                    <p className={`text-xs font-medium ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Certification Successfully Earned</p>
                  </div>
                </div>

                <div className="pt-1">
                  <h3 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}>
                    Congratulations! <span className="text-2xl">🎉</span>
                  </h3>
                  <p className={`text-sm mt-1 leading-relaxed ${
                    isLight ? "text-slate-600" : "text-neutral-300"
                  }`}>
                    You have demonstrated strong understanding and practical skills in Python Fundamentals.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleViewCert}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#5d3df3] hover:bg-[#4e2fe0] text-white text-xs font-semibold shadow-md transition active:scale-[0.98] cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    View Certificate
                  </button>
                  <button
                    onClick={() => window.print()}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer ${
                      isLight
                        ? "border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-900"
                        : "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white"
                    }`}
                  >
                    <svg className={`w-4 h-4 ${isLight ? "text-purple-600" : "text-neutral-400"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Right Medallion & Quote */}
              <div className={`flex items-center gap-6 lg:border-l lg:pl-8 ${
                isLight ? "lg:border-purple-200/60" : "lg:border-white/[0.08]"
              }`}>
                {/* Golden Seal Medallion Graphic */}
                <div className="relative flex flex-col items-center flex-shrink-0">
                  <div className="w-36 h-36 relative flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full drop-shadow-md" viewBox="0 0 160 160">
                      <defs>
                        <linearGradient id="goldGrad" x1="0" x2="1" y1="0" y2="1">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="45%" stopColor="#facc15" />
                          <stop offset="75%" stopColor="#eab308" />
                          <stop offset="100%" stopColor="#ca8a04" />
                        </linearGradient>
                      </defs>
                      <g fill="#d49b28">
                        <path d="M42 110C35 98 32 82 36 67C37 63 35 60 32 62C28 66 26 77 28 89C30 100 36 111 42 118Z" opacity="0.8" />
                        <path d="M48 90C43 80 42 66 47 54C48 51 45 49 43 51C39 55 37 66 38 76C40 85 44 94 48 98Z" />
                        <path d="M56 70C53 60 54 48 60 38C61 35 59 33 57 35C53 39 50 49 50 58C51 66 54 73 57 77Z" />
                      </g>
                      <g fill="#d49b28">
                        <path d="M118 110C125 98 128 82 124 67C123 63 125 60 128 62C132 66 134 77 132 89C130 100 124 111 118 118Z" opacity="0.8" />
                        <path d="M112 90C117 80 118 66 113 54C112 51 115 49 117 51C121 55 123 66 122 76C120 85 116 94 112 98Z" />
                        <path d="M104 70C107 60 106 48 100 38C99 35 101 33 103 35C107 39 110 49 110 58C109 66 106 73 103 77Z" />
                      </g>
                      <circle cx="80" cy="72" fill="url(#goldGrad)" r="48" stroke="#c48f22" strokeWidth="2.5" />
                      <circle cx="80" cy="72" fill="none" r="44" stroke="#fef08a" strokeDasharray="3 2" strokeWidth="1.2" />
                      <path d="M68 114L60 148L72 140L80 148L80 114Z" fill="#1e293b" opacity="0.9" />
                      <path d="M92 114L100 148L88 140L80 148L80 114Z" fill="#0f172a" />
                    </svg>

                    <div className="relative z-10 text-center flex flex-col items-center justify-center -mt-3">
                      <div className="w-3.5 h-3.5 border border-amber-900/60 rotate-45 mb-0.5"></div>
                      <span className="text-[9px] font-black tracking-widest text-amber-950 uppercase leading-none">CERTIFY</span>
                      <span className="text-[8.5px] font-extrabold text-amber-900 mt-1 uppercase tracking-wider">INTERMEDIATE</span>
                      <div className="flex items-center gap-0.5 my-0.5 text-amber-900 text-[8px]">
                        ★ ★ ★ ★ ★
                      </div>
                      <span className="text-[7.5px] font-bold text-amber-950 tracking-wider">LEVEL</span>
                    </div>
                  </div>
                </div>

                <div className="max-w-[160px] text-left">
                  <p className={`font-['Newsreader',serif] italic text-sm leading-snug ${
                    isLight ? "text-slate-800" : "text-neutral-200"
                  }`}>
                    “Discipline today, expertise tomorrow.”
                  </p>
                  <div className="w-8 h-0.5 bg-amber-500 my-2"></div>
                  <p className={`text-[11px] font-medium ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Keep learning.<br />Keep building.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Row (3 KPI Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Overall Result */}
            <div className={`rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition-all duration-300 ${
              isLight
                ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
                : "bg-[#111111] border-white/[0.08] text-white"
            }`}>
              <h4 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Overall Result</h4>
              <div className="relative w-32 h-32 mx-auto my-3 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" fill="transparent" r="50" stroke={isLight ? "rgba(109, 40, 217, 0.1)" : "rgba(255, 255, 255, 0.08)"} strokeWidth="9" />
                  <circle cx="60" cy="60" fill="transparent" r="50" stroke="#00c48c" strokeDasharray="314.15" strokeDashoffset="40.8" strokeLinecap="round" strokeWidth="9" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={`text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-none ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}>87%</span>
                  <span className={`text-[10px] font-medium mt-1 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Overall Score</span>
                </div>
              </div>
              <div className={`flex items-center gap-2.5 p-2 rounded-xl text-xs border ${
                isLight ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-emerald-950/40 border-emerald-800/40"
              }`}>
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                  ✓
                </div>
                <div className="leading-tight">
                  <span className="font-bold text-emerald-600 text-[11px] block uppercase">PASSED</span>
                  <span className={`text-[10px] ${isLight ? "text-slate-600" : "text-neutral-300"}`}>You've met all the requirements for certification at the Intermediate level.</span>
                </div>
              </div>
            </div>

            {/* Card 2: Performance Breakdown */}
            <div className={`rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition-all duration-300 ${
              isLight
                ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
                : "bg-[#111111] border-white/[0.08] text-white"
            }`}>
              <h4 className={`text-sm font-bold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Performance Breakdown</h4>
              <div className="space-y-3.5 my-auto">
                <div>
                  <div className={`flex justify-between text-xs font-semibold mb-1 ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                    <span>Conceptual Understanding</span>
                    <span className={isLight ? "text-slate-900 font-bold" : "text-white"}>92%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? "bg-purple-100" : "bg-white/[0.08]"}`}>
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                <div>
                  <div className={`flex justify-between text-xs font-semibold mb-1 ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                    <span>Practical Implementation</span>
                    <span className={isLight ? "text-slate-900 font-bold" : "text-white"}>84%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? "bg-purple-100" : "bg-white/[0.08]"}`}>
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "84%" }}></div>
                  </div>
                </div>
                <div>
                  <div className={`flex justify-between text-xs font-semibold mb-1 ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                    <span>Problem Solving &amp; Reasoning</span>
                    <span className={isLight ? "text-slate-900 font-bold" : "text-white"}>81%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? "bg-purple-100" : "bg-white/[0.08]"}`}>
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: "81%" }}></div>
                  </div>
                </div>
                <div>
                  <div className={`flex justify-between text-xs font-semibold mb-1 ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                    <span>AI Viva / Defense</span>
                    <span className={isLight ? "text-slate-900 font-bold" : "text-white"}>88%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? "bg-purple-100" : "bg-white/[0.08]"}`}>
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "88%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Percentile Rank */}
            <div className={`rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition-all duration-300 ${
              isLight
                ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
                : "bg-[#111111] border-white/[0.08] text-white"
            }`}>
              <div>
                <h4 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Percentile Rank</h4>
                <div className="mt-2">
                  <h3 className={`text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] ${isLight ? "text-purple-950 font-bold" : "text-white"}`}>Top 12%</h3>
                  <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>You performed better than 88% of learners.</p>
                </div>
              </div>
              <div className="pt-4 flex flex-col items-center">
                <div className="w-full flex items-end justify-between h-20 gap-1.5 px-2">
                  <div className={`w-full rounded-t h-[20%] ${isLight ? "bg-purple-100" : "bg-white/[0.06]"}`}></div>
                  <div className={`w-full rounded-t h-[30%] ${isLight ? "bg-purple-200" : "bg-white/[0.06]"}`}></div>
                  <div className={`w-full rounded-t h-[48%] ${isLight ? "bg-purple-300" : "bg-white/[0.1]"}`}></div>
                  <div className={`w-full rounded-t h-[65%] ${isLight ? "bg-purple-400" : "bg-white/[0.1]"}`}></div>
                  <div className={`w-full rounded-t h-[80%] ${isLight ? "bg-purple-500" : "bg-indigo-950/60"}`}></div>
                  <div className="w-full bg-[#5d3df3] rounded-t h-[98%] shadow-sm relative"></div>
                  <div className={`w-full rounded-t h-[86%] ${isLight ? "bg-purple-500" : "bg-indigo-950/60"}`}></div>
                  <div className={`w-full rounded-t h-[68%] ${isLight ? "bg-purple-300" : "bg-white/[0.1]"}`}></div>
                </div>
                <div className={`w-full border-t mt-1 flex justify-center ${isLight ? "border-purple-200" : "border-white/[0.08]"}`}>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider mt-1 ${isLight ? "text-purple-700" : "text-neutral-400"}`}>You</span>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation Components Pipeline (5 nodes) */}
          <section className={`rounded-2xl border p-6 shadow-sm transition-all duration-300 ${
            isLight
              ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
              : "bg-[#111111] border-white/[0.08] text-white"
          }`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Evaluation Components</h3>
              <span className={`text-xs font-semibold ${isLight ? "text-purple-700" : "text-indigo-400"}`}>Verifiable Evidence</span>
            </div>
            <p className={`text-xs mb-5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              Your certification is based on multiple checkpoints to ensure a comprehensive evaluation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {/* Node 1 */}
              <div className={`border rounded-xl p-3.5 flex flex-col justify-between ${
                isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-950/50 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-800/30">
                    LP
                  </div>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                </div>
                <div className="mt-3">
                  <p className={`text-[11px] font-semibold ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Learning Progress</p>
                  <p className={`text-lg font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>100%</p>
                  <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-500"}`}>8/8 modules</p>
                </div>
              </div>

              {/* Node 2 */}
              <div className={`border rounded-xl p-3.5 flex flex-col justify-between ${
                isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-purple-950/50 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-800/30">
                    CA
                  </div>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                </div>
                <div className="mt-3">
                  <p className={`text-[11px] font-semibold ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Chapter Assessments</p>
                  <p className={`text-lg font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>88%</p>
                  <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-500"}`}>32/36 questions</p>
                </div>
              </div>

              {/* Node 3 */}
              <div className={`border rounded-xl p-3.5 flex flex-col justify-between ${
                isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-violet-950/50 text-violet-400 flex items-center justify-center font-mono font-bold text-xs border border-violet-800/30">
                    &lt;/&gt;
                  </div>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                </div>
                <div className="mt-3">
                  <p className={`text-[11px] font-semibold ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Practical Project</p>
                  <p className={`text-lg font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>85%</p>
                  <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-500"}`}>Project completed</p>
                </div>
              </div>

              {/* Node 4 */}
              <div className={`border rounded-xl p-3.5 flex flex-col justify-between ${
                isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950/50 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-800/30">
                    FA
                  </div>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                </div>
                <div className="mt-3">
                  <p className={`text-[11px] font-semibold ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Final Assessment</p>
                  <p className={`text-lg font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>82%</p>
                  <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-500"}`}>41/50 questions</p>
                </div>
              </div>

              {/* Node 5 */}
              <div className={`border rounded-xl p-3.5 flex flex-col justify-between ${
                isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-sky-950/50 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-800/30">
                    VD
                  </div>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                </div>
                <div className="mt-3">
                  <p className={`text-[11px] font-semibold ${isLight ? "text-slate-600" : "text-neutral-400"}`}>AI Viva / Defense</p>
                  <p className={`text-lg font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>88%</p>
                  <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-500"}`}>Completed</p>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Performance Table & Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Detailed Performance Table (8 cols) */}
            <div className={`lg:col-span-8 rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
              isLight
                ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
                : "bg-[#111111] border-white/[0.08] text-white"
            }`}>
              <h3 className={`text-sm font-bold mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>Detailed Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`font-medium border-b ${isLight ? "text-slate-600 border-purple-100" : "text-neutral-400 border-white/[0.08]"}`}>
                      <th className="pb-2.5 font-medium">Component</th>
                      <th className="pb-2.5 font-medium">Score</th>
                      <th className="pb-2.5 font-medium">Status</th>
                      <th className="pb-2.5 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? "divide-purple-100" : "divide-white/[0.06]"}`}>
                    {[
                      { name: "Module 1: Introduction", score: "95%", count: "19/20" },
                      { name: "Module 2: Control Flow", score: "88%", count: "22/25" },
                      { name: "Module 3: Functions", score: "80%", count: "16/20" },
                      { name: "Module 4: Data Structures", score: "85%", count: "17/20" },
                      { name: "Module 5: File Handling", score: "90%", count: "18/20" },
                      { name: "Module 6: OOP in Python", score: "82%", count: "18/22" },
                      { name: "Module 7: Modules & Packages", score: "78%", count: "14/18" },
                      { name: "Module 8: Final Project", score: "92%", count: "Project evaluated" },
                    ].map((m, idx) => (
                      <tr key={idx} className={`transition-colors ${isLight ? "hover:bg-purple-50/50" : "hover:bg-white/[0.03]"}`}>
                        <td className={`py-2.5 font-medium ${isLight ? "text-slate-800" : "text-neutral-200"}`}>{m.name}</td>
                        <td className={`py-2.5 font-semibold ${isLight ? "text-slate-900 font-bold" : "text-white"}`}>{m.score}</td>
                        <td className="py-2.5">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center text-[9px]">✓</span> Passed
                          </span>
                        </td>
                        <td className={`py-2.5 font-mono text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>{m.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Skills Demonstrated Tag Pills (4 cols) */}
            <div className={`lg:col-span-4 rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
              isLight
                ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
                : "bg-[#111111] border-white/[0.08] text-white"
            }`}>
              <h3 className={`text-sm font-bold mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>Skills Demonstrated</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Python Syntax",
                  "Data Types",
                  "Control Flow",
                  "Functions",
                  "Data Structures",
                  "File Handling",
                  "OOP",
                  "Modules & Packages",
                  "Error Handling",
                  "Problem Solving",
                  "Code Organization",
                  "Project Development",
                ].map((skill, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-default border ${
                      isLight
                        ? "bg-purple-50 text-purple-900 border-purple-200 font-medium"
                        : "bg-white/[0.06] text-purple-200 border-white/[0.06]"
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Rail */}
        <aside className="col-span-12 xl:col-span-3 space-y-5">
          {/* Card 1: Credential Information */}
          <div className={`rounded-2xl border p-5 shadow-sm space-y-4 transition-all duration-300 ${
            isLight
              ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
              : "bg-[#111111] border-white/[0.08] text-white"
          }`}>
            <h4 className={`text-sm font-bold border-b pb-3 ${isLight ? "border-purple-100 text-slate-900" : "border-white/[0.08] text-white"}`}>Credential Information</h4>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold font-mono border ${
                  isLight ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white/[0.06] text-indigo-400 border-white/[0.06]"
                }`}>
                  #
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`block text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Credential ID</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`font-mono font-medium text-xs truncate ${isLight ? "text-slate-900 font-semibold" : "text-white"}`}>{credentialId}</span>
                    <button onClick={handleCopyId} className={`transition cursor-pointer ${isLight ? "text-purple-600 hover:text-purple-900" : "text-neutral-400 hover:text-white"}`} title="Copy ID">
                      <span className="text-xs">{copied ? "✓" : "📋"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                  isLight ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white/[0.06] text-indigo-400 border-white/[0.06]"
                }`}>
                  📚
                </div>
                <div>
                  <span className={`block text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Course</span>
                  <p className={`font-semibold mt-0.5 ${isLight ? "text-slate-900" : "text-white"}`}>Python Fundamentals</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                  isLight ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white/[0.06] text-indigo-400 border-white/[0.06]"
                }`}>
                  🎖️
                </div>
                <div>
                  <span className={`block text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Certification Level</span>
                  <p className={`font-semibold mt-0.5 ${isLight ? "text-slate-900" : "text-white"}`}>Intermediate</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                  isLight ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white/[0.06] text-indigo-400 border-white/[0.06]"
                }`}>
                  📅
                </div>
                <div>
                  <span className={`block text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Issue Date</span>
                  <p className={`font-semibold mt-0.5 ${isLight ? "text-slate-900" : "text-white"}`}>23 September 2026</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center flex-shrink-0 font-bold">
                  ✓
                </div>
                <div>
                  <span className={`block text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Status</span>
                  <p className="font-semibold text-emerald-600 mt-0.5">Verified &amp; Active</p>
                </div>
              </div>
            </div>

            <div className={`pt-2 border-t ${isLight ? "border-purple-100" : "border-white/[0.08]"}`}>
              <button
                onClick={handleViewCert}
                className="w-full py-2 bg-[#5d3df3] hover:bg-[#4e2fe0] text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-98 cursor-pointer"
              >
                View Full Certificate →
              </button>
            </div>
          </div>

          {/* Card 2: Next Steps */}
          <div className={`rounded-2xl border p-5 shadow-sm space-y-3 transition-all duration-300 ${
            isLight
              ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
              : "bg-[#111111] border-white/[0.08] text-white"
          }`}>
            <h4 className={`text-sm font-bold border-b pb-2 ${isLight ? "border-purple-100 text-slate-900" : "border-white/[0.08] text-white"}`}>Next Steps</h4>
            <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
              Continue advancing your engineering mastery with specialized systems curricula.
            </p>
            <button
              onClick={() => onNavigate("catalog")}
              className="w-full py-2 bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Explore Advanced Tracks →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
