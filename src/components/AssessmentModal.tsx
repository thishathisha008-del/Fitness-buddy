import React, { useState } from 'react';
import {
  X,
  Sparkles,
  HeartPulse,
  Target,
  ShieldCheck,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Activity,
  Calendar,
  Utensils,
} from 'lucide-react';
import {
  UserProfile,
  Gender,
  FitnessLevel,
  FitnessGoal,
  ActivityLevel,
  DietaryPreference,
  WorkoutPlan,
} from '../types/fitness';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
} from '../utils/fitnessCalculators';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onPlanGenerated: (newPlan: WorkoutPlan) => void;
}

const EQUIPMENT_OPTIONS = [
  'Bodyweight',
  'Dumbbells',
  'Barbell & Plates',
  'Resistance Bands',
  'Kettlebells',
  'Pull-up Bar',
  'Cable Machine',
  'Adjustable Bench',
  'Full Gym',
];

const COMMON_LIMITATIONS = [
  'Knee pain / avoid deep knee flexion',
  'Lower back pain / avoid heavy spinal compression',
  'Shoulder impingement / rotator cuff issue',
  'Wrist pain / avoid extension under load',
  'Neck stiffness',
  'Asthma / low impact cardio only',
];

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onPlanGenerated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time metric computations
  const bmiData = calculateBMI(formData.weightKg, formData.heightCm);
  const bmr = calculateBMR(formData.weightKg, formData.heightCm, formData.age, formData.gender);
  const tdee = calculateTDEE(bmr, formData.activityLevel);
  const targetCalories = calculateTargetCalories(tdee, formData.goal);

  const toggleEquipment = (eq: string) => {
    const current = formData.equipment || [];
    if (current.includes(eq)) {
      setFormData({ ...formData, equipment: current.filter((item) => item !== eq) });
    } else {
      setFormData({ ...formData, equipment: [...current, eq] });
    }
  };

  const handleSelectLimitation = (limitation: string) => {
    if (formData.limitations.includes(limitation)) {
      setFormData({
        ...formData,
        limitations: formData.limitations
          .replace(limitation, '')
          .replace(/,\s*,/g, ',')
          .trim(),
      });
    } else {
      const updated = formData.limitations ? `${formData.limitations}, ${limitation}` : limitation;
      setFormData({ ...formData, limitations: updated });
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationStep('Analyzing body composition & biomechanics...');

    try {
      // Save profile updates first
      const updatedProfile: UserProfile = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      onSaveProfile(updatedProfile);

      setGenerationStep('Gemini AI generating custom periodized schedule...');
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updatedProfile }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate plan');
      }

      setGenerationStep('Calibrating metabolic nutrition & macro breakdown...');
      const data = await response.json();

      if (data.plan) {
        const fullPlan: WorkoutPlan = {
          ...data.plan,
          id: `plan-${Date.now()}`,
          generatedAt: new Date().toISOString(),
        };
        onPlanGenerated(fullPlan);
        onClose();
      } else {
        throw new Error('No plan data received from server');
      }
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setErrorMessage(err.message || 'Something went wrong generating your plan. Please retry.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Fitness Assessment & AI Plan Generator</h2>
              <p className="text-xs text-slate-400">Personalize your training, recovery, and nutrition with Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950/30 border-b border-slate-800/80 text-xs">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              step === 1 ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>1</span>
            <span>Biometrics & Body</span>
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              step === 2 ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>2</span>
            <span>Goals & Schedule</span>
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              step === 3 ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>3</span>
            <span>Equipment & Safety</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[68vh] overflow-y-auto">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Biometrics & Metrics */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Athlete Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="E.g. Alex Morgan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Age</label>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Calculated Metrics Card */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Real-Time Biometric Analysis</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">BMI Score</span>
                    <span className="text-base font-bold font-mono text-white">{bmiData.bmi}</span>
                    <span className={`text-[10px] font-medium block ${bmiData.color}`}>
                      {bmiData.category}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Basal Metabolic Rate</span>
                    <span className="text-base font-bold font-mono text-white">{bmr}</span>
                    <span className="text-[10px] text-slate-400 block">kcal/day</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">TDEE (Maintenance)</span>
                    <span className="text-base font-bold font-mono text-white">{tdee}</span>
                    <span className="text-[10px] text-slate-400 block">kcal/day</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Target Intake</span>
                    <span className="text-base font-bold font-mono text-emerald-400">{targetCalories}</span>
                    <span className="text-[10px] text-emerald-300/80 block">for {formData.goal.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Daily Physical Activity Level</label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="sedentary">Sedentary (Desk job, minimal daily movement)</option>
                  <option value="light">Lightly Active (Light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderately Active (Moderate exercise 3-5 days/week)</option>
                  <option value="active">Very Active (Hard training 6-7 days/week)</option>
                  <option value="very_active">Extremely Active (Athletic physical job + training)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Goals & Schedule */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Primary Fitness Goal</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'weight_loss', label: 'Weight Loss & Shred', desc: 'Caloric deficit, high metabolic burn' },
                    { id: 'muscle_gain', label: 'Muscle Hypertrophy', desc: 'Volume, muscle retention & growth' },
                    { id: 'strength', label: 'Raw Strength & Power', desc: 'Heavy compounds, progressive overload' },
                    { id: 'endurance', label: 'Cardio & Stamina', desc: 'Aerobic threshold, HIIT, muscular fatigue' },
                    { id: 'general_fitness', label: 'General Health & Tone', desc: 'Balanced functional wellness' },
                  ].map((goal) => {
                    const isSelected = formData.goal === goal.id;
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, goal: goal.id as FitnessGoal })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-slate-100">{goal.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{goal.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Experience Level</label>
                  <select
                    value={formData.fitnessLevel}
                    onChange={(e) => setFormData({ ...formData, fitnessLevel: e.target.value as FitnessLevel })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="beginner">Beginner (0 - 6 months consistent)</option>
                    <option value="intermediate">Intermediate (6 months - 2 years)</option>
                    <option value="advanced">Advanced (2+ years dedicated lifting)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Dietary Preference</label>
                  <select
                    value={formData.dietaryPreference}
                    onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value as DietaryPreference })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="omnivore">Omnivore (Balanced meats & veggies)</option>
                    <option value="high_protein">High Protein (Athletic focus)</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan / Plant-Based</option>
                    <option value="pescatarian">Pescatarian</option>
                    <option value="keto">Ketogenic (Low Carb, High Fat)</option>
                    <option value="low_carb">Low Carb</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Duration (Mins)</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setFormData({ ...formData, targetDurationMinutes: mins })}
                        className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                          formData.targetDurationMinutes === mins
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Training Days / Week</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[3, 4, 5, 6].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setFormData({ ...formData, daysPerWeek: days })}
                        className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                          formData.daysPerWeek === days
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {days} days
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Equipment & Limitations */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Available Equipment</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EQUIPMENT_OPTIONS.map((item) => {
                    const isSelected = formData.equipment?.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleEquipment(item)}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{item}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Physical Limitations, Injuries, or Areas to Protect
                  </label>
                  <span className="text-[11px] text-amber-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    AI will enforce safe biomechanics
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {COMMON_LIMITATIONS.map((lim) => {
                    const active = formData.limitations?.includes(lim);
                    return (
                      <button
                        key={lim}
                        type="button"
                        onClick={() => handleSelectLimitation(lim)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                          active
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}{lim}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  rows={2}
                  value={formData.limitations}
                  onChange={(e) => setFormData({ ...formData, limitations: e.target.value })}
                  placeholder="E.g., Right shoulder clicks on overhead press; prefer knee-friendly squats..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Safety Confirmation Notice */}
              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-start gap-2.5 text-slate-400 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Gemini will dynamically filter exercises to protect injured joints and formulate targeted warmups and cooldowns. Always listen to your body and consult a healthcare provider.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                disabled={isGenerating}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onSaveProfile(formData);
                  onClose();
                }}
                disabled={isGenerating}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Save Profile Only
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{generationStep || 'Generating Plan...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Generate AI Fitness Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
