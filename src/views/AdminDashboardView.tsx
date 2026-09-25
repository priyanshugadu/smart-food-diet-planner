import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  Users,
  UtensilsCrossed,
  Trash2,
  Edit2,
  Plus,
  Search,
  Server,
  Lock,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Save,
  Sparkles,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  Filter,
} from 'lucide-react';
import { db } from '../services/db';
import { AdminCredentials, AuthUser, FoodItem } from '../types';

interface AdminDashboardViewProps {
  foods: FoodItem[];
  isSupabaseConnected: boolean;
  onDeleteFood: (foodId: string) => Promise<void>;
  onEditFood: (food: FoodItem) => Promise<void>;
  onAddFood: (food: Omit<FoodItem, 'id'>) => Promise<void>;
  user?: AuthUser;
  onElevateToAdmin?: (adminUser: AuthUser) => void;
  onNavigateToUserDashboard?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  foods,
  isSupabaseConnected,
  onDeleteFood,
  onEditFood,
  onAddFood,
  user,
  onElevateToAdmin,
  onNavigateToUserDashboard,
}) => {
  // Admin credentials state
  const [adminCreds, setAdminCreds] = useState<AdminCredentials>(() => db.getAdminCredentials());
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [isEditCredModalOpen, setIsEditCredModalOpen] = useState(false);

  // Edit credentials form state
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [credError, setCredError] = useState<string | null>(null);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);

  // Unlock gate form state (if non-admin tries to view)
  const [gateIdentifier, setGateIdentifier] = useState('');
  const [gatePassword, setGatePassword] = useState('');
  const [gateShowPassword, setGateShowPassword] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [gateLoading, setGateLoading] = useState(false);

  // Food catalog search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [savingAction, setSavingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Food Form State
  const [newFood, setNewFood] = useState<Omit<FoodItem, 'id'>>({
    name: '',
    category: 'Grains',
    serving_size: '1 serving (150g)',
    serving_weight_g: 150,
    calories: 200,
    protein: 8,
    carbohydrates: 25,
    fat: 6,
    fiber: 3,
    vegetarian: true,
    vegan: false,
    is_indian: true,
  });

  const categories = ['all', 'Indian Dishes', 'Grains', 'Vegetables', 'Fruits', 'Dairy', 'Protein', 'Snacks'];

  const filteredFoods = foods.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' ||
      f.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Indian Dishes' && f.is_indian);
    return matchesSearch && matchesCat;
  });

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(adminCreds.password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleOpenEditCredModal = () => {
    const creds = db.getAdminCredentials();
    setAdminCreds(creds);
    setEditUsername(creds.username);
    setEditEmail(creds.email);
    setEditFullName(creds.fullName);
    setEditPassword(creds.password);
    setEditConfirmPassword(creds.password);
    setCredError(null);
    setCredSuccess(null);
    setIsEditCredModalOpen(true);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(null);

    const cleanUsername = editUsername.trim().toLowerCase();
    const cleanEmail = editEmail.trim().toLowerCase();
    const cleanPass = editPassword.trim();

    if (!cleanUsername) {
      setCredError('Admin User Naam (Username) cannot be empty.');
      return;
    }
    if (cleanPass.length < 4) {
      setCredError('Password must be at least 4 characters long.');
      return;
    }
    if (cleanPass !== editConfirmPassword.trim()) {
      setCredError('Passwords do not match.');
      return;
    }

    const updated = db.updateAdminCredentials({
      username: cleanUsername,
      email: cleanEmail || `${cleanUsername}@smartdiet.com`,
      password: cleanPass,
      fullName: editFullName.trim() || 'Faculty Project Admin',
    });

    setAdminCreds(updated);
    setCredSuccess(`Admin credentials successfully updated! User Naam: "${updated.username}", Password: "${updated.password}"`);
    setTimeout(() => {
      setIsEditCredModalOpen(false);
      setCredSuccess(null);
    }, 1800);
  };

  const handleResetToDefaultCreds = () => {
    if (window.confirm('Reset Admin credentials to default (User Naam: "admin", Password: "admin123")?')) {
      const def = db.resetAdminCredentialsToDefault();
      setAdminCreds(def);
      setEditUsername(def.username);
      setEditEmail(def.email);
      setEditFullName(def.fullName);
      setEditPassword(def.password);
      setEditConfirmPassword(def.password);
      setCredSuccess('Reset to factory default credentials: admin / admin123');
    }
  };

  // Admin access must always go through the authenticated admin credentials.
  const handleUnlockAdminGate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    setGateLoading(true);

    try {
      const res = await db.login(gateIdentifier, gatePassword);
      if (res.error) {
        setGateError(res.error);
      } else if (res.user && res.user.role === 'admin') {
        if (onElevateToAdmin) {
          onElevateToAdmin(res.user);
        }
      } else {
        setGateError('This account does not have administrator privileges. Please use the configured administrator credentials.');
      }
    } catch (err: any) {
      setGateError(err.message || 'Failed to authenticate admin credentials.');
    } finally {
      setGateLoading(false);
    }
  };

  // Food CRUD Handlers
  const handleSaveEditFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFood) return;
    setSavingAction(true);
    try {
      await onEditFood(editingFood);
      setActionSuccess(`Updated "${editingFood.name}" successfully!`);
      setEditingFood(null);
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err: any) {
      alert('Failed to update food: ' + err.message);
    } finally {
      setSavingAction(false);
    }
  };

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.name.trim()) {
      alert('Food item name is required');
      return;
    }
    setSavingAction(true);
    try {
      await onAddFood(newFood);
      setActionSuccess(`Added "${newFood.name}" to verified food catalog!`);
      setIsAddFoodOpen(false);
      setNewFood({
        name: '',
        category: 'Grains',
        serving_size: '1 serving (150g)',
        serving_weight_g: 150,
        calories: 200,
        protein: 8,
        carbohydrates: 25,
        fat: 6,
        fiber: 3,
        vegetarian: true,
        vegan: false,
        is_indian: true,
      });
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err: any) {
      alert('Failed to add food: ' + err.message);
    } finally {
      setSavingAction(false);
    }
  };

  const handleDeleteWithConfirm = async (food: FoodItem) => {
    if (window.confirm(`Are you sure you want to delete "${food.name}" from the verified food catalog?`)) {
      try {
        await onDeleteFood(food.id);
        setActionSuccess(`Deleted "${food.name}" from catalog.`);
        setTimeout(() => setActionSuccess(null), 2500);
      } catch (err: any) {
        alert('Failed to delete food: ' + err.message);
      }
    }
  };

  // IF USER IS NOT YET ADMIN: SHOW ADMIN LOGIN & VERIFICATION GATE
  if (user && user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-6 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Gate Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-center text-white relative">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider inline-block mb-2">
              Faculty & System Security
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Admin Management Panel Login</h2>
            <p className="text-xs text-indigo-200/90 mt-1 max-w-sm mx-auto">
              You are currently signed in as <span className="font-semibold text-white">{user.full_name || user.email}</span>.
              Enter the Admin User Naam and Password to access faculty and system controls.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {/* Quick 1-Click Direct Admin Login Banner */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-950">Instant 1-Click Admin Access</span>
                </div>
                <span className="text-[11px] font-mono bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded font-bold">
                  {adminCreds.username} : {adminCreds.password}
                </span>
              </div>
              <button
                type="button"
                id="instant-admin-login-btn"
                
                disabled={gateLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{gateLoading ? 'Authenticating...' : 'One-Click Instant Login as Admin'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or Sign In with User Naam
              </span>
            </div>

            {gateError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gateError}</span>
              </div>
            )}

            <form onSubmit={handleUnlockAdminGate} className="space-y-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={gateIdentifier}
                    onChange={(e) => setGateIdentifier(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={gateShowPassword ? 'text' : 'password'}
                    required
                    value={gatePassword}
                    onChange={(e) => setGatePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setGateShowPassword(!gateShowPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {gateShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={gateLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{gateLoading ? 'Verifying...' : 'Unlock Admin Management Panel'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE ADMIN MANAGEMENT PANEL (WHEN ROLE === 'ADMIN')
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Action Toast */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Faculty & Administrative Privileges (Active)</span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-xl">Admin Management Panel</h3>
          <p className="text-xs text-slate-500">
            Supervise nutritional items, configure administrator credentials, and audit database operations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigateToUserDashboard && (
            <button
              type="button"
              onClick={onNavigateToUserDashboard}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Student Dashboard</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenEditCredModal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Set Admin User & Password</span>
          </button>
        </div>
      </div>

      {/* ADMIN CREDENTIALS & SECURITY CARD */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 rounded-2xl shadow-xl text-white p-5 sm:p-6 border border-indigo-800/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Active Admin Dashboard Credentials</h4>
                <p className="text-[11px] text-indigo-200">
                  User Naam and password currently authorized for full administrative control
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenEditCredModal}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 backdrop-blur-xs transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-indigo-300" />
                <span>Edit User Naam & Password</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {/* User Naam */}
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block mb-0.5">
                Admin User Naam
              </span>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono font-extrabold text-base text-white truncate">
                  {adminCreds.username}
                </span>
                <span className="px-1.5 py-0.5 bg-indigo-500/30 text-indigo-200 text-[10px] font-bold rounded">
                  Username
                </span>
              </div>
            </div>

            {/* Admin Email */}
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block mb-0.5">
                Admin Email
              </span>
              <span className="font-mono font-bold text-sm text-white truncate block">
                {adminCreds.email}
              </span>
            </div>

            {/* Admin Password */}
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-0.5">
                <span>Admin Password</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-indigo-300 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-extrabold text-base text-emerald-400 tracking-wider">
                  {showPassword ? adminCreds.password : '••••••••'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-semibold flex items-center gap-1 transition-colors text-white"
                  title="Copy password"
                >
                  {copiedPassword ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Display Name / Role */}
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block mb-0.5">
                Admin Name & Role
              </span>
              <div className="font-bold text-sm text-white truncate">{adminCreds.fullName}</div>
              <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">
                Super Admin Privileges
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Verified Foods</span>
            <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{foods.length}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Catalog items</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Database Engine</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate mt-1">
            {isSupabaseConnected ? 'Supabase Postgres' : 'Guest / Local Storage'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isSupabaseConnected ? 'Connected (Cloud)' : 'Fallback Mode'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Admin Status</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-sm font-extrabold text-slate-900 mt-1 truncate">
            {adminCreds.username} (Active)
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Faculty Project Admin</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>System Health</span>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-600 mt-0.5">100% Operational</div>
          <p className="text-[11px] text-slate-500 mt-1">Catalog CRUD Active</p>
        </div>
      </div>

      {/* FOOD CATALOG MANAGEMENT (CRUD) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">Food Catalog Management (CRUD)</h4>
            <p className="text-xs text-slate-500">
              Create, modify portions, update nutritional macros, or remove items from the central database
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="admin-add-food-btn"
              onClick={() => setIsAddFoodOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Verified Food</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search catalog by name or category (e.g. Paneer, Roti, Chicken)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Items' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Food Table */}
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto border border-slate-100 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 sticky top-0 bg-slate-50 z-10">
              <tr>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Serving Size</th>
                <th className="py-2.5 px-3">Calories</th>
                <th className="py-2.5 px-3">Protein</th>
                <th className="py-2.5 px-3">Carbs</th>
                <th className="py-2.5 px-3">Fat</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFoods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No food items match "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredFoods.map((food) => (
                  <tr key={food.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{food.name}</span>
                        {food.is_indian && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200/60">
                            Indian
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{food.category}</td>
                    <td className="py-2.5 px-3 text-slate-500">{food.serving_size}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{food.calories} kcal</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-semibold">{food.protein}g</td>
                    <td className="py-2.5 px-3 text-sky-700 font-semibold">{food.carbohydrates}g</td>
                    <td className="py-2.5 px-3 text-purple-700 font-semibold">{food.fat}g</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingFood({ ...food })}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit food"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWithConfirm(food)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete food"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD NEW FOOD MODAL */}
      {isAddFoodOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Add Verified Food to Catalog</h4>
                  <p className="text-[11px] text-slate-500">Item will be instantly available to all students</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFoodOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFood} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Food Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFood.name}
                    onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                    placeholder="e.g. Masala Dosa"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newFood.category}
                    onChange={(e) =>
                      setNewFood({ ...newFood, category: e.target.value as FoodItem['category'] })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  >
                    <option value="Grains">Grains & Breads</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Legumes">Legumes & Dals</option>
                    <option value="Dairy">Dairy & Milk Products</option>
                    <option value="Protein">Protein & Meats</option>
                    <option value="Snacks">Snacks & Street Food</option>
                    <option value="Beverages">Beverages & Shakes</option>
                    <option value="Nuts & Seeds">Nuts & Seeds</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Serving Size</label>
                <input
                  type="text"
                  required
                  value={newFood.serving_size}
                  onChange={(e) => setNewFood({ ...newFood, serving_size: e.target.value })}
                  placeholder="e.g. 1 medium piece (120g)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    value={newFood.calories}
                    onChange={(e) => setNewFood({ ...newFood, calories: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newFood.protein}
                    onChange={(e) => setNewFood({ ...newFood, protein: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newFood.carbohydrates}
                    onChange={(e) => setNewFood({ ...newFood, carbohydrates: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sky-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newFood.fat}
                    onChange={(e) => setNewFood({ ...newFood, fat: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-purple-700 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="new-food-indian"
                  checked={newFood.is_indian}
                  onChange={(e) => setNewFood({ ...newFood, is_indian: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="new-food-indian" className="text-slate-700 font-semibold cursor-pointer">
                  Tag as authentic Indian regional food item
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFoodOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingAction ? 'Adding...' : 'Add to Catalog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FOOD MODAL */}
      {editingFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Edit Food Item</h4>
              <button
                onClick={() => setEditingFood(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditFood} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingFood.name}
                  onChange={(e) => setEditingFood({ ...editingFood, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Serving Size</label>
                <input
                  type="text"
                  required
                  value={editingFood.serving_size}
                  onChange={(e) => setEditingFood({ ...editingFood, serving_size: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calories</label>
                  <input
                    type="number"
                    value={editingFood.calories}
                    onChange={(e) =>
                      setEditingFood({ ...editingFood, calories: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Protein</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingFood.protein}
                    onChange={(e) =>
                      setEditingFood({ ...editingFood, protein: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Carbs</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingFood.carbohydrates}
                    onChange={(e) =>
                      setEditingFood({ ...editingFood, carbohydrates: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sky-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fat</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingFood.fat}
                    onChange={(e) =>
                      setEditingFood({ ...editingFood, fat: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-purple-700"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFood(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                >
                  {savingAction ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN CREDENTIALS MODAL */}
      {isEditCredModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Set Admin User Naam & Password
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Update credentials authorized for this Admin Management Panel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCredModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {credError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{credError}</span>
              </div>
            )}

            {credSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{credSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Admin User Naam (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. admin or faculty_admin</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="admin@smartdiet.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Also acts as alternate login identifier</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Admin Full Name
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Faculty Project Admin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Admin Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="admin123"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Min 4 characters</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    placeholder="admin123"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Re-type password to verify</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefaultCreds}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default (admin / admin123)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditCredModalOpen(false)}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Credentials</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
