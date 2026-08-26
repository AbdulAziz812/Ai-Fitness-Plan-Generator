import { User, AuthResponse, FitnessProfile, FitnessPlan, GenerationInput } from '../types';
import { normalizeFitnessPlan } from '../utils/planNormalizer';

const TOKEN_KEY = 'fitai_auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('user');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  let data: any = {};
  const text = await response.text();
  if (text && text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text, error: !response.ok ? text : undefined };
    }
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  getToken,
  setToken,
  clearToken,
  request,

  // Auth
  async signup(name: string, email: string, password: string, confirmPassword: string): Promise<{ success: boolean; message: string; user?: User; token?: string }> {
    const res = await request<{ success: boolean; message: string; user?: User; token?: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    if (res.token) {
      setToken(res.token);
    }
    if (res.user) {
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    console.log('RAW LOGIN API RESPONSE:', res);

    if (res.token) {
      setToken(res.token);
    }
    if (res.user) {
      localStorage.setItem('user', JSON.stringify(res.user));
    }

    if (res.plan) {
      const normalized = normalizeFitnessPlan(res.plan, res.user);
      res.plan = normalized;
      if (normalized) {
        localStorage.setItem('fitai_current_plan', JSON.stringify(normalized));
      }
    }

    return res;
  },

  async getMe(): Promise<{ user: User; profile: FitnessProfile | null }> {
    return request<{ user: User; profile: FitnessProfile | null }>('/api/auth/me');
  },

  async updateProfile(name?: string, email?: string, password?: string): Promise<{ user: User; message: string }> {
    return request<{ user: User; message: string }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email, password }),
    });
  },

  // Fitness Profile
  async getFitnessProfile(): Promise<{ profile: FitnessProfile | null }> {
    return request<{ profile: FitnessProfile | null }>('/api/fitness-profile');
  },

  async saveFitnessProfile(profile: Partial<FitnessProfile>): Promise<{ profile: FitnessProfile; message: string }> {
    return request<{ profile: FitnessProfile; message: string }>('/api/fitness-profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  // Fitness Plans (fetches from Google Sheets webhook with local fallbacks)
  async getFitnessPlans(): Promise<{ plans: FitnessPlan[] }> {
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const userEmail = user?.email || localStorage.getItem('user_email') || '';
    const userId = user?.id || user?.userId || (userEmail ? 'user_' + btoa(userEmail.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) : 'guest');

    try {
      // 1. Try server endpoint which queries webhook
      const serverRes = await request<{ plans?: any[]; plan?: any }>('/api/fitness-plans');
      let rawList: any[] = [];
      if (Array.isArray(serverRes.plans)) {
        rawList = serverRes.plans;
      } else if (serverRes.plan) {
        rawList = [serverRes.plan];
      }

      const normalizedList = rawList
        .map((p) => normalizeFitnessPlan(p, user))
        .filter((p): p is FitnessPlan => p !== null);

      if (normalizedList.length > 0) {
        return { plans: normalizedList };
      }
    } catch (err) {
      console.warn('Server getFitnessPlans fallback triggered:', err);
    }

    // 2. Direct client-side webhook query fallback
    try {
      const webhookUrl = 'https://ai-skool-n8n-57b1748669d9.herokuapp.com/webhook/00b411fc-3140-4a00-a12c-5f1f48d52401';
      const webhookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          user_id: userId,
          'User ID': userId,
          email: userEmail,
          Email: userEmail,
        }),
      });

      if (webhookRes.ok) {
        const text = await webhookRes.text();
        if (text && text.trim()) {
          try {
            const data = JSON.parse(text);
            let planList = [];
            if (Array.isArray(data)) {
              planList = data;
            } else if (Array.isArray(data.plans)) {
              planList = data.plans;
            } else if (data.plan) {
              planList = [data.plan];
            } else if (data.workout_plan) {
              planList = [data];
            }

            const normalizedList = planList
              .map((p) => normalizeFitnessPlan(p, user))
              .filter((p): p is FitnessPlan => p !== null);

            if (normalizedList.length > 0) {
              return { plans: normalizedList };
            }
          } catch {
            // response was not JSON, fallback gracefully
          }
        }
      }
    } catch (whErr) {
      console.warn('Direct webhook getFitnessPlans error:', whErr);
    }

    // 3. Check local storage cached plan
    const cachedPlan = localStorage.getItem('fitai_current_plan');
    if (cachedPlan) {
      try {
        const parsed = JSON.parse(cachedPlan);
        const normalized = normalizeFitnessPlan(parsed, user);
        if (normalized) {
          return { plans: [normalized] };
        }
      } catch {}
    }

    return { plans: [] };
  },

  async getCurrentPlan(): Promise<{ plan: FitnessPlan | null }> {
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const userEmail = user?.email || localStorage.getItem('user_email') || '';
    const userId = user?.id || user?.userId || (userEmail ? 'user_' + btoa(userEmail.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) : 'guest');

    try {
      // 1. Try server endpoint
      const serverRes = await request<{ plan: any }>('/api/fitness-plans/current');
      if (serverRes && serverRes.plan) {
        const normalized = normalizeFitnessPlan(serverRes.plan, user);
        if (normalized) {
          localStorage.setItem('fitai_current_plan', JSON.stringify(normalized));
          return { plan: normalized };
        }
      }
    } catch (err) {
      console.warn('Server getCurrentPlan fallback triggered:', err);
    }

    // 2. Direct client-side webhook query fallback
    try {
      const webhookUrl = 'https://ai-skool-n8n-57b1748669d9.herokuapp.com/webhook/00b411fc-3140-4a00-a12c-5f1f48d52401';
      const webhookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          user_id: userId,
          'User ID': userId,
          email: userEmail,
          Email: userEmail,
        }),
      });

      if (webhookRes.ok) {
        const text = await webhookRes.text();
        if (text && text.trim()) {
          try {
            const data = JSON.parse(text);
            const rawPlan = data.plan || (Array.isArray(data.plans) ? data.plans[0] : (data.workout_plan ? data : null));
            if (rawPlan) {
              const normalized = normalizeFitnessPlan(rawPlan, user);
              if (normalized) {
                localStorage.setItem('fitai_current_plan', JSON.stringify(normalized));
                return { plan: normalized };
              }
            }
          } catch {
            // response was not JSON, fallback gracefully
          }
        }
      }
    } catch (whErr) {
      console.warn('Direct webhook getCurrentPlan error:', whErr);
    }

    // 3. Fall back to cached local plan
    const cached = localStorage.getItem('fitai_current_plan');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const normalized = normalizeFitnessPlan(parsed, user);
        if (normalized) {
          return { plan: normalized };
        }
      } catch {}
    }

    return { plan: null };
  },

  async getPlanById(id: string): Promise<{ plan: FitnessPlan }> {
    return request<{ plan: FitnessPlan }>(`/api/fitness-plans/${id}`);
  },

  async setCurrentPlan(id: string): Promise<{ plan: FitnessPlan; message: string }> {
    return request<{ plan: FitnessPlan; message: string }>(`/api/fitness-plans/${id}/current`, {
      method: 'PUT',
    });
  },

  async deletePlan(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/fitness-plans/${id}`, {
      method: 'DELETE',
    });
  },

  logout() {
    clearToken();
  },
};
