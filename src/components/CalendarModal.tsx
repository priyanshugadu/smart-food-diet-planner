import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UtensilsCrossed,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { MealPlanItem, FoodLog } from '../types';
import {
  formatLocalDate,
  parseLocalDate,
  formatLongDisplayDate,
  getMonthMatrix,
  addDays,
} from '../utils/dateUtils';
import { NavTab } from './Sidebar';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  allMealPlans?: MealPlanItem[];
  allFoodLogs?: FoodLog[];
  onNavigate?: (tab: NavTab) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  allMealPlans = [],
  allFoodLogs = [],
  onNavigate,
}) => {
  const initialDateObj = parseLocalDate(selectedDate);
  const [currentYear, setCurrentYear] = useState<number>(initialDateObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDateObj.getMonth());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    onSelectDate(todayStr);
  };

  const matrix = getMonthMatrix(currentYear, currentMonth, selectedDate);

  const monthName = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(currentYear, currentMonth, 1));

  // Compute stats for selected date
  const selectedDatePlans = allMealPlans.filter((p) => p.meal_date === selectedDate);
  const selectedDateLogs = allFoodLogs.filter((l) => l.consumed_at.startsWith(selectedDate));

  const plannedCalories = selectedDatePlans.reduce(
    (acc, p) => acc + (p.food ? p.food.calories * p.serving_quantity : 0),
    0
  );
  const loggedCalories = selectedDateLogs.reduce(
    (acc, l) => acc + (l.food ? l.food.calories * l.quantity : 0),
    0
  );

  const handleDateClick = (dStr: string) => {
    onSelectDate(dStr);
  };

  const handleOpenPlanner = () => {
    if (onNavigate) onNavigate('planner');
    onClose();
  };

  const handleOpenTracker = () => {
    if (onNavigate) onNavigate('tracker');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Diet & Meal Calendar</h3>
              <p className="text-xs text-emerald-100 font-medium">Select any date to view or plan meals</p>
            </div>
          </div>
          <button
            id="close-calendar-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close calendar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Date Shortcuts */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
            Quick Jump
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectDate(addDays(todayStr, -1))}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                selectedDate === addDays(todayStr, -1)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={handleJumpToToday}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                selectedDate === todayStr
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onSelectDate(addDays(todayStr, 1))}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                selectedDate === addDays(todayStr, 1)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Month Selector Controls */}
        <div className="px-5 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            id="prev-month-btn"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
              {monthName}
            </h4>
          </div>
          <button
            id="next-month-btn"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day of Week Headers */}
        <div className="px-4 sm:px-6 grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 dark:text-slate-500 uppercase pb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Matrix Days */}
        <div className="px-4 sm:px-6 grid grid-cols-7 gap-1 sm:gap-1.5 pb-4">
          {matrix.map((cell) => {
            const dayPlans = allMealPlans.filter((p) => p.meal_date === cell.dateStr);
            const dayLogs = allFoodLogs.filter((l) => l.consumed_at.startsWith(cell.dateStr));
            const hasPlans = dayPlans.length > 0;
            const hasLogs = dayLogs.length > 0;

            const isSelected = cell.dateStr === selectedDate;
            const isToday = cell.isToday;

            return (
              <button
                key={cell.dateStr}
                onClick={() => handleDateClick(cell.dateStr)}
                onMouseEnter={() => setHoveredDate(cell.dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                className={`relative h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-md scale-102 ring-2 ring-emerald-400/50'
                    : isToday
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-400/60'
                    : cell.isCurrentMonth
                    ? 'text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <span>{cell.dayNumber}</span>

                {/* Activity Dots / Badges */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {hasPlans && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-emerald-500'
                      }`}
                      title={`${dayPlans.length} meal(s) planned`}
                    />
                  )}
                  {hasLogs && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-amber-200' : 'bg-amber-500'
                      }`}
                      title={`${dayLogs.length} food log(s)`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Date Summary & Actions Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Selected Day Overview
              </span>
              <h5 className="font-extrabold text-slate-900 dark:text-white text-sm">
                {formatLongDisplayDate(selectedDate)}
                {selectedDate === todayStr && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] font-bold">
                    Today
                  </span>
                )}
              </h5>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2 text-xs">
              <div className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold block">Planned</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {Math.round(plannedCalories)} kcal ({selectedDatePlans.length} items)
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold block">Logged</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  {Math.round(loggedCalories)} kcal ({selectedDateLogs.length} items)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              id="calendar-open-planner-btn"
              onClick={handleOpenPlanner}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Open in Meal Planner</span>
            </button>
            <button
              id="calendar-open-tracker-btn"
              onClick={handleOpenTracker}
              className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Open in Food Tracker</span>
            </button>
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
