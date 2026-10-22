import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import type { User } from "../types/index.js";

interface CredentialsListViewProps {
  user?: User | null;
  onNavigate: (view: string) => void;
  onViewCredential: (credId: string) => void;
}

export const CredentialsListView: React.FC<CredentialsListViewProps> = ({
  onNavigate,
  onViewCredential,
}) => {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listMyCredentials()
      .then((res) => setCredentials(res.credentials || []))
      .catch((err) => setError(err.message || "Failed to load credentials."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0518] text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
              Verified Learner Registry
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">My Issued Credentials</h1>
          </div>
          <button
            onClick={() => onNavigate("verify")}
            className="px-4 py-2 rounded-lg border border-white/15 text-xs text-slate-200 hover:bg-white/5"
          >
            Public Verification Portal
          </button>
        </header>

        {loading ? (
          <p className="text-sm text-slate-400">Loading your persisted credentials...</p>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        ) : credentials.length === 0 ? (
          <div className="bg-[#160A29] border border-white/10 rounded-xl p-8 text-center space-y-4">
            <h2 className="text-base font-bold text-white">No Issued Credentials Yet</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Complete all chapter mastery gates, the isolated Python practical task, and the 3-turn
              AI viva defense to earn your Ed25519-signed credential.
            </p>
            <button
              onClick={() => onNavigate("catalog")}
              className="px-5 py-2.5 rounded-lg bg-purple-600 text-white text-xs font-semibold"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className="bg-[#160A29] border border-white/10 rounded-xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400">{cred.status}</span>
                    <span className="text-purple-300">{cred.verificationCode}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2">{cred.courseTitle}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Issued {new Date(cred.issuedAt).toLocaleDateString()} • Composite Score:{" "}
                    {Math.round((cred.finalCompositeScore || 0) * 100)}%
                  </p>
                </div>
                <div className="flex gap-3 pt-3 border-t border-white/10">
                  <button
                    onClick={() => onViewCredential(cred.verificationCode)}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                  >
                    Inspect Evidence &amp; Signature
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
