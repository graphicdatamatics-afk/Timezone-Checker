import React from 'react';
import { BaseTimeInput, TimezoneLocation } from '../types/timezone';
import { calculateAllZoneTimes, to12Hour, to24Hour } from '../utils/timeCalculations';
import { Sparkles, Users } from 'lucide-react';

interface OverlapTimelineMatrixProps {
  locations: TimezoneLocation[];
  refLocationId: string;
  baseInput: BaseTimeInput;
  onSelectHour: (hour12: number, ampm: 'AM' | 'PM') => void;
}

export const OverlapTimelineMatrix: React.FC<OverlapTimelineMatrixProps> = ({
  locations,
  refLocationId,
  baseInput,
  onSelectHour,
}) => {
  const hours24 = Array.from({ length: 24 }, (_, i) => i);
  const current24 = to24Hour(baseInput.hour12, baseInput.minute, baseInput.ampm).hour24;

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Team Overlap & 24h Timeline Matrix (12-Hour System)
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" />
            <span>Active (9am-6pm)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/60" />
            <span>Flex / Evening</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-950 border border-white/10" />
            <span>Sleeping</span>
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Click any hour below to immediately warp all timezones to that moment. The glowing cyan vertical bar indicates your selected time.
      </p>

      {/* Overlap Matrix Container with horizontal scroll */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
        <div className="min-w-[780px] space-y-2">
          {/* Header row with hour markers */}
          <div className="grid grid-cols-[180px_repeat(24,1fr)] gap-1 text-[10px] font-mono font-semibold text-slate-400 pb-1 border-b border-white/10">
            <div className="px-2">Location</div>
            {hours24.map((h) => {
              const { hour12, ampm } = to12Hour(h, 0);
              const isSelectedHour = h === current24;
              return (
                <div
                  key={h}
                  onClick={() => onSelectHour(hour12, ampm)}
                  className={`text-center py-1 rounded cursor-pointer transition-all ${
                    isSelectedHour
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                      : 'hover:bg-white/10 hover:text-white'
                  }`}
                  title={`Click to set base time to ${hour12} ${ampm}`}
                >
                  {hour12}
                  <span className="text-[8px] block -mt-0.5">{ampm}</span>
                </div>
              );
            })}
          </div>

          {/* Location Rows */}
          {locations.map((loc) => {
            const isRef = loc.id === refLocationId;

            return (
              <div
                key={loc.id}
                className={`grid grid-cols-[180px_repeat(24,1fr)] gap-1 items-center py-1.5 rounded-xl transition-all ${
                  isRef ? 'bg-indigo-950/40 border border-indigo-500/30' : 'hover:bg-white/5'
                }`}
              >
                {/* Location Title Cell */}
                <div className="px-2.5 flex items-center gap-2 truncate">
                  <span className="text-base">{loc.flag}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                      <span>{loc.city}</span>
                      {isRef && <span className="text-[9px] text-cyan-400 font-normal">(Base)</span>}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{loc.tzCode}</div>
                  </div>
                </div>

                {/* 24 Hour Blocks */}
                {hours24.map((baseH) => {
                  const { hour12: baseH12, ampm: baseAmpm } = to12Hour(baseH, 0);
                  const calculated = calculateAllZoneTimes(
                    locations,
                    refLocationId,
                    { hour12: baseH12, minute: 0, ampm: baseAmpm, date: baseInput.date }
                  );
                  const locCalc = calculated.find((c) => c.location.id === loc.id);

                  if (!locCalc) return <div key={baseH} className="h-9" />;

                  const isSelected = baseH === current24;
                  let bgStyle = 'bg-slate-950/80 text-slate-400';
                  if (locCalc.workStatus === 'active') {
                    bgStyle = 'bg-emerald-600/70 text-emerald-100 font-semibold';
                  } else if (locCalc.workStatus === 'flexible') {
                    bgStyle = 'bg-amber-600/40 text-amber-200';
                  }

                  return (
                    <button
                      key={baseH}
                      type="button"
                      onClick={() => onSelectHour(baseH12, baseAmpm)}
                      className={`h-9 rounded-md flex flex-col items-center justify-center transition-all cursor-pointer relative text-[10px] font-mono ${bgStyle} ${
                        isSelected
                          ? 'ring-2 ring-cyan-400 shadow-md shadow-cyan-400/30 scale-105 z-10'
                          : 'hover:opacity-80'
                      }`}
                      title={`${loc.name}: ${locCalc.formattedTime} · ${locCalc.dateString} ${locCalc.dayShift !== 'today' ? locCalc.dayShiftLabel : ''}`}
                    >
                      <span className="leading-tight font-bold">{locCalc.hour12}</span>
                      <span className="text-[8px] leading-tight opacity-75">{locCalc.ampm}</span>
                      {locCalc.dayShift === 'yesterday' && (
                        <span className="absolute -top-1 -right-0.5 text-[7px] bg-rose-500 text-white rounded-full px-0.5">
                          -1d
                        </span>
                      )}
                      {locCalc.dayShift === 'tomorrow' && (
                        <span className="absolute -top-1 -right-0.5 text-[7px] bg-cyan-500 text-slate-950 rounded-full px-0.5 font-bold">
                          +1d
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Golden Overlap Recommendation Box */}
      <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/70 border border-indigo-500/30 flex items-start sm:items-center gap-3">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
        <div className="text-xs text-slate-300">
          <strong className="text-white font-semibold">Recommended Global Overlap Window: </strong>
          <span>
            <strong className="text-cyan-300">6:30 PM – 9:30 PM</strong> in Bangalore (IST) corresponds to{' '}
            <strong className="text-emerald-300">8:00 AM – 11:00 AM</strong> in Chicago (CT),{' '}
            <strong className="text-emerald-300">7:00 AM – 10:00 AM</strong> in Lehi (MT), and{' '}
            <strong className="text-amber-300">9:00 PM – 12:00 AM</strong> in Philippines (PHT). This is the ideal window for cross-continental sync meetings!
          </span>
        </div>
      </div>
    </div>
  );
};
