export type Gender = 'male' | 'female' | 'non-binary' | 'other';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_fitness';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type DietaryPreference = 'omnivore' | 'high_protein' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'low_carb';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  unitSystem: 'metric' | 'imperial';
  activityLevel: ActivityLevel;
  fitnessLevel: FitnessLevel;
  goal: FitnessGoal;
  equipment: string[];
  targetDurationMinutes: number;
  daysPerWeek: number;
  dietaryPreference: DietaryPreference;
  limitations: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarmupCooldownItem {
  name: string;
  durationMinutes: number;
  cues: string;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  secondaryMuscles?: string[];
  equipment: string;
  sets: number;
  reps: string;
  restSeconds: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string;
  formTips: string;
  alternativeExercise: string;
  rationale: string;
}

export interface WorkoutDay {
  dayNumber: number;
  dayName: string;
  isRestDay: boolean;
  focusMuscles: string[];
  estimatedDuration: number;
  warmup: WarmupCooldownItem[];
  exercises: Exercise[];
  cooldown: WarmupCooldownItem[];
}

export interface MealSuggestion {
  mealType: string;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  preparation: string;
}

export interface NutritionPlan {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
  nutritionTips: string[];
  mealSuggestions: MealSuggestion[];
}

export interface WorkoutPlan {
  id: string;
  planTitle: string;
  summary: string;
  focus: string;
  rationale: string;
  expectedProgression: string;
  schedule: WorkoutDay[];
  nutritionPlan: NutritionPlan;
  generatedAt: string;
  modifiedAt?: string;
  modificationsHistory?: string[];
}

export interface ExerciseLogDetail {
  exerciseId: string;
  name: string;
  targetMuscle: string;
  setsCompleted: number;
  totalSets: number;
  repsDone: string;
  weightUsed?: string;
}

export interface WorkoutSessionLog {
  id: string;
  date: string;
  planTitle: string;
  dayNumber: number;
  dayName: string;
  durationMinutes: number;
  estimatedCaloriesBurned: number;
  exercises: ExerciseLogDetail[];
  notes?: string;
}

export interface ProgressEntry {
  id: string;
  date: string;
  weightKg: number;
  bmi: number;
  notes?: string;
}

export interface LibraryExercise {
  id: string;
  name: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  instructions: string[];
  commonMistakes: string[];
  alternatives: string[];
  isCustom?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface FutureMilestone {
  timeframe: string;
  projectedWeightKg: number;
  projectedBodyFatDelta: number;
  strengthIncreasePercent: number;
  enduranceIncreasePercent: number;
  physiologicalAdaptations: string[];
  keyMilestones: string[];
  mindsetAdvice: string;
}

export interface FutureProjectionResponse {
  executiveSummary: string;
  timeframeMilestones: FutureMilestone[];
  potentialBottlenecks: string[];
  recommendedHabits: string[];
}

