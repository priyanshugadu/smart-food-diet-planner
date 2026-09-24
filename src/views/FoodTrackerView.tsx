import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Flame,
  Activity,
  Target,
  Sparkles,
  Search,
} from 'lucide-react';
import { FoodItem, FoodLog, MealType, UserProfile, MealPlanItem } from '../types';
import { calculateNutritionTargets } from '../utils/nutritionCalculations';
import { getFoodImage } from '../utils/foodImages';
import { DateRibbon } from '../components/DateRibbon';

interface FoodTrackerViewProps {
  profile: UserProfile;
  foods: FoodItem[];
  foodLogs: FoodLog[];
  allFoodLogs?: FoodLog[];
  allMealPlans?: MealPlanItem[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onAddLog: (mealType: MealType, foodId: string, quantity: number) => Promise<void>;
  onRemoveLog: (logId: string) => Promise<void>;
  onOpenCalendarModal?: () => void;
}

const MEAL_CATEGORIES: { id: MealType; label: string; icon: string; time: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: '🥣', time: '08:00 AM' },
  { id: 'mid_morning_snack', label: 'Mid-Morning Snack', icon: '🥗', time: '11:00 AM' },
  { id: 'lunch', label: 'Lunch', icon: '🍛', time: '01:30 PM' },
  { id: 'evening_snack', label: 'Evening Snack', icon: '🥜', time: '05:30 PM' },
  { id: 'dinner', label: 'Dinner', icon: '🍲', time: '08:30 PM' },
];

