import { GoogleGenAI, Type } from '@google/genai';

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface AIGenerationParams {
  user_id: string;
  name: string;
  age?: string | number;
  height?: string;
  weight?: string;
  goal: string;
  level: string;
  schedule: string;
  workout_duration: string;
  equipment: string[];
  food_preference?: string;
}

export interface GeneratedPlanResult {
  title: string;
  age?: string | number;
  height?: string;
  weight?: string;
  goal: string;
  level: string;
  schedule: string;
  workout_duration: string;
  equipment: string[];
  food_preference?: string;
  workout_plan: Array<{
    day: string;
    title: string;
    focus: string;
    warmup: string;
    exercises: Array<{
      name: string;
      sets: string;
      reps: string;
      rest: string;
      instructions: string;
      target_muscles: string;
      tips: string;
    }>;
    cooldown: string;
  }>;
  recommendations: {
    warmup: string;
    cooldown: string;
    recovery: string;
    progression: string;
    nutrition: string;
    hydration: string;
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateFitnessPlanAI(params: AIGenerationParams): Promise<GeneratedPlanResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `You are FITAI, an elite Certified Strength and Conditioning Specialist (CSCS) and Sports Nutritionist.
Create a personalized, scientifically backed fitness and nutrition program for:
- User Name: ${params.name || 'User'}
- Age: ${params.age || 'Not specified'}
- Height: ${params.height || 'Not specified'}
- Weight: ${params.weight || 'Not specified'}
- Fitness Goal: ${params.goal}
- Experience Level: ${params.level}
- Training Schedule (Workout Days): ${params.schedule}
- Session Duration: ${params.workout_duration}
- Available Equipment: ${params.equipment.length > 0 ? params.equipment.join(', ') : 'No Equipment / Bodyweight'}
- Food Preference / Diet: ${params.food_preference || 'Balanced / No Restrictions'}

CRITICAL RULES:
1. STRICT EQUIPMENT COMPLIANCE: Every single exercise must strictly be executable with the provided equipment (${params.equipment.join(', ') || 'Bodyweight'}). If No Equipment or Bodyweight, use bodyweight movements, calisthenics, and isometric holds. Never include barbells or gym cables if the user only has Dumbbells or No Equipment.
2. DURATION COMPLIANCE: Structure the number of exercises and sets so that the workout comfortably fits within "${params.workout_duration}".
3. DAYS COMPLIANCE: Provide an exact number of workout routines matching the user's schedule frequency (e.g. if "${params.schedule}" implies 3 days, provide 3 distinct days like "Day 1 - Push", "Day 2 - Pull", "Day 3 - Legs / Core").
4. LEVEL & BIOMETRICS APPROPRIATE: Calibrate intensity, volume, and mechanics tailored strictly for a "${params.level}" athlete considering their Age (${params.age || 'N/A'}), Height (${params.height || 'N/A'}), and Weight (${params.weight || 'N/A'}).
5. COMPLETE SCIENTIFIC DETAIL: Provide exact sets, reps, rest intervals (e.g. "60-90 sec"), instructions, target muscles, and form tips for every exercise.
6. TAILORED NUTRITION & MACROS: Provide custom nutrition guidelines and macro strategy specifically built around their Food Preference ("${params.food_preference || 'Balanced'}"), their Goal ("${params.goal}"), and body metrics.
7. COMPREHENSIVE RECOMMENDATIONS: Give actionable warmup protocols, cooldown stretches, weekly progressive overload rules, recovery advice, and hydration strategies.

Return valid JSON conforming to the requested schema.`;

  // Candidate models to try in sequence if high demand / 503 occurs
  const candidateModels = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  if (apiKey) {
    const ai = getGenAI();

    for (const modelName of candidateModels) {
      let attempts = 0;
      const maxAttemptsForModel = 2;

      while (attempts < maxAttemptsForModel) {
        attempts++;
        try {
          console.log(`Attempting AI plan generation using model: ${modelName} (attempt ${attempts}/${maxAttemptsForModel})`);

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: 'You are FITAI, a professional exercise science and nutrition AI engine that generates structured, personalized workout programs in pure JSON format.',
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Motivational and descriptive plan title' },
                  goal: { type: Type.STRING, description: 'The exact user goal' },
                  level: { type: Type.STRING, description: 'The exact user level' },
                  schedule: { type: Type.STRING, description: 'The exact user schedule' },
                  workout_duration: { type: Type.STRING, description: 'The workout session duration' },
                  equipment: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'List of equipment used'
                  },
                  workout_plan: {
                    type: Type.ARRAY,
                    description: 'Days in the weekly workout plan matching schedule',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        day: { type: Type.STRING, description: 'e.g. "Day 1: Upper Body Strength"' },
                        title: { type: Type.STRING, description: 'Routine name / focus' },
                        focus: { type: Type.STRING, description: 'Primary physiological focus' },
                        warmup: { type: Type.STRING, description: 'Pre-workout dynamic warmup' },
                        exercises: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING, description: 'Exercise name' },
                              sets: { type: Type.STRING, description: 'Number of sets (e.g. "3-4" or "3")' },
                              reps: { type: Type.STRING, description: 'Target repetitions or duration (e.g. "8-12 reps" or "45 sec")' },
                              rest: { type: Type.STRING, description: 'Rest time between sets (e.g. "60-90s")' },
                              instructions: { type: Type.STRING, description: 'Step by step execution cues' },
                              target_muscles: { type: Type.STRING, description: 'Primary and secondary muscle groups' },
                              tips: { type: Type.STRING, description: 'Coaching cue or injury prevention tip' }
                            },
                            required: ['name', 'sets', 'reps', 'rest', 'instructions']
                          }
                        },
                        cooldown: { type: Type.STRING, description: 'Post-workout static stretches' }
                      },
                      required: ['day', 'title', 'exercises']
                    }
                  },
                  recommendations: {
                    type: Type.OBJECT,
                    properties: {
                      warmup: { type: Type.STRING, description: 'Universal warm-up protocol' },
                      cooldown: { type: Type.STRING, description: 'Universal cool-down protocol' },
                      recovery: { type: Type.STRING, description: 'Sleep and muscle recovery guidelines' },
                      progression: { type: Type.STRING, description: 'Rules for progressive overload over weeks' },
                      nutrition: { type: Type.STRING, description: 'Calorie, protein, and meal timing guidelines' },
                      hydration: { type: Type.STRING, description: 'Water and electrolyte intake advice' }
                    },
                    required: ['warmup', 'cooldown', 'recovery', 'progression', 'nutrition']
                  }
                },
                required: ['title', 'goal', 'level', 'schedule', 'workout_duration', 'equipment', 'workout_plan', 'recommendations']
              }
            }
          });

          const text = response.text;
          if (text) {
            const parsed = JSON.parse(text) as GeneratedPlanResult;
            parsed.age = params.age;
            parsed.height = params.height;
            parsed.weight = params.weight;
            parsed.goal = params.goal;
            parsed.level = params.level;
            parsed.schedule = params.schedule;
            parsed.workout_duration = params.workout_duration;
            parsed.equipment = params.equipment;
            parsed.food_preference = params.food_preference;
            return parsed;
          }
        } catch (apiErr: any) {
          const errMsg = String(apiErr?.message || apiErr || '');
          const is503OrRateLimit =
            errMsg.includes('503') ||
            errMsg.includes('UNAVAILABLE') ||
            errMsg.includes('high demand') ||
            errMsg.includes('429') ||
            errMsg.includes('RESOURCE_EXHAUSTED');

          console.warn(`Model ${modelName} error on attempt ${attempts}:`, errMsg);

          if (is503OrRateLimit && attempts < maxAttemptsForModel) {
            await sleep(800 * attempts);
            continue;
          }
          // Move to next candidate model
          break;
        }
      }
    }
  }

  // Graceful scientific fallback generator when external API is experiencing service outage
  console.log('Generating customized scientific plan via built-in exercise science engine...');
  return generateScientificFallbackPlan(params);
}

