import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { insightsApi, DashboardResponse, MoneyFlowResponse } from '../src/api/insights.api';
import { userApi } from '../src/api/user.api';

const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$',
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  // Money flow state
  const [moneyFlow, setMoneyFlow] = useState<MoneyFlowResponse | null>(null);
  const [flowLoading, setFlowLoading] = useState(false);
  const [flowStartDate, setFlowStartDate] = useState('');
  const [flowEndDate, setFlowEndDate] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardData, profile, flowData] = await Promise.all([
        insightsApi.getDashboard(),
        userApi.getProfile(),
        insightsApi.getMoneyFlow(),
      ]);
      setData(dashboardData);
      setMoneyFlow(flowData);

      // Initialize filter dates from the response
      if (flowData.earliestDate) {
        setFlowStartDate(flowData.filterStart.split('T')[0]);
        setFlowEndDate(flowData.filterEnd.split('T')[0]);
      }

      const code = profile.preferences?.currency || 'USD';
      setCurrencySymbol(currencySymbols[code] || code);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoneyFlow = async (start?: string, end?: string) => {
    try {
      setFlowLoading(true);
      const flowData = await insightsApi.getMoneyFlow(start, end);
      setMoneyFlow(flowData);
    } catch (err: any) {
      console.error('Failed to fetch money flow:', err);
    } finally {
      setFlowLoading(false);
    }
  };

  const handleFlowFilterApply = () => {
    fetchMoneyFlow(
      flowStartDate || undefined,
      flowEndDate || undefined
    );
  };

  const handleFlowFilterReset = () => {
    if (moneyFlow?.earliestDate) {
      const start = moneyFlow.earliestDate.split('T')[0];
      const end = moneyFlow.latestDate?.split('T')[0] || '';
      setFlowStartDate(start);
      setFlowEndDate(end);
      fetchMoneyFlow();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 md:px-12">
        <div className="animate-pulse space-y-8">
          <div className="h-48 bg-stone-200/60 rounded-lg"></div>
          <div className="h-96 bg-stone-200/60 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-16 bg-stone-200/60 rounded-lg"></div>
            <div className="h-16 bg-stone-200/60 rounded-lg"></div>
            <div className="h-16 bg-stone-200/60 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 md:px-12">
        <div className="bg-red-50 bg-red-50 border border-red-200 border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-800 text-red-800">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
  const balanceChangePositive = data.balanceChange >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 flex flex-col animate-in fade-in duration-700">
      {/* Hero Balance */}
      <section className="py-8 md:py-12 flex flex-col items-center justify-center text-center">
        <h2 className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-stone-text mb-4 md:mb-6">{currentMonth} Balance</h2>
        <div className="relative group cursor-default">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-5xl lg:text-6xl text-secondary leading-none tracking-tight">
            {currencySymbol}{Math.floor(data.currentBalance).toLocaleString()}
            <span className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl opacity-40 font-normal">
              .{(data.currentBalance % 1).toFixed(2).substring(2)}
            </span>
          </h1>
          {data.balanceChange !== 0 && (
            <div className="absolute -right-8 top-0 md:-right-12 flex flex-col items-start opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                balanceChangePositive
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : 'text-red-500 bg-red-500/10'
              }`}>
                <span className="material-symbols-outlined text-sm mr-1">
                  {balanceChangePositive ? 'arrow_outward' : 'arrow_downward'}
                </span>
                {Math.abs(data.balanceChange).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <p className="mt-6 text-stone-500 font-light max-w-md mx-auto leading-relaxed">
          {balanceChangePositive
            ? `Your balance has increased by ${data.balanceChange.toFixed(1)}% compared to last month.`
            : data.balanceChange < 0
            ? `Your balance has decreased by ${Math.abs(data.balanceChange).toFixed(1)}% compared to last month.`
            : 'Your balance remains stable compared to last month.'}
        </p>
      </section>

      {/* Money Flow Visual */}
      <section className="py-12 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 px-2 gap-4">
          <h3 className="font-serif text-2xl italic text-secondary">Money Flow</h3>
          <div className="flex gap-4 text-xs font-medium tracking-wide uppercase text-stone-text">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Income
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div> Spending
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        {moneyFlow?.earliestDate && (
          <div className="flex flex-wrap items-center gap-3 mb-6 px-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">From</label>
              <input
                type="date"
                value={flowStartDate}
                min={moneyFlow.earliestDate.split('T')[0]}
                max={flowEndDate || moneyFlow.latestDate?.split('T')[0]}
                onChange={(e) => setFlowStartDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-stone-300/80 rounded-lg bg-white/60 text-secondary focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/60"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">To</label>
              <input
                type="date"
                value={flowEndDate}
                min={flowStartDate || moneyFlow.earliestDate.split('T')[0]}
                max={moneyFlow.latestDate?.split('T')[0]}
                onChange={(e) => setFlowEndDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-stone-300/80 rounded-lg bg-white/60 text-secondary focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/60"
              />
            </div>
            <button
              onClick={handleFlowFilterApply}
              disabled={flowLoading}
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              {flowLoading ? 'Loading...' : 'Apply'}
            </button>
            <button
              onClick={handleFlowFilterReset}
              disabled={flowLoading}
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-secondary border border-stone-300/80 rounded-lg hover:border-stone-400 transition-colors disabled:opacity-50"
            >
              All Time
            </button>
            {moneyFlow.grouping && (
              <span className="text-xs text-stone-400 ml-auto hidden sm:inline">
                Grouped {moneyFlow.grouping}
              </span>
            )}
          </div>
        )}

        {(moneyFlow?.dataPoints?.length ?? 0) > 0 ? (
          <div className={`h-64 md:h-80 w-full rounded-2xl p-4 bg-gradient-to-br from-white/60 via-background-light to-surface-dark/40 border border-stone-300/60 ${flowLoading ? 'opacity-50' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moneyFlow!.dataPoints}>
                <defs>
                  <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spendingColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cf1736" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#cf1736" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d6d3d1" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d6d3d1' }}
                  interval={'preserveStartEnd'}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#faf8f5', border: '1px solid #d6d3d1', borderRadius: '8px', color: '#280905' }}
                  labelStyle={{ color: '#280905' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => `${currencySymbol}${value.toLocaleString()}`}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#incomeColor)" strokeWidth={2} />
                <Area type="monotone" dataKey="spending" stroke="#cf1736" fillOpacity={1} fill="url(#spendingColor)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-stone-500">
            <p>No transaction data available yet</p>
          </div>
        )}
      </section>

      {/* Recent Activity Mini Ledger */}
      <section className="py-12">
        <div className="rounded-2xl border border-stone-300/60 p-6 md:p-8">
        <div className="flex items-end justify-between mb-10 px-2">
          <h3 className="font-serif text-2xl italic text-secondary">Recent Activity</h3>
          <button
            onClick={() => navigate('/app/journal')}
            className="text-sm font-medium text-stone-text hover:text-primary transition-colors"
          >
            View Full Ledger
          </button>
        </div>
        {data.recentTransactions.length > 0 ? (
          <div className="flex flex-col space-y-6">
            {data.recentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                date={new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                merchant={transaction.merchant}
                amount={transaction.type === 'expense' ? -transaction.amount : transaction.amount}
                category={transaction.category.displayName}
                isPositive={transaction.type === 'income'}
                symbol={currencySymbol}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-500">
            <p>No recent transactions yet</p>
            <button
              onClick={() => navigate('/app/journal')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-red-700 transition-colors"
            >
              Add Your First Transaction
            </button>
          </div>
        )}
        </div>
      </section>

      <div className="mt-12 mb-20 text-center border-t border-stone-300 pt-12">
        <p className="font-serif italic text-stone-400 text-lg">"A penny saved is a penny earned."</p>
        <p className="text-xs font-bold text-stone-600 mt-2 uppercase tracking-widest">Benjamin Franklin</p>
      </div>
    </div>
  );
};

const TransactionItem: React.FC<{
  date: string;
  merchant: string;
  amount: number;
  category: string;
  isPositive?: boolean;
  symbol?: string;
}> = ({ date, merchant, amount, category, isPositive, symbol = '$' }) => (
  <div className="group flex items-baseline justify-between hover:bg-stone-200/50 px-4 py-3 rounded-lg transition-colors cursor-default">
    <div className="flex-1">
      <div className="flex items-baseline gap-4">
        <span className="text-sm font-medium text-stone-text font-mono w-16">{date}</span>
        <span className="text-lg font-medium text-secondary group-hover:translate-x-1 transition-transform">
          {merchant}
        </span>
      </div>
      <p className="text-xs text-stone-500 pl-20 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{category}</p>
    </div>
    <span className={`text-lg font-medium tabular-nums ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
      {isPositive ? '+' : '-'}{symbol}{Math.abs(amount).toLocaleString()}
    </span>
  </div>
);

export default Dashboard;
