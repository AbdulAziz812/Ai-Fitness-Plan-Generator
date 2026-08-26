import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export const DAYS_OPTIONS = [
  { value: '2 Days', label: '2 Days / week', sub: 'Busy Schedule & Full Body' },
  { value: '3 Days', label: '3 Days / week', sub: 'Optimal Push / Pull / Legs' },
  { value: '4 Days', label: '4 Days / week', sub: 'Upper / Lower Split' },
  { value: '5 Days', label: '5 Days / week', sub: 'Body Part Split / High Frequency' },
  { value: '6 Days', label: '6 Days / week', sub: 'Advanced PPL Cycle' },
  { value: '7 Days', label: '7 Days / week', sub: 'Daily Routine & Active Recovery' },
];

export const DURATION_OPTIONS = [
  { value: '20–30 Minutes', label: '20–30 Minutes', desc: 'Express & HIIT Focus' },
  { value: '30–45 Minutes', label: '30–45 Minutes', desc: 'Balanced & Efficient' },
  { value: '45–60 Minutes', label: '45–60 Minutes', desc: 'Standard Gym Session' },
  { value: '60+ Minutes', label: '60+ Minutes', desc: 'Comprehensive & High Volume' },
];

interface ScheduleSelectorProps {
  selectedSchedule: string;
  onSelectSchedule: (schedule: string) => void;
  selectedDuration: string;
  onSelectDuration: (duration: string) => void;
}

export const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  selectedSchedule,
  onSelectSchedule,
  selectedDuration,
  onSelectDuration,
}) => {
  return (
    <div className="space-y-6">
      {/* Days per week */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-100 mb-2.5">
          <Calendar className="w-4 h-4 text-[#22C55E]" />
          How many days can you train per week?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {DAYS_OPTIONS.map((item) => {
            const isSelected = selectedSchedule === item.value;
            return (
              <button
                type="button"
                key={item.value}
                id={`schedule-option-${item.value.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => onSelectSchedule(item.value)}
                className={`p-3.5 rounded-2xl border text-left transition-all backdrop-blur-xl cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.09] border-[#22C55E] ring-2 ring-[#22C55E]/30 text-slate-100 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/[0.06]'
                }`}
              >
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Session duration */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-100 mb-2.5">
          <Clock className="w-4 h-4 text-[#06B6D4]" />
          How long can you train per session?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DURATION_OPTIONS.map((dur) => {
            const isSelected = selectedDuration === dur.value;
            return (
              <button
                type="button"
                key={dur.value}
                id={`duration-option-${dur.value.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                onClick={() => onSelectDuration(dur.value)}
                className={`p-3.5 rounded-2xl border text-left transition-all backdrop-blur-xl cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.09] border-[#06B6D4] ring-2 ring-[#06B6D4]/30 text-slate-100 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/[0.06]'
                }`}
              >
                <div className="font-semibold text-sm">{dur.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{dur.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
