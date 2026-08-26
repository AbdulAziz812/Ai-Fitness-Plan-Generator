import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FitnessProfile, FitnessPlan, PageView } from '../types';
import { api } from '../services/api';
import { generatePlanPDF } from '../utils/pdfGenerator';
import {
  User as UserIcon,
  Mail,
  Target,
  Award,
  Calendar,
  Layers,
  Clock,
  Edit3,
  Download,
  PlusCircle,
  FileText,
  LogOut,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Dumbbell,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: PageView) => void;
  onEditFitnessDetails: () => void;
  onGenerateNewPlan: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigate,
  onEditFitnessDetails,
  onGenerateNewPlan,
}) => {
  const { user, logout, updateUser } = useAuth();

  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [currentPlan, setCurrentPlan] = useState<FitnessPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit Account state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPassword, setEditPassword] = useState('');
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, planRes] = await Promise.all([
        api.getFitnessProfile(),
        api.getCurrentPlan(),
      ]);
      setProfile(profileRes.profile);
      setCurrentPlan(planRes.plan);
      if (user) {
        setEditName(user.name);
        setEditEmail(user.email);
      }
    } catch (err) {
      console.warn('Error loading profile page data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!currentPlan) return;
    try {
      setIsDownloading(true);
      generatePlanPDF(currentPlan, user?.name || profile?.name || 'Member');
      setToastMessage('PDF downloaded successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('PDF error:', err);
      setErrorMsg('Unable to generate the PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      setIsUpdatingAccount(true);
      const payload: { name?: string; email?: string; password?: string } = {
        name: editName.trim(),
        email: editEmail.trim(),
      };
      if (editPassword) {
        if (editPassword.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setIsUpdatingAccount(false);
          return;
        }
        payload.password = editPassword;
      }
      const res = await api.updateProfile(payload.name, payload.email, payload.password);
      updateUser(res.user);
      setShowEditModal(false);
      setToastMessage('Profile updated successfully.');
      setTimeout(() => setToastMessage(null), 2500);
      setEditPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#22C55E] text-[#080B12] font-semibold text-xs flex items-center gap-2 shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
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

      {/* Profile Header */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#22C55E]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#06B6D4]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#06B6D4] flex items-center justify-center text-2xl font-bold text-slate-950 shadow-lg shadow-[#22C55E]/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-100">
                {user?.name || 'Athlete'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="profile-edit-account-btn"
              onClick={() => setShowEditModal(true)}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-100 text-xs font-semibold border border-white/15 backdrop-blur-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[#22C55E]" />
              <span>Edit Profile</span>
            </button>

            <button
              id="profile-logout-btn"
              onClick={logout}
              className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account & Fitness Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-5 h-5 text-[#22C55E]" />
              <h2 className="font-heading text-lg font-bold text-slate-100">
                Personal Information
              </h2>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="text-xs text-[#22C55E] hover:underline font-semibold cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Full Name
              </span>
              <div className="text-sm font-semibold text-slate-100 bg-white/[0.03] px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
                {user?.name || 'Not provided'}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Email Address
              </span>
              <div className="text-sm font-semibold text-slate-100 bg-white/[0.03] px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
                {user?.email || 'Not provided'}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Member Since
              </span>
              <div className="text-xs text-slate-400 bg-white/[0.03] px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
              </div>
            </div>
          </div>
        </div>

        {/* Saved Fitness Information */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Target className="w-5 h-5 text-[#06B6D4]" />
              <h2 className="font-heading text-lg font-bold text-slate-100">
                Fitness Profile Data
              </h2>
            </div>
            <button
              id="profile-edit-fitness-details-btn"
              onClick={onEditFitnessDetails}
              className="text-xs text-[#06B6D4] hover:underline font-semibold cursor-pointer"
            >
              Edit Fitness Details
            </button>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-[#22C55E]" />
                Goal:
              </span>
              <span className="text-xs font-bold text-slate-100">
                {profile?.goal || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-[#06B6D4]" />
                Level:
              </span>
              <span className="text-xs font-bold text-slate-100">
                {profile?.level || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Schedule:
              </span>
              <span className="text-xs font-bold text-slate-100">
                {profile?.schedule || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                Workout Duration:
              </span>
              <span className="text-xs font-bold text-slate-100">
                {profile?.workout_duration || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-pink-400" />
                Equipment:
              </span>
              <span className="text-xs font-bold text-slate-100 max-w-[200px] truncate text-right">
                {profile?.equipment && profile.equipment.length > 0
                  ? profile.equipment.join(', ')
                  : 'Not provided'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Actions Panel (Section 27) */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h2 className="font-heading text-lg font-bold text-slate-100 mb-4">
          Profile & Fitness Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Action 1: Edit Profile */}
          <button
            onClick={() => setShowEditModal(true)}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-md transition-all text-left flex items-center gap-3.5 cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center justify-center shrink-0 backdrop-blur-md">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Edit Profile</h4>
              <p className="text-xs text-slate-400">Update account name and email</p>
            </div>
          </button>

          {/* Action 2: Edit Fitness Details */}
          <button
            onClick={onEditFitnessDetails}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-md transition-all text-left flex items-center gap-3.5 cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 flex items-center justify-center shrink-0 backdrop-blur-md">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Edit Fitness Details</h4>
              <p className="text-xs text-slate-400">Modify goals, level, or equipment</p>
            </div>
          </button>

          {/* Action 3: View Current Plan */}
          <button
            onClick={() => {
              if (currentPlan) onNavigate('my-plan');
              else onGenerateNewPlan();
            }}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-md transition-all text-left flex items-center gap-3.5 cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 backdrop-blur-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">View Current Plan</h4>
              <p className="text-xs text-slate-400">
                {currentPlan ? currentPlan.title : 'Generate your first plan'}
              </p>
            </div>
          </button>

          {/* Action 4: Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={!currentPlan || isDownloading}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-md transition-all text-left flex items-center gap-3.5 cursor-pointer disabled:opacity-40 shadow-sm"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-[#F59E0B] border border-amber-500/30 flex items-center justify-center shrink-0 backdrop-blur-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Download PDF</h4>
              <p className="text-xs text-slate-400">Export plan to printable document</p>
            </div>
          </button>

          {/* Action 5: Generate New Plan */}
          <button
            onClick={onGenerateNewPlan}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-md transition-all text-left flex items-center gap-3.5 cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center justify-center shrink-0 backdrop-blur-md">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Generate New Plan</h4>
              <p className="text-xs text-slate-400">Run AI generator with new specs</p>
            </div>
          </button>

          {/* Action 6: Logout */}
          <button
            onClick={logout}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/10 backdrop-blur-md transition-all text-left flex items-center gap-3.5 cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 backdrop-blur-md">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-400">Logout</h4>
              <p className="text-xs text-slate-400">End your authenticated session</p>
            </div>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h3 className="font-heading text-lg font-bold text-slate-100">
                Edit Account Information
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-xs text-slate-400 hover:text-slate-100 font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-[#22C55E] backdrop-blur-md"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-[#22C55E] backdrop-blur-md"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep unchanged"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-[#22C55E] backdrop-blur-md"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400 border border-white/10 cursor-pointer backdrop-blur-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAccount}
                  className="flex-1 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-xs font-bold text-slate-950 shadow-md shadow-[#22C55E]/20 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isUpdatingAccount ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
