/**
 * Date utilities for local timezone-safe date strings (YYYY-MM-DD)
 */

export function formatLocalDate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

export function formatDisplayDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatLongDisplayDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function getRelativeDateLabel(dateStr: string): string {
  const today = formatLocalDate(new Date());
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  if (dateStr === tomorrow) return 'Tomorrow';

  const d = parseLocalDate(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

export interface WeekDayInfo {
  dateStr: string;
  dayName: string;
  shortDayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
  isSelected: boolean;
}

export function getWeekDays(centerDateStr: string, rangeDays: number = 7): WeekDayInfo[] {
  const todayStr = formatLocalDate(new Date());
  // Show 3 days before and 3 days after centerDate
  const offsetStart = -Math.floor(rangeDays / 2);
  const days: WeekDayInfo[] = [];

  for (let i = 0; i < rangeDays; i++) {
    const dStr = addDays(centerDateStr, offsetStart + i);
    const dateObj = parseLocalDate(dStr);
    days.push({
      dateStr: dStr,
      dayName: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj),
      shortDayName: new Intl.DateTimeFormat('en-US', { weekday: 'narrow' }).format(dateObj),
      dayNumber: dateObj.getDate(),
      monthName: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(dateObj),
      isToday: dStr === todayStr,
      isSelected: dStr === centerDateStr,
    });
  }

  return days;
}

export interface MonthDayInfo {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export function getMonthMatrix(year: number, monthIndex: number, selectedDateStr: string): MonthDayInfo[] {
  const todayStr = formatLocalDate(new Date());
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Days in current month
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Days in previous month
  const lastDayOfPrevMonth = new Date(year, monthIndex, 0);
  const daysInPrevMonth = lastDayOfPrevMonth.getDate();

  const matrix: MonthDayInfo[] = [];

  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, monthIndex - 1, dayNum);
    const dStr = formatLocalDate(prevDate);
    matrix.push({
      dateStr: dStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      isSelected: dStr === selectedDateStr,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const currDate = new Date(year, monthIndex, day);
    const dStr = formatLocalDate(currDate);
    matrix.push({
      dateStr: dStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
      isSelected: dStr === selectedDateStr,
    });
  }

  // Next month padding to fill complete grid (multiples of 7)
  const remaining = (7 - (matrix.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const nextDate = new Date(year, monthIndex + 1, day);
    const dStr = formatLocalDate(nextDate);
    matrix.push({
      dateStr: dStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      isSelected: dStr === selectedDateStr,
    });
  }

  return matrix;
}
