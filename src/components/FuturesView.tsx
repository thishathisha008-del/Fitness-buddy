import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Flame,
  Brain,
  Layers,
  ArrowRight,
  RefreshCw,
  Clock,
  Compass,
  Award,
  HeartPulse,
} from 'lucide-react';
import { UserProfile, WorkoutPlan, FutureProjectionResponse, FutureMilestone } from '../types/fitness';

interface FuturesViewProps {
  profile: UserProfile;
  activePlan: WorkoutPlan;
}

export const FuturesView: React.FC<FuturesViewProps> = ({ profile, activePlan }) => {
  const [adherenceRate, setAdherenceRate] = useState<number>(85);
  const [selectedHorizon, setSelectedHorizon] = useState<number>(0); // 0: 30d, 1: 60d, 2: 90d
  const [projection, setProjection] = useState<FutureProjectionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState<boolean>(false);

  const fetchProjection = async (adherence: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/future-projection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          adherenceRate: adherence,
          activePlanFocus: activePlan.focus || 'Personalized Routine',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate forecast');
      }

      const data = await response.json();
      if (data.projection) {
        setProjection(data.projection);
      }
    } catch (err) {
      console.error('Projection fetch error:', err);
    } finally {
      setLoading(false);
      setHasFetchedOnce(true);
    }
  };

  useEffect(() => {
    if (!hasFetchedOnce) {
      fetchProjection(adherenceRate);
    }
  }, [profile.weightKg, profile.goal]);

  const activeMilestone: FutureMilestone | undefined = projection?.timeframeMilestones?.[selectedHorizon];

  const currentWeight = Number(profile.weightKg) || 70;
  const projectedWeight = activeMilestone?.projectedWeightKg ?? currentWeight;
  const weightDelta = Number((projectedWeight - currentWeight).toFixed(1));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/20 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              Gemini AI Predictive Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk'] mb-3">
              FitBuddy <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Futures</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Biometric milestone projections and physiological adaptations calculated specifically for your body, training routine, and goal:{' '}
              <span className="text-emerald-400 font-semibold capitalize">{profile.goal.replace('_', ' ')}</span>.
            </p>
          </div>

          <button
            onClick={() => fetchProjection(adherenceRate)}
            disabled={loading}
            className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 cursor-pointer self-start md:self-auto shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Simulating Trajectory...' : 'Recalculate Forecast'}
          </button>
        </div>

        {/* Adherence Simulation Slider */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Simulated Plan Adherence
              </span>
              <p className="text-xs text-slate-400">
                Adjust how consistently you hit your weekly workouts and nutrition targets:
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-400 font-['Space_Grotesk']">
                {adherenceRate}%
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                {adherenceRate >= 90 ? 'Elite Discipline' : adherenceRate >= 75 ? 'Optimal Progress' : 'Moderate Pace'}
              </span>
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={adherenceRate}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAdherenceRate(val);
              }}
              onMouseUp={() => fetchProjection(adherenceRate)}
              onTouchEnd={() => fetchProjection(adherenceRate)}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5 px-0.5">
              <span>50% (Casual)</span>
              <span>75% (Consistent)</span>
              <span>90% (Focused)</span>
              <span>100% (Flawless)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary Card */}
      {projection?.executiveSummary && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              Physiological Forecast Summary
            </h3>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {projection.executiveSummary}
            </p>
          </div>
        </div>
      )}

      {/* Time Horizon Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          Milestone Horizons
        </h2>

        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {projection?.timeframeMilestones?.map((m, idx) => (
            <button
              key={m.timeframe}
              onClick={() => setSelectedHorizon(idx)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedHorizon === idx
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {m.timeframe}
            </button>
          )) || [
            <span key="loading" className="text-xs text-slate-400 px-3 py-1">
              Loading Horizons...
            </span>,
          ]}
        </div>
      </div>

      {/* Active Milestone Highlight Card */}
      {activeMilestone && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Projected Weight */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Projected Weight
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-['Space_Grotesk']">
                  {projectedWeight}
                </span>
                <span className="text-sm font-semibold text-slate-400">kg</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
              {weightDelta < 0 ? (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {weightDelta} kg reduction
                </span>
              ) : weightDelta > 0 ? (
                <span className="text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  +{weightDelta} kg lean mass gain
                </span>
              ) : (
                <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Stabilized balance
                </span>
              )}
            </div>
          </div>

          {/* Body Fat Delta */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Body Composition Shift
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-['Space_Grotesk']">
                  {activeMilestone.projectedBodyFatDelta > 0 ? `+${activeMilestone.projectedBodyFatDelta}` : activeMilestone.projectedBodyFatDelta}%
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Fat mass to active lean tissue ratio</span>
            </div>
          </div>

          {/* Strength Progression */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Compound Strength Boost
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400 font-['Space_Grotesk']">
                  +{activeMilestone.strengthIncreasePercent}%
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Neuromuscular recruitment capacity</span>
            </div>
          </div>

          {/* Endurance & VO2 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Aerobic Work Capacity
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-400 font-['Space_Grotesk']">
                  +{activeMilestone.enduranceIncreasePercent}%
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              <span>Mitochondrial density & stamina</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Adaptations & Key Milestones Grid */}
      {activeMilestone && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biological & Physiological Adaptations */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Inside Your Physiology ({activeMilestone.timeframe})
            </h3>
            <div className="space-y-3">
              {activeMilestone.physiologicalAdaptations.map((adaptation, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-300 leading-snug">{adaptation}</p>
                </div>
              ))}
            </div>

            {/* Mindset & Psychology */}
            <div className="mt-5 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                <Brain className="w-3.5 h-3.5" />
                Mental & Psychological Anchor
              </span>
              <p className="text-xs sm:text-sm text-slate-300 italic">
                "{activeMilestone.mindsetAdvice}"
              </p>
            </div>
          </div>

          {/* Tangible Real-World Milestones */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-amber-400" />
                Tangible Milestones You Will Unlock
              </h3>
              <div className="space-y-3">
                {activeMilestone.keyMilestones.map((milestone, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold text-emerald-400 block mb-0.5">
                        Milestone {i + 1}
                      </span>
                      <p className="text-sm text-slate-200">{milestone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Weekly Routine</span>
                <span className="text-sm font-bold text-white">
                  {profile.daysPerWeek} training days / week · {profile.targetDurationMinutes} mins
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Nutrition Target</span>
                <span className="text-sm font-bold text-emerald-400">
                  {activePlan.nutritionPlan.dailyCalories} kcal / day
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anticipated Friction Points & AI Habit Solutions */}
      {projection && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Potential Plateaus */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-rose-900/20">
            <h3 className="text-base font-bold text-rose-300 flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Anticipated Plateaus & Solutions
            </h3>
            <ul className="space-y-3">
              {projection.potentialBottlenecks.map((bottleneck, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-300 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 leading-relaxed">
                  {bottleneck}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended High-Leverage Habits */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-900/20">
            <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-emerald-400" />
              High-Leverage Daily Habits
            </h3>
            <ul className="space-y-3">
              {projection.recommendedHabits.map((habit, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 leading-relaxed">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{habit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Future Roadmap Section: Upcoming Features */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5" />
              Product Evolution
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight font-['Space_Grotesk']">
              FitBuddy Future Capabilities Roadmap
            </h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 w-fit">
            Next Generation Features
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs mb-3">
              01
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Wearable Biometric Sync</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic calorie burn, resting heart rate, and sleep duration imports via Apple Health, Fitbit, and Garmin.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
              02
            </div>
            <h4 className="text-sm font-bold text-white mb-1">AR Computer Vision Form Check</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time camera posture angle estimation to detect knee caving, spinal rounding, and rep cadence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs mb-3">
              03
            </div>
            <h4 className="text-sm font-bold text-white mb-1">AI Meal Photo Macro Scanner</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant multimodal photo analysis estimating protein, carbohydrate, fat, and portion sizing in seconds.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs mb-3">
              04
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Voice-Guided Coach Live HUD</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hands-free audio interval timing, rest countdowns, and motivational technique prompts during live sets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
