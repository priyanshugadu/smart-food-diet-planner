import React from 'react';
import {
  Flame,
  Scale,
  Droplets,
  Target,
  Plus,
  ArrowRight,
  TrendingUp,
  UtensilsCrossed,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Activity,
  Heart,
  Download,
  Palette,
  Smartphone,
} from 'lucide-react';
import {
  FoodItem,
  FoodLog,
  MealPlanItem,
  UserProfile,
  WaterLog,
  WeightLog,
} from '../types';
import { calculateNutritionTargets } from '../utils/nutritionCalculations';
import { LineChart, BarChart } from '../components/Charts';
import { NavTab } from '../components/Sidebar';
import { getFoodImage } from '../utils/foodImages';
import appLogo from '../assets/images/smart_diet_logo_1790175111322.jpg';

interface DashboardViewProps {
  profile: UserProfile;
  todayFoodLogs: FoodLog[];
  todayMealPlans: MealPlanItem[];
  todayWaterLogs: WaterLog[];
  weightLogs: WeightLog[];
  onNavigate: (tab: NavTab) => void;
  onQuickAddWater: (amount: number) => void;
  onOpenDownloadReport?: () => void;
  onOpenThemeModal?: () => void;
  onOpenAndroidInstall?: () => void;
  selectedDate?: string;
  onChangeDate?: (date: string) => void;
  onOpenCalendarModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  todayFoodLogs,
  todayMealPlans,
  todayWaterLogs,
  weightLogs,
  onNavigate,
  onQuickAddWater,
  onOpenDownloadReport,
  onOpenThemeModal,
  onOpenAndroidInstall,
  selectedDate,
  onChangeDate,
  onOpenCalendarModal,
}) => {
  const targets = calculateNutritionTargets(profile);

  // Compute today's consumed macros
  const consumedCalories = todayFoodLogs.reduce((acc, log) => {
    const cal = log.food ? log.food.calories * log.quantity : 0;
    return acc + Math.round(cal);
  }, 0);

  const consumedProtein = todayFoodLogs.reduce((acc, log) => {
    const p = log.food ? log.food.protein * log.quantity : 0;
    return acc + Number(p.toFixed(1));
  }, 0);

  const consumedCarbs = todayFoodLogs.reduce((acc, log) => {
    const c = log.food ? log.food.carbohydrates * log.quantity : 0;
    return acc + Number(c.toFixed(1));
  }, 0);

  const consumedFat = todayFoodLogs.reduce((acc, log) => {
    const f = log.food ? log.food.fat * log.quantity : 0;
    return acc + Number(f.toFixed(1));
  }, 0);

  const remainingCalories = Math.max(0, targets.targetCalories - consumedCalories);
  const caloriePercent = Math.min(100, Math.round((consumedCalories / targets.targetCalories) * 100));
  const proteinPercent = Math.min(100, Math.round((consumedProtein / targets.targetProtein) * 100));

  // Water calculation
  const totalWater = todayWaterLogs.reduce((acc, log) => acc + log.amount, 0);
  const remainingWater = Math.max(0, Number((targets.targetWater - totalWater).toFixed(1)));
  const waterPercent = Math.min(100, Math.round((totalWater / targets.targetWater) * 100));

  // Weight progression chart data
  const weightChartData = weightLogs.slice(-6).map((log) => ({
    label: log.logged_at.slice(5), // MM-DD
    value: log.weight,
  }));

  // Weekly calorie intake comparison chart (dummy past 5 days + today)
  const weeklyCalorieData = [
    { label: 'Mon', value: 2150, target: targets.targetCalories },
    { label: 'Tue', value: 2320, target: targets.targetCalories },
    { label: 'Wed', value: 2080, target: targets.targetCalories },
    { label: 'Thu', value: 2410, target: targets.targetCalories },
    { label: 'Fri', value: 2260, target: targets.targetCalories },
    { label: 'Today', value: consumedCalories, target: targets.targetCalories },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-900/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 shadow-xl shadow-black/20 border border-white/20 shrink-0 hidden sm:flex items-center justify-center overflow-hidden">
              <img
                src={appLogo}
                alt="Smart Food & Diet Planner"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-semibold backdrop-blur-xs mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Smart Food & Diet Planner • Active & Calibrated</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Hello, {profile.full_name || 'Nutrition Champion'} 👋
              </h2>
              <p className="text-slate-200 text-sm mt-1 max-w-xl">
                Fitness Goal:{' '}
                <strong className="text-emerald-300 capitalize">
                  {profile.fitness_goal.replace('_', ' ')}
                </strong>
                . You have consumed <strong className="text-white">{consumedCalories} kcal</strong> with{' '}
                <strong className="text-white">{remainingCalories} kcal</strong> remaining today.
              </p>
            </div>
          </div>

          {/* Quick Actions Cluster */}
          <div className="flex flex-wrap gap-2.5">
            {onOpenDownloadReport && (
              <button
                id="dash-action-download"
                onClick={onOpenDownloadReport}
                className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                title="Download Diet Plan & Health Summary (PDF, CSV, JSON)"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Download Diet Plan</span>
              </button>
            )}

            {onOpenAndroidInstall && (
              <button
                id="dash-action-android"
                onClick={onOpenAndroidInstall}
                className="px-4 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-950 text-emerald-200 border border-emerald-400/40 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                title="Download & Install App on Android"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Download on Android</span>
              </button>
            )}

            <button
              id="dash-action-log-food"
              onClick={() => onNavigate('tracker')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-200" />
              <span>Log Food</span>
            </button>
            <button
              id="dash-action-planner"
              onClick={() => onNavigate('planner')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Meal Planner</span>
            </button>
            <button
              id="dash-action-calendar"
              onClick={() => {
                if (onOpenCalendarModal) {
                  onOpenCalendarModal();
                } else {
                  onNavigate('calendar');
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-xs transition-colors flex items-center gap-2 cursor-pointer"
              title="Open full interactive diet calendar"
            >
              <CalendarDays className="w-4 h-4 text-emerald-300" />
              <span>Diet Calendar</span>
            </button>
            <button
              id="dash-action-ai"
              onClick={() => onNavigate('ai')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Coach</span>
            </button>
            {onOpenThemeModal && (
              <button
                id="dash-action-theme"
                onClick={onOpenThemeModal}
                className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-xs transition-colors flex items-center gap-1.5"
                title="Change workspace theme"
              >
                <Palette className="w-4 h-4 text-emerald-300" />
                <span>Theme</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (9 Requirement Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Today's Calories */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Today's Calories</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{consumedCalories}</div>
            <div className="text-xs text-slate-500 mt-0.5">of {targets.targetCalories} kcal</div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>

        {/* Card 2: Remaining Calories */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Remaining Target</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-700">{remainingCalories}</div>
            <div className="text-xs text-slate-500 mt-0.5">kcal left for today</div>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-3">
            {remainingCalories > 0 ? 'Within budget' : 'Target reached'}
          </div>
        </div>

        {/* Card 3: Daily Protein Target */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Protein Target</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{consumedProtein.toFixed(0)}g</div>
            <div className="text-xs text-slate-500 mt-0.5">Goal: {targets.targetProtein}g</div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>

        {/* Card 4: Water Intake & Target */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Water Intake</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sky-700">{totalWater.toFixed(1)}L</div>
            <div className="text-xs text-slate-500 mt-0.5">Target: {targets.targetWater}L</div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>

        {/* Card 5: Current Weight & BMI Category */}
        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Current Weight & BMI</span>
            <Scale className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900">{profile.weight}</span>
              <span className="text-xs font-semibold text-slate-500">kg</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              BMI: <strong className="text-slate-800">{targets.bmi}</strong> ({targets.bmiCategory})
            </div>
          </div>
          <div className="mt-3">
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${targets.bmiColor}`}>
              {targets.bmiCategory}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section: Weight Trend & Weekly Calories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progress Chart Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Weight Progress Trend
              </h3>
              <p className="text-xs text-slate-500">Recorded weigh-ins over recent check-ins</p>
            </div>
            <button
              id="dash-update-weight-btn"
              onClick={() => onNavigate('weight')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Update Weight</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-2">
            <LineChart
              data={weightChartData}
              unit="kg"
              color="#059669"
              height={190}
              emptyMessage="Log your first weight entry in the Weight Tracker"
            />
          </div>
        </div>

        {/* Weekly Calorie Target Chart Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Weekly Calorie Intake
              </h3>
              <p className="text-xs text-slate-500">
                Daily kcal consumption vs target ({targets.targetCalories} kcal)
              </p>
            </div>
            <button
              id="dash-view-progress-btn"
              onClick={() => onNavigate('progress')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <BarChart data={weeklyCalorieData} unit="kcal" color="#f59e0b" height={190} />
        </div>
      </div>

      {/* Two Column Panels: Today's Intake vs Today's Planned Meals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Food Intake Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Today's Food Intake</h3>
                <p className="text-xs text-slate-500">{todayFoodLogs.length} items logged so far</p>
              </div>
            </div>
            <button
              id="dash-add-food-btn"
              onClick={() => onNavigate('tracker')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Food</span>
            </button>
          </div>

          {todayFoodLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No food logged yet today. Click "Add Food" to record your breakfast!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {todayFoodLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800 transition-colors text-xs gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <img
                        src={getFoodImage(log.food)}
                        alt={log.food?.name || 'Food'}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {log.food?.name || 'Logged item'}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 capitalize text-[11px]">
                        {log.meal_type.replace('_', ' ')} • {log.quantity}x serving
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {log.food ? Math.round(log.food.calories * log.quantity) : 0} kcal
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {log.food ? (log.food.protein * log.quantity).toFixed(1) : 0}g protein
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Meal Plan Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Today's Meal Regime Plan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Curated nutritional blueprint</p>
              </div>
            </div>
            <button
              id="dash-edit-plan-btn"
              onClick={() => onNavigate('planner')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 flex items-center gap-1"
            >
              <span>Manage Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayMealPlans.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No meal plan scheduled for today. Click "Manage Plan" to construct your menu!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {todayMealPlans.slice(0, 5).map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800 transition-colors text-xs gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <img
                        src={getFoodImage(plan.food)}
                        alt={plan.food?.name || 'Planned food'}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <span className="inline-block px-1.5 py-0.2 rounded bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-0.5 capitalize">
                        {plan.meal_type.replace('_', ' ')}
                      </span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {plan.food?.name || 'Planned Food'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-indigo-900 dark:text-indigo-300">
                      {plan.food ? Math.round(plan.food.calories * plan.serving_quantity) : 0} kcal
                    </p>
                    <p className="text-slate-500 text-[11px]">{plan.food?.serving_size}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Premium Download & Export Section */}
      <div className="bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-indigo-600/10 dark:from-emerald-950/30 dark:to-indigo-950/30 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 dark:border-emerald-800/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
              Export Nutrition & Diet Summary Report
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Generate PDF print charts, CSV spreadsheet summaries, or JSON data for your college evaluation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenDownloadReport && (
            <button
              id="dash-download-banner-btn"
              onClick={onOpenDownloadReport}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Report</span>
            </button>
          )}
          {onOpenThemeModal && (
            <button
              id="dash-theme-banner-btn"
              onClick={onOpenThemeModal}
              className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Palette className="w-4 h-4 text-emerald-600" />
              <span>Customize Theme</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Hydration Quick Bar */}
      <div className="bg-sky-50/70 rounded-2xl border border-sky-100 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/20">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Quick Hydration Boost</h4>
            <p className="text-xs text-slate-600">
              Current intake: <strong className="text-sky-800">{totalWater.toFixed(1)} L</strong> / {targets.targetWater} L target.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="dash-quick-water-250"
            onClick={() => onQuickAddWater(0.25)}
            className="px-3 py-1.5 bg-white hover:bg-sky-100 text-sky-800 font-semibold rounded-lg text-xs border border-sky-200 transition-colors shadow-2xs"
          >
            +250ml Glass
          </button>
          <button
            id="dash-quick-water-500"
            onClick={() => onQuickAddWater(0.5)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
          >
            +500ml Bottle
          </button>
          <button
            id="dash-open-water-tab"
            onClick={() => onNavigate('water')}
            className="px-3 py-1.5 bg-white text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg border border-slate-200"
          >
            View Water Log
          </button>
        </div>
      </div>
    </div>
  );
};
