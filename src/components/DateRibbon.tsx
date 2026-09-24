import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  formatLocalDate,
  getWeekDays,
  addDays,
  formatDisplayDate,
} from '../utils/dateUtils';
import { MealPlanItem, FoodLog } from '../types';

interface DateRibbonProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onOpenCalendarModal?: () => void;
  allMealPlans?: MealPlanItem[];
  allFoodLogs?: FoodLog[];
  label?: string;
}

export const DateRibbon: React.FC<DateRibbonProps> = ({
  selectedDate,
  onChangeDate,
  onOpenCalendarModal,
  allMealPlans = [],
  allFoodLogs = [],
  label = 'Selected Date',
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const todayStr = formatLocalDate(new Date());
  const weekDays = getWeekDays(selectedDate, 7);

  const handlePrevDay = () => {
    onChangeDate(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    onChangeDate(addDays(selectedDate, 1));
  };

  const handleJumpToToday = () => {
    onChangeDate(todayStr);
  };

  const handleTriggerNativePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-3 sm:p-4 space-y-3">
      {/* Top Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {formatDisplayDate(selectedDate)}
              </span>
              {selectedDate === todayStr && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase">
                  Today
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              {label} • Navigate days or browse full calendar
            </span>
          </div>
        </div>

        {/* Buttons: Prev, Today, Next, Full Calendar, Date Picker */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="date-prev-day-btn"
            onClick={handlePrevDay}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            id="date-jump-today-btn"
            onClick={handleJumpToToday}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDate === todayStr
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Today
          </button>

          <button
            id="date-next-day-btn"
            onClick={handleNextDay}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Full Interactive Calendar Modal Button */}
          {onOpenCalendarModal && (
            <button
              id="date-open-calendar-modal-btn"
              onClick={onOpenCalendarModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Open Full Calendar Schedule"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Full Calendar</span>
            </button>
          )}

          {/* Fallback Native Date Picker Trigger */}
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) onChangeDate(e.target.value);
              }}
              className="sr-only"
              aria-label="Pick date"
            />
            <button
              onClick={handleTriggerNativePicker}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Native Date Picker"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Horizontal Strip */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        {weekDays.map((d) => {
          const isSelected = d.isSelected;
          const isToday = d.isToday;
          const dayPlans = allMealPlans.filter((p) => p.meal_date === d.dateStr);
          const dayLogs = allFoodLogs.filter((l) => l.consumed_at.startsWith(d.dateStr));

          return (
            <button
              key={d.dateStr}
              onClick={() => onChangeDate(d.dateStr)}
              className={`py-2 px-1 sm:px-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white font-bold shadow-md scale-102 ring-2 ring-emerald-400/40'
                  : isToday
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-400/60'
                  : 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                {d.dayName}
              </span>
              <span className="text-sm sm:text-base font-extrabold mt-0.5 leading-none">
                {d.dayNumber}
              </span>

              {/* Indicator dots */}
              <div className="flex items-center gap-0.5 mt-1.5 h-1.5">
                {dayPlans.length > 0 && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-emerald-500'
                    }`}
                    title={`${dayPlans.length} meal(s) planned`}
                  />
                )}
                {dayLogs.length > 0 && (
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
    </div>
  );
};
