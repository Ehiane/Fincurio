import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../src/api/user.api';
import Logo from '../src/components/Logo';
import { formatCurrency, parseCurrency } from '../src/utils/currencyFormatter';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [financialIntention, setFinancialIntention] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [monthlyBudgetGoal, setMonthlyBudgetGoal] = useState('');

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  ];

  const handleNext = () => {
    if (step === 1 && !financialIntention.trim()) {
      setError('Please enter your financial intention');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetValue = parseCurrency(monthlyBudgetGoal);
    if (!monthlyBudgetGoal || budgetValue <= 0) {
      setError('Please enter a valid budget goal');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update profile with financial intention
      await userApi.updateProfile({ financialIntention });

      // Update preferences with currency and budget
      await userApi.updatePreferences({
        currency,
        monthlyBudgetGoal: budgetValue,
      });

      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save onboarding data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="w-full max-w-3xl flex flex-col items-center gap-8 text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight text-secondary">
              What is your primary intention for your finances this year?
            </h1>

            <div className="w-full max-w-xl mt-4 md:mt-8 relative group">
              <div className="w-full pb-2 border-b border-stone-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:w-0 group-focus-within:after:w-full after:transition-all after:duration-500">
                <input
                  autoFocus
                  type="text"
                  value={financialIntention}
                  onChange={(e) => setFinancialIntention(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  placeholder="I want to feel..."
                  className="w-full bg-transparent border-none p-0 text-2xl md:text-3xl lg:text-4xl text-center placeholder:text-stone-400 focus:ring-0 text-primary font-serif italic"
                />
              </div>
              <p className="mt-4 text-sm md:text-base text-stone-text font-light">
                Focus on a feeling, like 'security', 'freedom', or 'calm'.
              </p>
            </div>

            <button
              onClick={handleNext}
              disabled={!financialIntention.trim()}
              className="group flex items-center justify-center gap-3 bg-secondary hover:bg-secondary/90 disabled:bg-stone-400 disabled:cursor-not-allowed text-background-light pl-8 pr-6 py-4 rounded-full transition-all duration-300 shadow-lg hover:pr-8 mt-12"
            >
              <span className="text-lg font-medium">Continue</span>
              <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>
        );

      case 2:
        return (
          <div className="w-full max-w-3xl flex flex-col items-center gap-8 text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight text-secondary">
              What currency do you use?
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => setCurrency(curr.code)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    currency === curr.code
                      ? 'border-primary bg-primary/5'
                      : 'border-stone-300 hover:border-primary/50'
                  }`}
                >
                  <div className="text-4xl mb-2 text-secondary">{curr.symbol}</div>
                  <div className="font-medium text-lg text-secondary">{curr.code}</div>
                  <div className="text-sm text-stone-text">{curr.name}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-full border border-stone-300 text-stone-text hover:border-primary hover:text-secondary transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="group flex items-center justify-center gap-3 bg-secondary hover:bg-secondary/90 text-background-light pl-8 pr-6 py-4 rounded-full transition-all duration-300 shadow-lg hover:pr-8"
              >
                <span className="text-lg font-medium">Continue</span>
                <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col items-center gap-8 text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight text-secondary">
              What's your monthly budget goal?
            </h1>

            <div className="w-full max-w-xl mt-4 md:mt-8 relative group">
              <div className="w-full pb-2 border-b border-stone-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:w-0 group-focus-within:after:w-full after:transition-all after:duration-500">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl md:text-4xl lg:text-5xl text-primary font-serif">
                    {currencies.find((c) => c.code === currency)?.symbol}
                  </span>
                  <input
                    autoFocus
                    type="text"
                    inputMode="decimal"
                    value={monthlyBudgetGoal}
                    onChange={(e) => setMonthlyBudgetGoal(formatCurrency(e.target.value))}
                    placeholder="4,000.00"
                    className="w-full bg-transparent border-none p-0 text-2xl md:text-3xl lg:text-4xl text-center placeholder:text-stone-400 focus:ring-0 text-primary font-serif"
                  />
                </div>
              </div>
              <p className="mt-4 text-sm md:text-base text-stone-text font-light">
                This helps us provide insights on your spending patterns.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm max-w-xl">
                {error}
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="px-6 py-3 rounded-full border border-stone-300 text-stone-text hover:border-primary hover:text-secondary transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !monthlyBudgetGoal}
                className="group flex items-center justify-center gap-3 bg-secondary hover:bg-secondary/90 disabled:bg-stone-400 disabled:cursor-not-allowed text-background-light pl-8 pr-6 py-4 rounded-full transition-all duration-300 shadow-lg hover:pr-8"
              >
                <span className="text-lg font-medium">{loading ? 'Saving...' : 'Get Started'}</span>
                {!loading && (
                  <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                )}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-background-light flex flex-col transition-colors duration-300 relative overflow-hidden">
      <header className="w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-10">
        <Logo className="h-10 md:h-12" showText={true} />

        <div className="absolute left-1/2 top-8 -translate-x-1/2 hidden md:flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-stone-300/60">
          <span className="text-sm font-medium text-stone-text">Step {step} of 3</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-stone-300'
                }`}
              ></div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/app/dashboard')}
          className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity"
        >
          Skip for now
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full px-6 pb-20 z-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        {renderStep()}
      </main>

      <footer className="w-full py-8 text-center opacity-40 hover:opacity-80 transition-opacity">
        <p className="text-xs font-serif italic max-w-md mx-auto px-6">
          "Money is a terrible master but an excellent servant." — P.T. Barnum
        </p>
      </footer>
    </div>
  );
};

export default Onboarding;
