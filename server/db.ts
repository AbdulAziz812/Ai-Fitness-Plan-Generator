import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface FitnessProfileRecord {
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

export interface FitnessPlanRecord {
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
  workout_plan: Array<{
    day: string;
    title: string;
    focus?: string;
    warmup?: string;
    exercises: Array<{
      name: string;
      sets: string;
      reps: string;
      rest: string;
      instructions?: string;
      target_muscles?: string;
      tips?: string;
    }>;
    cooldown?: string;
  }>;
  recommendations: {
    warmup: string;
    cooldown: string;
    recovery: string;
    progression: string;
    nutrition: string;
    hydration?: string;
  };
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  fitness_profiles: FitnessProfileRecord[];
  fitness_plans: FitnessPlanRecord[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

class Database {
  private data: DatabaseSchema = {
    users: [],
    fitness_profiles: [],
    fitness_plans: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.fitness_profiles) this.data.fitness_profiles = [];
        if (!this.data.fitness_plans) this.data.fitness_plans = [];
      } else {
        this.persist();
      }
    } catch (err) {
      console.error('Error initializing database:', err);
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // --- Users ---
  findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  findUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  async createUser(name: string, email: string, password: string): Promise<UserRecord> {
    const existing = this.findUserByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();

    const newUser: UserRecord = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      created_at: now,
      updated_at: now
    };

    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  async updateUser(id: string, updates: { name?: string; email?: string; password?: string }): Promise<UserRecord> {
    const user = this.findUserById(id);
    if (!user) throw new Error('User not found');

    if (updates.email && updates.email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const exists = this.findUserByEmail(updates.email);
      if (exists) throw new Error('Email already in use');
      user.email = updates.email.toLowerCase().trim();
    }
    if (updates.name) {
      user.name = updates.name.trim();
    }
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(updates.password, salt);
    }
    user.updated_at = new Date().toISOString();
    this.persist();
    return user;
  }

  // --- Fitness Profiles ---
  getFitnessProfile(userId: string): FitnessProfileRecord | undefined {
    return this.data.fitness_profiles.find(p => p.user_id === userId);
  }

  saveFitnessProfile(userId: string, profileData: {
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
  }): FitnessProfileRecord {
    const now = new Date().toISOString();
    const existingIndex = this.data.fitness_profiles.findIndex(p => p.user_id === userId);

    if (existingIndex >= 0) {
      const existing = this.data.fitness_profiles[existingIndex];
      const updated: FitnessProfileRecord = {
        ...existing,
        ...profileData,
        updated_at: now
      };
      this.data.fitness_profiles[existingIndex] = updated;
      this.persist();
      return updated;
    } else {
      const created: FitnessProfileRecord = {
        id: crypto.randomUUID(),
        user_id: userId,
        ...profileData,
        created_at: now,
        updated_at: now
      };
      this.data.fitness_profiles.push(created);
      this.persist();
      return created;
    }
  }

  // --- Fitness Plans ---
  getUserPlans(userId: string): FitnessPlanRecord[] {
    return this.data.fitness_plans
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getCurrentPlan(userId: string): FitnessPlanRecord | undefined {
    const userPlans = this.getUserPlans(userId);
    return userPlans.find(p => p.is_current) || userPlans[0];
  }

  getPlanById(userId: string, planId: string): FitnessPlanRecord | undefined {
    return this.data.fitness_plans.find(p => p.id === planId && p.user_id === userId);
  }

  savePlan(userId: string, planData: Omit<FitnessPlanRecord, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_current'>): FitnessPlanRecord {
    const now = new Date().toISOString();
    
    // Set previous plans for this user as not current
    this.data.fitness_plans.forEach(p => {
      if (p.user_id === userId) {
        p.is_current = false;
      }
    });

    const newPlan: FitnessPlanRecord = {
      id: crypto.randomUUID(),
      user_id: userId,
      ...planData,
      is_current: true,
      created_at: now,
      updated_at: now
    };

    this.data.fitness_plans.push(newPlan);
    this.persist();
    return newPlan;
  }

  setCurrentPlan(userId: string, planId: string): FitnessPlanRecord {
    const plan = this.getPlanById(userId, planId);
    if (!plan) throw new Error('Plan not found for user');

    this.data.fitness_plans.forEach(p => {
      if (p.user_id === userId) {
        p.is_current = p.id === planId;
        p.updated_at = new Date().toISOString();
      }
    });
    this.persist();
    return plan;
  }

  deletePlan(userId: string, planId: string): boolean {
    const initialLen = this.data.fitness_plans.length;
    this.data.fitness_plans = this.data.fitness_plans.filter(p => !(p.id === planId && p.user_id === userId));
    
    if (this.data.fitness_plans.length !== initialLen) {
      // If the deleted plan was current, mark the latest remaining one as current
      const remaining = this.getUserPlans(userId);
      if (remaining.length > 0 && !remaining.some(p => p.is_current)) {
        remaining[0].is_current = true;
      }
      this.persist();
      return true;
    }
    return false;
  }
}

export const db = new Database();
