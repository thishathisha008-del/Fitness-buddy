import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  Dumbbell,
  ArrowRight,
  X,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { LibraryExercise } from '../types/fitness';

interface ExerciseLibraryViewProps {
  exercises: LibraryExercise[];
}

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Mobility'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({ exercises }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<LibraryExercise | null>(null);

  const filtered = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMuscle =
      selectedMuscle === 'All' ||
      ex.targetMuscle.toLowerCase().includes(selectedMuscle.toLowerCase()) ||
      ex.secondaryMuscles.some((m) => m.toLowerCase().includes(selectedMuscle.toLowerCase()));

    const matchesDiff = selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty;

    return matchesSearch && matchesMuscle && matchesDiff;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Biomechanical Exercise Encyclopedia</span>
          <span aria-hidden="true">·</span>
          <span>{exercises.length} Verified Movements</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk']">
          Exercise Library & Smart Substitutions
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Browse vetted biomechanical cues, common execution mistakes to avoid, and safe exercise substitutions for any equipment constraint or joint limitation.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by exercise name, muscle group, or equipment (e.g. dumbbell, glutes, push-up)..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Filter Bars */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Muscle Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {MUSCLE_GROUPS.map((muscle) => {
              const active = selectedMuscle === muscle;
              return (
                <button
                  key={muscle}
                  onClick={() => setSelectedMuscle(muscle)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {muscle}
                </button>
              );
            })}
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 text-xs self-end sm:self-auto">
            <span className="text-slate-400">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((ex) => (
          <div
            key={ex.id}
            onClick={() => setSelectedExercise(ex)}
            className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 cursor-pointer transition-all hover:shadow-lg group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {ex.targetMuscle}
                </span>
                <span className="text-[10px] text-slate-400">{ex.difficulty}</span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                {ex.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {ex.instructions[0]}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate max-w-[160px]">{ex.equipment}</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform">
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Exercise Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span>{selectedExercise.targetMuscle}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedExercise.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedExercise.equipment}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedExercise.name}</h3>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Instructions */}
              <div>
                <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Step-by-Step Form & Technique</span>
                </h4>
                <ol className="space-y-1.5 text-slate-300 list-decimal list-inside leading-relaxed">
                  {selectedExercise.instructions.map((step, idx) => (
                    <li key={idx} className="pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Common Mistakes */}
              {selectedExercise.commonMistakes && selectedExercise.commonMistakes.length > 0 && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Common Biomechanical Mistakes to Avoid</span>
                  </h4>
                  <ul className="space-y-1 text-slate-300">
                    {selectedExercise.commonMistakes.map((m, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternatives */}
              {selectedExercise.alternatives && selectedExercise.alternatives.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Smart Biomechanical Alternatives</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.alternatives.map((alt, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-medium"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedExercise(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
