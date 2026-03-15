import React from 'react';

interface AppIconProps {
  className?: string;
}

export function AppIcon({ className = '' }: AppIconProps) {
  return (
    <div
      className={`relative flex items-center rounded-2xl overflow-hidden border border-white/15 shadow-[0_0_24px_rgba(255,107,43,0.3)] ${className}`}
      style={{ height: 64, width: 'auto', minWidth: 220 }}
    >
      {/* Hintergrund: Zimmer-Szene */}
      <img
        src={`${import.meta.env.BASE_URL}images/bg.png`}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-top"
        style={{ filter: 'brightness(0.45) blur(0px)' }}
      />

      {/* Dunkler Gradient links für Text-Lesbarkeit */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.1) 100%)',
        }}
      />

      {/* Ralfis Close-Up rechts */}
      <img
        src={`${import.meta.env.BASE_URL}images/ralfis.png`}
        alt="Ralfis"
        className="absolute right-0 top-0 h-full object-cover object-top"
        style={{ width: 64, borderLeft: '1.5px solid rgba(255,107,43,0.3)' }}
      />

      {/* App-Name Text */}
      <div
        className="relative z-10 flex items-baseline gap-0 pl-4 pr-20"
        style={{ fontFamily: "'Oswald', sans-serif", textTransform: 'none' }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'hsl(22 95% 60%)',
            letterSpacing: '0.04em',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          ANAL
        </span>
        <span
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: 'hsl(40 20% 93%)',
            letterSpacing: '0.04em',
            lineHeight: 1,
            textTransform: 'none',
          }}
        >
          -üser
        </span>
      </div>
    </div>
  );
}
