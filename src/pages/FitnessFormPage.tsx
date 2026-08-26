import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { FitnessPlan } from '../types';
import { api } from '../services/api';
import { FitnessGoalSelector } from '../components/FitnessGoalCard';
import { FitnessLevelSelector } from '../components/FitnessLevelCard';
import { ScheduleSelector } from '../components/ScheduleSelector';
import { EquipmentSelector } from '../components/EquipmentSelector';
import { FoodPreferenceSelector } from '../components/FoodPreferenceSelector';
import { LoadingScreen } from '../components/LoadingScreen';
import {
  Sparkles,
  ArrowRight,
  User,
  AlertCircle,
  ChevronLeft,
  Calendar,
  Ruler,
  Scale,
  Utensils,
  Target,
  Award,
  Dumbbell,
} from 'lucide-react';

interface FitnessFormPageProps {
  isEditing?: boolean;
  onPlanGenerated: (plan: FitnessPlan) => void;
  onCancel?: () => void;
}

export const FitnessFormPage: React.FC<FitnessFormPageProps> = ({
  isEditing = false,
  onPlanGenerated,
  onCancel,
}) => {
  const { user } = useAuth();

  // User input states: Age, Height, Weight, Fitness Goal, Experience Level, Workout Days, Equipment, Food Preference
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  
  // Height & Weight states with numeric validation & unit support
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [heightCm, setHeightCm] = useState<string>('');
  const [heightFeet, setHeightFeet] = useState<string>('');
  const [heightInches, setHeightInches] = useState<string>('');

  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [weightValue, setWeightValue] = useState<string>('');

  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [schedule, setSchedule] = useState('3 Days');
  const [workoutDuration, setWorkoutDuration] = useState('30–45 Minutes');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [foodPreference, setFoodPreference] = useState<string>('High Protein / Non-Veg');

  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadSavedProfile();
  }, [user]);

  const loadSavedProfile = async () => {
    try {
      setInitialLoading(true);
      const res = await api.getFitnessProfile();
      if (res.profile) {
        setName(res.profile.name || user?.name || '');
        setAge(res.profile.age !== undefined && res.profile.age !== null ? String(res.profile.age) : '');
        
        // Parse height
        if (res.profile.height) {
          const rawH = res.profile.height.trim();
          if (rawH.includes("'") || rawH.toLowerCase().includes('ft')) {
            const match = rawH.match(/(\d+)\s*(?:'|ft)?\s*(\d*)/i);
            if (match) {
              setHeightUnit('ft');
              setHeightFeet(match[1] || '');
              setHeightInches(match[2] || '');
            }
          } else {
            const numMatch = rawH.match(/(\d+(?:\.\d+)?)/);
            if (numMatch) {
              setHeightUnit('cm');
              setHeightCm(numMatch[1]);
            }
          }
        }

        // Parse weight
        if (res.profile.weight) {
          const rawW = res.profile.weight.trim();
          const isLbs = rawW.toLowerCase().includes('lb');
          const numMatch = rawW.match(/(\d+(?:\.\d+)?)/);
          if (numMatch) {
            setWeightUnit(isLbs ? 'lbs' : 'kg');
            setWeightValue(numMatch[1]);
          }
        }

        setGoal(res.profile.goal || '');
        setLevel(res.profile.level || '');
        setSchedule(res.profile.schedule || '3 Days');
        setWorkoutDuration(res.profile.workout_duration || '30–45 Minutes');
        setEquipment(res.profile.equipment || []);
        setFoodPreference(res.profile.food_preference || 'High Protein / Non-Veg');
      } else if (user) {
        setName(user.name || '');
      }
    } catch (err) {
      console.warn('Could not load saved profile:', err);
      if (user) setName(user.name || '');
    } finally {
      setInitialLoading(false);
    }
  };

  // Real-time numeric sanitizers
  const handleHeightCmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
    setHeightCm(numeric);
    if (validationError) setValidationError(null);
  };

  const handleHeightFeetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
    setHeightFeet(numeric);
    if (validationError) setValidationError(null);
  };

  const handleHeightInchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
    if (numeric === '' || (Number(numeric) >= 0 && Number(numeric) <= 11)) {
      setHeightInches(numeric);
    }
    if (validationError) setValidationError(null);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let numeric = e.target.value.replace(/[^0-9.]/g, '');
    const parts = numeric.split('.');
    if (parts.length > 2) {
      numeric = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    if (numeric.length <= 5) {
      setWeightValue(numeric);
    }
    if (validationError) setValidationError(null);
  };

  // Block non-numeric keystrokes
  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', ','].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);

    // Validation checks for required inputs
    if (!name.trim()) {
      setValidationError('Please enter your name.');
      return;
    }
    const numAge = Number(age);
    if (!age || isNaN(numAge) || numAge < 12 || numAge > 100) {
      setValidationError('Please enter a valid age between 12 and 100 years.');
      return;
    }

    // Strict Height Validation
    let formattedHeight = '';
    if (heightUnit === 'cm') {
      const numCm = Number(heightCm);
      if (!heightCm.trim() || isNaN(numCm)) {
        setValidationError('Please enter your height in centimeters.');
        return;
      }
      if (numCm < 50 || numCm > 260) {
        setValidationError('Please enter a realistic height between 50 cm and 260 cm (e.g. 175 cm).');
        return;
      }
      formattedHeight = `${Math.round(numCm)} cm`;
    } else {
      const numFeet = Number(heightFeet);
      const numInches = Number(heightInches || '0');
      if (!heightFeet.trim() || isNaN(numFeet)) {
        setValidationError('Please enter your height in feet and inches.');
        return;
      }
      const totalInches = numFeet * 12 + numInches;
      if (numFeet < 1 || numFeet > 8 || numInches < 0 || numInches > 11 || totalInches < 20 || totalInches > 102) {
        setValidationError('Please enter a realistic height between 1\'8" and 8\'6" (e.g. 5\'9").');
        return;
      }
      const approxCm = Math.round(totalInches * 2.54);
      formattedHeight = `${numFeet}'${numInches}" (${approxCm} cm)`;
    }

    // Strict Weight Validation
    const numWeight = Number(weightValue);
    if (!weightValue.trim() || isNaN(numWeight)) {
      setValidationError('Please enter your weight as a numeric value.');
      return;
    }
    if (weightUnit === 'kg') {
      if (numWeight < 25 || numWeight > 400) {
        setValidationError('Please enter a realistic weight between 25 kg and 400 kg (e.g. 70 kg).');
        return;
      }
    } else {
      if (numWeight < 55 || numWeight > 880) {
        setValidationError('Please enter a realistic weight between 55 lbs and 880 lbs (e.g. 155 lbs).');
        return;
      }
    }
    const formattedWeight = `${numWeight} ${weightUnit}`;

    if (!goal) {
      setValidationError('Please select a primary fitness goal.');
      return;
    }
    if (!level) {
      setValidationError('Please select your experience level.');
      return;
    }
    if (!schedule) {
      setValidationError('Please choose your weekly workout days.');
      return;
    }
    if (!workoutDuration) {
      setValidationError('Please choose your preferred session duration.');
      return;
    }
    if (equipment.length === 0) {
      setValidationError('Please select at least one equipment option (or choose "No Equipment").');
      return;
    }
    if (!foodPreference) {
      setValidationError('Please select your food preference / dietary style.');
      return;
    }

    try {
      setIsGenerating(true);

      // Hit n8n webhook with selected fitness profile and user data
      const webhookUrl =
        'https://ai-skool-n8n-57b1748669d9.herokuapp.com/webhook/08d42c56-2b84-4c86-80dd-fe7092a5ffc0';

      const userEmail = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('user_email') : '') || '';
      const userId = user?.userId || user?.id || (userEmail ? 'user_' + btoa(userEmail.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) : 'guest');

      const payload = {
        event: 'generate_fitness_plan',
        name: name.trim(),
        age: Number(age) || age,
        height: formattedHeight,
        weight: formattedWeight,
        fitness_goal: goal,
        goal,
        experience_level: level,
        level,
        workout_days: schedule,
        schedule,
        workout_duration: workoutDuration,
        equipment,
        food_preference: foodPreference,
        user_id: userId,
        userId: userId,
        email: userEmail,
        timestamp: new Date().toISOString(),
        source: 'generate_fitness_plan_button',
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate fitness plan.');
      }

      const responseText = await response.text();
      let result: any = null;
      if (responseText && responseText.trim()) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error('Received non-JSON response from plan generator.');
        }
      }

      if (!result || !result.plan) {
        throw new Error('Could not retrieve generated fitness plan from n8n.');
      }
