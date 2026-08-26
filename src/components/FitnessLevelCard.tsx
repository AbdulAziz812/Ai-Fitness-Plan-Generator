import React from 'react';
import { Award, Zap, Trophy } from 'lucide-react';

export interface LevelOption {
  id: string;
  label: string;
  sub: string;
  desc: string;
  icon: any;
  intensity: number;
}

export const LEVEL_OPTIONS: LevelOption[] = [
  {
    id: 'Beginner',
    label: 'Beginner',
    sub: '0 – 12 months training',
    desc: 'Focus on mastering fundamental movement mechanics, safety, and establishing consistency.',
    icon: Award,
    intensity: 1,
  },
  {
    id: 'Intermediate',
    label: 'Intermediate',
    sub: '1 – 3 years consistent training',
    desc: 'Solid baseline strength, ready for progressive volume, compound variations, and structured splits.',
    icon: Zap,
    intensity: 2,
  },
  {
    id: 'Advanced',
    label: 'Advanced',
    sub: '3+ years structured training',
    desc: 'High neuromuscular efficiency, complex loading schemes, higher intensity thresholds.',
    icon: Trophy,
    intensity: 3,
  },
];

interface FitnessLevelSelectorProps {
  selectedLevel: string;
  onSelectLevel: (level: string) => void;
}

export const FitnessLevelSelector: React.FC<FitnessLevelSelectorProps> = ({
  selectedLevel,
  onSelectLevel,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {LEVEL_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedLevel === option.id;

        return (
          <div
            key={option.id}
            id={`level-option-${option.id.toLowerCase()}`}
            onClick={() => onSelectLevel(option.id)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between select-none backdrop-blur-xl ${
              isSelected
                ? 'bg-white/[0.09] border-[#22C55E] ring-2 ring-[#22C55E]/30 shadow-[0_0_25px_rgba(34,197,94,0.15)]'
                : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06] shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md ${
                    isSelected
                      ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                      : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Intensity bars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((lvl) => (
                    <div
                      key={lvl}
                      className={`w-1.5 h-3 rounded-full ${
                        lvl <= option.intensity
                          ? isSelected
                            ? 'bg-[#22C55E]'
                            : 'bg-slate-400'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <h4
                  className={`font-semibold text-base ${
                    isSelected ? 'text-slate-100' : 'text-slate-200'
                  }`}
                >
                  {option.label}
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">{option.sub}</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mt-1">{option.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
