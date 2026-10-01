import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini client on server with recommended headers
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Schema for structured workout and nutrition plan
  const planResponseSchema = {
    type: Type.OBJECT,
    properties: {
      planTitle: { type: Type.STRING, description: 'Creative, inspiring title for the personalized plan' },
      summary: { type: Type.STRING, description: 'Overview summary of the fitness program strategy' },
      focus: { type: Type.STRING, description: 'Core training focus (e.g. Hypertrophy, Fat Loss, Core Stability)' },
      rationale: { type: Type.STRING, description: 'AI-Based Plan Explanation: why this routine and exercise choices were chosen given age, goals, and limitations' },
      expectedProgression: { type: Type.STRING, description: 'Advice on progressive overload, weight increments, and progression week over week' },
      schedule: {
        type: Type.ARRAY,
        description: 'Days of the weekly schedule',
        items: {
          type: Type.OBJECT,
          properties: {
            dayNumber: { type: Type.INTEGER, description: 'Day number 1 to 7' },
            dayName: { type: Type.STRING, description: 'E.g., Day 1: Upper Body Push & Core' },
            isRestDay: { type: Type.BOOLEAN, description: 'Whether this day is a dedicated rest/recovery day' },
            focusMuscles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Target muscle groups for the day',
            },
            estimatedDuration: { type: Type.INTEGER, description: 'Estimated total minutes for this workout' },
            warmup: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  cues: { type: Type.STRING },
                },
                required: ['name', 'durationMinutes', 'cues'],
              },
            },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  targetMuscle: { type: Type.STRING },
                  equipment: { type: Type.STRING },
                  sets: { type: Type.INTEGER },
                  reps: { type: Type.STRING, description: 'E.g., 8-12, 15, or 45s hold' },
                  restSeconds: { type: Type.INTEGER },
                  difficulty: { type: Type.STRING, description: 'Beginner, Intermediate, or Advanced' },
                  instructions: { type: Type.STRING, description: 'Step-by-step key form instructions' },
                  formTips: { type: Type.STRING, description: 'Crucial cues to prevent injury and maximize muscle activation' },
                  alternativeExercise: { type: Type.STRING, description: 'Safe substitute exercise requiring minimal or alternative equipment' },
                  rationale: { type: Type.STRING, description: 'Why this exercise was selected for this user' },
                },
                required: ['id', 'name', 'targetMuscle', 'equipment', 'sets', 'reps', 'restSeconds', 'difficulty', 'instructions', 'formTips', 'alternativeExercise', 'rationale'],
              },
            },
            cooldown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  cues: { type: Type.STRING },
                },
                required: ['name', 'durationMinutes', 'cues'],
              },
            },
          },
          required: ['dayNumber', 'dayName', 'isRestDay', 'focusMuscles', 'estimatedDuration', 'warmup', 'exercises', 'cooldown'],
        },
      },
      nutritionPlan: {
        type: Type.OBJECT,
        properties: {
          dailyCalories: { type: Type.INTEGER, description: 'Target daily caloric intake' },
          proteinGrams: { type: Type.INTEGER, description: 'Target daily protein in grams' },
          carbsGrams: { type: Type.INTEGER, description: 'Target daily carbohydrates in grams' },
          fatGrams: { type: Type.INTEGER, description: 'Target daily fats in grams' },
          waterLiters: { type: Type.NUMBER, description: 'Recommended daily water intake in liters' },
          nutritionTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key nutritional principles aligned with the goal',
          },
          mealSuggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                mealType: { type: Type.STRING, description: 'Breakfast, Lunch, Dinner, or Post-Workout Snack' },
                title: { type: Type.STRING },
                calories: { type: Type.INTEGER },
                protein: { type: Type.INTEGER },
                carbs: { type: Type.INTEGER },
                fat: { type: Type.INTEGER },
                ingredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                preparation: { type: Type.STRING },
              },
              required: ['mealType', 'title', 'calories', 'protein', 'carbs', 'fat', 'ingredients', 'preparation'],
            },
          },
        },
        required: ['dailyCalories', 'proteinGrams', 'carbsGrams', 'fatGrams', 'waterLiters', 'nutritionTips', 'mealSuggestions'],
      },
    },
    required: ['planTitle', 'summary', 'focus', 'rationale', 'expectedProgression', 'schedule', 'nutritionPlan'],
  };

  // Endpoint: Generate Full Personalized Plan
  app.post('/api/generate-plan', async (req, res) => {
    try {
      const { profile } = req.body;
      if (!profile) {
        return res.status(400).json({ error: 'User profile is required' });
      }

      const prompt = `You are FitBuddy's elite certified personal trainer and sports nutritionist.
Generate a structured, safe, science-backed workout and nutrition plan for the following user:

USER PROFILE & FITNESS ASSESSMENT:
- Name: ${profile.name || 'Athlete'}
- Age: ${profile.age} years old
- Gender: ${profile.gender}
- Height: ${profile.heightCm} cm
- Weight: ${profile.weightKg} kg (Calculated BMI: ${(profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)})
- Activity Level: ${profile.activityLevel}
- Experience Level: ${profile.fitnessLevel}
- Primary Goal: ${profile.goal}
- Available Equipment: ${Array.isArray(profile.equipment) ? profile.equipment.join(', ') : profile.equipment}
- Target Workout Duration: ${profile.targetDurationMinutes} minutes per session
- Frequency: ${profile.daysPerWeek} training days per week (provide 7 days total with active rest/recovery for off days)
- Dietary Preference: ${profile.dietaryPreference}
- Health & Physical Limitations / Injuries: ${profile.limitations || 'None reported'}

CRITICAL GUIDELINES:
1. STRICTLY respect all injuries and limitations. Never prescribe exercises that exacerbate reported pains (e.g. if knee pain is reported, avoid deep knee flexion or heavy impact; provide joint-friendly alternatives).
2. ONLY use exercises compatible with their available equipment.
3. Every exercise must include exact sets, rep schemes, rest periods, precise technique cues, an immediate alternative substitute, and an explicit rationale for why it was selected.
4. Nutrition recommendations must be realistic, tailored to their goal (${profile.goal}), and respect dietary preferences (${profile.dietaryPreference}).
5. Generate an inspiring, actionable 7-day schedule with exact workout routines.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite exercise physiologist and certified sports dietitian. Always output valid JSON conforming strictly to the requested schema. Ensure scientific accuracy and safe biomechanics.',
          responseMimeType: 'application/json',
          responseSchema: planResponseSchema,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('No response generated from Gemini');
      }

      const planData = JSON.parse(text);
      return res.json({ success: true, plan: planData });
    } catch (error: any) {
      console.error('Error generating plan:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate fitness plan' });
    }
  });

  // Endpoint: Dynamic Plan Modification
  app.post('/api/modify-plan', async (req, res) => {
    try {
      const { currentPlan, instruction, profile } = req.body;
      if (!currentPlan || !instruction) {
        return res.status(400).json({ error: 'Current plan and modification instruction are required' });
      }

      const prompt = `You are FitBuddy's AI Coach. The user has an existing workout plan and wants to make an immediate modification.

USER MODIFICATION REQUEST: "${instruction}"

USER PROFILE CONTEXT:
- Goal: ${profile?.goal || 'General Fitness'}
- Level: ${profile?.fitnessLevel || 'Intermediate'}
- Equipment: ${Array.isArray(profile?.equipment) ? profile.equipment.join(', ') : 'Any'}
- Limitations: ${profile?.limitations || 'None'}

EXISTING PLAN TITLE: ${currentPlan.planTitle}
EXISTING FOCUS: ${currentPlan.focus}

INSTRUCTIONS FOR MODIFICATION:
- Adapt the plan according to the user's specific request (e.g., "only have 20 minutes today", "no dumbbells", "make this easier", "knee is hurting", "higher intensity").
- Keep the overall structure coherent and update the title/summary to reflect the modification.
- Update the relevant day(s), sets, reps, exercises, or durations as requested.
- Maintain high safety standards and accurate JSON structure.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert fitness coach dynamically adjusting workout plans. Return a fully updated plan in valid JSON adhering to the plan schema.',
          responseMimeType: 'application/json',
          responseSchema: planResponseSchema,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('No response text received from Gemini');
      }

      const modifiedPlan = JSON.parse(text);
      return res.json({ success: true, plan: modifiedPlan });
    } catch (error: any) {
      console.error('Error modifying plan:', error);
      return res.status(500).json({ error: error.message || 'Failed to modify fitness plan' });
    }
  });

  // Endpoint: Smart Exercise Substitution
  app.post('/api/substitute-exercise', async (req, res) => {
    try {
      const { exerciseName, targetMuscle, reason, availableEquipment } = req.body;
      if (!exerciseName) {
        return res.status(400).json({ error: 'Exercise name is required' });
      }

      const substitutionSchema = {
        type: Type.OBJECT,
        properties: {
          substitutes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                targetMuscle: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                equipment: { type: Type.STRING },
                instructions: { type: Type.STRING },
                whyItWorks: { type: Type.STRING, description: 'Biomechanic explanation of why this is a prime substitute' },
              },
              required: ['name', 'targetMuscle', 'difficulty', 'equipment', 'instructions', 'whyItWorks'],
            },
          },
        },
        required: ['substitutes'],
      };

      const prompt = `The user wants to replace the exercise "${exerciseName}" (Target Muscle: ${targetMuscle || 'Various'}).
Reason for replacement: "${reason || 'Equipment limitation or discomfort'}".
Available Equipment: "${availableEquipment || 'Bodyweight, Dumbbells'}".

Provide 3 smart, biomechanically sound substitute exercises ranging from bodyweight to basic equipment. Explain why each works as an alternative.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a strength and conditioning specialist. Suggest 3 superior alternative exercises.',
          responseMimeType: 'application/json',
          responseSchema: substitutionSchema,
        },
      });

      const text = response.text;
      const data = JSON.parse(text || '{"substitutes":[]}');
      return res.json({ success: true, substitutes: data.substitutes });
    } catch (error: any) {
      console.error('Error substituting exercise:', error);
      return res.status(500).json({ error: error.message || 'Failed to substitute exercise' });
    }
  });

  // Endpoint: AI Fitness Coach Chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, userContext } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const systemInstruction = `You are FitBuddy Coach, an encouraging, knowledgeable, and certified fitness expert and nutritionist.
