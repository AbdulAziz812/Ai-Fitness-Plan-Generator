import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Dumbbell, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';

interface SignUpPageProps {
  onNavigateToLogin: () => void;
  onSuccessRedirect: () => void;
  onNavigateToLanding?: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onNavigateToLogin,
  onSuccessRedirect,
  onNavigateToLanding,
}) => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);

      const webhookUrl =
        'https://ai-skool-n8n-57b1748669d9.herokuapp.com/webhook/451bf6cd-0025-49d8-b927-18a75ec8ae36';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'account_created',
          name: name.trim(),
          email: email.trim(),
          password: password,
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          source: 'create_account_button',
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Email already exists.');
      }

      // Also persist registration name locally so session and login display full name
      try {
        localStorage.setItem(`user_name_${email.trim().toLowerCase()}`, name.trim());
        localStorage.setItem('user_email', email.trim());
        await api.signup(name.trim(), email.trim(), password, confirmPassword);
      } catch (signupSyncErr) {
        console.warn('Signup local sync status:', signupSyncErr);
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during account creation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const featureHighlights = [
    { title: 'Dynamic AI Architecture', desc: 'Workouts constructed strictly to your goals and equipment' },
    { title: 'Science-Backed Periodization', desc: 'Progressive overload, recovery formulas, and nutrition guidance' },
    { title: 'Instant PDF Generation', desc: 'Export complete multi-day training sheets in one click' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Section: Branding & Visual */}
        <div className="lg:col-span-5 bg-gradient-to-br from-white/[0.06] via-transparent to-black/20 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden backdrop-blur-xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* FITAI Logo */}
            <div 
              onClick={onNavigateToLanding}
              className={`flex items-center gap-3 mb-10 ${onNavigateToLanding ? 'cursor-pointer group' : ''}`}
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#22C55E]/20 group-hover:scale-105 transition-transform">
                <Dumbbell className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-heading text-2xl font-bold tracking-tight text-slate-100">
                  FIT<span className="text-[#22C55E]">AI</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  AI Fitness Plan Generator
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-10">
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight leading-tight">
                Build Smarter.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-[#06B6D4]">
                  Train Better.
                </span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Create your account and start building a personalized fitness journey.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4">
              {featureHighlights.map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center mt-0.5 shrink-0 backdrop-blur-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{feat.title}</h4>
                    <p className="text-[11px] text-slate-400">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-10 pt-6 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Powered by Gemini 3.7 Intelligence</span>
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          </div>
        </div>

        {/* Right Section: Sign Up Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white/[0.02]">
          <div className="max-w-md w-full mx-auto">
            {isSuccess ? (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center mx-auto shadow-xl shadow-[#22C55E]/10 backdrop-blur-xl">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-heading text-2xl font-bold text-slate-100">
                    Registration Submitted!
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Your account details have been forwarded to your n8n workflow for Google Sheets storage.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2 backdrop-blur-md">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span className="font-semibold">Name:</span>
                    <span className="text-slate-200 font-medium">{name}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span className="font-semibold">Email:</span>
                    <span className="text-slate-200 font-medium">{email}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span className="font-semibold">Destination:</span>
                    <span className="text-[#22C55E] font-medium">n8n Google Sheets Workflow</span>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    id="signup-success-goto-login-btn"
                    onClick={onNavigateToLogin}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-sm transition-all shadow-xl shadow-[#22C55E]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Register another account
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="font-heading text-2xl font-bold text-slate-100 tracking-tight mb-2">
                    Create Account
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Enter your credentials to begin generating your custom workout plans.
                  </p>
                </div>

                {error && (
                  <div
                    id="signup-error-box"
                    className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs leading-relaxed backdrop-blur-md"
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-name">
                      Full Name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition-colors backdrop-blur-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-email">
                      Email Address
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition-colors backdrop-blur-md"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-password">
                        Password
                      </label>
                      <input
                        id="signup-password"
                        type="password"
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition-colors backdrop-blur-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-confirm-password">
                        Confirm Password
                      </label>
                      <input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition-colors backdrop-blur-md"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      id="signup-submit-btn"
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-sm transition-all shadow-xl shadow-[#22C55E]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                    >
                      {isLoading ? (
                        <span className="inline-flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          Submitting Account...
                        </span>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-white/10">
                  <p className="text-xs text-slate-400">
                    Already have an account?{' '}
                    <button
                      id="signup-goto-login-btn"
                      onClick={onNavigateToLogin}
                      className="font-semibold text-[#22C55E] hover:underline cursor-pointer ml-1"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
