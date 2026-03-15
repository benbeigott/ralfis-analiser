import React from 'react';

interface AppIconProps {
  size?: number;
  className?: string;
}

export function AppIcon({ size = 40, className = '' }: AppIconProps) {
  return (
    <div 
      className={`relative flex items-center justify-center rounded-xl bg-[#0d0d1a] border border-primary/30 overflow-hidden shadow-[0_0_15px_rgba(255,107,43,0.3)] ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <img 
        src={`${import.meta.env.BASE_URL}images/ralfis.png`} 
        alt="Ralfis" 
        className="w-full h-full object-cover opacity-80"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm pb-0.5">
        <span className="block text-center font-display font-bold text-primary" style={{ fontSize: size * 0.25, lineHeight: 1.2 }}>
          RALFIS
        </span>
      </div>
    </div>
  );
}
