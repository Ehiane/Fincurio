
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Oct 1', income: 4000, spending: 2400 },
  { name: 'Oct 5', income: 4200, spending: 1398 },
  { name: 'Oct 10', income: 3800, spending: 4800 },
  { name: 'Oct 15', income: 4500, spending: 3908 },
  { name: 'Oct 20', income: 5100, spending: 2800 },
  { name: 'Oct 24', income: 4800, spending: 4300 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:px-12 flex flex-col animate-in fade-in duration-700">
      {/* Hero Balance */}
      <section className="py-12 flex flex-col items-center justify-center text-center">
        <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-stone-text mb-6">October Balance</h2>
        <div className="relative group cursor-default">
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-slate-900 dark:text-slate-50 leading-none tracking-tight">
            $12,450<span className="text-3xl md:text-5xl opacity-40 font-normal">.00</span>
          </h1>
          <div className="absolute -right-8 top-0 md:-right-12 flex flex-col items-start opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="flex items-center text-emerald-500 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-sm mr-1">arrow_outward</span>
              4.2%
            </span>
          </div>
        </div>
        <p className="mt-6 text-stone-500 font-light max-w-md mx-auto leading-relaxed">
          Your net worth has increased steadily over the last 30 days. You are well positioned for the upcoming holiday season.
        </p>
      </section>

      {/* Money Flow Visual */}
      <section className="py-12 w-full">
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="font-serif text-2xl italic text-slate-800 dark:text-slate-200">Money Flow</h3>
          <div className="flex gap-4 text-xs font-medium tracking-wide uppercase text-stone-text">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div> Income
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div> Spending
            </div>
          </div>
        </div>

        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="spendingColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cf1736" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#cf1736" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#38292b" opacity={0.3} />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#181112', border: '1px solid #38292b', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="income" stroke="#94a3b8" fillOpacity={1} fill="url(#incomeColor)" strokeWidth={2} />
              <Area type="monotone" dataKey="spending" stroke="#cf1736" fillOpacity={1} fill="url(#spendingColor)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Activity Mini Ledger */}
      <section className="py-12">
        <div className="flex items-end justify-between mb-10 px-2">
          <h3 className="font-serif text-2xl italic text-slate-800 dark:text-slate-200">Recent Activity</h3>
          <button className="text-sm font-medium text-stone-text hover:text-primary transition-colors">View Full Ledger</button>
        </div>
        <div className="flex flex-col space-y-6">
          <TransactionItem date="Oct 24" merchant="Apple Store" amount={-1299} category="Electronics" />
          <TransactionItem date="Oct 23" merchant="Whole Foods" amount={-142.5} category="Groceries" />
          <TransactionItem date="Oct 21" merchant="Monthly Salary" amount={5800} category="Salary" isPositive />
          <TransactionItem date="Oct 20" merchant="Spotify Premium" amount={-14.99} category="Subscriptions" />
        </div>
      </section>

      <div className="mt-12 mb-20 text-center border-t border-slate-200 dark:border-stone-800 pt-12">
        <p className="font-serif italic text-stone-400 text-lg">"A penny saved is a penny earned."</p>
        <p className="text-xs font-bold text-stone-600 mt-2 uppercase tracking-widest">Benjamin Franklin</p>
      </div>
    </div>
  );
};

const TransactionItem: React.FC<{ date: string; merchant: string; amount: number; category: string; isPositive?: boolean }> = ({ date, merchant, amount, category, isPositive }) => (
  <div className="group flex items-baseline justify-between hover:bg-white/5 px-4 py-3 rounded-lg transition-colors cursor-pointer">
    <div className="flex-1">
      <div className="flex items-baseline gap-4">
        <span className="text-sm font-medium text-stone-text font-mono w-16">{date}</span>
        <span className="text-lg font-medium text-slate-800 dark:text-slate-200 group-hover:translate-x-1 transition-transform">{merchant}</span>
      </div>
      <p className="text-xs text-stone-500 pl-20 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{category}</p>
    </div>
    <span className={`text-lg font-medium tabular-nums ${isPositive ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
      {isPositive ? '+' : '-'}${Math.abs(amount).toLocaleString()}
    </span>
  </div>
);

export default Dashboard;
