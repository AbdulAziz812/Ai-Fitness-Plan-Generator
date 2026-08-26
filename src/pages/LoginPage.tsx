import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, ArrowRight, Lock, Mail, KeyRound, Sparkles, Check } from 'lucide-react';

interface LoginPageProps {
  onNavigateToSignUp: () => void;
  onSuccessRedirect: () => void;
  onNavigateToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignUp,
  onSuccessRedirect,
  onNavigateToLanding,
}) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    const webhookUrl = 'https://ai-skool-n8n-57b1748669d9.herokuapp.com/webhook/e457e6c1-eb29-4465-9c37-668771f81f42';

    try {
      setIsLoading(true);

      // Forward login event to n8n Google Sheets workflow
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'login',
            email: email.trim(),
            password: password,
            timestamp: new Date().toISOString(),
            source: 'login_button',
          }),
        });

        if (response.ok) {
          try {
            const data = await response.json();
            if (data && data.success === false) {
              throw new Error(data.message || 'Invalid email or password.');
            }
          } catch (jsonErr: any) {
            if (jsonErr.message && jsonErr.message.includes('Invalid email')) {
              throw jsonErr;
            }
            // Non-JSON or standard test webhook response is ok
          }
        }
      } catch (webhookErr: any) {
        console.warn('Webhook notification status:', webhookErr);
        if (webhookErr.message && webhookErr.message.includes('Invalid email')) {
          throw webhookErr;
        }
      }

      localStorage.setItem('user_email', email.trim());
      await login(email.trim(), password);
      onSuccessRedirect();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="w-full max-w-md bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Logo Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div 
              onClick={onNavigateToLanding}
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#22C55E]/20 mb-4 ${onNavigateToLanding ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
            >
              <Dumbbell className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              Continue your personalized fitness journey.
            </p>
          </div>

          {error && (
            <div
              id="login-error-box"
              className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs leading-relaxed backdrop-blur-md"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-email">
                Email
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition-colors backdrop-blur-md"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="login-password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#22C55E] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 transition-colors backdrop-blur-md"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-black/30 border-white/10 text-[#22C55E] focus:ring-[#22C55E] accent-[#22C55E]"
                />
                <span>Remember Me</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-sm transition-all shadow-xl shadow-[#22C55E]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                id="login-goto-signup-btn"
                onClick={onNavigateToSignUp}
                className="font-semibold text-[#22C55E] hover:underline cursor-pointer ml-1"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900/90 border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
            <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] mb-4">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-100 mb-1">
              Reset Password
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your email address to receive password reset instructions.
            </p>

            {forgotSent ? (
              <div className="p-3.5 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs flex items-center gap-2 backdrop-blur-md">
                <Check className="w-4 h-4" />
                <span>Password reset link sent to your email!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22C55E] backdrop-blur-md"
                  required
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-400 hover:text-slate-100 border border-white/10 cursor-pointer backdrop-blur-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#22C55E] text-xs font-bold text-slate-950 hover:bg-[#16A34A] cursor-pointer shadow-md shadow-[#22C55E]/20"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
