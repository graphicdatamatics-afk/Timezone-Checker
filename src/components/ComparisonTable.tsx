import React from 'react';
import { CalculatedZoneTime } from '../types/timezone';
import { Table, CheckCircle2, Moon, Sun, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';

interface ComparisonTableProps {
  calculatedTimes: CalculatedZoneTime[];
  refLocationCity: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  calculatedTimes,
  refLocationCity,
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Timezone Offset, Date & Alignment Breakdown
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          Relative to base: <strong className="text-cyan-400">{refLocationCity}</strong>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Time Zone</th>
              <th className="py-3 px-4">Local Date</th>
              <th className="py-3 px-4">Local Time (12h)</th>
              <th className="py-3 px-4">Relative Difference</th>
              <th className="py-3 px-4">Day Shift</th>
              <th className="py-3 px-4">Availability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {calculatedTimes.map((item) => {
              const isBase = item.isReference;

              let statusColor = 'text-slate-400';
              let StatusIcon = Moon;

              if (item.workStatus === 'active') {
                statusColor = 'text-emerald-400';
                StatusIcon = CheckCircle2;
              } else if (item.workStatus === 'flexible') {
                statusColor = 'text-amber-400';
                StatusIcon = Sun;
              }

              return (
                <tr
                  key={item.location.id}
                  className={`transition-colors ${
                    isBase ? 'bg-indigo-950/40 font-medium' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Location Column */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{item.location.flag}</span>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>{item.location.name}</span>
                          {isBase && (
                            <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-semibold">
                              Base
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{item.location.city}, {item.location.country}</div>
                      </div>
                    </div>
                  </td>

                  {/* Time Zone Code */}
                  <td className="py-3.5 px-4 font-mono">
                    <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-300 border border-white/10 text-[11px]">
                      {item.location.tzCode}
                    </span>
                  </td>

                  {/* Local Date */}
                  <td className="py-3.5 px-4 font-medium text-xs">
                    <span className={`inline-flex items-center gap-1 ${
                      item.dayShift === 'yesterday'
                        ? 'text-rose-300 font-semibold'
                        : item.dayShift === 'tomorrow'
                        ? 'text-cyan-300 font-semibold'
                        : 'text-amber-200'
                    }`}>
                      <Calendar className="w-3.5 h-3.5 opacity-70" />
                      {item.dateString}
                    </span>
                  </td>

                  {/* 12h Local Time */}
                  <td className="py-3.5 px-4 font-mono font-bold text-sm text-white">
                    {item.formattedTime}
                  </td>

                  {/* Relative Difference */}
                  <td className="py-3.5 px-4">
                    {isBase ? (
                      <span className="text-indigo-400 font-semibold">★ Base Reference</span>
                    ) : item.diffMinutes > 0 ? (
                      <span className="text-cyan-400 font-medium flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>{item.diffFormatted}</span>
                      </span>
                    ) : item.diffMinutes < 0 ? (
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>{item.diffFormatted}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">{item.diffFormatted}</span>
                    )}
                  </td>

                  {/* Day Shift */}
                  <td className="py-3.5 px-4">
                    {item.dayShift === 'today' ? (
                      <span className="text-slate-300">Same Calendar Day</span>
                    ) : item.dayShift === 'yesterday' ? (
                      <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        1 Day Behind (Yesterday)
                      </span>
                    ) : (
                      <span className="text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        1 Day Ahead (Tomorrow)
                      </span>
                    )}
                  </td>

                  {/* Availability */}
                  <td className="py-3.5 px-4">
                    <div className={`flex items-center gap-1.5 font-medium ${statusColor}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{item.statusLabel}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
