import React, { useState } from "react";
import type { User } from "../types/index.js";

interface CredentialDetailsViewProps {
  user?: User | null;
  credentialId?: string;
  onNavigateVerify?: (credId: string) => void;
  onBack?: () => void;
}

export const CredentialDetailsView: React.FC<CredentialDetailsViewProps> = ({
  user,
  credentialId = "CERT-PY-2026-001842",
  onNavigateVerify,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const recipientName = user?.fullName || user?.name || "Dhanush K";

  const issueDate = "23 September 2026";
  const verificationUrl = `https://certify.edu/verify/${credentialId}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "CERTIFY Credential - Python Fundamentals",
        text: `Check out my verified Python Fundamentals credential earned on CERTIFY!`,
        url: verificationUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(verificationUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
            <button
              onClick={onBack}
              className="hover:text-slate-900 transition flex items-center gap-1"
            >
              <span>←</span>
              <span>My Credentials</span>
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-semibold">Python Fundamentals</span>
          </nav>
          <h1 className="text-3xl font-serif font-bold text-slate-950 tracking-tight">
            Credential Details
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your verified achievement with real skills and proven understanding.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition active:scale-95"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>{shareSuccess ? "Link Copied!" : "Share"}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition active:scale-95"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => onNavigateVerify && onNavigateVerify(credentialId)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#10141e] rounded-lg hover:bg-slate-900 shadow-sm transition active:scale-95"
          >
            <span>Verify Credential</span>
            <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        </div>
      </section>

      {/* Main Grid: Certificate Left + Details Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
        {/* Left Column (8 cols): Certificate Canvas + Evidence Card */}
        <div className="xl:col-span-8 space-y-6">
          {/* Certificate Canvas */}
          <div
            className="relative bg-[#FAF7F2] rounded-2xl p-6 border-[3px] border-double border-[#B89758] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08),0_0_0_1px_rgba(184,151,88,0.25)] overflow-hidden"
            data-purpose="certificate-canvas"
          >
            <div className="relative border border-[#C9AA6D] p-8 md:p-12 bg-[#FDFBF7] rounded-xl min-h-[580px] flex flex-col justify-between overflow-hidden outline outline-1 outline-dashed outline-[#D8BE87] -outline-offset-8">
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#B89758]" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#B89758]" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#B89758]" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#B89758]" />

              {/* Top Certificate Header Row */}
              <div className="flex items-start justify-between relative z-10">
                {/* Certify Ribbon Banner Badge */}
                <div className="w-20 bg-[#161C28] text-white pt-3 pb-4 px-2 text-center rounded-b-md shadow-md border-b-2 border-amber-500/80 -mt-12 md:-mt-14 relative">
                  <div className="w-6 h-6 mx-auto mb-1.5 border border-amber-400/70 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  </div>
                  <span className="block text-[10px] font-extrabold tracking-wider text-white">CERTIFY</span>
                  <span className="block text-[6px] tracking-widest text-slate-300 uppercase mt-0.5 leading-tight">
                    LEARN<br />DEMONSTRATE<br />EARN
                  </span>
                </div>

                {/* Main Certificate Headings */}
                <div className="text-center flex-1 px-4">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-[0.2em] text-slate-900 uppercase">
                    Certificate
                  </h2>
                  <p className="font-serif text-sm md:text-base tracking-[0.3em] text-slate-700 uppercase mt-1">
                    of Completion
                  </p>
                  <div className="flex items-center justify-center gap-3 my-2 text-amber-600/70">
                    <div className="h-[1px] w-12 bg-amber-600/50" />
                    <span className="text-[10px] text-amber-700">❖</span>
                    <div className="h-[1px] w-12 bg-amber-600/50" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-600 font-semibold">
                    This is to certify that
                  </p>
                </div>

                {/* Right Corner Pillar Text */}
                <div className="text-right text-[8px] tracking-widest text-slate-400 font-bold space-y-0.5 uppercase pt-1">
                  <div>SKILLS</div>
                  <div>KNOWLEDGE</div>
                  <div>PRACTICE</div>
                  <div>VERIFIABLE</div>
                </div>
              </div>

              {/* Recipient & Course Details */}
              <div className="text-center my-auto py-8 relative z-10">
                {/* Recipient Name in Distinguished Calligraphic Typography */}
                <div className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-slate-950 my-2 font-normal tracking-wide">
                  {recipientName}
                </div>
                <div className="flex items-center justify-center gap-3 my-3 text-slate-400 max-w-sm mx-auto">
                  <div className="h-[1px] flex-1 bg-amber-600/30" />
                  <span className="text-xs text-amber-700">✦</span>
                  <div className="h-[1px] flex-1 bg-amber-600/30" />
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  has successfully completed the course
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 mt-1 tracking-tight">
                  Python Fundamentals
                </h3>
                <p className="text-xs text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed font-normal">
                  and demonstrated understanding through structured learning, assessments, practical implementation, and an AI oral viva, earning the
                </p>

                {/* Laurel Intermediate Certification Level Badge */}
                <div className="inline-flex items-center justify-center gap-3 mt-4 px-4 py-1.5 bg-amber-50/60 rounded-full border border-amber-200/50">
                  <svg className="w-6 h-6 text-amber-600/80 transform scale-x-[-1]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a10 10 0 0 0-4.5 1.1A8 8 0 0 1 8 8a8 8 0 0 1-5 2.1 10 10 0 0 0 3 4.2A8 8 0 0 1 9 16a8 8 0 0 1-2 5.3 10 10 0 0 0 5 .7c0-2 .8-3.9 2.2-5.3A8 8 0 0 1 12 11c0-2 .8-3.9 2.2-5.3A8 8 0 0 0 12 2z" />
                  </svg>
                  <div className="text-center">
                    <div className="font-serif text-sm font-bold tracking-[0.18em] text-[#9B681F] uppercase">
                      Intermediate
                    </div>
                    <div className="text-[8px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                      Certification Level
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-amber-600/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a10 10 0 0 0-4.5 1.1A8 8 0 0 1 8 8a8 8 0 0 1-5 2.1 10 10 0 0 0 3 4.2A8 8 0 0 1 9 16a8 8 0 0 1-2 5.3 10 10 0 0 0 5 .7c0-2 .8-3.9 2.2-5.3A8 8 0 0 1 12 11c0-2 .8-3.9 2.2-5.3A8 8 0 0 0 12 2z" />
                  </svg>
                </div>
              </div>

              {/* Certificate Footer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-end gap-4 pt-6 border-t border-amber-900/10 text-slate-700 relative z-10">
                {/* Metadata Left */}
                <div className="space-y-1.5 text-left text-[11px] leading-tight font-sans">
                  <div>
                    <span className="text-slate-400 block text-[9.5px] uppercase font-semibold">Issue Date</span>
                    <span className="font-medium text-slate-900">{issueDate}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-semibold">Credential ID</span>
                    <span className="font-mono text-slate-900 text-[10px] font-semibold">{credentialId}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-semibold">Verify at</span>
                    <span className="text-indigo-600 text-[10px] font-mono truncate block">
                      {verificationUrl}
                    </span>
                  </div>
                </div>

                {/* Director Signature Center */}
                <div className="text-center px-2">
                  <div className="font-serif italic text-2xl md:text-3xl text-slate-900 leading-none mb-1">
                    Hlashefja
                  </div>
                  <div className="h-[1px] bg-slate-300 w-36 mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-slate-900">Academic Director</div>
                  <div className="text-[8px] uppercase tracking-widest text-slate-400 font-semibold">CERTIFY ACADEMIC BOARD</div>
                </div>

                {/* Embossed Metallic Gold Python Seal Right */}
                <div className="flex justify-end">
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#7E5C18] via-[#DFB76C] to-[#FFF1C5] p-1 text-center shadow-lg border-2 border-dashed border-[#7A5A1E] flex flex-col items-center justify-center">
                    <div className="absolute inset-0 flex flex-col justify-between py-1.5 text-[7px] font-extrabold text-[#573E10] uppercase tracking-widest">
                      <span>• PYTHON •</span>
                      <span>INTERMEDIATE</span>
                    </div>
                    <div className="w-10 h-10 bg-amber-900/10 rounded-full flex items-center justify-center border border-amber-800/20">
                      <span className="text-xs font-mono font-bold text-[#5E410E]">PY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What This Credential Demonstrates Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm" data-purpose="credential-evidence-card">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">What This Credential Demonstrates</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  This credential validates your ability to use Python to solve real-world problems, build practical applications, and apply core programming concepts with clarity and confidence.
                </p>

                {/* 4 Badges Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/70 text-slate-700 text-xs font-medium">
                    <span className="text-indigo-600">✓</span>
                    <span>8 Modules Completed</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/70 text-slate-700 text-xs font-medium">
                    <span className="text-indigo-600">✓</span>
                    <span>3 Assessments Passed</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/70 text-slate-700 text-xs font-medium">
                    <span className="text-indigo-600">✓</span>
                    <span>1 Project Completed</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/70 text-slate-700 text-xs font-medium">
                    <span className="text-emerald-600">✓</span>
                    <span>AI Viva Cleared</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Meta Sidebar */}
        <div className="xl:col-span-4 space-y-4" data-purpose="credential-meta-sidebar">
          {/* Verified Green Banner */}
          <div className="bg-[#EBF9F1] border border-emerald-200/80 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h5 className="text-sm font-bold text-emerald-900 leading-tight">Verified Credential</h5>
              <p className="text-[11.5px] text-emerald-800/90 leading-tight mt-0.5">
                This credential is officially issued by CERTIFY and can be verified publicly.
              </p>
            </div>
          </div>

          {/* Credential Overview Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Credential Overview</h4>
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 text-sm font-bold">
                  PY
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium leading-none">Course</div>
                  <div className="text-xs font-semibold text-slate-800 leading-snug mt-1">Python Fundamentals</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  LVL
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium leading-none">Credential Level</div>
                  <div className="text-xs font-semibold text-slate-800 leading-snug mt-1">Intermediate</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  CAL
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium leading-none">Issue Date</div>
                  <div className="text-xs font-semibold text-slate-800 leading-snug mt-1">{issueDate}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 text-xs font-mono font-bold">
                  #
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-400 font-medium leading-none">Credential ID</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-semibold text-slate-800 truncate">{credentialId}</span>
                    <button
                      onClick={handleCopyId}
                      className="text-slate-400 hover:text-slate-700 text-[10px] font-sans px-1.5 py-0.5 rounded border border-slate-200"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  🔗
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-slate-400 font-medium leading-none">Verification URL</div>
                  <div
                    onClick={() => onNavigateVerify && onNavigateVerify(credentialId)}
                    className="text-xs font-mono font-semibold text-indigo-600 truncate leading-snug mt-1 hover:underline cursor-pointer"
                  >
                    {verificationUrl}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Demonstrated Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Skills Demonstrated</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "Python Programming",
                "Problem Solving",
                "Data Structures",
                "File Handling",
                "OOP",
                "Debugging",
                "Code Organization",
                "Project Development",
              ].map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Assessment Evidence Checklist */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Assessment Evidence</h4>
            <div className="space-y-2.5 text-xs text-slate-700 pt-1">
              {[
                "Completed all 8 curriculum modules",
                "Passed chapter baseline & diagnostic assessments",
                "Completed hands-on practical project demo",
                "Cleared deterministic final code assessment",
                "Completed oral AI viva defense session",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
