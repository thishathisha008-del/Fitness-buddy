import { UserProfile, WorkoutPlan, WorkoutSessionLog, ProgressEntry, LibraryExercise, ChatMessage } from '../types/fitness';
import { DEFAULT_EXERCISES } from '../data/defaultExercises';

const STORAGE_KEYS = {
  PROFILE: 'fitbuddy_user_profile',
  ACTIVE_PLAN: 'fitbuddy_active_plan',
  SAVED_PLANS: 'fitbuddy_saved_plans',
  WORKOUT_LOGS: 'fitbuddy_workout_logs',
  PROGRESS_ENTRIES: 'fitbuddy_progress_entries',
  CUSTOM_EXERCISES: 'fitbuddy_custom_exercises',
  CHAT_MESSAGES: 'fitbuddy_chat_messages',
};

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'user-default-1',
  name: 'Alex Morgan',
  age: 28,
  gender: 'female',
  heightCm: 168,
  weightKg: 64,
  unitSystem: 'metric',
  activityLevel: 'moderate',
  fitnessLevel: 'intermediate',
  goal: 'weight_loss',
  equipment: ['Dumbbells', 'Resistance Bands', 'Pull-up Bar', 'Bodyweight'],
  targetDurationMinutes: 45,
  daysPerWeek: 4,
  dietaryPreference: 'high_protein',
  limitations: 'Mild right knee sensitivity on deep squats',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const SAMPLE_DEFAULT_PLAN: WorkoutPlan = {
  id: 'plan-default-1',
  planTitle: '4-Week Metabolic Shred & Core Conditioning',
  summary: 'A scientifically structured split prioritizing hypertrophy, fat loss, and knee-safe leg biomechanics using dumbbells and bodyweight.',
  focus: 'Metabolic Conditioning & Lean Muscle Retention',
  rationale: 'Designed specifically for moderate fitness and joint longevity. Substituted deep barbell back squats with controlled goblet squats and reverse lunges to safeguard the right knee while keeping high training stimulus.',
  expectedProgression: 'Week 1-2: Master tempo and mind-muscle contraction. Week 3-4: Progressively increase dumbbell load by 1-2 kg or add 1-2 reps per set before technical failure.',
  generatedAt: new Date().toISOString(),
  schedule: [
    {
      dayNumber: 1,
      dayName: 'Day 1: Upper Body Push & Core Power',
      isRestDay: false,
      focusMuscles: ['Chest', 'Shoulders', 'Triceps', 'Core'],
      estimatedDuration: 45,
      warmup: [
        { name: 'Arm Circles & Shoulder Dislocates', durationMinutes: 3, cues: 'Gradually increase circle diameter to lubricate glenohumeral joint.' },
        { name: 'Cat-Cow Spinal Waves', durationMinutes: 2, cues: 'Synchronize breath with spinal flexion and extension.' },
      ],
      exercises: [
        {
          id: 'ex-101',
          name: 'Dumbbell Floor Press',
          targetMuscle: 'Chest & Triceps',
          equipment: 'Dumbbells, Mat',
          sets: 4,
          reps: '10-12',
          restSeconds: 60,
          difficulty: 'Beginner',
          instructions: 'Lie flat on floor with knees bent. Hold dumbbells above chest, lower until upper arms graze the mat, then press up with power.',
          formTips: 'Floor limits shoulder hyperextension, keeping the rotator cuff safe.',
          alternativeExercise: 'Push-ups with elevated hands',
          rationale: 'Safeguards shoulders while providing high chest recruitment.',
        },
        {
          id: 'ex-102',
          name: 'Overhead Shoulder Press',
          targetMuscle: 'Deltoids (Shoulders)',
          equipment: 'Dumbbells',
          sets: 3,
          reps: '10',
          restSeconds: 60,
          difficulty: 'Intermediate',
          instructions: 'Seated or standing, press dumbbells overhead until arms are extended, lower under control.',
          formTips: 'Keep ribs tucked down and avoid arching lumbar spine.',
          alternativeExercise: 'Resistance Band Overhead Press',
          rationale: 'Builds shoulder stability and overhead pushing strength.',
        },
        {
          id: 'ex-103',
          name: 'Forearm Plank to Knee Taps',
          targetMuscle: 'Core & Abdominals',
          equipment: 'Mat',
          sets: 3,
          reps: '45 seconds',
          restSeconds: 45,
          difficulty: 'Beginner',
          instructions: 'Hold strong plank and gently alternate tapping each knee to floor without rocking hips.',
          formTips: 'Brace abs as if about to take a punch.',
          alternativeExercise: 'Deadbug',
          rationale: 'Builds deep transverse abdominal endurance without spinal flexion.',
        },
      ],
      cooldown: [
        { name: 'Doorway Chest Stretch', durationMinutes: 2, cues: 'Breathe deeply into rib cage to release pectoral tension.' },
        { name: 'Child’s Pose', durationMinutes: 3, cues: 'Sink hips back into heels and lengthen spine.' },
      ],
    },
    {
      dayNumber: 2,
      dayName: 'Day 2: Knee-Friendly Lower Body & Posterior Chain',
      isRestDay: false,
      focusMuscles: ['Hamstrings', 'Glutes', 'Calves'],
      estimatedDuration: 40,
      warmup: [
        { name: 'Glute Bridges (Bodyweight)', durationMinutes: 3, cues: 'Squeeze glutes hard at the top to awaken hip extensors.' },
        { name: 'Leg Swings & Ankle Circles', durationMinutes: 2, cues: 'Mobilize hips and ankles dynamically.' },
      ],
      exercises: [
        {
          id: 'ex-201',
          name: 'Dumbbell Romanian Deadlift (RDL)',
          targetMuscle: 'Hamstrings & Glutes',
          equipment: 'Dumbbells',
          sets: 4,
          reps: '10-12',
          restSeconds: 75,
          difficulty: 'Intermediate',
          instructions: 'Soft knees, push hips back to wall, slide dumbbells down shins until hamstring stretch, snap hips forward to stand.',
          formTips: 'Hinges the hips without forward knee shear, perfect for knee sensitivities.',
          alternativeExercise: 'Single Leg Glute Bridge',
          rationale: 'Strengthens posterior chain without patellar tendon strain.',
        },
        {
          id: 'ex-202',
          name: 'Supported Goblet Box Squat',
          targetMuscle: 'Quadriceps & Glutes',
          equipment: 'Dumbbell, Chair/Box',
          sets: 3,
          reps: '12',
          restSeconds: 60,
          difficulty: 'Beginner',
          instructions: 'Hold light dumbbell at chest, sit back onto chair with vertical shins, tap box lightly, stand up.',
          formTips: 'Vertical shin angle drastically reduces knee anterior force.',
          alternativeExercise: 'Wall Sit (45s)',
          rationale: 'Maintains quad stimulus while respecting user knee limitation.',
        },
      ],
      cooldown: [
        { name: 'Figure Four Hip Stretch', durationMinutes: 3, cues: 'Relieves outer hip and glute tightness.' },
      ],
    },
    {
      dayNumber: 3,
      dayName: 'Day 3: Active Recovery, Mobility & Low Impact Walk',
      isRestDay: true,
      focusMuscles: ['Full Body Recovery'],
      estimatedDuration: 25,
      warmup: [
        { name: 'Gentle Neck & Shoulder Rolls', durationMinutes: 3, cues: 'Release everyday desk posture tension.' },
      ],
      exercises: [
        {
          id: 'ex-301',
          name: 'Cat-Cow to Child’s Pose Flow',
          targetMuscle: 'Spine & Hips',
          equipment: 'Mat',
          sets: 3,
          reps: '10 smooth cycles',
          restSeconds: 30,
          difficulty: 'Beginner',
          instructions: 'Seamlessly flow between spinal extension and restful child’s pose with deep calm nasal breathing.',
          formTips: 'Never force range of motion; allow gravity and breath to guide.',
          alternativeExercise: 'Sphinx Pose',
          rationale: 'Flushes lactic acid and downregulates the central nervous system.',
        },
      ],
      cooldown: [
        { name: 'Deep Diaphragmatic Box Breathing', durationMinutes: 4, cues: 'Inhale 4s, hold 4s, exhale 4s, hold 4s.' },
      ],
    },
    {
      dayNumber: 4,
      dayName: 'Day 4: Upper Body Pull & Rear Delts',
      isRestDay: false,
      focusMuscles: ['Lats', 'Upper Back', 'Biceps'],
      estimatedDuration: 45,
      warmup: [
        { name: 'Band Pull-Aparts', durationMinutes: 3, cues: 'Activate rhomboids and rear deltoids.' },
      ],
      exercises: [
        {
          id: 'ex-401',
          name: 'Single-Arm Dumbbell Row',
          targetMuscle: 'Lats & Rhomboids',
          equipment: 'Dumbbell, Bench or Chair',
          sets: 4,
          reps: '10 each side',
          restSeconds: 60,
          difficulty: 'Beginner',
          instructions: 'Torso braced, pull dumbbell towards hip pocket, pause and squeeze back at peak.',
          formTips: 'Pull with the elbow, not the wrist.',
          alternativeExercise: 'Resistance Band Bent Over Row',
          rationale: 'Balances anterior chest work and improves posture.',
        },
        {
          id: 'ex-402',
          name: 'Dumbbell Hammer Curls',
          targetMuscle: 'Biceps & Forearms',
          equipment: 'Dumbbells',
          sets: 3,
          reps: '12',
          restSeconds: 45,
          difficulty: 'Beginner',
          instructions: 'Palms facing each other throughout the curl, controlled lower.',
          formTips: 'Pin elbows to sides; eliminate torso swing.',
          alternativeExercise: 'Resistance Band Curls',
          rationale: 'Builds arm pulling power and tendon strength.',
        },
      ],
      cooldown: [
        { name: 'Overhead Lat Stretch', durationMinutes: 3, cues: 'Gently grasp wrist and lean laterally.' },
      ],
    },
    {
      dayNumber: 5,
      dayName: 'Day 5: Full Body Metabolic Circuit & Core',
      isRestDay: false,
      focusMuscles: ['Full Body', 'Cardio', 'Core'],
      estimatedDuration: 35,
      warmup: [
        { name: 'Jumping Jacks / Step Jacks', durationMinutes: 3, cues: 'Elevate core body temperature smoothly.' },
      ],
      exercises: [
        {
          id: 'ex-501',
          name: 'Dumbbell Push Press',
          targetMuscle: 'Full Body & Deltoids',
          equipment: 'Dumbbells',
          sets: 3,
          reps: '12',
          restSeconds: 60,
          difficulty: 'Intermediate',
          instructions: 'Slight dip at knees and hips, drive upwards through legs and punch dumbbells overhead.',
          formTips: 'Seamless kinetic chain transfer from lower to upper body.',
          alternativeExercise: 'Dumbbell Strict Press',
          rationale: 'High metabolic burn and compound muscle recruitment.',
        },
      ],
      cooldown: [
        { name: 'Standing Hamstring & Quad Flush', durationMinutes: 3, cues: 'Gentle static hold to return heart rate to baseline.' },
      ],
    },
    {
      dayNumber: 6,
      dayName: 'Day 6: Rest & Hydration Protocol',
      isRestDay: true,
      focusMuscles: ['Recovery'],
      estimatedDuration: 20,
      warmup: [],
      exercises: [],
      cooldown: [],
    },
    {
      dayNumber: 7,
      dayName: 'Day 7: Weekly Reflection & Light Stretch',
      isRestDay: true,
      focusMuscles: ['Mobility & Mental Focus'],
      estimatedDuration: 15,
      warmup: [],
      exercises: [],
      cooldown: [],
    },
  ],
  nutritionPlan: {
    dailyCalories: 1850,
    proteinGrams: 135,
    carbsGrams: 175,
    fatGrams: 55,
    waterLiters: 2.8,
    nutritionTips: [
      'Aim for 30g of high quality protein per major meal to support muscle protein synthesis.',
      'Prioritize complex carbohydrates (oats, sweet potato, quinoa) 90 minutes before your workout.',
      'Drink 500ml of water immediately upon waking to kickstart hydration.',
      'Keep evening meals moderate in sodium and high in fiber to aid sleep and gut recovery.',
    ],
    mealSuggestions: [
      {
        mealType: 'Breakfast',
        title: 'Protein Power Berry Oatmeal',
        calories: 420,
        protein: 32,
        carbs: 52,
        fat: 9,
        ingredients: ['Rolled oats (50g)', 'Whey/Plant protein powder (30g)', 'Blueberries (80g)', 'Chia seeds (10g)', 'Almond milk'],
        preparation: 'Cook oats with almond milk, stir in protein powder once warm, top with antioxidant berries and chia seeds.',
      },
      {
        mealType: 'Lunch',
        title: 'Mediterranean Grilled Chicken & Quinoa Bowl',
        calories: 540,
        protein: 42,
        carbs: 48,
        fat: 16,
        ingredients: ['Chicken breast (150g)', 'Cooked quinoa (120g)', 'Cucumbers', 'Cherry tomatoes', 'Kalamata olives', 'Olive oil (1 tsp)'],
        preparation: 'Grill seasoned chicken breast, slice over cooked quinoa, toss with diced fresh veggies, light olive oil, and lemon vinaigrette.',
      },
      {
        mealType: 'Dinner',
        title: 'Pan-Seared Salmon with Roasted Sweet Potato & Asparagus',
        calories: 590,
        protein: 40,
        carbs: 45,
        fat: 22,
        ingredients: ['Wild salmon fillet (160g)', 'Cubed sweet potato (150g)', 'Fresh asparagus spears (100g)', 'Garlic & herbs'],
        preparation: 'Roast sweet potatoes and asparagus at 200°C for 25 mins. Sear salmon skin-side down for 4 mins, flip for 3 mins.',
      },
      {
        mealType: 'Post-Workout Snack',
        title: 'Greek Yogurt & Honey Crunch',
        calories: 220,
        protein: 21,
        carbs: 24,
        fat: 4,
        ingredients: ['Non-fat Greek yogurt (170g)', 'Raw honey (1 tsp)', 'Crushed walnuts (10g)'],
        preparation: 'Spoon cold Greek yogurt into a bowl, drizzle with raw honey and sprinkle with crushed omega-rich walnuts.',
      },
    ],
  },
};

