
import React from 'react';

const Journal: React.FC = () => {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10 lg:px-12 lg:py-16 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="flex flex-col gap-3 max-w-lg">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-tight text-gray-900 text-secondary">
            Journal of <br/><span className="italic text-stone-text">Transactions</span>
          </h2>
          <p className="text-stone-text text-sm md:text-base font-light max-w-xs pl-1">
            A curated record of your financial journey, presented with clarity.
          </p>
        </div>
        <div className="w-full md:w-auto md:min-w-[320px]">
          <div className="group relative flex items-center h-14 w-full rounded-full bg-white bg-surface-dark shadow-sm ring-1 ring-gray-200 dark:ring-white/5 focus-within:ring-primary/50 transition-all duration-300">
            <div className="pl-5 pr-3 text-gray-400 text-stone-text">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input 
              className="flex-1 bg-transparent border-none text-base text-gray-900 text-secondary placeholder:text-gray-400 dark:placeholder:text-stone-text/50 focus:ring-0 px-2" 
              placeholder="Search entries..." 
              type="text"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col pb-24">
        <DateGroup label="Today" />
        <JournalItem icon="laptop_mac" merchant="Apple Store" category="Tech" amount={-2400} time="10:42 AM" isHighValue />
        <JournalItem icon="shopping_bag" merchant="Whole Foods Market" category="Groceries" amount={-142.5} time="08:15 AM" />
        
        <div className="h-12"></div>
        
        <DateGroup label="Yesterday" />
        <JournalItem icon="payments" merchant="Direct Deposit" category="Salary" amount={4500} isPositive />
        <JournalItem icon="local_cafe" merchant="Blue Bottle Coffee" category="Dining" amount={-6.5} />
        <JournalItem icon="music_note" merchant="Spotify Premium" category="Subscription" amount={-11.99} />
      </div>

      <button className="fixed bottom-8 right-8 md:bottom-12 md:right-12 size-16 bg-primary hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 group">
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
      </button>
    </div>
  );
};

const DateGroup: React.FC<{ label: string }> = ({ label }) => (
  <div className="mb-4 sticky top-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm z-10 py-4">
    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 text-stone-text">{label}</h3>
  </div>
);

const JournalItem: React.FC<{ icon: string; merchant: string; category: string; amount: number; time?: string; isPositive?: boolean; isHighValue?: boolean }> = ({ icon, merchant, category, amount, time, isPositive, isHighValue }) => (
  <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between py-8 border-b border-gray-200 border-gray-200 hover:bg-white/40 hover:bg-gray-100 transition-all duration-300 rounded-lg px-2 -mx-2">
    <div className="flex items-center gap-6">
      <div className={`hidden sm:flex items-center justify-center size-12 rounded-full shrink-0 transition-colors ${isPositive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 bg-surface-dark text-stone-text group-hover:text-primary'}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xl font-medium text-gray-900 text-secondary tracking-tight">{merchant}</span>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${isPositive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-300 dark:border-white/20 text-gray-500 text-stone-text'}`}>
            {category}
          </span>
          {time && <span className="text-xs text-gray-400">{time}</span>}
        </div>
      </div>
    </div>
    <div className="mt-4 sm:mt-0">
      <span className={`text-2xl md:text-3xl font-serif font-medium ${isHighValue ? 'text-primary' : isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 text-secondary'}`}>
        {isPositive ? '+' : '-'}${Math.abs(amount).toLocaleString()}
      </span>
    </div>
  </div>
);

export default Journal;
