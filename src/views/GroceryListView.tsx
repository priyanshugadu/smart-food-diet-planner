import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { GroceryItem, MealPlanItem } from '../types';

interface GroceryListViewProps {
  groceryItems: GroceryItem[];
  mealPlans: MealPlanItem[];
  onToggleItem: (id: string, purchased: boolean) => Promise<void>;
  onAddItem: (item: string, category: string, quantity: string) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onClearCompleted: () => Promise<void>;
  onSyncFromPlans: () => Promise<void>;
}

const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Grains',
  'Protein',
  'Nuts & Seeds',
  'Other',
];

export const GroceryListView: React.FC<GroceryListViewProps> = ({
  groceryItems,
  mealPlans,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onClearCompleted,
  onSyncFromPlans,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Vegetables');
  const [newItemQuantity, setNewItemQuantity] = useState('500g');
  const [syncing, setSyncing] = useState(false);

  const completedCount = groceryItems.filter((item) => item.completed).length;
  const totalCount = groceryItems.length;

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    await onAddItem(newItemName.trim(), newItemCategory, newItemQuantity.trim());
    setNewItemName('');
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await onSyncFromPlans();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Main Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <span>Smart Grocery & Pantry Generator</span>
          </h3>
          <p className="text-xs text-slate-500">
            Categorized shopping list auto-compiled from your active meal plan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-sync-grocery"
            onClick={handleSync}
            disabled={syncing}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync from Meal Plan'}</span>
          </button>

          {completedCount > 0 && (
            <button
              id="btn-clear-completed"
              onClick={onClearCompleted}
              className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Clear Checked ({completedCount})
            </button>
          )}
        </div>
      </div>

      {/* Quick Add Custom Item Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <h4 className="font-bold text-slate-900 text-sm mb-3">Add Custom Item</h4>
        <form onSubmit={handleCreateItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <input
              id="grocery-item-name"
              type="text"
              required
              placeholder="e.g. Rolled Oats, Greek Yogurt, Olive Oil..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Qty (e.g. 500g)"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              id="btn-add-grocery"
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center shrink-0 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Grouped Shopping List */}
      <div className="space-y-4">
        {totalCount === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs space-y-2">
            <p>Your grocery list is empty.</p>
            <p>
              Click <strong>"Sync from Meal Plan"</strong> above to extract ingredients automatically!
            </p>
          </div>
        ) : (
          CATEGORIES.map((category) => {
            const items = groceryItems.filter((i) => i.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    {category} ({items.length})
                  </span>
                </div>

                <div className="divide-y divide-slate-100 p-2 sm:p-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-all ${
                        item.completed ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 mr-3">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => onToggleItem(item.id, e.target.checked)}
                          className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span
                          className={`text-xs font-semibold ${
                            item.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {item.item_name}
                        </span>
                        {item.quantity && (
                          <span className="text-[11px] text-slate-500 font-normal">
                            ({item.quantity})
                          </span>
                        )}
                      </label>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
