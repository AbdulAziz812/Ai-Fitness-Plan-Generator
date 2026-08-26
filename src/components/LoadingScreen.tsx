import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Dumbbell, CheckCircle2, Loader2, BrainCircuit } from 'lucide-react';

interface LoadingScreenProps {
  userName?: string;
  goal?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ userName, goal }) => {
  const steps = [
    { label: 'Analyzing your fitness goal', desc: `Calibrating training volume for ${goal || 'your objective'}` },
    { label: 'Checking your fitness level', desc: 'Setting progressive load and recovery curves' },
    { label: 'Planning your workout schedule', desc: 'Structuring split days and rest intervals' },
    { label: 'Creating personalized workouts', desc: 'Selecting biomechanically matched exercises' },
    { label: 'Finalizing your fitness plan', desc: 'Synthesizing coaching and nutrition guidelines' }
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div id="ai-loading-screen" className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white/[0.05] backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#06B6D4]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center">
          {/* Animated AI Icon Container */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#22C55E]/20 to-[#06B6D4]/20 border border-white/20 backdrop-blur-xl flex items-center justify-center relative mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute inset-0 rounded-3xl border-2 border-dashed border-[#22C55E]/40"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <BrainCircuit className="w-10 h-10 text-[#22C55E]" />
            </motion.div>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight mb-2">
            Creating Your Personalized Plan
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-8">
            Our AI is analyzing your fitness information and building your personalized plan
            {userName ? ` for ${userName}` : ''}.
          </p>

          {/* Sequential Dynamic Steps */}
          <div className="space-y-3 text-left">
            {steps.map((step, idx) => {
              const isDone = idx < activeStep;
              const isCurrent = idx === activeStep;
              const isPending = idx > activeStep;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-start gap-3.5 p-3.5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
                    isCurrent
                      ? 'bg-white/10 border-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.15)] ring-1 ring-[#22C55E]/30'
                      : isDone
                      ? 'bg-white/[0.04] border-white/10'
                      : 'bg-transparent border-transparent opacity-30'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-[#06B6D4] animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-slate-400">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-semibold leading-tight ${
                        isCurrent
                          ? 'text-slate-100'
                          : isDone
                          ? 'text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </div>
                    {isCurrent && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-slate-300 mt-0.5"
                      >
                        {step.desc}
                      </motion.div>
                    )}
                  </div>

                  {isCurrent && (
                    <span className="text-[11px] font-semibold text-[#22C55E] shrink-0 animate-pulse">
                      In progress...
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Dumbbell className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>FITAI Scientific Conditioning Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
