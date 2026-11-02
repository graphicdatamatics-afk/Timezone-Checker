import React from 'react';
import { Clock, Radio, Sparkles, Copy } from 'lucide-react';

interface HeaderProps {
  isLive: boolean;
  onToggleLive: () => void;
  onOpenShareModal: () => void;
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLive,
  onToggleLive,
  onOpenShareModal,
  onOpenAddModal,
}) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">VibeClock Sync</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              12-Hour System
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Distributed Team Timezone Matrix & Overlap Visualizer
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Live Clock Button */}
        <button
          onClick={onToggleLive}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isLive
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10'
          }`}
          title={isLive ? 'Currently synced to real-world clock' : 'Click to turn on live real-time ticking'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <Radio className="w-3.5 h-3.5" />
          <span>{isLive ? 'Live Sync Active' : 'Enable Live Clock'}</span>
        </button>

        {/* Copy Meeting Schedule Button */}
        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5 text-cyan-400" />
          <span>Copy Invite Times</span>
        </button>

        {/* Add Timezone Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm shadow-indigo-600/30 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Manage Zones</span>
        </button>
      </div>
    </header>
  );
};
