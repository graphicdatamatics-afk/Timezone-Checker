import React, { useState } from 'react';
import { TimezoneLocation } from '../types/timezone';
import { OPTIONAL_GLOBAL_LOCATIONS } from '../data/timezones';
import { X, Search, Plus, RotateCcw, Check } from 'lucide-react';

interface AddCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLocations: TimezoneLocation[];
  onAddLocation: (loc: TimezoneLocation) => void;
  onResetToCore: () => void;
}

export const AddCityModal: React.FC<AddCityModalProps> = ({
  isOpen,
  onClose,
  activeLocations,
  onAddLocation,
  onResetToCore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const activeIds = new Set(activeLocations.map((l) => l.id));

  const filteredOptions = OPTIONAL_GLOBAL_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.tzCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">Manage & Add Timezones</h3>
            <p className="text-xs text-slate-400">
              The 4 Core team zones remain prioritized at all times.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, country, or code (e.g. Tokyo, London, ET)..."
            className="w-full bg-slate-950 border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
        </div>

        {/* City Options List */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {filteredOptions.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No matching timezones found.
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isAdded = activeIds.has(opt.id);

              return (
                <div
                  key={opt.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isAdded
                      ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/15 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{opt.flag}</span>
                    <div>
                      <div className="text-xs font-bold">{opt.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {opt.timeZone} · {opt.tzCode}
                      </div>
                    </div>
                  </div>

                  {isAdded ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onAddLocation(opt)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Reset / Done Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => {
              onResetToCore();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to 4 Core Priority Only</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