const workoutText = result.plan.workout_plan || '';

const workout_plan = workoutText
  .split('\n')
  .filter((line: string) => line.trim())
  .map((line: string) => {
    const parts = line.trim().split(' ');
    const day = parts.shift() || '';
    const content = parts.join(' ');

    if (
      day === 'Tuesday' ||
      day === 'Thursday' ||
      day === 'Saturday' ||
      day === 'Sunday'
    ) {
      return {
        day,
        title: content,
        focus: 'Recovery / Light Activity',
        exercises: [],
      };
    }

    const match = content.match(/(.*)\s(\d+(?:-\d+)?x\d+(?:-\d+)?(?:\s*reps)?)$/i);

    const exerciseText = match ? match[1] : content;
    const setsReps = match ? match[2] : '';

    const exerciseNames = exerciseText
      .split(',')
      .map((exercise: string) => exercise.trim())
      .filter(Boolean);

    return {
      day,
      title: `${day} Workout`,
      focus: goal,
      exercises: exerciseNames.map((name: string) => ({
        name,
        sets: setsReps.split('x')[0] || '3',
        reps: setsReps.split('x')[1] || '10-12',
        rest: '60-90 sec',
        instructions: '',
        target_muscles: '',
        tips: '',
      })),
    };
  });
// Trigger celebratory confetti
try {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#22C55E', '#06B6D4', '#F8FAFC'],
  });
} catch (_) {}