The user's current context:
- Goal: ${userContext?.goal || 'General Health'}
- Fitness Level: ${userContext?.fitnessLevel || 'Intermediate'}
- Equipment: ${userContext?.equipment || 'Standard'}
- Limitations / Injuries: ${userContext?.limitations || 'None'}
- Current Plan Focus: ${userContext?.currentPlanFocus || 'Personalized Routine'}

Provide concise, empathetic, and actionable advice. Use bullet points for steps or exercise substitutions.
Always remind users that your advice is informational and they should listen to their bodies and consult a physician for acute pain.`;

      // Format conversation turns for generateContent
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      return res.json({
        success: true,
        reply: response.text || 'I am here to help you crush your fitness goals! What would you like to work on?',
      });
    } catch (error: any) {
      console.error('Error in chat:', error);
      return res.status(500).json({ error: error.message || 'Failed to get coach response' });
    }
  });

  // Endpoint: AI Fitness Futures & Body Projections
  const futureProjectionSchema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: {
        type: Type.STRING,
        description: 'Compelling science-based forecast of user transformation based on adherence and biometrics',
      },
      timeframeMilestones: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            timeframe: { type: Type.STRING, description: 'e.g. 30 Days, 60 Days, 90 Days' },
            projectedWeightKg: { type: Type.NUMBER, description: 'Projected realistic weight in kg' },
            projectedBodyFatDelta: { type: Type.NUMBER, description: 'Estimated body fat % change e.g. -2.5 or -4.0' },
            strengthIncreasePercent: { type: Type.INTEGER, description: 'Estimated % strength boost on compound lifts' },
            enduranceIncreasePercent: { type: Type.INTEGER, description: 'Estimated % stamina / aerobic work capacity boost' },
            physiologicalAdaptations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key physiological and metabolic changes at this stage',
            },
            keyMilestones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Tangible milestones achieved',
            },
            mindsetAdvice: { type: Type.STRING, description: 'Psychological and motivation tip for this milestone' },
          },
          required: [
            'timeframe',
            'projectedWeightKg',
            'projectedBodyFatDelta',
            'strengthIncreasePercent',
            'enduranceIncreasePercent',
            'physiologicalAdaptations',
            'keyMilestones',
            'mindsetAdvice',
          ],
        },
      },
      potentialBottlenecks: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Anticipated plateaus or pitfalls (e.g. week 3 soreness, dietary slip-ups) and how to overcome them',
      },
      recommendedHabits: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Top high-leverage lifestyle habits to ensure maximum adherence',
      },
    },
    required: ['executiveSummary', 'timeframeMilestones', 'potentialBottlenecks', 'recommendedHabits'],
  };

  app.post('/api/future-projection', async (req, res) => {
    try {
      const { profile, adherenceRate = 85, activePlanFocus = 'Personalized Fitness' } = req.body;
      if (!profile) {
        return res.status(400).json({ error: 'User profile is required' });
      }

      const prompt = `You are FitBuddy's Chief Exercise Physiologist & Predictive Performance Scientist.
