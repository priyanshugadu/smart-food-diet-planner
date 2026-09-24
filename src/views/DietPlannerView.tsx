import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  UtensilsCrossed,
  Filter,
  ShoppingCart,
  ChefHat,
  Info,
  Copy,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { FoodItem, MealPlanItem, MealType, UserProfile } from '../types';
import { getFoodImage } from '../utils/foodImages';
import { DateRibbon } from '../components/DateRibbon';
import { addDays, formatLongDisplayDate } from '../utils/dateUtils';

interface DietPlannerViewProps {
  profile: UserProfile;
  foods: FoodItem[];
  mealPlans: MealPlanItem[];
  allMealPlans?: MealPlanItem[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onAddPlanItem: (mealType: MealType, foodId: string, quantity: number) => Promise<void>;
  onRemovePlanItem: (itemId: string) => Promise<void>;
  onReplacePlanItem: (itemId: string, newFoodId: string, quantity: number) => Promise<void>;
  onNavigateToGrocery: () => void;
  onOpenCalendarModal?: () => void;
  onNavigateToCalendar?: () => void;
  onCopyPlan?: (fromDate: string, toDate: string) => Promise<void>;
}

const MEAL_CATEGORIES: { id: MealType; label: string; icon: string; time: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: '🥣', time: '08:00 AM' },
  { id: 'mid_morning_snack', label: 'Mid-Morning Snack', icon: '🥗', time: '11:00 AM' },
  { id: 'lunch', label: 'Lunch', icon: '🍛', time: '01:30 PM' },
  { id: 'evening_snack', label: 'Evening Snack', icon: '🥜', time: '05:30 PM' },
  { id: 'dinner', label: 'Dinner', icon: '🍲', time: '08:30 PM' },
];

