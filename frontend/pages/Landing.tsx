import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../src/components/Logo';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-background-light overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
        {/* Ambient Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#280905]/20 to-transparent rounded-full blur-[120px] pointer-events-none"></div>

        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-6 md:px-12 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Logo className="h-10" showText={true} />
            <button
              onClick={() => navigate('/signin')}
              className="px-6 py-2.5 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300 text-sm font-medium tracking-wide"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-xs font-medium tracking-widest uppercase text-primary">Financial Reflection</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight text-gray-900 text-secondary px-4">
              Your money,<br />
              <span className="italic text-primary">reimagined</span>
            </h1>

            <p className="text-base sm:text-lg md:text-lg lg:text-xl font-light leading-relaxed text-gray-600 dark:text-stone-text max-w-3xl mx-auto px-4">
              A sanctuary for intentional financial living. Beyond budgets, beyond tracking—discover a practice of clarity and purpose.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              onClick={() => navigate('/signin')}
              className="group flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white text-base font-medium tracking-wide hover:bg-[#b0132e] shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105"
            >
              <span>Begin Your Reflection</span>
              <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            </button>
            <button
              onClick={() => document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-base font-medium tracking-wide hover:border-primary hover:text-primary transition-all duration-300"
            >
              Learn More
            </button>
          </div>

          <p className="text-xs text-gray-400 uppercase tracking-widest pt-4">
            No credit card required · Start reflecting today
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="relative py-20 px-6 bg-surface-dark border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-normal text-gray-900 text-secondary mb-6 px-4">
              A different approach
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Card 1 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full p-8 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">auto_stories</span>
                </div>
                <h3 className="font-serif text-2xl text-gray-900 text-secondary mb-4">Editorial Design</h3>
                <p className="text-gray-600 dark:text-stone-text leading-relaxed font-light">
                  Finance deserves better than spreadsheets. Experience your money through the lens of thoughtful design and narrative clarity.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full p-8 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">psychiatry</span>
                </div>
                <h3 className="font-serif text-2xl text-gray-900 text-secondary mb-4">Intentional Living</h3>
                <p className="text-gray-600 dark:text-stone-text leading-relaxed font-light">
                  Move beyond anxiety-inducing notifications. Cultivate a calm, reflective practice that aligns spending with values.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full p-8 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">local_florist</span>
                </div>
                <h3 className="font-serif text-2xl text-gray-900 text-secondary mb-4">Gentle Insights</h3>
                <p className="text-gray-600 dark:text-stone-text leading-relaxed font-light">
                  Discover patterns without overwhelm. Our soft-focus approach reveals the shape of your financial life with grace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6 bg-background-light border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Feature 1 */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-widest uppercase">
                Journal
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-3xl lg:text-4xl text-gray-900 text-secondary leading-tight">
                Your financial journal, refined
              </h2>
              <div className="w-16 h-1 bg-primary rounded-full"></div>
              <p className="text-lg text-gray-600 dark:text-stone-text leading-relaxed font-light">
                Record transactions with the care of a diary entry. Each moment of spending becomes an opportunity for reflection, not judgment.
              </p>
              <ul className="space-y-4 pt-4">
                {['Merchant autocomplete', 'Custom categories', 'Thoughtful timestamps', 'Personal notes'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-stone-text">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-orange-900/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative aspect-[4/3] bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="p-8 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-serif text-2xl text-gray-900 text-secondary">Recent Entries</span>
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                  </div>
                  {[
                    { merchant: 'Whole Foods', category: 'Nourishment', amount: '-$127.40', icon: 'restaurant' },
                    { merchant: 'Apple', category: 'Tech', amount: '-$2,399.00', icon: 'laptop_mac' },
                    { merchant: 'Monthly Salary', category: 'Income', amount: '+$5,800.00', icon: 'payments' },
                  ].map((transaction, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-stone-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-sm">{transaction.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-secondary">{transaction.merchant}</p>
                          <p className="text-xs text-gray-500">{transaction.category}</p>
                        </div>
                      </div>
                      <span className={`font-medium ${transaction.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900 text-secondary'}`}>
                        {transaction.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mt-20">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-orange-900/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative aspect-[4/3] bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden p-8">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="font-serif text-3xl text-gray-900 text-secondary">October Reflection</h3>
                    <p className="text-sm text-gray-500">Your month in context</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl border border-green-500/20">
                      <p className="text-xs text-gray-500 mb-1">Income</p>
                      <p className="text-2xl font-serif text-gray-900 text-secondary">$5,800</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border border-primary/20">
                      <p className="text-xs text-gray-500 mb-1">Spending</p>
                      <p className="text-2xl font-serif text-gray-900 text-secondary">$4,320</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Shelter', percent: 29, color: 'bg-gray-600' },
                      { name: 'Tech', percent: 55, color: 'bg-primary' },
                      { name: 'Nourishment', percent: 16, color: 'bg-orange-500' },
                    ].map((cat, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{cat.name}</span>
                          <span className="text-xs font-medium text-gray-900 text-secondary">{cat.percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percent}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-widest uppercase">
                Insights
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-3xl lg:text-4xl text-gray-900 text-secondary leading-tight">
                Monthly reflections, beautifully rendered
              </h2>
              <div className="w-16 h-1 bg-primary rounded-full"></div>
              <p className="text-lg text-gray-600 dark:text-stone-text leading-relaxed font-light">
                Understand your patterns through elegant visualizations. See the narrative of your spending emerge naturally, without spreadsheets or dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-primary/95 via-primary to-primary/95 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bTQtNHYyaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bTQtNHYyaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-normal text-white leading-tight px-4">
            Ready to begin?
          </h2>
          <p className="text-base sm:text-lg md:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Join a community of thoughtful individuals cultivating a more intentional relationship with money.
          </p>
          <button
            onClick={() => navigate('/signin')}
            className="group inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-[#280905] text-lg font-medium tracking-wide hover:bg-gray-100 shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <span>Start Your Journey</span>
            <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
          </button>
          <p className="text-sm text-gray-400 pt-4">
            Free to start · No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 bg-stone-900 dark:bg-stone-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-4">
                <Logo className="h-10" showText={true} />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                A sanctuary for intentional financial living. Beyond budgets, beyond tracking—discover a practice of clarity and purpose.
              </p>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Philosophy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Manifesto</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">© 2024 Fincurio Inc. Wealth is a mindset.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">language</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">mail</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
