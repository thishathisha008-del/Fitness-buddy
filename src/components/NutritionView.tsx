import React, { useState } from 'react';
import {
  Apple,
  Droplets,
  Flame,
  Utensils,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Heart,
} from 'lucide-react';
import { NutritionPlan, UserProfile } from '../types/fitness';

interface NutritionViewProps {
  nutritionPlan: NutritionPlan;
  profile: UserProfile;
}

export const NutritionView: React.FC<NutritionViewProps> = ({ nutritionPlan, profile }) => {
  const [waterConsumedLiters, setWaterConsumedLiters] = useState(1.5);
  const [expandedMealIdx, setExpandedMealIdx] = useState<number | null>(0);

  const totalCalories = nutritionPlan.dailyCalories;
  const proteinCals = nutritionPlan.proteinGrams * 4;
  const carbsCals = nutritionPlan.carbsGrams * 4;
  const fatCals = nutritionPlan.fatGrams * 9;

  const proteinPct = Math.round((proteinCals / totalCalories) * 100) || 30;
  const carbsPct = Math.round((carbsCals / totalCalories) * 100) || 45;
  const fatPct = Math.round((fatCals / totalCalories) * 100) || 25;

  const waterTarget = nutritionPlan.waterLiters || 2.8;
  const waterProgressPct = Math.min(100, Math.round((waterConsumedLiters / waterTarget) * 100));

  const addWater = (amount: number) => {
    setWaterConsumedLiters((prev) => Math.max(0, Number((prev + amount).toFixed(1))));
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="font-semibold text-emerald-400">{profile.goal.replace('_', ' ').toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{profile.dietaryPreference.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span>AI Personalized Nutrition</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk']">
              Metabolic Fuel & Macronutrient Strategy
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Designed to optimize recovery, retain lean tissue, and fuel performance without unnecessary dietary fatigue.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center shrink-0">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Daily Caloric Target</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
              {nutritionPlan.dailyCalories}
            </span>
            <span className="text-[11px] text-slate-400 block">kcal / day</span>
          </div>
        </div>

        {/* Macronutrient Distribution Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Protein */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Protein</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">{proteinPct}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold font-mono text-white">{nutritionPlan.proteinGrams}</span>
              <span className="text-xs text-slate-400">grams</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: `${proteinPct}%` }} />
            </div>
            <p className="text-[10px] text-slate-500">Supports muscle repair & satiety</p>
          </div>

          {/* Carbs */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Carbohydrates</span>
              <span className="text-[11px] font-mono text-amber-400 font-bold">{carbsPct}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold font-mono text-white">{nutritionPlan.carbsGrams}</span>
              <span className="text-xs text-slate-400">grams</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${carbsPct}%` }} />
            </div>
            <p className="text-[10px] text-slate-500">Fuels glycogen stores for workout intensity</p>
          </div>

          {/* Healthy Fats */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Healthy Fats</span>
              <span className="text-[11px] font-mono text-teal-400 font-bold">{fatPct}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold font-mono text-white">{nutritionPlan.fatGrams}</span>
              <span className="text-xs text-slate-400">grams</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-teal-400" style={{ width: `${fatPct}%` }} />
            </div>
            <p className="text-[10px] text-slate-500">Essential for hormone & joint health</p>
          </div>
        </div>
      </div>

      {/* Hydration Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Daily Hydration Target</h3>
              <p className="text-xs text-slate-400">
                Water maintains cellular volume and joint lubrication
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1 text-right">
              <span className="text-xl font-bold font-mono text-teal-400">{waterConsumedLiters}</span>
              <span className="text-xs text-slate-400">/ {waterTarget} Liters</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => addWater(-0.25)}
                className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg"
                title="Subtract 250ml"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => addWater(0.25)}
                className="px-2.5 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-semibold rounded-lg flex items-center gap-1"
                title="Add 250ml cup"
              >
                <Plus className="w-3 h-3" />
                <span>250ml</span>
              </button>
              <button
                type="button"
                onClick={() => addWater(0.5)}
                className="px-2.5 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-semibold rounded-lg flex items-center gap-1"
                title="Add 500ml bottle"
              >
                <Plus className="w-3 h-3" />
                <span>500ml</span>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${waterProgressPct}%` }}
          />
        </div>
      </div>

      {/* Daily Meal Suggestions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-400" />
            <span>AI Suggested Daily Meals ({nutritionPlan.mealSuggestions.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Tailored for {profile.dietaryPreference.replace('_', ' ')}</span>
        </div>

        <div className="space-y-3">
          {nutritionPlan.mealSuggestions.map((meal, idx) => {
            const isExpanded = expandedMealIdx === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-md"
              >
                <div
                  onClick={() => setExpandedMealIdx(isExpanded ? null : idx)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {meal.mealType}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{meal.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono text-slate-300">{meal.calories} kcal</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-emerald-400">{meal.protein}g Protein</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-amber-400">{meal.carbs}g Carbs</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-teal-400">{meal.fat}g Fat</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400">
                    <span>{isExpanded ? 'Hide recipe' : 'View recipe'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-300 block mb-1.5">Ingredients</span>
                      <ul className="space-y-1 text-slate-400">
                        {meal.ingredients.map((ing, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-slate-300 block mb-1.5">Preparation & Cooking</span>
                      <p className="text-slate-400 leading-relaxed">{meal.preparation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Nutrition Coaching Tips */}
      {nutritionPlan.nutritionTips && nutritionPlan.nutritionTips.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Key Nutritional Principles for Your Program</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {nutritionPlan.nutritionTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start gap-2 leading-relaxed"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
