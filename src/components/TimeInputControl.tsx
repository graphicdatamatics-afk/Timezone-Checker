import React from 'react';
import { BaseTimeInput, TimezoneLocation } from '../types/timezone';
import { MapPin, Clock, Calendar, Coffee, Sunset, Moon, Sun, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { to24Hour, to12Hour, format12h } from '../utils/timeCalculations';

interface TimeInputControlProps {
  locations: TimezoneLocation[];
  refLocationId: string;
  onSelectRefLocation: (id: string) => void;
  baseInput: BaseTimeInput;
  onChangeBaseInput: (input: BaseTimeInput) => void;
  isLive: boolean;
  onSetPreset: (hour12: number, minute: number, ampm: 'AM' | 'PM') => void;
  onSyncCurrentTime: () => void;
}

export const TimeInputControl: React.FC<TimeInputControlProps> = ({
  locations,
  refLocationId,
  onSelectRefLocation,
  baseInput,
  onChangeBaseInput,
  isLive,
  onSetPreset,
  onSyncCurrentTime,
}) => {
  const currentRefLocation = locations.find((l) => l.id === refLocationId) || locations[0];

  // Convert current 12h to slider minute of the day (0 to 1439)
  const { hour24 } = to24Hour(baseInput.hour12, baseInput.minute, baseInput.ampm);
  const sliderMinutes = hour24 * 60 + baseInput.minute;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalMins = parseInt(e.target.value, 10);
    const h24 = Math.floor(totalMins / 60);
    const min = totalMins % 60;
    const { hour12, ampm } = to12Hour(h24, min);
    onChangeBaseInput({ ...baseInput, hour12, minute: min, ampm });
  };

  const handleHourSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hour12 = parseInt(e.target.value, 10);
    onChangeBaseInput({ ...baseInput, hour12 });
  };

  const handleMinuteSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const minute = parseInt(e.target.value, 10);
    onChangeBaseInput({ ...baseInput, minute });
  };

  const handleAmpmToggle = (ampm: 'AM' | 'PM') => {
    onChangeBaseInput({ ...baseInput, ampm });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeBaseInput({ ...baseInput, date: e.target.value });
  };

  const handleDayShift = (days: number) => {
    const parts = baseInput.date.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChangeBaseInput({ ...baseInput, date: `${y}-${m}-${day}` });
  };

  // Formatted date string for readable display
  const displayDate = (() => {
    try {
      const [y, m, d] = baseInput.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return baseInput.date;
    }
  })();

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Top Controls Grid: Location + Date + 12-Hour Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-start">
        {/* Col 1: Base Location Selection */}
        <div className="lg:col-span-4 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Base Location (Where you live)</span>
          </label>
          <div className="relative">
            <select
              value={refLocationId}
              onChange={(e) => onSelectRefLocation(e.target.value)}
              className="w-full bg-slate-950/90 border border-white/15 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer appearance-none"
            >
              <optgroup label="Priority Core Team">
                {locations
                  .filter((l) => l.isCore)
                  .map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.flag} {loc.name} ({loc.tzCode})
                    </option>
                  ))}
              </optgroup>
              {locations.some((l) => !l.isCore) && (
                <optgroup label="Additional Global Hubs">
                  {locations
                    .filter((l) => !l.isCore)
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.flag} {loc.name} ({loc.tzCode})
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Selected base: <span className="text-cyan-300 font-medium">{currentRefLocation.city}</span> ({currentRefLocation.country})
          </p>
        </div>

        {/* Col 2: Calendar Date Selection */}
        <div className="lg:col-span-3 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Base Date</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleDayShift(-1)}
              className="p-3 bg-slate-950/90 hover:bg-slate-800 border border-white/15 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={baseInput.date}
              onChange={handleDateChange}
              className="flex-1 bg-slate-950/90 border border-white/15 rounded-xl px-3 py-2.5 text-xs font-mono font-medium text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all cursor-pointer"
            />
            <button
              type="button"
              onClick={() => handleDayShift(1)}
              className="p-3 bg-slate-950/90 hover:bg-slate-800 border border-white/15 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-medium text-amber-300">{displayDate}</span>
            <button
              type="button"
              onClick={() => onChangeBaseInput({ ...baseInput, date: '2026-11-03' })}
              className="hover:underline text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              3 Nov 2026
            </button>
          </div>
        </div>

        {/* Col 3: 12-Hour Time Input */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Base Time (12-Hour System)</span>
            </label>
            {isLive && (
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Syncing
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Hour Dropdown */}
            <div className="flex-1 min-w-[70px]">
              <div className="relative">
                <select
                  value={baseInput.hour12}
                  onChange={handleHourSelect}
                  className="w-full bg-slate-950/90 border border-white/15 rounded-xl px-3 py-2.5 text-center text-lg font-mono font-bold text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all cursor-pointer appearance-none"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-slate-500">
                  HR
                </span>
              </div>
            </div>

            <span className="text-lg font-bold font-mono text-slate-400">:</span>

            {/* Minute Dropdown */}
            <div className="flex-1 min-w-[70px]">
              <div className="relative">
                <select
                  value={baseInput.minute}
                  onChange={handleMinuteSelect}
                  className="w-full bg-slate-950/90 border border-white/15 rounded-xl px-3 py-2.5 text-center text-lg font-mono font-bold text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all cursor-pointer appearance-none"
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-slate-500">
                  MIN
                </span>
              </div>
            </div>

            {/* AM / PM Toggle */}
            <div className="flex bg-slate-950 border border-white/15 rounded-xl p-1 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleAmpmToggle('AM')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  baseInput.ampm === 'AM'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => handleAmpmToggle('PM')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  baseInput.ampm === 'PM'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Presets for Instant 1-Click Jumping */}
      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Quick Jump:
          </span>
          <button
            onClick={() => onSetPreset(9, 30, 'AM')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <Coffee className="w-3 h-3 text-amber-400" />
            <span>9:30 AM Kickoff</span>
          </button>
          <button
            onClick={() => onSetPreset(1, 0, 'PM')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <Sun className="w-3 h-3 text-amber-300" />
            <span>1:00 PM Sync</span>
          </button>
          <button
            onClick={() => onSetPreset(6, 30, 'PM')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
          >
            <Sunset className="w-3 h-3 text-cyan-400" />
            <span>6:30 PM (US Morning Overlap)</span>
          </button>
          <button
            onClick={() => onSetPreset(9, 30, 'PM')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <Moon className="w-3 h-3 text-indigo-400" />
            <span>9:30 PM Wrap-up</span>
          </button>
        </div>

        <button
          onClick={onSyncCurrentTime}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
        >
          <Flame className="w-3 h-3 text-emerald-400" />
          <span>Current Live Moment</span>
        </button>
      </div>

      {/* 24-Hour Slider with 12h Indicator */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">
            Interactive Day Flow Scrubber:
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-300 font-mono">{displayDate}</span>
            <span className="text-sm font-mono font-bold text-cyan-400 bg-slate-950 px-2.5 py-0.5 rounded border border-white/10">
              {format12h(baseInput.hour12, baseInput.minute, baseInput.ampm)}
            </span>
          </div>
        </div>
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={1439}
            step={15}
            value={sliderMinutes}
            onChange={handleSliderChange}
            className="w-full h-2.5 bg-gradient-to-r from-slate-950 via-indigo-900 to-amber-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
          <span>12:00 AM (Midnight)</span>
          <span>06:00 AM (Dawn)</span>
          <span>12:00 PM (Noon)</span>
          <span>06:00 PM (Dusk)</span>
          <span>11:45 PM (Night)</span>
        </div>
      </div>
    </div>
  );
};
