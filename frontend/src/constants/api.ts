/**
 * Authoritative API endpoints for Certify.
 * In development (localhost/127.0.0.1): defaults to http://localhost:5000 unless overridden by VITE_API_URL.
 * In production (Cloudflare Pages, custom domain): automatically connects to https://api.certify.studio.
 */
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".local"));

export const API_ORIGIN =
  import.meta.env.VITE_API_URL ||
  (isLocalhost ? "http://localhost:5000" : "https://api.certify.studio");

export const API_BASE = `${API_ORIGIN}/api/v1`;
