import React, { useState } from "react";

interface VivaChamberViewProps {
  courseSlug: string;
  onNavigate: (view: string) => void;
  onCompleteDefense?: () => void;
  onExit?: () => void;
  onDefenseCompleted?: () => void;
}

export const VivaChamberView: React.FC<VivaChamberViewProps> = ({
  courseSlug: _courseSlug,
  onNavigate,
  onCompleteDefense,
  onDefenseCompleted,
}) => {
  const [currentTurn, setCurrentTurn] = useState(3);
  const [candidateResponse, setCandidateResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleSubmitResponse = () => {
    if (!candidateResponse.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (currentTurn >= 5) {
        if (onCompleteDefense) onCompleteDefense();
        else if (onDefenseCompleted) onDefenseCompleted();
        else onNavigate("result");
      } else {
        setCurrentTurn((prev) => prev + 1);
        setCandidateResponse("");
      }
    }, 700);
  };

  const handleFinishDefense = () => {
    if (onCompleteDefense) onCompleteDefense();
    else if (onDefenseCompleted) onDefenseCompleted();
    else onNavigate("result");
  };

  return (
    <div className="bg-[#1E0A3B] text-slate-100 min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-[14px] leading-[20px] antialiased overflow-x-hidden selection:bg-[#C4B5FD] selection:text-[#1E0A3B]">
      {/* ================= TOP CHAMBER DOCKED NAVIGATION ================= */}
      <header className="w-full bg-[#15062B]/95 backdrop-blur border-b border-white/10 sticky top-0 z-50 px-6 py-3">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-6">
          {/* Brand & Seal Glyph */}
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-white/10 border border-white/15 shadow-inner">
              <span className="material-symbols-outlined text-purple-200 text-[19px]">verified_user</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[20px] font-semibold tracking-tight text-white">Certify</span>
              <span className="h-4 w-px bg-white/20"></span>
              <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded border border-white/15">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-300 animate-ping"></span>
                <span className="font-mono text-[11px] tracking-wider text-purple-100 uppercase font-medium">
                  ORAL VIVA DEFENSE CHAMBER — ADVANCED TIER CREDENTIALING
                </span>
              </div>
            </div>
          </div>

          {/* Center Track Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 text-purple-200/70 text-xs">
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span className="text-white font-medium">Python Systems &amp; Concurrency</span>
            </div>
            <span className="text-purple-300/40 text-xs">/</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-purple-100 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Phase: Architectural Cross-Examination (Turn {currentTurn} of 5)</span>
            </div>
          </div>

          {/* Right Telemetry & Candidate Pill */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded">
              <span className="material-symbols-outlined text-purple-200 text-[17px]">hourglass_top</span>
              <span className="font-mono text-white font-semibold text-[13px] tracking-wide">12:45 Remaining</span>
            </div>

            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded bg-white/10 border border-white/15 font-mono text-[11px] text-purple-200/70">
              <span className="material-symbols-outlined text-[14px] text-emerald-400">neurology</span>
              <span className="text-white">AI Faculty Node #04</span>
              <span className="text-white/20">•</span>
              <span className="text-emerald-400 font-mono">112ms</span>
            </div>

            <div className="flex items-center gap-2.5 pl-2 border-l border-white/15">
              <div className="relative">
                <div className="w-8 h-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center font-bold text-xs text-white">
                  AR
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#1E0A3B]"></span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[13px] text-white leading-tight font-semibold">Alex Rivera</span>
                <span className="font-mono text-[10px] text-purple-200/60">Tier: Advanced Candidate</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= THREE-ZONE DEFENSE CHAMBER CANVAS ================= */}
      <main className="flex-1 flex w-full max-w-[1920px] mx-auto overflow-hidden min-h-[calc(100vh-140px)]">
        {/* ================= ZONE A: LEFT RAIL (Defended Artifact & Thesis Claims) ================= */}
        <aside className="w-[390px] flex-shrink-0 bg-[#15062B] border-r border-white/10 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Top Artifact Header */}
            <div className="p-4 border-b border-white/10 bg-white/[0.04]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs uppercase tracking-wider text-purple-200/60 font-medium">Defended Code Submission</span>
                <span className="font-mono text-[10px] text-purple-200 px-1.5 py-0.5 rounded bg-white/10 border border-white/15">Active Node</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <h2 className="text-[15px] font-semibold text-white">Asynchronous Semaphore Pool</h2>
                <span className="font-mono text-[11px] text-purple-200/60" title="Cryptographic Checksum">SHA256: 7f8c...3a19</span>
              </div>
            </div>

            {/* Code Viewport */}
            <div className="p-3 bg-black/40 font-mono text-[12px] leading-relaxed border-b border-white/10 overflow-x-auto">
              <div className="flex items-center justify-between text-[11px] text-[#8E93A6] pb-2 mb-2 border-b border-[#494553]/20 px-1 font-mono">
                <span>concurrency_pool.py</span>
                <span className="text-[#b3d33b] font-semibold">coroutine_allocator</span>
              </div>
              <div className="space-y-0.5 text-slate-100 font-mono text-[12px]">
                <div className="flex gap-3 text-[#8E93A6]/50 select-none">
                  <span className="w-6 text-right">38</span>
                  <span className="text-[#8E93A6]"><span className="text-[#cebdff]">class</span> <span className="text-white font-semibold">AsyncBoundedConnectionPool</span>:</span>
                </div>
                <div className="flex gap-3 text-[#8E93A6]/50 select-none">
                  <span className="w-6 text-right">39</span>
                  <span className="text-slate-100 pl-4"><span className="text-[#cebdff]">def</span> <span className="text-[#b3d33b]">__init__</span>(self, capacity: int = <span className="text-[#f6be41]">64</span>):</span>
                </div>
                <div className="flex gap-3 text-[#8E93A6]/50 select-none">
                  <span className="w-6 text-right">40</span>
                  <span className="text-slate-100 pl-8">self._sem = asyncio.<span className="text-[#9d7bff]">BoundedSemaphore</span>(capacity)</span>
                </div>
                <div className="flex gap-3 text-[#8E93A6]/50 select-none">
                  <span className="w-6 text-right">41</span>
                  <span className="text-slate-100 pl-8">self._active_sockets = set()</span>
                </div>
                <div className="flex gap-3 text-[#8E93A6]/50 select-none">
                  <span className="w-6 text-right">42</span>
                  <span className="text-slate-100 pl-4"><span className="text-[#cebdff]">async def</span> <span className="text-[#b3d33b]">acquire_slot</span>(self, timeout: float = <span className="text-[#f6be41]">2.5</span>):</span>
                </div>

                {/* Under Probe Highlight Lines */}
                <div className="flex gap-3 bg-[#E06A55]/10 border-l-2 border-[#E06A55] py-0.5">
                  <span className="w-6 text-right text-[#E06A55] select-none font-semibold">43</span>
                  <span className="text-slate-100 pl-4 font-medium"><span className="text-[#cebdff]">async with</span> asyncio.<span className="text-[#b3d33b]">timeout</span>(timeout):</span>
                </div>
                <div className="flex gap-3 bg-[#E06A55]/10 border-l-2 border-[#E06A55] py-0.5">
                  <span className="w-6 text-right text-[#E06A55] select-none font-semibold">44</span>
                  <span className="text-slate-100 pl-8"><span className="text-[#cebdff]">await</span> self._sem.<span className="text-[#9d7bff] font-semibold">acquire</span>()</span>
                </div>
                <div className="flex gap-3 bg-[#E06A55]/10 border-l-2 border-[#E06A55] py-0.5">
                  <span className="w-6 text-right text-[#E06A55] select-none font-semibold">45</span>
                  <span className="text-slate-100 pl-8"><span className="text-[#cebdff]">try</span>:</span>
                </div>
                <div className="flex gap-3 bg-[#E06A55]/10 border-l-2 border-[#E06A55] py-0.5">
                  <span className="w-6 text-right text-[#E06A55] select-none font-semibold">46</span>
                  <span className="text-slate-100 pl-12">conn = <span className="text-[#cebdff]">await</span> self._connect_raw()</span>
                </div>
                <div className="flex gap-3 bg-[#E06A55]/10 border-l-2 border-[#E06A55] py-0.5">
                  <span className="w-6 text-right text-[#E06A55] select-none font-semibold">47</span>
                  <span className="text-slate-100 pl-12">self._active_sockets.add(conn)</span>
                </div>

                <div className="flex gap-3 text-[#8E93A6]/50 select-none">
                  <span className="w-6 text-right">48</span>
                  <span className="text-slate-100 pl-8"><span className="text-[#cebdff]">except</span> BaseException:</span>
                </div>
                <div className="flex gap-3 text-[#8E93A6]/50 select-none">
                  <span className="w-6 text-right">49</span>
                  <span className="text-slate-100 pl-12">self._sem.<span className="text-[#cebdff]">release</span>()</span>
                </div>
                <div className="flex gap-3 text-[#8E93A6]/50 select-none">
                  <span className="w-6 text-right">50</span>
                  <span className="text-slate-100 pl-12"><span className="text-[#cebdff]">raise</span></span>
                </div>
              </div>
            </div>

            {/* Pinned Thesis Claims Section */}
            <div className="p-4 space-y-3 bg-[#13151A]">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#8E93A6] font-medium">Pinned Thesis Claims</span>
                <span className="font-mono text-[11px] text-[#8E93A6]">2 Registered</span>
              </div>

              {/* Claim 1 (Under Active Challenge) */}
              <div className="p-3 rounded bg-[#171922] border border-[#E06A55]/40 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#E06A55]"></div>
                <div className="flex items-center justify-between mb-1.5 pl-1.5">
                  <span className="font-mono text-[10px] tracking-wide text-[#E06A55] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E06A55] animate-ping"></span>
                    [UNDER ACTIVE CHALLENGE]
                  </span>
                  <span className="font-mono text-[10px] text-[#8E93A6]">Lines 43-47</span>
                </div>
                <p className="text-[14px] text-slate-100 pl-1.5 leading-snug">
                  "Connection acquire timeout prevents event loop task queue starvation under thread burst."
                </p>
                <div className="mt-2.5 pt-2 border-t border-[#494553]/30 flex items-center justify-between pl-1.5 text-[11px]">
                  <span className="text-[#8E93A6]">Challenged Invariant:</span>
                  <span className="font-mono text-[#E06A55] font-medium">Coroutine Cancel Atomicity</span>
                </div>
              </div>

              {/* Claim 2 (Defended & Verified) */}
              <div className="p-3 rounded bg-[#171922]/70 border border-[#b3d33b]/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#b3d33b]"></div>
                <div className="flex items-center justify-between mb-1.5 pl-1.5">
                  <span className="font-mono text-[10px] tracking-wide text-[#b3d33b] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-[#b3d33b]">check_circle</span>
                    [DEFENDED &amp; VERIFIED]
                  </span>
                  <span className="font-mono text-[10px] text-[#b3d33b] font-medium">+14% Rigor Credit</span>
                </div>
                <p className="text-[14px] text-[#8E93A6] pl-1.5 leading-snug">
                  "Cooperative lock yield eliminates GIL re-entry latency during IPC."
                </p>
                <div className="mt-2.5 pt-2 border-t border-[#494553]/20 flex items-center justify-between pl-1.5 text-[11px]">
                  <span className="text-[#8E93A6]">Audited in Turn 2</span>
                  <span className="font-mono text-purple-200/90">Signed by Node #04</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/10 bg-white/[0.02]">
            <button
              onClick={handleFinishDefense}
              className="w-full py-2.5 rounded-lg bg-white hover:bg-purple-50 text-[#1E0A3B] text-xs font-bold transition shadow-md cursor-pointer"
            >
              Conclude Defense &amp; View Audit →
            </button>
          </div>
        </aside>

        {/* ================= ZONE B: CENTER ZONE (Examiner Aura, Dialogue & Defense Console) ================= */}
        <section className="flex-1 flex flex-col justify-between overflow-y-auto bg-[#1E0A3B] relative">
          <div>
            {/* Chamber Header & Academic Title Banner */}
            <div className="pt-8 px-8 pb-4 text-center max-w-4xl mx-auto w-full">
              <span className="font-mono text-[11px] tracking-[0.25em] text-purple-200/80 uppercase mb-2 inline-block">
                Viva Voce Session 05 // Formal Inquiry
              </span>
              <h1 className="font-['Newsreader',serif] text-4xl lg:text-5xl font-normal tracking-tight text-white mb-2">
                DEFEND YOUR WORK
              </h1>
              <p className="text-[14px] text-purple-200/70 max-w-xl mx-auto">
                Provide direct, defensible justification of system failure invariants. Evasive responses trigger conceptual penalties.
              </p>
            </div>

            {/* Live Examiner Concentric Waveform Aura */}
            <div className="relative py-4 flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-purple-300/20 scale-125 bg-white/5 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full border border-purple-300/30 scale-110"></div>
                <div className="absolute inset-5 rounded-full border border-purple-300/40"></div>
                <div className="w-24 h-24 rounded-full bg-white/10 border border-white/30 shadow-[0_0_35px_rgba(255,255,255,0.15)] flex items-center justify-center relative z-10 backdrop-blur-md">
                  {/* Pulsing Frequency Bars */}
                  <div className="flex items-center gap-1.5 h-10">
                    <span className="w-1 bg-purple-200 rounded-full h-4 animate-pulse"></span>
                    <span className="w-1 bg-white rounded-full h-8 animate-pulse"></span>
                    <span className="w-1.5 bg-purple-200 rounded-full h-6 animate-pulse"></span>
                    <span className="w-1.5 bg-emerald-400 rounded-full h-9 animate-pulse"></span>
                    <span className="w-1 bg-purple-300 rounded-full h-5 animate-pulse"></span>
                    <span className="w-1 bg-purple-200 rounded-full h-4 animate-pulse"></span>
                  </div>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-purple-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse"></span>
                <span>AI Examiner Probing System Invariants</span>
              </div>
            </div>

            {/* Defense Dialogue & Transcript Stream */}
            <div className="px-8 max-w-4xl mx-auto w-full space-y-4 my-2">
              {/* Active Inquiry Challenge Block */}
              <div className="rounded-2xl bg-white/[0.08] border border-white/15 border-l-4 border-l-purple-400 p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-300 text-[18px]">psychology</span>
                    <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
                      AI Examiner Challenge Probe — Turn {currentTurn}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[11px] font-medium border border-rose-500/30">
                    Action Required
                  </span>
                </div>
                <p className="text-[18px] leading-[28px] text-white leading-relaxed">
                  "You assert your semaphore release guarantees FIFO fairness under high event loop pressure. What happens if three worker coroutines cancel simultaneously during socket write timeouts? Defend your error handling against queue corruption."
                </p>
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-purple-200/70">
                  <span className="font-mono text-[11px]">Invoked Rule: PEP-3156 cancellation propagation protocol</span>
                  <span className="font-mono text-[11px] text-amber-300">Penalty Risk: -12% Rigor if unaddressed</span>
                </div>
              </div>

              {/* Candidate Previous Turn Transcript */}
              <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4 relative backdrop-blur-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-white">Alex Rivera (Candidate Defense — Turn 2)</span>
                    <span className="text-purple-200/60 text-xs">• Audio Transcribed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Accepted with High Rigor</span>
                  </div>
                </div>
                <p className="text-[14px] text-purple-200/80 leading-normal italic font-serif">
                  "“...the cooperative yield inside the IPC buffer avoids kernel context switches by passing the slice directly across memory mapped pipes, effectively guaranteeing that the GIL lock acquisition remains deterministic under heavy socket backpressure...”"
                </p>
                <div className="mt-2 flex items-center gap-3 pt-2 border-t border-white/10">
                  <button className="flex items-center gap-1.5 text-xs text-purple-200/70 hover:text-white transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[15px]">play_arrow</span>
                    <span className="font-mono text-[11px]">Replay Audio Segment (0:24)</span>
                  </button>
                  <div className="h-1 flex-1 bg-black/30 rounded overflow-hidden max-w-xs">
                    <div className="w-2/3 h-full bg-purple-400/50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Docked Candidate Response Console */}
          <div className="px-8 pb-6 pt-3 max-w-4xl mx-auto w-full">
            <div className="bg-white/[0.08] rounded-2xl border border-white/15 shadow-2xl p-4 relative focus-within:border-white/30 backdrop-blur-xl transition-colors">
              {/* Live Audio Streaming Visualizer Bar */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[12px] text-white font-medium">
                    Live Audio Streaming — Speak to Defend (or compose proof below)
                  </span>
                </div>
                <div className="flex items-center gap-1 h-3.5">
                  <span className="w-0.5 h-3 bg-emerald-400 rounded-full"></span>
                  <span className="w-0.5 h-2 bg-emerald-400 rounded-full"></span>
                  <span className="w-0.5 h-4 bg-emerald-400 rounded-full"></span>
                  <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  <span className="w-0.5 h-3 bg-emerald-400 rounded-full"></span>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={candidateResponse}
                onChange={(e) => setCandidateResponse(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    handleSubmitResponse();
                  }
                }}
                className="w-full bg-transparent border-0 p-1 text-white placeholder:text-purple-300/40 text-[14px] focus:ring-0 resize-none font-sans"
                placeholder="State your formal defense. Address the cancel scopes, asyncio.shield guards, and semaphore counter invariants..."
                rows={3}
              />

              {/* Action Buttons Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCandidateResponse((prev) => prev + "\n```python\n# Invariant proof:\nasyncio.shield(self._sem.release())\n```")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 border border-white/15 text-purple-200 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                  >
                    <span>+ Attach Code Proof</span>
                  </button>
                  <button
                    onClick={() => setCandidateResponse((prev) => prev + " [Ref: PEP-3156]")}
                    className="flex items-center gap-1 px-2 py-1 rounded text-purple-200/70 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">format_quote</span>
                    <span>Cite RFC / PEP</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 border border-white/15 text-purple-200 hover:text-white text-xs font-mono transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-emerald-400">
                      {isMuted ? "mic_off" : "mic"}
                    </span>
                    <span>{isMuted ? "Unmute" : "Mute [Space]"}</span>
                  </button>
                  <button
                    onClick={handleSubmitResponse}
                    disabled={isSubmitting || !candidateResponse.trim()}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-[#1E0A3B] hover:bg-purple-50 text-xs font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isSubmitting ? "Evaluating..." : "Submit Defense Argument"}</span>
                    <span className="font-mono text-[11px] opacity-70">[⌘ Enter]</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ZONE C: RIGHT RAIL (Conceptual Rigor & Evaluation Telemetry) ================= */}
        <aside className="w-[350px] flex-shrink-0 bg-[#15062B] border-l border-white/10 flex flex-col justify-between overflow-y-auto p-5">
          <div className="space-y-6">
            {/* Rail Header */}
            <div className="border-b border-white/10 pb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wider text-purple-200/70 font-medium">Real-Time Telemetry</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <h3 className="text-[15px] font-semibold text-white">Faculty Rubric Status</h3>
                <span className="font-mono text-[10px] text-purple-200/60">SESSION: VIVA-9021-ED25519</span>
              </div>
            </div>

            {/* Live Assessment Scores */}
            <div className="space-y-4">
              {/* Metric 1 */}
              <div className="bg-[#171922] p-3.5 rounded border border-[#494553]/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[14px] text-slate-100 font-medium">Conceptual Rigor</span>
                  <span className="font-mono text-[#b3d33b] font-semibold text-sm">91%</span>
                </div>
                <div className="w-full bg-[#211e26] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#b3d33b] h-full rounded-full transition-all duration-300" style={{ width: "91%" }}></div>
                </div>
                <div className="flex justify-between items-center mt-1.5 font-mono text-[10px] text-[#8E93A6]">
                  <span>Threshold: 85% required to pass</span>
                  <span className="text-[#b3d33b] font-medium">Passing</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-[#171922] p-3.5 rounded border border-[#494553]/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[14px] text-slate-100 font-medium">Trade-Off Depth</span>
                  <span className="font-mono text-[#cebdff] font-semibold text-sm">88%</span>
                </div>
                <div className="w-full bg-[#211e26] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#cebdff] h-full rounded-full transition-all duration-300" style={{ width: "88%" }}></div>
                </div>
                <div className="flex justify-between items-center mt-1.5 font-mono text-[10px] text-[#8E93A6]">
                  <span>Examiner Evaluation: Nuanced</span>
                  <span className="text-[#cebdff] font-medium">High</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-[#171922] p-3.5 rounded border border-[#494553]/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[14px] text-slate-100 font-medium">Evasion Penalty</span>
                  <span className="font-mono text-[#b3d33b] font-semibold text-sm">0%</span>
                </div>
                <div className="w-full bg-[#211e26] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#b3d33b] h-full rounded-full" style={{ width: "0%" }}></div>
                </div>
                <div className="flex justify-between items-center mt-1.5 font-mono text-[10px] text-[#8E93A6]">
                  <span>Direct Answers Maintained</span>
                  <span className="text-[#b3d33b] font-medium">Zero Deduction</span>
                </div>
              </div>
            </div>

            {/* Rubric Defense Checklist */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-[#8E93A6] font-medium block">
                Rubric Invariant Checklist
              </span>
              <div className="space-y-2">
                <div className="flex items-start justify-between p-2.5 rounded bg-[#171922]/50 border border-[#b3d33b]/20">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#b3d33b] text-[16px] mt-0.5">check_circle</span>
                    <div>
                      <div className="text-[14px] text-white font-medium leading-tight">Concurrency Invariant Proof</div>
                      <div className="font-mono text-[10px] text-[#8E93A6] mt-0.5">GIL latch verified with benchmark trace</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#b3d33b] font-semibold px-1.5 py-0.5 rounded bg-[#b3d33b]/10 border border-[#b3d33b]/20">
                    VERIFIED
                  </span>
                </div>

                <div className="flex items-start justify-between p-2.5 rounded bg-[#171922] border border-[#E06A55]/30">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#E06A55] text-[16px] mt-0.5 animate-pulse">pending</span>
                    <div>
                      <div className="text-[14px] text-white font-medium leading-tight">Failure &amp; Cancellation Recovery</div>
                      <div className="font-mono text-[10px] text-[#E06A55] mt-0.5">Actively defended against queue loss</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#E06A55] font-semibold px-1.5 py-0.5 rounded bg-[#E06A55]/10 border border-[#E06A55]/20">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-start justify-between p-2.5 rounded bg-[#171922]/30 border border-[#494553]/20 opacity-70">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#8E93A6] text-[16px] mt-0.5">radio_button_unchecked</span>
                    <div>
                      <div className="text-[14px] text-[#8E93A6] font-medium leading-tight">Memory Footprint Optimization</div>
                      <div className="font-mono text-[10px] text-[#8E93A6] mt-0.5">Turn 4 scheduled probe</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#8E93A6] font-semibold px-1.5 py-0.5 rounded bg-[#211e26] border border-[#494553]/30">
                    PENDING
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Protocol Notice Callout */}
          <div className="mt-6 p-3.5 rounded bg-[#1A1325] border border-[#cebdff]/30 relative">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#cebdff] text-[20px] flex-shrink-0 mt-0.5">military_tech</span>
              <div>
                <div className="text-xs font-semibold text-white mb-1">Defense Completion Guarantee</div>
                <p className="text-[12px] leading-relaxed text-[#8E93A6]">
                  Passing this defense completes the 4-part evidence requirements for the Advanced Tier Credential. Verifiable database ledger pre-stamped.
                </p>
                <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-[#cebdff]">
                  <span className="material-symbols-outlined text-[13px]">shield</span>
                  <span>Ledger Proof: 9ab4...fc71</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