Predict the physiological, strength, weight, and fitness trajectory for this athlete over 30, 60, and 90 days.

USER STATS:
- Name: ${profile.name || 'Athlete'}
- Age: ${profile.age} | Gender: ${profile.gender}
- Height: ${profile.heightCm} cm | Current Weight: ${profile.weightKg} kg
- Fitness Goal: ${profile.goal}
- Experience Level: ${profile.fitnessLevel}
- Workout Frequency: ${profile.daysPerWeek} days/week, ${profile.targetDurationMinutes} mins/session
- Current Plan Strategy: ${activePlanFocus}
- Projected Plan Adherence: ${adherenceRate}%

GUIDELINES:
- Provide realistic, science-grounded biometric projections (realistic weight changes: healthy fat loss ~0.5-1kg/week max; muscle gain ~0.25-0.5kg/week for beginners/intermediates).
- Adjust estimates realistically based on the adherence rate (${adherenceRate}%).
- Include distinct milestones for 30 Days, 60 Days, and 90 Days.
- Highlight physiological adaptations (e.g. mitochondrial density, neuromuscular recruitment, insulin sensitivity).
- Identify potential friction points/bottlenecks around weeks 3-4 and 7-8 and give actionable solutions.
- Output JSON strictly complying with the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite sports scientist providing realistic biometric projections in structured JSON.',
          responseMimeType: 'application/json',
          responseSchema: futureProjectionSchema,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('No projection generated');
      }

      const projection = JSON.parse(text);
      return res.json({ success: true, projection });
    } catch (error: any) {
      console.error('Error generating future projection:', error);
      // Fallback deterministic projection so the UI always works smoothly even on network hiccup
      const profile = req.body?.profile || { weightKg: 75, goal: 'weight_loss' };
      const currentWeight = Number(profile.weightKg) || 75;
      const isLoss = profile.goal === 'weight_loss';
      const isGain = profile.goal === 'muscle_gain' || profile.goal === 'strength';
      const factor = req.body?.adherenceRate ? req.body.adherenceRate / 100 : 0.85;

      const fallback = {
        executiveSummary: `Based on your biometrics and ${Math.round(factor * 100)}% adherence, your body is primed for progressive metabolic rewiring and consistent neuromuscular strength development over the next 90 days.`,
        timeframeMilestones: [
          {
            timeframe: '30 Days',
            projectedWeightKg: Number((isLoss ? currentWeight - 2.2 * factor : isGain ? currentWeight + 1.1 * factor : currentWeight - 0.5).toFixed(1)),
            projectedBodyFatDelta: isLoss ? -1.8 : -0.8,
            strengthIncreasePercent: Math.round(12 * factor),
            enduranceIncreasePercent: Math.round(18 * factor),
            physiologicalAdaptations: [
              'Enhanced neuromuscular coordination and motor unit firing rate',
              'Initial mitochondrial biogenesis increasing glycogen efficiency',
              'Improved insulin sensitivity and postprandial glucose uptake',
            ],
            keyMilestones: [
              'Comfortably complete all scheduled sets without early exhaustion',
              'Noticeable resting posture improvement and core stabilization',
              'Recovery time between sets cut by ~15-20 seconds',
            ],
            mindsetAdvice: 'Week 2-3 often brings an initial motivation plateau; focus on identity-based consistency rather than instantaneous scale shifts.',
          },
          {
            timeframe: '60 Days',
            projectedWeightKg: Number((isLoss ? currentWeight - 4.5 * factor : isGain ? currentWeight + 2.2 * factor : currentWeight - 1.0).toFixed(1)),
            projectedBodyFatDelta: isLoss ? -3.5 : -1.8,
            strengthIncreasePercent: Math.round(24 * factor),
            enduranceIncreasePercent: Math.round(32 * factor),
            physiologicalAdaptations: [
              'Hypertrophic micro-adaptations in target skeletal muscle fibers',
              'Elevated basal metabolic rate (BMR) from increased lean mass ratio',
              'Increased capillary density for faster intra-workout lactic acid clearance',
            ],
            keyMilestones: [
              'Visible muscle tone and waistline reduction of 1.5–3 cm',
              'Progressed to heavier dumbbell/weight increments across primary lifts',
              'Day-to-day energy levels steady without mid-afternoon energy crashes',
            ],
            mindsetAdvice: 'Your habits have formed neuro-pathways. Protect your sleep and hydration as progressive overload intensifies.',
          },
          {
            timeframe: '90 Days',
            projectedWeightKg: Number((isLoss ? currentWeight - 6.8 * factor : isGain ? currentWeight + 3.4 * factor : currentWeight - 1.5).toFixed(1)),
            projectedBodyFatDelta: isLoss ? -5.2 : -2.8,
            strengthIncreasePercent: Math.round(38 * factor),
            enduranceIncreasePercent: Math.round(48 * factor),
            physiologicalAdaptations: [
              'Significant body recomposition with high metabolic efficiency',
              'Enhanced joint connective tissue tensile strength and bone mineral density',
              'Optimized hormonal regulation supporting deeper REM/slow-wave sleep',
            ],
            keyMilestones: [
              'Achieved baseline body composition transformation milestone',
              'Compound lift capacity up by over 30% from day one assessment',
              'Workout routine feels as natural and automatic as brushing teeth',
            ],
            mindsetAdvice: 'Celebrate the cumulative discipline! Transition into a progressive maintenance or advanced specialization cycle.',
          },
        ],
        potentialBottlenecks: [
          'Week 3 "Honeymoon phase fade" — mitigate by scheduling workouts as fixed calendar appointments.',
          'Week 6 weight scale fluctuation due to muscle glycogen and water retention — rely on mirror checks and workout logs rather than just daily scale readings.',
          'Nutrition fatigue — incorporate the high-protein recipe variations from your AI Nutrition tab.',
        ],
        recommendedHabits: [
          'Target 2.0–2.5 liters of water daily to support muscle recovery and thermogenesis.',
          'Log every completed session in FitBuddy to visually lock in your weekly streak.',
          'Prioritize 7.5+ hours of sleep for peak human growth hormone and muscle recovery.',
        ],
      };

      return res.json({ success: true, projection: fallback });
    }
  });

  // Serve Frontend
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
