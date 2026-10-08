import React, { useState, useEffect, useRef } from "react";
import { useMagnetic } from "../../motion/useMagnetic.js";
import { prefersReducedMotion } from "../../motion/motionVocabulary.js";

interface LandingNavbarProps {
  onExploreCourses: () => void;
  onBeginDiagnostic: () => void;
  onSignIn: () => void;
  onRegister?: () => void;
  onContactClick?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onExploreCourses,
  onBeginDiagnostic,
  onSignIn,
  onRegister,
  onContactClick,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("About");
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const navRef = useRef<HTMLDivElement>(null);
  const linksContainerRef = useRef<HTMLDivElement>(null);
  const magneticCtaRef = useMagnetic<HTMLButtonElement>({ strength: 0.28 });

  // Scroll listener for sticky navbar background transition
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 30;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "About", href: "#manifesto" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Courses", href: "#courses", onClick: onExploreCourses },
    { label: "Contact", href: "#diagnostic", onClick: onContactClick },
  ];

  const handleLinkHover = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion()) return;
    const target = e.currentTarget;
    const container = linksContainerRef.current;
    if (!container) return;

    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setIndicatorStyle({
      left: targetRect.left - containerRect.left,
      width: targetRect.width,
      opacity: 1,
    });
  };

  const handleLinksLeave = () => {
    setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300 ease-out px-4 sm:px-6 lg:px-8 ${
          scrolled ? "pt-2.5 sm:pt-3.5" : "pt-4 sm:pt-6"
        }`}
      >
        <div
          className={`pointer-events-auto w-full max-w-[1240px] h-[58px] sm:h-[68px] px-3.5 sm:px-6 rounded-2xl bg-[#121215]/85 border border-white/12 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl flex items-center justify-between transition-all duration-300`}
        >
          {/* Official Brand Wordmark Anchor */}
          <a
            href="#"
            className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
            aria-label="Certify Home"
          >
            <img
              src="/certify-logo.png"
              alt="Certify"
              className="h-[28px] sm:h-[38px] w-auto max-w-[120px] sm:max-w-none object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </a>

          {/* Center Links with Active Sand Pill */}
          <nav
            ref={linksContainerRef}
            onMouseLeave={handleLinksLeave}
            className="hidden lg:flex items-center gap-1.5 sm:gap-2 relative px-2 py-1"
            aria-label="Main Navigation"
          >
            {/* Floating indicator background for hover */}
            <div
              className="absolute top-1 bottom-1 rounded-xl bg-white/8 border border-white/12 pointer-events-none transition-all duration-200 ease-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
              aria-hidden="true"
            />

            {navLinks.map((item) => {
              const isActive = activeTab === item.label;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                    setActiveTab(item.label);
                  }}
                  onMouseEnter={handleLinkHover}
                  className={`relative z-10 px-4 py-2 rounded-xl text-[14px] transition-all duration-150 whitespace-nowrap cursor-pointer flex items-center justify-center ${
                    isActive
                      ? "bg-white/12 text-[#FEF5E5] font-semibold border border-white/18 shadow-xs"
                      : "text-[#D1D5DB] hover:text-[#FEF5E5] font-medium"
                  }`}
                >
                  <span className="leading-none">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Trailing Actions: Sign In, Register, Begin Diagnostic */}
          <div className="hidden sm:flex items-center gap-2.5 md:gap-3 shrink-0">
            {/* Sign In action */}
            <button
              onClick={onSignIn}
              className="h-[38px] px-4 sm:px-5 inline-flex items-center justify-center rounded-xl text-[13.5px] font-medium text-[#FEF5E5] bg-white/6 hover:bg-white/12 border border-white/12 transition-all cursor-pointer select-none shrink-0 active:scale-95"
            >
              Sign In
            </button>

            {/* Register action */}
            <button
              onClick={onRegister || onSignIn}
              className="h-[38px] px-4 sm:px-5 inline-flex items-center justify-center gap-1.5 rounded-xl text-[13.5px] font-medium text-[#FEF5E5] bg-white/6 hover:bg-white/12 border border-white/12 transition-all cursor-pointer select-none shrink-0 active:scale-95 group"
            >
              <span>Register</span>
              <span className="text-[13px] opacity-80 group-hover:translate-x-0.5 transition-transform text-[#E6CAA4]">
                →
              </span>
            </button>

            {/* Primary Action Button */}
            <button
              ref={magneticCtaRef}
              onClick={onBeginDiagnostic}
              className="h-[38px] sm:h-[40px] px-5 sm:px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#2A2A30] via-[#1E1E22] to-[#141416] hover:from-[#34343A] hover:to-[#222226] text-[#FEF5E5] text-[13.5px] font-semibold border border-white/16 shadow-md shadow-black/50 transition-all duration-150 active:scale-95 cursor-pointer select-none shrink-0 group"
            >
              <span className="magnetic-content flex items-center gap-1.5">
                <span>Begin Diagnostic</span>
                <span className="text-[13px] font-bold group-hover:translate-x-0.5 transition-transform text-[#E6CAA4]">
                  →
                </span>
              </span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            <button
              onClick={onBeginDiagnostic}
              className="h-[32px] px-3 inline-flex items-center justify-center rounded-xl bg-[#222226] text-[#FEF5E5] text-[11px] font-semibold border border-white/14"
            >
              Diagnostic →
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-8 h-8 rounded-xl bg-white/8 border border-white/14 flex items-center justify-center text-[#FEF5E5] hover:text-[#E6CAA4] transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Animated Overlay Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0E0E11]/96 backdrop-blur-2xl flex flex-col justify-between p-6 pt-24 sm:hidden animate-fade-in text-[#FEF5E5]"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col gap-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#E6CAA4] mb-2 font-bold">
              Navigation
            </div>
            {navLinks.map((item, idx) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setMobileMenuOpen(false);
                }}
                className="text-[24px] font-['Newsreader',Georgia,serif] text-[#FEF5E5] hover:text-[#CEA4F2] transition-colors py-2 border-b border-white/10"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBeginDiagnostic();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2A2A30] via-[#1E1E22] to-[#141416] text-[#FEF5E5] font-semibold text-[15px] flex items-center justify-center gap-2 shadow-md border border-white/16"
            >
              <span>Begin Free Diagnostic</span>
              <span className="text-[#E6CAA4]">→</span>
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignIn();
                }}
                className="py-3 rounded-xl bg-white/8 border border-white/12 text-[#FEF5E5] font-medium text-[14px]"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  (onRegister || onSignIn)();
                }}
                className="py-3 rounded-xl bg-white/8 border border-white/12 text-[#FEF5E5] font-medium text-[14px]"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