export const DietPlannerView: React.FC<DietPlannerViewProps> = ({
  profile,
  foods,
  mealPlans,
  allMealPlans = [],
  selectedDate,
  onChangeDate,
  onAddPlanItem,
  onRemovePlanItem,
  onReplacePlanItem,
  onNavigateToGrocery,
  onOpenCalendarModal,
  onNavigateToCalendar,
  onCopyPlan,
}) => {
  // Modal state for adding or replacing food
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>('breakfast');
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  // Search & Filters in food picker modal
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [filterPreferenceOnly, setFilterPreferenceOnly] = useState(true);

  // Filter foods according to user dietary preferences and allergies
  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
      food.category.toLowerCase().includes(foodSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (filterPreferenceOnly) {
      if (profile.dietary_preference === 'vegan' && !food.vegan) return false;
      if (profile.dietary_preference === 'vegetarian' && !food.vegetarian) return false;
    }

    return true;
  });

  const checkAllergyWarning = (food: FoodItem): string | null => {
    if (!profile.allergies || profile.allergies.length === 0) return null;
    const foodNameLower = food.name.toLowerCase();
    const categoryLower = food.category.toLowerCase();

    for (const allergy of profile.allergies) {
      const aLower = allergy.toLowerCase();
      if (aLower.includes('peanut') && (foodNameLower.includes('peanut') || foodNameLower.includes('groundnut'))) {
        return `Contains ${allergy}`;
      }
      if (aLower.includes('dairy') && (categoryLower.includes('dairy') || foodNameLower.includes('milk') || foodNameLower.includes('paneer') || foodNameLower.includes('curd'))) {
        return `Contains Dairy`;
      }
      if (aLower.includes('gluten') && (foodNameLower.includes('roti') || foodNameLower.includes('wheat') || foodNameLower.includes('upma') || foodNameLower.includes('bread'))) {
        return `Contains Gluten / Wheat`;
      }
      if (aLower.includes('egg') && foodNameLower.includes('egg')) {
        return `Contains Egg`;
      }
    }
    return null;
  };

  const handleOpenAddModal = (mealType: MealType) => {
    setActiveMealType(mealType);
    setReplacingItemId(null);
    setSelectedQuantity(1);
    setFoodSearch('');
    setModalOpen(true);
  };

  const handleOpenReplaceModal = (mealType: MealType, itemId: string) => {
    setActiveMealType(mealType);
    setReplacingItemId(itemId);
    setSelectedQuantity(1);
    setFoodSearch('');
    setModalOpen(true);
  };

  const handleSelectFood = async (food: FoodItem) => {
    if (replacingItemId) {
      await onReplacePlanItem(replacingItemId, food.id, selectedQuantity);
    } else {
      await onAddPlanItem(activeMealType, food.id, selectedQuantity);
    }
    setModalOpen(false);
  };

  // Calculate day totals
  const totalDayCalories = mealPlans.reduce((acc, p) => acc + (p.food ? p.food.calories * p.serving_quantity : 0), 0);
  const totalDayProtein = mealPlans.reduce((acc, p) => acc + (p.food ? p.food.protein * p.serving_quantity : 0), 0);
  const totalDayCarbs = mealPlans.reduce((acc, p) => acc + (p.food ? p.food.carbohydrates * p.serving_quantity : 0), 0);
  const totalDayFat = mealPlans.reduce((acc, p) => acc + (p.food ? p.food.fat * p.serving_quantity : 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 7-Day Interactive Date Strip */}
      <DateRibbon
        selectedDate={selectedDate}
        onChangeDate={onChangeDate}
        onOpenCalendarModal={onOpenCalendarModal}
        allMealPlans={allMealPlans}
        label="Diet Planner Schedule"
      />

      {/* Copy notification toast */}
      {copyMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{copyMsg}</span>
        </div>
      )}

      {/* Top Planner Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            <span>Daily & Weekly Meal Planner</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nutritional blueprint for <strong>{formatLongDisplayDate(selectedDate)}</strong> ({profile.dietary_preference})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Calendar view jump button */}
          {onNavigateToCalendar && (
            <button
              id="plan-open-calendar-view-btn"
              onClick={onNavigateToCalendar}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open full weekly & monthly calendar view"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Calendar</span>
            </button>
          )}

          {/* Quick Copy to Tomorrow */}
          {onCopyPlan && (
            <button
              id="plan-copy-tomorrow-btn"
              onClick={async () => {
                const tomorrowStr = addDays(selectedDate, 1);
                await onCopyPlan(selectedDate, tomorrowStr);
                setCopyMsg(`Copied today's meals to tomorrow (${tomorrowStr})!`);
                setTimeout(() => setCopyMsg(null), 3000);
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy this day's planned meals to tomorrow"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-500" />
              <span>Copy to Tomorrow</span>
            </button>
          )}

          {/* Quick Grocery List Trigger */}
          <button
            id="plan-generate-grocery-btn"
            onClick={onNavigateToGrocery}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Generate Grocery List</span>
          </button>
        </div>
      </div>

      {/* Daily Planned Nutritional Summary Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Planned Day Summary</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold">{Math.round(totalDayCalories)}</span>
              <span className="text-xs text-slate-400">kcal planned</span>
              <span className="text-xs text-slate-400">
                (Target: {profile.target_calories || 2200} kcal)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center sm:text-right">
            <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Protein</span>
              <span className="text-sm font-bold text-emerald-300">{totalDayProtein.toFixed(1)}g</span>
            </div>
            <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Carbs</span>
              <span className="text-sm font-bold text-sky-300">{totalDayCarbs.toFixed(1)}g</span>
            </div>
            <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Fat</span>
              <span className="text-sm font-bold text-purple-300">{totalDayFat.toFixed(1)}g</span>
            </div>
          </div>
        </div>

        <div className="pt-3 text-xs text-slate-300 flex items-center justify-between">
          <span>Dietary Setting: <strong className="text-white capitalize">{profile.dietary_preference}</strong></span>
          <span>Allergies: <strong className="text-rose-300">{profile.allergies?.join(', ') || 'None'}</strong></span>
        </div>
      </div>

      {/* 5 Meal Categories */}
      <div className="space-y-4">
        {MEAL_CATEGORIES.map((cat) => {
          const categoryPlans = mealPlans.filter((p) => p.meal_type === cat.id);
          const catCalories = categoryPlans.reduce((acc, p) => acc + (p.food ? p.food.calories * p.serving_quantity : 0), 0);
          const catProtein = categoryPlans.reduce((acc, p) => acc + (p.food ? p.food.protein * p.serving_quantity : 0), 0);

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
                    <span className="text-xs font-bold text-slate-800">{Math.round(catCalories)} kcal</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">• {catProtein.toFixed(1)}g protein</span>
                  </div>
                  <button
                    id={`add-meal-${cat.id}`}
                    onClick={() => handleOpenAddModal(cat.id)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Food</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 sm:p-5">
                {categoryPlans.length === 0 ? (
                  <div className="text-center py-5 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    No items planned for {cat.label}. Click "Add Food" to build this meal.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {categoryPlans.map((item) => {
                      const food = item.food;
                      const allergyWarning = food ? checkAllergyWarning(food) : null;
                      const cal = food ? Math.round(food.calories * item.serving_quantity) : 0;
                      const prot = food ? (food.protein * item.serving_quantity).toFixed(1) : 0;
                      const carbs = food ? (food.carbohydrates * item.serving_quantity).toFixed(1) : 0;
                      const fat = food ? (food.fat * item.serving_quantity).toFixed(1) : 0;

                      return (
                        <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                          <div className="flex items-center gap-3.5">
                            {/* Food Thumbnail Image */}
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700 shadow-xs relative">
                              <img
                                src={getFoodImage(food)}
                                alt={food?.name || 'Food item'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">
                                  {food?.name || 'Selected item'}
                                </span>
                                {food?.is_indian && (
                                  <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-semibold">
                                    Indian
                                  </span>
                                )}
                                {allergyWarning && (
                                  <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                    {allergyWarning}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Serving: <span className="text-slate-700 dark:text-slate-200 font-medium">{food?.serving_size}</span> ×{' '}
                                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{item.serving_quantity}x</strong>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            {/* Macronutrient breakdown */}
                            <div className="text-right text-xs">
                              <span className="font-extrabold text-slate-900 text-sm">{cal} kcal</span>
                              <div className="text-[11px] text-slate-500 space-x-1.5">
                                <span>P: <strong className="text-slate-700">{prot}g</strong></span>
                                <span>C: <strong className="text-slate-700">{carbs}g</strong></span>
                                <span>F: <strong className="text-slate-700">{fat}g</strong></span>
                              </div>
                            </div>

                            {/* Actions: Replace / Delete */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenReplaceModal(cat.id, item.id)}
                                title="Replace food"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onRemovePlanItem(item.id)}
                                title="Remove food"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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

      {/* FOOD PICKER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {replacingItemId ? 'Replace Meal Item' : `Add Food to ${activeMealType.replace('_', ' ')}`}
                </h4>
                <p className="text-xs text-slate-500">
                  Select a healthy option from the database with portion calibration
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search dal, roti, oats, paneer, chicken..."
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {/* Serving Quantity Selector */}
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

              {/* Preference Filter Checkbox */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={filterPreferenceOnly}
                    onChange={(e) => setFilterPreferenceOnly(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    Respect my dietary preference (
                    <strong className="text-emerald-700 capitalize">{profile.dietary_preference}</strong>)
                  </span>
                </label>
                <span className="text-slate-400">{filteredFoods.length} foods available</span>
              </div>
            </div>

            {/* Foods List */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
              {filteredFoods.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No matching foods found. Try adjusting your search or preferences.
                </div>
              ) : (
                filteredFoods.map((food) => {
                  const warning = checkAllergyWarning(food);
                  return (
                    <div
                      key={food.id}
                      className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 rounded-2xl transition-colors gap-3"
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

                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
                              {food.name}
                            </span>
                            {food.is_indian && (
                              <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-semibold shrink-0">
                                Indian
                              </span>
                            )}
                            {warning && (
                              <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold shrink-0">
                                ⚠️ {warning}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {food.category} • {food.serving_size}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs">
                          <p className="font-bold text-slate-900">{Math.round(food.calories * selectedQuantity)} kcal</p>
                          <p className="text-[11px] text-slate-500">
                            {(food.protein * selectedQuantity).toFixed(1)}g prot
                          </p>
                        </div>
                        <button
                          onClick={() => handleSelectFood(food)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
