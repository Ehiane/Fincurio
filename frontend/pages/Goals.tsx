import React, { useState, useEffect } from 'react';
import { goalsApi, Goal, GoalSummary, CreateGoalRequest } from '../src/api/goals.api';
import { categoriesApi, Category } from '../src/api/categories.api';
import { transactionsApi, Transaction } from '../src/api/transactions.api';
import { formatCurrency, parseCurrency, toCurrencyDisplay } from '../src/utils/currencyFormatter';
import { getCached, setCache, invalidateCache } from '../src/utils/apiCache';
import EditorialLoader from '../src/components/EditorialLoader';
import StaggerChildren from '../src/components/StaggerChildren';

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<GoalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async (skipCache = false) => {
    try {
      setLoading(true);
      const cached = !skipCache ? getCached<{ goals: Goal[]; summary: GoalSummary }>('goals') : null;
      if (cached) {
        setGoals(cached.goals);
        setSummary(cached.summary);
        setLoading(false);
        return;
      }
      const data = await goalsApi.getAll();
      setGoals(data.goals);
      setSummary(data.summary);
      setCache('goals', data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGoal(null);
    setShowModal(true);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await goalsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      invalidateCache('goals');
      await fetchGoals(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete goal');
    }
  };

  const handleModalClose = async (refresh: boolean) => {
    setShowModal(false);
    setEditingGoal(null);
    if (refresh) {
      invalidateCache('goals');
      await fetchGoals(true);
    }
  };

  const budgetGoals = goals.filter(g => g.type === 'budget');
  const savingsGoals = goals.filter(g => g.type === 'savings');

  return (
    <EditorialLoader variant="journal" isLoading={loading}>
      {error ? (
        <div className="max-w-[1000px] mx-auto px-6 py-10 lg:px-12 lg:py-16">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => fetchGoals()}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <StaggerChildren className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 lg:py-16">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-12 md:mb-16">
            <div className="flex flex-col gap-3 max-w-lg">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-medium leading-tight tracking-tight text-secondary">
                Financial <br />
                <span className="italic text-stone-text">Goals</span>
              </h2>
              <p className="text-stone-text text-sm md:text-base font-light max-w-xs pl-1">
                Set targets, track progress, and stay intentional with your money.
              </p>
            </div>

            {summary && summary.totalGoals > 0 && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block size-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-stone-text">{summary.onTrackCount} on track</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block size-2.5 rounded-full bg-primary"></span>
                  <span className="text-stone-text">{summary.offTrackCount} needs attention</span>
                </div>
              </div>
            )}
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 opacity-20">
                <span className="material-symbols-outlined" style={{ fontSize: '72px' }}>flag</span>
              </div>
              <h3 className="text-2xl font-serif mb-2 text-secondary">No goals yet</h3>
              <p className="text-stone-text mb-8">Set a spending budget or savings target to start tracking your progress.</p>
              <button
                onClick={handleAdd}
                className="px-8 py-3 bg-primary text-white rounded-full hover:bg-red-700 transition-colors"
              >
                Add Your First Goal
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-12 pb-24">
              {budgetGoals.length > 0 && (
                <GoalSection title="Budget Goals" subtitle="Category spending limits" goals={budgetGoals} onEdit={handleEdit} onDelete={setDeleteTarget} onDetail={setDetailGoal} />
              )}
              {savingsGoals.length > 0 && (
                <GoalSection title="Savings Goals" subtitle="Targets you're building toward" goals={savingsGoals} onEdit={handleEdit} onDelete={setDeleteTarget} onDetail={setDetailGoal} />
              )}
            </div>
          )}
        </StaggerChildren>
      )}

      {/* FAB */}
      <button
        onClick={handleAdd}
        className="fixed bottom-8 right-8 md:bottom-12 md:right-12 size-16 bg-primary hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 group z-50"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">
          add
        </span>
      </button>

      {showModal && (
        <GoalModal goal={editingGoal} onClose={handleModalClose} />
      )}

      {detailGoal && (
        <GoalDetailModal goal={detailGoal} onClose={() => setDetailGoal(null)} />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          goalName={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </EditorialLoader>
  );
};

/* ─── Goal Section ─── */

const GoalSection: React.FC<{
  title: string;
  subtitle: string;
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onDetail: (goal: Goal) => void;
}> = ({ title, subtitle, goals, onEdit, onDelete, onDetail }) => (
  <div>
    <div className="mb-6">
      <h3 className="text-xl font-serif font-medium text-secondary">{title}</h3>
      <p className="text-stone-text text-sm font-light">{subtitle}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {goals.map(goal => (
        <GoalCard key={goal.id} goal={goal} onEdit={() => onEdit(goal)} onDelete={() => onDelete(goal)} onClick={() => onDetail(goal)} />
      ))}
    </div>
  </div>
);

/* ─── Goal Card ─── */

const GoalCard: React.FC<{
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}> = ({ goal, onEdit, onDelete, onClick }) => {
  const isBudget = goal.type === 'budget';
  const overBudget = isBudget && !goal.isOnTrack;
  const progressColor = overBudget ? 'bg-primary' : 'bg-emerald-500';
  const percent = Math.min(goal.percentComplete, 100);

  const statusText = isBudget
    ? (goal.isOnTrack ? 'Under budget' : 'Over budget')
    : (goal.isOnTrack ? 'On track' : 'Behind pace');

  const statusColor = goal.isOnTrack
    ? 'text-emerald-600'
    : 'text-primary';

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/80 border border-stone-200/60 rounded-2xl p-5 hover:shadow-lg hover:border-stone-300/80 transition-all duration-300 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center size-10 rounded-full shrink-0 ${isBudget ? 'bg-stone-100 text-stone-text' : 'bg-emerald-50 text-emerald-600'}`}>
            <span className="material-symbols-outlined text-xl">
              {isBudget ? (goal.category?.icon || 'account_balance_wallet') : 'savings'}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-secondary text-sm leading-tight">{goal.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center rounded-full border px-2 py-0 text-[10px] font-medium ${
                isBudget ? 'border-stone-300 text-stone-text' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}>
                {isBudget ? 'Budget' : 'Savings'}
              </span>
              {goal.periodLabel && (
                <span className="text-[10px] text-stone-400">{goal.periodLabel}</span>
              )}
            </div>
          </div>
        </div>

        {/* Edit/Delete */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-sm text-stone-400">edit</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-sm text-red-400">delete</span>
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-3">
        <span className="text-2xl font-serif font-medium text-secondary">
          ${goal.currentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-stone-text text-sm ml-1">
          of ${goal.targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${statusColor}`}>{statusText}</span>
        <span className="text-xs text-stone-400">{goal.percentComplete}%</span>
      </div>
    </div>
  );
};

