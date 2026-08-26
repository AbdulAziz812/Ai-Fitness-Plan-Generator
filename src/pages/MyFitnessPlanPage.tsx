import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FitnessPlan, PageView } from '../types';
import { api } from '../services/api';
import { generatePlanPDF } from '../utils/pdfGenerator';
import { WorkoutDayCard } from '../components/WorkoutDayCard';
import { PlanRecommendations } from '../components/PlanRecommendations';
import {
  Download,
  Edit3,
  PlusCircle,
  Calendar,
  Award,
  Target,
  Clock,
  Layers,
  Sparkles,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  History,
  Trash2,
  Check,
  Utensils,
  User,
} from 'lucide-react';

interface MyFitnessPlanPageProps {
  initialPlan?: FitnessPlan | null;
  justGenerated?: boolean;
  onNavigate: (page: PageView) => void;
  onEditDetails: () => void;
  onGenerateNew: () => void;
}

export const MyFitnessPlanPage: React.FC<MyFitnessPlanPageProps> = ({
  initialPlan = null,
  justGenerated = false,
  onNavigate,
  onEditDetails,
  onGenerateNew,
}) => {
  const { user, plan: loginPlan } = useAuth();

  const [currentPlan, setCurrentPlan] = useState<FitnessPlan | null>(initialPlan);
  const [allPlans, setAllPlans] = useState<FitnessPlan[]>(initialPlan ? [initialPlan] : []);
  const [isLoading, setIsLoading] = useState(!initialPlan);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
  try {
    if (!initialPlan) {
      setIsLoading(true);
    }

    setErrorMsg(null);

    const res = await api.getFitnessPlans();

    const localPlans = res.plans || [];

    // Use the plan returned by n8n during login if local DB has no plan
    if (loginPlan && localPlans.length === 0) {
      setAllPlans([loginPlan]);
      setCurrentPlan(loginPlan);
    } else {
      setAllPlans(localPlans);

      if (!currentPlan) {
        const active =
          localPlans.find((p) => p.is_current) ||
          localPlans[0] ||
          loginPlan ||
          null;

        setCurrentPlan(active);
      }
    }
  } catch (err: any) {
    console.error('Failed to load fitness plans:', err);

    if (!currentPlan && loginPlan) {
      setCurrentPlan(loginPlan);
      setAllPlans([loginPlan]);
    } else if (!currentPlan) {
      setErrorMsg('Could not load your fitness plans. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

  const getDisplayName = () => {
    if (user?.email) {
      const storedRegName = localStorage.getItem(`user_name_${user.email.toLowerCase()}`);
      if (storedRegName && storedRegName.trim()) {
        return storedRegName.trim();
      }
    }
    if (user?.name && user.name.trim() && user.name.trim() !== 'Athlete' && !user.name.includes('@')) {
      return user.name.trim();
    }
    return user?.name || 'Member';
  };

  const handleDownloadPDF = async () => {
    if (!currentPlan) return;
    try {
      setIsDownloading(true);
      const nameForPdf = getDisplayName();
      generatePlanPDF(currentPlan, nameForPdf);
      setToastMessage('PDF downloaded successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
      setErrorMsg('Unable to generate the PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSwitchPlan = async (planId: string) => {
    try {
      await api.setCurrentPlan(planId);
      await loadPlans();
      setShowHistoryModal(false);
      setToastMessage('Active plan switched.');
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to switch plan.');
    }
  };

  const handleDeletePlan = async (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this fitness plan?')) return;

    try {
      await api.deletePlan(planId);
      await loadPlans();
      setToastMessage('Plan deleted.');
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete plan.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 flex items-center justify-center text-[#22C55E] mx-auto mb-6 shadow-2xl shadow-black/20">
          <Dumbbell className="w-10 h-10" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-slate-100 mb-2">
          No Fitness Plan Yet
        </h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto mb-8">
          Enter your fitness information to generate your personalized plan.
        </p>
        <button
          id="empty-plan-generate-btn"
          onClick={onGenerateNew}
          className="py-3.5 px-8 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-sm transition-all shadow-xl shadow-[#22C55E]/20 inline-flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate My Plan</span>
        </button>
      </div>
    );
  }

  // Safe fallbacks in case properties are stored as JSON strings or undefined
  const workoutDays = Array.isArray(currentPlan.workout_plan)
    ? currentPlan.workout_plan
    : typeof (currentPlan.workout_plan as any) === 'string'
    ? (() => {
        try {
          const parsed = JSON.parse(currentPlan.workout_plan as any);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })()
    : [];

  const equipmentList: string[] = Array.isArray(currentPlan.equipment)
    ? currentPlan.equipment
    : typeof (currentPlan.equipment as any) === 'string'
    ? (() => {
        try {
          const parsed = JSON.parse(currentPlan.equipment as any);
          return Array.isArray(parsed) ? parsed : [currentPlan.equipment as any];
        } catch {
          return [currentPlan.equipment as any];
        }
      })()
    : [];

  const safeRecommendations = currentPlan.recommendations && typeof currentPlan.recommendations === 'object'
    ? currentPlan.recommendations
    : {
        warmup: '5-7 minutes dynamic warm-up movements.',
        cooldown: '5-10 minutes full body static stretches.',
        recovery: '7-9 hours of restful sleep nightly.',
        progression: 'Increase weight or reps gradually each week.',
        nutrition: 'Balanced macronutrients with high dietary protein.'
      };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#22C55E] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-xs font-bold px-2 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Plan Generated Celebration & Quick PDF Download Banner */}
      {!bannerDismissed && (
        <div
          id="plan-download-callout-banner"
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#22C55E]/20 via-[#06B6D4]/15 to-[#22C55E]/20 border border-[#22C55E]/40 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
        >
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#22C55E] text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-lg shadow-[#22C55E]/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-100">
                  Your Personalized Fitness Plan is Ready!
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                You can review your daily workout routines and nutrition recommendations below, or download the full plan as a PDF report.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto relative z-10">
            <button
              id="banner-download-pdf-btn"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-xl shadow-[#22C55E]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generating PDF...' : 'Download Plan (PDF)'}</span>
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
              title="Dismiss announcement"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header & Plan Actions Section */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#22C55E]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#06B6D4]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 backdrop-blur-md uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Active Plan
              </span>
              {allPlans.length > 1 && (
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="text-xs text-[#06B6D4] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <History className="w-3 h-3" />
                  <span>Switch Plan ({allPlans.length} saved)</span>
                </button>
              )}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-100">
              {currentPlan.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Your personalized AI-generated fitness program.
            </p>
          </div>

          {/* Top Actions: Download PDF, Edit Details, Generate New Plan */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="plan-download-pdf-btn"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="py-2.5 px-4 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 text-xs font-bold transition-all shadow-md shadow-[#22C55E]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Exporting PDF...' : 'Download PDF'}</span>
            </button>

            <button
              id="plan-edit-details-btn"
              onClick={onEditDetails}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-100 text-xs font-semibold border border-white/15 backdrop-blur-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[#F59E0B]" />
              <span>Edit Details</span>
            </button>

            <button
              id="plan-generate-new-btn"
              onClick={onGenerateNew}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-100 text-xs font-semibold border border-white/15 backdrop-blur-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#06B6D4]" />
              <span>Generate New Plan</span>
            </button>
          </div>
        </div>

        {/* Plan Summary Bar */}
        <div className="relative z-10 pt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Goal
            </span>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
              <span className="truncate">{currentPlan.goal}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Level
            </span>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
              <span className="truncate">{currentPlan.level}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Biometrics
            </span>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">
                {currentPlan.age ? `${currentPlan.age}y` : ''}
                {currentPlan.height ? ` • ${currentPlan.height}` : ''}
                {currentPlan.weight ? ` • ${currentPlan.weight}` : ''}
                {!currentPlan.age && !currentPlan.height && !currentPlan.weight && 'Active'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Schedule
            </span>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{currentPlan.schedule}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Diet Style
            </span>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{currentPlan.food_preference || 'Balanced / High Protein'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Equipment
            </span>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="truncate" title={equipmentList.join(', ')}>
                {equipmentList.length > 0 ? equipmentList.join(', ') : 'None'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Duration
            </span>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
              <span className="truncate">{currentPlan.workout_duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Workout Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="font-heading text-xl font-bold text-slate-100 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#22C55E]" />
            Weekly Workout Routines ({workoutDays.length} Days)
          </h2>
          <span className="text-xs text-slate-400">
            Adapts strictly to your {equipmentList.join(', ') || 'selected'} setup
          </span>
        </div>

        <div className="space-y-4">
          {workoutDays.length > 0 ? (
            workoutDays.map((day, idx) => (
              <WorkoutDayCard key={idx} workoutDay={day} index={idx} />
            ))
          ) : (
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center text-slate-400 text-sm">
              No workout routines found for this plan.
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Section */}
      <PlanRecommendations recommendations={safeRecommendations} />

      {/* Bottom Export & Next Steps Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-100">
              Take Your Workout Plan Anywhere
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Download this complete workout schedule and nutrition guide as a printable PDF report.
            </p>
          </div>
        </div>

        <button
          id="bottom-download-pdf-btn"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-sm transition-all shadow-xl shadow-[#22C55E]/20 flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Downloading PDF...' : 'Download Plan (PDF)'}</span>
        </button>
      </div>

      {/* History / Multiple Plans Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900/90 border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#22C55E]" />
                <h3 className="font-heading text-lg font-bold text-slate-100">
                  Your Generated Fitness Plans
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-slate-400 hover:text-slate-100 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1">
              {allPlans.map((plan) => {
                const isSelected = plan.id === currentPlan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => handleSwitchPlan(plan.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between backdrop-blur-md ${
                      isSelected
                        ? 'bg-white/10 border-[#22C55E] ring-1 ring-[#22C55E]/40 shadow-lg'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-100">{plan.title}</h4>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">
                            Current Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                        <span>{plan.goal}</span>
                        <span>•</span>
                        <span>{plan.level}</span>
                        <span>•</span>
                        <span>{plan.schedule}</span>
                        <span>•</span>
                        <span>{new Date(plan.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isSelected && (
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs font-semibold hover:bg-[#22C55E]/25 transition-colors cursor-pointer"
                        >
                          Select
                        </button>
                      )}
                      {allPlans.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDeletePlan(e, plan.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                          title="Delete plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
