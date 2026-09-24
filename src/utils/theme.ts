import { AppTheme } from '../types';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  badge: string;
  primaryColor: string;
  accentBg: string;
  isDark: boolean;
  previewClass: string;
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'emerald',
    name: 'Emerald Health',
    badge: 'Fresh & Clean',
    primaryColor: '#059669',
    accentBg: 'from-emerald-600 to-teal-700',
    isDark: false,
    previewClass: 'bg-emerald-500',
  },
  {
    id: 'midnight',
    name: 'Midnight Luxe',
    badge: 'Pro Dark Mode',
    primaryColor: '#10b981',
    accentBg: 'from-slate-900 to-emerald-950',
    isDark: true,
    previewClass: 'bg-slate-900 ring-2 ring-emerald-500',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Clinical',
    badge: 'Medical & Tech',
    primaryColor: '#2563eb',
    accentBg: 'from-blue-600 to-indigo-700',
    isDark: false,
    previewClass: 'bg-blue-600',
  },
  {
    id: 'sunset',
    name: 'Sunset Vitality',
    badge: 'Warm & Energizing',
    primaryColor: '#ea580c',
    accentBg: 'from-amber-500 to-orange-600',
    isDark: false,
    previewClass: 'bg-amber-500',
  },
  {
    id: 'berry',
    name: 'Berry Antioxidant',
    badge: 'Plum & Rose',
    primaryColor: '#7c3aed',
    accentBg: 'from-purple-600 to-pink-600',
    isDark: false,
    previewClass: 'bg-purple-600',
  },
];

const THEME_STORAGE_KEY = 'smart_diet_app_theme';

export function getStoredTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;
    if (saved && AVAILABLE_THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch (e) {
    // ignore
  }
  return 'emerald';
}

export const getSavedTheme = getStoredTheme;

export function saveStoredTheme(theme: AppTheme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    // ignore
  }
}

export function applyTheme(theme: AppTheme) {
  saveStoredTheme(theme);
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute('data-theme', theme);
    if (body) {
      body.setAttribute('data-theme', theme);
    }
    
    if (theme === 'midnight') {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      if (body) body.classList.remove('dark');
    }
  }
}
