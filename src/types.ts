export interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  plan?: FitnessPlan | null;
}

export interface FitnessProfile {
  id: string;
  user_id: string;
  name?: string;
  age?: number | string;
  height?: string;
  weight?: string;
  goal: string;
  level: string;
  schedule: string;
  workout_duration: string;
  equipment: string[];
  food_preference?: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  instructions?: string;
  target_muscles?: string;
  tips?: string;
}

export interface WorkoutDay {
  day: string;
  title: string;
  focus?: string;
  warmup?: string;
  exercises: Exercise[];
  cooldown?: string;
}

export interface PlanRecommendations {
  warmup: string;
  cooldown: string;
  recovery: string;
  progression: string;
  nutrition: string;
  hydration?: string;
}

export interface FitnessPlan {
  id: string;
  user_id: string;
  title: string;
  age?: number | string;
  height?: string;
  weight?: string;
  goal: string;
  level: string;
  schedule: string;
  workout_duration: string;
  equipment: string[];
  food_preference?: string;
  workout_plan: WorkoutDay[];
  recommendations: PlanRecommendations;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export type PageView =
  | 'signup'
  | 'login'
  | 'dashboard'
  | 'fitness-form'
  | 'my-plan'
  | 'profile';

export interface GenerationInput {
  name?: string;
  age?: number | string;
  height?: string;
  weight?: string;
  goal: string;
  level: string;
  schedule: string;
  workout_duration?: string;
  equipment: string[];
  food_preference?: string;
}
