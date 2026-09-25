import React from "react";

interface LandingPageViewProps {
  onExploreCourses: () => void;
  onBeginDiagnostic: () => void;
  onVerifyLedger: () => void;
  onSignIn: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onExploreCourses,
  onBeginDiagnostic,
  onVerifyLedger,
  onSignIn,
}) => {
  return (
    <div className="bg-[#0C0D11] text-[#FBF9F5] font-['Plus_Jakarta_Sans',sans-serif] text-[16px] leading-[24px] antialiased selection:bg-[#9d7bff] selection:text-[#FBF9F5] min-h-screen flex flex-col relative overflow-x-hidden">
      {/* TOP APP BAR */}
      <header className="sticky top-0 z-50 bg-[#0C0D11]/95 border-b border-[#494553] backdrop-blur-md">
        <div className="flex justify-between items-center w-full px-8 py-3 max-w-7xl mx-auto">
          {/* Brand Anchor & Glyph */}
          <div className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#171922] border border-[#494553] flex items-center justify-center relative overflow-hidden group-hover:border-[#cebdff] transition-colors">
              <div className="absolute inset-0 bg-[#9d7bff]/10"></div>
              <span className="material-symbols-outlined text-[#cebdff] text-[18px]">deployed_code</span>
            </div>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[20px] font-semibold tracking-tight text-[#FBF9F5]">Certify</span>
            <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-[#cebdff] bg-[#9d7bff]/20 border border-[#cebdff]/30">v2.4-ed25519</span>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={onExploreCourses} className="text-[#8E93A6] text-[14px] hover:text-[#FBF9F5] transition-colors duration-150">
              Curated Tracks
            </button>
            <a className="text-[#8E93A6] text-[14px] hover:text-[#FBF9F5] transition-colors duration-150" href="#pedagogy">
              Pedagogical Engine
            </a>
            <a className="text-[#8E93A6] text-[14px] hover:text-[#FBF9F5] transition-colors duration-150" href="#defense-standard">
              Defense Standard
            </a>
            <button onClick={onVerifyLedger} className="text-[#FBF9F5] text-[14px] border-b-2 border-[#cebdff] pb-1">
              Public Ledger
            </button>
          </nav>

          {/* Trailing Actions */}
          <div className="flex items-center gap-4">
            {/* Search Pill */}
            <button
              onClick={onVerifyLedger}
              className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#13151A] border border-[#494553] hover:border-[#948e9f] text-[#8E93A6] hover:text-[#FBF9F5] text-[14px] transition-all duration-150"
            >
              <span className="material-symbols-outlined text-[16px] text-[#8E93A6]">search</span>
              <span>Verify Credential</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1E222D] text-[11px] font-mono text-[#8E93A6] border border-[#494553]/60">⌘K</kbd>
            </button>

            {/* Active Certifications Status Chip */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13151A] border border-[#494553] text-[#8E93A6] text-[14px]">
              <span className="w-2 h-2 rounded-full bg-[#cef056] animate-pulse"></span>
              <span className="font-mono text-[13px] text-[#FBF9F5]">3 Active Certifications</span>
            </div>

            {/* Sign In action */}
            <button
              onClick={onSignIn}
              className="px-3 py-1.5 rounded-lg text-[14px] font-medium text-[#8E93A6] hover:text-[#FBF9F5] hover:bg-[#171922] transition-colors"
            >
              Sign In
            </button>

            {/* Diagnostic Primary Action Button */}
            <button
              onClick={onBeginDiagnostic}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#cef056] text-[#171e00] text-[14px] font-semibold hover:brightness-105 transition-all duration-200 active:scale-[0.98] shadow-sm"
            >
              <span>Begin Diagnostic</span>
              <span className="material-symbols-outlined text-[16px] font-bold">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CANVAS */}
      <main className="flex-grow relative z-10" style={{ backgroundImage: 'linear-gradient(to right, rgba(148, 142, 159, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 142, 159, 0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-8 pt-20 pb-20 relative">
          {/* Glow ambient backdrop */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[360px] bg-[#9d7bff]/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#13151A] border border-[#494553]/80 shadow-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-[#9d7bff] shadow-[0_0_8px_#9d7bff]"></span>
              <span className="font-mono text-[11px] tracking-wider uppercase text-[#8E93A6]">
                THE DEFENSIBLE CREDENTIAL PROTOCOL • ZERO PASSIVE COMPLETION
              </span>
            </div>

            {/* Grand Display Headline (Newsreader Serif) */}
            <h1 className="font-['Newsreader',Georgia,serif] text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-[#FBF9F5] leading-[1.08] mb-6">
              Where AI proves understanding. <br className="hidden sm:inline"/>
              <span className="italic text-[#cebdff]">Not passive video attendance.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[18px] leading-[28px] text-[#8E93A6] max-w-2xl leading-relaxed mb-10">
              Certify replaces multiple-choice quizzes with live Socratic dialogues, code invariant proofs, and high-stakes oral viva defenses under continuous Bayesian Knowledge Tracing.
            </p>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <button
                onClick={onExploreCourses}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#cef056] text-[#171e00] text-[16px] font-semibold hover:brightness-105 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#cef056]/10"
              >
                <span>Explore Engineering Tracks</span>
                <span className="material-symbols-outlined text-[18px]">east</span>
              </button>
              <button
                onClick={onVerifyLedger}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#13151A] hover:bg-[#171922] border border-[#494553] hover:border-[#948e9f] text-[#FBF9F5] text-[16px] transition-all duration-200 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[#cebdff] text-[18px]">terminal</span>
                <span>Inspect Live Verification Ledger</span>
              </button>
            </div>

            {/* Metric Badges Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-14 pt-10 border-t border-[#494553]/40">
              <div className="text-left p-3 rounded-lg bg-[#13151A]/40 border border-[#494553]/30">
                <div className="font-mono text-[13px] text-[#8E93A6] mb-1">Defense P(L) Floor</div>
                <div className="text-[24px] font-semibold text-[#FBF9F5]">0.920</div>
                <div className="text-[12px] tracking-[0.05em] text-[#b3d33b] mt-0.5">Bayesian confidence min</div>
              </div>
              <div className="text-left p-3 rounded-lg bg-[#13151A]/40 border border-[#494553]/30">
                <div className="font-mono text-[13px] text-[#8E93A6] mb-1">Invariant Tests</div>
                <div className="text-[24px] font-semibold text-[#FBF9F5]">10,000+</div>
                <div className="text-[12px] tracking-[0.05em] text-[#cebdff] mt-0.5">Simulated per candidate</div>
              </div>
              <div className="text-left p-3 rounded-lg bg-[#13151A]/40 border border-[#494553]/30">
                <div className="font-mono text-[13px] text-[#8E93A6] mb-1">Pass Rate Floor</div>
                <div className="text-[24px] font-semibold text-[#FBF9F5]">11.4%</div>
                <div className="text-[12px] tracking-[0.05em] text-[#E06A55] mt-0.5">Defensible selectivity</div>
              </div>
              <div className="text-left p-3 rounded-lg bg-[#13151A]/40 border border-[#494553]/30">
                <div className="font-mono text-[13px] text-[#8E93A6] mb-1">Attestation Curve</div>
                <div className="text-[24px] font-semibold text-[#FBF9F5]">Ed25519</div>
                <div className="text-[12px] tracking-[0.05em] text-[#8E93A6] mt-0.5">Cryptographic signature</div>
              </div>
            </div>
          </div>

          {/* Institutional Endorsement Bar */}
          <div className="mt-16 pt-8 border-t border-[#494553]/40 text-center">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#8E93A6] mb-6">
              Endorsed by faculty boards and distributed systems infrastructure teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
              <div className="flex items-center gap-2 font-mono text-[14px] font-semibold tracking-tight text-[#FBF9F5]">
                <span className="material-symbols-outlined text-[18px] text-[#8E93A6]">account_balance</span>
                MIT CSAIL
              </div>
              <div className="flex items-center gap-2 font-mono text-[14px] font-semibold tracking-tight text-[#FBF9F5]">
                <span className="material-symbols-outlined text-[18px] text-[#8E93A6]">memory</span>
                Stanford Systems Lab
              </div>
              <div className="flex items-center gap-2 font-mono text-[14px] font-semibold tracking-tight text-[#FBF9F5]">
                <span className="material-symbols-outlined text-[18px] text-[#8E93A6]">hub</span>
                Berkeley RISELab
              </div>
              <div className="flex items-center gap-2 font-mono text-[14px] font-semibold tracking-tight text-[#FBF9F5]">
                <span className="material-symbols-outlined text-[18px] text-[#8E93A6]">shield</span>
                Rust Foundation
              </div>
              <div className="flex items-center gap-2 font-mono text-[14px] font-semibold tracking-tight text-[#FBF9F5]">
                <span className="material-symbols-outlined text-[18px] text-[#8E93A6]">lan</span>
                Linux Foundation
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE 4-SIGNAL PROOF ARCHITECTURE */}
        <section className="max-w-7xl mx-auto px-8 py-20 border-t border-[#494553]/50" id="pedagogy">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="font-mono text-[12px] text-[#cebdff] uppercase tracking-widest mb-2">Defensibility Engine</div>
              <h2 className="font-['Newsreader',Georgia,serif] text-3xl md:text-5xl text-[#FBF9F5] font-normal">
                The 4-Signal Proof Architecture
              </h2>
            </div>
            <p className="text-[14px] text-[#8E93A6] max-w-md mt-4 md:mt-0">
              Certify synthesizes multimodal verification into an immutable mathematical record that cannot be gamed by large language models or prompt evasion.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Socratic Tracing */}
            <div className="group relative rounded-xl bg-[#13151A] border border-[#494553] p-6 hover:border-[#cebdff]/50 transition-all duration-200 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#9d7bff]/5 rounded-full blur-xl pointer-events-none"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[13px] text-[#8E93A6]">01</span>
                  <span className="p-2 rounded-lg bg-[#171922] border border-[#494553] text-[#cebdff]">
                    <span className="material-symbols-outlined text-[20px]">psychology</span>
                  </span>
                </div>
                <h3 className="text-[20px] font-semibold text-[#FBF9F5] mb-2">Socratic Tracing</h3>
                <p className="text-[14px] text-[#8E93A6] leading-relaxed mb-6">
                  Real-time Bayesian Knowledge Tracing updating prior mastery P(L) on every exchange. Adapts cognitive pressure to locate precise conceptual boundaries.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#171922] border border-[#494553]/60">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono text-[12px] text-[#8E93A6]">Bayesian Prior P(L)</span>
                  <span className="font-mono text-[13px] font-semibold text-[#cebdff]">0.58 → 0.94</span>
                </div>
                <div className="w-full bg-[#1E222D] h-1.5 rounded-full overflow-hidden relative">
                  <div className="bg-gradient-to-r from-[#9d7bff] to-[#cef056] h-full rounded-full w-[94%] transition-all duration-1000"></div>
                </div>
                <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-[#8E93A6]">
                  <span>Slip: 0.04</span>
                  <span>Guess: 0.02</span>
                  <span className="text-[#b3d33b]">Converged</span>
                </div>
              </div>
            </div>

            {/* Card 2: Practical Sandboxes */}
            <div className="group relative rounded-xl bg-[#13151A] border border-[#494553] p-6 hover:border-[#cebdff]/50 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[13px] text-[#8E93A6]">02</span>
                  <span className="p-2 rounded-lg bg-[#171922] border border-[#494553] text-[#b3d33b]">
                    <span className="material-symbols-outlined text-[20px]">terminal</span>
                  </span>
                </div>
                <h3 className="text-[20px] font-semibold text-[#FBF9F5] mb-2">Practical Sandboxes</h3>
                <p className="text-[14px] text-[#8E93A6] leading-relaxed mb-6">
                  Automated test invariants executed in isolated micro-VM gVisor containers with 10,000 synthetic network partition and memory corruption simulations.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#171922] border border-[#494553]/60 font-mono text-[13px]">
                <div className="flex items-center justify-between text-[12px] text-[#8E93A6] border-b border-[#494553]/40 pb-1 mb-2">
                  <span>gVisor sandbox #vm-8902</span>
                  <span className="text-[#b3d33b] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b3d33b] animate-pulse"></span> PASS
                  </span>
                </div>
                <div className="text-[11px] text-[#8E93A6] space-y-0.5 font-mono">
                  <div>&gt; raft_leader_election... <span className="text-[#FBF9F5]">OK (4ms)</span></div>
                  <div>&gt; split_brain_partition... <span className="text-[#FBF9F5]">ISOLATED</span></div>
                  <div>&gt; invariant_state_chk... <span className="text-[#b3d33b]">10,000 / 10,000</span></div>
                </div>
              </div>
            </div>

            {/* Card 3: Oral Viva Defense */}
            <div className="group relative rounded-xl bg-[#13151A] border border-[#494553] p-6 hover:border-[#cebdff]/50 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[13px] text-[#8E93A6]">03</span>
                  <span className="p-2 rounded-lg bg-[#171922] border border-[#494553] text-[#e8ddff]">
                    <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
                  </span>
                </div>
                <h3 className="text-[20px] font-semibold text-[#FBF9F5] mb-2">Oral Viva Defense</h3>
                <p className="text-[14px] text-[#8E93A6] leading-relaxed mb-6">
                  AI-conducted Socratic defense probing edge cases, failure invariants, and architectural trade-offs with turn-taking latency and cognitive hesitation telemetry.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#171922] border border-[#494553]/60">
                <div className="flex justify-between items-center text-[12px] font-mono text-[#8E93A6] mb-2">
                  <span>Socratic Viva Turn #4</span>
                  <span className="text-[#cebdff] font-semibold">240ms Turn Latency</span>
                </div>
                <div className="flex items-center gap-1 h-5 mb-2">
                  <span className="w-1 bg-[#cebdff]/40 h-2 rounded-full"></span>
                  <span className="w-1 bg-[#cebdff]/70 h-4 rounded-full"></span>
                  <span className="w-1 bg-[#cebdff] h-5 rounded-full"></span>
                  <span className="w-1 bg-[#cebdff]/90 h-3 rounded-full"></span>
                  <span className="w-1 bg-[#cebdff]/60 h-4 rounded-full"></span>
                  <span className="w-1 bg-[#b3d33b] h-5 rounded-full"></span>
                  <span className="w-1 bg-[#b3d33b]/80 h-3 rounded-full"></span>
                  <span className="w-1 bg-[#cebdff]/40 h-2 rounded-full"></span>
                </div>
                <p className="text-[11px] text-[#8E93A6] truncate">
                  "Why select Paxos over Raft under asymmetric link jitter?"
                </p>
              </div>
            </div>

            {/* Card 4: Cryptographic Attestation */}
            <div className="group relative rounded-xl bg-[#13151A] border border-[#494553] p-6 hover:border-[#cebdff]/50 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[13px] text-[#8E93A6]">04</span>
                  <span className="p-2 rounded-lg bg-[#171922] border border-[#494553] text-[#cef056]">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </span>
                </div>
                <h3 className="text-[20px] font-semibold text-[#FBF9F5] mb-2">Cryptographic Attestation</h3>
                <p className="text-[14px] text-[#8E93A6] leading-relaxed mb-6">
                  Verifiable credential dossier anchored with deterministic database proofs on the public ledger, inspectable via command line in zero round trips.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#171922] border border-[#494553]/60 font-mono">
                <div className="text-[10px] text-[#8E93A6] uppercase mb-1">Merkle Proof Root</div>
                <div className="text-[12px] text-[#cebdff] truncate tracking-wider">0x9d7b...f8c9b21a3e</div>
                <div className="mt-2 pt-2 border-t border-[#494553]/40 flex items-center justify-between text-[10px] text-[#8E93A6]">
                  <span className="text-[#b3d33b] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span> Node Verified
                  </span>
                  <span>Ledger #2026</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: COMPARATOR */}
        <section className="max-w-7xl mx-auto px-8 py-20 border-t border-[#494553]/50" id="defense-standard">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="font-mono text-[12px] text-[#b3d33b] uppercase tracking-widest mb-2">Verification Contrast</div>
            <h2 className="font-['Newsreader',Georgia,serif] text-3xl md:text-5xl text-[#FBF9F5] font-normal mb-4">
              The Anatomy of Defensibility
            </h2>
            <p className="text-[16px] text-[#8E93A6]">
              Legacy certifications quantify completion time. Certify measures resistance to invariant failure, conceptual probing, and cognitive interrogation.
            </p>
          </div>

          {/* Side-by-Side Comparison Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: Legacy Video LMS Certificate */}
            <div className="rounded-xl bg-[#13151A]/70 border border-[#E06A55]/40 p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#E06A55]/10 border-b border-l border-[#E06A55]/30 font-mono text-[11px] text-[#E06A55] font-semibold uppercase tracking-wider">
                Vulnerable to LLM &amp; Cheat Extensions
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#E06A55]/10 border border-[#E06A55]/30 flex items-center justify-center text-[#E06A55]">
                    <span className="material-symbols-outlined text-[22px]">cancel</span>
                  </div>
                  <div>
                    <h3 className="text-[24px] font-semibold text-[#FBF9F5]">Legacy Video LMS Certificate</h3>
                    <p className="font-mono text-[13px] text-[#E06A55]">Status: Zero Defensibility • Self-Reported</p>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="p-3.5 rounded-lg bg-[#171922]/60 border border-[#494553]/40 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[12px] text-[#8E93A6] block">Verification Signal</span>
                      <span className="text-[14px] text-[#FBF9F5]">Watch-time: 100% (Passive background playback)</span>
                    </div>
                    <span className="material-symbols-outlined text-[#E06A55] text-[20px]">close</span>
                  </li>
                  <li className="p-3.5 rounded-lg bg-[#171922]/60 border border-[#494553]/40 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[12px] text-[#8E93A6] block">Evaluation Method</span>
                      <span className="text-[14px] text-[#FBF9F5]">Assessment: Guessable Multiple Choice (4 Options)</span>
                    </div>
                    <span className="material-symbols-outlined text-[#E06A55] text-[20px]">close</span>
                  </li>
                  <li className="p-3.5 rounded-lg bg-[#171922]/60 border border-[#494553]/40 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[12px] text-[#8E93A6] block">Code Validation</span>
                      <span className="text-[14px] text-[#FBF9F5]">Code Verification: None (Copy-pasteable from repos)</span>
                    </div>
                    <span className="material-symbols-outlined text-[#E06A55] text-[20px]">close</span>
                  </li>
                  <li className="p-3.5 rounded-lg bg-[#171922]/60 border border-[#494553]/40 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[12px] text-[#8E93A6] block">Rigorous Defense</span>
                      <span className="text-[14px] text-[#FBF9F5]">Oral Defense: Absent (Candidate identity unchecked)</span>
                    </div>
                    <span className="material-symbols-outlined text-[#E06A55] text-[20px]">close</span>
                  </li>
                  <li className="p-3.5 rounded-lg bg-[#171922]/60 border border-[#494553]/40 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[12px] text-[#8E93A6] block">Audit Trail</span>
                      <span className="text-[14px] text-[#FBF9F5]">Trust Vector: Easily spoofed static PDF with static URL</span>
                    </div>
                    <span className="material-symbols-outlined text-[#E06A55] text-[20px]">close</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-[#494553]/40 font-mono text-[13px] text-[#E06A55]/80 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Result: 89% of candidates fail technical team screens within 15 minutes.
              </div>
            </div>

            {/* Right: Certify Protocol Credential */}
            <div className="rounded-xl bg-[#13151A] border border-[#b3d33b]/60 p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-[#b3d33b]/5">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#b3d33b]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#b3d33b]/10 border-b border-l border-[#b3d33b]/40 font-mono text-[11px] text-[#b3d33b] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b3d33b] animate-pulse"></span>
                Defensible Mastery Floor Met
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#b3d33b]/10 border border-[#b3d33b]/30 flex items-center justify-center text-[#b3d33b]">
                    <span className="material-symbols-outlined text-[22px]">verified</span>
                  </div>
                  <div>
                    <h3 className="text-[24px] font-semibold text-[#FBF9F5]">Certify Protocol Credential</h3>
                    <p className="font-mono text-[13px] text-[#b3d33b]">Cryptographic Standard • Continuous Bayesian Tracing</p>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="p-3.5 rounded-lg bg-[#171922] border border-[#494553]/80 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[12px] text-[#8E93A6] block">Verification Signal</span>
                      <span className="text-[14px] text-[#FBF9F5] font-medium">BKT Concept Mastery: 98.4% P(L) verified across 42 sub-nodes</span>
                    </div>
                    <span className="material-symbols-outlined text-[#b3d33b] text-[20px]">check_circle</span>
                  </li>
                  <li className="p-3.5 rounded-lg bg-[#171922] border border-[#494553]/80 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[12px] text-[#8E93A6] block">Evaluation Method</span>
                      <span className="text-[14px] text-[#FBF9F5] font-medium">Practical Sandbox: 100% Invariants Passed (18/18 Chaos injects)</span>
                    </div>
                    <span className="material-symbols-outlined text-[#b3d33b] text-[20px]">check_circle</span>
                  </li>
                  <li className="p-3.5 rounded-lg bg-[#171922] border border-[#494553]/80 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[12px] text-[#8E93A6] block">Code Validation</span>
                      <span className="text-[14px] text-[#FBF9F5] font-medium">Zero-Leakage execution in gVisor MicroVM with custom inputs</span>
                    </div>
                    <span className="material-symbols-outlined text-[#b3d33b] text-[20px]">check_circle</span>
                  </li>
                  <li className="p-3.5 rounded-lg bg-[#171922] border border-[#494553]/80 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[12px] text-[#8E93A6] block">Rigorous Defense</span>
                      <span className="text-[14px] text-[#FBF9F5] font-medium">Oral Viva Rigor: 91.0% (Zero evasive penalty, low hesitation)</span>
                    </div>
                    <span className="material-symbols-outlined text-[#b3d33b] text-[20px]">check_circle</span>
                  </li>
                  <li className="p-3.5 rounded-lg bg-[#171922] border border-[#494553]/80 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[12px] text-[#8E93A6] block">Audit Trail</span>
                      <span className="text-[14px] text-[#FBF9F5] font-medium">Attestation: Database Ledger Recorded Evidence #CRT-2026-9812A</span>
                    </div>
                    <span className="material-symbols-outlined text-[#b3d33b] text-[20px]">check_circle</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-[#494553]/60 font-mono text-[13px] text-[#b3d33b] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  Publicly verifiable via `curl certify.sh/verify/CRT-2026`
                </span>
                <span className="text-[#FBF9F5] bg-[#b3d33b]/20 px-2 py-0.5 rounded text-[11px]">100% Defensible</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: LIVE PUBLIC LEDGER FEED */}
        <section className="max-w-7xl mx-auto px-8 py-20 border-t border-[#494553]/50" id="ledger">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[12px] text-[#b3d33b] uppercase tracking-widest mb-2">
                <span className="w-2 h-2 rounded-full bg-[#cef056] animate-ping"></span>
                Real-Time Attestation Node
              </div>
              <h2 className="font-['Newsreader',Georgia,serif] text-3xl md:text-5xl text-[#FBF9F5] font-normal">
                Live Verification Ledger
              </h2>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0 font-mono text-[13px] text-[#8E93A6]">
              <span className="px-2.5 py-1 rounded bg-[#171922] border border-[#494553] text-[#FBF9F5] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b3d33b]"></span>
                Cluster Latency: <strong className="text-[#b3d33b] font-mono">14ms</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-[#171922] border border-[#494553] text-[#FBF9F5]">
                Block: #9,481,204
              </span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="rounded-xl bg-[#13151A] border border-[#494553] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#494553] bg-[#171922]/50 font-mono text-[12px] text-[#8E93A6]">
                    <th className="py-3 px-6">Candidate &amp; Credential</th>
                    <th className="py-3 px-6">Domain Track</th>
                    <th className="py-3 px-6">Bayesian P(L)</th>
                    <th className="py-3 px-6">Invariant Score</th>
                    <th className="py-3 px-6">Verifiable Hash</th>
                    <th className="py-3 px-6 text-right">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#494553]/40 font-mono text-[14px]">
                  {/* Row 1 */}
                  <tr className="hover:bg-[#171922]/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#9d7bff]/20 border border-[#cebdff]/40 flex items-center justify-center font-mono text-[12px] text-[#cebdff] font-bold">
                          AR
                        </div>
                        <div>
                          <div className="text-[15px] font-semibold text-[#FBF9F5]">Alex Rivera</div>
                          <div className="text-[11px] text-[#8E93A6] font-mono">Issued 3 mins ago</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] bg-[#171922] border border-[#494553] text-[#FBF9F5]">
                        Python Systems &amp; Concurrency
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[#b3d33b] font-semibold">0.982</span>
                        <span className="w-12 bg-[#1E222D] h-1.5 rounded-full overflow-hidden inline-block">
                          <span className="block bg-[#b3d33b] h-full w-[98%]"></span>
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#FBF9F5]">18 / 18 <span className="text-[#8E93A6] text-[11px]">(100%)</span></td>
                    <td className="py-4 px-6 text-[#cebdff] tracking-wider text-[12px]">7f8c9b21a3e5...09da</td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1.5 text-[#b3d33b] text-[12px] bg-[#b3d33b]/10 px-2.5 py-1 rounded-full border border-[#b3d33b]/20">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Verified
                      </span>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-[#171922]/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#b3d33b]/20 border border-[#b3d33b]/40 flex items-center justify-center font-mono text-[12px] text-[#b3d33b] font-bold">
                          SC
                        </div>
                        <div>
                          <div className="text-[15px] font-semibold text-[#FBF9F5]">Sophia Chen</div>
                          <div className="text-[11px] text-[#8E93A6] font-mono">Issued 11 mins ago</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] bg-[#171922] border border-[#494553] text-[#FBF9F5]">
                        Distributed Systems &amp; Consensus
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[#b3d33b] font-semibold">0.965</span>
                        <span className="w-12 bg-[#1E222D] h-1.5 rounded-full overflow-hidden inline-block">
                          <span className="block bg-[#b3d33b] h-full w-[96%]"></span>
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#FBF9F5]">32 / 32 <span className="text-[#8E93A6] text-[11px]">(100%)</span></td>
                    <td className="py-4 px-6 text-[#cebdff] tracking-wider text-[12px]">0x9d7bf823...5c18</td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1.5 text-[#b3d33b] text-[12px] bg-[#b3d33b]/10 px-2.5 py-1 rounded-full border border-[#b3d33b]/20">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Verified
                      </span>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-[#171922]/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#cebdff]/20 border border-[#cebdff]/40 flex items-center justify-center font-mono text-[12px] text-[#cebdff] font-bold">
                          MV
                        </div>
                        <div>
                          <div className="text-[15px] font-semibold text-[#FBF9F5]">Marcus Vance</div>
                          <div className="text-[11px] text-[#8E93A6] font-mono">Issued 28 mins ago</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] bg-[#171922] border border-[#494553] text-[#FBF9F5]">
                        High-Performance Rust Systems
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[#b3d33b] font-semibold">0.991</span>
                        <span className="w-12 bg-[#1E222D] h-1.5 rounded-full overflow-hidden inline-block">
                          <span className="block bg-[#b3d33b] h-full w-[99%]"></span>
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#FBF9F5]">24 / 24 <span className="text-[#8E93A6] text-[11px]">(100%)</span></td>
                    <td className="py-4 px-6 text-[#cebdff] tracking-wider text-[12px]">4f6a2a91e7...881c</td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1.5 text-[#b3d33b] text-[12px] bg-[#b3d33b]/10 px-2.5 py-1 rounded-full border border-[#b3d33b]/20">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Verified
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Terminal Bar Footer */}
            <div className="px-6 py-3 bg-[#171922] border-t border-[#494553] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[12px] text-[#8E93A6]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#b3d33b]"></span>
                <span>All public keys cross-referenced with RFC 8032 registry specs</span>
              </div>
              <button onClick={onVerifyLedger} className="text-[#cebdff] hover:underline flex items-center gap-1">
                <span>Explore 14,892 verified blocks</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 6: INVITATION / DIAGNOSTIC CALLOUT */}
        <section className="max-w-7xl mx-auto px-8 py-20 border-t border-[#494553]/50" id="diagnostic">
          <div className="rounded-2xl bg-gradient-to-br from-[#171922] to-[#13151A] border border-[#cebdff]/30 p-8 md:p-14 relative overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#9d7bff]/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="max-w-2xl relative z-10">
              <div className="font-mono text-[12px] text-[#b3d33b] uppercase tracking-widest mb-3">Zero-Stakes Pre-Assessment</div>
              <h2 className="font-['Newsreader',Georgia,serif] text-3xl md:text-5xl text-[#FBF9F5] font-normal mb-4">
                Test your defensible mastery against our diagnostic engine.
              </h2>
              <p className="text-[16px] text-[#8E93A6] mb-8 leading-relaxed">
                Experience a 7-minute Socratic dialogue session. Observe your real-time Bayesian Knowledge curve react to edge cases without any public ledger recording.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onBeginDiagnostic}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#cef056] text-[#171e00] text-[16px] font-semibold hover:brightness-105 transition-all duration-200 active:scale-[0.98]"
                >
                  <span>Begin Free 7-Min Diagnostic</span>
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </button>
                <span className="font-mono text-[13px] text-[#8E93A6]">No credit card • No installation needed</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#13151A] border-t border-[#494553]">
        <div className="w-full px-8 py-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#171922] border border-[#494553] flex items-center justify-center text-[#cebdff]">
                <span className="material-symbols-outlined text-[14px]">lock</span>
              </div>
              <span className="text-[20px] font-semibold text-[#FBF9F5]">Certify</span>
            </div>
            <p className="text-[14px] text-[#8E93A6] max-w-xl">
              © 2026 Certify Protocol. All credentials backed by verifiable database proofs. Defensible mastery engine.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[14px]">
            <button onClick={onVerifyLedger} className="text-[#8E93A6] hover:text-[#FBF9F5] transition-colors duration-150">
              Registry
            </button>
            <a className="text-[#8E93A6] hover:text-[#FBF9F5] transition-colors duration-150" href="#pedagogy">
              Verification Node
            </a>
            <a className="text-[#8E93A6] hover:text-[#FBF9F5] transition-colors duration-150" href="#defense-standard">
              Audit Logs
            </a>
            <a className="text-[#8E93A6] hover:text-[#FBF9F5] transition-colors duration-150" href="#">
              Privacy
            </a>
            <a className="text-[#8E93A6] hover:text-[#FBF9F5] transition-colors duration-150" href="#">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
