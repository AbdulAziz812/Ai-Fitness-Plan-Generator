import { FitnessPlan } from '../types';

export function parseWorkoutPlanText(workoutText: string, defaultGoal: string = 'General Fitness'): any[] {
  if (!workoutText || typeof workoutText !== 'string') {
    return [];
  }

  // Check if it's already a JSON array string
  try {
    const parsed = JSON.parse(workoutText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {}

  // Parse lines e.g.:
  // Monday Bench Press 3x10-12, Incline Dumbbell Press 3x12
  // Tuesday Rest / Light Cardio
  // Wednesday Squats 3x10, Leg Press 3x12
  const lines = workoutText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  return lines.map((line: string) => {
    const parts = line.split(' ');
    const day = parts.shift() || 'Day';
    const content = parts.join(' ').trim();

    const isRest =
      /rest|recovery|off|light activity/i.test(content) ||
      ((day === 'Tuesday' || day === 'Thursday' || day === 'Saturday' || day === 'Sunday') &&
        !content.match(/\d+x\d+/i));

    if (isRest) {
      return {
        day,
        title: content || `${day} - Rest & Active Recovery`,
        focus: 'Recovery / Light Activity',
        exercises: [],
      };
    }

    const match = content.match(/(.*)\s+(\d+(?:-\d+)?x\d+(?:-\d+)?(?:\s*reps)?)$/i);
    const exerciseText = match ? match[1] : content;
    const setsReps = match ? match[2] : '';

    const exerciseNames = exerciseText
      .split(',')
      .map((exercise: string) => exercise.trim())
      .filter(Boolean);

    const sets = setsReps ? setsReps.split('x')[0] || '3' : '3';
    const reps = setsReps ? setsReps.split('x')[1] || '10-12' : '10-12';

    return {
      day,
      title: `${day} Workout`,
      focus: defaultGoal,
      exercises: (exerciseNames.length > 0 ? exerciseNames : [exerciseText || `${day} Routine`]).map((name: string) => ({
        name,
        sets: sets.trim() || '3',
        reps: reps.trim() || '10-12',
        rest: '60-90 sec',
        instructions: '',
        target_muscles: '',
        tips: '',
      })),
    };
  });
}

export function normalizeFitnessPlan(raw: any, fallbackUser?: any): FitnessPlan | null {
  if (!raw) return null;

  // Unwrap if nested in an array or container property
  let obj = raw;
  if (Array.isArray(obj)) {
    if (obj.length === 0) return null;
    obj = obj[0];
  }
  if (obj.plan) {
    obj = obj.plan;
  } else if (obj.plans && Array.isArray(obj.plans)) {
    if (obj.plans.length === 0) return null;
    obj = obj.plans[0];
  }

  if (!obj || typeof obj !== 'object') return null;

  // Check if object is essentially empty or an error response
  if (obj.success === false || obj.error) {
    return null;
  }

  const rawWorkoutPlan = obj.workout_plan || obj['Workout Plan'] || obj.workoutPlan;
  const rawMeal = obj.meal_suggestions || obj['Meal Suggestions'] || obj.mealSuggestions || obj.nutrition || '';
  const rawWater = obj.water_goal || obj['Water Goal'] || obj.waterGoal || obj.hydration || '';
  const rawGoal = obj.goal || obj.fitness_goal || obj['Fitness Goal'] || obj['goal'] || 'Muscle Building';
  const rawLevel = obj.level || obj.experience_level || obj['Experience Level'] || obj['level'] || 'Intermediate';
  const rawSchedule = obj.schedule || obj.workout_days || obj['Workout Days'] || obj['schedule'] || '3 Days';
  const rawDuration = obj.workout_duration || obj['Workout Duration'] || obj.workoutDuration || '30–45 Minutes';
  const rawFood = obj.food_preference || obj['Food Preference'] || obj.foodPreference || 'Non-Vegetarian';
  const rawAge = obj.age || obj['Age'] || fallbackUser?.age || 26;
  const rawHeight = obj.height || obj['Height'] || fallbackUser?.height || '175 cm';
  const rawWeight = obj.weight || obj['Weight'] || fallbackUser?.weight || '70 kg';

  // If there's no workout plan and no goal/id, it's not a valid plan
  if (!rawWorkoutPlan && !obj.plan_id && !obj.id && !obj['Plan ID']) {
    return null;
  }

  let parsedWorkout: any[] = [];
  if (Array.isArray(rawWorkoutPlan)) {
    parsedWorkout = rawWorkoutPlan;
  } else if (typeof rawWorkoutPlan === 'string') {
    parsedWorkout = parseWorkoutPlanText(rawWorkoutPlan, rawGoal);
  }

  // Parse equipment
  let parsedEquipment: string[] = ['Dumbbells', 'Bodyweight'];
  const rawEquip = obj.equipment || obj['Equipment'];
  if (Array.isArray(rawEquip)) {
    parsedEquipment = rawEquip;
  } else if (typeof rawEquip === 'string') {
    try {
      const parsed = JSON.parse(rawEquip);
      if (Array.isArray(parsed)) parsedEquipment = parsed;
      else parsedEquipment = rawEquip.split(',').map((s) => s.trim()).filter(Boolean);
    } catch {
      parsedEquipment = rawEquip.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  // Parse recommendations
  let recs = {
    warmup: '5-10 minutes dynamic warm-up (arm circles, leg swings, light cardio)',
    cooldown: '5-10 minutes static stretching and foam rolling',
    recovery: 'Prioritize 7-8 hours quality sleep, hydration, and active rest days',
    progression: 'Increase weight or repetitions by 2-5% weekly',
    nutrition: typeof rawMeal === 'string' ? rawMeal : JSON.stringify(rawMeal),
    hydration: typeof rawWater === 'string' ? rawWater : JSON.stringify(rawWater),
  };

  if (obj.recommendations && typeof obj.recommendations === 'object') {
    recs = {
      ...recs,
      ...obj.recommendations,
      nutrition: obj.recommendations.nutrition || recs.nutrition,
      hydration: obj.recommendations.hydration || recs.hydration,
    };
  }

  const generatedDate = obj.generated_date || obj['Generated Date'] || obj.created_at || obj['Timestamp'] || new Date().toISOString();

  return {
    id: String(obj.plan_id || obj['Plan ID'] || obj.id || `plan_${Date.now()}`),
    user_id: String(obj.user_id || obj['User ID'] || obj.userId || fallbackUser?.id || fallbackUser?.userId || 'user'),
    title: obj.title || obj['Plan Title'] || `${rawGoal} Program`,
    age: Number(rawAge) || 26,
    height: String(rawHeight),
    weight: String(rawWeight),
    goal: String(rawGoal),
    level: String(rawLevel),
    schedule: String(rawSchedule),
    workout_duration: String(rawDuration),
    equipment: parsedEquipment,
    food_preference: String(rawFood),
    workout_plan: parsedWorkout,
    recommendations: recs,
    is_current: true,
    created_at: generatedDate,
    updated_at: generatedDate,
  };
}
