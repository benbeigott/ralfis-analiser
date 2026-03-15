import React from 'react';
import { Mic, RefreshCcw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBpmSession } from '../hooks/use-bpm-session';
import { VinylMeter } from '../components/VinylMeter';
import { HistoryPanel } from '../components/HistoryPanel';
import { AppIcon } from '../components/AppIcon';

export default function Home() {
  const { state, result, errorMsg, progress, startAnalysis, reset } = useBpmSession();

  const getRalfisMessage = () => {
    switch (state) {
      case 'idle': return "Leg endlich die Platte auf.";
      case 'recording': return "Ich hör's... sei ruhig.";
      case 'analyzing': return "Einen Moment. Ich rechne.";
      case 'result': return `Hab's. ${result?.bpm} BPM. War nix Besonderes.`;
      case 'error': return "Dein Mikro ist Müll. Nochmal.";
      default: return "";
    }
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-x-hidden"
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}images/bg.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay so content stays readable */}
      <div className="absolute inset-0 bg-black/55" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8 lg:mb-12 py-4 px-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-lg">
          <h1 className="m-0">
            <AppIcon />
          </h1>
          <div className="hidden sm:flex px-4 py-2 rounded-lg border border-primary/20 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(255,107,43,0.1)]">
            BPM Detector
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Mascot & Personality */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center lg:pt-10">
            <div className="relative w-full max-w-[280px] lg:max-w-[340px]">
              {/* Speech Bubble */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={state}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute -top-16 lg:-top-24 -right-4 lg:-right-16 z-20 bg-zinc-900 border-2 border-primary/50 text-foreground p-4 rounded-2xl rounded-bl-none shadow-xl min-w-[220px]"
                >
                  <p className="font-display font-medium text-sm lg:text-base italic tracking-wide">"{getRalfisMessage()}"</p>
                </motion.div>
              </AnimatePresence>

              {/* Mascot Image */}
              <motion.div
                animate={
                  state === 'recording' ? { scale: 1.05, rotate: [-1, 1, -1] } : 
                  state === 'analyzing' ? { y: [0, -5, 0] } :
                  { y: [0, -10, 0] }
                }
                transition={
                  state === 'recording' ? { repeat: Infinity, duration: 2 } :
                  state === 'analyzing' ? { repeat: Infinity, duration: 1 } :
                  { repeat: Infinity, duration: 4, ease: "easeInOut" }
                }
                className="relative z-10 drop-shadow-2xl"
              >
                <img 
                  src={`${import.meta.env.BASE_URL}images/ralfis.png`} 
                  alt="Ralfis" 
                  className="w-full h-auto object-contain drop-shadow-[0_0_30px_rgba(255,107,43,0.15)]"
                />
              </motion.div>
              
              {/* Mascot shadow on floor */}
              <div className="w-3/4 h-8 bg-black/50 blur-xl rounded-full mx-auto -mt-6 relative z-0"></div>
            </div>
          </div>

          {/* Center Column: Analyzer Controls */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-card/40 rounded-3xl p-6 lg:p-8 border border-white/5 shadow-2xl backdrop-blur-md">
            <VinylMeter state={state} bpm={result?.bpm || null} progress={progress} />

            <div className="mt-10 w-full flex flex-col items-center">
              {/* Action Buttons */}
              {state === 'idle' || state === 'error' || state === 'result' ? (
                <button
                  onClick={startAnalysis}
                  className="group relative w-full px-8 py-5 rounded-xl bg-zinc-950 border-2 border-primary/30 hover:border-primary/80 transition-all duration-300 overflow-hidden flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(255,107,43,0.3)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/40 transition-colors">
                    <Mic className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-display font-bold text-xl text-foreground tracking-wide group-hover:text-primary transition-colors">START</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">8 Sek Aufnahme</span>
                  </div>
                </button>
              ) : null}

              {state === 'result' && (
                <button
                  onClick={reset}
                  className="mt-6 px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-all"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Nochmal
                </button>
              )}

              {errorMsg && (
                <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center max-w-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {errorMsg}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-3 h-[400px] lg:h-full lg:min-h-[600px]">
            <HistoryPanel />
          </div>

        </div>
      </div>
    </div>
  );
}
