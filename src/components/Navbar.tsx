import React from 'react';
import { Menu, Plus, BotMessageSquare, Sparkles, Palette, Download, Smartphone, ShieldCheck, CalendarDays, Calendar as CalendarIcon } from 'lucide-react';
import { NavTab } from './Sidebar';
import { AppTheme } from '../types';
import appLogo from '../assets/images/smart_diet_logo_1790175111322.jpg';
import { formatDisplayDate, formatLocalDate } from '../utils/dateUtils';

interface NavbarProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onSelectTab: (tab: NavTab) => void;
  isSupabaseConnected: boolean;
  currentTheme?: AppTheme;
  onOpenThemeModal?: () => void;
  onOpenDownloadReport?: () => void;
  onOpenAndroidInstall?: () => void;
  userRole?: string;
  selectedDate?: string;
  onOpenCalendarModal?: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Smart Dashboard', subtitle: 'Daily nutritional overview and vital health targets' },
  profile: { title: 'My Nutrition Profile', subtitle: 'Personal metrics, dietary preferences and calorie targets' },
  calendar: { title: 'Diet & Meal Calendar', subtitle: 'Interactive monthly & weekly meal regime schedule' },
  planner: { title: 'Smart Diet Planner', subtitle: 'Design daily and weekly balanced meal regimes' },
  database: { title: 'Food & Nutrition Database', subtitle: 'Comprehensive food items with Indian staples and filters' },
  tracker: { title: 'Food & Calorie Tracker', subtitle: 'Log daily food consumption and monitor macro goals' },
  water: { title: 'Daily Water Tracker', subtitle: 'Hydration logging, target management and daily timeline' },
  weight: { title: 'Weight & Body Tracker', subtitle: 'Log weigh-ins and track progress against goals' },
  progress: { title: 'Weekly & Monthly Progress', subtitle: 'Multi-day analytical trends and goal completion statistics' },
  grocery: { title: 'Grocery List Generator', subtitle: 'Auto-compiled ingredient shopping list from planned meals' },
  ai: { title: 'AI Diet Assistant', subtitle: 'Interactive intelligent nutrition advisor and meal ideas' },
  admin: { title: 'Admin Management Panel', subtitle: 'Database monitoring, food management, and system stats' },
  settings: { title: 'Settings & Supabase Schema', subtitle: 'PostgreSQL DDL, RLS rules and cloud database integration' },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onSelectTab,
  isSupabaseConnected,
  currentTheme = 'emerald',
  onOpenThemeModal,
  onOpenDownloadReport,
  onOpenAndroidInstall,
  userRole,
  selectedDate,
  onOpenCalendarModal,
}) => {
  const current = TAB_TITLES[currentTab] || { title: 'Smart Diet Planner', subtitle: '' };
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          id="mobile-menu-btn"
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Logo */}
        <div className="w-8 h-8 rounded-xl overflow-hidden bg-white border border-slate-200/80 dark:border-slate-700 shadow-xs shrink-0 flex items-center justify-center p-0.5 lg:hidden">
          <img
            src={appLogo}
            alt="Smart Food & Diet Planner Logo"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">{current.title}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Download Report Button */}
        {onOpenDownloadReport && (
          <button
            id="nav-download-btn"
            onClick={onOpenDownloadReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Download Diet Plan Report (PDF, CSV, JSON)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Download</span>
          </button>
        )}

        {/* Android App Button */}
        {onOpenAndroidInstall && (
          <button
            id="nav-android-btn"
            onClick={onOpenAndroidInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-2xs cursor-pointer"
            title="Download & Install App on Android (PWA / WebAPK)"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Android App</span>
          </button>
        )}

        {/* Theme Switcher Button */}
        {onOpenThemeModal && (
          <button
            id="nav-theme-btn"
            onClick={onOpenThemeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-colors shadow-2xs capitalize"
            title="Change Theme & Appearance"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">{currentTheme}</span>
          </button>
        )}

        {/* Admin Portal Quick Button */}
        <button
          id="nav-admin-portal-btn"
          onClick={() => onSelectTab('admin')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
            userRole === 'admin'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200/80 dark:border-slate-700'
          }`}
          title={userRole === 'admin' ? 'Open Admin Management Panel (Admin Active)' : 'Open Admin Login & Management Panel'}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">{userRole === 'admin' ? 'Admin Active' : 'Admin Login'}</span>
        </button>

        {/* Interactive Calendar Button */}
        <button
          id="nav-calendar-btn"
          onClick={() => {
            if (onOpenCalendarModal) {
              onOpenCalendarModal();
            } else {
              onSelectTab('calendar');
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
          title="Open Diet Calendar & Date Selector"
        >
          <CalendarDays className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">
            {selectedDate ? formatDisplayDate(selectedDate) : todayFormatted}
          </span>
          <span className="sm:hidden font-bold">Calendar</span>
        </button>

        {/* Quick Action: Log Food */}
        <button
          id="quick-log-food-btn"
          onClick={() => onSelectTab('tracker')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Food</span>
        </button>

        {/* Quick AI Assistant Trigger */}
        <button
          id="quick-ai-btn"
          onClick={() => onSelectTab('ai')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </div>
    </header>
  );
};
