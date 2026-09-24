import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_FOODS } from '../data/initialFoods';
import {
  AdminCredentials,
  AuthUser,
  FoodItem,
  FoodLog,
  GroceryItem,
  MealPlanItem,
  UserProfile,
  WaterLog,
  WeightLog,
} from '../types';

const STORAGE_KEYS = {
  AUTH_USER: 'smart_diet_auth_user',
  PROFILES: 'smart_diet_profiles',
  FOODS: 'smart_diet_foods',
  MEAL_PLANS: 'smart_diet_meal_plans',
  FOOD_LOGS: 'smart_diet_food_logs',
  WATER_LOGS: 'smart_diet_water_logs',
  WEIGHT_LOGS: 'smart_diet_weight_logs',
  GROCERY_ITEMS: 'smart_diet_grocery_items',
  SUPABASE_CONFIG: 'smart_diet_supabase_config',
  ADMIN_CREDENTIALS: 'smart_diet_admin_credentials',
};

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  email: 'admin@smartdiet.com',
  password: 'admin123',
  fullName: 'Faculty Project Admin',
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
}

// Default initial guest profile
const DEFAULT_GUEST_PROFILE: UserProfile = {
  id: 'prof-guest-001',
  user_id: 'guest-user-123',
  full_name: 'Priyanshu Gaud',
  age: 21,
  gender: 'male',
  height: 175,
  weight: 70,
  activity_level: 'moderate',
  fitness_goal: 'muscle_gain',
  dietary_preference: 'vegetarian',
  allergies: ['Peanuts'],
  food_preferences: 'Prefers Indian vegetarian meals, high protein dal, paneer, and oats.',
  target_calories: 2450,
  target_protein: 140,
  target_water: 3.0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Default sample weight logs for progress chart
const DEFAULT_WEIGHT_LOGS: WeightLog[] = [
  { id: 'w-1', user_id: 'guest-user-123', weight: 73.5, note: 'Initial starting measurement', logged_at: '2026-08-20' },
  { id: 'w-2', user_id: 'guest-user-123', weight: 72.8, note: 'Started workout routine', logged_at: '2026-08-28' },
  { id: 'w-3', user_id: 'guest-user-123', weight: 72.0, note: 'Adjusted protein intake', logged_at: '2026-09-05' },
  { id: 'w-4', user_id: 'guest-user-123', weight: 71.2, note: 'Clean diet week', logged_at: '2026-09-12' },
  { id: 'w-5', user_id: 'guest-user-123', weight: 70.0, note: 'Current target reached!', logged_at: '2026-09-20' },
];

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getOffsetDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private config: SupabaseConfig = {
    url: '',
    anonKey: '',
    enabled: false,
  };

  constructor() {
    this.loadConfig();
    this.initializeLocalStorage();
  }

  private loadConfig() {
    try {
      const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      if (envUrl && envKey) {
        this.config = { url: envUrl, anonKey: envKey, enabled: true };
        this.supabase = createClient(envUrl, envKey);
        localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(this.config));
        return;
      }
      const saved = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
      if (saved) {
        this.config = JSON.parse(saved);
        if (this.config.enabled && this.config.url && this.config.anonKey) {
          this.supabase = createClient(this.config.url, this.config.anonKey);
        }
      }
    } catch (e) {
      console.warn('Could not load Supabase config', e);
    }
  }

  public getSupabaseConfig(): SupabaseConfig {
    return { ...this.config };
  }

  public setSupabaseConfig(url: string, anonKey: string, enabled: boolean): boolean {
    this.config = { url, anonKey, enabled };
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(this.config));
    if (enabled && url && anonKey) {
      try {
        this.supabase = createClient(url, anonKey);
        return true;
      } catch (err) {
        console.error('Failed to init Supabase client', err);
        this.supabase = null;
        return false;
      }
    } else {
      this.supabase = null;
      return true;
    }
  }

  public isSupabaseConnected(): boolean {
    return Boolean(this.supabase && this.config.enabled);
  }

  private initializeLocalStorage() {
    // Foods seed
    if (!localStorage.getItem(STORAGE_KEYS.FOODS)) {
      localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(INITIAL_FOODS));
    }

    // Profiles seed
    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      localStorage.setItem(
        STORAGE_KEYS.PROFILES,
        JSON.stringify({ [DEFAULT_GUEST_PROFILE.user_id]: DEFAULT_GUEST_PROFILE })
      );
    }

    // Weight logs seed
    if (!localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(DEFAULT_WEIGHT_LOGS));
    }

    // Seed sample meal plan for today
    const today = getTodayString();
    if (!localStorage.getItem(STORAGE_KEYS.MEAL_PLANS)) {
      const sampleMealPlans: MealPlanItem[] = [
        {
          id: 'mp-1',
          user_id: 'guest-user-123',
          meal_date: today,
          meal_type: 'breakfast',
          food_id: 'food-oats',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-2',
          user_id: 'guest-user-123',
          meal_date: today,
          meal_type: 'breakfast',
          food_id: 'food-almonds',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-3',
          user_id: 'guest-user-123',
          meal_date: today,
          meal_type: 'mid_morning_snack',
          food_id: 'food-sprouts-salad',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-4',
          user_id: 'guest-user-123',
          meal_date: today,
          meal_type: 'lunch',
          food_id: 'food-roti',
          serving_quantity: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-5',
          user_id: 'guest-user-123',
          meal_date: today,
          meal_type: 'lunch',
          food_id: 'food-yellow-dal',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-6',
          user_id: 'guest-user-123',
          meal_date: today,
          meal_type: 'lunch',
          food_id: 'food-curd',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-7',
          user_id: 'guest-user-123',
          meal_date: today,
          meal_type: 'evening_snack',
          food_id: 'food-apple',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-8',
          user_id: 'guest-user-123',
          meal_date: today,
          meal_type: 'dinner',
          food_id: 'food-paneer',
          serving_quantity: 1.5,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-9',
          user_id: 'guest-user-123',
          meal_date: today,
          meal_type: 'dinner',
          food_id: 'food-green-salad',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
        // Tomorrow's plan
        {
          id: 'mp-10',
          user_id: 'guest-user-123',
          meal_date: getOffsetDateString(1),
          meal_type: 'breakfast',
          food_id: 'food-upma',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-11',
          user_id: 'guest-user-123',
          meal_date: getOffsetDateString(1),
          meal_type: 'breakfast',
          food_id: 'food-banana',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-12',
          user_id: 'guest-user-123',
          meal_date: getOffsetDateString(1),
          meal_type: 'lunch',
          food_id: 'food-brown-rice',
          serving_quantity: 1.5,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-13',
          user_id: 'guest-user-123',
          meal_date: getOffsetDateString(1),
          meal_type: 'lunch',
          food_id: 'food-chana-masala',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-14',
          user_id: 'guest-user-123',
          meal_date: getOffsetDateString(1),
          meal_type: 'dinner',
          food_id: 'food-tofu',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
        // Yesterday's plan
        {
          id: 'mp-15',
          user_id: 'guest-user-123',
          meal_date: getOffsetDateString(-1),
          meal_type: 'breakfast',
          food_id: 'food-idli',
          serving_quantity: 3,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-16',
          user_id: 'guest-user-123',
          meal_date: getOffsetDateString(-1),
          meal_type: 'lunch',
          food_id: 'food-rajma',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mp-17',
          user_id: 'guest-user-123',
          meal_date: getOffsetDateString(-1),
          meal_type: 'dinner',
          food_id: 'food-khichdi',
          serving_quantity: 1,
          created_at: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(sampleMealPlans));
    }

    // Seed sample food logs for today
    if (!localStorage.getItem(STORAGE_KEYS.FOOD_LOGS)) {
      const sampleFoodLogs: FoodLog[] = [
        {
          id: 'fl-1',
          user_id: 'guest-user-123',
          food_id: 'food-oats',
          meal_type: 'breakfast',
          quantity: 1,
          consumed_at: `${today}T08:30:00Z`,
        },
        {
          id: 'fl-2',
          user_id: 'guest-user-123',
          food_id: 'food-almonds',
          meal_type: 'breakfast',
          quantity: 1,
          consumed_at: `${today}T08:30:00Z`,
        },
        {
          id: 'fl-3',
          user_id: 'guest-user-123',
          food_id: 'food-sprouts-salad',
          meal_type: 'mid_morning_snack',
          quantity: 1,
          consumed_at: `${today}T11:15:00Z`,
        },
        {
          id: 'fl-4',
          user_id: 'guest-user-123',
          food_id: 'food-roti',
          meal_type: 'lunch',
          quantity: 2,
          consumed_at: `${today}T13:45:00Z`,
        },
        {
          id: 'fl-5',
          user_id: 'guest-user-123',
          food_id: 'food-yellow-dal',
          meal_type: 'lunch',
          quantity: 1,
          consumed_at: `${today}T13:45:00Z`,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(sampleFoodLogs));
    }

    // Seed water logs
    if (!localStorage.getItem(STORAGE_KEYS.WATER_LOGS)) {
      const sampleWater: WaterLog[] = [
        { id: 'wtr-1', user_id: 'guest-user-123', amount: 0.5, logged_at: `${today}T08:00:00Z` },
        { id: 'wtr-2', user_id: 'guest-user-123', amount: 0.5, logged_at: `${today}T10:30:00Z` },
        { id: 'wtr-3', user_id: 'guest-user-123', amount: 0.5, logged_at: `${today}T12:45:00Z` },
        { id: 'wtr-4', user_id: 'guest-user-123', amount: 0.5, logged_at: `${today}T15:15:00Z` },
      ];
      localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(sampleWater));
    }

    // Seed sample grocery list
    if (!localStorage.getItem(STORAGE_KEYS.GROCERY_ITEMS)) {
      const sampleGroceries: GroceryItem[] = [
        { id: 'g-1', user_id: 'guest-user-123', item_name: 'Rolled Oats (1kg)', category: 'Grains', quantity: '1 pack', completed: true, created_at: new Date().toISOString() },
        { id: 'g-2', user_id: 'guest-user-123', item_name: 'Fresh Malai Paneer', category: 'Dairy', quantity: '500g', completed: false, created_at: new Date().toISOString() },
        { id: 'g-3', user_id: 'guest-user-123', item_name: 'Yellow Moong Dal', category: 'Protein', quantity: '1 kg', completed: false, created_at: new Date().toISOString() },
        { id: 'g-4', user_id: 'guest-user-123', item_name: 'Cucumbers & Tomatoes', category: 'Vegetables', quantity: '1 kg each', completed: true, created_at: new Date().toISOString() },
        { id: 'g-5', user_id: 'guest-user-123', item_name: 'California Almonds', category: 'Nuts & Seeds', quantity: '250g', completed: false, created_at: new Date().toISOString() },
      ];
      localStorage.setItem(STORAGE_KEYS.GROCERY_ITEMS, JSON.stringify(sampleGroceries));
    }
  }

  // --- AUTHENTICATION ---
  public getStoredUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  public saveAuthUser(user: AuthUser | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  }

  // --- ADMIN CREDENTIALS MANAGEMENT ---
  public getAdminCredentials(): AdminCredentials {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDENTIALS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          username: parsed.username || DEFAULT_ADMIN_CREDENTIALS.username,
          email: parsed.email || DEFAULT_ADMIN_CREDENTIALS.email,
          password: parsed.password || DEFAULT_ADMIN_CREDENTIALS.password,
          fullName: parsed.fullName || DEFAULT_ADMIN_CREDENTIALS.fullName,
        };
      }
    } catch (e) {
      console.warn('Could not load admin credentials from localStorage', e);
    }
    return { ...DEFAULT_ADMIN_CREDENTIALS };
  }

  public updateAdminCredentials(creds: Partial<AdminCredentials>): AdminCredentials {
    const current = this.getAdminCredentials();
    const updated: AdminCredentials = {
      username: creds.username ? creds.username.trim().toLowerCase() : current.username,
      email: creds.email ? creds.email.trim().toLowerCase() : current.email,
      password: creds.password && creds.password.trim() ? creds.password.trim() : current.password,
      fullName: creds.fullName ? creds.fullName.trim() : current.fullName,
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(updated));
    return updated;
  }

  public resetAdminCredentialsToDefault(): AdminCredentials {
    localStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(DEFAULT_ADMIN_CREDENTIALS));
    return { ...DEFAULT_ADMIN_CREDENTIALS };
  }

  public async loginAsGuest(): Promise<AuthUser> {
    const guestUser: AuthUser = {
      id: 'guest-user-123',
      email: 'guest@smartdiet.demo',
      full_name: 'Demo Student (Guest)',
      role: 'user',
      isGuest: true,
    };
    this.saveAuthUser(guestUser);
    return guestUser;
  }

  public async loginAsAdmin(): Promise<AuthUser> {
    const adminCreds = this.getAdminCredentials();
    const adminUser: AuthUser = {
      id: 'admin-user-001',
      email: adminCreds.email,
      full_name: adminCreds.fullName,
      role: 'admin',
      isGuest: false,
    };
    this.saveAuthUser(adminUser);
    return adminUser;
  }

  public async login(identifier: string, pass: string): Promise<{ user?: AuthUser; error?: string }> {
    const cleanId = (identifier || '').trim();
    const cleanPass = (pass || '').trim();

    if (!cleanId || !cleanPass) {
      return { error: 'Please enter both Username/Email and Password.' };
    }

    const adminCreds = this.getAdminCredentials();
    const idLower = cleanId.toLowerCase();

    // Check if user is logging into Admin account
    const isAdminAccount =
      idLower === adminCreds.username.toLowerCase() ||
      idLower === adminCreds.email.toLowerCase() ||
      idLower === 'admin' ||
      idLower === 'admin@smartdiet.com' ||
      idLower === 'admin@smartdiet.edu';

    if (isAdminAccount) {
      if (cleanPass !== adminCreds.password) {
        return {
          error: `Invalid admin password. Default password is "${adminCreds.password}".`,
        };
      }
      const adminUser: AuthUser = {
        id: 'admin-user-001',
        email: adminCreds.email,
        full_name: adminCreds.fullName,
        role: 'admin',
        isGuest: false,
      };
      this.saveAuthUser(adminUser);
      return { user: adminUser };
    }

    if (this.supabase && this.config.enabled) {
      const email = cleanId.includes('@') ? cleanId : `${cleanId}@smartdiet.demo`;
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password: cleanPass });
      if (error) return { error: error.message };
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        full_name: data.user.user_metadata?.full_name || email.split('@')[0],
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
        isGuest: false,
      };
      this.saveAuthUser(authUser);
      return { user: authUser };
    }

    // Local simulation validation
    if (cleanPass.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    const email = cleanId.includes('@') ? cleanId : `${cleanId}@smartdiet.demo`;
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
    const authUser: AuthUser = {
      id: `usr-${btoa(email).slice(0, 10)}`,
      email,
      full_name: email.split('@')[0],
      role,
      isGuest: false,
    };
    this.saveAuthUser(authUser);
    return { user: authUser };
  }

  public async register(email: string, pass: string, fullName: string): Promise<{ user?: AuthUser; error?: string }> {
    if (this.supabase && this.config.enabled) {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };
      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName,
          role: 'user',
          isGuest: false,
        };
        this.saveAuthUser(authUser);
        return { user: authUser };
      }
    }

    if (!email || !pass || !fullName) {
      return { error: 'Please fill in all registration fields.' };
    }
    if (pass.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    const authUser: AuthUser = {
      id: `usr-${Date.now().toString(36)}`,
      email,
      full_name: fullName,
      role: 'user',
      isGuest: false,
    };
    this.saveAuthUser(authUser);

    // Create initial profile for newly registered user
    const initialProfile: UserProfile = {
      id: `prof-${authUser.id}`,
      user_id: authUser.id,
      full_name: fullName,
      age: 22,
      gender: 'male',
      height: 172,
      weight: 68,
      activity_level: 'moderate',
      fitness_goal: 'maintain_weight',
      dietary_preference: 'vegetarian',
      allergies: [],
      food_preferences: '',
      target_calories: 2200,
      target_protein: 100,
      target_water: 2.8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await this.saveProfile(initialProfile);

    return { user: authUser };
  }

  public async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    if (this.supabase && this.config.enabled) {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Password reset link sent to your registered email.' };
    }
    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${email}. (Demo mode simulated).`,
    };
  }

  public logout() {
    if (this.supabase && this.config.enabled) {
      this.supabase.auth.signOut().catch(console.error);
    }
    this.saveAuthUser(null);
  }

  // --- USER PROFILE ---
  public async getProfile(userId: string): Promise<UserProfile> {
    if (this.supabase && this.config.enabled) {
      const { data, error } = await this.supabase
        .from('smart_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (!error && data) return data as UserProfile;
    }

    const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '{}');
    if (profiles[userId]) {
      return profiles[userId];
    }
    // Return default fallback
    return {
      ...DEFAULT_GUEST_PROFILE,
      user_id: userId,
      id: `prof-${userId}`,
    };
  }

  public async saveProfile(profile: UserProfile): Promise<UserProfile> {
    profile.updated_at = new Date().toISOString();

    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_profiles').upsert(profile, { onConflict: 'user_id' });
    }

    const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '{}');
    profiles[profile.user_id] = profile;
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    return profile;
  }

  // --- FOODS DATABASE ---
  public async getFoods(): Promise<FoodItem[]> {
    if (this.supabase && this.config.enabled) {
      const { data, error } = await this.supabase.from('smart_foods').select('*');
      if (!error && data && data.length > 0) return data as FoodItem[];
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FOODS) || JSON.stringify(INITIAL_FOODS));
  }

  public async addFood(food: Omit<FoodItem, 'id'> & { id?: string }): Promise<FoodItem> {
    const newFood: FoodItem = {
      ...food,
      id: food.id || `food-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_foods').insert(newFood);
    }

    const foods = await this.getFoods();
    foods.unshift(newFood);
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(foods));
    return newFood;
  }

  public async updateFood(food: FoodItem): Promise<FoodItem> {
    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_foods').update(food).eq('id', food.id);
    }

    const foods = await this.getFoods();
    const idx = foods.findIndex((f) => f.id === food.id);
    if (idx !== -1) {
      foods[idx] = food;
      localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(foods));
    }
    return food;
  }

  public async deleteFood(foodId: string): Promise<boolean> {
    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_foods').delete().eq('id', foodId);
    }

    const foods = await this.getFoods();
    const updated = foods.filter((f) => f.id !== foodId);
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(updated));
    return true;
  }

  // --- MEAL PLANS ---
  public async getMealPlans(userId: string, date: string): Promise<MealPlanItem[]> {
    const foods = await this.getFoods();
    const foodMap = new Map<string, FoodItem>(foods.map((f) => [f.id, f]));

    if (this.supabase && this.config.enabled) {
      const { data, error } = await this.supabase
        .from('smart_meal_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('meal_date', date);
      if (!error && data) {
        return (data as MealPlanItem[]).map((item) => ({
          ...item,
          food: foodMap.get(item.food_id),
        }));
      }
    }

    const allPlans: MealPlanItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '[]');
    return allPlans
      .filter((p) => p.user_id === userId && p.meal_date === date)
      .map((item) => ({
        ...item,
        food: foodMap.get(item.food_id),
      }));
  }

  public async addMealPlanItem(item: Omit<MealPlanItem, 'id' | 'created_at'>): Promise<MealPlanItem> {
    const newItem: MealPlanItem = {
      ...item,
      id: `mp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_meal_plans').insert(newItem);
    }

    const allPlans: MealPlanItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '[]');
    allPlans.push(newItem);
    localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(allPlans));

    const foods = await this.getFoods();
    newItem.food = foods.find((f) => f.id === newItem.food_id);
    return newItem;
  }

  public async removeMealPlanItem(itemId: string): Promise<boolean> {
    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_meal_plans').delete().eq('id', itemId);
    }

    const allPlans: MealPlanItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '[]');
    const filtered = allPlans.filter((p) => p.id !== itemId);
    localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(filtered));
    return true;
  }

  public async replaceMealPlanItem(itemId: string, newFoodId: string, quantity: number): Promise<boolean> {
    const allPlans: MealPlanItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '[]');
    const idx = allPlans.findIndex((p) => p.id === itemId);
    if (idx !== -1) {
      allPlans[idx].food_id = newFoodId;
      allPlans[idx].serving_quantity = quantity;
      localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(allPlans));

      if (this.supabase && this.config.enabled) {
        await this.supabase
          .from('smart_meal_plans')
          .update({ food_id: newFoodId, serving_quantity: quantity })
          .eq('id', itemId);
      }
      return true;
    }
    return false;
  }

  public async getWeeklyMealPlans(userId: string): Promise<MealPlanItem[]> {
    const allPlans: MealPlanItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '[]');
    const foods = await this.getFoods();
    const foodMap = new Map<string, FoodItem>(foods.map((f) => [f.id, f]));
    return allPlans
      .filter((p) => p.user_id === userId)
      .map((p) => ({ ...p, food: foodMap.get(p.food_id) }));
  }

  public async getAllMealPlans(userId: string): Promise<MealPlanItem[]> {
    return this.getWeeklyMealPlans(userId);
  }

  public async copyMealPlans(userId: string, fromDate: string, toDate: string): Promise<MealPlanItem[]> {
    const sourcePlans = await this.getMealPlans(userId, fromDate);
    if (sourcePlans.length === 0) return [];

    const existingTargetPlans = await this.getMealPlans(userId, toDate);
    for (const item of existingTargetPlans) {
      await this.removeMealPlan(item.id);
    }

    const created: MealPlanItem[] = [];
    for (const plan of sourcePlans) {
      const added = await this.addMealPlan(userId, toDate, plan.meal_type, plan.food_id, plan.serving_quantity);
      created.push(added);
    }
    return created;
  }

  public async getAllFoodLogs(userId: string): Promise<FoodLog[]> {
    const foods = await this.getFoods();
    const foodMap = new Map<string, FoodItem>(foods.map((f) => [f.id, f]));
    if (this.supabase && this.config.enabled) {
      const { data, error } = await this.supabase
        .from('smart_food_logs')
        .select('*')
        .eq('user_id', userId);
      if (!error && data) {
        return (data as FoodLog[]).map((log) => ({
          ...log,
          food: foodMap.get(log.food_id),
        }));
      }
    }
    const allLogs: FoodLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOOD_LOGS) || '[]');
    return allLogs
      .filter((l) => l.user_id === userId)
      .map((log) => ({ ...log, food: foodMap.get(log.food_id) }));
  }

  // --- FOOD LOGS (DAILY INTAKE) ---
  public async getFoodLogs(userId: string, date: string): Promise<FoodLog[]> {
    const foods = await this.getFoods();
    const foodMap = new Map<string, FoodItem>(foods.map((f) => [f.id, f]));

    if (this.supabase && this.config.enabled) {
      const { data, error } = await this.supabase
        .from('smart_food_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('consumed_at', `${date}T00:00:00.000Z`)
        .lte('consumed_at', `${date}T23:59:59.999Z`);
      if (!error && data) {
        return (data as FoodLog[]).map((log) => ({
          ...log,
          food: foodMap.get(log.food_id),
        }));
      }
    }

    const allLogs: FoodLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOOD_LOGS) || '[]');
    return allLogs
      .filter((l) => l.user_id === userId && l.consumed_at.startsWith(date))
      .map((log) => ({
        ...log,
        food: foodMap.get(log.food_id),
      }));
  }

  public async addFoodLog(
    arg1: string | Omit<FoodLog, 'id'>,
    mealType?: any,
    foodId?: string,
    quantity?: number,
    date?: string
  ): Promise<FoodLog> {
    let item: Omit<FoodLog, 'id'>;
    if (typeof arg1 === 'object') {
      item = arg1;
    } else {
      item = {
        user_id: arg1,
        meal_type: mealType,
        food_id: foodId!,
        quantity: quantity || 1,
        consumed_at: `${date || getTodayString()}T${new Date().toTimeString().split(' ')[0]}Z`,
      };
    }

    const newLog: FoodLog = {
      ...item,
      id: `fl-${Date.now()}`,
    };

    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_food_logs').insert(newLog);
    }

    const allLogs: FoodLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOOD_LOGS) || '[]');
    allLogs.push(newLog);
    localStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(allLogs));

    const foods = await this.getFoods();
    newLog.food = foods.find((f) => f.id === newLog.food_id);
    return newLog;
  }

  public async removeFoodLog(logId: string): Promise<boolean> {
    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_food_logs').delete().eq('id', logId);
    }

    const allLogs: FoodLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOOD_LOGS) || '[]');
    const filtered = allLogs.filter((l) => l.id !== logId);
    localStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(filtered));
    return true;
  }

  public async getHistoryFoodLogs(userId: string, days = 7): Promise<FoodLog[]> {
    const foods = await this.getFoods();
    const foodMap = new Map<string, FoodItem>(foods.map((f) => [f.id, f]));
    const allLogs: FoodLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOOD_LOGS) || '[]');

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return allLogs
      .filter((l) => l.user_id === userId && new Date(l.consumed_at) >= cutoff)
      .map((log) => ({
        ...log,
        food: foodMap.get(log.food_id),
      }));
  }

  // --- WATER LOGS ---
  public async getWaterLogs(userId: string, date: string): Promise<WaterLog[]> {
    if (this.supabase && this.config.enabled) {
      const { data, error } = await this.supabase
        .from('smart_water_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', `${date}T00:00:00.000Z`)
        .lte('logged_at', `${date}T23:59:59.999Z`);
      if (!error && data) return data as WaterLog[];
    }

    const allWater: WaterLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATER_LOGS) || '[]');
    return allWater.filter((w) => w.user_id === userId && w.logged_at.startsWith(date));
  }

  public async addWater(userId: string, amountLiters: number): Promise<WaterLog> {
    const newLog: WaterLog = {
      id: `wtr-${Date.now()}`,
      user_id: userId,
      amount: amountLiters,
      logged_at: new Date().toISOString(),
    };

    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_water_logs').insert(newLog);
    }

    const allWater: WaterLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATER_LOGS) || '[]');
    allWater.push(newLog);
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(allWater));
    return newLog;
  }

  public async removeWaterLog(logId: string): Promise<boolean> {
    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_water_logs').delete().eq('id', logId);
    }

    const allWater: WaterLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATER_LOGS) || '[]');
    const filtered = allWater.filter((w) => w.id !== logId);
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(filtered));
    return true;
  }

  // --- WEIGHT LOGS ---
  public async getWeightLogs(userId: string): Promise<WeightLog[]> {
    if (this.supabase && this.config.enabled) {
      const { data, error } = await this.supabase
        .from('smart_weight_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: true });
      if (!error && data && data.length > 0) return data as WeightLog[];
    }

    const logs: WeightLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS) || '[]');
    return logs
      .filter((w) => w.user_id === userId)
      .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
  }

  public async addWeightLog(
    userId: string,
    weight: number,
    dateOrNote = '',
    optionalNote = ''
  ): Promise<WeightLog> {
    const isDate = dateOrNote && /^\d{4}-\d{2}-\d{2}/.test(dateOrNote);
    const loggedAt = isDate ? dateOrNote : getTodayString();
    const note = isDate ? optionalNote : dateOrNote;

    const newLog: WeightLog = {
      id: `w-${Date.now()}`,
      user_id: userId,
      weight,
      note,
      logged_at: loggedAt,
    };

    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_weight_logs').insert(newLog);
    }

    const logs: WeightLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS) || '[]');
    logs.push(newLog);
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));

    // Also update current profile weight
    const profile = await this.getProfile(userId);
    profile.weight = weight;
    await this.saveProfile(profile);

    return newLog;
  }

  public async deleteWeightLog(logId: string): Promise<boolean> {
    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_weight_logs').delete().eq('id', logId);
    }

    const logs: WeightLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS) || '[]');
    const filtered = logs.filter((w) => w.id !== logId);
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(filtered));
    return true;
  }

  // --- GROCERY LIST GENERATOR ---
  public async getGroceryItems(userId: string): Promise<GroceryItem[]> {
    if (this.supabase && this.config.enabled) {
      const { data, error } = await this.supabase
        .from('smart_grocery_items')
        .select('*')
        .eq('user_id', userId);
      if (!error && data) return data as GroceryItem[];
    }

    const items: GroceryItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROCERY_ITEMS) || '[]');
    return items.filter((g) => g.user_id === userId);
  }

  public async addGroceryItem(
    arg1: string | Omit<GroceryItem, 'id' | 'created_at'>,
    itemName?: string,
    category?: any,
    quantity?: string
  ): Promise<GroceryItem> {
    let item: Omit<GroceryItem, 'id' | 'created_at'>;
    if (typeof arg1 === 'object') {
      item = arg1;
    } else {
      item = {
        user_id: arg1,
        item_name: itemName || 'Item',
        category: category || 'Vegetables',
        quantity: quantity || '1 pack',
        completed: false,
      };
    }

    const newItem: GroceryItem = {
      ...item,
      id: `g-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_grocery_items').insert(newItem);
    }

    const items: GroceryItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROCERY_ITEMS) || '[]');
    items.push(newItem);
    localStorage.setItem(STORAGE_KEYS.GROCERY_ITEMS, JSON.stringify(items));
    return newItem;
  }

  public async toggleGroceryItem(itemId: string, forcePurchased?: boolean): Promise<boolean> {
    const items: GroceryItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROCERY_ITEMS) || '[]');
    const item = items.find((g) => g.id === itemId);
    if (item) {
      item.completed = forcePurchased !== undefined ? forcePurchased : !item.completed;
      localStorage.setItem(STORAGE_KEYS.GROCERY_ITEMS, JSON.stringify(items));

      if (this.supabase && this.config.enabled) {
        await this.supabase.from('smart_grocery_items').update({ completed: item.completed }).eq('id', itemId);
      }
      return true;
    }
    return false;
  }

  public async deleteGroceryItem(itemId: string): Promise<boolean> {
    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_grocery_items').delete().eq('id', itemId);
    }

    const items: GroceryItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROCERY_ITEMS) || '[]');
    const filtered = items.filter((g) => g.id !== itemId);
    localStorage.setItem(STORAGE_KEYS.GROCERY_ITEMS, JSON.stringify(filtered));
    return true;
  }

  public async generateGroceryFromMealPlan(userId: string): Promise<GroceryItem[]> {
    const mealPlans = await this.getWeeklyMealPlans(userId);
    const existing = await this.getGroceryItems(userId);
    const existingNames = new Set(existing.map((e) => e.item_name.toLowerCase()));

    const generated: GroceryItem[] = [];
    for (const plan of mealPlans) {
      if (plan.food) {
        const name = plan.food.name;
        if (!existingNames.has(name.toLowerCase())) {
          existingNames.add(name.toLowerCase());
          let cat: GroceryItem['category'] = 'Other';
          if (plan.food.category === 'Vegetables') cat = 'Vegetables';
          else if (plan.food.category === 'Fruits') cat = 'Fruits';
          else if (plan.food.category === 'Dairy') cat = 'Dairy';
          else if (plan.food.category === 'Grains') cat = 'Grains';
          else if (plan.food.category === 'Legumes' || plan.food.category === 'Protein') cat = 'Protein';
          else if (plan.food.category === 'Nuts & Seeds') cat = 'Nuts & Seeds';

          const item: GroceryItem = {
            id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            user_id: userId,
            item_name: `${name}`,
            category: cat,
            quantity: `${plan.serving_quantity * 2} servings`,
            completed: false,
            created_at: new Date().toISOString(),
          };
          generated.push(item);
        }
      }
    }

    if (generated.length > 0) {
      const all = [...existing, ...generated];
      localStorage.setItem(STORAGE_KEYS.GROCERY_ITEMS, JSON.stringify(all));
      if (this.supabase && this.config.enabled) {
        await this.supabase.from('smart_grocery_items').insert(generated);
      }
    }

    return await this.getGroceryItems(userId);
  }

  // --- SYSTEM STATS (ADMIN DASHBOARD) ---
  public async getSystemStats() {
    const foods = await this.getFoods();
    const allLogs: FoodLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOOD_LOGS) || '[]');
    const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '{}');
    const userCount = Math.max(1, Object.keys(profiles).length);

    return {
      totalUsers: userCount,
      totalFoods: foods.length,
      indianFoodsCount: foods.filter((f) => f.is_indian).length,
      vegetarianFoodsCount: foods.filter((f) => f.vegetarian).length,
      totalFoodLogs: allLogs.length,
      supabaseConnected: this.isSupabaseConnected(),
      databaseMode: this.isSupabaseConnected() ? 'Supabase Cloud (PostgreSQL)' : 'Local Engine / Guest Mode',
    };
  }

  // --- Convenience & Compatibility Methods ---
  public getCurrentUser(): AuthUser | null {
    return this.getStoredUser();
  }

  public isSupabaseConfigured(): boolean {
    return this.isSupabaseConnected();
  }

  public async updateProfile(profile: UserProfile): Promise<UserProfile> {
    return this.saveProfile(profile);
  }

  public async createFood(food: Omit<FoodItem, 'id'>): Promise<FoodItem> {
    return this.addFood(food);
  }

  public async addMealPlan(
    userId: string,
    date: string,
    mealType: any,
    foodId: string,
    quantity: number
  ): Promise<MealPlanItem> {
    return this.addMealPlanItem({
      user_id: userId,
      meal_date: date,
      meal_type: mealType,
      food_id: foodId,
      serving_quantity: quantity,
    });
  }

  public async removeMealPlan(itemId: string): Promise<boolean> {
    return this.removeMealPlanItem(itemId);
  }

  public async addWaterLog(
    userId: string,
    date: string,
    amountLiters: number
  ): Promise<WaterLog> {
    const newLog: WaterLog = {
      id: `wtr-${Date.now()}`,
      user_id: userId,
      amount: amountLiters,
      logged_at: `${date}T${new Date().toTimeString().split(' ')[0]}Z`,
    };

    if (this.supabase && this.config.enabled) {
      await this.supabase.from('smart_water_logs').insert(newLog);
    }

    const allWater: WaterLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATER_LOGS) || '[]');
    allWater.push(newLog);
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(allWater));
    return newLog;
  }

  public async removeWeightLog(logId: string): Promise<boolean> {
    return this.deleteWeightLog(logId);
  }

  public async getGroceryList(userId: string): Promise<GroceryItem[]> {
    return this.getGroceryItems(userId);
  }

  public async clearCompletedGrocery(userId: string): Promise<boolean> {
    const items = await this.getGroceryItems(userId);
    const uncompleted = items.filter((item) => !item.completed);
    localStorage.setItem(STORAGE_KEYS.GROCERY_ITEMS, JSON.stringify(uncompleted));

    if (this.supabase && this.config.enabled) {
      await this.supabase
        .from('smart_grocery_items')
        .delete()
        .eq('user_id', userId)
        .eq('completed', true);
    }
    return true;
  }

  public async syncGroceryFromMealPlans(userId: string, _date?: string): Promise<GroceryItem[]> {
    return this.generateGroceryFromMealPlan(userId);
  }
}

export const db = new DatabaseService();
