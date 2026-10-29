"use client";

import React from "react";

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  variant?: "default" | "light";
  className?: string;
}

export default function BrandLogo({
  size = 32,
  showText = true,
  variant = "default",
  className = "",
}: BrandLogoProps) {
  const isLight = variant === "light";

  return (
    <div
      className={`brand-logo-wrap ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        userSelect: "none",
        cursor: "pointer",
      }}
    >
      {/* Dynamic Vector Brand Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          flexShrink: 0,
          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="brand-logo-icon"
      >
        <defs>
          <linearGradient id="pkBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C417" />
            <stop offset="50%" stopColor="#00AA13" />
            <stop offset="100%" stopColor="#007E0D" />
          </linearGradient>
          <linearGradient id="pkGrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="40%" stopColor="#FDCB24" />
            <stop offset="100%" stopColor="#E59B00" />
          </linearGradient>
          <linearGradient id="pkLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D1FAE5" />
          </linearGradient>
          <filter id="pkShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="2.5"
              floodColor="#004D07"
              floodOpacity="0.3"
            />
          </filter>
        </defs>

        {/* Squircle Badge */}
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="34"
          fill="url(#pkBadgeGrad)"
        />
        <rect
          x="8"
          y="8"
          width="104"
          height="104"
          rx="32"
          stroke="#FFFFFF"
          strokeOpacity="0.25"
          strokeWidth="2"
        />

        <g filter="url(#pkShadow)">
          {/* Central Stem */}
          <path
            d="M42 90 C 44 74, 52 56, 68 34"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Leaf Sprout */}
          <path
            d="M52 64 C 64 62, 82 66, 88 56 C 84 72, 68 76, 56 72 Z"
            fill="url(#pkLeafGrad)"
          />

          {/* Sunburst Leaflet Accent */}
          <path
            d="M68 34 C 76 26, 88 24, 92 20 C 88 32, 78 38, 68 34 Z"
            fill="#FFF9A6"
          />

          {/* Golden Rice Grains (Kaltim Harvest) */}
          <path
            d="M64 38 C 56 34, 44 33, 40 40 C 42 49, 56 48, 62 42 Z"
            fill="url(#pkGrainGrad)"
            stroke="#B47200"
            strokeWidth="0.8"
          />
          <path
            d="M56 50 C 47 46, 35 46, 32 54 C 35 63, 49 61, 55 54 Z"
            fill="url(#pkGrainGrad)"
            stroke="#B47200"
            strokeWidth="0.8"
          />
          <path
            d="M49 63 C 39 59, 27 60, 24 68 C 28 77, 42 74, 47 67 Z"
            fill="url(#pkGrainGrad)"
            stroke="#B47200"
            strokeWidth="0.8"
          />
          <path
            d="M43 76 C 34 73, 23 75, 21 82 C 25 89, 38 86, 42 79 Z"
            fill="url(#pkGrainGrad)"
            stroke="#B47200"
            strokeWidth="0.8"
          />

          {/* IoT / Agro Data Root Node */}
          <circle cx="42" cy="90" r="4.5" fill="#FFFFFF" />
          <circle cx="42" cy="90" r="2" fill="#00AA13" />
        </g>
      </svg>

      {/* Brand Typography */}
      {showText && (
        <span
          style={{
            fontFamily: "var(--font-sans, sans-serif)",
            fontWeight: 800,
            fontSize: size >= 32 ? "20px" : "18px",
            letterSpacing: "-0.5px",
            lineHeight: 1,
            color: isLight ? "#FFFFFF" : "#111827",
            display: "inline-flex",
            alignItems: "baseline",
          }}
        >
          <span>Padi</span>
          <span style={{ color: "#00AA13" }}>Kaltim</span>
        </span>
      )}
    </div>
  );
}