export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading user profile from localStorage', e);
  }
  return INITIAL_USER_PROFILE;
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed saving user profile to localStorage', e);
  }
}

export function getStoredActivePlan(): WorkoutPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading active plan from localStorage', e);
  }
  return SAMPLE_DEFAULT_PLAN;
}

export function saveStoredActivePlan(plan: WorkoutPlan): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.error('Failed saving active plan to localStorage', e);
  }
}

export function getStoredWorkoutLogs(): WorkoutSessionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading workout logs', e);
  }
  // Return sample logs for immediate dashboard richness
  return [
    {
      id: 'log-1',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      planTitle: '4-Week Metabolic Shred',
      dayNumber: 1,
      dayName: 'Day 1: Upper Body Push & Core Power',
      durationMinutes: 44,
      estimatedCaloriesBurned: 310,
      exercises: [
        { exerciseId: 'ex-101', name: 'Dumbbell Floor Press', targetMuscle: 'Chest', setsCompleted: 4, totalSets: 4, repsDone: '12, 12, 10, 10', weightUsed: '14 kg' },
        { exerciseId: 'ex-102', name: 'Overhead Shoulder Press', targetMuscle: 'Shoulders', setsCompleted: 3, totalSets: 3, repsDone: '10, 10, 8', weightUsed: '10 kg' },
      ],
      notes: 'Felt strong on the floor press! Shoulders felt completely pain-free.',
    },
    {
      id: 'log-2',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      planTitle: '4-Week Metabolic Shred',
      dayNumber: 2,
      dayName: 'Day 2: Knee-Friendly Lower Body & Posterior Chain',
      durationMinutes: 38,
      estimatedCaloriesBurned: 275,
      exercises: [
        { exerciseId: 'ex-201', name: 'Dumbbell Romanian Deadlift (RDL)', targetMuscle: 'Hamstrings', setsCompleted: 4, totalSets: 4, repsDone: '12, 12, 10, 10', weightUsed: '18 kg' },
        { exerciseId: 'ex-202', name: 'Supported Goblet Box Squat', targetMuscle: 'Quadriceps', setsCompleted: 3, totalSets: 3, repsDone: '12, 12, 12', weightUsed: '12 kg' },
      ],
      notes: 'Knee had zero irritation. Hamstrings on fire!',
    },
  ];
}

