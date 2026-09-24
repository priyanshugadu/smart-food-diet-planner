import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, WeightLog } from '../types';
import { LineChart } from '../components/Charts';

interface WeightTrackerViewProps {
  profile: UserProfile;
  weightLogs: WeightLog[];
  onAddWeightLog: (weight: number, date: string, note?: string) => Promise<void>;
  onRemoveWeightLog: (logId: string) => Promise<void>;
}

export const WeightTrackerView: React.FC<WeightTrackerViewProps> = ({
  profile,
  weightLogs,
  onAddWeightLog,
  onRemoveWeightLog,
}) => {
  const [newWeight, setNewWeight] = useState(profile.weight || 70);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNote, setNewNote] = useState('Morning weigh-in (fasted)');
  const [submitting, setSubmitting] = useState(false);

  // Compute metrics
  const sortedLogs = [...weightLogs].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );

  const startingWeight = sortedLogs.length > 0 ? sortedLogs[0].weight : profile.weight;
  const currentWeight = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].weight : profile.weight;

  // Derive goal weight based on fitness goal
  let goalWeight = profile.weight;
  if (profile.fitness_goal === 'weight_loss') goalWeight = Math.max(45, profile.weight - 5);
  else if (profile.fitness_goal === 'muscle_gain' || profile.fitness_goal === 'weight_gain')
    goalWeight = profile.weight + 3;

  const totalDiff = Number((currentWeight - startingWeight).toFixed(1));
  const goalDiff = Number((currentWeight - goalWeight).toFixed(1));

  const chartData = sortedLogs.map((log) => ({
    label: log.logged_at.slice(5), // MM-DD
    value: log.weight,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeight <= 0) return;
    setSubmitting(true);
    try {
      await onAddWeightLog(Number(newWeight), newDate, newNote.trim());
      setNewNote('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <span>Body Weight & Composition Tracker</span>
          </h3>
          <p className="text-xs text-slate-500">
            Monitor weigh-in milestones and calibrate metabolic progress over time
          </p>
        </div>
      </div>

      {/* KPI Cards: Starting, Current, Goal, Difference */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Starting Weight */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Starting Weight</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-800">{startingWeight}</span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Initial check-in</span>
        </div>

        {/* Current Weight */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Current Weight</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-700">{currentWeight}</span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Latest recorded</span>
        </div>

        {/* Goal Weight */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Target Weight</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-indigo-700">{goalWeight}</span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
          <span className="text-[11px] text-slate-500 capitalize mt-1 block">
            {profile.fitness_goal.replace('_', ' ')}
          </span>
        </div>

        {/* Total Difference */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Net Difference</span>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-extrabold ${
                totalDiff <= 0 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {totalDiff > 0 ? `+${totalDiff}` : totalDiff}
            </span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mt-1">
            {totalDiff <= 0 ? (
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>Since start</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm">Weight Progression Curve</h4>
          <span className="text-xs text-slate-500">{sortedLogs.length} data points logged</span>
        </div>

        <div className="pt-2">
          <LineChart
            data={chartData}
            unit="kg"
            color="#059669"
            height={220}
            emptyMessage="Record your first weigh-in below to render the trend line"
          />
        </div>
      </div>

      {/* Log Form & History Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record New Weigh-in Form */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            Record Weigh-In
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weight (kg)
              </label>
              <input
                id="input-weight-kg"
                type="number"
                step="0.1"
                min="30"
                max="250"
                required
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                id="input-weight-date"
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Notes
              </label>
              <input
                id="input-weight-note"
                type="text"
                placeholder="e.g. Post-workout, morning fasted..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <button
              id="btn-save-weight"
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Add Weigh-In Entry'}</span>
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h4 className="font-bold text-slate-900 text-sm">Previous Weight Logs</h4>
            <span className="text-xs text-slate-500">{sortedLogs.length} total entries</span>
          </div>

          {sortedLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No previous logs found. Log your first weight entry above!
            </div>
          ) : (
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 sticky top-0 bg-white">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Weight</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedLogs.slice().reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{log.logged_at}</td>
                      <td className="py-2.5 px-3 font-extrabold text-emerald-700 text-sm">
                        {log.weight} kg
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 truncate max-w-[160px]">
                        {log.note || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onRemoveWeightLog(log.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
