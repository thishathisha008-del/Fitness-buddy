import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, Send, Zap, Clock, Dumbbell, ShieldAlert, Heart } from 'lucide-react';
import { WorkoutPlan, UserProfile } from '../types/fitness';

interface DynamicPlanModifierProps {
  currentPlan: WorkoutPlan;
  profile: UserProfile;
  onPlanUpdated: (updatedPlan: WorkoutPlan) => void;
}

const QUICK_PROMPTS = [
  { label: '⚡ 20-Min Express', prompt: 'I only have 20 minutes today. Condense the workout into a high-efficiency circuit.' },
  { label: '🏠 No Dumbbells (Bodyweight)', prompt: 'I have no dumbbells or equipment today. Switch all exercises to bodyweight alternatives.' },
  { label: '🩹 Joint Friendly / Less Load', prompt: 'Make this workout easier on my joints with lower impact and safe spinal mechanics.' },
  { label: '🔥 Higher Intensity (HIIT)', prompt: 'Make this workout higher intensity with shorter rest periods and metabolic supersets.' },
  { label: '🧘 Mobility & Recovery', prompt: 'Transform today into an active mobility, dynamic stretching, and postural restoration session.' },
];

export const DynamicPlanModifier: React.FC<DynamicPlanModifierProps> = ({
  currentPlan,
  profile,
  onPlanUpdated,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleModify = async (customPrompt?: string) => {
    const promptToUse = customPrompt || instruction;
    if (!promptToUse.trim()) return;

    setIsModifying(true);
    setError(null);
    setStatusMessage(`Adapting plan: "${promptToUse}"...`);

    try {
      const response = await fetch('/api/modify-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan,
          instruction: promptToUse,
          profile,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to modify plan');
      }

      const data = await response.json();
      if (data.plan) {
        const updated: WorkoutPlan = {
          ...data.plan,
          id: currentPlan.id,
          modifiedAt: new Date().toISOString(),
          modificationsHistory: [
            ...(currentPlan.modificationsHistory || []),
            promptToUse,
          ],
        };
        onPlanUpdated(updated);
        setInstruction('');
        setStatusMessage('Plan dynamically updated by Gemini!');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Dynamic plan modification failed:', err);
      setError(err.message || 'Could not modify plan');
    } finally {
      setIsModifying(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 shadow-lg shadow-emerald-950/20">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Dynamic AI Plan Modification
              <span className="text-[10px] font-medium text-emerald-400 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                Gemini Real-time
              </span>
            </h3>
            <p className="text-xs text-slate-400">Tell the AI how your day looks and it will instantly adapt your workout</p>
          </div>
        </div>
      </div>

      {/* Quick Trigger Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {QUICK_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isModifying}
            onClick={() => handleModify(item.prompt)}
            className="whitespace-nowrap px-3 py-1.5 text-xs font-medium bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition-all shrink-0 disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleModify();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isModifying}
            placeholder="E.g., 'I only have 25 minutes', 'Swap bench press for floor press', 'Knee is sore today'..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none pr-10"
          />
        </div>

        <button
          type="submit"
          disabled={isModifying || !instruction.trim()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-semibold text-xs rounded-xl transition-all shrink-0 shadow-md shadow-emerald-500/20"
        >
          {isModifying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modify</span>
            </>
          )}
        </button>
      </form>

      {/* Status or Error */}
      {statusMessage && (
        <p className="mt-2.5 text-xs text-emerald-400 flex items-center gap-1.5 font-medium animate-fade-in">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>{statusMessage}</span>
        </p>
      )}
      {error && (
        <p className="mt-2.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
          <ShieldAlert className="w-3 h-3" />
          <span>{error}</span>
        </p>
      )}

      {/* Active Modification History Tag if any */}
      {currentPlan.modificationsHistory && currentPlan.modificationsHistory.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="text-slate-500">Latest adjustment:</span>
          <span className="text-slate-300 italic truncate max-w-lg">
            "{currentPlan.modificationsHistory[currentPlan.modificationsHistory.length - 1]}"
          </span>
        </div>
      )}
    </div>
  );
};
