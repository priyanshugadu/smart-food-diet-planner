import React, { useState, useEffect } from 'react';
import {
  User,
  Scale,
  Flame,
  Droplets,
  ShieldAlert,
  Save,
  CheckCircle2,
  Activity,
  Heart,
  Info,
} from 'lucide-react';
import { ActivityLevel, DietaryPreference, FitnessGoal, Gender, UserProfile } from '../types';
import { calculateNutritionTargets, MEDICAL_DISCLAIMER } from '../utils/nutritionCalculations';

interface ProfileViewProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => Promise<void>;
}

const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Dairy / Lactose',
  'Gluten / Wheat',
  'Soy',
  'Eggs',
  'Fish / Seafood',
  'Sesame',
];

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onSaveProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  // Live dynamic calculation based on current form values
  const targets = calculateNutritionTargets(formData);

  const toggleAllergy = (allergy: string) => {
    const current = formData.allergies || [];
    const exists = current.includes(allergy);
    const updated = exists ? current.filter((a) => a !== allergy) : [...current, allergy];
    setFormData({ ...formData, allergies: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const updatedProfile: UserProfile = {
        ...formData,
        target_calories: targets.targetCalories,
        target_protein: targets.targetProtein,
        target_water: targets.targetWater,
      };
      await onSaveProfile(updatedProfile);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <strong>Health & Medical Notice:</strong> {MEDICAL_DISCLAIMER}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Personal Nutrition Profile</h3>
              <p className="text-xs text-slate-500">
                Update your biometric metrics to calibrate metabolic formulas and calorie targets
              </p>
            </div>
            {savedSuccess && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile Saved!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age (years)
                </label>
                <input
                  id="profile-age"
                  type="number"
                  min="10"
                  max="110"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Gender & Dietary Preference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  id="profile-gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Non-Binary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dietary Preference
                </label>
                <select
                  id="profile-dietary"
                  value={formData.dietary_preference}
                  onChange={(e) =>
                    setFormData({ ...formData, dietary_preference: e.target.value as DietaryPreference })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="vegetarian">Vegetarian (Lacto-Ovo)</option>
                  <option value="non_vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan (100% Plant-Based)</option>
                </select>
              </div>
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Height: <span className="text-emerald-700 font-bold">{formData.height} cm</span> ({(formData.height / 30.48).toFixed(1)} ft)
                </label>
                <input
                  id="profile-height-slider"
                  type="range"
                  min="120"
                  max="220"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weight: <span className="text-emerald-700 font-bold">{formData.weight} kg</span> ({(formData.weight * 2.20462).toFixed(1)} lbs)
                </label>
                <input
                  id="profile-weight-slider"
                  type="range"
                  min="30"
                  max="160"
                  step="0.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="30"
                  max="250"
                  step="0.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Activity Level & Fitness Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Activity Level
                </label>
                <select
                  id="profile-activity"
                  value={formData.activity_level}
                  onChange={(e) =>
                    setFormData({ ...formData, activity_level: e.target.value as ActivityLevel })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="sedentary">Sedentary (Little or no exercise)</option>
                  <option value="light">Lightly Active (Exercise 1-3 days/week)</option>
                  <option value="moderate">Moderately Active (Exercise 3-5 days/week)</option>
                  <option value="very_active">Very Active (Hard exercise 6-7 days/week)</option>
                  <option value="extra_active">Extra Active (Very hard exercise / physical job)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fitness Goal
                </label>
                <select
                  id="profile-fitness-goal"
                  value={formData.fitness_goal}
                  onChange={(e) =>
                    setFormData({ ...formData, fitness_goal: e.target.value as FitnessGoal })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="weight_loss">Weight Loss (Caloric Deficit -500 kcal)</option>
                  <option value="muscle_gain">Muscle Gain (High Protein Hypertrophy)</option>
                  <option value="maintain_weight">Maintain Weight (Caloric Equilibrium)</option>
                  <option value="weight_gain">Weight Gain (Caloric Surplus +450 kcal)</option>
                </select>
              </div>
            </div>

            {/* Food Allergies */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Food Allergies & Intolerances
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map((allergy) => {
                  const selected = (formData.allergies || []).includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleAllergy(allergy)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-rose-100 text-rose-700 border border-rose-300 shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                      }`}
                    >
                      {selected ? '✕ ' : '+ '}
                      {allergy}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Food Preferences & Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Food Preferences & Notes
              </label>
              <textarea
                id="profile-food-preferences"
                rows={2}
                value={formData.food_preferences}
                onChange={(e) => setFormData({ ...formData, food_preferences: e.target.value })}
                placeholder="e.g. Loves North Indian dishes, prefers soya/paneer over protein powders, drinks green tea in morning..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                id="btn-save-profile"
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Profile...' : 'Save & Recalibrate Nutrition Plan'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Live Calorie & BMI Analysis Card */}
        <div className="space-y-5">
          {/* BMI Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-sm">Body Mass Index (BMI)</h4>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center mb-3">
              <span className="text-3xl font-extrabold text-slate-900">{targets.bmi}</span>
              <span className="text-xs text-slate-500 ml-1">kg/m²</span>

              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${targets.bmiColor}`}
                >
                  {targets.bmiCategory}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Healthy Range:</span>
                <span className="font-semibold text-slate-700">{targets.healthyBmiRange}</span>
              </div>
              <div className="flex justify-between">
                <span>Formula:</span>
                <span className="font-mono text-slate-600">Weight(kg) / Height(m)²</span>
              </div>
            </div>
          </div>

          {/* Daily Calorie Targets Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-slate-900 text-sm">Metabolic Calorie Targets</h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <div>
                  <p className="text-xs text-amber-800 font-semibold">Goal-Adjusted Target</p>
                  <p className="text-[11px] text-amber-600 capitalize">
                    {formData.fitness_goal.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-amber-700">
                    {targets.targetCalories}
                  </span>
                  <span className="text-xs text-amber-600 ml-0.5">kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Basal BMR:</span>
                  <span className="font-bold text-slate-800 text-sm">{targets.bmr} kcal</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">TDEE Burn:</span>
                  <span className="font-bold text-slate-800 text-sm">{targets.tdee} kcal</span>
                </div>
              </div>

              {/* Suggested Macros */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 mb-2">Suggested Macronutrients</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Protein</span>
                    <span className="text-sm font-extrabold text-emerald-800">{targets.targetProtein}g</span>
                  </div>
                  <div className="p-2 rounded-lg bg-sky-50 border border-sky-100">
                    <span className="text-[10px] uppercase font-bold text-sky-700 block">Carbs</span>
                    <span className="text-sm font-extrabold text-sky-800">{targets.targetCarbs}g</span>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50 border border-purple-100">
                    <span className="text-[10px] uppercase font-bold text-purple-700 block">Fat</span>
                    <span className="text-sm font-extrabold text-purple-800">{targets.targetFat}g</span>
                  </div>
                </div>
              </div>

              {/* Water Target */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  <span className="font-semibold text-sky-800">Daily Water Target</span>
                </div>
                <span className="font-bold text-sky-900 text-sm">{targets.targetWater} Liters</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
