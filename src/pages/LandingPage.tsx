import React from 'react';
import {
  Dumbbell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Target,
  Flame,
  Calendar,
  Utensils,
  CheckCircle2,
  Lock,
  TrendingUp,
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToSignUp: () => void;
  onNavigateToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToSignUp,
  onNavigateToLogin,
}) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-[#22C55E]/30 selection:text-[#22C55E] relative overflow-x-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[25%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[20%] w-[650px] h-[650px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none z-0" />

      {/* Top Navigation Bar */}
      <header className="relative z-30 border-b border-white/10 bg-[#090d16]/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shadow-lg shadow-[#22C55E]/20">
              <Dumbbell className="w-5 h-5 text-[#080B12] stroke-[2.5]" />
            </div>
            <div>
              <div className="font-heading font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
                FITAI
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                  AI PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Personalized Fitness Conditioning
              </p>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <button
              id="landing-header-login-btn"
              onClick={onNavigateToLogin}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              Log In
            </button>
            <button
              id="landing-header-signup-btn"
              onClick={onNavigateToSignUp}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#080B12] bg-[#22C55E] hover:bg-[#1ea750] shadow-lg shadow-[#22C55E]/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-16 sm:pb-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-emerald-400 mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Next-Gen Personalized AI Training Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-[1.15] mb-6">
              Transform Your Fitness with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] via-[#34D399] to-[#06B6D4]">
                Precision AI Plans
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed mb-8 sm:mb-10 font-normal">
              Tailored workout splits, exercise sets & reps, structured rest periods, and nutritional recommendations designed specifically around your exact body metrics, equipment, and fitness ambitions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-12">
              <button
                id="landing-hero-get-started-btn"
                onClick={onNavigateToSignUp}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base text-[#080B12] bg-[#22C55E] hover:bg-[#1ea750] shadow-xl shadow-[#22C55E]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Your Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="landing-hero-login-btn"
                onClick={onNavigateToLogin}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-slate-200 bg-white/5 hover:bg-white/10 border border-white/15 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In to Existing Plan</span>
              </button>
            </div>

            {/* Value Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
                  <Activity className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Custom Splits</span>
                </div>
                <p className="text-[11px] text-slate-400">Full body, push-pull-legs, or upper-lower routines</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
                  <Target className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Targeted Goals</span>
                </div>
                <p className="text-[11px] text-slate-400">Fat loss, muscle gain, endurance, or strength</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
                  <Utensils className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Nutrition Guide</span>
                </div>
                <p className="text-[11px] text-slate-400">Meal suggestions & hydration calculations</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Cloud Synced</span>
                </div>
                <p className="text-[11px] text-slate-400">Live webhook synchronization & persistence</p>
              </div>
            </div>
          </div>

          {/* Interactive Feature Showcase Section */}
          <div className="mt-16 sm:mt-20 max-w-5xl mx-auto">
            <div className="p-6 sm:p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#22C55E]">
                    Preview Sample Plan
                  </span>
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-white mt-0.5">
                    Dynamic AI Fitness Conditioning Architecture
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                    3-Day Hypertrophy
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold">
                    Intermediate
                  </span>
                </div>
              </div>

              {/* Sample Routine Rows */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between text-xs font-bold text-[#22C55E] mb-2">
                    <span>DAY 1 • PUSH FOCUS</span>
                    <span className="text-[10px] text-slate-400 font-normal">45 Mins</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center justify-between">
                      <span>Barbell Bench Press</span>
                      <span className="font-mono text-[11px] text-slate-400">3 x 8-10</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Incline DB Press</span>
                      <span className="font-mono text-[11px] text-slate-400">3 x 10-12</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Overhead Triceps Ext</span>
                      <span className="font-mono text-[11px] text-slate-400">3 x 12-15</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between text-xs font-bold text-[#06B6D4] mb-2">
                    <span>DAY 2 • PULL FOCUS</span>
                    <span className="text-[10px] text-slate-400 font-normal">45 Mins</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center justify-between">
                      <span>Bent-Over Barbell Rows</span>
                      <span className="font-mono text-[11px] text-slate-400">3 x 8-10</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Lat Pulldowns</span>
                      <span className="font-mono text-[11px] text-slate-400">3 x 10-12</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Dumbbell Bicep Curls</span>
                      <span className="font-mono text-[11px] text-slate-400">3 x 12-15</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between text-xs font-bold text-[#A855F7] mb-2">
                    <span>DAY 3 • LEGS & CORE</span>
                    <span className="text-[10px] text-slate-400 font-normal">50 Mins</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center justify-between">
                      <span>Barbell Back Squats</span>
                      <span className="font-mono text-[11px] text-slate-400">4 x 8-10</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Romanian Deadlifts</span>
                      <span className="font-mono text-[11px] text-slate-400">3 x 10-12</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Plank & Core Holds</span>
                      <span className="font-mono text-[11px] text-slate-400">3 x 45s</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Quick Feature Tagline */}
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  <span>Customized dynamically for your selected equipment and experience level</span>
                </div>
                <button
                  id="landing-preview-start-btn"
                  onClick={onNavigateToSignUp}
                  className="text-xs font-bold text-[#22C55E] hover:text-[#34D399] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Build your customized routine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 3-Step Walkthrough Section */}
          <div className="mt-20 max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3">
              How FITAI Works in 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-10">
              Zero complicated questionnaires. Just tailored fitness programming in seconds.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center font-bold text-sm mb-4">
                  1
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">Enter Your Profile</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide your age, validated height, weight, preferred workout days, and available gym or home equipment.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4] flex items-center justify-center font-bold text-sm mb-4">
                  2
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">AI Engine Generates Split</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our fitness algorithm synthesizes an optimal routine with target exercises, sets, reps, and hydration goals.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-[#A855F7]/15 border border-[#A855F7]/30 text-[#A855F7] flex items-center justify-center font-bold text-sm mb-4">
                  3
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">Execute & Synchronize</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Access your routine anytime on your personalized dashboard and synchronize seamlessly with Google Sheets.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Call to Action Card */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-cyan-950/40 border border-[#22C55E]/30 text-center relative overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="max-w-xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-3">
                  Ready to Start Your Transformation?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-6">
                  Join athletes utilizing AI-driven workouts to maximize strength, condition endurance, and achieve real results.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    id="landing-cta-signup-btn"
                    onClick={onNavigateToSignUp}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-[#080B12] bg-[#22C55E] hover:bg-[#1ea750] shadow-lg shadow-[#22C55E]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    id="landing-cta-login-btn"
                    onClick={onNavigateToLogin}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <span>Sign In to Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-xl py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm text-slate-200">FITAI</span>
            <span>— Personalized AI Fitness Conditioning Engine</span>
          </div>
          <div>All workouts and recommendations generated dynamically for athletes.</div>
        </div>
      </footer>
    </div>
  );
};
