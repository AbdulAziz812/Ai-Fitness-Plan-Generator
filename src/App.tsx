import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageView, FitnessPlan } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FitnessFormPage } from './pages/FitnessFormPage';
import { MyFitnessPlanPage } from './pages/MyFitnessPlanPage';
import { ProfilePage } from './pages/ProfilePage';
import { Dumbbell } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [authView, setAuthView] = useState<'landing' | 'signup' | 'login'>('landing');
  const [isEditingFitness, setIsEditingFitness] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const [latestPlan, setLatestPlan] = useState<FitnessPlan | null>(null);
  const [justGenerated, setJustGenerated] = useState(false);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Loading state while checking session token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center animate-pulse shadow-2xl shadow-[#22C55E]/20 relative z-10">
          <Dumbbell className="w-7 h-7 text-[#22C55E] stroke-[2.5]" />
        </div>
        <div className="text-sm font-semibold text-slate-300 tracking-wide relative z-10 backdrop-blur-sm px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          Initializing FITAI...
        </div>
      </div>
    );
  }

  // If user is not authenticated, show Landing Page first, or Sign Up / Login
  if (!isAuthenticated) {
    if (authView === 'landing') {
      return (
        <LandingPage
          onNavigateToSignUp={() => setAuthView('signup')}
          onNavigateToLogin={() => setAuthView('login')}
        />
      );
    } else if (authView === 'signup') {
      return (
        <SignUpPage
          onNavigateToLogin={() => setAuthView('login')}
          onNavigateToLanding={() => setAuthView('landing')}
          onSuccessRedirect={() => {
            showToast('Account created successfully.');
            setCurrentPage('dashboard');
          }}
        />
      );
    } else {
      return (
        <LoginPage
          onNavigateToSignUp={() => setAuthView('signup')}
          onNavigateToLanding={() => setAuthView('landing')}
          onSuccessRedirect={() => {
            showToast('Logged in successfully.');
            setCurrentPage('dashboard');
          }}
        />
      );
    }
  }

  // Authenticated Application Flow
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-[#22C55E]/30 selection:text-[#22C55E] relative overflow-x-hidden">
      {/* Dynamic Ambient Frosted Glows in background */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[25%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none z-0" />

      {/* Global Navigation */}
      <div className="relative z-40">
        <Navbar
          currentPage={currentPage}
          onNavigate={(page) => {
            setIsEditingFitness(false);
            setCurrentPage(page);
          }}
        />
      </div>

      {/* Global Toast */}
      {toastNotification && (
        <div className="fixed top-20 right-6 z-50 p-3.5 px-5 rounded-2xl bg-emerald-500/90 text-slate-950 font-bold text-xs shadow-2xl backdrop-blur-xl border border-emerald-300/40 flex items-center gap-2 animate-bounce">
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Main Content Area with Page Transitions */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {currentPage === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <DashboardPage
                onNavigate={(p) => setCurrentPage(p)}
                onEditDetails={() => {
                  setIsEditingFitness(true);
                  setCurrentPage('fitness-form');
                }}
                onGenerateNew={() => {
                  setIsEditingFitness(false);
                  setCurrentPage('fitness-form');
                }}
              />
            </motion.div>
          )}

          {currentPage === 'fitness-form' && (
            <motion.div
              key="fitness-form"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <FitnessFormPage
                isEditing={isEditingFitness}
                onPlanGenerated={(newPlan: FitnessPlan) => {
                  setLatestPlan(newPlan);
                  setJustGenerated(true);
                  showToast(
                    isEditingFitness
                      ? 'Your fitness information has been updated.'
                      : 'Your personalized fitness plan has been created.'
                  );
                  setCurrentPage('my-plan');
                }}
                onCancel={() => setCurrentPage('dashboard')}
              />
            </motion.div>
          )}

          {currentPage === 'my-plan' && (
            <motion.div
              key="my-plan"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <MyFitnessPlanPage
                initialPlan={latestPlan}
                justGenerated={justGenerated}
                onNavigate={(p) => setCurrentPage(p)}
                onEditDetails={() => {
                  setIsEditingFitness(true);
                  setCurrentPage('fitness-form');
                }}
                onGenerateNew={() => {
                  setIsEditingFitness(false);
                  setCurrentPage('fitness-form');
                }}
              />
            </motion.div>
          )}

          {currentPage === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <ProfilePage
                onNavigate={(p) => setCurrentPage(p)}
                onEditFitnessDetails={() => {
                  setIsEditingFitness(true);
                  setCurrentPage('fitness-form');
                }}
                onGenerateNewPlan={() => {
                  setIsEditingFitness(false);
                  setCurrentPage('fitness-form');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/40 backdrop-blur-xl py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm text-slate-200">FITAI</span>
            <span>— Personalized AI Fitness Conditioning Engine</span>
          </div>
          <div>All workouts and recommendations generated dynamically for authenticated athletes.</div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
