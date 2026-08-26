import React from 'react';
import { Check, Shield, Layers, Package, Building2, HelpCircle } from 'lucide-react';

export interface EquipmentOption {
  id: string;
  label: string;
  desc: string;
  icon: any;
}

export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  {
    id: 'No Equipment',
    label: 'No Equipment',
    desc: 'Pure bodyweight calisthenics, isometric holds, core & plyometrics',
    icon: Shield,
  },
  {
    id: 'Dumbbells',
    label: 'Dumbbells',
    desc: 'Adjustable or fixed dumbbells for versatile progressive load',
    icon: Layers,
  },
  {
    id: 'Resistance Bands',
    label: 'Resistance Bands',
    desc: 'Loop bands, tube bands with handles, and mini mobility bands',
    icon: Layers,
  },
  {
    id: 'Home Gym',
    label: 'Home Gym',
    desc: 'Adjustable bench, pull-up bar, free weights, or power tower',
    icon: Package,
  },
  {
    id: 'Full Gym',
    label: 'Full Gym',
    desc: 'Commercial facility with barbell racks, cable stacks, machines',
    icon: Building2,
  },
  {
    id: 'Other',
    label: 'Other Equipment',
    desc: 'Kettlebells, TRX suspension, sandbags, or medicine balls',
    icon: HelpCircle,
  },
];

interface EquipmentSelectorProps {
  selectedEquipment: string[];
  onChangeEquipment: (equipment: string[]) => void;
}

export const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({
  selectedEquipment,
  onChangeEquipment,
}) => {
  const toggleEquipment = (id: string) => {
    if (id === 'No Equipment') {
      // If user chooses "No Equipment", clear others or toggle it
      if (selectedEquipment.includes('No Equipment')) {
        onChangeEquipment([]);
      } else {
        onChangeEquipment(['No Equipment']);
      }
      return;
    }

    // If selecting any equipment, remove "No Equipment"
    const filtered = selectedEquipment.filter((item) => item !== 'No Equipment');
    if (filtered.includes(id)) {
      onChangeEquipment(filtered.filter((item) => item !== id));
    } else {
      onChangeEquipment([...filtered, id]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-slate-100">
          What equipment do you have available?
        </label>
        <span className="text-xs text-slate-400">Select one or multiple</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {EQUIPMENT_OPTIONS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedEquipment.includes(item.id);

          return (
            <div
              key={item.id}
              id={`equipment-option-${item.id.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => toggleEquipment(item.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 select-none flex items-start gap-3.5 backdrop-blur-xl ${
                isSelected
                  ? 'bg-white/[0.09] border-[#22C55E] ring-2 ring-[#22C55E]/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-lg border mt-0.5 shrink-0 flex items-center justify-center transition-colors backdrop-blur-md ${
                  isSelected ? 'bg-[#22C55E] border-[#22C55E] text-slate-950 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'border-slate-600 bg-white/5'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold text-sm ${
                      isSelected ? 'text-slate-100' : 'text-slate-200'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
