import React, { useState } from "react";
import type { User } from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";

interface CredentialsListViewProps {
  user?: User | null;
  onNavigate: (view: string) => void;
  onViewCredential: (credId: string) => void;
}

export const CredentialsListView: React.FC<CredentialsListViewProps> = ({
  user: _user,
  onNavigate,
  onViewCredential,
}) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [filter, setFilter] = useState<"earned" | "in-progress" | "all">("earned");

  const credentials = [
    {
      id: "CERT-PY-2026-88914",
      course: "Python Fundamentals",
      tier: "Advanced Master Credential",
      issuedDate: "September 24, 2026",
      status: "Verified Active",
      skills: ["Python 3", "OOP Architecture", "Algorithms", "Concurrency", "Defensible Viva"],
      slug: "python-fundamentals",
    },
    {
      id: "CERT-WEB-2026-44012",
      course: "Web Development Foundations",
      tier: "Proficient Credential",
      issuedDate: "August 12, 2026",
      status: "Verified Active",
      skills: ["HTML5 Semantic", "Vanilla CSS", "DOM APIs", "Responsive Layout"],
      slug: "web-development-foundations",
    },
  ];

  return (
    <div className="space-y-6" data-purpose="credentials-list-page">
      {/* Filter Tabs */}
      <section data-purpose="page-title-and-tabs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("earned")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
              filter === "earned"
                ? isLight
                  ? "bg-purple-600 text-white shadow-md font-bold"
                  : "bg-white text-[#15062B] shadow-md font-bold"
                : isLight
                  ? "text-purple-950/70 hover:text-purple-950 hover:bg-white/40 font-medium"
                  : "text-purple-200/80 hover:text-white hover:bg-white/10 font-medium"
            }`}
          >
            Earned
            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
              filter === "earned" ? (isLight ? "bg-white text-purple-700" : "bg-[#15062B] text-white") : "bg-white/20 text-purple-200"
            }`}>
              2
            </span>
          </button>

          <button
            onClick={() => setFilter("in-progress")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
              filter === "in-progress"
                ? isLight
                  ? "bg-purple-600 text-white shadow-md font-bold"
                  : "bg-white text-[#15062B] shadow-md font-bold"
                : isLight
                  ? "text-purple-950/70 hover:text-purple-950 hover:bg-white/40 font-medium"
                  : "text-purple-200/80 hover:text-white hover:bg-white/10 font-medium"
            }`}
          >
            In Progress
            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
              filter === "in-progress" ? (isLight ? "bg-white text-purple-700" : "bg-[#15062B] text-white") : "bg-white/20 text-purple-200"
            }`}>
              1
            </span>
          </button>

          <button
            onClick={() => setFilter("all")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
              filter === "all"
                ? isLight
                  ? "bg-purple-600 text-white shadow-md font-bold"
                  : "bg-white text-[#15062B] shadow-md font-bold"
                : isLight
                  ? "text-purple-950/70 hover:text-purple-950 hover:bg-white/40 font-medium"
                  : "text-purple-200/80 hover:text-white hover:bg-white/10 font-medium"
            }`}
          >
            All Courses
            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
              filter === "all" ? (isLight ? "bg-white text-purple-700" : "bg-[#15062B] text-white") : "bg-white/20 text-purple-200"
            }`}>
              6
            </span>
          </button>
        </div>
      </section>

      {/* Main Grid: 8 cols credentials + 4 cols right summary */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
        {/* Left Column (8 cols): Credential Cards */}
        <div className="xl:col-span-8 space-y-5">
          {credentials.map((cred) => (
            <article
              key={cred.id}
              className={`rounded-[14px] p-6 border transition-all space-y-4 ${
                isLight
                  ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900 hover:border-purple-300"
                  : "bg-[#111111] border-white/[0.08] shadow-xs hover:border-white/20 text-white"
              }`}
              data-purpose="credential-card"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Visual Certificate Stamp Card Preview */}
                <div className="relative w-full sm:w-52 h-36 rounded-[10px] bg-gradient-to-br from-neutral-900 via-neutral-950 to-[#18112e] flex items-center justify-center shrink-0 overflow-hidden shadow-inner p-3 border border-white/[0.06]">
                  <span className="absolute top-2.5 left-2.5 bg-emerald-950/60 text-emerald-400 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider border border-emerald-800/40">
                    CERTIFIED
                  </span>

                  <div className="text-center text-white">
                    <span className="text-[10px] font-serif uppercase tracking-widest text-amber-300">
                      CERTIFY
                    </span>
                    <h4 className="text-xs font-bold font-serif text-white mt-1">{cred.course}</h4>
                    <span className="text-[9px] text-neutral-400 font-mono mt-1 block">
                      {cred.id}
                    </span>
                  </div>
                </div>

                {/* Information */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className={`text-lg font-bold tracking-tight font-serif transition-colors duration-300 ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}>
                        {cred.course}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800/40 shrink-0">
                        ✓ {cred.status}
                      </span>
                    </div>

                    <p className={`text-xs font-semibold ${isLight ? "text-purple-700" : "text-indigo-400"}`}>{cred.tier}</p>
                    <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Issued on {cred.issuedDate}</p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {cred.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors duration-300 ${
                            isLight
                              ? "bg-purple-100/60 text-purple-900 border-purple-200"
                              : "bg-white/[0.06] text-neutral-300 border-white/[0.06]"
                          }`}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`pt-2 border-t flex items-center gap-3 ${isLight ? "border-purple-100" : "border-white/[0.08]"}`}>
                    <button
                      onClick={() => onViewCredential(cred.id)}
                      className="bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white px-4 py-1.5 rounded-[8px] text-xs font-semibold shadow-xs transition active:scale-98 cursor-pointer"
                    >
                      View Certificate →
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Right Column (4 cols): Ledger Summary */}
        <aside className="xl:col-span-4 space-y-5">
          <div className={`rounded-[14px] p-5 border space-y-4 transition-all duration-300 ${
            isLight
              ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
              : "bg-[#111111] border-white/[0.08] shadow-xs text-white"
          }`}>
            <h3 className={`text-xs font-bold tracking-wide uppercase ${isLight ? "text-slate-900" : "text-white"}`}>Credential Ledger</h3>
            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-[8px] border space-y-1 ${
                isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}>
                <span className={`text-[10px] uppercase font-bold ${isLight ? "text-purple-700" : "text-neutral-400"}`}>Total Earned</span>
                <p className={`text-lg font-bold font-serif ${isLight ? "text-slate-900" : "text-white"}`}>2 Verified Credentials</p>
              </div>

              <div className={`p-3 rounded-[8px] border space-y-1 ${
                isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}>
                <span className={`text-[10px] uppercase font-bold ${isLight ? "text-purple-700" : "text-neutral-400"}`}>Integrity Level</span>
                <p className="text-xs font-semibold text-emerald-500">100% Deterministic Evidence Backed</p>
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                  Every certificate maps directly to recorded chapter code, assessment proofs, and oral viva defenses.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate("catalog")}
              className="w-full bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white rounded-[8px] py-2 px-3 text-xs font-semibold transition cursor-pointer"
            >
              Explore Available Certifications →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
