import React, { useState, useEffect } from 'react';
import { insightsApi, MonthlyInsightResponse } from '../src/api/insights.api';

const Reflections: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<MonthlyInsightResponse | null>(null);

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  useEffect(() => {
    fetchMonthlyInsights();
  }, [selectedYear, selectedMonth]);

  const fetchMonthlyInsights = async () => {
    try {
      setLoading(true);
      const insights = await insightsApi.getMonthlyInsights(selectedYear, selectedMonth);
      setData(insights);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleMonthChange = (monthIndex: number) => {
    setSelectedMonth(monthIndex + 1);
    setShowMonthPicker(false);
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    setSelectedYear(direction === 'prev' ? selectedYear - 1 : selectedYear + 1);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 md:px-8 md:py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-white/5 rounded-lg"></div>
          <div className="h-64 bg-white/5 rounded-lg"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 md:px-8 md:py-16">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={fetchMonthlyInsights}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 lg:py-16 flex flex-col gap-8 md:gap-12 animate-in fade-in duration-700">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
            Monthly Reflections
          </h2>
          <p className="text-gray-500 dark:text-stone-text text-lg max-w-xl leading-relaxed">
            Review your spending patterns for {data.period.displayName}. Understand where your resources are flowing.
          </p>
        </div>

        {/* Month/Year Selector */}
        <div className="flex flex-wrap gap-3 relative">
          <button
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="flex items-center gap-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 pl-5 pr-3 py-2 text-sm font-medium shadow-sm hover:border-primary transition-colors"
          >
            <span>{data.period.displayName}</span>
            <span className="material-symbols-outlined text-gray-400">keyboard_arrow_down</span>
          </button>

          {showMonthPicker && (
            <div className="absolute top-12 left-0 z-10 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg p-4 w-72">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => handleYearChange('prev')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="font-medium">{selectedYear}</span>
                <button
                  onClick={() => handleYearChange('next')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {months.map((month, idx) => (
                  <button
                    key={month}
                    onClick={() => handleMonthChange(idx)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      idx + 1 === selectedMonth && selectedYear === currentDate.getFullYear()
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {month.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2 p-6 rounded-2xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5">
          <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-stone-text font-semibold">
            Income
          </span>
          <span className="font-serif text-3xl text-emerald-500">
            ${data.summary.totalIncome.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-6 rounded-2xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5">
          <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-stone-text font-semibold">
            Expenses
          </span>
          <span className="font-serif text-3xl text-gray-900 dark:text-white">
            ${data.summary.totalExpenses.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-6 rounded-2xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5">
          <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-stone-text font-semibold">
            Net Balance
          </span>
          <span className={`font-serif text-3xl ${
            data.summary.netBalance >= 0 ? 'text-emerald-500' : 'text-red-500'
          }`}>
            ${Math.abs(data.summary.netBalance).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Category Breakdown */}
      {data.categoryBreakdown.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between border-b border-gray-200 dark:border-white/10 pb-4">
            <span className="text-sm uppercase tracking-widest text-gray-500 dark:text-stone-text font-semibold">
              Category Breakdown
            </span>
          </div>

          {data.categoryBreakdown.map((item) => (
            <ReflectionCard
              key={item.category.id}
              icon={item.category.icon}
              title={item.category.displayName}
              subtitle={`${item.transactionCount} transaction${item.transactionCount !== 1 ? 's' : ''}`}
              amount={item.amount}
              percentage={item.percentOfTotal}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-500">
          <p>No expenses recorded for this month</p>
        </div>
      )}

      <div className="mt-8 flex justify-center text-center">
        <p className="font-serif italic text-gray-400 dark:text-stone-text opacity-60 max-w-md">
          "Do not save what is left after spending, but spend what is left after saving."
        </p>
      </div>
    </div>
  );
};

const ReflectionCard: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  amount: number;
  percentage: number;
}> = ({ icon, title, subtitle, amount, percentage }) => (
  <div className="group relative flex flex-col overflow-hidden rounded-[18px] bg-white dark:bg-surface-dark p-1 shadow-sm transition-all hover:bg-white dark:hover:bg-[#32322f]">
    <div className="flex items-center justify-between p-5">
      <div className="flex items-center gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-[#3d3335] text-gray-600 dark:text-white group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          <span className="text-sm text-gray-500 dark:text-stone-text">{subtitle}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="font-serif text-2xl text-gray-900 dark:text-white">
          ${amount.toLocaleString()}
        </span>
        <span className="text-xs font-medium text-stone-text">
          {percentage.toFixed(1)}% of total
        </span>
      </div>
    </div>
    <div className="h-1 bg-gray-100 dark:bg-[#3d3335]">
      <div
        className="h-full bg-primary transition-all duration-500"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

export default Reflections;
