# Smart Food & Diet Planner — Supabase Setup

This project is connected to the existing Supabase project `pkpzzqiiksdnbbetuvay` (ap-south-1).

## Tables used by this app
- smart_profiles
- smart_foods
- smart_meal_plans
- smart_food_logs
- smart_water_logs
- smart_weight_logs
- smart_grocery_items

The app uses Supabase Auth for registered users and RLS for user-owned records.

## Local run
```bash
npm install
npm run dev
```

Open:
http://localhost:3000/

Do not put a Supabase secret/service_role key in the frontend. The included key is the publishable/legacy public client key.
