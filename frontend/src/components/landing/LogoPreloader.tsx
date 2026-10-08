import React, { useEffect, useState, startTransition, useId } from "react";
import { prefersReducedMotion } from "../../motion/motionVocabulary.js";

export interface LogoPreloaderProps {
  /**
   * Logo image configuration
   */
  logo?: {
    src: string;
    alt?: string;
  };
  /**
   * Background color of the preloader overlay (defaults to deep espresso)
   */
  backgroundColor?: string;
  /**
   * Total duration in seconds before the exit sequence initiates
   */
  duration?: number;
  /**
   * Base sizing dimension for the logo (height in px, or custom dimension)
   */
  logoSize?: number | string;
  /**
   * Optional background video file
   */
  videoFile?: string;
  /**
   * Optional background image
   */
  backgroundImage?: {
    src: string;
    alt?: string;
  };
  /**
   * Easing curve for logo entrance animation
   */
  logoInEasing?: string;
  /**
   * Easing curve for logo exit animation
   */
  logoOutEasing?: string;
  /**
   * Easing curve for background fade transition
   */
  backgroundFadeEasing?: string;
  /**
   * Treatment variant: 'treatment' applies approved warm cream/champagne styling
   * to the Certify logo silhouette; 'image' renders raw standard img.
   */
  variant?: "treatment" | "image";
  /**
   * Additional style overrides
   */
  style?: React.CSSProperties;
  /**
   * Callback fired when preloader exit animation completely finishes
   */
  onComplete?: () => void;
}

/**
 * LogoPreloader
 *
 * Direct React adaptation of Framer Logo Pre-loader component:
 * https://framer.com/m/LogoPreloader-LQx6.js@GZIcrs0EE9lUY3jQTNPV
 *
 * Sequence:
 * 1. Init (t=0..50ms): Logo positioned below (+80px), hidden.
 * 2. Loading (t=50ms..duration): Logo animates up to center (translateY: 0), opacity: 1.
 * 3. LogoOut (t=duration..+700ms): Logo animates up (-80px), fades to 0. Background fades to 0.
 * 4. Done (t=duration+750ms): Overlay unmounts completely, normal interaction restored.
 */
