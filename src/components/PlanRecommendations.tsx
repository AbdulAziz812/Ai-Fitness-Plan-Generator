import React from 'react';
import { PlanRecommendations as PlanRecsType } from '../types';
import { Flame, Wind, Moon, TrendingUp, Utensils, Droplets } from 'lucide-react';

interface PlanRecommendationsProps {
  recommendations: PlanRecsType;
}

export const PlanRecommendations: React.FC<PlanRecommendationsProps> = ({ recommendations }) => {
  if (!recommendations) return null;

  const items = [
    {
      title: 'Warm-Up Protocol',
      content: recommendations.warmup,
      icon: Flame,
      color: 'text-[#F59E0B]',
      border: 'border-[#F59E0B]/20',
      bg: 'bg-[#F59E0B]/5',
    },
    {
      title: 'Cool-Down & Flexibility',
      content: recommendations.cooldown,
      icon: Wind,
      color: 'text-[#06B6D4]',
      border: 'border-[#06B6D4]/20',
      bg: 'bg-[#06B6D4]/5',
    },
    {
      title: 'Weekly Progression Strategy',
      content: recommendations.progression,
      icon: TrendingUp,
      color: 'text-[#22C55E]',
      border: 'border-[#22C55E]/20',
      bg: 'bg-[#22C55E]/5',
    },
    {
      title: 'Recovery & Sleep Protocol',
      content: recommendations.recovery,
      icon: Moon,
      color: 'text-[#8B5CF6]',
      border: 'border-[#8B5CF6]/20',
      bg: 'bg-[#8B5CF6]/5',
    },
    {
      title: 'General Nutrition Guidance',
      content: recommendations.nutrition,
      icon: Utensils,
      color: 'text-[#10B981]',
      border: 'border-[#10B981]/20',
      bg: 'bg-[#10B981]/5',
    },
    ...(recommendations.hydration
      ? [
          {
            title: 'Hydration & Electrolytes',
            content: recommendations.hydration,
            icon: Droplets,
            color: 'text-[#38BDF8]',
            border: 'border-[#38BDF8]/20',
            bg: 'bg-[#38BDF8]/5',
          },
        ]
      : []),
  ];

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#22C55E] backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.15)]">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-slate-100">
            Plan Recommendations & Strategy
          </h3>
          <p className="text-xs text-slate-400">
            AI-engineered protocols for recovery, progression, and nutritional optimization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          if (!item.content) return null;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${item.border} ${item.bg} backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all`}
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <h4 className="font-semibold text-sm text-slate-100">{item.title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
