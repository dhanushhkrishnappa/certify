import React, { useRef, useState } from "react";
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
 * Tracks pointer coordinates relative to card center, applies smooth rotation and
 * dynamic illumination gradient. Gracefully falls back on touch or reduced motion.
 */
export const BulgeCard: React.FC<BulgeCardProps> = ({
  children,
  className = "",
  style = {},
  maxTilt = 7,
  highlightColor = "rgba(206, 164, 242, 0.15)",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number; rotateX: number; rotateY: number; active: boolean }>({
    x: 50,
    y: 50,
    rotateX: 0,
    rotateY: 0,
    active: false,
  });

  const [disabled] = useState(() => isMobileDevice() || prefersReducedMotion());

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    // Calculate rotation (-maxTilt to +maxTilt)
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;

    const rotateY = normX * maxTilt;
    const rotateX = -normY * maxTilt;

    setCoords({
      x: percentX,
      y: percentY,
      rotateX,
      rotateY,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setCoords((prev) => ({
      ...prev,
      rotateX: 0,
      rotateY: 0,
      active: false,
    }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transform:
          !disabled && coords.active
            ? `perspective(1000px) rotateX(${coords.rotateX}deg) rotateY(${coords.rotateY}deg) scale3d(1.015, 1.015, 1.015)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        ...style,
      }}
    >
      {/* Dynamic Cursor Flare & Radial Highlight */}
      {!disabled && (
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-[inherit]"
          style={{
            opacity: coords.active ? 1 : 0,
            background: `radial-gradient(circle at ${coords.x}% ${coords.y}%, ${highlightColor} 0%, rgba(255,255,255,0.03) 30%, transparent 65%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Subtle border shine highlight */}
      {!disabled && coords.active && (
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border border-[#E6CAA4]/20"
          aria-hidden="true"
        />
      )}

      {children}
    </div>
  );
};