export const LogoPreloader: React.FC<LogoPreloaderProps> = ({
  logo = { src: "/certify-logo.png", alt: "Certify" },
  backgroundColor = "#0B0604", // Deep espresso
  duration = 1.8,
  logoSize = 72,
  videoFile = "",
  backgroundImage = { src: "", alt: "" },
  logoInEasing = "cubic-bezier(.7,.2,.2,1)",
  logoOutEasing = "cubic-bezier(.7,.2,.2,1)",
  backgroundFadeEasing = "cubic-bezier(.7,.2,.2,1)",
  variant = "treatment",
  style,
  onComplete,
}) => {
  const [phase, setPhase] = useState<"init" | "loading" | "logoOut" | "done">("init");
  const isReduced = prefersReducedMotion();
  const preloaderId = useId();

  useEffect(() => {
    if (isReduced) {
      // Reduced motion: skip 80px travel, run short gentle fade
      const t0 = setTimeout(() => {
        startTransition(() => setPhase("loading"));
      }, 20);
      const t1 = setTimeout(() => {
        startTransition(() => setPhase("logoOut"));
      }, 350);
      const t2 = setTimeout(() => {
        startTransition(() => {
          setPhase("done");
          onComplete?.();
        });
      }, 650);

      return () => {
        clearTimeout(t0);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    // Standard cinematic sequence
    const t0 = setTimeout(() => {
      startTransition(() => setPhase("loading"));
    }, 50);

    const t1 = setTimeout(() => {
      startTransition(() => setPhase("logoOut"));
    }, duration * 1000 + 50);

    const t2 = setTimeout(() => {
      startTransition(() => {
        setPhase("done");
        onComplete?.();
      });
    }, duration * 1000 + 750);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [duration, isReduced, onComplete]);

  // Lock body scroll and pause Lenis while preloader is visible
  useEffect(() => {
    if (phase === "done") {
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && (window as any).__lenis) {
        (window as any).__lenis.start?.();
      }
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (typeof window !== "undefined" && (window as any).__lenis) {
      (window as any).__lenis.stop?.();
    }

    return () => {
      document.body.style.overflow = previousOverflow || "";
      if (typeof window !== "undefined" && (window as any).__lenis) {
        (window as any).__lenis.start?.();
      }
    };
  }, [phase]);

  // Once exit transition has completed, unmount entirely
  if (phase === "done") {
    return null;
  }

  // Animation values
  let logoTranslateY = 0;
  let logoOpacity = 1;

  if (isReduced) {
    logoTranslateY = 0;
    if (phase === "init") logoOpacity = 0;
    else if (phase === "loading") logoOpacity = 1;
    else if (phase === "logoOut") logoOpacity = 0;
  } else {
    if (phase === "init") {
      logoTranslateY = 70;
      logoOpacity = 0;
    } else if (phase === "loading") {
      logoTranslateY = 0;
      logoOpacity = 1;
    } else if (phase === "logoOut") {
      logoTranslateY = -70;
      logoOpacity = 0;
    }
  }

  const bgOpacity = phase === "logoOut" ? 0 : 1;
  const currentEasing = phase === "logoOut" ? logoOutEasing : logoInEasing;
  const transition = isReduced
    ? "opacity 0.25s ease-out"
    : `transform 0.7s ${currentEasing}, opacity 0.7s ${currentEasing}`;

  // Dimensions
  const logoHeight = typeof logoSize === "number" ? `${logoSize}px` : logoSize;
  const logoWidth =
    typeof logoSize === "number"
      ? `${Math.round(logoSize * 3.41)}px` // Natural aspect ratio of Certify wordmark (795/233)
      : "auto";

  return (
    <div
      id={`certify-preloader-${preloaderId}`}
      data-testid="certify-logo-preloader"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background:
          videoFile || backgroundImage.src
            ? undefined
            : `radial-gradient(ellipse at 50% 50%, #150C07 0%, ${backgroundColor} 75%, #060302 100%)`,
        backgroundImage: !videoFile && backgroundImage.src ? `url(${backgroundImage.src})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: isReduced
          ? "opacity 0.3s ease-out"
          : `opacity 0.7s ${backgroundFadeEasing}`,
        opacity: bgOpacity,
        pointerEvents: phase === "logoOut" ? "none" : "all",
        zIndex: 99999,
        overflow: "hidden",
        userSelect: "none",
        ...style,
      }}
      aria-label="Loading Certify"
      role="status"
      aria-live="polite"
    >
      {/* Optional background video support */}
      {videoFile && (
        <video
          src={videoFile}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            pointerEvents: "none",
            opacity: bgOpacity,
            transition: `opacity 0.7s ${backgroundFadeEasing}`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Animated Logo Container */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition,
          transform: `translateY(${logoTranslateY}px)`,
          opacity: logoOpacity,
          willChange: "transform, opacity",
          userSelect: "none",
        }}
      >
        {variant === "treatment" ? (
          /* Approved Warm Cream / Champagne Treatment on Certify Mark Silhouette */
          <div
            style={{
              width: logoWidth,
              height: logoHeight,
              maxWidth: "88vw",
              maxHeight: "120px",
              aspectRatio: "795 / 233",
              background:
                "linear-gradient(135deg, #FFF8EE 0%, #F5E8D8 45%, #E6CAA4 100%)",
              WebkitMaskImage: `url(${logo.src})`,
              maskImage: `url(${logo.src})`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              filter:
                "drop-shadow(0 4px 24px rgba(230, 202, 164, 0.22)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4))",
            }}
            aria-label={logo.alt || "Certify"}
            role="img"
          />
        ) : (
          /* Raw Image Fallback */
          <img
            src={logo.src}
            alt={logo.alt || "Certify Logo"}
            style={{
              width: logoWidth,
              height: logoHeight,
              maxWidth: "88vw",
              maxHeight: "120px",
              objectFit: "contain",
              userSelect: "none",
            }}
            draggable={false}
          />
        )}
      </div>
    </div>
  );
};

export default LogoPreloader;
