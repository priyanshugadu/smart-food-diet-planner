import { UserProfile, MealPlanItem, FoodLog, WaterLog, NutritionTargets } from '../types';
import { APP_LOGO_DATA_URI } from '../assets/images/logoDataUri';

export function triggerFileDownload(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
  } catch (err) {
    console.error('File download failed:', err);
  }
}

export function generateReportHtml(
  profile: UserProfile,
  targets: NutritionTargets,
  mealPlans: MealPlanItem[],
  foodLogs: FoodLog[],
  waterLogs: WaterLog[],
  dateStr: string
): string {
  const totalPlannedCalories = mealPlans.reduce(
    (sum, m) => sum + (m.food ? Math.round(m.food.calories * m.serving_quantity) : 0),
    0
  );
  const totalPlannedProtein = mealPlans.reduce(
    (sum, m) => sum + (m.food ? Math.round(m.food.protein * m.serving_quantity) : 0),
    0
  );
  const totalPlannedCarbs = mealPlans.reduce(
    (sum, m) => sum + (m.food ? Math.round(m.food.carbohydrates * m.serving_quantity) : 0),
    0
  );
  const totalPlannedFat = mealPlans.reduce(
    (sum, m) => sum + (m.food ? Math.round(m.food.fat * m.serving_quantity) : 0),
    0
  );
  const totalWaterLogged = waterLogs.reduce((sum, w) => sum + w.amount, 0);

  const mealRows = mealPlans.map((m) => {
    const cal = m.food ? Math.round(m.food.calories * m.serving_quantity) : 0;
    const prot = m.food ? (m.food.protein * m.serving_quantity).toFixed(1) : '0';
    const carbs = m.food ? (m.food.carbohydrates * m.serving_quantity).toFixed(1) : '0';
    const fat = m.food ? (m.food.fat * m.serving_quantity).toFixed(1) : '0';
    return `
      <tr>
        <td style="padding: 10px 12px; font-weight: 600; text-transform: capitalize; color: #047857; border-bottom: 1px solid #e2e8f0;">${m.meal_type.replace(/_/g, ' ')}</td>
        <td style="padding: 10px 12px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${m.food?.name || 'Custom item'}</td>
        <td style="padding: 10px 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">${m.serving_quantity}x (${m.food?.serving_size || '1 serving'})</td>
        <td style="padding: 10px 12px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${cal} kcal</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #059669; border-bottom: 1px solid #e2e8f0;">${prot}g</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #0284c7; border-bottom: 1px solid #e2e8f0;">${carbs}g</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #7c3aed; border-bottom: 1px solid #e2e8f0;">${fat}g</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Diet Plan & Nutrition Report - ${profile.full_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      padding: 32px;
      line-height: 1.5;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .print-actions {
      margin-bottom: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn {
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 10px;
      cursor: pointer;
      border: none;
      transition: background 0.2s;
    }
    .btn-primary { background: #059669; color: white; }
    .btn-primary:hover { background: #047857; }
    .header {
      border-bottom: 2px solid #10b981;
      padding-bottom: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand { font-size: 12px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 1px; }
    .title { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
    .meta-box { background: #f1f5f9; padding: 12px 18px; border-radius: 12px; text-align: right; }
    .meta-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .meta-val { font-size: 14px; font-weight: 700; color: #0f172a; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
    .card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .card-val { font-size: 16px; font-weight: 800; color: #0f172a; }
    .card-sub { font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; border: none; padding: 0; }
      .print-actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-actions">
      <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>

    <div class="header">
      <div style="display: flex; align-items: center; gap: 16px;">
        <img src="${APP_LOGO_DATA_URI}" alt="Smart Food & Diet Planner Logo" style="width: 58px; height: 58px; border-radius: 12px; object-fit: contain; border: 1px solid #e2e8f0; padding: 2px; background: white;" />
        <div>
          <div class="brand">Smart Food & Diet Planner</div>
          <div class="title">Personal Nutrition & Diet Regime</div>
          <div class="subtitle">Better Food • Healthier You — Automated Nutrition Protocol</div>
        </div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Date Generated</div>
        <div class="meta-val">${dateStr}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-label">Candidate</div>
        <div class="card-val">${profile.full_name}</div>
        <div class="card-sub">${profile.age} yrs • ${profile.gender}</div>
      </div>
      <div class="card">
        <div class="card-label">BMI & Status</div>
        <div class="card-val">${targets.bmi} kg/m²</div>
        <div class="card-sub">${targets.bmiCategory}</div>
      </div>
      <div class="card">
        <div class="card-label">Energy Target</div>
        <div class="card-val">${targets.targetCalories} kcal</div>
        <div class="card-sub">Goal: ${profile.fitness_goal.replace(/_/g, ' ')}</div>
      </div>
      <div class="card">
        <div class="card-label">Target Protein</div>
        <div class="card-val">${targets.targetProtein}g</div>
        <div class="card-sub">Water: ${targets.targetWater}L / day</div>
      </div>
    </div>

    <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 20px; display: flex; justify-content: space-between;">
      <span>Structured Meal Schedule</span>
      <span style="font-size: 12px; color: #059669;">Total: ${totalPlannedCalories} kcal (${totalPlannedProtein}g Prot / ${totalPlannedCarbs}g Carbs / ${totalPlannedFat}g Fat)</span>
    </h3>

    <table>
      <thead>
        <tr>
          <th>Meal Slot</th>
          <th>Food Item</th>
          <th>Serving</th>
          <th>Calories</th>
          <th>Protein</th>
          <th>Carbs</th>
          <th>Fat</th>
        </tr>
      </thead>
      <tbody>
        ${mealRows || '<tr><td colspan="7" style="padding: 20px; text-align: center; color: #94a3b8;">No meals logged yet.</td></tr>'}
      </tbody>
    </table>

    <div style="margin-top: 24px; padding: 14px 18px; background: #ecfdf5; border-radius: 12px; border: 1px solid #a7f3d0; font-size: 12px; color: #065f46;">
      <strong>Hydration & Adherence Note:</strong> Target hydration is <strong>${targets.targetWater} Liters</strong> daily (Logged: <strong>${totalWaterLogged.toFixed(1)}L</strong>). Caloric deficit/surplus is calibrated using the Mifflin-St Jeor metabolic expenditure formula.
    </div>

    <div class="footer">
      <div>Smart Food & Diet Planner • Project Submission Report</div>
      <div>Verified for Academic Demonstration</div>
    </div>
  </div>
</body>
</html>`;
}

export function downloadPdfReportHtml(
  profile: UserProfile,
  targets: NutritionTargets,
  mealPlans: MealPlanItem[],
  foodLogs: FoodLog[],
  waterLogs: WaterLog[],
  dateStr: string
) {
  const html = generateReportHtml(profile, targets, mealPlans, foodLogs, waterLogs, dateStr);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const filename = `Diet-Plan-Report-${profile.full_name.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.html`;
  triggerFileDownload(blob, filename);
}

export function downloadCsvReport(
  profile: UserProfile,
  targets: NutritionTargets,
  mealPlans: MealPlanItem[],
  dateStr: string
) {
  let csv = 'Smart Food & Diet Planner - Nutrition Summary Report\r\n';
  csv += `User,${profile.full_name}\r\n`;
  csv += `Date,${dateStr}\r\n`;
  csv += `BMI,${targets.bmi} (${targets.bmiCategory})\r\n`;
  csv += `Target Calories,${targets.targetCalories} kcal\r\n`;
  csv += `Target Protein,${targets.targetProtein} g\r\n`;
  csv += `Target Water,${targets.targetWater} L\r\n\r\n`;
  csv += 'Meal Slot,Food Item,Quantity,Calories (kcal),Protein (g),Carbohydrates (g),Fat (g)\r\n';

  mealPlans.forEach((mp) => {
    if (mp.food) {
      const cal = Math.round(mp.food.calories * mp.serving_quantity);
      const p = (mp.food.protein * mp.serving_quantity).toFixed(1);
      const c = (mp.food.carbohydrates * mp.serving_quantity).toFixed(1);
      const f = (mp.food.fat * mp.serving_quantity).toFixed(1);
      csv += `"${mp.meal_type.replace(/_/g, ' ')}","${mp.food.name.replace(/"/g, '""')}",${mp.serving_quantity},${cal},${p},${c},${f}\r\n`;
    }
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const filename = `Diet-Plan-Meals-${profile.full_name.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`;
  triggerFileDownload(blob, filename);
}

export function downloadJsonReport(
  profile: UserProfile,
  targets: NutritionTargets,
  mealPlans: MealPlanItem[],
  foodLogs: FoodLog[],
  waterLogs: WaterLog[]
) {
  const data = {
    project: 'Smart Food & Diet Planner',
    generated_at: new Date().toISOString(),
    user_profile: {
      name: profile.full_name,
      age: profile.age,
      gender: profile.gender,
      height_cm: profile.height,
      weight_kg: profile.weight,
      bmi: targets.bmi,
      bmi_category: targets.bmiCategory,
      fitness_goal: profile.fitness_goal,
      target_calories: targets.targetCalories,
      target_protein_g: targets.targetProtein,
      target_water_l: targets.targetWater,
    },
    meal_plan: mealPlans.map((mp) => ({
      meal_type: mp.meal_type,
      food_name: mp.food?.name || 'Unknown Item',
      quantity: mp.serving_quantity,
      serving_size: mp.food?.serving_size,
      calories: mp.food ? Math.round(mp.food.calories * mp.serving_quantity) : 0,
      protein_g: mp.food ? Number((mp.food.protein * mp.serving_quantity).toFixed(1)) : 0,
    })),
    food_intake_logs: foodLogs.map((fl) => ({
      food_name: fl.food?.name,
      meal_type: fl.meal_type,
      quantity: fl.quantity,
      time: fl.consumed_at,
    })),
    water_total_liters: waterLogs.reduce((sum, w) => sum + w.amount, 0),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
  const filename = `Diet-Plan-Data-${profile.full_name.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.json`;
  triggerFileDownload(blob, filename);
}

export function downloadTextSummary(
  profile: UserProfile,
  targets: NutritionTargets,
  mealPlans: MealPlanItem[],
  dateStr: string
) {
  let txt = `=================================================\n`;
  txt += `       SMART FOOD & DIET PLANNER REPORT          \n`;
  txt += `=================================================\n\n`;
  txt += `User: ${profile.full_name} (${profile.age} yrs, ${profile.gender})\n`;
  txt += `Date: ${dateStr}\n`;
  txt += `Goal: ${profile.fitness_goal.replace(/_/g, ' ').toUpperCase()}\n`;
  txt += `BMI:  ${targets.bmi} kg/m² (${targets.bmiCategory})\n`;
  txt += `Target Energy:  ${targets.targetCalories} kcal\n`;
  txt += `Target Protein: ${targets.targetProtein} g\n`;
  txt += `Target Water:   ${targets.targetWater} Liters\n\n`;
  txt += `-------------------------------------------------\n`;
  txt += `DAILY MEAL SCHEDULE:\n`;
  txt += `-------------------------------------------------\n`;

  if (mealPlans.length === 0) {
    txt += `(No meals logged yet)\n`;
  } else {
    mealPlans.forEach((mp, i) => {
      const cal = mp.food ? Math.round(mp.food.calories * mp.serving_quantity) : 0;
      const p = mp.food ? (mp.food.protein * mp.serving_quantity).toFixed(1) : '0';
      txt += `${i + 1}. [${mp.meal_type.toUpperCase()}] ${mp.food?.name || 'Item'} (${mp.serving_quantity}x)\n`;
      txt += `   ${cal} kcal | Protein: ${p}g\n`;
    });
  }

  txt += `\n=================================================\n`;
  txt += `Calculated using Mifflin-St Jeor Equation\n`;
  txt += `Smart Food & Diet Planner Academic Project\n`;
  txt += `=================================================\n`;

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
  const filename = `Diet-Plan-Summary-${profile.full_name.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.txt`;
  triggerFileDownload(blob, filename);
}
