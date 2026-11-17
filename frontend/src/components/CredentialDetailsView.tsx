import React, { useEffect, useState } from "react";
import type { User } from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";
import { api } from "../services/api.js";

interface CredentialDetailsViewProps {
  user?: User | null;
  credentialId?: string;
  onBack?: () => void;
}

interface VerifiedCertRecord {
  credentialId: string;
  recipientName: string;
  courseTitle: string;
  tier: string;
  compositeScore: number;
  status: string;
  issuedAt: string;
  signatureHash?: string;
}

export const CredentialDetailsView: React.FC<CredentialDetailsViewProps> = ({
  user,
  credentialId,
  onBack,
}) => {
  const { isLight } = useTheme();
  const [cert, setCert] = useState<VerifiedCertRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setCert(null);

    const load = async () => {
      try {
        // First look in authenticated learner's earned certificates
        const mine = await api.getMyCertificates().catch(() => ({ certificates: [] }));
        const found = credentialId
          ? mine.certificates.find((c) => c.credentialId === credentialId)
          : mine.certificates[0];

        if (found) {
          if (mounted) {
            setCert({
              credentialId: found.credentialId,
              recipientName: found.recipientName || user?.fullName || user?.name || "Learner",
              courseTitle: found.courseTitle,
              tier: found.tier,
              compositeScore: found.compositeScore,
              status: found.status,
              issuedAt: found.issuedAt,
              signatureHash: found.signatureHash,
            });
          }
          return;
        }

        // Fallback to public verification registry only if a specific credentialId was supplied
        if (credentialId) {
          const pub = await api.verifyPublicCredential(credentialId).catch(() => null);
          if (mounted && pub && pub.isValid) {
            setCert({
              credentialId: pub.credentialId || credentialId,
              recipientName: pub.recipientName || "Verified Learner",
              courseTitle: pub.courseTitle || "Python Fundamentals",
              tier: pub.tier || "FOUNDATIONAL",
              compositeScore: pub.compositeScore ?? 0,
              status: pub.status || "VALID",
              issuedAt: pub.issuedAt || "",
            });
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [credentialId, user?.id, user?.fullName, user?.name]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs text-neutral-400">
        Verifying cryptographic credential record...
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div
          className={`p-8 rounded-2xl border space-y-4 ${
            isLight
              ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
              : "bg-[#111111] border-white/[0.08] text-white"
          }`}
        >
          <h2 className="text-xl font-bold">Credential Not Issued</h2>
          <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
            No verified certificate exists for this ID yet. Complete all course modules,
            checkpoints, practical coding tasks, and the final evaluation to earn your official
            CERTIFY credential.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-5 py-2 rounded-lg bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white text-xs font-semibold cursor-pointer"
            >
              ← Back to My Credentials
            </button>
          )}
        </div>
      </div>
    );
  }

  const formattedDate = (() => {
    try {
      return new Date(cert.issuedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return cert.issuedAt;
    }
  })();

  const verificationUrl = `https://certify.studio/verify/${cert.credentialId}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(cert.credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `CERTIFY Credential - ${cert.courseTitle}`,
          text: `Check out my verified ${cert.courseTitle} credential earned on CERTIFY!`,
          url: verificationUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(verificationUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav
            aria-label="Breadcrumbs"
            className={`flex items-center gap-1.5 text-xs font-medium mb-2 ${
              isLight ? "text-purple-900/70" : "text-purple-200/70"
            }`}
          >
            <button
              onClick={onBack}
              className={`transition flex items-center gap-1 cursor-pointer ${
                isLight ? "text-purple-950 hover:text-purple-700" : "hover:text-white"
              }`}
            >
              <span>←</span>
              <span>My Credentials</span>
            </button>
            <span className={isLight ? "text-purple-400" : "text-purple-300/40"}>/</span>
            <span className={`font-semibold ${isLight ? "text-purple-950" : "text-white"}`}>
              {cert.courseTitle}
            </span>
          </nav>
          <h1 className={`text-3xl font-sans font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            Credential Details
          </h1>
          <p className={`text-sm mt-1 ${isLight ? "text-slate-700" : "text-purple-200/80"}`}>
            Verified achievement backed by deterministic backend evidence and Ed25519 cryptography.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer ${
              isLight
                ? "bg-white text-slate-800 border border-purple-900/10 hover:bg-purple-50"
                : "bg-[#111111] text-white border border-white/[0.08] hover:bg-white/[0.05]"
            }`}
          >
            <span>{shareSuccess ? "Link Copied!" : "Share"}</span>
          </button>

          <button
            onClick={() => window.print()}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer ${
              isLight
                ? "bg-white text-slate-800 border border-purple-900/10 hover:bg-purple-50"
                : "bg-[#111111] text-white border border-white/[0.08] hover:bg-white/[0.05]"
            }`}
          >
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleCopyId}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#5B4DF0] hover:bg-[#4C3DE0] rounded-lg shadow-sm transition cursor-pointer"
          >
            <span>{copied ? "Credential Copied!" : "Copy Credential ID"}</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
        <div className="xl:col-span-8 space-y-6">
          <div
            className="relative bg-[#FAF7F2] rounded-2xl p-6 border-[3px] border-double border-[#B89758] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] overflow-hidden"
            data-purpose="certificate-canvas"
          >
            <div className="relative border border-[#C9AA6D] p-8 md:p-12 bg-[#FDFBF7] rounded-xl min-h-[540px] flex flex-col justify-between overflow-hidden outline outline-1 outline-dashed outline-[#D8BE87] -outline-offset-8">
              <div className="flex items-start justify-between relative z-10">
                <div className="w-20 bg-[#161C28] text-white pt-3 pb-4 px-2 text-center rounded-b-md shadow-md border-b-2 border-amber-500/80 -mt-12 md:-mt-14">
                  <span className="block text-[10px] font-extrabold tracking-wider text-white">CERTIFY</span>
                  <span className="block text-[6px] tracking-widest text-slate-300 uppercase mt-0.5 leading-tight">
                    LEARN<br />DEMONSTRATE<br />EARN
                  </span>
                </div>

                <div className="text-center flex-1 px-4">
                  <h2 className="font-sans text-3xl md:text-4xl font-extrabold tracking-[0.2em] text-slate-900 uppercase">
                    Certificate
                  </h2>
                  <p className="font-sans text-sm md:text-base tracking-[0.3em] text-slate-700 uppercase mt-1">
                    of Completion
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-600 font-semibold mt-4">
                    This is to certify that
                  </p>
                </div>

                <div className="text-right text-[8px] tracking-widest text-slate-400 font-bold space-y-0.5 uppercase pt-1">
                  <div>SKILLS</div>
                  <div>KNOWLEDGE</div>
                  <div>PRACTICE</div>
                  <div>VERIFIABLE</div>
                </div>
              </div>

              <div className="text-center my-auto py-8 relative z-10 font-sans">
                <div className="font-sans text-4xl sm:text-5xl text-slate-950 my-2 font-bold tracking-tight">
                  {cert.recipientName}
                </div>
                <p className="text-xs text-slate-600 font-medium mt-3">
                  has successfully completed the course
                </p>
                <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1 tracking-tight">
                  {cert.courseTitle}
                </h3>
                <div className="inline-flex items-center justify-center gap-2 mt-4 px-4 py-1.5 bg-amber-50/80 rounded-full border border-amber-200/70">
                  <span className="font-sans text-xs font-bold tracking-[0.18em] text-[#9B681F] uppercase">
                    {cert.tier} Tier • {Math.round(cert.compositeScore * 100)}% Composite Score
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 items-end gap-4 pt-6 border-t border-amber-900/10 text-slate-700 relative z-10">
                <div className="space-y-1.5 text-left text-[11px] leading-tight">
                  <div>
                    <span className="text-slate-400 block text-[9.5px] uppercase font-semibold">Issue Date</span>
                    <span className="font-medium text-slate-900">{formattedDate}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-semibold">Credential ID</span>
                    <span className="font-mono text-slate-900 text-[10px] font-semibold">{cert.credentialId}</span>
                  </div>
                </div>

                <div className="text-center px-2">
                  <div className="h-[1px] bg-slate-300 w-36 mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-slate-900">CERTIFY Academic Board</div>
                  <div className="text-[8px] uppercase tracking-widest text-slate-400 font-semibold">
                    Ed25519 Signed Registry
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7E5C18] via-[#DFB76C] to-[#FFF1C5] p-1 text-center shadow-lg border-2 border-dashed border-[#7A5A1E] flex flex-col items-center justify-center">
                    <span className="text-xs font-mono font-bold text-[#5E410E]">VALID</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-4">
          <div className="bg-[#111111] border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              ✓
            </div>
            <div>
              <h5 className="text-sm font-bold text-white leading-tight">Verified Credential</h5>
              <p className="text-[11.5px] text-neutral-300 leading-tight mt-0.5">
                Officially issued by CERTIFY and backed by cryptographic signature.
              </p>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl p-5 border border-white/[0.08] shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm">Credential Metadata</h4>
            <div className="flex justify-between">
              <span className="text-neutral-400">Course</span>
              <span className="text-white font-semibold">{cert.courseTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Tier</span>
              <span className="text-white font-semibold">{cert.tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Composite Score</span>
              <span className="text-emerald-400 font-mono font-semibold">
                {Math.round(cert.compositeScore * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Issued</span>
              <span className="text-white font-semibold">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Credential ID</span>
              <span className="text-white font-mono">{cert.credentialId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
