import React from 'react';
import { motion } from 'framer-motion';
import { Disc3, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VinylMeterProps {
  state: 'idle' | 'recording' | 'analyzing' | 'result' | 'error';
  bpm: number | null;
  progress: number;
}

export function VinylMeter({ state, bpm, progress }: VinylMeterProps) {
  const isSpinning = state === 'recording' || state === 'analyzing';
  
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto flex items-center justify-center">
      {/* Outer Glow Ring */}
      <motion.div 
        className={cn(
          "absolute inset-0 rounded-full border border-primary/20",
          state === 'recording' ? "border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)]" :
          state === 'result' ? "border-primary/60 shadow-[0_0_60px_rgba(255,107,43,0.4)]" :
          "border-white/10"
        )}
        animate={{ scale: isSpinning ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Progress SVG Ring (Recording indicator) */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle 
          cx="50" cy="50" r="48" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          className="text-white/5"
        />
        <motion.circle 
          cx="50" cy="50" r="48" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          className={state === 'recording' ? "text-red-500" : "text-primary"}
          strokeDasharray="301.59" // 2 * PI * 48
          strokeDashoffset={301.59 - (progress / 100) * 301.59}
          transition={{ duration: 0.1 }}
        />
      </svg>

      {/* The Vinyl Record */}
      <motion.div 
        className="relative w-[85%] h-[85%] rounded-full bg-zinc-950 border-4 border-zinc-900 shadow-2xl flex items-center justify-center overflow-hidden"
        animate={{ rotate: isSpinning ? 360 : 0 }}
        transition={{ duration: state === 'analyzing' ? 0.8 : 2, repeat: Infinity, ease: "linear" }}
      >
        {/* Vinyl Grooves */}
        <div className="absolute inset-0 rounded-full border border-white/5 m-3"></div>
        <div className="absolute inset-0 rounded-full border border-white/5 m-6"></div>
        <div className="absolute inset-0 rounded-full border border-white/5 m-10"></div>
        <div className="absolute inset-0 rounded-full border border-white/5 m-14"></div>
        
        {/* Label Area */}
        <div className={cn(
          "relative w-28 h-28 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center border-4 border-zinc-900 transition-colors duration-500",
          state === 'result' ? "bg-primary/20 neon-box" : "bg-zinc-800"
        )}>
          {/* Spindle Hole */}
          <div className="absolute w-3 h-3 bg-zinc-950 rounded-full border border-zinc-900 z-10" />
          
          <div className="z-0 flex flex-col items-center">
            {state === 'idle' && (
              <Disc3 className="w-10 h-10 text-zinc-500/50 mb-1" />
            )}
            
            {state === 'recording' && (
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse mb-1 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Rec</span>
              </div>
            )}

            {state === 'analyzing' && (
              <Zap className="w-10 h-10 text-primary animate-pulse mb-1" />
            )}

            {state === 'result' && bpm && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <span className="text-5xl md:text-6xl font-display font-black text-primary neon-text leading-none tracking-tighter">{bpm}</span>
                <span className="text-[10px] md:text-xs text-primary/80 font-bold uppercase tracking-widest mt-1">BPM</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
