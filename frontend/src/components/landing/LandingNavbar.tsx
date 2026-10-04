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
          className={`pointer-events-auto w-full max-w-[1240px] h-[58px] sm:h-[68px] px-3.5 sm:px-7 rounded-full bg-gradient-to-r from-[#F8F2E8] via-[#F5EBDD] to-[#EFE2D2] border border-[#DECBB7] shadow-[0_16px_40px_-8px_rgba(15,7,3,0.45),0_4px_12px_rgba(20,10,5,0.2)] backdrop-blur-md flex items-center justify-between transition-all duration-300`}
        >
          {/* Brand Anchor */}
          <a
            href="#"
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
            aria-label="CERTIFY Home"
          >
            {/* Socratic Academic / Botanical Crest Mark matching reference image */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 40 40"
              fill="none"
              className="shrink-0 transition-transform duration-200 group-hover:scale-105 sm:w-[38px] sm:h-[38px]"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="certifyMarkGrad" x1="20" y1="4" x2="20" y2="34" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6C4127" />
                  <stop offset="1" stopColor="#3C2114" />
                </linearGradient>
                <linearGradient id="certifyMarkAccent" x1="12" y1="12" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8C5836" />
                  <stop offset="1" stopColor="#552F1B" />
                </linearGradient>
              </defs>
              {/* Top center sphere/head */}
              <circle cx="20" cy="8" r="2.4" fill="url(#certifyMarkGrad)" />
              {/* Central upright bud/shoot */}
              <path
                d="M20 12 C18.8 15 18 17.5 18 20 C18 22.2 18.9 23.8 20 24.5 C21.1 23.8 22 22.2 22 20 C22 17.5 21.2 15 20 12 Z"
                fill="url(#certifyMarkGrad)"
              />
              {/* Left inner petal */}
              <path
                d="M17 14.5 C14.5 17.5 13.5 21 14.2 24 C14.8 26.2 17.2 27.5 20 27.5 C17.5 26 16.5 23.5 17 20.8 C17.4 18.4 18.6 16.2 19.8 15 C18.6 14.6 17.6 14.4 17 14.5 Z"
                fill="url(#certifyMarkAccent)"
              />
              {/* Right inner petal */}
              <path
                d="M23 14.5 C25.5 17.5 26.5 21 25.8 24 C25.2 26.2 22.8 27.5 20 27.5 C22.5 26 23.5 23.5 23 20.8 C22.6 18.4 21.4 16.2 20.2 15 C21.4 14.6 22.4 14.4 23 14.5 Z"
                fill="url(#certifyMarkAccent)"
              />
              {/* Outer sweeping left wing */}
              <path
                d="M12.5 19 C10.5 22.5 10.8 26.5 13.5 29.5 C15.5 31.5 18.5 32 20 32 C17.5 30.5 15.5 28 15 25 C14.6 22.5 15.5 20.5 16.8 19 C14.8 18.8 13.3 18.8 12.5 19 Z"
                fill="url(#certifyMarkGrad)"
              />
              {/* Outer sweeping right wing */}
              <path
                d="M27.5 19 C29.5 22.5 29.2 26.5 26.5 29.5 C24.5 31.5 21.5 32 20 32 C22.5 30.5 24.5 28 25 25 C25.4 22.5 24.5 20.5 23.2 19 C25.2 18.8 26.7 18.8 27.5 19 Z"
                fill="url(#certifyMarkGrad)"
              />
              {/* Lower base horizontal pedestal curves */}
              <path
                d="M11 28 C14 31 17 32.5 20 32.5 C23 32.5 26 31 29 28 C26 30 22.5 30.8 20 30.8 C17.5 30.8 14 30 11 28 Z"
                fill="#331A0F"
              />
            </svg>

            <div className="flex flex-col">
              <span className="text-[19px] sm:text-[22px] font-['Newsreader',Georgia,serif] font-bold tracking-[0.03em] text-[#24130D] leading-none">
                CERTIFY
              </span>
              <span className="hidden sm:inline-block text-[8.5px] font-bold tracking-[0.24em] text-[#7A5E4E] uppercase mt-1">
                LEARN • DEMONSTRATE • EARN
              </span>
            </div>
          </a>

          {/* Center Links with Active Sand Pill & Indicator Dot */}
          <nav
            ref={linksContainerRef}
            onMouseLeave={handleLinksLeave}
            className="hidden lg:flex items-center gap-4 sm:gap-6 relative px-2 py-1"
            aria-label="Main Navigation"
          >
            {/* Floating indicator background for hover */}
            <div
              className="absolute top-1 bottom-1 rounded-full bg-[#E5D6C4]/60 border border-[#D8C4AC]/60 pointer-events-none transition-all duration-200 ease-out"
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
                  className={`relative z-10 px-5 py-2 rounded-full text-[14px] transition-all duration-150 whitespace-nowrap cursor-pointer flex items-center justify-center ${
                    isActive
                      ? "bg-[#E6D7C5] text-[#24130D] font-semibold shadow-xs"
                      : "text-[#3E271C] hover:text-[#1F0E07] font-medium"
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
              className="h-[38px] px-4 sm:px-5 inline-flex items-center justify-center rounded-full text-[13.5px] font-medium text-[#2B160D] bg-[#EDE0CF]/30 hover:bg-[#EBDDCB]/70 border border-[#D5C2AD] transition-all cursor-pointer select-none shrink-0 active:scale-95"
            >
              Sign In
            </button>

            {/* Register action */}
            <button
              onClick={onRegister || onSignIn}
              className="h-[38px] px-4 sm:px-5 inline-flex items-center justify-center gap-1.5 rounded-full text-[13.5px] font-medium text-[#2B160D] bg-[#EDE0CF]/30 hover:bg-[#EBDDCB]/70 border border-[#D5C2AD] transition-all cursor-pointer select-none shrink-0 active:scale-95 group"
            >
              <span>Register</span>
              <span className="text-[13px] opacity-80 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </button>

            {/* Primary Action Button (Deep Espresso Pill matching reference) */}
            <button
              ref={magneticCtaRef}
              onClick={onBeginDiagnostic}
              className="h-[38px] sm:h-[40px] px-5 sm:px-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#3E2316] via-[#331B10] to-[#28140B] hover:from-[#4C2B1C] hover:to-[#351A0E] text-[#FAF2E8] text-[13.5px] font-semibold border border-[#5C3823] shadow-md shadow-[#23120B]/35 transition-all duration-150 active:scale-95 cursor-pointer select-none shrink-0 group"
            >
              <span className="magnetic-content flex items-center gap-1.5">
                <span>Begin Diagnostic</span>
                <span className="text-[13px] font-bold group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            <button
              onClick={onBeginDiagnostic}
              className="h-[32px] px-3 inline-flex items-center justify-center rounded-full bg-[#331B10] text-[#FAF2E8] text-[11px] font-semibold"
            >
              Diagnostic →
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-8 h-8 rounded-full bg-[#EFE3D3] border border-[#DECBB7] flex items-center justify-center text-[#2B160D] hover:text-[#000] transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span className="material-symbols-outlined text-[19px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Animated Overlay Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-gradient-to-b from-[#FBF5EC]/98 to-[#F2E5D4]/98 backdrop-blur-2xl flex flex-col justify-between p-6 pt-24 sm:hidden animate-fade-in text-[#2B160D]"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col gap-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A6050] mb-2 font-bold">
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
                className="text-[24px] font-['Newsreader',Georgia,serif] text-[#24130D] hover:text-[#5E3B75] transition-colors py-2 border-b border-[#DFCDBB]"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-[#DFCDBB]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBeginDiagnostic();
              }}
              className="w-full py-3.5 rounded-full bg-[#2B160D] text-[#FAF2E8] font-semibold text-[15px] flex items-center justify-center gap-2 shadow-md shadow-[#2B160D]/20"
            >
              <span>Begin Free Diagnostic</span>
              <span>→</span>
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignIn();
                }}
                className="py-3 rounded-full bg-[#FAF2E8] border border-[#DECBB7] text-[#2B160D] font-medium text-[14px]"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  (onRegister || onSignIn)();
                }}
                className="py-3 rounded-full bg-[#FAF2E8] border border-[#DECBB7] text-[#2B160D] font-medium text-[14px]"
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
