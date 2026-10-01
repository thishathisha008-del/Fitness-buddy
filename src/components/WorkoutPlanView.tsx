import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Dumbbell,
  Play,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Flame,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  HeartPulse,
} from 'lucide-react';
import { WorkoutPlan, WorkoutDay, Exercise, UserProfile } from '../types/fitness';
import { DynamicPlanModifier } from './DynamicPlanModifier';
import { ExerciseSubstitutionModal } from './ExerciseSubstitutionModal';

interface WorkoutPlanViewProps {
  plan: WorkoutPlan;
  profile: UserProfile;
  onPlanUpdated: (updated: WorkoutPlan) => void;
  onStartSession: (day: WorkoutDay) => void;
  onOpenAssessment: () => void;
}

export const WorkoutPlanView: React.FC<WorkoutPlanViewProps> = ({
  plan,
  profile,
  onPlanUpdated,
  onStartSession,
  onOpenAssessment,
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [substitutingExercise, setSubstitutingExercise] = useState<Exercise | null>(null);

  const selectedDay = plan.schedule.find((d) => d.dayNumber === selectedDayNumber) || plan.schedule[0];

  const handleApplySubstitution = (
    dayNum: number,
    oldExerciseId: string,
    newExercise: Exercise,
  ) => {
    const updatedSchedule = plan.schedule.map((day) => {
      if (day.dayNumber === dayNum) {
        return {
          ...day,
          exercises: day.exercises.map((ex) => (ex.id === oldExerciseId ? newExercise : ex)),
        };
      }
      return day;
    });

    onPlanUpdated({
      ...plan,
      schedule: updatedSchedule,
      modifiedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Plan Header Card */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-emerald-400">{plan.focus}</span>
              <span aria-hidden="true">·</span>
              <span>{profile.goal.replace('_', ' ').toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span>{plan.schedule.filter((d) => !d.isRestDay).length} Active Sessions / Week</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
              {plan.planTitle}
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">{plan.summary}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsExplanationOpen(!isExplanationOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
            >
              <Info className="w-4 h-4 text-emerald-400" />
              <span>AI Plan Rationale</span>
              {isExplanationOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onOpenAssessment}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Collapsible AI Plan Explanation */}
        {isExplanationOpen && (
          <div className="mt-5 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Why This Routine Was Chosen For You</span>
              </div>
              <p className="text-slate-400 leading-relaxed">{plan.rationale}</p>
            </div>
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Expected Progression & Overload</span>
              </div>
              <p className="text-slate-400 leading-relaxed">{plan.expectedProgression}</p>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Plan Modifier Bar */}
      <DynamicPlanModifier
        currentPlan={plan}
        profile={profile}
        onPlanUpdated={onPlanUpdated}
      />

      {/* 7-Day Schedule Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Weekly Training Schedule</span>
          </h2>
          <span className="text-xs text-slate-400">Select a day to view routine or start tracking</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {plan.schedule.map((day) => {
            const isSelected = day.dayNumber === selectedDayNumber;
            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setSelectedDayNumber(day.dayNumber)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/60 shadow-md shadow-emerald-950/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-200">Day {day.dayNumber}</span>
                  {day.isRestDay ? (
                    <span className="text-[10px] text-teal-400/80 font-medium">Rest</span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {day.estimatedDuration}m
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-white truncate mb-1">
                  {day.dayName.replace(/^Day \d+:\s*/, '')}
                </p>
                <div className="text-[10px] text-slate-400 truncate">
                  {day.isRestDay ? 'Active recovery' : day.focusMuscles.join(', ')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Routine View */}
      {selectedDay && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
          {/* Day Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Day {selectedDay.dayNumber} Routine</span>
                <span aria-hidden="true">·</span>
                <span>{selectedDay.isRestDay ? 'Rest & Recovery' : `${selectedDay.exercises.length} Exercises`}</span>
                <span aria-hidden="true">·</span>
                <span>~{selectedDay.estimatedDuration} minutes</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">{selectedDay.dayName}</h3>
            </div>

            {!selectedDay.isRestDay && (
              <button
                type="button"
                onClick={() => onStartSession(selectedDay)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all shrink-0"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Workout Session</span>
              </button>
            )}
          </div>

          {/* If Rest Day */}
          {selectedDay.isRestDay ? (
            <div className="p-8 text-center space-y-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
              <HeartPulse className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Active Recovery Day</h4>
              <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                Muscle tissue repairs and grows during rest periods. Focus on hydration (2.5L+), 8 hours of sleep, light walking (20-30 mins), and gentle mobility work to flush metabolic byproducts.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Warm-up Section */}
              {selectedDay.warmup && selectedDay.warmup.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dynamic Warm-up & Joint Activation</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedDay.warmup.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-200">{w.name}</span>
                          <span className="text-[11px] font-mono text-amber-400">{w.durationMinutes} min</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{w.cues}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercises List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Main Workout Exercises ({selectedDay.exercises.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Tap substitute to replace an exercise</span>
                </div>

                <div className="space-y-3">
                  {selectedDay.exercises.map((ex, index) => (
                    <div
                      key={ex.id || index}
                      className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700/80 transition-all space-y-3"
                    >
                      {/* Exercise Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-emerald-400">
                              0{index + 1}.
                            </span>
                            <h5 className="text-sm font-bold text-white">{ex.name}</h5>
                            <span className="text-[10px] text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded-md">
                              {ex.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>Target: {ex.targetMuscle}</span>
                            <span aria-hidden="true">·</span>
                            <span>Equipment: {ex.equipment}</span>
                          </div>
                        </div>

                        {/* Sets / Reps / Rest Stats */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                            <span className="text-white font-bold">{ex.sets} sets</span>
                            <span className="text-slate-600">×</span>
                            <span className="text-emerald-400 font-bold">{ex.reps}</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-400">{ex.restSeconds}s rest</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSubstitutingExercise(ex)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 hover:text-emerald-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors shrink-0"
                            title="Substitute with another exercise"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span className="hidden sm:inline">Substitute</span>
                          </button>
                        </div>
                      </div>

                      {/* Instructions and Form Tips */}
                      <div className="text-xs space-y-1.5 pt-2 border-t border-slate-900">
                        <p className="text-slate-300 leading-relaxed">
                          <span className="font-semibold text-slate-200">Execution: </span>
                          {ex.instructions}
                        </p>
                        {ex.formTips && (
                          <p className="text-amber-300/90 leading-relaxed">
                            <span className="font-semibold text-amber-400">Key Cue: </span>
                            {ex.formTips}
                          </p>
                        )}
                        {ex.rationale && (
                          <p className="text-slate-400 italic">
                            <span className="text-slate-500 not-italic">AI Rationale: </span>
                            {ex.rationale}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cool-down Section */}
              {selectedDay.cooldown && selectedDay.cooldown.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
                    <span>Cool-down & Flexibility Protocol</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedDay.cooldown.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-200">{c.name}</span>
                          <span className="text-[11px] font-mono text-teal-400">{c.durationMinutes} min</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{c.cues}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Substitution Modal */}
      {substitutingExercise && (
        <ExerciseSubstitutionModal
          isOpen={!!substitutingExercise}
          onClose={() => setSubstitutingExercise(null)}
          targetExercise={substitutingExercise}
          dayNumber={selectedDayNumber}
          onApplySubstitution={handleApplySubstitution}
          availableEquipment={profile.equipment}
        />
      )}
    </div>
  );
};
