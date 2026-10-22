import React, { useRef, useEffect } from "react";
import { isMobileDevice, prefersReducedMotion } from "../../../motion/motionVocabulary.js";

interface BulgeCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  highlightColor?: string;
}

/**
 * BulgeCard
 * Premium 3D perspective card with dynamic radial light flare & bulge response.
 * Uses native passive pointer tracking & requestAnimationFrame to update CSS transforms
 * directly with ZERO React re-renders, delivering pristine 120fps hardware acceleration.
 */
export const BulgeCard: React.FC<BulgeCardProps> = ({
  children,
  className = "",
  style = {},
  maxTilt = 7,
  highlightColor = "rgba(206, 164, 242, 0.15)",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const flareRef = useRef<HTMLDivElement>(null);
  const borderShineRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isMobileDevice() || prefersReducedMotion()) return;

    const card = cardRef.current;
    const flare = flareRef.current;
    const borderShine = borderShineRef.current;
    if (!card) return;

    let targetRotateX = 0;
    let targetRotateY = 0;
    let targetX = 50;
    let targetY = 50;
    let isHovered = false;

    const updateTransform = () => {
      if (!isHovered) {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        if (flare) flare.style.opacity = "0";
        if (borderShine) borderShine.style.opacity = "0";
        rafIdRef.current = null;
        return;
      }

      card.style.transform = `perspective(1000px) rotateX(${targetRotateX.toFixed(2)}deg) rotateY(${targetRotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
      if (flare) {
        flare.style.opacity = "1";
        flare.style.background = `radial-gradient(circle at ${targetX.toFixed(1)}% ${targetY.toFixed(1)}%, ${highlightColor} 0%, rgba(255,255,255,0.03) 30%, transparent 65%)`;
      }
      if (borderShine) {
        borderShine.style.opacity = "1";
      }
      rafIdRef.current = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      targetX = (x / rect.width) * 100;
      targetY = (y / rect.height) * 100;

      const normX = (x / rect.width - 0.5) * 2;
      const normY = (y / rect.height - 0.5) * 2;

      targetRotateY = normX * maxTilt;
      targetRotateX = -normY * maxTilt;
      isHovered = true;

      // Disable transition during active mouse tracking for instant response
      card.style.transition = "none";

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(updateTransform);
      }
    };

    const handleMouseLeave = () => {
      isHovered = false;
      // Re-enable smooth transition when releasing back to neutral
      card.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(updateTransform);
      }
    };

    card.addEventListener("mousemove", handleMouseMove, { passive: true });
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [maxTilt, highlightColor]);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden will-change-transform ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        ...style,
      }}
    >
      {/* Dynamic Cursor Flare & Radial Highlight */}
      <div
        ref={flareRef}
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-[inherit] opacity-0"
        aria-hidden="true"
      />

      {/* Subtle border shine highlight */}
      <div
        ref={borderShineRef}
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border border-[#E6CAA4]/20 transition-opacity duration-300 opacity-0"
        aria-hidden="true"
      />

      {children}
    </div>
  );
};
