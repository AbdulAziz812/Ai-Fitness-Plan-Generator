import React from 'react';
import { Flame, Dumbbell, TrendingUp, ShieldAlert, HeartPulse, Sparkles, Activity } from 'lucide-react';

export interface GoalOption {
  id: string;
  label: string;
  desc: string;
  icon: any;
}

export const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'Lose Weight',
    label: 'Lose Weight',
    desc: 'Fat loss, caloric burn, and high metabolic conditioning',
    icon: Flame,
  },
  {
    id: 'Build Muscle',
    label: 'Build Muscle',
    desc: 'Hypertrophy-focused resistance training and muscular growth',
    icon: Dumbbell,
  },
  {
    id: 'Gain Weight',
    label: 'Gain Weight',
    desc: 'Lean mass building with calorie density and compound lifts',
    icon: TrendingUp,
  },
  {
    id: 'Improve Strength',
    label: 'Improve Strength',
    desc: 'Maximal neuromuscular power, heavy compound movement progression',
    icon: ShieldAlert,
  },
  {
    id: 'Improve Endurance',
    label: 'Improve Endurance',
    desc: 'Cardiovascular capacity, muscular stamina, and aerobic threshold',
    icon: HeartPulse,
  },
  {
    id: 'General Fitness',
    label: 'General Fitness',
    desc: 'Balanced strength, mobility, joint longevity, and overall wellness',
    icon: Sparkles,
  },
  {
    id: 'Maintain Fitness',
    label: 'Maintain Fitness',
    desc: 'Sustain current body composition, functional fitness, and tone',
    icon: Activity,
  },
];

interface FitnessGoalSelectorProps {
  selectedGoal: string;
  onSelectGoal: (goal: string) => void;
}

export const FitnessGoalSelector: React.FC<FitnessGoalSelectorProps> = ({
  selectedGoal,
  onSelectGoal,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {GOAL_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedGoal === option.id;

        return (
          <div
            key={option.id}
            id={`goal-option-${option.id.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => onSelectGoal(option.id)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between select-none backdrop-blur-xl ${
              isSelected
                ? 'bg-white/[0.09] border-[#22C55E] ring-2 ring-[#22C55E]/30 shadow-[0_0_25px_rgba(34,197,94,0.15)]'
                : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06] shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md ${
                  isSelected
                    ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-[#22C55E] bg-[#22C55E]' : 'border-slate-600 bg-white/5'
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </div>
            </div>

            <div>
              <h4
                className={`font-semibold text-sm mb-1 ${
                  isSelected ? 'text-slate-100' : 'text-slate-200'
                }`}
              >
                {option.label}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">{option.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
