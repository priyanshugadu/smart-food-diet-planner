import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import {
  AuthUser,
  FoodItem,
  FoodLog,
  GroceryItem,
  MealPlanItem,
  MealType,
  UserProfile,
  WaterLog,
  WeightLog,
  AppTheme,
} from './types';
import { applyTheme, getSavedTheme } from './utils/theme';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { DownloadReportModal } from './components/DownloadReportModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { usePWAInstall } from './utils/usePWAInstall';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { ProfileView } from './views/ProfileView';
import { CalendarView } from './views/CalendarView';
import { DietPlannerView } from './views/DietPlannerView';
import { FoodDatabaseView } from './views/FoodDatabaseView';
import { FoodTrackerView } from './views/FoodTrackerView';
import { WaterTrackerView } from './views/WaterTrackerView';
import { WeightTrackerView } from './views/WeightTrackerView';
import { ProgressView } from './views/ProgressView';
import { GroceryListView } from './views/GroceryListView';
import { AiAssistantView } from './views/AiAssistantView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { SettingsView } from './views/SettingsView';
import { CalendarModal } from './components/CalendarModal';
import { formatLocalDate } from './utils/dateUtils';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Theme & Modal States
  const [theme, setTheme] = useState<AppTheme>(getSavedTheme);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // PWA & Android Install Hook
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();

  // Apply theme on load and changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDate());

  // Core Data Collections
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlanItem[]>([]);
  const [allMealPlans, setAllMealPlans] = useState<MealPlanItem[]>([]);
  const [allFoodLogs, setAllFoodLogs] = useState<FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Initialize the UI immediately. Remote Supabase calls must never block
  // the first screen on GitHub Pages.
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);

      const currentUser = db.getCurrentUser();
      setIsSupabaseConnected(db.isSupabaseConfigured());

      // Render the login/dashboard shell immediately instead of waiting for
      // network/database requests.
      if (!currentUser) {
        setLoading(false);

        db.getFoods()
          .then((allFoods) => setFoods(allFoods))
          .catch((e) => console.error('Food data load failed:', e));

        return;
      }

      setUser(currentUser);
      setLoading(false);

      // Load remote/local data in the background. A failure here should not
      // prevent the application UI from rendering.
      void Promise.allSettled([
        db.getFoods().then((allFoods) => setFoods(allFoods)),
        loadUserData(currentUser.id, selectedDate),
      ]).then((results) => {
        results.forEach((result) => {
          if (result.status === 'rejected') {
            console.error('Background app data load failed:', result.reason);
          }
        });
      });
    };

    initApp().catch((e) => {
      console.error('App init error:', e);
      setLoading(false);
    });
  }, []);

  // Reload logs and plans when selected date changes
  useEffect(() => {
    if (user) {
      loadDateSpecificData(user.id, selectedDate);
    }
  }, [selectedDate, user]);

  const loadUserData = async (userId: string, date: string) => {
    try {
      const userProfile = await db.getProfile(userId);
      setProfile(userProfile);

      const [fLogs, mPlans, wLogs, wtLogs, gItems, allPlans, allLogs] = await Promise.all([
        db.getFoodLogs(userId, date),
        db.getMealPlans(userId, date),
        db.getWaterLogs(userId, date),
        db.getWeightLogs(userId),
        db.getGroceryList(userId),
        db.getAllMealPlans(userId),
        db.getAllFoodLogs(userId),
      ]);

      setFoodLogs(fLogs);
      setMealPlans(mPlans);
      setWaterLogs(wLogs);
      setWeightLogs(wtLogs);
      setGroceryItems(gItems);
      setAllMealPlans(allPlans);
      setAllFoodLogs(allLogs);
    } catch (e) {
      console.error('Failed to load user records:', e);
    }
  };

  const loadDateSpecificData = async (userId: string, date: string) => {
    try {
      const [fLogs, mPlans, wLogs, allPlans, allLogs] = await Promise.all([
        db.getFoodLogs(userId, date),
        db.getMealPlans(userId, date),
        db.getWaterLogs(userId, date),
        db.getAllMealPlans(userId),
        db.getAllFoodLogs(userId),
      ]);
      setFoodLogs(fLogs);
      setMealPlans(mPlans);
      setWaterLogs(wLogs);
      setAllMealPlans(allPlans);
      setAllFoodLogs(allLogs);
    } catch (e) {
      console.error('Failed to load date records:', e);
    }
  };

  const handleLoginSuccess = async (authUser: AuthUser) => {
    setUser(authUser);
    setIsSupabaseConnected(db.isSupabaseConfigured());
    await loadUserData(authUser.id, selectedDate);
    if (authUser.role === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleLogout = async () => {
    await db.logout();
    setUser(null);
    setProfile(null);
    setCurrentTab('dashboard');
  };

  // --- CRUD Handlers ---

  const handleSaveProfile = async (updated: UserProfile) => {
    const saved = await db.updateProfile(updated);
    setProfile(saved);
  };

  // Food Tracker
  const handleAddFoodLog = async (mealType: MealType, foodId: string, quantity: number) => {
    if (!user) return;
    await db.addFoodLog(user.id, mealType, foodId, quantity, selectedDate);
    const [updated, allLogs] = await Promise.all([
      db.getFoodLogs(user.id, selectedDate),
      db.getAllFoodLogs(user.id),
    ]);
    setFoodLogs(updated);
    setAllFoodLogs(allLogs);
  };

  const handleRemoveFoodLog = async (logId: string) => {
    if (!user) return;
    await db.removeFoodLog(logId);
    const [updated, allLogs] = await Promise.all([
      db.getFoodLogs(user.id, selectedDate),
      db.getAllFoodLogs(user.id),
    ]);
    setFoodLogs(updated);
    setAllFoodLogs(allLogs);
  };

  // Meal Planner & Calendar
  const handleAddPlanItem = async (mealType: MealType, foodId: string, quantity: number, date?: string) => {
    if (!user) return;
    const targetDate = date || selectedDate;
    await db.addMealPlan(user.id, targetDate, mealType, foodId, quantity);
    const [updated, allPlans] = await Promise.all([
      db.getMealPlans(user.id, selectedDate),
      db.getAllMealPlans(user.id),
    ]);
    setMealPlans(updated);
    setAllMealPlans(allPlans);
  };

  const handleRemovePlanItem = async (itemId: string) => {
    if (!user) return;
    await db.removeMealPlan(itemId);
    const [updated, allPlans] = await Promise.all([
      db.getMealPlans(user.id, selectedDate),
      db.getAllMealPlans(user.id),
    ]);
    setMealPlans(updated);
    setAllMealPlans(allPlans);
  };

  const handleReplacePlanItem = async (itemId: string, newFoodId: string, quantity: number) => {
    if (!user) return;
    await db.removeMealPlan(itemId);
    const target = mealPlans.find((m) => m.id === itemId);
    const mealType = target ? target.meal_type : 'lunch';
    await db.addMealPlan(user.id, selectedDate, mealType, newFoodId, quantity);
    const [updated, allPlans] = await Promise.all([
      db.getMealPlans(user.id, selectedDate),
      db.getAllMealPlans(user.id),
    ]);
    setMealPlans(updated);
    setAllMealPlans(allPlans);
  };

  const handleCopyPlan = async (fromDate: string, toDate: string) => {
    if (!user) return;
    await db.copyMealPlans(user.id, fromDate, toDate);
    const [updated, allPlans] = await Promise.all([
      db.getMealPlans(user.id, selectedDate),
      db.getAllMealPlans(user.id),
    ]);
    setMealPlans(updated);
    setAllMealPlans(allPlans);
  };

  // Water Tracker
  const handleAddWater = async (amountLiters: number) => {
    if (!user) return;
    await db.addWaterLog(user.id, selectedDate, amountLiters);
    const updated = await db.getWaterLogs(user.id, selectedDate);
    setWaterLogs(updated);
  };

  const handleRemoveWater = async (logId: string) => {
    if (!user) return;
    await db.removeWaterLog(logId);
    const updated = await db.getWaterLogs(user.id, selectedDate);
    setWaterLogs(updated);
  };

  // Weight Tracker
  const handleAddWeightLog = async (weight: number, date: string, note?: string) => {
    if (!user) return;
    await db.addWeightLog(user.id, weight, date, note);
    const updated = await db.getWeightLogs(user.id);
    setWeightLogs(updated);
    if (profile) {
      const updatedProfile = { ...profile, weight };
      await db.updateProfile(updatedProfile);
      setProfile(updatedProfile);
    }
  };

  const handleRemoveWeightLog = async (logId: string) => {
    if (!user) return;
    await db.removeWeightLog(logId);
    const updated = await db.getWeightLogs(user.id);
    setWeightLogs(updated);
  };

  // Grocery
  const handleToggleGroceryItem = async (id: string, purchased: boolean) => {
    if (!user) return;
    await db.toggleGroceryItem(id, purchased);
    const updated = await db.getGroceryList(user.id);
    setGroceryItems(updated);
  };

  const handleAddGroceryItem = async (item: string, category: string, quantity: string) => {
    if (!user) return;
    await db.addGroceryItem(user.id, item, category, quantity);
    const updated = await db.getGroceryList(user.id);
    setGroceryItems(updated);
  };

  const handleDeleteGroceryItem = async (id: string) => {
    if (!user) return;
    await db.deleteGroceryItem(id);
    const updated = await db.getGroceryList(user.id);
    setGroceryItems(updated);
  };

  const handleClearCompletedGrocery = async () => {
    if (!user) return;
    await db.clearCompletedGrocery(user.id);
    const updated = await db.getGroceryList(user.id);
    setGroceryItems(updated);
  };

  const handleSyncGroceryFromPlans = async () => {
    if (!user) return;
    await db.syncGroceryFromMealPlans(user.id, selectedDate);
    const updated = await db.getGroceryList(user.id);
    setGroceryItems(updated);
  };

  // Food Management (Database/Admin)
  const handleAddFood = async (newFood: Omit<FoodItem, 'id'>) => {
    await db.createFood(newFood);
    const allFoods = await db.getFoods();
    setFoods(allFoods);
  };

  const handleEditFood = async (food: FoodItem) => {
    await db.updateFood(food);
    const allFoods = await db.getFoods();
    setFoods(allFoods);
  };

  const handleDeleteFood = async (foodId: string) => {
    await db.deleteFood(foodId);
    const allFoods = await db.getFoods();
    setFoods(allFoods);
  };

  const handleRefreshDbStatus = () => {
    setIsSupabaseConnected(db.isSupabaseConfigured());
  };

  // If loading session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide text-slate-300">
            Initializing Smart Food & Diet Planner...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated -> Show Professional Login / Register / Guest Demo View
  if (!user || !profile) {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        isSupabaseConnected={isSupabaseConnected}
      />
    );
  }

  return (
    <div
      data-theme={theme}
      className={`min-h-screen flex transition-colors duration-200 ${
        theme === 'midnight' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50/80 text-slate-900'
      }`}
    >
      {/* Responsive Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isSupabaseConnected={isSupabaseConnected}
        currentTheme={theme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenDownloadReport={() => setIsDownloadModalOpen(true)}
        onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSelectTab={setCurrentTab}
          isSupabaseConnected={isSupabaseConnected}
          currentTheme={theme}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenDownloadReport={() => setIsDownloadModalOpen(true)}
          onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
          userRole={user.role}
          selectedDate={selectedDate}
          onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              todayFoodLogs={foodLogs}
              todayMealPlans={mealPlans}
              todayWaterLogs={waterLogs}
              weightLogs={weightLogs}
              onNavigate={setCurrentTab}
              onQuickAddWater={handleAddWater}
              onOpenDownloadReport={() => setIsDownloadModalOpen(true)}
              onOpenThemeModal={() => setIsThemeModalOpen(true)}
              onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView profile={profile} onSaveProfile={handleSaveProfile} />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              profile={profile}
              foods={foods}
              allMealPlans={allMealPlans}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              onAddPlanItem={handleAddPlanItem}
              onRemovePlanItem={handleRemovePlanItem}
              onCopyPlan={handleCopyPlan}
              onNavigateToGrocery={() => setCurrentTab('grocery')}
              onNavigateToTracker={() => setCurrentTab('tracker')}
            />
          )}

          {currentTab === 'planner' && (
            <DietPlannerView
              profile={profile}
              foods={foods}
              mealPlans={mealPlans}
              allMealPlans={allMealPlans}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              onAddPlanItem={handleAddPlanItem}
              onRemovePlanItem={handleRemovePlanItem}
              onReplacePlanItem={handleReplacePlanItem}
              onNavigateToGrocery={() => setCurrentTab('grocery')}
              onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
              onNavigateToCalendar={() => setCurrentTab('calendar')}
              onCopyPlan={handleCopyPlan}
            />
          )}

          {currentTab === 'database' && (
            <FoodDatabaseView foods={foods} onAddFood={handleAddFood} />
          )}

          {currentTab === 'tracker' && (
            <FoodTrackerView
              profile={profile}
              foods={foods}
              foodLogs={foodLogs}
              allFoodLogs={allFoodLogs}
              allMealPlans={allMealPlans}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              onAddLog={handleAddFoodLog}
              onRemoveLog={handleRemoveFoodLog}
              onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
            />
          )}

          {currentTab === 'water' && (
            <WaterTrackerView
              profile={profile}
              waterLogs={waterLogs}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              onAddWater={handleAddWater}
              onRemoveWater={handleRemoveWater}
              onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
            />
          )}

          {currentTab === 'weight' && (
            <WeightTrackerView
              profile={profile}
              weightLogs={weightLogs}
              onAddWeightLog={handleAddWeightLog}
              onRemoveWeightLog={handleRemoveWeightLog}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressView profile={profile} weightLogs={weightLogs} />
          )}

          {currentTab === 'grocery' && (
            <GroceryListView
              groceryItems={groceryItems}
              mealPlans={mealPlans}
              onToggleItem={handleToggleGroceryItem}
              onAddItem={handleAddGroceryItem}
              onDeleteItem={handleDeleteGroceryItem}
              onClearCompleted={handleClearCompletedGrocery}
              onSyncFromPlans={handleSyncGroceryFromPlans}
            />
          )}

          {currentTab === 'ai' && <AiAssistantView profile={profile} />}

          {currentTab === 'admin' && (
            <AdminDashboardView
              foods={foods}
              isSupabaseConnected={isSupabaseConnected}
              onDeleteFood={handleDeleteFood}
              onEditFood={handleEditFood}
              onAddFood={handleAddFood}
              user={user || undefined}
              onElevateToAdmin={async (elevatedUser) => {
                setUser(elevatedUser);
                await loadUserData(elevatedUser.id, selectedDate);
              }}
              onNavigateToUserDashboard={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              isSupabaseConnected={isSupabaseConnected}
              onRefreshStatus={handleRefreshDbStatus}
            />
          )}
        </main>
      </div>

      {/* Theme Selection Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={theme}
        onSelectTheme={(newTheme) => setTheme(newTheme)}
      />

      {/* Download & Export Modal */}
      {profile && (
        <DownloadReportModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          profile={profile}
          mealPlans={mealPlans}
          foodLogs={foodLogs}
          waterLogs={waterLogs}
          weightLogs={weightLogs}
          selectedDate={selectedDate}
          onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
        />
      )}

      {/* Android Download & Installation Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        canInstall={canInstall}
        isInstalled={isInstalled}
        onPromptInstall={promptInstall}
      />

      {/* Interactive Diet & Meal Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={(newDate) => {
          setSelectedDate(newDate);
          setIsCalendarModalOpen(false);
        }}
        allMealPlans={allMealPlans}
        allFoodLogs={allFoodLogs}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          setIsCalendarModalOpen(false);
        }}
      />
    </div>
  );
}