export function saveStoredWorkoutLogs(logs: WorkoutSessionLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed saving workout logs', e);
  }
}

export function saveStoredWorkoutLog(log: WorkoutSessionLog): void {
  try {
    const logs = getStoredWorkoutLogs();
    logs.unshift(log);
    saveStoredWorkoutLogs(logs);
  } catch (e) {
    console.error('Failed saving workout log', e);
  }
}

export function getStoredProgressEntries(): ProgressEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS_ENTRIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading progress entries', e);
  }
  // Default seed entries
  return [
    { id: 'p-1', date: '2026-08-25', weightKg: 66.2, bmi: 23.5, notes: 'Starting FitBuddy program' },
    { id: 'p-2', date: '2026-09-01', weightKg: 65.5, bmi: 23.2, notes: 'Feeling higher daily energy' },
    { id: 'p-3', date: '2026-09-08', weightKg: 64.9, bmi: 23.0, notes: 'Hit personal best on RDL' },
    { id: 'p-4', date: '2026-09-15', weightKg: 64.4, bmi: 22.8, notes: 'Visible core definition' },
    { id: 'p-5', date: '2026-09-22', weightKg: 64.0, bmi: 22.7, notes: 'Down 2.2 kg safely and feeling lean' },
  ];
}

export function saveStoredProgressEntries(entries: ProgressEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS_ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed saving progress entries', e);
  }
}

