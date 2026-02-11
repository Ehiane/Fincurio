import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../src/hooks/useAuth';
import { userApi } from '../src/api/user.api';
import { merchantsApi, Merchant } from '../src/api/merchants.api';
import { categoriesApi, Category, CreateCategoryRequest } from '../src/api/categories.api';
import { formatCurrency, parseCurrency, toCurrencyDisplay } from '../src/utils/currencyFormatter';

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
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const iconDropdownRef = useRef<HTMLDivElement>(null);

  // Close icon dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (iconDropdownRef.current && !iconDropdownRef.current.contains(e.target as Node)) {
        setIconDropdownOpen(false);
        setIconSearch('');
      }
    };
    if (iconDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [iconDropdownOpen]);

  const availableIcons = [
    { name: 'shopping_bag', label: 'Shopping' },
    { name: 'restaurant', label: 'Food' },
    { name: 'local_cafe', label: 'Café' },
    { name: 'fastfood', label: 'Fast Food' },
    { name: 'local_bar', label: 'Drinks' },
    { name: 'grocery', label: 'Groceries' },
    { name: 'commute', label: 'Transport' },
    { name: 'directions_car', label: 'Car' },
    { name: 'flight', label: 'Travel' },
    { name: 'hotel', label: 'Hotel' },
    { name: 'home', label: 'Home' },
    { name: 'apartment', label: 'Rent' },
    { name: 'bolt', label: 'Utilities' },
    { name: 'wifi', label: 'Internet' },
    { name: 'phone_iphone', label: 'Phone' },
    { name: 'laptop_mac', label: 'Tech' },
    { name: 'devices', label: 'Devices' },
    { name: 'headphones', label: 'Audio' },
    { name: 'videogame_asset', label: 'Gaming' },
    { name: 'sports_esports', label: 'Esports' },
    { name: 'fitness_center', label: 'Gym' },
    { name: 'spa', label: 'Wellness' },
    { name: 'self_improvement', label: 'Mindfulness' },
    { name: 'health_and_safety', label: 'Health' },
    { name: 'medication', label: 'Medicine' },
    { name: 'school', label: 'Education' },
    { name: 'menu_book', label: 'Books' },
    { name: 'payments', label: 'Salary' },
    { name: 'account_balance', label: 'Bank' },
    { name: 'savings', label: 'Savings' },
    { name: 'trending_up', label: 'Investment' },
    { name: 'credit_card', label: 'Card' },
    { name: 'receipt_long', label: 'Bills' },
    { name: 'music_note', label: 'Music' },
    { name: 'movie', label: 'Movies' },
    { name: 'theater_comedy', label: 'Culture' },
    { name: 'sports_soccer', label: 'Sports' },
    { name: 'park', label: 'Outdoors' },
    { name: 'pets', label: 'Pets' },
    { name: 'child_care', label: 'Kids' },
    { name: 'card_giftcard', label: 'Gifts' },
    { name: 'dry_cleaning', label: 'Clothing' },
    { name: 'checkroom', label: 'Wardrobe' },
    { name: 'volunteer_activism', label: 'Charity' },
    { name: 'work', label: 'Work' },
    { name: 'handyman', label: 'Repairs' },
    { name: 'local_parking', label: 'Parking' },
    { name: 'local_gas_station', label: 'Gas' },
  ];

  const colorPalette = [
    { color: '#E6501B', name: 'Orange' },
    { color: '#280905', name: 'Maroon' },
    { color: '#10B981', name: 'Emerald' },
    { color: '#F59E0B', name: 'Amber' },
    { color: '#8B5CF6', name: 'Violet' },
    { color: '#3B82F6', name: 'Blue' },
    { color: '#EC4899', name: 'Pink' },
    { color: '#14B8A6', name: 'Teal' },
    { color: '#6B7280', name: 'Gray' },
    { color: '#EF4444', name: 'Red' },
    { color: '#06B6D4', name: 'Cyan' },
    { color: '#84CC16', name: 'Lime' },
    { color: '#A855F7', name: 'Purple' },
    { color: '#F97316', name: 'Tangerine' },
    { color: '#0EA5E9', name: 'Sky' },
    { color: '#D946EF', name: 'Fuchsia' },
  ];

  const filteredIcons = availableIcons.filter(
    (icon) =>
      icon.name.toLowerCase().includes(iconSearch.toLowerCase()) ||
      icon.label.toLowerCase().includes(iconSearch.toLowerCase())
  );

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setFinancialIntention(user.financialIntention || '');
      setCurrency(user.preferences?.currency || 'USD');
      setTimezone(user.preferences?.timezone || 'UTC');
      setMonthlyBudgetGoal(user.preferences?.monthlyBudgetGoal ? toCurrencyDisplay(user.preferences.monthlyBudgetGoal) : '');

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
        monthlyBudgetGoal: monthlyBudgetGoal ? parseCurrency(monthlyBudgetGoal) : undefined,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 pb-24 animate-in fade-in duration-700">
      <section className="mb-12 md:mb-20 text-center md:text-left">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-4xl lg:text-4xl font-light tracking-tight mb-4">Account Settings</h2>
        <p className="text-base sm:text-base md:text-lg text-stone-text font-light max-w-md mx-auto md:mx-0">
          Manage your personal details and preferences.
        </p>
      </section>

      {error && (
        <div className="mb-8 bg-red-50 bg-red-50 border border-red-200 border-red-200 rounded-2xl p-4 text-red-800 text-red-800 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-8 bg-green-50 bg-green-50 border border-green-200 border-green-200 rounded-2xl p-4 text-green-800 text-green-800 text-sm">
          {success}
        </div>
      )}

      {/* Profile Section */}
      <section className="mb-24 text-center md:text-left">
        <h3 className="font-serif text-2xl font-light text-secondary mb-8 border-b border-stone-300 pb-2">Profile</h3>
        <div className="mb-6">
          <div className="text-sm text-stone-text mb-1">Email</div>
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
            <div className="text-lg text-secondary">{user?.email}</div>
            {!user?.isEmailVerified && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                Not Verified
              </span>
            )}
            {user?.isEmailVerified && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Verified
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-stone-text mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-secondary placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Alex"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-text mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-secondary placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
              className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-secondary placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-serif italic"
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
      <section className="mb-24 text-center md:text-left">
        <h3 className="font-serif text-2xl font-light text-secondary mb-8 border-b border-stone-300 pb-2">Preferences</h3>
        <form onSubmit={handleUpdatePreferences} className="space-y-6">
          <div>
            <label className="block text-sm text-stone-text mb-2">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
              className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-lg">
                {currencies.find((c) => c.code === currency)?.symbol}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={monthlyBudgetGoal}
                onChange={(e) => setMonthlyBudgetGoal(formatCurrency(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-lg text-secondary placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="0.00"
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
      <section className="mb-24 text-center md:text-left">
        <h3 className="font-serif text-2xl font-light text-secondary mb-8 border-b border-stone-300 pb-2">Saved Merchants</h3>
        <p className="text-sm text-stone-text mb-6">
          Manage your frequently used merchants. These will appear as suggestions when adding transactions.
        </p>

        <form onSubmit={handleAddMerchant} className="mb-6 flex gap-3">
          <input
            type="text"
            value={newMerchantName}
            onChange={(e) => setNewMerchantName(e.target.value)}
            placeholder="Enter merchant name"
            className="flex-1 px-4 py-3 bg-white border border-stone-300 rounded-lg text-secondary placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                className="flex items-center justify-between p-4 bg-white border border-stone-300 rounded-lg group hover:border-primary/50 transition-colors"
              >
                <span className="text-secondary">{merchant.name}</span>
                <button
                  onClick={() => handleDeleteMerchant(merchant.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all text-red-500"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Custom Categories Section */}
      <section className="mb-24 text-center md:text-left">
        <h3 className="font-serif text-2xl font-light text-secondary mb-8 border-b border-stone-300 pb-2">Custom Categories</h3>
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
              className="px-4 py-3 bg-white border border-stone-300 rounded-lg text-secondary placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <input
              type="text"
              value={newCategoryDisplayName}
              onChange={(e) => setNewCategoryDisplayName(e.target.value)}
              placeholder="Display name (e.g., Hobbies)"
              className="px-4 py-3 bg-white border border-stone-300 rounded-lg text-secondary placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          {/* Icon Picker */}
          <div>
            <label className="block text-sm text-stone-text mb-2">Icon</label>
            <div className="relative" ref={iconDropdownRef}>
              <button
                type="button"
                onClick={() => setIconDropdownOpen(!iconDropdownOpen)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-stone-300 rounded-lg text-secondary hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${newCategoryColor}20`, color: newCategoryColor }}
                >
                  <span className="material-symbols-outlined text-sm">{newCategoryIcon}</span>
                </span>
                <span className="flex-1 text-left">
                  {availableIcons.find((i) => i.name === newCategoryIcon)?.label || newCategoryIcon}
                </span>
                <span className="material-symbols-outlined text-stone-400 text-sm transition-transform" style={{ transform: iconDropdownOpen ? 'rotate(180deg)' : '' }}>
                  expand_more
                </span>
              </button>

              {iconDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-stone-100">
                    <input
                      type="text"
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      placeholder="Search icons..."
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-secondary placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-primary/30"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto p-2 grid grid-cols-4 gap-1">
                    {filteredIcons.map((icon) => (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => {
                          setNewCategoryIcon(icon.name);
                          setIconDropdownOpen(false);
                          setIconSearch('');
                        }}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all text-center ${
                          newCategoryIcon === icon.name
                            ? 'bg-primary/10 ring-1 ring-primary/30'
                            : 'hover:bg-stone-100'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{ color: newCategoryIcon === icon.name ? newCategoryColor : '#6b6460' }}
                        >
                          {icon.name}
                        </span>
                        <span className="text-[10px] text-stone-text leading-tight truncate w-full">{icon.label}</span>
                      </button>
                    ))}
                    {filteredIcons.length === 0 && (
                      <p className="col-span-4 text-center text-sm text-stone-400 py-4">No icons found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-sm text-stone-text mb-2">Color</label>
            <div className="p-4 bg-white border border-stone-300 rounded-lg">
              <div className="flex flex-wrap gap-2 mb-3">
                {colorPalette.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setNewCategoryColor(c.color)}
                    className={`group relative w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 ${
                      newCategoryColor === c.color
                        ? 'ring-2 ring-offset-2 ring-offset-white ring-primary scale-110'
                        : 'hover:ring-2 hover:ring-offset-1 hover:ring-offset-white hover:ring-stone-300'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  >
                    {newCategoryColor === c.color && (
                      <span className="material-symbols-outlined text-white text-sm absolute inset-0 flex items-center justify-center drop-shadow">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-8 h-8 rounded-full border-0 cursor-pointer p-0 overflow-hidden"
                  style={{ appearance: 'none', WebkitAppearance: 'none' }}
                />
                <span className="text-xs text-stone-text">Custom color</span>
                <span className="ml-auto text-xs font-mono text-stone-400 uppercase">{newCategoryColor}</span>
              </div>
            </div>
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
                className="flex items-center justify-between p-4 bg-white border border-stone-300 rounded-lg group hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    <span className="material-symbols-outlined text-sm">{category.icon}</span>
                  </div>
                  <div>
                    <span className="text-secondary font-medium">{category.displayName}</span>
                    {category.isCustom && (
                      <span className="ml-2 text-xs text-stone-text">(Custom)</span>
                    )}
                  </div>
                </div>
                {category.isCustom && (
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all text-red-500"
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
      <section className="mb-24 text-center md:text-left">
        <h3 className="font-serif text-2xl font-light text-secondary mb-8 border-b border-stone-300 pb-2">Account</h3>
        <button
          onClick={handleLogout}
          className="px-8 py-3 rounded-full bg-secondary text-white font-medium hover:bg-red-700 transition-all mx-auto md:mx-0 block md:inline-block"
        >
          Sign Out
        </button>
      </section>

      <footer className="py-12 text-center border-t border-stone-300 mt-auto opacity-50">
        <p className="text-xs text-stone-text">
          Fincurio MVP - Phase 1
        </p>
      </footer>
    </div>
  );
};

export default Settings;
