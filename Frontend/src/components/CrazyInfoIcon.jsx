// src/components/CrazyInfoIcon.jsx
import React from "react";
import "./crazyInfoIcon.css";

const NeonInfo = ({ size }) => (
  <svg
    className="ci-icon ci-neon"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="#00eaff" strokeWidth="1.8" />
    <path d="M12 16v-4" stroke="#00eaff" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1.2" fill="#00eaff" />
  </svg>
);

const PulseInfo = ({ size }) => (
  <svg
    className="ci-icon ci-pulse"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" fill="rgba(0,200,255,0.08)" stroke="#00c8ff" strokeWidth="1.4" />
    <path d="M12 16v-4" stroke="#00c8ff" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1.4" fill="#00c8ff" />
  </svg>
);

const GradientInfo = ({ size }) => (
  <svg
    className="ci-icon ci-gradient"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="ciGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff00ea" />
        <stop offset="100%" stopColor="#00eaff" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="url(#ciGrad)" strokeWidth="1.6" />
    <path d="M12 16v-4" stroke="url(#ciGrad)" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1.3" fill="url(#ciGrad)" />
  </svg>
);

const GlassInfo = ({ size }) => (
  <div
    className="ci-glass"
    style={{
      width: size,
      height: size,
      fontSize: size * 0.65
    }}
  >
    <span className="ci-glass-i">i</span>
  </div>
);

const variants = {
  neon: NeonInfo,
  pulse: PulseInfo,
  gradient: GradientInfo,
  glass: GlassInfo
};

export default function CrazyInfoIcon({ size = 28, variant = "neon" }) {
  const Icon = variants[variant] || NeonInfo;
  return <Icon size={size} />;
}
