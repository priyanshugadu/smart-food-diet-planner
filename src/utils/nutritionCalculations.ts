import { ActivityLevel, FitnessGoal, Gender, NutritionTargets, UserProfile } from '../types';

export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: string;
  color: string;
  healthyRange: string;
} {
  if (!weightKg || !heightCm || heightCm <= 0) {
    return {
      bmi: 0,
      category: 'Unknown',
      color: 'text-slate-500',
      healthyRange: '18.5 - 24.9 kg/m²',
    };
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal weight';
  let color = 'text-emerald-600 bg-emerald-50 border-emerald-200';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = 'text-amber-600 bg-amber-50 border-amber-200';
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    category = 'Normal weight';
    color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  } else if (bmi >= 25.0 && bmi <= 29.9) {
    category = 'Overweight';
    color = 'text-orange-600 bg-orange-50 border-orange-200';
  } else {
    category = 'Obese';
    color = 'text-rose-600 bg-rose-50 border-rose-200';
  }

  return {
    bmi,
    category,
    color,
    healthyRange: '18.5 - 24.9 kg/m²',
  };
}

export function calculateNutritionTargets(profile: Partial<UserProfile>): NutritionTargets {
  const weight = profile.weight || 68;
  const height = profile.height || 172;
  const age = profile.age || 22;
  const gender: Gender = profile.gender || 'male';
  const activity: ActivityLevel = profile.activity_level || 'moderate';
  const goal: FitnessGoal = profile.fitness_goal || 'maintain_weight';

  // Mifflin-St Jeor Formula
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78;
  }
  bmr = Math.round(bmr);

  // Activity Multipliers
  const activityFactors: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const tdee = Math.round(bmr * (activityFactors[activity] || 1.4));

  // Goal adjustment
  let targetCalories = tdee;
  let proteinPerKg = 1.4;

  switch (goal) {
    case 'weight_loss':
      targetCalories = Math.max(1200, tdee - 500);
      proteinPerKg = 1.8;
      break;
    case 'weight_gain':
      targetCalories = tdee + 450;
      proteinPerKg = 1.6;
      break;
    case 'muscle_gain':
      targetCalories = tdee + 300;
      proteinPerKg = 2.0;
      break;
    case 'maintain_weight':
    default:
      targetCalories = tdee;
      proteinPerKg = 1.4;
      break;
  }

  const targetProtein = Math.round(weight * proteinPerKg);
  // Healthy macro distribution:
  // Protein: 4 kcal/g
  // Fat: ~25% of calories (9 kcal/g)
  // Carbs: remainder (4 kcal/g)
  const fatCalories = targetCalories * 0.25;
  const targetFat = Math.round(fatCalories / 9);
  const carbCalories = Math.max(0, targetCalories - (targetProtein * 4 + fatCalories));
  const targetCarbs = Math.round(carbCalories / 4);

  // Water target: ~35ml per kg + 500ml activity offset
  const targetWater = Number(Math.max(2.0, (weight * 0.035 + 0.5)).toFixed(1));

  const { bmi, category, color, healthyRange } = calculateBMI(weight, height);

  return {
    bmr,
    tdee,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    targetWater,
    bmi,
    bmiCategory: category,
    bmiColor: color,
    healthyBmiRange: healthyRange,
  };
}

export const MEDICAL_DISCLAIMER =
  'Notice: Caloric targets, BMI metrics, and macronutrient breakdowns are algorithmically estimated for informational and educational purposes. They do not constitute certified medical diagnosis, treatment, or dietary prescription. Consult a healthcare professional or registered dietitian for specialized health needs.';
