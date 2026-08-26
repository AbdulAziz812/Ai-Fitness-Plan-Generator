import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, FitnessPlan } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  plan: FitnessPlan | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = api.getToken();
      if (!token) {
        setUser(null);
        setPlan(null);
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      
      // Also load existing fitness plan from Google Sheets webhook
      try {
        const planData = await api.getCurrentPlan();
        if (planData && planData.plan) {
          setPlan(planData.plan);
        }
      } catch (pErr) {
        console.warn('Initial plan load error:', pErr);
      }
    } catch (err) {
      console.warn('Session check failed:', err);
      api.clearToken();
      setUser(null);
      setPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);

    console.log('LOGIN RESPONSE:', res);
    console.log('USER:', res.user);
    console.log('PLAN:', res.plan);

    setUser(res.user);
    
    if (res.plan) {
      setPlan(res.plan);
    } else {
      // Query Google Sheets webhook for existing plan
      try {
        const planRes = await api.getCurrentPlan();
        if (planRes && planRes.plan) {
          setPlan(planRes.plan);
        } else {
          setPlan(null);
        }
      } catch (err) {
        console.warn('Could not load plan immediately after login:', err);
        setPlan(null);
      }
    }
  };

  const signup = async (name: string, email: string, password: string, confirmPassword: string) => {
    const res = await api.signup(name, email, password, confirmPassword);
    if (res.user) {
      setUser(res.user);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setPlan(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        plan,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
