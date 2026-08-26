import React, { useState } from 'react';
import { WorkoutDay } from '../types';
import { ChevronDown, ChevronUp, Flame, Wind, Info, Target, Sparkles, Dumbbell } from 'lucide-react';

interface WorkoutDayCardProps {
  workoutDay: WorkoutDay;
  index: number;
}

export const WorkoutDayCard: React.FC<WorkoutDayCardProps> = ({ workoutDay, index }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const exerciseList = Array.isArray(workoutDay.exercises)
    ? workoutDay.exercises
    : typeof (workoutDay.exercises as any) === 'string'
    ? (() => {
        try {
          const parsed = JSON.parse(workoutDay.exercises as any);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })()
    : [];

  return (
    <div
      id={`workout-day-card-${index}`}
      className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-black/20 transition-all"
    >
      {/* Header Banner */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors border-b border-white/10"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E]/20 to-[#06B6D4]/20 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
            D{index + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#22C55E] uppercase tracking-wider">
                {workoutDay.day}
              </span>
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-100">
              {workoutDay.title}
            </h3>
            {workoutDay.focus && (
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Target className="w-3 h-3 text-[#06B6D4]" />
                <span>Focus: {workoutDay.focus}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10 backdrop-blur-md">
            <Dumbbell className="w-3 h-3 text-[#22C55E]" />
            {exerciseList.length} Exercises
          </span>
          <button
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
            aria-label="Toggle workout details"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Dynamic Warmup if available */}
          {workoutDay.warmup && (
            <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 backdrop-blur-md flex items-start gap-3">
              <Flame className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider block mb-0.5">
                  Day Warm-Up Protocol
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{workoutDay.warmup}</p>
              </div>
            </div>
          )}

          {/* Exercise Table / List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              <span>Exercise & Instructions</span>
              <div className="flex items-center gap-6 sm:gap-10">
                <span className="w-12 text-center">Sets</span>
                <span className="w-14 text-center">Reps</span>
                <span className="w-16 text-center">Rest</span>
              </div>
            </div>

            {exerciseList.map((exercise, exIdx) => (
              <div
                key={exIdx}
                id={`exercise-row-${index}-${exIdx}`}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                      {exIdx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-100">
                        {exercise.name}
                      </h4>
                      {exercise.target_muscles && (
                        <div className="text-[11px] text-[#06B6D4] mt-0.5 font-medium">
                          Target: {exercise.target_muscles}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges for Sets / Reps / Rest */}
                  <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center shrink-0">
                    <div className="flex flex-col items-center px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md min-w-[52px]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Sets</span>
                      <span className="text-xs font-bold text-slate-100">{exercise.sets}</span>
                    </div>

                    <div className="flex flex-col items-center px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md min-w-[56px]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Reps</span>
                      <span className="text-xs font-bold text-[#22C55E]">{exercise.reps}</span>
                    </div>

                    <div className="flex flex-col items-center px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md min-w-[60px]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Rest</span>
                      <span className="text-xs font-semibold text-slate-300">{exercise.rest}</span>
                    </div>
                  </div>
                </div>

                {/* Instructions & Form Tips */}
                {(exercise.instructions || exercise.tips) && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-400">
                    {exercise.instructions && (
                      <p className="leading-relaxed text-slate-300">
                        <span className="text-slate-400 font-medium mr-1.5">Execution:</span>
                        {exercise.instructions}
                      </p>
                    )}
                    {exercise.tips && (
                      <p className="flex items-start gap-1.5 text-[#22C55E] bg-[#22C55E]/5 p-2 rounded-xl border border-[#22C55E]/15 backdrop-blur-sm">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#22C55E]" />
                        <span>
                          <strong className="text-[#22C55E]">Coaching Cue:</strong> {exercise.tips}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Day Cooldown if available */}
          {workoutDay.cooldown && (
            <div className="p-4 rounded-2xl bg-cyan-500/[0.04] border border-cyan-500/20 backdrop-blur-md flex items-start gap-3">
              <Wind className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-[#06B6D4] uppercase tracking-wider block mb-0.5">
                  Day Cool-Down & Mobility
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{workoutDay.cooldown}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
