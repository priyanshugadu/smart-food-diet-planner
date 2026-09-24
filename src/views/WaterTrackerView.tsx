import React, { useState } from 'react';
import {
  Droplets,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  GlassWater,
} from 'lucide-react';
import { UserProfile, WaterLog } from '../types';
import { DateRibbon } from '../components/DateRibbon';

interface WaterTrackerViewProps {
  profile: UserProfile;
  waterLogs: WaterLog[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onAddWater: (amountLiters: number) => Promise<void>;
  onRemoveWater: (logId: string) => Promise<void>;
  onOpenCalendarModal?: () => void;
}

export const WaterTrackerView: React.FC<WaterTrackerViewProps> = ({
  profile,
  waterLogs,
  selectedDate,
  onChangeDate,
  onAddWater,
  onRemoveWater,
  onOpenCalendarModal,
}) => {
  const [customAmountMl, setCustomAmountMl] = useState(300);
  const targetLiters = profile.target_water || 2.5;

  const totalConsumed = waterLogs.reduce((acc, log) => acc + log.amount, 0);
  const remainingLiters = Math.max(0, Number((targetLiters - totalConsumed).toFixed(2)));
  const percentage = Math.min(100, Math.round((totalConsumed / targetLiters) * 100));

  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customAmountMl <= 0) return;
    await onAddWater(customAmountMl / 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 7-Day Interactive Date Strip */}
      <DateRibbon
        selectedDate={selectedDate}
        onChangeDate={onChangeDate}
        onOpenCalendarModal={onOpenCalendarModal}
        label="Water Intake Date"
      />

      {/* Header & Date Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-500" />
            <span>Daily Hydration & Water Tracker</span>
          </h3>
          <p className="text-xs text-slate-500">
            Maintain optimal cellular hydration and metabolic efficiency
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold self-start sm:self-auto">
          <span className="text-slate-500">Date:</span>
          <input
            id="water-log-date"
            type="date"
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="bg-transparent text-slate-800 focus:outline-none cursor-pointer font-medium"
          />
        </div>
      </div>

      {/* Main Hydration Visual Widget */}
      <div className="bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-600/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sky-100 text-xs font-semibold backdrop-blur-xs">
              <Droplets className="w-3.5 h-3.5" />
              <span>Target: {targetLiters} Liters / Day</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-4xl sm:text-5xl font-black tracking-tight">
                  {totalConsumed.toFixed(2)}
                </span>
                <span className="text-xl font-semibold text-sky-200">Liters</span>
              </div>
              <p className="text-sky-100 text-xs font-medium">
                {remainingLiters > 0
                  ? `${remainingLiters} L remaining to hit daily hydration target`
                  : '🎉 Hydration target accomplished for today!'}
              </p>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full max-w-md bg-white/25 h-3 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
              <div
                className="bg-white h-full rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-sky-200 font-bold">{percentage}% of goal achieved</p>
          </div>

          {/* Circular Water Indicator Graphic */}
          <div className="relative w-36 h-36 rounded-full bg-white/10 border-4 border-white/30 flex flex-col items-center justify-center p-4 backdrop-blur-md shadow-inner shrink-0">
            <Droplets className="w-8 h-8 text-white mb-1 animate-pulse" />
            <span className="text-2xl font-black">{percentage}%</span>
            <span className="text-[11px] font-semibold text-sky-200 uppercase tracking-wider">Hydrated</span>
          </div>
        </div>
      </div>

      {/* Quick Add Action Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">Quick Add Water</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            id="water-quick-250"
            onClick={() => onAddWater(0.25)}
            className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100/80 text-sky-900 transition-all flex flex-col items-center justify-center gap-1 group shadow-2xs"
          >
            <span className="text-lg">🥛</span>
            <span className="text-xs font-bold">+250 ml</span>
            <span className="text-[10px] text-slate-500">Standard Glass</span>
          </button>

          <button
            id="water-quick-500"
            onClick={() => onAddWater(0.5)}
            className="p-3.5 rounded-xl border border-sky-300 bg-sky-100/60 hover:bg-sky-200/80 text-sky-900 transition-all flex flex-col items-center justify-center gap-1 group shadow-2xs"
          >
            <span className="text-lg">🧴</span>
            <span className="text-xs font-bold">+500 ml</span>
            <span className="text-[10px] text-slate-500">Water Bottle</span>
          </button>

          <button
            id="water-quick-750"
            onClick={() => onAddWater(0.75)}
            className="p-3.5 rounded-xl border border-sky-300 bg-sky-100/60 hover:bg-sky-200/80 text-sky-900 transition-all flex flex-col items-center justify-center gap-1 group shadow-2xs"
          >
            <span className="text-lg">🥤</span>
            <span className="text-xs font-bold">+750 ml</span>
            <span className="text-[10px] text-slate-500">Gym Sipper</span>
          </button>

          <button
            id="water-quick-1000"
            onClick={() => onAddWater(1.0)}
            className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-900 transition-all flex flex-col items-center justify-center gap-1 group shadow-2xs"
          >
            <span className="text-lg">🫙</span>
            <span className="text-xs font-bold">+1000 ml</span>
            <span className="text-[10px] text-slate-500">Full Carafe</span>
          </button>
        </div>

        {/* Custom Input Form */}
        <form
          onSubmit={handleCustomAdd}
          className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="flex items-center gap-2 flex-1 w-full">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Custom Amount (ml):
            </label>
            <input
              type="number"
              min="50"
              max="3000"
              step="50"
              value={customAmountMl}
              onChange={(e) => setCustomAmountMl(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Intake</span>
          </button>
        </form>
      </div>

      {/* Today's Intake Log History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Today's Hydration Timeline</span>
          </h4>
          <span className="text-xs text-slate-500">{waterLogs.length} entries</span>
        </div>

        {waterLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No water logged yet today. Click one of the quick add buttons above to track your hydration!
          </div>
        ) : (
          <div className="space-y-2">
            {waterLogs.map((log) => {
              const timeString = new Date(log.logged_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        +{(log.amount * 1000).toFixed(0)} ml ({log.amount.toFixed(2)} L)
                      </p>
                      <p className="text-slate-400 text-[11px]">{timeString}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveWater(log.id)}
                    title="Remove entry"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hydration Guidance Tips */}
      <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-900 space-y-1">
          <p className="font-semibold">Hydration Health Tip:</p>
          <p className="text-sky-800 leading-relaxed">
            Drinking 500ml of water approximately 30 minutes before main meals improves digestive enzyme activation and satiety.
            Spread hydration evenly throughout daylight hours rather than drinking in large sudden bursts.
          </p>
        </div>
      </div>
    </div>
  );
};
