import React from 'react';
import { CalculatedZoneTime } from '../types/timezone';
import { Building2, Calendar, CheckCircle2, Moon, Sun, ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';

interface PriorityCardsGridProps {
  calculatedTimes: CalculatedZoneTime[];
  onSelectBase: (id: string) => void;
  title?: string;
  subtitle?: string;
  isCoreGroup?: boolean;
  onRemoveLocation?: (id: string) => void;
}

export const PriorityCardsGrid: React.FC<PriorityCardsGridProps> = ({
  calculatedTimes,
  onSelectBase,
  title = 'Priority Core Team Zones',
  isCoreGroup = true,
  onRemoveLocation,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
          {isCoreGroup && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              4 Core Priority
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">Click any card to set as base</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {calculatedTimes.map((item) => {
          const isBase = item.isReference;

          // Day shift indicator styling
          let dayBadgeColor = 'text-slate-400 bg-white/5';
          if (item.dayShift === 'yesterday') {
            dayBadgeColor = 'text-rose-300 bg-rose-500/15 border border-rose-500/30 font-semibold';
          } else if (item.dayShift === 'tomorrow') {
            dayBadgeColor = 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 font-semibold';
          }

          // Work status icon and color
          let statusColor = 'text-slate-400';
          let statusDotColor = 'bg-slate-500';
          let StatusIcon = Moon;

          if (item.workStatus === 'active') {
            statusColor = 'text-emerald-400';
            statusDotColor = 'bg-emerald-400';
            StatusIcon = CheckCircle2;
          } else if (item.workStatus === 'flexible') {
            statusColor = 'text-amber-400';
            statusDotColor = 'bg-amber-400';
            StatusIcon = Sun;
          }

          return (
            <div
              key={item.location.id}
              onClick={() => onSelectBase(item.location.id)}
              className={`relative rounded-2xl p-5 transition-all cursor-pointer group flex flex-col justify-between ${
                isBase
                  ? 'bg-slate-900/95 border-2 border-indigo-500 shadow-xl shadow-indigo-500/15 ring-2 ring-indigo-500/20'
                  : 'bg-slate-900/70 border border-white/10 hover:border-white/25 hover:bg-slate-800/80 hover:-translate-y-0.5 shadow-lg shadow-black/20'
              }`}
            >
              {/* Top Row: Work status and Day Shift Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${statusColor}`}>
                  <span className={`w-2 h-2 rounded-full ${statusDotColor} ${item.workStatus === 'active' ? 'animate-pulse' : ''}`} />
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[130px]">{item.statusLabel}</span>
                </div>

                <div className="flex items-center gap-1">
                  {isBase ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500 text-white flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>Base</span>
                    </span>
                  ) : (
                    <span className={`text-[10px] px-2 py-0.5 rounded ${dayBadgeColor}`}>
                      {item.dayShift === 'today' ? 'Today' : item.dayShiftLabel}
                    </span>
                  )}

                  {!isCoreGroup && onRemoveLocation && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveLocation(item.location.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-0.5 text-xs"
                      title="Remove zone"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Main 12-Hour Time Display */}
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white tabular-nums">
                    {String(item.hour12).padStart(2, '0')}:{String(item.minute).padStart(2, '0')}
                  </span>
                  <span className="text-lg font-mono font-bold text-slate-400">
                    {item.ampm}
                  </span>
                </div>

                {/* Prominent Date Display (Answering user's specific request) */}
                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className={item.dayShift === 'yesterday' ? 'text-rose-300 font-semibold' : item.dayShift === 'tomorrow' ? 'text-cyan-300 font-semibold' : 'text-slate-300'}>
                    {item.dateString}
                  </span>
                </div>

                {/* Relative Offset Line */}
                <div className="mt-1.5 flex items-center gap-1 text-xs">
                  {isBase ? (
                    <span className="text-indigo-400 font-semibold flex items-center gap-1">
                      ★ Reference baseline
                    </span>
                  ) : item.diffMinutes > 0 ? (
                    <span className="text-cyan-400 font-medium flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{item.diffFormatted}</span>
                    </span>
                  ) : item.diffMinutes < 0 ? (
                    <span className="text-amber-400 font-medium flex items-center gap-0.5">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>{item.diffFormatted}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">{item.diffFormatted}</span>
                  )}
                </div>
              </div>

              {/* Bottom: Location Details (Slack / Teams style matching screenshots) */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-sky-400 font-semibold truncate hover:underline" title={item.location.name}>
                    {item.location.name}
                  </span>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <span className="text-sm">{item.location.flag}</span>
                  <span className="font-mono text-[11px] font-semibold text-slate-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                    {item.location.tzCode}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
