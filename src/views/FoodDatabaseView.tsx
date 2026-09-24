import React, { useState } from 'react';
import {
  Database,
  Search,
  Plus,
  Filter,
  Flame,
  Activity,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
  Tag,
} from 'lucide-react';
import { DietaryPreference, FoodItem } from '../types';
import { getFoodImage } from '../utils/foodImages';

interface FoodDatabaseViewProps {
  foods: FoodItem[];
  onAddFood: (food: Omit<FoodItem, 'id'>) => Promise<void>;
}

export const FoodDatabaseView: React.FC<FoodDatabaseViewProps> = ({ foods, onAddFood }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterHighProtein, setFilterHighProtein] = useState(false);
  const [filterLowCalorie, setFilterLowCalorie] = useState(false);
  const [filterDiet, setFilterDiet] = useState<string>('all');
  const [filterIndianOnly, setFilterIndianOnly] = useState(false);

  // Add Food Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCategory, setNewFoodCategory] = useState<FoodItem['category']>('Grains');
  const [newFoodCalories, setNewFoodCalories] = useState(150);
  const [newFoodProtein, setNewFoodProtein] = useState(5);
  const [newFoodCarbs, setNewFoodCarbs] = useState(25);
  const [newFoodFat, setNewFoodFat] = useState(2);
  const [newFoodServing, setNewFoodServing] = useState('1 cup (150g)');
  const [newFoodVegetarian, setNewFoodVegetarian] = useState(true);
  const [newFoodVegan, setNewFoodVegan] = useState(false);
  const [newFoodIndian, setNewFoodIndian] = useState(true);
  const [submittingFood, setSubmittingFood] = useState(false);

  const categories = [
    'all',
    'Grains',
    'Lentils & Pulses',
    'Dairy',
    'Vegetables',
    'Fruits',
    'Meat & Poultry',
    'Seafood',
    'Snacks',
    'Nuts & Seeds',
  ];

  const filteredFoods = foods.filter((food) => {
    // Search
    const matchesSearch =
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // Category
    if (selectedCategory !== 'all' && food.category !== selectedCategory) {
      return false;
    }

    // High Protein (>15g)
    if (filterHighProtein && food.protein < 15) {
      return false;
    }

    // Low Calorie (<150 kcal)
    if (filterLowCalorie && food.calories > 150) {
      return false;
    }

    // Indian foods only
    if (filterIndianOnly && !food.is_indian) {
      return false;
    }

    // Dietary
    if (filterDiet === 'vegetarian' && !food.vegetarian) return false;
    if (filterDiet === 'vegan' && !food.vegan) return false;
    if (filterDiet === 'non_vegetarian' && food.vegetarian) return false;

    return true;
  });

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim()) return;

    setSubmittingFood(true);
    try {
      await onAddFood({
        name: newFoodName.trim(),
        category: newFoodCategory,
        serving_weight_g: 100,
        calories: Number(newFoodCalories),
        protein: Number(newFoodProtein),
        carbohydrates: Number(newFoodCarbs),
        fat: Number(newFoodFat),
        serving_size: newFoodServing.trim(),
        vegetarian: newFoodVegetarian || newFoodVegan,
        vegan: newFoodVegan,
        is_indian: newFoodIndian,
      });
      setIsAddModalOpen(false);
      // Reset form
      setNewFoodName('');
      setNewFoodCalories(150);
      setNewFoodProtein(5);
      setNewFoodCarbs(25);
      setNewFoodFat(2);
      setNewFoodServing('1 cup (150g)');
    } finally {
      setSubmittingFood(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header and Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <span>Food & Nutrition Database</span>
          </h3>
          <p className="text-xs text-slate-500">
            Search, filter, and inspect verified nutritional breakdowns of Indian and global foods
          </p>
        </div>

        <button
          id="btn-open-add-food-modal"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Food</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              id="food-search-input"
              type="text"
              placeholder="Search food by name (e.g. Paneer, Roti, Dal, Apple, Soya...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterDiet}
              onChange={(e) => setFilterDiet(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Diets</option>
              <option value="vegetarian">Vegetarian Only</option>
              <option value="vegan">Vegan Only</option>
              <option value="non_vegetarian">Non-Vegetarian</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Badges / Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Quick Filters:</span>

          <button
            onClick={() => setFilterIndianOnly(!filterIndianOnly)}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              filterIndianOnly
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            🇮🇳 Indian Staples
          </button>

          <button
            onClick={() => setFilterHighProtein(!filterHighProtein)}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              filterHighProtein
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            💪 High Protein (&gt;15g)
          </button>

          <button
            onClick={() => setFilterLowCalorie(!filterLowCalorie)}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              filterLowCalorie
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            🥗 Low Calorie (&lt;150 kcal)
          </button>
        </div>

        {/* Category horizontal pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors capitalize ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            No foods match your search criteria. Try removing some filters or add a new food item!
          </div>
        ) : (
          filteredFoods.map((food) => (
            <div
              key={food.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all group"
            >
              <div>
                {/* Food Image Banner */}
                <div className="h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  <img
                    src={getFoodImage(food)}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 flex-wrap justify-end">
                    {food.is_indian && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white backdrop-blur-xs text-[10px] font-bold shadow-xs">
                        Indian
                      </span>
                    )}
                    {food.vegan ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 text-white backdrop-blur-xs text-[10px] font-bold shadow-xs">
                        Vegan
                      </span>
                    ) : food.vegetarian ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-600/90 text-white backdrop-blur-xs text-[10px] font-bold shadow-xs">
                        Veg
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white backdrop-blur-xs text-[10px] font-bold shadow-xs">
                        Non-Veg
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 pb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{food.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{food.category}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Serving: <strong className="text-slate-800 dark:text-slate-200">{food.serving_size}</strong>
                  </p>
                </div>
              </div>

              {/* Macro stats block */}
              <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">{food.calories}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] ml-1">kcal</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="px-1.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold">
                    P: {food.protein}g
                  </span>
                  <span className="px-1.5 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-bold">
                    C: {food.carbohydrates}g
                  </span>
                  <span className="px-1.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold">
                    F: {food.fat}g
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD FOOD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                Add New Food to Database
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFood} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Food Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Moong Dal Khichdi"
                  value={newFoodName}
                  onChange={(e) => setNewFoodName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newFoodCategory}
                    onChange={(e) => setNewFoodCategory(e.target.value as FoodItem['category'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Grains">Grains & Breads</option>
                    <option value="Legumes">Lentils & Legumes</option>
                    <option value="Protein">Protein & Meats</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Nuts & Seeds">Nuts & Seeds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Serving Size
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 bowl (200g)"
                    value={newFoodServing}
                    onChange={(e) => setNewFoodServing(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Nutritional values */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calories</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newFoodCalories}
                    onChange={(e) => setNewFoodCalories(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={newFoodProtein}
                    onChange={(e) => setNewFoodProtein(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={newFoodCarbs}
                    onChange={(e) => setNewFoodCarbs(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sky-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={newFoodFat}
                    onChange={(e) => setNewFoodFat(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-purple-700"
                  />
                </div>
              </div>

              {/* Badges / Checkboxes */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFoodVegetarian}
                    onChange={(e) => setNewFoodVegetarian(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Vegetarian</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFoodVegan}
                    onChange={(e) => setNewFoodVegan(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Vegan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFoodIndian}
                    onChange={(e) => setNewFoodIndian(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Indian Cuisine Staple</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFood}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  {submittingFood ? 'Saving to Database...' : 'Save Food Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
