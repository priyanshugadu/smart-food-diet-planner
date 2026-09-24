import React, { useState } from 'react';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  UtensilsCrossed,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { FoodItem, MealPlanItem, MealType, UserProfile } from '../types';
import {
  formatLocalDate,
  parseLocalDate,
  formatLongDisplayDate,
  getMonthMatrix,
  addDays,
  getWeekDays,
} from '../utils/dateUtils';
import { getFoodImage } from '../utils/foodImages';
import { DateRibbon } from '../components/DateRibbon';

interface CalendarViewProps {
  profile: UserProfile;
  foods: FoodItem[];
  allMealPlans: MealPlanItem[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onAddPlanItem: (mealType: MealType, foodId: string, quantity: number, date?: string) => Promise<void>;
  onRemovePlanItem: (itemId: string) => Promise<void>;
  onCopyPlan: (fromDate: string, toDate: string) => Promise<void>;
  onNavigateToGrocery: () => void;
  onNavigateToTracker: () => void;
}

const MEAL_CATEGORIES: { id: MealType; label: string; icon: string; time: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: '🥣', time: '08:00 AM' },
  { id: 'mid_morning_snack', label: 'Mid-Morning Snack', icon: '🥗', time: '11:00 AM' },
  { id: 'lunch', label: 'Lunch', icon: '🍛', time: '01:30 PM' },
  { id: 'evening_snack', label: 'Evening Snack', icon: '🥜', time: '05:30 PM' },
  { id: 'dinner', label: 'Dinner', icon: '🍲', time: '08:30 PM' },
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  profile,
  foods,
  allMealPlans,
  selectedDate,
  onChangeDate,
  onAddPlanItem,
  onRemovePlanItem,
  onCopyPlan,
  onNavigateToGrocery,
  onNavigateToTracker,
}) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [copySuccessMsg, setCopySuccessMsg] = useState<string | null>(null);

  // Quick Add Food Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetDate, setTargetDate] = useState<string>(selectedDate);
  const [targetMealType, setTargetMealType] = useState<MealType>('breakfast');
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Month navigation for monthly view
  const initialDateObj = parseLocalDate(selectedDate);
  const [currentYear, setCurrentYear] = useState<number>(initialDateObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDateObj.getMonth());

  const todayStr = formatLocalDate(new Date());

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const monthMatrix = getMonthMatrix(currentYear, currentMonth, selectedDate);
  const monthTitle = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(currentYear, currentMonth, 1));

  // Week days for weekly view (centered around selected date)
  const weekDays = getWeekDays(selectedDate, 7);

  const handleOpenAddModal = (dateStr: string, mealType: MealType) => {
    setTargetDate(dateStr);
    setTargetMealType(mealType);
    setSelectedQuantity(1);
    setFoodSearch('');
    setModalOpen(true);
  };

  const handleSelectFood = async (food: FoodItem) => {
    await onAddPlanItem(targetMealType, food.id, selectedQuantity, targetDate);
    setModalOpen(false);
  };

  const handleCopyDayToTomorrow = async () => {
    const tomorrowStr = addDays(selectedDate, 1);
    await onCopyPlan(selectedDate, tomorrowStr);
    setCopySuccessMsg(`Copied plan from ${selectedDate} to ${tomorrowStr}!`);
    setTimeout(() => setCopySuccessMsg(null), 3000);
  };

  const handleCopyDayToWeek = async () => {
    for (const d of weekDays) {
      if (d.dateStr !== selectedDate) {
        await onCopyPlan(selectedDate, d.dateStr);
      }
    }
    setCopySuccessMsg(`Plan copied to all 7 days of the current week!`);
    setTimeout(() => setCopySuccessMsg(null), 3500);
  };

  const filteredFoods = foods.filter(
    (f) =>
      f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(foodSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Date Ribbon Navigation */}
      <DateRibbon
        selectedDate={selectedDate}
        onChangeDate={onChangeDate}
        allMealPlans={allMealPlans}
        label="Calendar Date Navigator"
      />

      {/* Main Calendar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-6">
        {/* Header and View Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl">
                  Diet & Meal Calendar Schedule
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Plan, schedule, and replicate nutritional meals across days and weeks
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                id="cal-view-weekly-btn"
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'weekly'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Weekly Matrix
              </button>
              <button
                id="cal-view-monthly-btn"
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'monthly'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Monthly Overview
              </button>
            </div>

            {/* Copy Actions */}
            <button
              id="cal-copy-tomorrow-btn"
              onClick={handleCopyDayToTomorrow}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Duplicate today's planned meals to tomorrow"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-500" />
              <span>Copy to Tomorrow</span>
            </button>

            <button
              id="cal-copy-week-btn"
              onClick={handleCopyDayToWeek}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Apply today's meals to the entire 7-day week"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Apply to Full Week</span>
            </button>

            {/* Grocery Generator */}
            <button
              id="cal-grocery-btn"
              onClick={onNavigateToGrocery}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Grocery List</span>
            </button>
          </div>
        </div>

        {/* Copy Notification Toast */}
        {copySuccessMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{copySuccessMsg}</span>
          </div>
        )}

        {/* VIEW 1: WEEKLY PLANNER MATRIX */}
        {viewMode === 'weekly' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">
                Showing 7-day schedule centered on{' '}
                <strong className="text-slate-900 dark:text-white">
                  {formatLongDisplayDate(selectedDate)}
                </strong>
              </span>
              <span className="text-[11px]">Click any date or "+" to add food items to that specific day</span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto pb-2 -mx-2 sm:mx-0">
              <div className="min-w-[850px] space-y-3">
                {/* Day Columns Header */}
                <div className="grid grid-cols-7 gap-2.5">
                  {weekDays.map((d) => {
                    const dayPlans = allMealPlans.filter((p) => p.meal_date === d.dateStr);
                    const dayCalories = dayPlans.reduce(
                      (acc, p) => acc + (p.food ? p.food.calories * p.serving_quantity : 0),
                      0
                    );
                    const isSelected = d.isSelected;

                    return (
                      <div
                        key={d.dateStr}
                        onClick={() => onChangeDate(d.dateStr)}
                        className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/50'
                            : d.isToday
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100'
                        }`}
                      >
                        <span className={`text-[10px] uppercase font-bold block ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {d.dayName}
                        </span>
                        <span className="text-lg font-black block mt-0.5 leading-tight">
                          {d.dayNumber} {d.monthName}
                        </span>
                        <div className={`text-[11px] font-bold mt-1 ${isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {Math.round(dayCalories)} kcal
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 5 Meal Category Rows */}
                {MEAL_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-slate-50/70 dark:bg-slate-800/30 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-3 space-y-2"
                  >
                    {/* Category Label */}
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-base" role="img" aria-label={cat.label}>{cat.icon}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-slate-400">• {cat.time}</span>
                    </div>

                    {/* 7 Columns for this meal */}
                    <div className="grid grid-cols-7 gap-2.5">
                      {weekDays.map((d) => {
                        const cellPlans = allMealPlans.filter(
                          (p) => p.meal_date === d.dateStr && p.meal_type === cat.id
                        );

                        return (
                          <div
                            key={`${d.dateStr}-${cat.id}`}
                            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/70 p-2 min-h-[90px] flex flex-col justify-between group hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors"
                          >
                            <div className="space-y-1.5">
                              {cellPlans.length === 0 ? (
                                <span className="text-[11px] text-slate-300 dark:text-slate-600 italic block py-2 text-center">
                                  Empty
                                </span>
                              ) : (
                                cellPlans.map((plan) => (
                                  <div
                                    key={plan.id}
                                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-100 dark:border-slate-700 text-[11px] flex items-center justify-between gap-1 group/item"
                                  >
                                    <div className="overflow-hidden">
                                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                        {plan.food?.name}
                                      </p>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {Math.round((plan.food?.calories || 0) * plan.serving_quantity)} kcal
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => onRemovePlanItem(plan.id)}
                                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors opacity-0 group-hover/item:opacity-100"
                                      title="Remove from plan"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Quick Add Button */}
                            <button
                              id={`quick-add-${d.dateStr}-${cat.id}`}
                              onClick={() => handleOpenAddModal(d.dateStr, cat.id)}
                              className="w-full mt-1.5 py-1 px-1.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: MONTHLY OVERVIEW */}
        {viewMode === 'monthly' && (
          <div className="space-y-4">
            {/* Month Nav Controls */}
            <div className="flex items-center justify-between pb-3">
              <button
                id="cal-month-prev"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl">
                {monthTitle}
              </h4>
              <button
                id="cal-month-next"
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1.5 text-center font-bold text-xs text-slate-400 uppercase pb-1">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* 7x5 / 7x6 Matrix Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {monthMatrix.map((cell) => {
                const dayPlans = allMealPlans.filter((p) => p.meal_date === cell.dateStr);
                const dayCalories = dayPlans.reduce(
                  (acc, p) => acc + (p.food ? p.food.calories * p.serving_quantity : 0),
                  0
                );
                const isSelected = cell.dateStr === selectedDate;
                const isToday = cell.isToday;

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => onChangeDate(cell.dateStr)}
                    className={`min-h-[75px] sm:min-h-[90px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/50'
                        : isToday
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white'
                        : cell.isCurrentMonth
                        ? 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 text-slate-900 dark:text-white'
                        : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{cell.dayNumber}</span>
                      {isToday && (
                        <span className={`text-[9px] font-extrabold uppercase px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-800'}`}>
                          Today
                        </span>
                      )}
                    </div>

                    <div className="mt-1">
                      {dayPlans.length > 0 ? (
                        <div>
                          <span className={`text-xs sm:text-sm font-black block ${isSelected ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}`}>
                            {Math.round(dayCalories)} <span className="text-[10px] font-normal">kcal</span>
                          </span>
                          <span className={`text-[10px] font-semibold block ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {dayPlans.length} meal items
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 dark:text-slate-600 italic">
                          No plans
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Date Summary Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              Active Selected Day
            </span>
            <h4 className="text-lg font-black text-white">
              {formatLongDisplayDate(selectedDate)}
            </h4>
            <p className="text-xs text-slate-300">
              {allMealPlans.filter((p) => p.meal_date === selectedDate).length} scheduled foods • Target: {profile.target_calories || 2200} kcal
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="cal-jump-tracker-btn"
              onClick={onNavigateToTracker}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Log Food for This Day</span>
            </button>
            <button
              id="cal-jump-grocery-btn"
              onClick={onNavigateToGrocery}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Generate Grocery</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Food Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Add Food to {MEAL_CATEGORIES.find((m) => m.id === targetMealType)?.label}
                </h4>
                <p className="text-xs text-slate-500">
                  Target Date: <strong>{formatLongDisplayDate(targetDate)}</strong>
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Search input */}
              <input
                type="text"
                placeholder="Search food by name or category..."
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* Quantity selector */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Serving Portions:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQuantity(Math.max(0.5, selectedQuantity - 0.5))}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-emerald-600 text-sm">{selectedQuantity}x</span>
                  <button
                    onClick={() => setSelectedQuantity(selectedQuantity + 0.5)}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Foods List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredFoods.slice(0, 20).map((food) => (
                  <div
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                        <img
                          src={getFoodImage(food)}
                          alt={food.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                            {food.name}
                          </span>
                          {food.is_indian && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold">
                              Indian
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {food.serving_size} • {food.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs block">
                        {Math.round(food.calories * selectedQuantity)} kcal
                      </span>
                      <span className="text-[10px] text-slate-400">
                        P: {(food.protein * selectedQuantity).toFixed(1)}g
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