export const FoodTrackerView: React.FC<FoodTrackerViewProps> = ({
  profile,
  foods,
  foodLogs,
  allFoodLogs = [],
  allMealPlans = [],
  selectedDate,
  onChangeDate,
  onAddLog,
  onRemoveLog,
  onOpenCalendarModal,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>('breakfast');
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const targets = calculateNutritionTargets(profile);

  // Compute consumed totals
  const totalCalories = foodLogs.reduce((acc, log) => {
    return acc + (log.food ? Math.round(log.food.calories * log.quantity) : 0);
  }, 0);

  const totalProtein = foodLogs.reduce((acc, log) => {
    return acc + (log.food ? log.food.protein * log.quantity : 0);
  }, 0);

  const totalCarbs = foodLogs.reduce((acc, log) => {
    return acc + (log.food ? log.food.carbohydrates * log.quantity : 0);
  }, 0);

  const totalFat = foodLogs.reduce((acc, log) => {
    return acc + (log.food ? log.food.fat * log.quantity : 0);
  }, 0);

  const remainingCalories = Math.max(0, targets.targetCalories - totalCalories);
  const caloriePct = Math.min(100, Math.round((totalCalories / targets.targetCalories) * 100));
  const proteinPct = Math.min(100, Math.round((totalProtein / targets.targetProtein) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbs / targets.targetCarbs) * 100));
  const fatPct = Math.min(100, Math.round((totalFat / targets.targetFat) * 100));

  const filteredFoods = foods.filter(
    (f) =>
      f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(foodSearch.toLowerCase())
  );

  const handleOpenModal = (mealType: MealType) => {
    setActiveMealType(mealType);
    setSelectedQuantity(1);
    setFoodSearch('');
    setModalOpen(true);
  };

  const handleSelectFood = async (food: FoodItem) => {
    await onAddLog(activeMealType, food.id, selectedQuantity);
    setModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 7-Day Interactive Date Navigation */}
      <DateRibbon
        selectedDate={selectedDate}
        onChangeDate={onChangeDate}
        onOpenCalendarModal={onOpenCalendarModal}
        allMealPlans={allMealPlans}
        allFoodLogs={allFoodLogs}
        label="Food Tracker Log Date"
      />

      {/* Header and Date Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
            <span>Daily Food & Calorie Tracker</span>
          </h3>
          <p className="text-xs text-slate-500">
            Log your actual food intake during the day and track macro distribution
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold self-start sm:self-auto">
          <span className="text-slate-500">Log Date:</span>
          <input
            id="food-log-date"
            type="date"
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="bg-transparent text-slate-800 focus:outline-none cursor-pointer font-medium"
          />
        </div>
      </div>

      {/* Progress Cards Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Today's Energy Balance</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{totalCalories}</span>
              <span className="text-xs text-slate-500">/ {targets.targetCalories} kcal</span>
            </div>
            <p className="text-xs font-semibold text-emerald-700 mt-1">
              {remainingCalories} kcal remaining for today's goal
            </p>
          </div>

          {/* Calorie Progress Bar */}
          <div className="lg:w-72 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Daily Calorie Target</span>
              <span className="text-slate-900">{caloriePct}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${caloriePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3 Macro Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          {/* Protein */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-800">Protein</span>
              <span className="text-slate-600 font-semibold">
                {totalProtein.toFixed(1)} / {targets.targetProtein}g
              </span>
            </div>
            <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${proteinPct}%` }}
              />
            </div>
            <div className="text-[11px] text-emerald-700 font-medium text-right">{proteinPct}% target</div>
          </div>

          {/* Carbs */}
          <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-sky-800">Carbohydrates</span>
              <span className="text-slate-600 font-semibold">
                {totalCarbs.toFixed(1)} / {targets.targetCarbs}g
              </span>
            </div>
            <div className="w-full bg-sky-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${carbsPct}%` }}
              />
            </div>
            <div className="text-[11px] text-sky-700 font-medium text-right">{carbsPct}% target</div>
          </div>

          {/* Fat */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-purple-800">Fats</span>
              <span className="text-slate-600 font-semibold">
                {totalFat.toFixed(1)} / {targets.targetFat}g
              </span>
            </div>
            <div className="w-full bg-purple-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${fatPct}%` }}
              />
            </div>
            <div className="text-[11px] text-purple-700 font-medium text-right">{fatPct}% target</div>
          </div>
        </div>
      </div>

      {/* 5 Meal Categories Sections */}
      <div className="space-y-4">
        {MEAL_CATEGORIES.map((cat) => {
          const categoryLogs = foodLogs.filter((log) => log.meal_type === cat.id);
          const catCalories = categoryLogs.reduce(
            (acc, log) => acc + (log.food ? Math.round(log.food.calories * log.quantity) : 0),
            0
          );
          const catProtein = categoryLogs.reduce(
            (acc, log) => acc + (log.food ? log.food.protein * log.quantity : 0),
            0
          );

          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Category Header */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl" role="img" aria-label={cat.label}>{cat.icon}</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{cat.label}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">{cat.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-800">{catCalories} kcal</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">• {catProtein.toFixed(1)}g protein</span>
                  </div>
                  <button
                    id={`log-food-btn-${cat.id}`}
                    onClick={() => handleOpenModal(cat.id)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Food</span>
                  </button>
                </div>
              </div>

              {/* Logged Items List */}
              <div className="p-4 sm:p-5">
                {categoryLogs.length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    No intake recorded yet for {cat.label}.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {categoryLogs.map((log) => {
                      const food = log.food;
                      const cal = food ? Math.round(food.calories * log.quantity) : 0;
                      const prot = food ? (food.protein * log.quantity).toFixed(1) : 0;
                      const carbs = food ? (food.carbohydrates * log.quantity).toFixed(1) : 0;
                      const fat = food ? (food.fat * log.quantity).toFixed(1) : 0;

                      return (
                        <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                              <img
                                src={getFoodImage(food)}
                                alt={food?.name || 'Food item'}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-800 dark:text-slate-100">{food?.name || 'Food item'}</span>
                                {food?.is_indian && (
                                  <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-semibold">
                                    Indian
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                                {log.quantity}x portion ({food?.serving_size})
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="font-bold text-slate-900">{cal} kcal</span>
                              <div className="text-[11px] text-slate-500 space-x-1.5">
                                <span>P: {prot}g</span>
                                <span>C: {carbs}g</span>
                                <span>F: {fat}g</span>
                              </div>
                            </div>

                            <button
                              onClick={() => onRemoveLog(log.id)}
                              title="Delete food entry"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECT FOOD MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Log Food to {activeMealType.replace('_', ' ')}
                </h4>
                <p className="text-xs text-slate-500">Select what you ate and adjust your portion size</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Search and Portion Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search food item..."
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <span className="text-slate-500">Portion:</span>
                <select
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                  className="bg-transparent font-bold text-emerald-800 focus:outline-none cursor-pointer"
                >
                  <option value={0.5}>0.5x Serving</option>
                  <option value={1}>1.0x Serving</option>
                  <option value={1.5}>1.5x Serving</option>
                  <option value={2}>2.0x Serving</option>
                  <option value={3}>3.0x Serving</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors text-xs gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      <img
                        src={getFoodImage(food)}
                        alt={food.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{food.name}</span>
                        {food.is_indian && (
                          <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-semibold shrink-0">
                            Indian
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                        {food.category} • {food.serving_size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-bold text-slate-900">
                        {Math.round(food.calories * selectedQuantity)} kcal
                      </span>
                      <p className="text-slate-500 text-[11px]">
                        {(food.protein * selectedQuantity).toFixed(1)}g prot
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectFood(food)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Log
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
