import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

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
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [menuOrigin, setMenuOrigin] = useState<{ top: number; left: number; size: number }>({
    top: 20,
    left: 24,
    size: 48,
  });

  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll listener (keeps navbar completely transparent)
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 30;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenMenu = () => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuOrigin({
        top: rect.top,
        left: rect.left,
        size: rect.width || 48,
      });
    }
    setSideMenuOpen(true);
  };

  const sideMenuItems = [
    { label: "About", href: "#manifesto" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Courses", href: "#courses", onClick: onExploreCourses },
    { label: "Pedagogy", href: "#pedagogy" },
    { label: "Begin Diagnostic", href: "#diagnostic", onClick: onBeginDiagnostic },
  ];

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
      {/* Completely Transparent Top Header - No Division, Floating Controls */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-transparent transition-all duration-300 ease-out px-4 sm:px-6 lg:px-8 pointer-events-none ${
          scrolled ? "py-3 sm:py-4" : "py-4 sm:py-5"
        }`}
      >
        <div className="w-full flex items-center justify-between relative">
          {/* Left: Expanding Menu Circular Shape + Certify Logo (Aligned to extreme left) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 pointer-events-auto">
            {/* Dark Black Circular Burger Menu Button with 3 White Horizontal Lines */}
            <button
              ref={menuButtonRef}
              onClick={handleOpenMenu}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black hover:bg-neutral-900 border border-white/15 hover:border-white/25 shadow-lg shadow-black/60 flex flex-col items-center justify-center gap-[4.5px] transition-all duration-200 active:scale-95 cursor-pointer group shrink-0"
              aria-label="Open expanding side menu"
            >
              <span className="w-5 h-[2px] bg-white rounded-full transition-transform duration-200 group-hover:scale-x-110" />
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

          {/* Right: Flat Sign In & Register Buttons adjusted to theme (Extreme Right) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 pointer-events-auto">
            {/* Flat Sign In Button */}
            <button
              onClick={onSignIn}
              className="h-[38px] sm:h-[40px] px-4 sm:px-5 inline-flex items-center justify-center rounded-full text-[13.5px] sm:text-[14px] font-medium text-[#D1D5DB] hover:text-[#FEF5E5] hover:bg-white/[0.08] transition-colors cursor-pointer select-none shrink-0"
            >
              Sign In
            </button>

            {/* Flat Register Button */}
            <button
              onClick={onRegister || onSignIn}
              className="h-[38px] sm:h-[40px] px-4 sm:px-5 inline-flex items-center justify-center gap-1.5 rounded-full text-[13.5px] sm:text-[14px] font-medium text-[#FEF5E5] bg-white/[0.08] hover:bg-white/[0.14] border border-white/12 hover:border-white/25 transition-all cursor-pointer select-none shrink-0 active:scale-95 group"
            >
              <span>Register</span>
              <span className="text-[13px] opacity-80 group-hover:translate-x-0.5 transition-transform text-[#E6CAA4]">
                →
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Expanding Side Menu - Grows directly from the Menu Button */}
      <AnimatePresence>
        {sideMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setSideMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
              aria-hidden="true"
            />

            {/* Expanding Side Menu Card */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.1,
                borderRadius: 48,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                borderRadius: 32,
              }}
              exit={{
                opacity: 0,
                scale: 0.1,
                borderRadius: 48,
              }}
              transition={{
                type: "spring",
                damping: 24,
                stiffness: 260,
                mass: 0.8,
              }}
              style={{
                top: `${menuOrigin.top}px`,
                left: `${menuOrigin.left}px`,
                transformOrigin: `${menuOrigin.size / 2}px ${menuOrigin.size / 2}px`,
              }}
              className="fixed z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-32px)] h-[580px] sm:h-[620px] max-h-[calc(100vh-32px)] bg-[#141416]/98 border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl p-7 sm:p-9 flex flex-col justify-between text-[#FEF5E5] overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, delay: 0.08 }}
                className="h-full flex flex-col justify-between"
              >
                {/* Header with White Circular Close Button */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#E6CAA4] font-semibold">
                    CERTIFY • MENU
                  </span>

                  {/* Dark black circular close button */}
                  <button
                    onClick={() => setSideMenuOpen(false)}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black text-white border border-white/15 flex items-center justify-center hover:bg-neutral-900 transition-all duration-150 active:scale-95 cursor-pointer shadow-md"
                    aria-label="Close menu"
                  >
                    <span className="text-base font-bold text-white">✕</span>
                  </button>
                </div>

                {/* Main Menu Links (Large Editorial Typography) */}
                <ul className="space-y-3 sm:space-y-4 my-auto py-4">
                  {sideMenuItems.map((item, index) => (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.09 + index * 0.04, duration: 0.22 }}
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
                  </div>

                  <div className="space-y-2">
                    <a
                      href="#courses"
                      onClick={() => {
                        onExploreCourses();
                        setSideMenuOpen(false);
                      }}
                      className="block text-[#A1A1AA] hover:text-[#FEF5E5] transition-colors"
                    >
                      Courses
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavbar;
