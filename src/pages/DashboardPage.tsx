import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FitnessProfile, FitnessPlan, PageView } from '../types';
import { api } from '../services/api';
import { generatePlanPDF } from '../utils/pdfGenerator';
import {
  Target,
  Award,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Download,
  Edit3,
  PlusCircle,
  LogOut,
  Dumbbell,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
  FileText,
  Utensils,
  User as UserIcon,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageView) => void;
  onEditDetails: () => void;
  onGenerateNew: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onEditDetails,
  onGenerateNew,
}) => {
  const { user, plan, logout } = useAuth();

  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [currentPlan, setCurrentPlan] = useState<FitnessPlan | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
  try {
    setIsLoadingData(true);
    setErrorMsg(null);

    console.log('1. Loading dashboard...');

    const profileRes = await api.getFitnessProfile();
    console.log('2. Profile:', profileRes);

    const planRes = await api.getCurrentPlan();
    console.log('3. Current Plan:', planRes);

    setProfile(profileRes.profile);
    setCurrentPlan(plan || planRes.plan);

  } catch (err: any) {
    console.error('DASHBOARD ERROR:', err);
    setErrorMsg('Could not load latest fitness data. Please refresh.');
  } finally {
    setIsLoadingData(false);
  }
};

  const getDisplayName = () => {
    // 1. Check local registration record for this email
    if (user?.email) {
      const storedRegName = localStorage.getItem(`user_name_${user.email.toLowerCase()}`);
      if (storedRegName && storedRegName.trim()) {
        return storedRegName.trim();
      }
    }
    // 2. Check user object name
    if (user?.name && user.name.trim() && user.name.trim() !== 'Athlete' && !user.name.includes('@')) {
      return user.name.trim();
    }
    // 3. Check profile name
    if (profile?.name && profile.name.trim()) {
      return profile.name.trim();
    }
    return user?.name || 'Athlete';
  };

  const displayName = getDisplayName();

  const handleDownloadPDF = async () => {
    if (!currentPlan) return;
    try {
      setPdfGenerating(true);
      generatePlanPDF(currentPlan, displayName || 'Member');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF error:', err);
      setErrorMsg('Unable to generate the PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const hasProfileInfo = !!(profile && profile.goal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {downloadSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#22C55E] text-[#080B12] font-semibold text-xs flex items-center gap-2 shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>PDF Downloaded successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-xs font-bold px-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 backdrop-blur-md mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Athletic Intelligence</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-bold text-slate-100 tracking-tight">
              Welcome back,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-[#06B6D4]">
                {displayName}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Your personalized fitness journey is ready to continue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dashboard-generate-plan-hero-btn"
              onClick={onGenerateNew}
              className="py-3.5 px-6 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-[#22C55E]/20 flex items-center gap-2 cursor-pointer group"
            >
              <Dumbbell className="w-4 h-4" />
              <span>{currentPlan ? 'Generate New Plan' : 'Generate Fitness Plan'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {currentPlan && (
              <button
                id="dashboard-view-plan-hero-btn"
                onClick={() => onNavigate('my-plan')}
                className="py-3.5 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-100 font-semibold text-sm transition-colors border border-white/15 backdrop-blur-md flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#06B6D4]" />
                <span>View Current Plan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fitness Summary Cards (4 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-slate-100">
            Fitness Profile Summary
          </h2>
          {hasProfileInfo && (
            <button
              id="dashboard-edit-profile-link"
              onClick={onEditDetails}
              className="text-xs text-[#22C55E] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              Edit Information
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Current Goal */}
          <div
            id="summary-card-goal"
            className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all shadow-lg shadow-black/10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">Fitness Goal</span>
              <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center justify-center backdrop-blur-md">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              {profile?.goal ? (
                <div className="font-heading text-lg font-bold text-slate-100">
                  {profile.goal}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Not provided — Complete your fitness profile
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Fitness Level */}
          <div
            id="summary-card-level"
            className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all shadow-lg shadow-black/10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">Experience Level</span>
              <div className="w-8 h-8 rounded-xl bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 flex items-center justify-center backdrop-blur-md">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              {profile?.level ? (
                <div className="font-heading text-lg font-bold text-slate-100">
                  {profile.level}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Not provided
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Body Metrics (Age, Height, Weight) */}
          <div
            id="summary-card-biometrics"
            className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all shadow-lg shadow-black/10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">Body Metrics</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center backdrop-blur-md">
                <UserIcon className="w-4 h-4" />
              </div>
            </div>
            <div>
              {profile?.age || profile?.height || profile?.weight ? (
                <div className="space-y-0.5">
                  <div className="font-heading text-sm font-bold text-slate-100">
                    {profile.age ? `${profile.age} yrs` : 'Age: N/A'}
                    {profile.height ? ` • ${profile.height}` : ''}
                    {profile.weight ? ` • ${profile.weight}` : ''}
                  </div>
                  <div className="text-xs text-slate-400">Personalized biometric baseline</div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Not provided
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Workout Schedule & Duration */}
          <div
            id="summary-card-schedule"
            className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all shadow-lg shadow-black/10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">Workout Days & Time</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center backdrop-blur-md">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              {profile?.schedule ? (
                <div>
                  <div className="font-heading text-lg font-bold text-slate-100">
                    {profile.schedule}
                  </div>
                  {profile.workout_duration && (
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#06B6D4]" />
                      <span>{profile.workout_duration} / session</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Not provided
                </div>
              )}
            </div>
          </div>

          {/* Card 5: Equipment */}
          <div
            id="summary-card-equipment"
            className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all shadow-lg shadow-black/10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">Equipment</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-[#F59E0B] border border-amber-500/30 flex items-center justify-center backdrop-blur-md">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              {profile?.equipment && profile.equipment.length > 0 ? (
                <div className="text-xs text-slate-300 font-medium leading-snug">
                  {profile.equipment.join(', ')}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Not provided
                </div>
              )}
            </div>
          </div>

          {/* Card 6: Food Preference */}
          <div
            id="summary-card-food-pref"
            className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all shadow-lg shadow-black/10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">Diet & Food Style</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center backdrop-blur-md">
                <Utensils className="w-4 h-4" />
              </div>
            </div>
            <div>
              {profile?.food_preference ? (
                <div className="font-heading text-sm font-bold text-slate-100">
                  {profile.food_preference}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  High Protein / Balanced
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Plan Section */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {currentPlan ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-semibold text-[#22C55E] uppercase tracking-wider block mb-1">
                  Active Program
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-100">
                  {currentPlan.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-[#22C55E]" />
                    {currentPlan.goal}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#06B6D4]" />
                    {currentPlan.level}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {currentPlan.schedule} ({currentPlan.workout_duration})
                  </span>
                  <span>•</span>
                  <span>Created: {new Date(currentPlan.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  id="dashboard-download-pdf-btn"
                  onClick={handleDownloadPDF}
                  disabled={pdfGenerating}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 border border-white/15 backdrop-blur-md flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-[#22C55E]" />
                  <span>{pdfGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>

                <button
                  id="dashboard-view-plan-btn"
                  onClick={() => onNavigate('my-plan')}
                  className="py-2.5 px-4 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-xs font-bold text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-[#22C55E]/20"
                >
                  <span>View Current Plan</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Preview of Workout Days */}
            {(() => {
              const previewWorkoutDays = currentPlan && Array.isArray(currentPlan.workout_plan)
                ? currentPlan.workout_plan
                : currentPlan && typeof (currentPlan.workout_plan as any) === 'string'
                ? (() => {
                    try {
                      const parsed = JSON.parse(currentPlan.workout_plan as any);
                      return Array.isArray(parsed) ? parsed : [];
                    } catch {
                      return [];
                    }
                  })()
                : [];

              return (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Weekly Split Preview ({previewWorkoutDays.length} Workout Days)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {previewWorkoutDays.map((day, idx) => (
                      <div
                        key={idx}
                        onClick={() => onNavigate('my-plan')}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-md transition-all cursor-pointer flex flex-col justify-between shadow-sm"
                      >
                        <div>
                          <span className="text-[11px] font-semibold text-[#22C55E]">{day.day}</span>
                          <h4 className="font-bold text-sm text-slate-100 mt-0.5">{day.title}</h4>
                          {day.focus && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">Focus: {day.focus}</p>
                          )}
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{day.exercises?.length || 0} exercises</span>
                          <span className="text-[#06B6D4] hover:underline font-medium">View exercises →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          /* Empty State: No Fitness Plan Yet */
          <div id="dashboard-no-plan-state" className="text-center py-10 px-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#22C55E]/20 to-[#06B6D4]/20 border border-white/15 backdrop-blur-xl flex items-center justify-center text-[#22C55E] mx-auto mb-4 shadow-[0_0_25px_rgba(34,197,94,0.15)]">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-slate-100 mb-2">
              No Fitness Plan Yet
            </h3>
            <p className="text-sm text-slate-300 mb-6">
              Enter your fitness information to generate your personalized plan.
            </p>
            <button
              id="dashboard-empty-generate-btn"
              onClick={onGenerateNew}
              className="py-3.5 px-6 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-[#22C55E]/20 inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate My Plan</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      <div>
        <h2 className="font-heading text-lg font-bold text-slate-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Action 1: View Current Plan */}
          <button
            id="quick-action-view-plan"
            onClick={() => {
              if (currentPlan) {
                onNavigate('my-plan');
              } else {
                onGenerateNew();
              }
            }}
            className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all text-left flex flex-col justify-between group cursor-pointer shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform backdrop-blur-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">View Current Plan</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Explore active program</div>
            </div>
          </button>

          {/* Action 2: Download PDF */}
          <button
            id="quick-action-download-pdf"
            onClick={handleDownloadPDF}
            disabled={!currentPlan || pdfGenerating}
            className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all text-left flex flex-col justify-between group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform backdrop-blur-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">Download PDF</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Export printable routine</div>
            </div>
          </button>

          {/* Action 3: Edit Details */}
          <button
            id="quick-action-edit-details"
            onClick={onEditDetails}
            className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all text-left flex flex-col justify-between group cursor-pointer shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-[#F59E0B] border border-amber-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform backdrop-blur-md">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">Edit Details</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Adjust goals & equipment</div>
            </div>
          </button>

          {/* Action 4: Generate New Plan */}
          <button
            id="quick-action-generate-new"
            onClick={onGenerateNew}
            className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all text-left flex flex-col justify-between group cursor-pointer shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform backdrop-blur-md">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">Generate New Plan</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Run AI generator</div>
            </div>
          </button>

          {/* Action 5: Logout */}
          <button
            id="quick-action-logout"
            onClick={logout}
            className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all text-left flex flex-col justify-between group cursor-pointer shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform backdrop-blur-md">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">Logout</div>
              <div className="text-[11px] text-slate-400 mt-0.5">End active session</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
