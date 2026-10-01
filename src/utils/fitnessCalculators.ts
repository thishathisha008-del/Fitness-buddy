import { ActivityLevel, FitnessGoal, Gender } from '../types/fitness';

export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese';
  color: string;
} {
  if (heightCm <= 0 || weightKg <= 0) {
    return { bmi: 0, category: 'Normal weight', color: 'text-emerald-400' };
  }
  const heightMeters = heightCm / 100;
  const bmi = Number((weightKg / (heightMeters * heightMeters)).toFixed(1));

  if (bmi < 18.5) {
    return { bmi, category: 'Underweight', color: 'text-amber-400' };
  } else if (bmi < 25) {
    return { bmi, category: 'Normal weight', color: 'text-emerald-400' };
  } else if (bmi < 30) {
    return { bmi, category: 'Overweight', color: 'text-amber-400' };
  } else {
    return { bmi, category: 'Obese', color: 'text-rose-400' };
  }
}

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 1800;
  // Mifflin-St Jeor Formula
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    return Math.round(base + 5);
  } else if (gender === 'female') {
    return Math.round(base - 161);
  } else {
    return Math.round(base - 78);
  }
}

export function calculateTDEE(bmr: number, activity: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activity] || 1.375));
}

export function calculateTargetCalories(tdee: number, goal: FitnessGoal): number {
  switch (goal) {
    case 'weight_loss':
      return Math.max(1200, Math.round(tdee - 450));
    case 'muscle_gain':
      return Math.round(tdee + 350);
    case 'strength':
      return Math.round(tdee + 150);
    case 'endurance':
      return Math.round(tdee + 100);
    case 'general_fitness':
    default:
      return Math.round(tdee);
  }
}

export function calculateMacros(targetCalories: number, goal: FitnessGoal, weightKg: number) {
  // Protein: weight loss & muscle gain need higher protein (1.8 - 2.2g per kg)
  let proteinPerKg = 1.6;
  let fatPct = 0.25;

  if (goal === 'muscle_gain') {
    proteinPerKg = 2.0;
    fatPct = 0.25;
  } else if (goal === 'weight_loss') {
    proteinPerKg = 2.1;
    fatPct = 0.25;
  } else if (goal === 'strength') {
    proteinPerKg = 1.9;
    fatPct = 0.28;
  } else if (goal === 'endurance') {
    proteinPerKg = 1.5;
    fatPct = 0.22;
  }

  const proteinGrams = Math.round(Math.min(weightKg * proteinPerKg, targetCalories * 0.35 / 4));
  const fatCalories = targetCalories * fatPct;
  const fatGrams = Math.round(fatCalories / 9);
  const remainingCalories = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
  const carbsGrams = Math.max(50, Math.round(remainingCalories / 4));

  return {
    proteinGrams,
    fatGrams,
    carbsGrams,
  };
}

export function estimateWorkoutCalories(
  durationMinutes: number,
  weightKg: number,
  intensity: 'low' | 'moderate' | 'high' = 'moderate',
): number {
  // MET values: Low = 4.0, Moderate = 6.5, High = 8.5
  const metValues = { low: 4.0, moderate: 6.5, high: 8.5 };
  const met = metValues[intensity];
  // Calories = MET * weight(kg) * (duration in hours)
  return Math.round(met * weightKg * (durationMinutes / 60));
}

// Web Audio API sound generator for countdown and rest timers
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtx = new AudioCtx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playTimerBeep(isFinal: boolean = false) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : 440, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isFinal ? 0.45 : 0.15));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (isFinal ? 0.45 : 0.15));
  } catch {
    // Audio playback optional, fail gracefully
  }
}
