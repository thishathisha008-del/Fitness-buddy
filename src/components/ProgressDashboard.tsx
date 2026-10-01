import React, { useState } from 'react';
import {
  LineChart,
  Plus,
  TrendingDown,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  Flame,
  Dumbbell,
  CheckCircle2,
  Activity,
  Trash2,
} from 'lucide-react';
import { ProgressEntry, WorkoutSessionLog, UserProfile } from '../types/fitness';
import { calculateBMI } from '../utils/fitnessCalculators';

interface ProgressDashboardProps {
  progressEntries: ProgressEntry[];
  workoutLogs: WorkoutSessionLog[];
  profile: UserProfile;
  onAddProgressEntry: (entry: ProgressEntry) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progressEntries,
  workoutLogs,
  profile,
  onAddProgressEntry,
}) => {
  const [isAddingWeight, setIsAddingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState(profile.weightKg.toString());
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');

  // Calculations
  const sortedEntries = [...progressEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const initialWeight = sortedEntries.length > 0 ? sortedEntries[0].weightKg : profile.weightKg;
  const latestWeight = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].weightKg : profile.weightKg;
  const weightDifference = Number((latestWeight - initialWeight).toFixed(1));

  const latestBMI = calculateBMI(latestWeight, profile.heightCm);

  const totalMinutes = workoutLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalCalories = workoutLogs.reduce((acc, log) => acc + log.estimatedCaloriesBurned, 0);

  // SVG Chart Geometry
  const chartWidth = 600;
  const chartHeight = 180;
  const padding = 40;

  const weights = sortedEntries.map((e) => e.weightKg);
  const minWeight = Math.min(...weights, profile.weightKg) - 1;
  const maxWeight = Math.max(...weights, profile.weightKg) + 1;
  const weightRange = maxWeight - minWeight || 1;

  const points = sortedEntries.map((entry, idx) => {
    const x =
      sortedEntries.length === 1
        ? chartWidth / 2
        : padding + (idx / (sortedEntries.length - 1)) * (chartWidth - padding * 2);
    const y =
      chartHeight -
      padding -
      ((entry.weightKg - minWeight) / weightRange) * (chartHeight - padding * 2);
    return { x, y, entry };
  });

  const pathD =
    points.length > 1
      ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
      : '';

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    const bmi = calculateBMI(weightNum, profile.heightCm).bmi;
    const entry: ProgressEntry = {
      id: `progress-${Date.now()}`,
      date: newDate,
      weightKg: weightNum,
      bmi,
      notes: newNotes,
    };

    onAddProgressEntry(entry);
    setIsAddingWeight(false);
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Current Weight */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Current Weight</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-white">{latestWeight}</span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium">
            {weightDifference <= 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5 font-mono">
                <TrendingDown className="w-3 h-3" />
                {Math.abs(weightDifference)} kg
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-0.5 font-mono">
                <TrendingUp className="w-3 h-3" />
                +{weightDifference} kg
              </span>
            )}
            <span className="text-slate-500">since start</span>
          </div>
        </div>

        {/* Current BMI */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Body Mass Index (BMI)</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-white">{latestBMI.bmi}</span>
            <span className={`text-xs font-semibold ${latestBMI.color}`}>{latestBMI.category}</span>
          </div>
          <p className="text-[11px] text-slate-500">Height: {profile.heightCm} cm</p>
        </div>

        {/* Total Workouts Completed */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Completed Workouts</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-emerald-400">{workoutLogs.length}</span>
            <span className="text-xs text-slate-400">sessions</span>
          </div>
          <p className="text-[11px] text-slate-500">{totalMinutes} total minutes trained</p>
        </div>

        {/* Total Energy Burned */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Estimated Burned</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-amber-400">{totalCalories}</span>
            <span className="text-xs text-slate-400">kcal</span>
          </div>
          <p className="text-[11px] text-slate-500">From logged training sessions</p>
        </div>
      </div>

      {/* Weight Progression Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Weight Progression Over Time</span>
            </h2>
            <p className="text-xs text-slate-400">Consistent weigh-ins under identical conditions provide the truest trend</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingWeight(!isAddingWeight)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm shadow-emerald-500/20 transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Weight</span>
          </button>
        </div>

        {/* Inline Weight Form */}
        {isAddingWeight && (
          <form
            onSubmit={handleSaveWeight}
            className="p-4 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-3 animate-fade-in"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Morning weigh-in, fasted..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingWeight(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors"
              >
                Save Record
              </button>
            </div>
          </form>
        )}

        {/* SVG Graph */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-44 overflow-visible"
          >
            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = padding + pct * (chartHeight - padding * 2);
              const val = (maxWeight - pct * weightRange).toFixed(1);
              return (
                <g key={i}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding - 6}
                    y={y + 3}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Path */}
            {points.length > 1 && (
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Dots */}
            {points.map((p, idx) => (
              <g key={idx} className="group">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill="#022c22"
                  stroke="#10b981"
                  strokeWidth="2"
                  className="transition-all hover:r-6 cursor-pointer"
                />
                <text
                  x={p.x}
                  y={p.y - 8}
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {p.entry.weightKg}
                </text>
                <text
                  x={p.x}
                  y={chartHeight - padding + 16}
                  fill="#64748b"
                  fontSize="8"
                  textAnchor="middle"
                >
                  {p.entry.date.slice(5)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Workout History Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Workout History & Detailed Logs</span>
          </h2>
          <span className="text-xs text-slate-400">{workoutLogs.length} total sessions recorded</span>
        </div>

        {workoutLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No completed workouts logged yet. Start a session from the Workout Plan tab!
          </div>
        ) : (
          <div className="space-y-3">
            {workoutLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                      <span className="font-mono text-emerald-400">{log.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>Day {log.dayNumber}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{log.dayName}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {log.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-400">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      {log.estimatedCaloriesBurned} kcal
                    </span>
                  </div>
                </div>

                {/* Exercise breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  {log.exercises.map((ex, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-950/70 border border-slate-800/60 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block">{ex.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {ex.weightUsed ? `Weight: ${ex.weightUsed}` : ex.targetMuscle}
                        </span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">
                        {ex.setsCompleted}/{ex.totalSets} sets
                      </span>
                    </div>
                  ))}
                </div>

                {log.notes && (
                  <p className="text-xs text-slate-400 italic pt-1">
                    <span className="text-slate-500 not-italic">Notes: </span>"{log.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievement Milestones */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <Award className="w-4 h-4" />
          <span>Milestone Achievements</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          {[
            { title: 'First Workout', desc: 'Completed 1st session', unlocked: workoutLogs.length >= 1 },
            { title: 'Consistent 3', desc: '3 sessions logged', unlocked: workoutLogs.length >= 3 },
            { title: 'Iron Will', desc: '5 sessions logged', unlocked: workoutLogs.length >= 5 },
            { title: 'Centurion', desc: '100+ total sets completed', unlocked: workoutLogs.length >= 7 },
          ].map((badge, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all ${
                badge.unlocked
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-950/50 border-slate-800 text-slate-600'
              }`}
            >
              <Award className={`w-6 h-6 mx-auto mb-1.5 ${badge.unlocked ? 'text-emerald-400' : 'text-slate-700'}`} />
              <span className="font-bold block text-slate-200">{badge.title}</span>
              <span className="text-[10px] text-slate-400">{badge.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
