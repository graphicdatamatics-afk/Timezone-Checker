import React, { useState } from 'react';
import { CalculatedZoneTime } from '../types/timezone';
import { X, Copy, Check, Calendar } from 'lucide-react';

interface MeetingCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatedTimes: CalculatedZoneTime[];
  refLocationCity: string;
}

export const MeetingCopyModal: React.FC<MeetingCopyModalProps> = ({
  isOpen,
  onClose,
  calculatedTimes,
  refLocationCity,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Format meeting block for easy paste into Slack / Email with both Time and Date!
  const textLines = [
    `🗓️ Proposed Global Team Sync:`,
    ...calculatedTimes.map((item) => {
      const shift = item.dayShift === 'yesterday' ? ' (Yesterday)' : item.dayShift === 'tomorrow' ? ' (Tomorrow)' : ' (Same day)';
      return `${item.location.flag} ${item.location.name}: ${item.formattedTime} · ${item.dateString}${shift}`;
    }),
    ``,
    `Base Reference: ${refLocationCity}`,
  ];

  const fullText = textLines.join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Copy Formatted Meeting Schedule</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Formatted with exact dates and 12-hour times for each location:
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-white/10 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
          {fullText}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
