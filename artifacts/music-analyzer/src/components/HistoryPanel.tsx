import React from 'react';
import { format } from 'date-fns';
import { Trash2, Flame, Skull, Zap } from 'lucide-react';
import { useGetAnalysisHistory, useClearAnalysisHistory, getGetAnalysisHistoryQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

export function HistoryPanel() {
  const queryClient = useQueryClient();
  const { data: history, isLoading } = useGetAnalysisHistory();
  
  const clearMutation = useClearAnalysisHistory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAnalysisHistoryQueryKey() });
      }
    }
  });

  const getMoodIcon = (bpm: number) => {
    if (bpm > 140) return <Flame className="w-5 h-5 text-red-500" />;
    if (bpm < 90) return <Skull className="w-5 h-5 text-purple-500" />;
    return <Zap className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 h-full flex flex-col max-h-[600px] border-t-4 border-t-primary/50">
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <h3 className="text-lg font-display flex flex-col text-foreground leading-tight">
          <span className="text-xs text-primary font-bold tracking-widest uppercase">Archiv</span>
          Ralfis' Beats
        </h3>
        
        {history && history.length > 0 && (
          <button 
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
            className="text-[10px] px-3 py-1.5 rounded bg-destructive/10 font-bold uppercase tracking-widest text-destructive hover:bg-destructive hover:text-white flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Löschen
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs uppercase tracking-widest font-bold">Lade Archiv...</p>
          </div>
        ) : history && history.length > 0 ? (
          history.map((record) => (
            <div 
              key={record.id} 
              className="bg-zinc-950 border border-white/5 rounded-xl p-3 flex items-center justify-between hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-colors">
                  {getMoodIcon(record.bpm)}
                </div>
                <div>
                  <div className="font-display font-bold text-foreground text-lg flex items-baseline gap-1">
                    {record.bpm} <span className="text-[10px] text-muted-foreground uppercase tracking-widest">BPM</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium opacity-60">
                    {format(new Date(record.analyzedAt), 'dd.MM. yy - HH:mm')}
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Sicher?</div>
                <div className="w-12 h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${Math.round(record.confidence * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-4">
            <Zap className="w-12 h-12 opacity-20" />
            <p className="text-xs uppercase tracking-widest text-center px-4 font-bold">
              Hier ist nix. Zeig was du hast.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 107, 43, 0.5);
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarStyles;
  document.head.appendChild(style);
}