function generateScientificFallbackPlan(params: AIGenerationParams): GeneratedPlanResult {
  const goal = params.goal || 'General Fitness';
  const level = params.level || 'Intermediate';
  const schedule = params.schedule || '3 Days / Week';
  const duration = params.workout_duration || '30–45 Minutes';
  const equipment = params.equipment && params.equipment.length > 0 ? params.equipment : ['Bodyweight / No Equipment'];
  const foodPref = params.food_preference || 'Balanced / No Restrictions';
  const hasDumbbells = equipment.some((e) => e.toLowerCase().includes('dumbbell'));
  const hasBarbell = equipment.some((e) => e.toLowerCase().includes('barbell'));
  const hasBands = equipment.some((e) => e.toLowerCase().includes('band'));
  const hasGym = equipment.some((e) => e.toLowerCase().includes('gym') || e.toLowerCase().includes('machine'));

  // Determine number of workout days
  let numDays = 3;
  if (schedule.includes('2')) numDays = 2;
  else if (schedule.includes('4')) numDays = 4;
  else if (schedule.includes('5')) numDays = 5;
  else if (schedule.includes('6')) numDays = 6;

  // Build tailored daily routines
  const days = [];
  for (let i = 1; i <= numDays; i++) {
    if (numDays === 2) {
      if (i === 1) {
        days.push({
          day: `Day 1: Full Body Foundation`,
          title: `Full Body Strength & Core A`,
          focus: `Compound movement mechanics, core stability, and total-body power.`,
          warmup: `5 min dynamic flow: Arm circles, leg swings, inchworms, and bodyweight squats.`,
          exercises: [
            {
              name: hasBarbell ? 'Barbell Back Squat' : hasDumbbells ? 'Goblet Squats' : 'Tempo Air Squats',
              sets: level === 'Beginner' ? '3' : '4',
              reps: goal.includes('Muscle') ? '8-10 reps' : '12-15 reps',
              rest: '90s',
              instructions: 'Keep chest high, core braced, descend until hips are parallel to knees, drive through mid-foot.',
              target_muscles: 'Quadriceps, Glutes, Hamstrings, Core',
              tips: 'Keep knees tracking in line with your toes throughout the descent.'
            },
            {
              name: hasDumbbells ? 'Dumbbell Overhead Shoulder Press' : hasBands ? 'Resistance Band Overhead Press' : 'Pike Push-ups / Elevated Push-ups',
              sets: '3',
              reps: '10-12 reps',
              rest: '60-90s',
              instructions: 'Brace abdominals, press overhead without arching the lower back, lock out at the top with control.',
              target_muscles: 'Anterior Deltoids, Triceps, Upper Chest',
              tips: 'Do not hyperextend your lumbar spine; squeeze your glutes at lockout.'
            },
            {
              name: hasDumbbells ? 'Dumbbell Bent-Over Rows' : hasBands ? 'Banded Seated Row' : 'Inverted Table Rows / Doorframe Rows',
              sets: '3',
              reps: '10-12 reps',
              rest: '60s',
              instructions: 'Hinge at the hips, pull weights toward hip pocket, retracting shoulder blades at the peak contraction.',
              target_muscles: 'Latissimus Dorsi, Rhomboids, Biceps',
              tips: 'Think about driving back with your elbows rather than pulling with your hands.'
            },
            {
              name: 'Forearm Plank with Shoulder Taps',
              sets: '3',
              reps: '45-60 sec hold',
              rest: '45s',
              instructions: 'Maintain a rigid straight line from shoulders to ankles while engaging the abdominal wall.',
              target_muscles: 'Transverse Abdominis, Rectus Abdominis, Deltoids',
              tips: 'Avoid letting your hips sag or tilt from side to side.'
            }
          ],
          cooldown: `5 min static stretching: Hamstring stretch, quad stretch, child's pose, and deep thoracic breathing.`
        });
      } else {
        days.push({
          day: `Day 2: Full Body Hypertrophy & Conditioning`,
          title: `Full Body Stamina & Structural Balance B`,
          focus: `Posterior chain development, horizontal pushing, and metabolic conditioning.`,
          warmup: `5 min dynamic flow: Cat-cow, world's greatest stretch, glute bridges, and high knees.`,
          exercises: [
            {
              name: hasBarbell ? 'Romanian Deadlift' : hasDumbbells ? 'Dumbbell Romanian Deadlifts' : 'Single-Leg Glute Bridges',
              sets: '3',
              reps: '10-12 reps',
              rest: '90s',
              instructions: 'Hinge back pushing hips to the rear wall, feel deep hamstring stretch, thrust hips forward to lock out.',
              target_muscles: 'Hamstrings, Gluteus Maximus, Erector Spinae',
              tips: 'Keep the weights or resistance close to your shins throughout the hinge.'
            },
            {
              name: hasDumbbells ? 'Flat Dumbbell Bench Press' : 'Standard Push-ups / Deficit Push-ups',
              sets: level === 'Advanced' ? '4' : '3',
              reps: '10-12 reps',
              rest: '60-90s',
              instructions: 'Lower chest with elbows at 45-degree angle, press powerfully through the chest to full lockout.',
              target_muscles: 'Pectoralis Major, Anterior Deltoids, Triceps',
              tips: 'Control the 2-second eccentric lowering phase.'
            },
            {
              name: hasDumbbells ? 'Walking Dumbbell Lunges' : 'Bodyweight Reverse Lunges',
              sets: '3',
              reps: '12 reps per leg',
              rest: '60s',
              instructions: 'Step back with control, lower rear knee until hovering 1 inch above floor, push through front heel.',
              target_muscles: 'Quadriceps, Glutes, Calves, Balance Stabilizers',
              tips: 'Keep your torso upright with a slight forward lean.'
            },
            {
              name: 'Deadbugs with Controlled Breathing',
              sets: '3',
              reps: '12 reps per side',
              rest: '45s',
              instructions: 'Lie on your back, press lower back into the floor, extend opposite arm and leg synchronously.',
              target_muscles: 'Core, Hip Flexors, Deep Spinal Stabilizers',
              tips: 'Never let your lower back arch away from the floor.'
            }
          ],
          cooldown: `5 min static cooldown: Cobra stretch, pigeon pose, and seated forward fold.`
        });
      }
    } else {
      // 3 to 6 day split routines
      const splitNames = [
        { dayNum: 1, title: 'Upper Body Power & Push', focus: 'Chest, Shoulders, Triceps, and Core stability' },
        { dayNum: 2, title: 'Lower Body Strength & Posterior Chain', focus: 'Quadriceps, Hamstrings, Glutes, and Calves' },
        { dayNum: 3, title: 'Upper Body Pull & Postural Endurance', focus: 'Lats, Rhomboids, Rear Deltoids, and Biceps' },
        { dayNum: 4, title: 'Lower Body Hypertrophy & Unilateral Power', focus: 'Single-leg strength, adductors, and hip mobility' },
        { dayNum: 5, title: 'Total Body Metabolic Conditioning', focus: 'High-density strength endurance and core rigidity' },
        { dayNum: 6, title: 'Active Mobility & Kinetic Chain Calibration', focus: 'Full-range joint mobility, rotary core, and restorative conditioning' }
      ];

      const split = splitNames[i - 1];
      days.push({
        day: `Day ${i}: ${split.title}`,
        title: `${split.title} (${duration})`,
        focus: split.focus,
        warmup: `5-7 minutes dynamic warmup: Multi-directional lunges, band pull-aparts, thoracic openers, and arm rotations.`,
        exercises: [
          {
            name: i % 2 === 1
              ? (hasDumbbells ? 'Dumbbell Floor/Bench Press' : hasBarbell ? 'Barbell Bench Press' : 'Diamond / Decline Push-ups')
              : (hasBarbell ? 'Barbell Back Squat' : hasDumbbells ? 'Goblet Squats' : 'Bulgarian Split Squats'),
            sets: level === 'Beginner' ? '3' : '4',
            reps: goal.includes('Strength') ? '6-8 reps' : goal.includes('Muscle') ? '8-12 reps' : '12-15 reps',
            rest: '75-90s',
            instructions: 'Maintain rigid core bracing, control the lowering phase over 2-3 seconds, and press/drive explosively.',
            target_muscles: i % 2 === 1 ? 'Pectorals, Anterior Delts, Triceps' : 'Quadriceps, Glutes, Core',
            tips: 'Focus on full range of motion while maintaining strict joint alignment.'
          },
          {
            name: i % 2 === 1
              ? (hasDumbbells ? 'Single-Arm Dumbbell Row' : hasBands ? 'Resistance Band Rows' : 'Inverted Towel / Doorway Rows')
              : (hasDumbbells ? 'Dumbbell Romanian Deadlift' : hasBarbell ? 'Barbell Deadlift' : 'Single-Leg Hinge / Nordic Curls'),
            sets: '3',
            reps: '10-12 reps',
            rest: '60-90s',
            instructions: 'Engage the working musculature smoothly through peak contraction, pausing for 1 second at the top.',
            target_muscles: i % 2 === 1 ? 'Latissimus Dorsi, Rhomboids, Biceps' : 'Hamstrings, Glutes, Spinal Erectors',
            tips: 'Keep shoulder blades depressed and retracted at the top of the movement.'
          },
          {
            name: hasDumbbells ? 'Dumbbell Arnold Press' : hasBands ? 'Band Lateral Raises' : 'Pike Push-ups / Plank to Down Dog',
            sets: '3',
            reps: '12-15 reps',
            rest: '60s',
            instructions: 'Rotate through fluid range of motion without momentum, isolating deltoids and stabilizing core.',
            target_muscles: 'Deltoids (Anterior, Lateral, Posterior), Triceps',
            tips: 'Control the descent slowly to maximize metabolic time-under-tension.'
          },
          {
            name: 'Hanging / Lying Leg Raises & Bicycle Crunches',
            sets: '3',
            reps: '15-20 reps',
            rest: '45s',
            instructions: 'Draw ribs toward hips, contract abdominal muscles with intention, control leg descent without arching.',
            target_muscles: 'Rectus Abdominis, Obliques, Deep Hip Flexors',
            tips: 'Exhale forcefully as you reach maximum abdominal contraction.'
          }
        ],
        cooldown: `5-8 minutes static cooldown: Deep hip flexor stretches, lat stretch, chest doorway opener, and mindful diaphragmatic breathing.`
      });
    }
  }

  // Generate tailored nutrition based on food preference and goal
  let nutritionGuideline = `Maintain a balanced daily intake calibrated to your ${goal} target.`;
  if (foodPref.toLowerCase().includes('vegetarian')) {
    nutritionGuideline = `Plant-Rich High-Protein Protocol: Focus on paneer, tofu, edamame, Greek yogurt, lentils, chia seeds, and hemp hearts. Target 1.6-2.0g protein per kg bodyweight with complex carbohydrates (quinoa, oats) to fuel recovery.`;
  } else if (foodPref.toLowerCase().includes('vegan')) {
    nutritionGuideline = `100% Plant-Based Performance Protocol: Emphasize tempeh, seitan, lentils, spirulina, nutritional yeast, and high-quality pea/rice protein blends. Pair with micronutrient-rich leafy greens and healthy fats (avocado, walnuts).`;
  } else if (foodPref.toLowerCase().includes('keto')) {
    nutritionGuideline = `Ketogenic Metabolic Protocol: 70-75% healthy fats (avocado, olive oil, nuts, seeds), 20-25% bioavailable proteins, and under 5-10% net carbs. Ensure adequate sodium and potassium electrolyte replenishment.`;
  } else if (foodPref.toLowerCase().includes('pescatarian')) {
    nutritionGuideline = `Pescatarian Lean Power: Wild salmon, tuna, shrimp, eggs, and legumes paired with complex grains. Rich in natural Omega-3 fatty acids for joint recovery and reduced exercise-induced inflammation.`;
  } else {
    nutritionGuideline = `High-Protein Performance Protocol: Aim for 1.8-2.2g of protein per kg of bodyweight (chicken breast, lean beef, eggs, whey, Greek yogurt). Distribute protein evenly across 3-4 meals every 3-4 hours.`;
  }

  return {
    title: `${goal} Precision Program (${level})`,
    age: params.age,
    height: params.height,
    weight: params.weight,
    goal: goal,
    level: level,
    schedule: schedule,
    workout_duration: duration,
    equipment: equipment,
    food_preference: foodPref,
    workout_plan: days,
    recommendations: {
      warmup: `Prioritize 5-7 minutes of dynamic mobility prior to each session to raise core body temperature, lubricate synovial joints, and activate central nervous system firing.`,
      cooldown: `Execute 5 minutes of static stretching and parasympathetic box breathing (4s in, 4s hold, 4s out, 4s hold) immediately post-session to down-regulate cortisol.`,
      recovery: `Target 7.5–9.0 hours of sleep nightly. Take at least 1-2 dedicated active recovery days per week focusing on light walking, zone 2 cardio, and foam rolling.`,
      progression: `Follow the Double Progression Method: Once you reach the top of the recommended rep range on all working sets with clean form, increase resistance by 2.5–5% in the subsequent week.`,
      nutrition: nutritionGuideline,
      hydration: `Drink a baseline of 35-40 ml of water per kg of bodyweight daily, adding an extra 500-750 ml with electrolytes for every hour of rigorous training.`
    }
  };
}

