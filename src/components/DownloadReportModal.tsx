import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  FileSpreadsheet,
  FileJson,
  FileText,
  X,
  CheckCircle2,
  Calendar,
  User,
  Activity,
  Flame,
  Droplets,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, MealPlanItem, FoodLog, WaterLog, WeightLog } from '../types';
import { calculateNutritionTargets } from '../utils/nutritionCalculations';
import {
  downloadPdfReportHtml,
  downloadCsvReport,
  downloadJsonReport,
  downloadTextSummary,
} from '../utils/reportExporter';
import appLogo from '../assets/images/smart_diet_logo_1790175111322.jpg';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  mealPlans: MealPlanItem[];
  foodLogs: FoodLog[];
  waterLogs: WaterLog[];
  weightLogs: WeightLog[];
  selectedDate?: string;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  mealPlans,
  foodLogs,
  waterLogs,
  weightLogs,
  selectedDate,
}) => {
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const targets = calculateNutritionTargets(profile);
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate totals for report preview
  const totalPlannedCalories = mealPlans.reduce((sum, item) => {
    return sum + (item.food ? Math.round(item.food.calories * item.serving_quantity) : 0);
  }, 0);

  const totalPlannedProtein = mealPlans.reduce((sum, item) => {
    return sum + (item.food ? Math.round(item.food.protein * item.serving_quantity) : 0);
  }, 0);

  const totalWaterLogged = waterLogs.reduce((sum, w) => sum + w.amount, 0);

  const showNotification = (msg: string) => {
    setDownloadSuccessMsg(msg);
    setTimeout(() => {
      setDownloadSuccessMsg(null);
    }, 4000);
  };

  // Direct Download Formatted HTML / PDF Report
  const handleDownloadPdf = () => {
    downloadPdfReportHtml(profile, targets, mealPlans, foodLogs, waterLogs, todayStr);
    showNotification('Diet Plan Report file downloaded! Open file to view & print to PDF.');
  };

  // Print PDF Trigger with fallback
  const handlePrintPdf = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Iframe print sandbox encountered:', e);
      // Fallback: download styled file immediately
      handleDownloadPdf();
      showNotification('Direct browser print is restricted in preview. Report downloaded to your device!');
    }
  };

  // Export JSON
  const handleExportJson = () => {
    downloadJsonReport(profile, targets, mealPlans, foodLogs, waterLogs);
    showNotification('Diet Plan JSON database file downloaded!');
  };

  // Export CSV
  const handleExportCsv = () => {
    downloadCsvReport(profile, targets, mealPlans, todayStr);
    showNotification('Diet Plan CSV spreadsheet file downloaded!');
  };

  // Export Text Summary
  const handleExportTxt = () => {
    downloadTextSummary(profile, targets, mealPlans, todayStr);
    showNotification('Diet Plan text summary card downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full my-8 overflow-hidden text-slate-900 dark:text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Download Diet Plan & Health Report</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official mini-project nutrition summary and personalized meal chart
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Bar */}
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border-b border-emerald-100/60 dark:border-emerald-900/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <span>Choose format to download directly:</span>
            {downloadSuccessMsg && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] animate-in fade-in flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{downloadSuccessMsg}</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="modal-btn-download-pdf"
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Download standalone formatted HTML / PDF document directly to your device"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF/HTML</span>
            </button>

            <button
              id="modal-btn-print"
              onClick={handlePrintPdf}
              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open browser print dialog"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Print Dialog</span>
            </button>

            <button
              id="modal-btn-download-csv"
              onClick={handleExportCsv}
              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download Excel compatible CSV file"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>CSV Sheet</span>
            </button>

            <button
              id="modal-btn-download-json"
              onClick={handleExportJson}
              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download structured JSON report"
            >
              <FileJson className="w-4 h-4 text-indigo-600" />
              <span>JSON</span>
            </button>

            <button
              id="modal-btn-download-txt"
              onClick={handleExportTxt}
              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download plain text diet summary card"
            >
              <FileText className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>Text</span>
            </button>
          </div>
        </div>

        {/* Printable Report Document Preview */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-xs print:p-0 print:m-0" id="diet-printable-report">
          {/* Document Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 overflow-hidden">
                <img
                  src={appLogo}
                  alt="Smart Food & Diet Planner"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-xs tracking-wider uppercase">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Smart Food & Diet Planner</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  Personal Nutrition & Diet Chart
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Better Food • Healthier You — MNT Assessment & Meal Protocol
                </p>
              </div>
            </div>

            <div className="sm:text-right bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0">
              <span className="block text-[11px] text-slate-400 font-semibold">Report Generated</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{todayStr}</span>
            </div>
          </div>

          {/* User Biometrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate / User</span>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">{profile.full_name}</span>
              <span className="text-[11px] text-slate-500 block">{profile.age} yrs • {profile.gender}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">BMI & Body Index</span>
              <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{targets.bmi} kg/m²</span>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block">{targets.bmiCategory}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Energy</span>
              <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">{targets.targetCalories} kcal</span>
              <span className="text-[11px] text-slate-500 block">TDEE: {targets.tdee} kcal</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Macro Targets</span>
              <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">{targets.targetProtein}g Protein</span>
              <span className="text-[11px] text-slate-500 block">{targets.targetWater}L Daily Water</span>
            </div>
          </div>

          {/* Planned Meals Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-600" />
                <span>Structured Meal Schedule</span>
              </h4>
              <span className="font-semibold text-slate-500">
                Total Planned: <strong className="text-emerald-600">{totalPlannedCalories} kcal</strong> • <strong className="text-emerald-600">{totalPlannedProtein}g Protein</strong>
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Meal Slot</th>
                    <th className="py-2.5 px-3">Food Item</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Calories</th>
                    <th className="py-2.5 px-3">Protein</th>
                    <th className="py-2.5 px-3">Carbs</th>
                    <th className="py-2.5 px-3">Fat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mealPlans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-400">
                        No meals scheduled for today. Add items via the Diet Planner tab.
                      </td>
                    </tr>
                  ) : (
                    mealPlans.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300 capitalize">
                          {item.meal_type.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {item.food?.name || 'Custom item'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {item.serving_quantity}x ({item.food?.serving_size})
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                          {item.food ? Math.round(item.food.calories * item.serving_quantity) : 0} kcal
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-600">
                          {item.food ? Math.round(item.food.protein * item.serving_quantity) : 0}g
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-sky-600">
                          {item.food ? Math.round(item.food.carbohydrates * item.serving_quantity) : 0}g
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-purple-600">
                          {item.food ? Math.round(item.food.fat * item.serving_quantity) : 0}g
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hydration & Adherence Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-sky-50/40 dark:bg-sky-950/20 space-y-1.5">
              <span className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-600" />
                <span>Hydration Status</span>
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                Logged Intake: <strong>{totalWaterLogged.toFixed(1)} Liters</strong> / Goal: <strong>{targets.targetWater} Liters</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>System Verified</span>
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Calculated using the Mifflin-St Jeor metabolic formula. Validated for academic demonstration.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              All files download directly to your device storage.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
