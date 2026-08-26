import React from 'react';
import {
  Utensils,
  Salad,
  Fish,
  Beef,
  Flame,
  Leaf,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export interface FoodOption {
  id: string;
  label: string;
  desc: string;
  tag: string;
  icon: any;
}

export const FOOD_PREFERENCE_OPTIONS: FoodOption[] = [
  {
    id: 'High Protein / Non-Veg',
    label: 'High Protein / Non-Veg',
    desc: 'Chicken, turkey, lean beef, fish, eggs, dairy, and whole foods',
    tag: 'Max Hypertrophy',
    icon: Beef,
  },
  {
    id: 'Vegetarian',
    label: 'Vegetarian',
    desc: 'Plant-based dishes, dairy, eggs, tofu, paneer, and rich legumes',
    tag: 'Plant + Dairy/Eggs',
    icon: Salad,
  },
  {
    id: 'Vegan',
    label: 'Vegan',
    desc: '100% plant-based: lentils, soy, tofu, tempeh, seeds, and grains',
    tag: '100% Plant Based',
    icon: Leaf,
  },
  {
    id: 'Pescatarian',
    label: 'Pescatarian',
    desc: 'Vegetarian foundation plus fish and seafood rich in Omega-3s',
    tag: 'Seafood + Plants',
    icon: Fish,
  },
  {
    id: 'Keto / Low Carb',
    label: 'Keto / Low Carb',
    desc: 'Higher healthy fats, moderate protein, and minimal simple carbohydrates',
    tag: 'Metabolic Shift',
    icon: Flame,
  },
  {
    id: 'Mediterranean',
    label: 'Mediterranean',
    desc: 'Olive oil, wild fish, wholesome grains, seasonal greens, and nuts',
    tag: 'Heart & Longevity',
    icon: Utensils,
  },
  {
    id: 'Halal',
    label: 'Halal',
    desc: 'Wholesome, 100% Halal-certified proteins, whole grains, and veggies',
    tag: 'Halal Compliant',
    icon: ShieldCheck,
  },
  {
    id: 'No Restrictions / Balanced',
    label: 'No Restrictions / Balanced',
    desc: 'Flexible macro distribution across all wholesome food groups',
    tag: 'Flexible Diet',
    icon: Sparkles,
  },
];

interface FoodPreferenceSelectorProps {
  selectedPreference: string;
  onSelectPreference: (preference: string) => void;
}

export const FoodPreferenceSelector: React.FC<FoodPreferenceSelectorProps> = ({
  selectedPreference,
  onSelectPreference,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {FOOD_PREFERENCE_OPTIONS.map((item) => {
        const Icon = item.icon;
        const isSelected = selectedPreference === item.id;

        return (
          <div
            key={item.id}
            id={`food-option-${item.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            onClick={() => onSelectPreference(item.id)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between select-none backdrop-blur-xl ${
              isSelected
                ? 'bg-white/[0.09] border-[#22C55E] ring-2 ring-[#22C55E]/30 shadow-[0_0_25px_rgba(34,197,94,0.15)]'
                : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06] shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md ${
                    isSelected
                      ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                      : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
                    isSelected
                      ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  {item.tag}
                </span>
              </div>

              <h4
                className={`font-semibold text-sm mb-1 ${
                  isSelected ? 'text-slate-100' : 'text-slate-200'
                }`}
              >
                {item.label}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