/* ─── Goal Modal ─── */

const GoalModal: React.FC<{
  goal: Goal | null;
  onClose: (refresh: boolean) => void;
}> = ({ goal, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [name, setName] = useState(goal?.name || '');
  const [type, setType] = useState<'budget' | 'savings'>(goal?.type || 'budget');
  const [categoryId, setCategoryId] = useState(goal?.categoryId || '');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(goal?.period as 'daily' | 'weekly' | 'monthly' | 'yearly' || 'monthly');
  const [targetAmount, setTargetAmount] = useState(goal ? toCurrencyDisplay(goal.targetAmount) : '');
  const [deadline, setDeadline] = useState(goal?.deadline?.split('T')[0] || '');
  const [savingsMode, setSavingsMode] = useState<'one-time' | 'recurring'>(
    goal?.type === 'savings' && goal?.period ? 'recurring' : 'one-time'
  );
  const [startDate, setStartDate] = useState(
    goal?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setDataLoading(true);
        const cached = getCached<Category[]>('categories');
        if (cached) {
          setCategories(cached);
        } else {
          const data = await categoriesApi.getAll();
          setCategories(data);
          setCache('categories', data);
        }
      } catch {
        setError('Failed to load categories');
      } finally {
        setDataLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseCurrency(targetAmount);
    if (!name || amount <= 0) {
      setError('Please fill in all required fields');
      return;
    }
    if (type === 'budget' && !categoryId) {
      setError('Please select a category for your budget goal');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: CreateGoalRequest = {
        name,
        type,
        targetAmount: amount,
        categoryId: type === 'budget' ? categoryId : undefined,
        period: type === 'budget' ? period : (type === 'savings' && savingsMode === 'recurring' ? period : undefined),
        deadline: type === 'savings' && savingsMode === 'one-time' && deadline ? deadline : undefined,
        startDate,
      };

      if (goal) {
        await goalsApi.update(goal.id, payload);
      } else {
        await goalsApi.create(payload);
      }
      onClose(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories to expense type for budget goals
  const expenseCategories = categories.filter(c => !('type' in c) || true);

  // Group categories by categoryGroup for grouped pickers
  const groupedExpenseCategories = expenseCategories.reduce<Record<string, Category[]>>((acc, cat) => {
    const group = cat.categoryGroup || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {});
  const sortedExpenseGroups = Object.keys(groupedExpenseCategories).sort((a, b) =>
    a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)
  );

  return (
    <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-background-light rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border border-stone-300/40 animate-in slide-in-from-bottom-3 duration-300">
        {/* Header */}
        <div className="px-5 sm:px-8 pt-5 sm:pt-8 pb-4 sm:pb-6 border-b border-stone-300/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-serif font-medium text-secondary tracking-tight">
              {goal ? 'Edit Goal' : 'New Goal'}
            </h3>
            <button
              onClick={() => onClose(false)}
              className="p-2 hover:bg-stone-200/60 rounded-full transition-colors text-stone-text hover:text-secondary"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-8 py-5 sm:py-8 space-y-4 sm:space-y-7">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-300 border-t-primary"></div>
            </div>
          ) : (
            <>
              {/* Type Toggle */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setType('budget')}
                  className={`flex-1 py-2.5 sm:py-3.5 rounded-full font-medium text-sm tracking-wide transition-all duration-200 ${
                    type === 'budget'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-surface-dark/50 text-stone-text hover:bg-surface-dark'
                  }`}
                >
                  Budget
                </button>
                <button
                  type="button"
                  onClick={() => setType('savings')}
                  className={`flex-1 py-2.5 sm:py-3.5 rounded-full font-medium text-sm tracking-wide transition-all duration-200 ${
                    type === 'savings'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-surface-dark/50 text-stone-text hover:bg-surface-dark'
                  }`}
                >
                  Savings
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={type === 'budget' ? 'e.g. Dining Out Budget' : 'e.g. Emergency Fund'}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-stone-300/60 rounded-xl text-secondary text-sm sm:text-base placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>

              {/* Budget-specific fields */}
              {type === 'budget' && (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-stone-300/60 rounded-xl text-secondary text-sm sm:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    >
                      <option value="">Select a category</option>
                      {sortedExpenseGroups.map((group) => (
                        <optgroup key={group} label={group}>
                          {groupedExpenseCategories[group].map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.displayName}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
                      Period
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPeriod(p)}
                          className={`py-2.5 rounded-xl font-medium text-sm transition-all duration-200 border ${
                            period === p
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-stone-300/60 text-stone-text hover:border-stone-400'
                          }`}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Savings-specific fields */}
              {type === 'savings' && (
                <>
                  {/* Savings mode toggle */}
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
                      Savings Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSavingsMode('one-time')}
                        className={`py-2.5 rounded-xl font-medium text-sm transition-all duration-200 border ${
                          savingsMode === 'one-time'
                            ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600'
                            : 'border-stone-300/60 text-stone-text hover:border-stone-400'
                        }`}
                      >
                        One-time Target
                      </button>
                      <button
                        type="button"
                        onClick={() => setSavingsMode('recurring')}
                        className={`py-2.5 rounded-xl font-medium text-sm transition-all duration-200 border ${
                          savingsMode === 'recurring'
                            ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600'
                            : 'border-stone-300/60 text-stone-text hover:border-stone-400'
                        }`}
                      >
                        Recurring
                      </button>
                    </div>
                  </div>

                  {savingsMode === 'one-time' ? (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
                        Deadline <span className="normal-case tracking-normal font-normal text-stone-400">(optional)</span>
                      </label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-stone-300/60 rounded-xl text-secondary text-sm sm:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
                        Period
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPeriod(p)}
                            className={`py-2.5 rounded-xl font-medium text-sm transition-all duration-200 border ${
                              period === p
                                ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600'
                                : 'border-stone-300/60 text-stone-text hover:border-stone-400'
                            }`}
                          >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Target Amount */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
                  Target Amount
                  {type === 'savings' && savingsMode === 'recurring' && (
                    <span className="normal-case tracking-normal font-normal text-stone-400">
                      {' '}(per {period})
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(formatCurrency(e.target.value))}
                  required
                  placeholder="0.00"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-stone-300/60 rounded-xl text-secondary placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-serif text-base sm:text-lg"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-stone-300/60 rounded-xl text-secondary text-sm sm:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 sm:gap-4 pt-2 border-t border-stone-300/40">
                <button
                  type="button"
                  onClick={() => onClose(false)}
                  disabled={loading}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full border border-stone-300/60 text-stone-text font-medium text-sm tracking-wide hover:bg-white/60 hover:text-secondary transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-secondary text-background-light font-medium text-sm tracking-wide hover:bg-secondary/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

/* ─── Goal Detail Modal ─── */

function getPeriodRange(period?: string): { start: string; end: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  switch (period) {
    case 'daily':
      return { start: fmt(now), end: fmt(now) };
    case 'weekly': {
      const day = now.getDay();
      const sun = new Date(now); sun.setDate(now.getDate() - day);
      const sat = new Date(sun); sat.setDate(sun.getDate() + 6);
      return { start: fmt(sun), end: fmt(sat) };
    }
    case 'yearly':
      return { start: `${now.getFullYear()}-01-01`, end: `${now.getFullYear()}-12-31` };
    default: { // monthly
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: fmt(first), end: fmt(last) };
    }
  }
}

const GoalDetailModal: React.FC<{
  goal: Goal;
  onClose: () => void;
}> = ({ goal, onClose }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasLinkedTxns, setHasLinkedTxns] = useState(false);

  const isBudget = goal.type === 'budget';
  const isRecurringSavings = goal.type === 'savings' && !!goal.period;
  const overBudget = isBudget && !goal.isOnTrack;
  const accentColor = isBudget ? (overBudget ? 'primary' : 'stone') : 'emerald';

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        let startDate: string;
        let endDate: string;

        if (isBudget || isRecurringSavings) {
          const range = getPeriodRange(goal.period);
          startDate = range.start;
          endDate = range.end;
        } else {
          // one-time savings — from start date to now
          startDate = goal.startDate.split('T')[0];
          endDate = new Date().toISOString().split('T')[0];
        }

        const params: any = { startDate, endDate, pageSize: 200 };
        if (isBudget && goal.categoryId) {
          params.categoryId = goal.categoryId;
          params.type = 'expense';
        }

        const data = await transactionsApi.getAll(params);
        let txns = data.transactions;

        // For savings goals, check if there are linked transactions
        if (!isBudget) {
          const linked = txns.filter(t => t.goalId === goal.id);
          if (linked.length > 0) {
            txns = linked;
            setHasLinkedTxns(true);
          } else {
            setHasLinkedTxns(false);
          }
        }

        // Sort most recent first
        setTransactions(txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (err: any) {
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [goal.id]);

  // For savings goals, split into income vs expenses for the summary
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const percent = Math.min(goal.percentComplete, 100);
  const progressColor = isBudget
    ? (overBudget ? 'bg-primary' : 'bg-emerald-500')
    : 'bg-emerald-500';

  const statusText = isBudget
    ? (goal.isOnTrack ? 'Under budget' : 'Over budget')
    : (goal.isOnTrack ? 'On track' : 'Behind pace');

  return (
    <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-background-light rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col border border-stone-300/40 animate-in slide-in-from-bottom-3 duration-300">
        {/* Header */}
        <div className="px-5 sm:px-8 pt-5 sm:pt-8 pb-4 sm:pb-6 border-b border-stone-300/50 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex items-center justify-center size-11 rounded-full shrink-0 ${isBudget ? 'bg-stone-100 text-stone-text' : 'bg-emerald-50 text-emerald-600'}`}>
                <span className="material-symbols-outlined text-xl">
                  {isBudget ? (goal.category?.icon || 'account_balance_wallet') : 'savings'}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-serif font-medium text-secondary tracking-tight truncate">
                  {goal.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0 text-[10px] font-medium ${
                    isBudget ? 'border-stone-300 text-stone-text' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}>
                    {isBudget ? 'Budget' : 'Savings'}
                  </span>
                  {goal.periodLabel && (
                    <span className="text-xs text-stone-400">{goal.periodLabel}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-200/60 rounded-full transition-colors text-stone-text hover:text-secondary shrink-0"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Progress summary */}
          <div className="mt-5">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-2xl font-serif font-medium text-secondary">
                  ${goal.currentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-stone-text text-sm ml-1.5">
                  of ${goal.targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <span className={`text-sm font-medium ${goal.isOnTrack ? 'text-emerald-600' : 'text-primary'}`}>
                {statusText}
              </span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-stone-400">
                ${goal.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining
              </span>
              <span className="text-xs text-stone-400">{goal.percentComplete}%</span>
            </div>

            {/* Savings breakdown */}
            {!isBudget && !loading && transactions.length > 0 && (
              <div className="flex gap-4 mt-3 pt-3 border-t border-stone-200/60">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="inline-block size-2 rounded-full bg-emerald-400"></span>
                  <span className="text-stone-text">Income:</span>
                  <span className="font-medium text-secondary">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="inline-block size-2 rounded-full bg-primary/70"></span>
                  <span className="text-stone-text">Expenses:</span>
                  <span className="font-medium text-secondary">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction list */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-4 sm:py-6">
          <h4 className="text-xs uppercase tracking-widest text-stone-text font-semibold mb-3">
            {isBudget ? 'Expenses' : (hasLinkedTxns ? 'Linked Transactions' : 'All Transactions')}
            {!loading && <span className="ml-1.5 font-normal text-stone-400">({transactions.length})</span>}
          </h4>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-stone-300 border-t-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm text-center">
              {error}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-4xl text-stone-300 mb-2 block">receipt_long</span>
              <p className="text-stone-text text-sm">No transactions for this period yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.map((txn) => {
                const txnDate = new Date(txn.date);
                const isExpense = txn.type === 'expense';
                return (
                  <div
                    key={txn.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/60 transition-colors"
                  >
                    <div className={`flex items-center justify-center size-9 rounded-full shrink-0 ${isExpense ? 'bg-stone-100' : 'bg-emerald-50'}`}>
                      <span className={`material-symbols-outlined text-base ${isExpense ? 'text-stone-text' : 'text-emerald-600'}`}>
                        {txn.category?.icon || (isExpense ? 'shopping_bag' : 'payments')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary truncate">{txn.merchant}</p>
                      <p className="text-[11px] text-stone-400">
                        {txnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {txn.category?.displayName && ` · ${txn.category.displayName}`}
                      </p>
                    </div>
                    <span className={`text-sm font-medium tabular-nums ${isExpense ? 'text-secondary' : 'text-emerald-600'}`}>
                      {isExpense ? '−' : '+'}${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-8 py-4 border-t border-stone-300/50 shrink-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 rounded-full border border-stone-300/60 text-stone-text font-medium text-sm tracking-wide hover:bg-white/60 hover:text-secondary transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete Confirm ─── */

const DeleteConfirmDialog: React.FC<{
  goalName: string;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ goalName, onCancel, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-background-light rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-stone-300/40 animate-in slide-in-from-bottom-3 duration-300">
        <h3 className="text-lg font-serif font-medium text-secondary mb-2">Delete this goal?</h3>
        <p className="text-stone-text text-sm mb-6">
          "<span className="font-medium">{goalName}</span>" will be permanently removed. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-full border border-stone-300/60 text-stone-text font-medium text-sm hover:bg-white/60 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-full bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Goals;
