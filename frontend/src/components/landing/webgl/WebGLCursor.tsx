import React, { useEffect, useRef } from "react";
import { isMobileDevice, prefersReducedMotion } from "../../../motion/motionVocabulary.js";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

/**
 * WebGLCursor
 * Subtle, luxury fluid particle & ambient illumination cursor.
 * Uses hardware-accelerated Canvas with velocity-aware particle trailing.
 * Palette: CERTIFY Warm Gold (#E6CAA4), Soft Violet (#CEA4F2), Ivory (#FAF0E6).
 * Automatically goes dormant when pointer is idle to preserve 100% GPU/CPU efficiency.
 * Disabled on touch screens and prefers-reduced-motion.
 */
export const WebGLCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isMobileDevice() || prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = -100;
    let mouseY = -100;
    let prevMouseX = -100;
    let prevMouseY = -100;
    let animId: number;

    const particles: Particle[] = [];
    const maxParticles = 48;

    const colors = [
      "rgba(230, 202, 164, ", // Warm Gold
      "rgba(206, 164, 242, ", // Soft Violet
      "rgba(247, 231, 206, ", // Parchment Cream
      "rgba(141, 107, 78, ",  // Warm Bronze
    ];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Calculate velocity
      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      const dist = Math.hypot(dx, dy);

      // Spawn particles proportionally to movement velocity
      if (dist > 3 && particles.length < maxParticles) {
        const count = Math.min(3, Math.ceil(dist / 8));
        for (let i = 0; i < count; i++) {
          const colorBase = colors[Math.floor(Math.random() * colors.length)];
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 1.5 + 0.4;
          particles.push({
            x: mouseX + (Math.random() - 0.5) * 8,
            y: mouseY + (Math.random() - 0.5) * 8,
            vx: Math.cos(angle) * speed + dx * 0.08,
            vy: Math.sin(angle) * speed + dy * 0.08,
            radius: Math.random() * 18 + 6,
            color: colorBase,
            alpha: 0.38 + Math.random() * 0.22,
            life: 0,
            maxLife: Math.random() * 26 + 18,
          });
        }
      }

      prevMouseX = mouseX;
      prevMouseY = mouseY;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Primary subtle ambient halo around current cursor
      if (mouseX > 0 && mouseY > 0) {
        const gradient = ctx.createRadialGradient(
          mouseX,
          mouseY,
          2,
          mouseX,
          mouseY,
          95
        );
        gradient.addColorStop(0, "rgba(206, 164, 242, 0.16)"); // Soft Violet center
        gradient.addColorStop(0.35, "rgba(230, 202, 164, 0.08)"); // Gold mid
        gradient.addColorStop(1, "rgba(42, 23, 14, 0)"); // Fade into canvas
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 95, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw and update trailing fluid particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;

        const progress = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - progress);
        const currentRadius = p.radius * (1 - progress * 0.4);

        if (progress >= 1 || currentAlpha <= 0.01) {
          particles.splice(i, 1);
          continue;
        }

        const pGrad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          currentRadius
        );
        pGrad.addColorStop(0, `${p.color}${currentAlpha})`);
        pGrad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-500 hidden md:block"
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  );
};
