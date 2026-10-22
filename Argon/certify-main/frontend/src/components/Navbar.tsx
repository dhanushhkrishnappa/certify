import React from "react";
import { BookOpen, CheckCircle, User } from "lucide-react";

interface NavbarProps {
  currentView: "catalog" | "studio";
  setCurrentView: (view: "catalog" | "studio") => void;
  user: { fullName: string; role: string } | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  user,
  onLogout,
}) => {
  return (
    <header style={{
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(7, 9, 14, 0.8)",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      padding: "14px 24px"
    }}>
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Brand */}
        <div 
          onClick={() => setCurrentView("catalog")}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <img
            src="/certify-icon.png"
            alt="Certify"
            style={{ width: 34, height: 34, objectFit: "contain" }}
          />
          <div>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", fontFamily: "var(--font-sans)" }}>
              Certify
            </span>
            <span style={{ 
              marginLeft: 8, 
              fontSize: "0.68rem", 
              padding: "2px 6px", 
              borderRadius: 6, 
              background: "rgba(99, 102, 241, 0.2)", 
              color: "#a5b4fc", 
              fontWeight: 700 
            }}>
              AI-POWERED
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setCurrentView("catalog")}
            className="btn-secondary"
            style={{
              background: currentView === "catalog" ? "rgba(99, 102, 241, 0.15)" : "transparent",
              borderColor: currentView === "catalog" ? "var(--primary)" : "transparent"
            }}
          >
            <BookOpen size={16} /> Course Catalog
          </button>

          <button
            onClick={() => setCurrentView("studio")}
            className="btn-secondary"
            style={{
              background: currentView === "studio" ? "rgba(99, 102, 241, 0.15)" : "transparent",
              borderColor: currentView === "studio" ? "var(--primary)" : "transparent"
            }}
          >
            <CheckCircle size={16} /> Learning Studio
          </button>
        </nav>

        {/* User Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 20,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)"
              }}>
                <User size={15} color="#94a3b8" />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user.fullName}</span>
              </div>
              <button 
                onClick={onLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "0.8rem",
                  cursor: "pointer"
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setCurrentView("studio")}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
