import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, Dumbbell, Loader2 } from 'lucide-react';
import { Exercise, LibraryExercise } from '../types/fitness';
import { DEFAULT_EXERCISES } from '../data/defaultExercises';

interface ExerciseSubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetExercise: Exercise | null;
  dayNumber: number;
  onApplySubstitution: (dayNumber: number, oldExerciseId: string, newExercise: Exercise) => void;
  availableEquipment: string[];
}

export const ExerciseSubstitutionModal: React.FC<ExerciseSubstitutionModalProps> = ({
  isOpen,
  onClose,
  targetExercise,
  dayNumber,
  onApplySubstitution,
  availableEquipment,
}) => {
  const [reason, setReason] = useState('Missing required equipment');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSubstitutes, setAiSubstitutes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !targetExercise) return null;

  // Find pre-matched library substitutes
  const libraryMatch = DEFAULT_EXERCISES.find(
    (e) => e.name.toLowerCase() === targetExercise.name.toLowerCase() ||
           targetExercise.name.toLowerCase().includes(e.name.toLowerCase()),
  );

  const libraryAlternatives = libraryMatch?.alternatives || [
    targetExercise.alternativeExercise || 'Bodyweight Push-up / Squat progression',
  ];

  const handleGenerateAiSubstitutes = async () => {
    setIsGeneratingAi(true);
    setError(null);
    try {
      const response = await fetch('/api/substitute-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseName: targetExercise.name,
          targetMuscle: targetExercise.targetMuscle,
          reason,
          availableEquipment: availableEquipment.join(', '),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI substitutes');
      }

      const data = await response.json();
      if (data.substitutes && data.substitutes.length > 0) {
        setAiSubstitutes(data.substitutes);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not fetch AI alternatives. You can still pick one from the recommended library options below.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSelectAlternative = (sub: {
    name: string;
    targetMuscle?: string;
    equipment?: string;
    instructions?: string;
    difficulty?: string;
    rationale?: string;
  }) => {
    const updatedExercise: Exercise = {
      ...targetExercise,
      name: sub.name,
      targetMuscle: sub.targetMuscle || targetExercise.targetMuscle,
      equipment: sub.equipment || 'Bodyweight / Available Equipment',
      instructions: sub.instructions || targetExercise.instructions,
      difficulty: (sub.difficulty as any) || targetExercise.difficulty,
      rationale: sub.rationale || `Substituted for ${targetExercise.name} due to ${reason.toLowerCase()}.`,
      alternativeExercise: targetExercise.name,
    };

    onApplySubstitution(dayNumber, targetExercise.id, updatedExercise);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Smart Exercise Substitution</h3>
              <p className="text-xs text-slate-400">Safely replace an exercise with biomechanically aligned alternatives</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Exercise Current Info */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-500 block mb-1">CURRENT EXERCISE IN PLAN</span>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{targetExercise.name}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>Target: {targetExercise.targetMuscle}</span>
                  <span aria-hidden="true">·</span>
                  <span>Equipment: {targetExercise.equipment}</span>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                {targetExercise.sets} sets × {targetExercise.reps}
              </span>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Reason for substitution</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Missing required equipment">Missing required equipment</option>
              <option value="Joint pain or physical discomfort">Joint pain or physical discomfort</option>
              <option value="Exercise is too difficult">Exercise is too difficult / want regression</option>
              <option value="Exercise is too easy">Exercise is too easy / want progression</option>
              <option value="Want variety and change of pace">Want variety / change of pace</option>
            </select>
          </div>

          {/* AI Generation Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">Need customized biomechanic alternatives?</span>
            <button
              type="button"
              disabled={isGeneratingAi}
              onClick={handleGenerateAiSubstitutes}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Consulting Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ask Gemini for Alternatives</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          )}

          {/* AI Recommended Substitutes */}
          {aiSubstitutes.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini AI Recommendations
              </span>
              <div className="space-y-2">
                {aiSubstitutes.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950 border border-emerald-500/30 rounded-xl hover:border-emerald-500/60 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white">{sub.name}</h5>
                      <button
                        onClick={() => handleSelectAlternative(sub)}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <span>Apply</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{sub.instructions || sub.whyItWorks}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>Equipment: {sub.equipment}</span>
                      <span>·</span>
                      <span>Target: {sub.targetMuscle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Library Alternatives */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block">
              Standard Verified Substitutes ({libraryAlternatives.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {libraryAlternatives.map((altName, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    handleSelectAlternative({
                      name: altName,
                      targetMuscle: targetExercise.targetMuscle,
                      equipment: 'Alternative Setup',
                      rationale: `Direct substitute for ${targetExercise.name}.`,
                    })
                  }
                  className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-left flex items-center justify-between transition-all group"
                >
                  <span className="text-xs font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {altName}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
