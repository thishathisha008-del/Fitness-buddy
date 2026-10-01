import React, { useState } from 'react';
import {
  Settings,
  Users,
  Database,
  Code,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { UserProfile, WorkoutPlan, LibraryExercise, WorkoutSessionLog, ProgressEntry } from '../types/fitness';
import { saveCustomExercise, deleteCustomExercise } from '../utils/storage';

interface AdminDashboardProps {
  profile: UserProfile;
  activePlan: WorkoutPlan;
  exercises: LibraryExercise[];
  workoutLogs: WorkoutSessionLog[];
  progressEntries: ProgressEntry[];
  onRefreshExercises: () => void;
  onResetAllData: () => void;
  onImportData: (importedData: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  profile,
  activePlan,
  exercises,
  workoutLogs,
  progressEntries,
  onRefreshExercises,
  onResetAllData,
  onImportData,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'database' | 'plan' | 'backup'>('database');

  // New Exercise Form
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('Chest');
  const [newExDiff, setNewExDiff] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [newExEquip, setNewExEquip] = useState('Dumbbells');
  const [newExInstructions, setNewExInstructions] = useState('');
  const [newExMistakes, setNewExMistakes] = useState('');
  const [newExAlternatives, setNewExAlternatives] = useState('');

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const newEx: LibraryExercise = {
      id: `custom-ex-${Date.now()}`,
      name: newExName.trim(),
      targetMuscle: newExMuscle,
      secondaryMuscles: [],
      difficulty: newExDiff,
      equipment: newExEquip,
      instructions: newExInstructions
        ? newExInstructions.split('\n').filter(Boolean)
        : ['Perform movement with steady controlled tempo.'],
      commonMistakes: newExMistakes ? newExMistakes.split('\n').filter(Boolean) : [],
      alternatives: newExAlternatives ? newExAlternatives.split(',').map((s) => s.trim()) : [],
      isCustom: true,
    };

    saveCustomExercise(newEx);
    onRefreshExercises();
    setIsAddingExercise(false);
    setNewExName('');
    setNewExInstructions('');
    setNewExMistakes('');
    setNewExAlternatives('');
  };

  const handleDeleteExercise = (id: string) => {
    deleteCustomExercise(id);
    onRefreshExercises();
  };

  const handleExportData = () => {
    const fullBackup = {
      profile,
      activePlan,
      workoutLogs,
      progressEntries,
      customExercises: exercises.filter((e) => e.isCustom),
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fitbuddy_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          onImportData(parsed);
        } catch (err) {
          alert('Invalid backup JSON file.');
        }
      };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>Administrator Control Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk']">
            Application Content & Database Manager
          </h1>
          <p className="text-xs text-slate-400">
            Manage exercise database, inspect raw Gemini structured JSON outputs, and backup client records.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {[
            { id: 'database', label: 'Exercise DB', icon: <Database className="w-3.5 h-3.5" /> },
            { id: 'users', label: 'Athlete Profile', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'plan', label: 'Plan JSON', icon: <Code className="w-3.5 h-3.5" /> },
            { id: 'backup', label: 'Backup & Reset', icon: <Download className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB: Exercise DB */}
      {activeTab === 'database' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Exercise Library Database</h3>
              <p className="text-xs text-slate-400">
                {exercises.length} total exercises ({exercises.filter((e) => e.isCustom).length} custom user additions)
              </p>
            </div>

            <button
              onClick={() => setIsAddingExercise(!isAddingExercise)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Exercise</span>
            </button>
          </div>

          {/* Add Exercise Modal / Form */}
          {isAddingExercise && (
            <form onSubmit={handleCreateExercise} className="p-4 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-400">Register New Exercise</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Exercise Name</label>
                  <input
                    type="text"
                    required
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    placeholder="E.g., Incline Dumbbell Curl"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Target Muscle</label>
                  <select
                    value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Mobility'].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Equipment</label>
                  <input
                    type="text"
                    value={newExEquip}
                    onChange={(e) => setNewExEquip(e.target.value)}
                    placeholder="Dumbbells, Bench"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={newExDiff}
                    onChange={(e) => setNewExDiff(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Key Steps (one per line)</label>
                <textarea
                  rows={2}
                  value={newExInstructions}
                  onChange={(e) => setNewExInstructions(e.target.value)}
                  placeholder="Set bench to 45 degrees...\nKeep elbows pinned..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Common Alternatives (comma separated)</label>
                <input
                  type="text"
                  value={newExAlternatives}
                  onChange={(e) => setNewExAlternatives(e.target.value)}
                  placeholder="Hammer Curls, Cable Curls"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingExercise(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          )}

          {/* Database Items List */}
          <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 max-h-96 overflow-y-auto">
            {exercises.map((ex) => (
              <div key={ex.id} className="p-3 bg-slate-950/60 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{ex.name}</span>
                    {ex.isCustom && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        Custom
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {ex.targetMuscle} · {ex.equipment} · {ex.difficulty}
                  </span>
                </div>

                {ex.isCustom && (
                  <button
                    onClick={() => handleDeleteExercise(ex.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete custom exercise"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: User Profiles */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Active Athlete Profile Record</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">NAME</span>
              <span className="font-bold text-white text-sm">{profile.name}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">AGE / GENDER</span>
              <span className="font-bold text-white text-sm">
                {profile.age} yrs · {profile.gender}
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">HEIGHT & WEIGHT</span>
              <span className="font-bold text-white text-sm">
                {profile.heightCm} cm / {profile.weightKg} kg
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">GOAL</span>
              <span className="font-bold text-emerald-400 text-sm">
                {profile.goal.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
            <div>
              <span className="font-semibold text-slate-300">Available Equipment: </span>
              <span className="text-slate-400">{profile.equipment.join(', ')}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-300">Physical Limitations: </span>
              <span className="text-amber-400">{profile.limitations || 'None recorded'}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-300">Dietary Style: </span>
              <span className="text-slate-400">{profile.dietaryPreference}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Plan JSON Inspector */}
      {activeTab === 'plan' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Gemini Structured JSON Output Inspector</h3>
            <span className="text-xs font-mono text-emerald-400">
              {activePlan.schedule.length} days / {activePlan.schedule.reduce((acc, d) => acc + d.exercises.length, 0)} total exercises
            </span>
          </div>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-96">
            {JSON.stringify(activePlan, null, 2)}
          </pre>
        </div>
      )}

      {/* TAB: Backup & Reset */}
      {activeTab === 'backup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white">Data Backup, Export & Reset</h3>
            <p className="text-xs text-slate-400">
              Persist all workouts, plans, custom exercises, and progress logs as a portable JSON file.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleExportData}
              className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex flex-col justify-between transition-colors"
            >
              <Download className="w-5 h-5 text-emerald-400 mb-2" />
              <div>
                <span className="font-bold text-white text-xs block">Export JSON Backup</span>
                <span className="text-[11px] text-slate-400">Download complete client database</span>
              </div>
            </button>

            <label className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex flex-col justify-between cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-teal-400 mb-2" />
              <div>
                <span className="font-bold text-white text-xs block">Import JSON Backup</span>
                <span className="text-[11px] text-slate-400">Restore from an existing backup</span>
              </div>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={onResetAllData}
              className="p-4 bg-slate-950 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/40 rounded-xl text-left flex flex-col justify-between transition-colors group"
            >
              <RotateCcw className="w-5 h-5 text-rose-400 mb-2" />
              <div>
                <span className="font-bold text-rose-300 text-xs block">Reset to Defaults</span>
                <span className="text-[11px] text-slate-400">Clear cache & restore default state</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