export function saveStoredProgressEntry(entry: ProgressEntry): void {
  try {
    const entries = getStoredProgressEntries();
    const existingIndex = entries.findIndex(e => e.date === entry.date);
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
      entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    saveStoredProgressEntries(entries);
  } catch (e) {
    console.error('Failed saving progress entry', e);
  }
}

export function getStoredExercises(): LibraryExercise[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
    if (raw) {
      const custom: LibraryExercise[] = JSON.parse(raw);
      return [...DEFAULT_EXERCISES, ...custom];
    }
  } catch (e) {
    console.error('Failed reading custom exercises', e);
  }
  return DEFAULT_EXERCISES;
}

export const getAllExercises = getStoredExercises;

export function saveCustomExercise(exercise: LibraryExercise): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
    const custom: LibraryExercise[] = raw ? JSON.parse(raw) : [];
    custom.push(exercise);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(custom));
  } catch (e) {
    console.error('Failed saving custom exercise', e);
  }
}

export function deleteCustomExercise(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
    if (raw) {
      const custom: LibraryExercise[] = JSON.parse(raw);
      const filtered = custom.filter(ex => ex.id !== id);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error('Failed deleting custom exercise', e);
  }
}

export function getStoredChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading chat messages', e);
  }
  return [
    {
      id: 'init-1',
      role: 'assistant',
      content: '👋 Hey Alex! I am your FitBuddy AI Coach. I have your 4-week metabolic plan loaded. Ask me anything about your exercises, technique cues, substitutions, or post-workout nutrition!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];
}

export function saveStoredChatMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed saving chat messages', e);
  }
}

export function calculateStreak(logs: WorkoutSessionLog[]): number {
  if (!logs || logs.length === 0) return 0;
  
  // Set of dates sorted descending
  const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  let streak = 1;
  const oneDayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const curr = new Date(uniqueDates[i]).getTime();
    const prev = new Date(uniqueDates[i + 1]).getTime();
    const diffDays = Math.round((curr - prev) / oneDayMs);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error('Failed clearing storage', e);
  }
}

