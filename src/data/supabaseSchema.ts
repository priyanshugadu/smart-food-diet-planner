export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- Smart Food & Diet Planner - Supabase PostgreSQL Schema & Security Rules
-- Project for College Mini-Project Demonstration
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age <= 120),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  height NUMERIC(5, 2) NOT NULL CHECK (height > 50 AND height <= 280), -- in cm
  weight NUMERIC(5, 2) NOT NULL CHECK (weight > 20 AND weight <= 350), -- in kg
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very_active', 'extra_active')),
  fitness_goal TEXT NOT NULL CHECK (fitness_goal IN ('weight_loss', 'weight_gain', 'maintain_weight', 'muscle_gain')),
  dietary_preference TEXT NOT NULL CHECK (dietary_preference IN ('vegetarian', 'non_vegetarian', 'vegan')),
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  food_preferences TEXT DEFAULT '',
  target_calories INTEGER,
  target_protein INTEGER,
  target_water NUMERIC(3, 1) DEFAULT 2.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Foods Database Table
CREATE TABLE IF NOT EXISTS public.foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  serving_size TEXT NOT NULL,
  serving_weight_g NUMERIC(6, 1) DEFAULT 100,
  calories NUMERIC(6, 1) NOT NULL,
  protein NUMERIC(5, 1) NOT NULL,
  carbohydrates NUMERIC(5, 1) NOT NULL,
  fat NUMERIC(5, 1) NOT NULL,
  fiber NUMERIC(5, 1) DEFAULT 0,
  vegetarian BOOLEAN NOT NULL DEFAULT true,
  vegan BOOLEAN NOT NULL DEFAULT false,
  is_indian BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Meal Plans Table
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'mid_morning_snack', 'lunch', 'evening_snack', 'dinner')),
  food_id TEXT NOT NULL REFERENCES public.foods(id) ON DELETE RESTRICT,
  serving_quantity NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Food Logs Table (Daily intake diary)
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL REFERENCES public.foods(id) ON DELETE RESTRICT,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'mid_morning_snack', 'lunch', 'evening_snack', 'dinner')),
  quantity NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
  consumed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Water Logs Table
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(4, 2) NOT NULL CHECK (amount > 0), -- in Liters
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Weight Logs Table
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight NUMERIC(5, 2) NOT NULL CHECK (weight > 20 AND weight <= 350),
  note TEXT DEFAULT '',
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Grocery Items Table
CREATE TABLE IF NOT EXISTS public.grocery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity TEXT NOT NULL DEFAULT '1 pack',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- Row Level Security (RLS) Policies
-- Ensures each user can strictly access only their personal health data
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;

-- Foods Table: Everyone can read, authenticated or admin can manage
CREATE POLICY "Foods are viewable by all authenticated users"
  ON public.foods FOR SELECT USING (true);

-- User Profiles: Users can view & update only their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Meal Plans: Users can view, insert, update, delete own meal plans
CREATE POLICY "Users manage own meal plans"
  ON public.meal_plans FOR ALL USING (auth.uid() = user_id);

-- Food Logs: Users manage own food logs
CREATE POLICY "Users manage own food logs"
  ON public.food_logs FOR ALL USING (auth.uid() = user_id);

-- Water Logs: Users manage own water logs
CREATE POLICY "Users manage own water logs"
  ON public.water_logs FOR ALL USING (auth.uid() = user_id);

-- Weight Logs: Users manage own weight logs
CREATE POLICY "Users manage own weight logs"
  ON public.weight_logs FOR ALL USING (auth.uid() = user_id);

-- Grocery Items: Users manage own grocery list
CREATE POLICY "Users manage own grocery items"
  ON public.grocery_items FOR ALL USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON public.meal_plans (user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON public.food_logs (user_id, consumed_at);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON public.water_logs (user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON public.weight_logs (user_id, logged_at);
`;

export const SUPABASE_SCHEMA_SQL = SUPABASE_SQL_SCHEMA;

