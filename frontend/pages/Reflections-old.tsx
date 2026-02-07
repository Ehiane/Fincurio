
import React from 'react';

const Reflections: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:px-8 md:py-16 flex flex-col gap-8 md:gap-12 animate-in fade-in duration-700">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 text-secondary">Category Reflections</h2>
          <p className="text-gray-500 text-stone-text text-lg max-w-xl leading-relaxed">
            Review your lifestyle investments for the period. Focus on where your energy flows, not just where the money goes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-full bg-white bg-surface-dark border border-gray-200 dark:border-white/5 pl-5 pr-3 py-2 text-sm font-medium shadow-sm">
            <span>October 2023</span>
            <span className="material-symbols-outlined text-gray-400">keyboard_arrow_down</span>
          </button>
          <button className="flex items-center gap-2 rounded-full bg-white bg-surface-dark border border-gray-200 dark:border-white/5 pl-5 pr-3 py-2 text-sm font-medium shadow-sm">
            <span>All Categories</span>
            <span className="material-symbols-outlined text-gray-400">filter_list</span>
          </button>
        </div>
      </header>

      <div className="flex items-baseline justify-between border-b border-gray-200 border-gray-200 pb-4">
        <span className="text-sm uppercase tracking-widest text-gray-500 text-stone-text font-semibold">Total Reflections</span>
        <span className="font-serif text-3xl md:text-4xl text-gray-900 text-secondary">$4,320.00</span>
      </div>

      <div className="flex flex-col gap-4">
        <ReflectionCard 
          icon="home" 
          title="Shelter" 
          subtitle="Mortgage & Utilities" 
          amount={1250} 
          status="On Track" 
          progress={45} 
        />
        <ReflectionCard 
          icon="restaurant" 
          title="Nourishment" 
          subtitle="Groceries & Dining" 
          amount={850} 
          status="+10% vs avg" 
          progress={30} 
          isWarning
        />
        <ReflectionCard 
          icon="theater_comedy" 
          title="Culture" 
          subtitle="Events, Books & Art" 
          amount={320} 
          status="Below avg" 
          progress={15} 
        />
        <ReflectionCard 
          icon="spa" 
          title="Wellness" 
          subtitle="Health & Fitness" 
          amount={450} 
          progress={20} 
        />
        <ReflectionCard 
          icon="commute" 
          title="Transport" 
          subtitle="Commute & Travel" 
          amount={1450} 
          status="High Spend" 
          progress={55} 
          isWarning
        />
      </div>

      <div className="mt-8 flex justify-center text-center">
        <p className="font-serif italic text-gray-400 text-stone-text opacity-60 max-w-md">
          "Do not save what is left after spending, but spend what is left after saving."
        </p>
      </div>
    </div>
  );
};

const ReflectionCard: React.FC<{ icon: string; title: string; subtitle: string; amount: number; status?: string; progress: number; isWarning?: boolean }> = ({ icon, title, subtitle, amount, status, progress, isWarning }) => (
  <div className="group relative flex flex-col overflow-hidden rounded-[18px] bg-white bg-surface-dark p-1 shadow-sm transition-all hover:bg-white dark:hover:bg-[#32322f]">
    <div className="flex items-center justify-between p-5">
      <div className="flex items-center gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-[#3d3335] text-gray-600 text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-gray-900 text-gray-100">{title}</h3>
          <span className="text-sm text-gray-500 text-stone-text">{subtitle}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="font-serif text-2xl text-gray-900 text-secondary">${amount.toLocaleString()}.00</span>
        {status && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isWarning ? 'text-primary bg-primary/10' : 'text-emerald-500 bg-emerald-500/10'}`}>
            {status}
          </span>
        )}
      </div>
    </div>
    <div className="h-1 w-full bg-gray-100 dark:bg-black/20 rounded-full overflow-hidden mx-5 mb-5 max-w-[calc(100%-2.5rem)]">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ${isWarning ? 'bg-primary/60' : 'bg-gray-400 dark:bg-gray-500 opacity-50'}`} 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

export default Reflections;
