import React, { useState } from "react";
import type { User } from "../types/index.js";


interface CredentialsListViewProps {
  user?: User | null;
  onNavigate: (view: string) => void;
  onViewCredential: (credId: string) => void;
  onNavigateVerify?: (credId?: string) => void;
}


export const CredentialsListView: React.FC<CredentialsListViewProps> = ({
  user: _user,
  onNavigate,
  onViewCredential,
  onNavigateVerify: _onNavigateVerify,
}) => {

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
      {/* Title & Filter Tabs */}
      <section data-purpose="page-title-and-tabs">
        <h1 className="text-3xl lg:text-4xl font-serif text-slate-950 tracking-tight mb-1">
          My Credentials
        </h1>
        <p className="text-xs text-slate-500">Your achievements. Real skills. Verified and shareable.</p>

        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={() => setFilter("earned")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              filter === "earned"
                ? "bg-[#5B4DF0] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200/50"
            }`}
          >
            Earned
            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
              filter === "earned" ? "bg-white text-indigo-700" : "bg-slate-200 text-slate-600"
            }`}>
              2
            </span>
          </button>

          <button
            onClick={() => setFilter("in-progress")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filter === "in-progress"
                ? "bg-[#5B4DF0] text-white shadow-xs font-semibold"
                : "text-slate-600 hover:bg-slate-200/50"
            }`}
          >
            In Progress
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center font-semibold">
              1
            </span>
          </button>

          <button
            onClick={() => setFilter("all")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-[#5B4DF0] text-white shadow-xs font-semibold"
                : "text-slate-600 hover:bg-slate-200/50"
            }`}
          >
            All Courses
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center font-semibold">
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
              className="bg-white rounded-[14px] p-6 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow space-y-4"
              data-purpose="credential-card"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Visual Certificate Stamp Card Preview */}
                <div className="relative w-full sm:w-52 h-36 rounded-[10px] bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 flex items-center justify-center shrink-0 overflow-hidden shadow-inner p-3">
                  <span className="absolute top-2.5 left-2.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                    CERTIFIED
                  </span>

                  <div className="text-center text-white">
                    <span className="text-[10px] font-serif uppercase tracking-widest text-amber-300">
                      CERTIFY
                    </span>
                    <h4 className="text-xs font-bold font-serif text-white mt-1">{cred.course}</h4>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                      {cred.id}
                    </span>
                  </div>
                </div>

                {/* Information */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight font-serif">
                        {cred.course}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 shrink-0">
                        ✓ {cred.status}
                      </span>
                    </div>

                    <p className="text-xs text-indigo-700 font-semibold">{cred.tier}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Issued on {cred.issuedDate}</p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {cred.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                    <button
                      onClick={() => onViewCredential(cred.id)}
                      className="bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white px-4 py-1.5 rounded-[8px] text-xs font-semibold shadow-xs transition active:scale-98 cursor-pointer"
                    >
                      View Certificate →
                    </button>
                    <button
                      onClick={() => onNavigate("verify")}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium transition cursor-pointer"
                    >
                      Verify in Ledger
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Right Column (4 cols): Ledger Summary */}
        <aside className="xl:col-span-4 space-y-5">
          <div className="bg-white rounded-[14px] p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Credential Ledger</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-[8px] border border-slate-200/60 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Earned</span>
                <p className="text-lg font-bold text-slate-900 font-serif">2 Verified Credentials</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-[8px] border border-slate-200/60 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Integrity Level</span>
                <p className="text-xs font-semibold text-emerald-700">100% Deterministic Evidence Backed</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Every certificate maps directly to recorded chapter code, assessment proofs, and oral viva defenses.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate("verify")}
              className="w-full bg-[#1b2232] hover:bg-slate-900 text-white rounded-[8px] py-2 px-3 text-xs font-semibold transition cursor-pointer"
            >
              Open Public Verification Ledger →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
