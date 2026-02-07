import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/hooks/useAuth';
import { userApi } from '../src/api/user.api';
import { merchantsApi, Merchant } from '../src/api/merchants.api';
import { categoriesApi, Category, CreateCategoryRequest } from '../src/api/categories.api';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [financialIntention, setFinancialIntention] = useState('');

  // Preferences state
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [monthlyBudgetGoal, setMonthlyBudgetGoal] = useState('');

  // Merchants state
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [newMerchantName, setNewMerchantName] = useState('');

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDisplayName, setNewCategoryDisplayName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('shopping_bag');
  const [newCategoryColor, setNewCategoryColor] = useState('#E6501B');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setFinancialIntention(user.financialIntention || '');
      setCurrency(user.preferences?.currency || 'USD');
      setTimezone(user.preferences?.timezone || 'UTC');
      setMonthlyBudgetGoal(user.preferences?.monthlyBudgetGoal?.toString() || '');

      // Fetch merchants and categories
      fetchMerchantsAndCategories();
    }
  }, [user]);

  const fetchMerchantsAndCategories = async () => {
    try {
      const [merchData, catData] = await Promise.all([
        merchantsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setMerchants(merchData);
      setCategories(catData);
    } catch (err: any) {
      console.error('Failed to fetch merchants/categories', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await userApi.updateProfile({ firstName, lastName, financialIntention });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await userApi.updatePreferences({
        currency,
        timezone,
        monthlyBudgetGoal: monthlyBudgetGoal ? parseFloat(monthlyBudgetGoal) : undefined,
      });
      setSuccess('Preferences updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // Ignore errors on logout
    }
  };

  const handleAddMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerchantName.trim()) return;

    try {
      setLoading(true);
      await merchantsApi.create({ name: newMerchantName.trim() });
      setNewMerchantName('');
      await fetchMerchantsAndCategories();
      setSuccess('Merchant added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add merchant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMerchant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this merchant?')) return;

    try {
      setLoading(true);
      await merchantsApi.delete(id);
      await fetchMerchantsAndCategories();
      setSuccess('Merchant deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete merchant');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !newCategoryDisplayName.trim()) return;

    try {
      setLoading(true);
      await categoriesApi.create({
        name: newCategoryName.trim(),
        displayName: newCategoryDisplayName.trim(),
        type: 'expense',
        icon: newCategoryIcon,
        color: newCategoryColor,
      });
      setNewCategoryName('');
      setNewCategoryDisplayName('');
      setNewCategoryIcon('shopping_bag');
      setNewCategoryColor('#E6501B');
      await fetchMerchantsAndCategories();
      setSuccess('Category added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setLoading(true);
      await categoriesApi.delete(id);
      await fetchMerchantsAndCategories();
      setSuccess('Category deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  ];

  const timezones = [
    // North America
    { value: 'America/New_York', label: 'Eastern Time (ET)', region: 'North America' },
    { value: 'America/Chicago', label: 'Central Time (CT)', region: 'North America' },
    { value: 'America/Denver', label: 'Mountain Time (MT)', region: 'North America' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', region: 'North America' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)', region: 'North America' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', region: 'North America' },
    { value: 'America/Toronto', label: 'Toronto', region: 'North America' },
    { value: 'America/Vancouver', label: 'Vancouver', region: 'North America' },
    { value: 'America/Mexico_City', label: 'Mexico City', region: 'North America' },

    // Europe
    { value: 'Europe/London', label: 'London (GMT/BST)', region: 'Europe' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)', region: 'Europe' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', region: 'Europe' },
    { value: 'Europe/Rome', label: 'Rome (CET/CEST)', region: 'Europe' },
    { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)', region: 'Europe' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)', region: 'Europe' },
    { value: 'Europe/Stockholm', label: 'Stockholm (CET/CEST)', region: 'Europe' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)', region: 'Europe' },
    { value: 'Europe/Istanbul', label: 'Istanbul (TRT)', region: 'Europe' },

    // Asia
    { value: 'Asia/Dubai', label: 'Dubai (GST)', region: 'Asia' },
    { value: 'Asia/Kolkata', label: 'India (IST)', region: 'Asia' },
    { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', region: 'Asia' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)', region: 'Asia' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', region: 'Asia' },
    { value: 'Asia/Shanghai', label: 'China (CST)', region: 'Asia' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', region: 'Asia' },
    { value: 'Asia/Seoul', label: 'Seoul (KST)', region: 'Asia' },

    // Pacific
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)', region: 'Pacific' },
    { value: 'Australia/Melbourne', label: 'Melbourne (AEDT/AEST)', region: 'Pacific' },
    { value: 'Australia/Brisbane', label: 'Brisbane (AEST)', region: 'Pacific' },
    { value: 'Australia/Perth', label: 'Perth (AWST)', region: 'Pacific' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)', region: 'Pacific' },

    // South America
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', region: 'South America' },
    { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)', region: 'South America' },
    { value: 'America/Santiago', label: 'Santiago (CLT)', region: 'South America' },

    // Africa
    { value: 'Africa/Cairo', label: 'Cairo (EET)', region: 'Africa' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', region: 'Africa' },
    { value: 'Africa/Lagos', label: 'Lagos (WAT)', region: 'Africa' },

    // Other
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', region: 'Other' },
  ];

  return (
    <div className="max-w-[720px] mx-auto px-6 pt-12 pb-24 animate-in fade-in duration-700">
      <section className="mb-20">
        <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Account Settings</h2>
        <p className="text-lg text-stone-text font-light max-w-md">
          Manage your personal details and preferences.
        </p>
      </section>

      {error && (
        <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 text-green-800 dark:text-green-200 text-sm">
          {success}
        </div>
      )}

      {/* Profile Section */}
      <section className="mb-24">
        <h3 className="text-2xl font-light text-white mb-8 border-b border-stone-800 pb-2">Profile</h3>
        <div className="mb-6">
          <div className="text-sm text-stone-text mb-1">Email</div>
          <div className="text-lg text-white">{user?.email}</div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-stone-text mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-surface-dark border border-stone-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Alex"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-text mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-surface-dark border border-stone-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Sterling"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-stone-text mb-2">Financial Intention</label>
            <input
              type="text"
              value={financialIntention}
              onChange={(e) => setFinancialIntention(e.target.value)}
              className="w-full px-4 py-3 bg-surface-dark border border-stone-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-serif italic"
              placeholder="security and freedom"
            />
            <p className="text-xs text-stone-text mt-2">What you want to feel about your finances</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>

      {/* Preferences Section */}
      <section className="mb-24">
        <h3 className="text-2xl font-light text-white mb-8 border-b border-stone-800 pb-2">Preferences</h3>
        <form onSubmit={handleUpdatePreferences} className="space-y-6">
          <div>
            <label className="block text-sm text-stone-text mb-2">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-surface-dark border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.name} ({curr.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-stone-text mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-3 bg-surface-dark border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              {['North America', 'Europe', 'Asia', 'Pacific', 'South America', 'Africa', 'Other'].map((region) => (
                <optgroup key={region} label={region}>
                  {timezones
                    .filter((tz) => tz.region === region)
                    .map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            <p className="text-xs text-stone-text mt-2">Select your local timezone for accurate date/time display</p>
          </div>

          <div>
            <label className="block text-sm text-stone-text mb-2">Monthly Budget Goal</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-lg">
                {currencies.find((c) => c.code === currency)?.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monthlyBudgetGoal}
                onChange={(e) => setMonthlyBudgetGoal(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-dark border border-stone-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="4000.00"
              />
            </div>
            <p className="text-xs text-stone-text mt-2">Your target monthly spending limit</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </section>

      {/* Merchants Section */}
      <section className="mb-24">
        <h3 className="text-2xl font-light text-white mb-8 border-b border-stone-800 pb-2">Saved Merchants</h3>
        <p className="text-sm text-stone-text mb-6">
          Manage your frequently used merchants. These will appear as suggestions when adding transactions.
        </p>

        <form onSubmit={handleAddMerchant} className="mb-6 flex gap-3">
          <input
            type="text"
            value={newMerchantName}
            onChange={(e) => setNewMerchantName(e.target.value)}
            placeholder="Enter merchant name"
            className="flex-1 px-4 py-3 bg-surface-dark border border-stone-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <button
            type="submit"
            disabled={loading || !newMerchantName.trim()}
            className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            Add
          </button>
        </form>

        <div className="space-y-2">
          {merchants.length === 0 ? (
            <p className="text-sm text-stone-text text-center py-8">
              No saved merchants yet. Add one above!
            </p>
          ) : (
            merchants.map((merchant) => (
              <div
                key={merchant.id}
                className="flex items-center justify-between p-4 bg-surface-dark border border-stone-700 rounded-lg group hover:border-primary/50 transition-colors"
              >
                <span className="text-white">{merchant.name}</span>
                <button
                  onClick={() => handleDeleteMerchant(merchant.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-900/20 rounded-lg transition-all text-red-500"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Custom Categories Section */}
      <section className="mb-24">
        <h3 className="text-2xl font-light text-white mb-8 border-b border-stone-800 pb-2">Custom Categories</h3>
        <p className="text-sm text-stone-text mb-6">
          Create custom categories for your transactions. Global categories cannot be deleted.
        </p>

        <form onSubmit={handleAddCategory} className="mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name (e.g., hobbies)"
              className="px-4 py-3 bg-surface-dark border border-stone-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <input
              type="text"
              value={newCategoryDisplayName}
              onChange={(e) => setNewCategoryDisplayName(e.target.value)}
              placeholder="Display name (e.g., Hobbies)"
              className="px-4 py-3 bg-surface-dark border border-stone-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newCategoryIcon}
              onChange={(e) => setNewCategoryIcon(e.target.value)}
              placeholder="Icon name (Material Symbol)"
              className="px-4 py-3 bg-surface-dark border border-stone-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <input
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              className="px-4 py-3 bg-surface-dark border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-12"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newCategoryName.trim() || !newCategoryDisplayName.trim()}
            className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            Add Category
          </button>
        </form>

        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-sm text-stone-text text-center py-8">
              No categories available
            </p>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-surface-dark border border-stone-700 rounded-lg group hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    <span className="material-symbols-outlined text-sm">{category.icon}</span>
                  </div>
                  <div>
                    <span className="text-white font-medium">{category.displayName}</span>
                    {category.isCustom && (
                      <span className="ml-2 text-xs text-stone-text">(Custom)</span>
                    )}
                  </div>
                </div>
                {category.isCustom && (
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-900/20 rounded-lg transition-all text-red-500"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Logout Section */}
      <section className="mb-24">
        <h3 className="text-2xl font-light text-white mb-8 border-b border-stone-800 pb-2">Account</h3>
        <button
          onClick={handleLogout}
          className="px-8 py-3 rounded-full bg-stone-800 text-white font-medium hover:bg-red-700 transition-all"
        >
          Sign Out
        </button>
      </section>

      <footer className="py-12 text-center border-t border-stone-800 mt-auto opacity-50">
        <p className="text-xs text-stone-text">
          Fincurio MVP - Phase 1
        </p>
      </footer>
    </div>
  );
};

export default Settings;
