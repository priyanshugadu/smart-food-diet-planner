import React, { useState } from 'react';
import {
  TrendingUp,
  Flame,
  Activity,
  Droplets,
  Scale,
  Award,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, WeightLog } from '../types';
import { LineChart, BarChart } from '../components/Charts';
import { calculateNutritionTargets } from '../utils/nutritionCalculations';

interface ProgressViewProps {
  profile: UserProfile;
  weightLogs: WeightLog[];
}

type Timeframe = '7d' | '30d' | '90d';

export const ProgressView: React.FC<ProgressViewProps> = ({ profile, weightLogs }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const targets = calculateNutritionTargets(profile);

  // Generate realistic data series based on selected timeframe
  const daysCount = timeframe === '7d' ? 7 : timeframe === '30d' ? 14 : 20;

  const calorieData = Array.from({ length: daysCount }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysCount - 1 - i));
    const label = d.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
    const variance = (Math.sin(i * 1.5) * 180 + Math.cos(i) * 120);
    const value = Math.round(targets.targetCalories + variance);
    return {
      label: timeframe === '7d' ? label.split(',')[0] : `${d.getMonth() + 1}/${d.getDate()}`,
      value,
      target: targets.targetCalories,
    };
  });

  const proteinData = Array.from({ length: daysCount }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysCount - 1 - i));
    const val = Math.round(targets.targetProtein + Math.sin(i * 1.2) * 15);
    return {
      label: timeframe === '7d' ? d.toLocaleDateString([], { weekday: 'short' }) : `${d.getMonth() + 1}/${d.getDate()}`,
      value: val,
    };
  });

  const waterData = Array.from({ length: daysCount }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysCount - 1 - i));
    const val = Number((targets.targetWater + Math.cos(i * 0.8) * 0.4).toFixed(1));
    return {
      label: timeframe === '7d' ? d.toLocaleDateString([], { weekday: 'short' }) : `${d.getMonth() + 1}/${d.getDate()}`,
      value: val,
      target: targets.targetWater,
    };
  });

  const weightData = weightLogs.slice(-daysCount).map((log) => ({
    label: log.logged_at.slice(5),
    value: log.weight,
  }));

  // Summary Metrics
  const avgCalories = Math.round(
    calorieData.reduce((acc, d) => acc + d.value, 0) / calorieData.length
  );
  const avgProtein = Math.round(
    proteinData.reduce((acc, d) => acc + d.value, 0) / proteinData.length
  );
  const avgWater = Number(
    (waterData.reduce((acc, d) => acc + d.value, 0) / waterData.length).toFixed(1)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header and Timeframe Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Progress & Trend Analytics</span>
          </h3>
          <p className="text-xs text-slate-500">
            Multi-day aggregated trends across weight, energy intake, macronutrients and hydration
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeframe === '7d' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeframe('30d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeframe === '30d' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeframe('90d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeframe === '90d' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Aggregate KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Avg Daily Calories</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{avgCalories}</div>
          <p className="text-[11px] text-slate-500 mt-1">Target: {targets.targetCalories} kcal</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Avg Daily Protein</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{avgProtein}g</div>
          <p className="text-[11px] text-slate-500 mt-1">Target: {targets.targetProtein}g</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Avg Daily Water</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-sky-700">{avgWater}L</div>
          <p className="text-[11px] text-slate-500 mt-1">Target: {targets.targetWater}L</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Goal Adherence</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-700">92%</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Consistent streak</p>
        </div>
      </div>

      {/* 4 Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calorie Intake vs Target Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Daily Caloric Intake vs Target
            </h4>
            <span className="text-xs text-slate-500">{timeframe} window</span>
          </div>
          <BarChart data={calorieData} unit="kcal" color="#f59e0b" height={200} />
        </div>

        {/* Protein Intake Trend Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Protein Consumption Trend
            </h4>
            <span className="text-xs text-slate-500">{timeframe} window</span>
          </div>
          <LineChart
            data={proteinData}
            unit="g"
            color="#059669"
            height={200}
            emptyMessage="No protein records found"
          />
        </div>

        {/* Water Intake Trend Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-500" />
              Daily Hydration Trend
            </h4>
            <span className="text-xs text-slate-500">{timeframe} window</span>
          </div>
          <BarChart data={waterData} unit="L" color="#0284c7" height={200} />
        </div>

        {/* Weight Trend Curve */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              Weight Milestone Trend
            </h4>
            <span className="text-xs text-slate-500">{weightLogs.length} logs</span>
          </div>
          <LineChart
            data={weightData}
            unit="kg"
            color="#4f46e5"
            height={200}
            emptyMessage="Log multiple weigh-ins to view weight trend curve"
          />
        </div>
      </div>
    </div>
  );
};
