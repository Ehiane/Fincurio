import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { transactionsApi, Transaction } from '../src/api/transactions.api';
import { categoriesApi, Category } from '../src/api/categories.api';
import { merchantsApi, Merchant } from '../src/api/merchants.api';
import { goalsApi, Goal } from '../src/api/goals.api';
import { formatCurrency, parseCurrency, toCurrencyDisplay } from '../src/utils/currencyFormatter';
import { getCached, setCache, invalidateCache } from '../src/utils/apiCache';
import EditorialLoader from '../src/components/EditorialLoader';
import StaggerChildren from '../src/components/StaggerChildren';

const Journal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [prefill, setPrefill] = useState<{ goalId?: string; goalName?: string } | null>(null);

  // Handle URL pre-fill params (from "Log Contribution" button on Goals page)
  useEffect(() => {
    const prefillType = searchParams.get('prefill');
    const goalId = searchParams.get('goalId');
    const goalName = searchParams.get('goalName');
    if (prefillType === 'contribution' && goalId) {
      setPrefill({ goalId, goalName: goalName || undefined });
      setEditingTransaction(null);
      setShowModal(true);
      // Clear params so refresh doesn't re-trigger
      setSearchParams({}, { replace: true });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (skipCache = false) => {
    try {
      setLoading(true);

      const cachedTrans = !skipCache ? getCached<Transaction[]>('journal:transactions') : null;
      const cachedCats = getCached<Category[]>('categories');
      const cachedMerch = getCached<Merchant[]>('merchants');

      if (cachedTrans && cachedCats && cachedMerch) {
        setTransactions(cachedTrans);
        setCategories(cachedCats);
        setMerchants(cachedMerch);
        setLoading(false);
        return;
      }

      const [transData, catData, merchData] = await Promise.all([
        transactionsApi.getAll(),
        cachedCats ? Promise.resolve(cachedCats) : categoriesApi.getAll(),
        cachedMerch ? Promise.resolve(cachedMerch) : merchantsApi.getAll(),
      ]);
      const txList = transData.transactions ?? transData;
      setTransactions(txList);
      setCategories(catData);
      setMerchants(merchData);
      setCache('journal:transactions', txList);
      setCache('categories', catData);
      setCache('merchants', merchData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await transactionsApi.delete(id);
      invalidateCache('journal:', 'dashboard', 'moneyflow:');
      await fetchData(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const handleModalClose = async (refresh: boolean) => {
    setShowModal(false);
    setEditingTransaction(null);
    setPrefill(null);
    if (refresh) {
      invalidateCache('journal:', 'dashboard', 'moneyflow:');
      await fetchData(true);
    }
  };

  const groupTransactionsByDate = () => {
    const groups: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let label: string;
      if (date.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else {
        label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(transaction);
    });

    return Object.entries(groups);
  };

  const groupedTransactions = groupTransactionsByDate();

  return (
    <EditorialLoader variant="journal" isLoading={loading}>
    {error ? (
      <div className="max-w-[1000px] mx-auto px-6 py-10 lg:px-12 lg:py-16">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    ) : (
    <StaggerChildren className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 lg:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-12 md:mb-16">
        <div className="flex flex-col gap-3 max-w-lg">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-medium leading-tight tracking-tight text-secondary">
            Journal of <br />
            <span className="italic text-stone-text">Transactions</span>
          </h2>
          <p className="text-stone-text text-sm md:text-base font-light max-w-xs pl-1">
            A curated record of your financial journey, presented with clarity.
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 opacity-20">📝</div>
          <h3 className="text-2xl font-serif mb-2 text-secondary">No transactions yet</h3>
          <p className="text-stone-text mb-8">Start tracking your financial journey by adding your first transaction.</p>
          <button
            onClick={handleAddTransaction}
            className="px-8 py-3 bg-primary text-white rounded-full hover:bg-red-700 transition-colors"
          >
            Add Transaction
          </button>
        </div>
      ) : (
        <div className="flex flex-col pb-24">
          {groupedTransactions.map(([date, trans]) => (
            <React.Fragment key={date}>
              <DateGroup label={date} />
              {trans.map((transaction) => (
                <JournalItem
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={() => handleEditTransaction(transaction)}
                  onDelete={() => handleDeleteTransaction(transaction.id)}
                />
              ))}
              <div className="h-12"></div>
            </React.Fragment>
          ))}
        </div>
      )}

    </StaggerChildren>
    )}

      <button
        onClick={handleAddTransaction}
        className="fixed bottom-8 right-8 md:bottom-12 md:right-12 size-16 bg-primary hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 group z-50"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">
          add
        </span>
      </button>

      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={handleModalClose}
          prefill={prefill || undefined}
        />
      )}
    </EditorialLoader>
  );
};

const DateGroup: React.FC<{ label: string }> = ({ label }) => (
  <div className="mb-4 sticky top-0 bg-background-light/95 backdrop-blur-sm z-10 py-4">
    <h3 className="text-sm font-bold uppercase tracking-widest text-stone-text">{label}</h3>
  </div>
);

const JournalItem: React.FC<{
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ transaction, onEdit, onDelete }) => {
  const isPositive = transaction.type === 'income';
  const isContribution = transaction.type === 'contribution';
  const isHighValue = transaction.amount > 1000;

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between py-8 border-b border-stone-200 hover:bg-white/40 transition-all duration-300 rounded-lg px-2 -mx-2">
      <div className="flex items-center gap-6">
        <div
          className={`hidden sm:flex items-center justify-center size-12 rounded-full shrink-0 transition-colors ${
            isContribution
              ? 'bg-sky-50 text-sky-600'
              : isPositive
              ? 'bg-white text-emerald-600'
              : 'bg-white text-stone-text group-hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined">{transaction.category.icon}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xl font-medium text-secondary tracking-tight">
            {transaction.merchant}
          </span>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${
                isContribution
                  ? 'border-sky-200 bg-sky-50 text-sky-700'
                  : isPositive
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-stone-300 text-stone-text'
              }`}
            >
              {transaction.category.displayName}
            </span>
            {transaction.time && (
              <span className="text-xs text-stone-text">
                {new Date(`2000-01-01T${transaction.time}`).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            )}
          </div>
          {transaction.notes && (
            <p className="text-sm text-stone-text mt-1">{transaction.notes}</p>
          )}
        </div>
      </div>
      <div className="mt-4 sm:mt-0 flex items-center gap-4">
        <span
          className={`text-2xl md:text-3xl font-serif font-medium ${
            isContribution ? 'text-sky-600' : isPositive ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {isContribution ? '-' : isPositive ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const TransactionModal: React.FC<{
  transaction: Transaction | null;
  onClose: (refresh: boolean) => void;
  prefill?: { goalId?: string; goalName?: string };
}> = ({ transaction, onClose, prefill: prefillData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<Goal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchModalData = async () => {
      try {
        setDataLoading(true);
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const [catData, merchData, goalsData, monthTxnData] = await Promise.all([
          categoriesApi.getAll(),
          merchantsApi.getAll(),
          goalsApi.getAll(),
          transactionsApi.getAll({ startDate: monthStart, endDate: monthEnd, pageSize: 500 }),
        ]);
        setCategories(catData);
        setMerchants(merchData);
        setSavingsGoals(goalsData.goals.filter(g => g.type === 'savings'));
        setCache('categories', catData);
        setCache('merchants', merchData);

        // Compute available balance: income - expenses - existing contributions
        const txns = monthTxnData.transactions ?? monthTxnData;
        const totalIncome = (txns as any[]).filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
        const totalExpenses = (txns as any[]).filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
        const existingContributions = (txns as any[]).filter((t: any) => t.type === 'contribution').reduce((s: number, t: any) => s + t.amount, 0);
        setAvailableBalance(totalIncome - totalExpenses - existingContributions);
      } catch {
        setError('Failed to load categories and merchants');
      } finally {
        setDataLoading(false);
      }
    };
    fetchModalData();
  }, []);

  const [date, setDate] = useState(
    transaction?.date || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(
    transaction?.time || new Date().toTimeString().slice(0, 5)
  );
  const [merchant, setMerchant] = useState(
    transaction?.merchant || (prefillData?.goalName ? `Contribution to ${prefillData.goalName}` : '')
  );
  const [categoryId, setCategoryId] = useState(transaction?.category.id || '');
  const [amount, setAmount] = useState(transaction ? toCurrencyDisplay(transaction.amount) : '');
  const [type, setType] = useState<'income' | 'expense' | 'contribution'>(
    transaction?.type || (prefillData ? 'contribution' : 'expense')
  );
  const [notes, setNotes] = useState(transaction?.notes || '');
  const [goalId, setGoalId] = useState(
    transaction?.goalId || prefillData?.goalId || ''
  );

  // Group categories by categoryGroup
  const groupedCategories = categories.reduce<Record<string, Category[]>>((acc, cat) => {
    const group = cat.categoryGroup || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {});
  const sortedGroups = Object.keys(groupedCategories).sort((a, b) =>
    a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountValue = parseCurrency(amount);
    if (!merchant || !categoryId || !amount || amountValue <= 0) {
      setError('Please fill in all required fields with valid values');
      return;
    }

    // Contribution limit check
    if (goalId && type === 'contribution' && availableBalance !== null && amountValue > availableBalance) {
      setError(`Contribution exceeds your available balance of $${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        date,
        time,
        merchant,
        categoryId,
        amount: amountValue,
        type,
        notes: notes || undefined,
        goalId: goalId || undefined,
      };

      if (transaction) {
        await transactionsApi.update(transaction.id, payload);
      } else {
        await transactionsApi.create(payload);
      }

      onClose(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-background-light rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border border-stone-300/40 animate-in slide-in-from-bottom-3 duration-300">
        {/* Header */}
        <div className="px-5 sm:px-8 pt-5 sm:pt-8 pb-4 sm:pb-6 border-b border-stone-300/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-serif font-medium text-secondary tracking-tight">
              {transaction ? 'Edit Transaction' : 'Add Transaction'}
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
          ) : <>
          {/* Type Toggle */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 sm:py-3.5 rounded-full font-medium text-sm tracking-wide transition-all duration-200 ${
                type === 'expense'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-dark/50 text-stone-text hover:bg-surface-dark'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 sm:py-3.5 rounded-full font-medium text-sm tracking-wide transition-all duration-200 ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-surface-dark/50 text-stone-text hover:bg-surface-dark'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('contribution')}
              className={`flex-1 py-2.5 sm:py-3.5 rounded-full font-medium text-sm tracking-wide transition-all duration-200 ${
                type === 'contribution'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-surface-dark/50 text-stone-text hover:bg-surface-dark'
              }`}
            >
              Savings
            </button>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-stone-300/60 rounded-xl text-secondary text-sm sm:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-stone-300/60 rounded-xl text-secondary text-sm sm:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          {/* Merchant */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
              Merchant
            </label>
            <input
              type="text"
              list="merchants-list"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              required
              placeholder="Apple Store"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-stone-300/60 rounded-xl text-secondary text-sm sm:text-base placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
            <datalist id="merchants-list">
              {merchants.map((merch) => (
                <option key={merch.id} value={merch.name} />
              ))}
            </datalist>
          </div>

          {/* Category */}
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
              {sortedGroups.map((group) => (
                <optgroup key={group} label={group}>
                  {groupedCategories[group].map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.displayName}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
              Amount
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(formatCurrency(e.target.value))}
              required
              placeholder="0.00"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-stone-300/60 rounded-xl text-secondary placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-serif text-base sm:text-lg"
            />
            {/* Available balance hint for contributions */}
            {goalId && type === 'contribution' && availableBalance !== null && (
              <p className={`mt-1 text-xs ${availableBalance <= 0 ? 'text-red-500' : 'text-stone-400'}`}>
                Available balance: ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
              Notes <span className="normal-case tracking-normal font-normal text-stone-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              rows={2}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-stone-300/60 rounded-xl text-secondary text-sm sm:text-base placeholder:text-stone-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
            />
          </div>

          {/* Link to Savings Goal */}
          {savingsGoals.length > 0 && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-text font-semibold mb-1.5 sm:mb-2">
                Savings Goal {type !== 'contribution' && <span className="normal-case tracking-normal font-normal text-stone-400">(optional)</span>}
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                required={type === 'contribution'}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-stone-300/60 rounded-xl text-secondary text-sm sm:text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              >
                <option value="">None</option>
                {savingsGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {loading ? 'Saving...' : transaction ? 'Update' : 'Add Transaction'}
            </button>
          </div>
          </>}
        </form>
      </div>
    </div>
  );
};

export default Journal;
