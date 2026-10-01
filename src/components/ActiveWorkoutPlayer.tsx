import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Volume2,
  VolumeX,
  Dumbbell,
  Check,
} from 'lucide-react';
import { WorkoutDay, Exercise, WorkoutSessionLog, UserProfile } from '../types/fitness';
import { playTimerBeep, estimateWorkoutCalories } from '../utils/fitnessCalculators';

interface ActiveWorkoutPlayerProps {
  day: WorkoutDay;
  planTitle: string;
  profile: UserProfile;
  onFinishWorkout: (log: WorkoutSessionLog) => void;
  onCancel: () => void;
}

interface SetLog {
  setNumber: number;
  completed: boolean;
  reps: string;
  weight: string;
}

export const ActiveWorkoutPlayer: React.FC<ActiveWorkoutPlayerProps> = ({
  day,
  planTitle,
  profile,
  onFinishWorkout,
  onCancel,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Rest Timer State
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [restTotalSeconds, setRestTotalSeconds] = useState<number>(60);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Completed workout celebration
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  // Track logs for all exercises
  // Map of exerciseId -> Array of SetLog
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, SetLog[]>>(() => {
    const initial: Record<string, SetLog[]> = {};
    day.exercises.forEach((ex) => {
      initial[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        completed: false,
        reps: ex.reps.split('-')[0] || '10',
        weight: '',
      }));
    });
    return initial;
  });

  const exercises = day.exercises;
  const currentExercise = exercises[currentExerciseIndex] || exercises[0];
  const currentSets = exerciseLogs[currentExercise?.id] || [];

  // Elapsed Workout Time Interval
  useEffect(() => {
    let interval: any = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Rest Countdown Interval
  useEffect(() => {
    let timer: any = null;
    if (isRestTimerRunning && restSecondsRemaining !== null && restSecondsRemaining > 0) {
      timer = setInterval(() => {
        setRestSecondsRemaining((prev) => {
          if (prev === null || prev <= 1) {
            if (soundEnabled) playTimerBeep(true); // Final beep
            setIsRestTimerRunning(false);
            return 0;
          }
          if (soundEnabled && prev <= 4 && prev >= 2) {
            playTimerBeep(false); // 3, 2, 1 warning beeps
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRestTimerRunning, restSecondsRemaining, soundEnabled]);

  const startRestTimer = (seconds: number) => {
    setRestTotalSeconds(seconds);
    setRestSecondsRemaining(seconds);
    setIsRestTimerRunning(true);
  };

  const handleToggleSet = (setIdx: number) => {
    if (!currentExercise) return;
    const currentExSets = [...(exerciseLogs[currentExercise.id] || [])];
    const targetSet = currentExSets[setIdx];
    const willBeCompleted = !targetSet.completed;

    targetSet.completed = willBeCompleted;
    currentExSets[setIdx] = targetSet;

    setExerciseLogs({
      ...exerciseLogs,
      [currentExercise.id]: currentExSets,
    });

    // If marked completed, start rest timer automatically!
    if (willBeCompleted) {
      startRestTimer(currentExercise.restSeconds || 60);
    }
  };

  const handleUpdateReps = (setIdx: number, val: string) => {
    if (!currentExercise) return;
    const currentExSets = [...(exerciseLogs[currentExercise.id] || [])];
    currentExSets[setIdx].reps = val;
    setExerciseLogs({ ...exerciseLogs, [currentExercise.id]: currentExSets });
  };

  const handleUpdateWeight = (setIdx: number, val: string) => {
    if (!currentExercise) return;
    const currentExSets = [...(exerciseLogs[currentExercise.id] || [])];
    currentExSets[setIdx].weight = val;
    setExerciseLogs({ ...exerciseLogs, [currentExercise.id]: currentExSets });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalCompletedSets = Object.values(exerciseLogs)
    .flat()
    .filter((s) => s.completed).length;

  const totalPossibleSets = Object.values(exerciseLogs).flat().length;
  const progressPercent = totalPossibleSets > 0 ? Math.round((totalCompletedSets / totalPossibleSets) * 100) : 0;
  const estimatedCalories = estimateWorkoutCalories(Math.max(1, Math.round(elapsedSeconds / 60)), profile.weightKg, 'moderate');

  const handleCompleteSession = () => {
    setIsSessionActive(false);
    setIsRestTimerRunning(false);

    const log: WorkoutSessionLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      planTitle,
      dayNumber: day.dayNumber,
      dayName: day.dayName,
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      estimatedCaloriesBurned: estimatedCalories,
      exercises: exercises.map((ex) => {
        const sets = exerciseLogs[ex.id] || [];
        const completed = sets.filter((s) => s.completed).length;
        const repsString = sets.map((s) => s.reps).filter(Boolean).join(', ');
        const weightString = sets.find((s) => s.weight)?.weight;
        return {
          exerciseId: ex.id,
          name: ex.name,
          targetMuscle: ex.targetMuscle,
          setsCompleted: completed,
          totalSets: ex.sets,
          repsDone: repsString,
          weightUsed: weightString ? `${weightString} kg` : undefined,
        };
      }),
      notes: sessionNotes,
    };

    onFinishWorkout(log);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Tracker Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Exit session"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[11px] font-semibold text-emerald-400 block tracking-wider uppercase">
              Live Session Tracking
            </span>
            <h2 className="text-base font-bold text-white truncate max-w-xs">{day.dayName}</h2>
          </div>
        </div>

        {/* Workout Metronomes / Stats */}
        <div className="flex items-center gap-4 text-xs font-mono w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-bold">{formatTime(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-bold">{estimatedCalories} kcal</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-950 rounded-xl border border-slate-800"
            title={soundEnabled ? 'Mute sound' : 'Enable audio timer cues'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsCompletedModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-sm shadow-emerald-500/20"
          >
            Finish Workout
          </button>
        </div>
      </div>

      {/* Progress Bar through Exercises */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Workout Progress: {totalCompletedSets} of {totalPossibleSets} sets completed</span>
          <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Exercise Navigation Dots */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {exercises.map((ex, idx) => {
          const sets = exerciseLogs[ex.id] || [];
          const isDone = sets.length > 0 && sets.every((s) => s.completed);
          const isCurrent = idx === currentExerciseIndex;

          return (
            <button
              key={ex.id || idx}
              type="button"
              onClick={() => setCurrentExerciseIndex(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 shrink-0 transition-all ${
                isCurrent
                  ? 'bg-emerald-500/20 border-emerald-500 text-white font-semibold'
                  : isDone
                  ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>0{idx + 1}</span>
              <span className="truncate max-w-[110px]">{ex.name}</span>
              {isDone && <Check className="w-3 h-3 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Main Active Exercise Card */}
      {currentExercise && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          {/* Current Exercise Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Exercise {currentExerciseIndex + 1} of {exercises.length}</span>
                <span aria-hidden="true">·</span>
                <span>{currentExercise.targetMuscle}</span>
                <span aria-hidden="true">·</span>
                <span>{currentExercise.equipment}</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">{currentExercise.name}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentExerciseIndex === 0}
                onClick={() => setCurrentExerciseIndex((i) => Math.max(0, i - 1))}
                className="p-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-30 rounded-xl border border-slate-800 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentExerciseIndex === exercises.length - 1}
                onClick={() => setCurrentExerciseIndex((i) => Math.min(exercises.length - 1, i + 1))}
                className="p-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-30 rounded-xl border border-slate-800 text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form instructions reminder */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1">
            <p className="text-slate-300">
              <span className="font-semibold text-emerald-400">Technique: </span>
              {currentExercise.instructions}
            </p>
            {currentExercise.formTips && (
              <p className="text-amber-300/90">
                <span className="font-semibold text-amber-400">Pro Cue: </span>
                {currentExercise.formTips}
              </p>
            )}
          </div>

          {/* Sets Tracking Table */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 px-3 uppercase tracking-wider">
              <div className="col-span-2">Set</div>
              <div className="col-span-4">Reps Target</div>
              <div className="col-span-4">Weight (kg)</div>
              <div className="col-span-2 text-right">Log</div>
            </div>

            <div className="space-y-2">
              {currentSets.map((s, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl border transition-all ${
                    s.completed
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="col-span-2 font-mono font-bold text-xs text-slate-300">
                    Set {s.setNumber}
                  </div>

                  <div className="col-span-4 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={s.reps}
                      onChange={(e) => handleUpdateReps(idx, e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500">reps</span>
                  </div>

                  <div className="col-span-4 flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. 14"
                      value={s.weight}
                      onChange={(e) => handleUpdateWeight(idx, e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500">kg</span>
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleSet(idx)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        s.completed
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                      }`}
                      title={s.completed ? 'Mark incomplete' : 'Mark set done'}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Rest Timer Bar */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Inter-Set Rest Timer</span>
                {isRestTimerRunning && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono animate-pulse">
                    COUNTDOWN ACTIVE
                  </span>
                )}
              </div>

              {restSecondsRemaining !== null && (
                <span className="font-mono text-xl font-extrabold text-emerald-400">
                  {formatTime(restSecondsRemaining)}
                </span>
              )}
            </div>

            {/* Rest Progress Bar */}
            {restSecondsRemaining !== null && (
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-400 transition-all duration-1000"
                  style={{
                    width: `${Math.max(0, Math.min(100, (restSecondsRemaining / restTotalSeconds) * 100))}%`,
                  }}
                />
              </div>
            )}

            {/* Timer Presets and Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                {[30, 60, 90, 120].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => startRestTimer(s)}
                    className="px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors"
                  >
                    {s}s
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {isRestTimerRunning ? (
                  <button
                    type="button"
                    onClick={() => setIsRestTimerRunning(false)}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs rounded-lg flex items-center gap-1"
                  >
                    <Pause className="w-3 h-3" />
                    <span>Pause</span>
                  </button>
                ) : restSecondsRemaining !== null && restSecondsRemaining > 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsRestTimerRunning(true)}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Resume</span>
                  </button>
                ) : null}

                {restSecondsRemaining !== null && (
                  <>
                    <button
                      type="button"
                      onClick={() => setRestSecondsRemaining((prev) => (prev || 0) + 15)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs rounded-lg"
                    >
                      +15s
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRestSecondsRemaining(0);
                        setIsRestTimerRunning(false);
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs rounded-lg"
                    >
                      Skip
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Session Completion */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Workout Completed!</h3>
              <p className="text-xs text-slate-400">Tremendous effort. Here is your session summary:</p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block">TIME</span>
                <span className="text-base font-bold font-mono text-white">
                  {Math.max(1, Math.round(elapsedSeconds / 60))}m
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">SETS DONE</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {totalCompletedSets}/{totalPossibleSets}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">EST. BURN</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {estimatedCalories} kcal
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 text-left mb-1.5">
                Session Notes (How did your body feel?)
              </label>
              <textarea
                rows={2}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Felt great on chest press, knee felt solid, hit 12 reps on all sets..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCompletedModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Keep Going
              </button>
              <button
                type="button"
                onClick={handleCompleteSession}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all"
              >
                Save to History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
