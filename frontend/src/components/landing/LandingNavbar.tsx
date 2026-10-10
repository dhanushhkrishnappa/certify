import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("About");
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const linksContainerRef = useRef<HTMLDivElement>(null);
  const magneticCtaRef = useMagnetic<HTMLButtonElement>({ strength: 0.28 });

  // Scroll listener for top header background transition
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

  const sideMenuItems = [
    { label: "About", href: "#manifesto" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Courses", href: "#courses", onClick: onExploreCourses },
    { label: "Pedagogy", href: "#pedagogy" },
    { label: "Verification Stack", href: "#verification-scroll-stack" },
    { label: "Begin Diagnostic", href: "#diagnostic", onClick: onBeginDiagnostic },
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

  // Close expanding side menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sideMenuOpen) {
        setSideMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sideMenuOpen]);

  return (
    <>
      {/* Edge-to-Edge Open Top Header (Pill container removed) */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out px-4 sm:px-8 lg:px-12 ${
          scrolled
            ? "py-3 sm:py-4 bg-black/40 backdrop-blur-md border-b border-white/[0.04]"
            : "py-5 sm:py-6 bg-transparent"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Expanding Menu Circular Shape + Certify Logo */}
          <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
            {/* Circular button matching https://expandingsidemenu.framer.website/ */}
            <button
              onClick={() => setSideMenuOpen(true)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#141418] hover:bg-[#1E1E24] border border-white/10 hover:border-white/25 shadow-lg flex flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer group"
              aria-label="Open expanding side menu"
            >
              <span className="w-5 h-[2px] bg-white rounded-full transition-transform duration-200 group-hover:scale-x-110" />
              <span className="w-5 h-[2px] bg-white rounded-full transition-transform duration-200 group-hover:scale-x-110" />
            </button>

            {/* Brand Logo Wordmark */}
            <a
              href="#"
              className="flex items-center cursor-pointer select-none group"
              aria-label="Certify Home"
            >
              <img
                src="/certify-logo.png"
                alt="Certify"
                className="h-[30px] sm:h-[38px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </a>
          </div>

          {/* Center: Middle Navigation Buttons */}
          <nav
            ref={linksContainerRef}
            onMouseLeave={handleLinksLeave}
            className="hidden md:flex items-center gap-1.5 lg:gap-2 relative"
            aria-label="Main Navigation"
          >
            {/* Floating indicator background for hover */}
            <div
              className="absolute top-1 bottom-1 rounded-full bg-white/[0.06] border border-white/[0.08] pointer-events-none transition-all duration-200 ease-out"
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
                  className={`relative z-10 px-4 py-2 rounded-full text-[14px] transition-all duration-150 whitespace-nowrap cursor-pointer flex items-center justify-center ${
                    isActive
                      ? "bg-white/[0.12] text-[#FEF5E5] font-semibold border border-white/[0.15] shadow-xs"
                      : "text-[#D1D5DB] hover:text-[#FEF5E5] font-medium"
                  }`}
                >
                  <span className="leading-none">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right: Sign In / Register / Diagnostic Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sign In action */}
            <button
              onClick={onSignIn}
              className="h-[38px] sm:h-[40px] px-4 sm:px-5 inline-flex items-center justify-center rounded-full text-[13.5px] sm:text-[14px] font-medium text-[#FEF5E5] bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all cursor-pointer select-none shrink-0 active:scale-95"
            >
              Sign In
            </button>

            {/* Register action */}
            <button
              onClick={onRegister || onSignIn}
              className="h-[38px] sm:h-[40px] px-4 sm:px-5 inline-flex items-center justify-center gap-1.5 rounded-full text-[13.5px] sm:text-[14px] font-medium text-[#FEF5E5] bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all cursor-pointer select-none shrink-0 active:scale-95 group"
            >
              <span>Register</span>
              <span className="text-[13px] opacity-80 group-hover:translate-x-0.5 transition-transform text-[#E6CAA4]">
                →
              </span>
            </button>

            {/* Primary Action: Begin Diagnostic */}
            <button
              ref={magneticCtaRef}
              onClick={onBeginDiagnostic}
              className="hidden sm:inline-flex h-[38px] sm:h-[40px] px-5 sm:px-6 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#2A2A30] via-[#1E1E22] to-[#141416] hover:from-[#34343A] hover:to-[#222226] text-[#FEF5E5] text-[13.5px] sm:text-[14px] font-semibold border border-white/10 hover:border-white/20 shadow-md shadow-black/50 transition-all duration-150 active:scale-95 cursor-pointer select-none shrink-0 group"
            >
              <span className="magnetic-content flex items-center gap-1.5">
                <span>Begin Diagnostic</span>
                <span className="text-[13px] font-bold group-hover:translate-x-0.5 transition-transform text-[#E6CAA4]">
                  →
                </span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Expanding Side Menu (Matching https://expandingsidemenu.framer.website/) */}
      <AnimatePresence>
        {sideMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSideMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
              aria-hidden="true"
            />

            {/* Expanding Side Menu Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: -16, y: -16 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, x: -12, y: -12 }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed top-5 left-5 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-40px)] h-[580px] sm:h-[620px] max-h-[calc(100vh-40px)] rounded-[32px] bg-[#141416]/98 border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl p-7 sm:p-9 flex flex-col justify-between text-[#FEF5E5] overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              {/* Header with White Circular Close Button */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#E6CAA4] font-semibold">
                  CERTIFY • MENU
                </span>

                {/* White circular close button from the Framer design */}
                <button
                  onClick={() => setSideMenuOpen(false)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-all duration-150 active:scale-95 cursor-pointer shadow-md"
                  aria-label="Close menu"
                >
                  <span className="text-base font-bold">✕</span>
                </button>
              </div>

              {/* Main Menu Links (Large Editorial Typography) */}
              <ul className="space-y-3 sm:space-y-4 my-auto py-4">
                {sideMenuItems.map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.045, duration: 0.22 }}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => {
                        if (item.onClick) {
                          e.preventDefault();
                          item.onClick();
                        }
                        setSideMenuOpen(false);
                      }}
                      className="font-['Newsreader',Georgia,serif] text-3xl sm:text-[36px] font-normal text-[#FEF5E5] hover:text-[#CEA4F2] transition-colors leading-tight inline-block cursor-pointer"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              {/* Footer 2-Column Links (Matching Framer component layout) */}
              <div className="pt-5 border-t border-white/[0.08] grid grid-cols-2 gap-4 text-xs font-['Plus_Jakarta_Sans',sans-serif]">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onSignIn();
                      setSideMenuOpen(false);
                    }}
                    className="block text-[#A1A1AA] hover:text-[#FEF5E5] transition-colors cursor-pointer text-left font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      (onRegister || onSignIn)();
                      setSideMenuOpen(false);
                    }}
                    className="block text-[#A1A1AA] hover:text-[#FEF5E5] transition-colors cursor-pointer text-left font-medium"
                  >
                    Register
                  </button>
                  <a
                    href="#manifesto"
                    onClick={() => setSideMenuOpen(false)}
                    className="block text-[#A1A1AA] hover:text-[#FEF5E5] transition-colors"
                  >
                    Manifesto
                  </a>
                </div>

                <div className="space-y-2">
                  <a
                    href="#verification-scroll-stack"
                    onClick={() => setSideMenuOpen(false)}
                    className="block text-[#A1A1AA] hover:text-[#FEF5E5] transition-colors"
                  >
                    Verification
                  </a>
                  <a
                    href="#pedagogy"
                    onClick={() => setSideMenuOpen(false)}
                    className="block text-[#A1A1AA] hover:text-[#FEF5E5] transition-colors"
                  >
                    Socratic Viva
                  </a>
                  <a
                    href="#faq"
                    onClick={() => setSideMenuOpen(false)}
                    className="block text-[#A1A1AA] hover:text-[#FEF5E5] transition-colors"
                  >
                    Support &amp; FAQ
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavbar;
