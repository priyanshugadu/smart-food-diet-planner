import React from 'react';
import {
  LayoutDashboard,
  User,
  CalendarDays,
  Database,
  UtensilsCrossed,
  Droplets,
  Scale,
  TrendingUp,
  ShoppingCart,
  BotMessageSquare,
  ShieldCheck,
  Settings,
  LogOut,
  Sparkles,
  Palette,
  Download,
} from 'lucide-react';
import { AuthUser, AppTheme } from '../types';

export type NavTab =
  | 'dashboard'
  | 'profile'
  | 'calendar'
  | 'planner'
  | 'database'
  | 'tracker'
  | 'water'
  | 'weight'
  | 'progress'
  | 'grocery'
  | 'ai'
  | 'admin'
  | 'settings';

import appLogo from '../assets/images/smart_diet_logo_1790175111322.jpg';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: AuthUser;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isSupabaseConnected: boolean;
  currentTheme?: AppTheme;
  onOpenThemeModal?: () => void;
  onOpenDownloadReport?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  isSupabaseConnected,
  currentTheme = 'emerald',
  onOpenThemeModal,
  onOpenDownloadReport,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'calendar', label: 'Diet Calendar', icon: CalendarDays, badge: 'Schedule' },
    { id: 'planner', label: 'Meal Planner', icon: UtensilsCrossed },
    { id: 'database', label: 'Food Database', icon: Database },
    { id: 'tracker', label: 'Food Tracker', icon: UtensilsCrossed },
    { id: 'water', label: 'Water Tracker', icon: Droplets },
    { id: 'weight', label: 'Weight Tracker', icon: Scale },
    { id: 'progress', label: 'Progress & Trends', icon: TrendingUp },
    { id: 'grocery', label: 'Grocery List', icon: ShoppingCart },
    { id: 'ai', label: 'AI Diet Assistant', icon: BotMessageSquare, badge: 'AI' },
    { id: 'admin', label: 'Admin Management Panel', icon: ShieldCheck, badge: user.role === 'admin' ? 'Admin Active' : 'Faculty' },
    { id: 'settings', label: 'Settings & Schema', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Branding */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white shadow-md shadow-emerald-600/10 border border-slate-200/80 shrink-0 flex items-center justify-center p-0.5">
              <img
                src={appLogo}
                alt="Smart Food & Diet Planner Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1.5">
                <span>Smart Food & Diet</span>
              </h1>
              <p className="text-[11px] text-emerald-700 font-semibold tracking-wide">Better Food • Healthier You</p>
            </div>
          </div>
        </div>

        {/* Database Status Indicator Pill */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Database Mode:</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold ${
              isSupabaseConnected
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
            />
            {isSupabaseConnected ? 'Supabase Cloud' : 'Guest / Local DB'}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      item.badge === 'AI'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center gap-0.5'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.badge === 'AI' && <Sparkles className="w-2.5 h-2.5" />}
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick App Actions: Download Report */}
        <div className="px-3 pt-2 pb-1 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
          {onOpenDownloadReport && (
            <button
              id="sidebar-download-btn"
              onClick={() => {
                onCloseMobile();
                onOpenDownloadReport();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Download Report</span>
              </div>
              <span className="text-[10px] text-slate-400">PDF / CSV</span>
            </button>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
          {/* Quick Admin Portal Button */}
          <button
            id="sidebar-admin-portal-btn"
            onClick={() => {
              onCloseMobile();
              onSelectTab('admin');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              user.role === 'admin'
                ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'bg-white hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-800 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{user.role === 'admin' ? 'Admin Panel (Active)' : 'Admin Login Portal'}</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              user.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {user.role === 'admin' ? 'Admin' : 'Faculty'}
            </span>
          </button>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user.full_name || 'Nutrition User'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onOpenThemeModal && (
                <button
                  id="sidebar-theme-btn"
                  onClick={onOpenThemeModal}
                  title={`Theme: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} (Click to change)`}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Palette className="w-4 h-4" />
                </button>
              )}
              <button
                id="logout-btn"
                onClick={onLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
