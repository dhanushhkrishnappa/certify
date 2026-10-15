import React, { useState } from "react";

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
    <div className="space-y-6 pb-12 font-sans text-slate-100">
      {/* Page Header Title Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-purple-200/70 font-medium mb-1">
            <button onClick={() => onNavigate("credentials")} className="hover:text-white transition">
              My Credentials
            </button>
            <span className="text-purple-300/40 font-normal">&gt;</span>
            <button onClick={() => onNavigate("course-details")} className="hover:text-white transition">
              Python Fundamentals
            </button>
            <span className="text-purple-300/40 font-normal">&gt;</span>
            <span className="text-white font-semibold">Result</span>
          </nav>
          <h1 className="text-3xl font-['Newsreader',serif] font-bold text-white tracking-tight">
            Certification Result
          </h1>
          <p className="text-sm text-purple-200/80 mt-1 font-normal">
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold shadow-sm transition active:scale-[0.98]"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Share Result
          </button>
          <button
            onClick={handleViewCert}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5d3df3] hover:bg-[#4e2fe0] text-white text-xs font-semibold shadow-md shadow-indigo-200 transition active:scale-[0.98]"
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
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#eef2fc] via-[#f5f6fb] to-white border border-[#e1e6f5] p-7 shadow-sm">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Info Details */}
              <div className="max-w-xl space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#0e1628] flex items-center justify-center shadow-sm p-2 flex-shrink-0">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 110 110">
                      <path d="M54.1 2C27.5 2 29.1 13.5 29.1 13.5L29.2 25.4H55V29H18.2C1.7 29 0 42.4 0 42.4L0 55.4C0 67.5 10.7 68.3 10.7 68.3H18.1V58C18.1 45.4 29 45.6 29 45.6H54.4C64.6 45.6 64.9 35.8 64.9 35.8V11.8C64.9 11.8 66.8 2 54.1 2ZM39.6 9.4C43.1 9.4 46 12.3 46 15.8C46 19.3 43.1 22.2 39.6 22.2C36.1 22.2 33.2 19.3 33.2 15.8C33.2 12.3 36.1 9.4 39.6 9.4Z" fill="#387eb8" />
                      <path d="M55.9 108C82.5 108 80.9 96.5 80.9 96.5L80.8 84.6H55V81H91.8C108.3 81 110 67.6 110 67.6L110 54.6C110 42.5 99.3 41.7 99.3 41.7H91.9V52C91.9 64.6 81 64.4 81 64.4H55.6C45.4 64.4 45.1 74.2 45.1 74.2V98.2C45.1 98.2 43.2 108 55.9 108ZM70.4 100.6C66.9 100.6 64 97.7 64 94.2C64 90.7 66.9 87.8 70.4 87.8C73.9 87.8 76.8 90.7 76.8 94.2C76.8 97.7 73.9 100.6 70.4 100.6Z" fill="#ffe052" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-gray-900 leading-snug">
                      Python Fundamentals
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">Certification Successfully Earned</p>
                  </div>
                </div>

                <div className="pt-1">
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    Congratulations! <span className="text-2xl">🎉</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    You have demonstrated strong understanding and practical skills in Python Fundamentals.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleViewCert}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#5d3df3] hover:bg-[#4e2fe0] text-white text-xs font-semibold shadow-md shadow-indigo-200 transition active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    View Certificate
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold shadow-sm transition active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Right Medallion & Quote */}
              <div className="flex items-center gap-6 lg:border-l lg:border-gray-200/80 lg:pl-8">
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
                  <p className="font-['Newsreader',serif] italic text-gray-800 text-sm leading-snug">
                    “Discipline today, expertise tomorrow.”
                  </p>
                  <div className="w-8 h-0.5 bg-amber-500 my-2"></div>
                  <p className="text-[11px] text-gray-500 font-medium">Keep learning.<br />Keep building.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Row (3 KPI Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Overall Result */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm flex flex-col justify-between">
              <h4 className="text-sm font-bold text-gray-900">Overall Result</h4>
              <div className="relative w-32 h-32 mx-auto my-3 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" fill="transparent" r="50" stroke="#f1efe9" strokeWidth="9" />
                  <circle cx="60" cy="60" fill="transparent" r="50" stroke="#00c48c" strokeDasharray="314.15" strokeDashoffset="40.8" strokeLinecap="round" strokeWidth="9" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-gray-900 tracking-tight leading-none">87%</span>
                  <span className="text-[10px] text-gray-400 font-medium mt-1">Overall Score</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2 bg-[#eafbf4] border border-[#bbf3dd] rounded-xl text-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                  ✓
                </div>
                <div className="leading-tight">
                  <span className="font-bold text-emerald-800 text-[11px] block uppercase">PASSED</span>
                  <span className="text-[10px] text-emerald-700">You've met all the requirements for certification at the Intermediate level.</span>
                </div>
              </div>
            </div>

            {/* Card 2: Performance Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm flex flex-col justify-between">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Performance Breakdown</h4>
              <div className="space-y-3.5 my-auto">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>Conceptual Understanding</span>
                    <span className="text-gray-900">92%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>Practical Implementation</span>
                    <span className="text-gray-900">84%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "84%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>Problem Solving &amp; Reasoning</span>
                    <span className="text-gray-900">81%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: "81%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>AI Viva / Defense</span>
                    <span className="text-gray-900">88%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "88%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Percentile Rank */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Percentile Rank</h4>
                <div className="mt-2">
                  <h3 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-gray-900">Top 12%</h3>
                  <p className="text-xs text-gray-500 mt-0.5">You performed better than 88% of learners.</p>
                </div>
              </div>
              <div className="pt-4 flex flex-col items-center">
                <div className="w-full flex items-end justify-between h-20 gap-1.5 px-2">
                  <div className="w-full bg-gray-100 rounded-t h-[20%]"></div>
                  <div className="w-full bg-gray-100 rounded-t h-[30%]"></div>
                  <div className="w-full bg-gray-200 rounded-t h-[48%]"></div>
                  <div className="w-full bg-gray-200 rounded-t h-[65%]"></div>
                  <div className="w-full bg-indigo-100 rounded-t h-[80%]"></div>
                  <div className="w-full bg-[#5d3df3] rounded-t h-[98%] shadow-sm relative"></div>
                  <div className="w-full bg-indigo-100 rounded-t h-[86%]"></div>
                  <div className="w-full bg-gray-200 rounded-t h-[68%]"></div>
                </div>
                <div className="w-full border-t border-gray-200 mt-1 flex justify-center">
                  <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mt-1">You</span>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation Components Pipeline (5 nodes) */}
          <section className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">Evaluation Components</h3>
              <span className="text-xs font-semibold text-[#5d3df3]">Verifiable Evidence</span>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              Your certification is based on multiple checkpoints to ensure a comprehensive evaluation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {/* Node 1 */}
              <div className="bg-slate-50 border border-gray-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    LP
                  </div>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-gray-500">Learning Progress</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">100%</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">8/8 modules</p>
                </div>
              </div>

              {/* Node 2 */}
              <div className="bg-slate-50 border border-gray-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                    CA
                  </div>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-gray-500">Chapter Assessments</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">88%</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">32/36 questions</p>
                </div>
              </div>

              {/* Node 3 */}
              <div className="bg-slate-50 border border-gray-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center font-mono font-bold text-xs">
                    &lt;/&gt;
                  </div>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-gray-500">Practical Project</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">85%</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Project completed</p>
                </div>
              </div>

              {/* Node 4 */}
              <div className="bg-slate-50 border border-gray-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    FA
                  </div>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-gray-500">Final Assessment</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">82%</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">41/50 questions</p>
                </div>
              </div>

              {/* Node 5 */}
              <div className="bg-slate-50 border border-gray-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs">
                    VD
                  </div>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-gray-500">AI Viva / Defense</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">88%</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Completed</p>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Performance Table & Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Detailed Performance Table (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Detailed Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-400 font-medium border-b border-gray-100">
                      <th className="pb-2.5 font-medium">Component</th>
                      <th className="pb-2.5 font-medium">Score</th>
                      <th className="pb-2.5 font-medium">Status</th>
                      <th className="pb-2.5 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
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
                      <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-2.5 font-medium text-gray-800">{m.name}</td>
                        <td className="py-2.5 font-semibold text-gray-900">{m.score}</td>
                        <td className="py-2.5">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px]">✓</span> Passed
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-500 font-mono text-[11px]">{m.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Skills Demonstrated Tag Pills (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Skills Demonstrated</h3>
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
                    className="px-3 py-1.5 bg-[#f0effb] text-[#5542e6] rounded-xl text-xs font-medium hover:bg-[#e6e4f9] transition-colors cursor-default"
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
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">Credential Information</h4>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#5d3df3] flex items-center justify-center flex-shrink-0 font-bold font-mono">
                  #
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-gray-400 block text-[11px]">Credential ID</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-medium text-gray-900 text-xs truncate">{credentialId}</span>
                    <button onClick={handleCopyId} className="text-gray-400 hover:text-gray-700 transition" title="Copy ID">
                      <span className="text-xs">{copied ? "✓" : "📋"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#5d3df3] flex items-center justify-center flex-shrink-0">
                  📚
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Course</span>
                  <p className="font-semibold text-gray-800 mt-0.5">Python Fundamentals</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#5d3df3] flex items-center justify-center flex-shrink-0">
                  🎖️
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Certification Level</span>
                  <p className="font-semibold text-gray-800 mt-0.5">Intermediate</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#5d3df3] flex items-center justify-center flex-shrink-0">
                  📅
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Issue Date</span>
                  <p className="font-semibold text-gray-800 mt-0.5">23 September 2026</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Status</span>
                  <p className="font-semibold text-emerald-700 mt-0.5">Verified &amp; Active</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={handleViewCert}
                className="w-full py-2 bg-[#5d3df3] hover:bg-[#4e2fe0] text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-98"
              >
                View Full Certificate →
              </button>
            </div>
          </div>

          {/* Card 2: Next Steps */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Next Steps</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Continue advancing your engineering mastery with specialized systems curricula.
            </p>
            <button
              onClick={() => onNavigate("catalog")}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition"
            >
              Explore Advanced Tracks →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
