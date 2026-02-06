import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/hooks/useAuth';
import { userApi } from '../src/api/user.api';

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

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setFinancialIntention(user.financialIntention || '');
      setCurrency(user.preferences?.currency || 'USD');
      setTimezone(user.preferences?.timezone || 'UTC');
      setMonthlyBudgetGoal(user.preferences?.monthlyBudgetGoal?.toString() || '');
    }
  }, [user]);

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

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
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
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-3 bg-surface-dark border border-stone-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="America/New_York"
            />
            <p className="text-xs text-stone-text mt-2">E.g., America/New_York, Europe/London, Asia/Tokyo</p>
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