const plan: FitnessPlan = {
  id: result.plan.plan_id,
  user_id: result.plan.user_id,
  title: 'Personalized Fitness Plan',
  age: Number(age),
  height: formattedHeight,
  weight: formattedWeight,
  goal,
  level,
  schedule,
  workout_duration: workoutDuration,
  equipment,
  food_preference: foodPreference,
  workout_plan,
  recommendations: {
    warmup: '',
    cooldown: '',
    recovery: '',
    progression: '',
    nutrition: result.plan.meal_suggestions || '',
    hydration: result.plan.water_goal || '',
  },
  is_current: true,
  created_at: result.plan.generated_date,
  updated_at: result.plan.generated_date,
};

// Also asynchronously update the user's fitness profile
try {
  api.saveFitnessProfile({
    name: name.trim(),
    age: Number(age) || age,
    height: formattedHeight,
    weight: formattedWeight,
    goal,
    level,
    schedule,
    workout_duration: workoutDuration,
    equipment,
    food_preference: foodPreference,
  }).catch(() => {});
} catch (_) {}

onPlanGenerated(plan);
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setServerError(
        err.message || "We couldn't generate your fitness plan right now. Please try again."
      );
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return <LoadingScreen userName={name} goal={goal} />;
  }

  if (initialLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#22C55E]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#06B6D4]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-white/10 relative z-10">
          {onCancel && (
            <button
              id="fitness-form-back-btn"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 mb-4 transition-colors font-medium cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#22C55E]/20 to-[#06B6D4]/20 border border-[#22C55E]/40 backdrop-blur-md flex items-center justify-center text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.15)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-100">
                {isEditing ? 'Edit Your Fitness Profile' : 'Create Your Fitness Plan'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Provide your physical details and preferences to construct an optimal workout and nutrition program.
              </p>
            </div>
          </div>
        </div>

        {/* Validation & Server Errors */}
        {validationError && (
          <div
            id="form-validation-error"
            className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 backdrop-blur-md relative z-10"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {serverError && (
          <div
            id="form-server-error"
            className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 backdrop-blur-md relative z-10"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* SECTION 1: Personal & Physical Metrics (Age, Height, Weight, Name) */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#22C55E]" />
              Personal & Body Metrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="fitness-name-input">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="fitness-name-input"
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 backdrop-blur-md transition-all"
                    required
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="fitness-age-input">
                  Age (years)
                </label>
                <div className="relative">
                  <input
                    id="fitness-age-input"
                    type="number"
                    min="12"
                    max="100"
                    placeholder="e.g. 26"
                    value={age}
                    onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={handleNumericKeyDown}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 backdrop-blur-md transition-all"
                    required
                  />
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Valid: 12 – 100 years
                </div>
              </div>

              {/* Height */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300" htmlFor="fitness-height-input">
                    Height
                  </label>
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 text-[10px]">
                    <button
                      type="button"
                      id="height-unit-cm-btn"
                      onClick={() => setHeightUnit('cm')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        heightUnit === 'cm'
                          ? 'bg-[#22C55E] text-[#080B12]'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      id="height-unit-ft-btn"
                      onClick={() => setHeightUnit('ft')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        heightUnit === 'ft'
                          ? 'bg-[#22C55E] text-[#080B12]'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ft / in
                    </button>
                  </div>
                </div>

                {heightUnit === 'cm' ? (
                  <div className="relative">
                    <input
                      id="fitness-height-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 175"
                      value={heightCm}
                      onChange={handleHeightCmChange}
                      onKeyDown={handleNumericKeyDown}
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/30 border text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none backdrop-blur-md transition-all ${
                        heightCm && (Number(heightCm) < 50 || Number(heightCm) > 260)
                          ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
                          : 'border-white/10 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30'
                      }`}
                      required
                    />
                    <Ruler className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">cm</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        id="fitness-height-ft-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 5"
                        value={heightFeet}
                        onChange={handleHeightFeetChange}
                        onKeyDown={handleNumericKeyDown}
                        className="w-full pl-7 pr-6 py-2.5 rounded-xl bg-black/30 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 backdrop-blur-md transition-all"
                        required
                      />
                      <Ruler className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3 pointer-events-none" />
                      <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">ft</span>
                    </div>
                    <div className="relative">
                      <input
                        id="fitness-height-in-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 9"
                        value={heightInches}
                        onChange={handleHeightInchesChange}
                        onKeyDown={handleNumericKeyDown}
                        className="w-full pl-3 pr-6 py-2.5 rounded-xl bg-black/30 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 backdrop-blur-md transition-all"
                      />
                      <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">in</span>
                    </div>
                  </div>
                )}
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    {heightUnit === 'cm' ? 'Valid: 50 – 260 cm' : 'Valid: 1\'8" – 8\'6"'}
                  </span>
                  {heightUnit === 'cm' && heightCm && (Number(heightCm) < 50 || Number(heightCm) > 260) && (
                    <span className="text-rose-400 font-medium">Invalid range</span>
                  )}
                </div>
              </div>

              {/* Weight */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300" htmlFor="fitness-weight-input">
                    Weight
                  </label>
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 text-[10px]">
                    <button
                      type="button"
                      id="weight-unit-kg-btn"
                      onClick={() => setWeightUnit('kg')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        weightUnit === 'kg'
                          ? 'bg-[#22C55E] text-[#080B12]'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      id="weight-unit-lbs-btn"
                      onClick={() => setWeightUnit('lbs')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        weightUnit === 'lbs'
                          ? 'bg-[#22C55E] text-[#080B12]'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      lbs
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    id="fitness-weight-input"
                    type="text"
                    inputMode="decimal"
                    placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 155'}
                    value={weightValue}
                    onChange={handleWeightChange}
                    onKeyDown={handleNumericKeyDown}
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/30 border text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none backdrop-blur-md transition-all ${
                      weightValue && (
                        weightUnit === 'kg' 
                          ? (Number(weightValue) < 25 || Number(weightValue) > 400)
                          : (Number(weightValue) < 55 || Number(weightValue) > 880)
                      )
                        ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
                        : 'border-white/10 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30'
                    }`}
                    required
                  />
                  <Scale className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">{weightUnit}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    {weightUnit === 'kg' ? 'Valid: 25 – 400 kg' : 'Valid: 55 – 880 lbs'}
                  </span>
                  {weightValue && (
                    weightUnit === 'kg' 
                      ? (Number(weightValue) < 25 || Number(weightValue) > 400)
                      : (Number(weightValue) < 55 || Number(weightValue) > 880)
                  ) && (
                    <span className="text-rose-400 font-medium">Invalid range</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Fitness Goal */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Target className="w-4 h-4 text-[#22C55E]" />
              <label className="block text-sm font-semibold text-slate-100">
                Fitness Goal
              </label>
            </div>
            <FitnessGoalSelector selectedGoal={goal} onSelectGoal={setGoal} />
          </div>

          {/* SECTION 3: Experience Level */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Award className="w-4 h-4 text-[#22C55E]" />
              <label className="block text-sm font-semibold text-slate-100">
                Experience Level
              </label>
            </div>
            <FitnessLevelSelector selectedLevel={level} onSelectLevel={setLevel} />
          </div>

          {/* SECTION 4: Workout Days & Duration */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
            <ScheduleSelector
              selectedSchedule={schedule}
              onSelectSchedule={setSchedule}
              selectedDuration={workoutDuration}
              onSelectDuration={setWorkoutDuration}
            />
          </div>

          {/* SECTION 5: Equipment */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="w-4 h-4 text-[#22C55E]" />
              <span className="text-sm font-semibold text-slate-100">Equipment</span>
            </div>
            <EquipmentSelector
              selectedEquipment={equipment}
              onChangeEquipment={setEquipment}
            />
          </div>

          {/* SECTION 6: Food Preference */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#22C55E]" />
                <label className="text-sm font-semibold text-slate-100">
                  Food Preference & Dietary Style
                </label>
              </div>
              <span className="text-xs text-slate-400">Customizes nutrition & meal recommendations</span>
            </div>
            <FoodPreferenceSelector
              selectedPreference={foodPreference}
              onSelectPreference={setFoodPreference}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-white/10">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-100 text-sm font-semibold border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              id="fitness-form-submit-btn"
              type="submit"
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-sm transition-all shadow-xl shadow-[#22C55E]/20 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEditing ? 'Generate Updated Plan' : 'Generate My Fitness Plan'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
