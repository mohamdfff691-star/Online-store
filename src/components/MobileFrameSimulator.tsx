import React from 'react';
import { Smartphone, Monitor, RotateCcw } from 'lucide-react';
import { ViewMode } from '../types';

interface MobileFrameSimulatorProps {
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  children: React.ReactNode;
}

export const MobileFrameSimulator: React.FC<MobileFrameSimulatorProps> = ({
  viewMode,
  onToggleViewMode,
  children,
}) => {
  if (viewMode === 'responsive') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#080809] py-6 px-4 flex flex-col items-center justify-start">
      {/* Simulation Controls Banner */}
      <div className="mb-4 flex items-center gap-4 bg-neutral-900 border border-[#D4AF37]/30 px-4 py-2 rounded-xl text-xs text-neutral-300 shadow-xl">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#D4AF37]" />
          <span className="font-semibold text-white">Mode Simulateur Smartphone (Vue Mobile 390px)</span>
        </div>
        <div className="h-4 w-[1px] bg-neutral-700" />
        <button
          onClick={onToggleViewMode}
          className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline font-medium"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Passer en Plein Écran (Bureau)</span>
        </button>
      </div>

      {/* Realistic Luxury Smartphone Chassis */}
      <div className="w-full max-w-[400px] h-[844px] rounded-[48px] bg-black border-4 border-[#D4AF37]/50 shadow-[0_25px_60px_-15px_rgba(212,175,55,0.25)] ring-1 ring-white/10 overflow-hidden flex flex-col relative">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>

        {/* Screen Frame with internal scrolling */}
        <div className="w-full h-full overflow-y-auto overflow-x-hidden relative flex flex-col pt-3">
          {children}
        </div>
      </div>
    </div>
  );
};
