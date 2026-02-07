import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../src/components/Logo';

/* ─── Scroll-reveal wrapper ─── */
const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  fade?: boolean;
}> = ({ children, delay = 0, className = '', fade = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? 'opacity-100 translate-y-0'
          : `opacity-0 ${fade ? '' : 'translate-y-5'}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const barsRef = useRef<HTMLDivElement>(null);

  // Hero entrance on mount
  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Parallax hero on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      const opacity = Math.max(0, 1 - scrollY / 600);
      const translateY = scrollY * 0.3;
      heroRef.current.style.opacity = String(opacity);
      heroRef.current.style.transform = `translateY(${translateY}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Category bars width animation
  useEffect(() => {
    if (!barsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBarsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(barsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full bg-background-light overflow-x-hidden">

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background-light/80 backdrop-blur-md px-4 md:px-8 lg:px-14">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between py-5 border-b border-secondary/[0.06]">
            <Logo className="h-12" showText={true} />
            <div className="flex items-center gap-8">
              <button
                onClick={() => document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' })}
                className="hidden md:block text-sm text-stone-text/70 hover:text-secondary transition-colors tracking-wide"
              >
                Philosophy
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="hidden md:block text-sm text-stone-text/70 hover:text-secondary transition-colors tracking-wide"
              >
                Features
              </button>
              <button
                onClick={() => navigate('/signin')}
                className="hidden md:inline-flex px-5 py-2 rounded-full bg-secondary text-background-light text-sm font-medium tracking-wide hover:bg-secondary/90 transition-colors"
              >
                Get Started
              </button>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
                aria-label="Toggle menu"
              >
                <span className={`block w-5 h-[1.5px] bg-secondary transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
                <span className={`block w-5 h-[1.5px] bg-secondary transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-[1.5px] bg-secondary transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        {/* Mobile dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${mobileMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="max-w-[1400px] mx-auto py-4 flex flex-col items-center gap-4 border-b border-secondary/[0.06]">
            <button
              onClick={() => { document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}
              className="text-sm text-stone-text/70 hover:text-secondary transition-colors tracking-wide"
            >
              Philosophy
            </button>
            <button
              onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}
              className="text-sm text-stone-text/70 hover:text-secondary transition-colors tracking-wide"
            >
              Features
            </button>
            <button
              onClick={() => { navigate('/signin'); setMobileMenuOpen(false); }}
              className="px-5 py-2 rounded-full bg-secondary text-background-light text-sm font-medium tracking-wide hover:bg-secondary/90 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-end pb-24 md:pb-32 pt-40 px-6 md:px-12 lg:px-20">
        {/* Subtle warm gradient — one, not multiple */}
        <div className="absolute top-0 right-0 w-[60%] h-[70%] bg-gradient-to-bl from-primary/[0.06] to-transparent pointer-events-none"></div>

        <div ref={heroRef} className="max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
            {/* Main heading — takes 7 cols */}
            <div className="lg:col-span-7 space-y-8">
              <h1 className={`font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-normal leading-[1.05] tracking-[-0.02em] text-secondary transition-all duration-700 ease-out ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                Finance<br />
                with <em className="text-primary" style={{ fontStyle: 'italic' }}>intention</em>
              </h1>
              <div className={`flex items-center gap-6 pt-4 transition-all duration-700 ease-out ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '200ms' }}>
                <button
                  onClick={() => navigate('/signin')}
                  className="group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full text-base font-medium tracking-wide hover:bg-[#c9431a] transition-colors"
                >
                  <span>Begin your reflection</span>
                  <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:translate-x-0.5">arrow_forward</span>
                </button>
                <span className="hidden sm:block text-xs text-stone-text/50 tracking-wide">Free to start.<br />No credit card.</span>
              </div>
            </div>

            {/* Supporting text — takes 5 cols */}
            <div className={`lg:col-span-5 lg:pb-4 transition-all duration-700 ease-out ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '400ms' }}>
              <p className="text-lg md:text-xl font-light leading-relaxed text-stone-text max-w-md">
                Not another budgeting app. Fincurio is a space for calm, clarity, and purpose in your financial life.
              </p>
            </div>
          </div>

          {/* Minimal divider line */}
          <div className={`mt-16 pt-6 relative transition-all duration-700 ease-out ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: '600ms' }}>
            {/* Sweeping line — left to right */}
            <div className="absolute top-0 left-0 right-0 h-px bg-secondary/[0.08]"></div>
            <div
              className={`absolute top-0 left-0 right-0 h-px bg-primary/25 origin-left transition-transform ${heroLoaded ? 'scale-x-100' : 'scale-x-0'}`}
              style={{ transitionDuration: '3200ms', transitionDelay: '700ms', transitionTimingFunction: 'cubic-bezier(0.35, 0.0, 0.15, 1)' }}
            ></div>

            <div className="flex flex-wrap items-center gap-x-12 gap-y-3 text-xs tracking-widest uppercase font-medium">
              {['Reflection', '·', 'Journaling', '·', 'Insight', '·', 'Intention'].map((word, i) => (
                <span
                  key={i}
                  className={`transition-colors duration-700 ease-out ${heroLoaded ? 'text-stone-text/70' : 'text-stone-text/20'}`}
                  style={{ transitionDelay: `${800 + i * 340}ms` }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Philosophy ─── */}
      <section id="philosophy" className="relative py-32 md:py-40 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto">
          {/* Section intro — asymmetric */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-24">
            <Reveal className="lg:col-span-5">
              <span className="text-xs text-stone-text/40 tracking-[0.2em] uppercase font-medium">Our philosophy</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-secondary leading-[1.1] mt-4">
                Money is personal.<br />
                Its tools should be too.
              </h2>
            </Reveal>
            <Reveal delay={150} className="lg:col-span-5 lg:col-start-8 flex items-end">
              <p className="text-base md:text-lg text-stone-text font-light leading-relaxed">
                Most finance apps optimize for anxiety — red alerts, aggressive nudges, gamified goals. We chose a different path: one built around reflection, clarity, and calm.
              </p>
            </Reveal>
          </div>

          {/* Three pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-secondary/[0.06] rounded-2xl overflow-hidden">
            {[
              {
                number: '01',
                title: 'Reflection over reaction',
                text: 'Every transaction is an opportunity for awareness. We designed Fincurio to slow you down — in the best way — so spending becomes a conscious act.',
              },
              {
                number: '02',
                title: 'Clarity over complexity',
                text: 'No 47-tab dashboards. No overwhelming charts. Just the information you need, presented with the care and restraint of a well-edited magazine.',
              },
              {
                number: '03',
                title: 'Intention over impulse',
                text: 'Set a financial intention — not a rigid budget. Fincurio helps you notice when your actions drift from your values, gently and without judgment.',
              },
            ].map((pillar, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="bg-background-light p-10 md:p-12 space-y-5">
                  <span className="text-xs text-primary font-medium tracking-[0.15em]">{pillar.number}</span>
                  <h3 className="font-serif text-xl md:text-2xl text-secondary leading-snug">{pillar.title}</h3>
                  <p className="text-sm md:text-base text-stone-text font-light leading-relaxed">{pillar.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="relative px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto">

          {/* Feature 1: Journal */}
          <div className="py-24 md:py-32 border-t border-secondary/[0.06]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              <Reveal className="lg:col-span-5 space-y-6">
                <span className="text-xs text-primary font-medium tracking-[0.15em] uppercase">Journal</span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-secondary leading-[1.15]">
                  Record with the care of a diary entry
                </h2>
                <p className="text-base md:text-lg text-stone-text font-light leading-relaxed">
                  Each transaction is more than a line item. Add context, categorize by meaning, and build a living record of your financial choices.
                </p>
                <div className="pt-4 space-y-3">
                  {[
                    'Thoughtful categorization',
                    'Personal notes on every entry',
                    'Search and filter your history',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      <span className="text-sm text-stone-text">{item}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Mock UI */}
              <Reveal delay={200} className="lg:col-span-7">
                <div className="bg-surface-dark rounded-2xl border border-secondary/[0.06] overflow-hidden">
                  <div className="px-8 py-5 border-b border-secondary/[0.06] flex items-center justify-between">
                    <span className="font-serif text-lg text-secondary">Recent entries</span>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary/10"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary/10"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary/10"></div>
                    </div>
                  </div>
                  <div className="divide-y divide-secondary/[0.04]">
                    {[
                      {
                        merchant: 'Target',
                        category: 'Groceries',
                        amount: '-$127.40',
                        date: 'Today',
                        color: 'bg-[#CC0000]',
                        icon: (
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
                            <circle cx="12" cy="12" r="10" fill="white"/>
                            <circle cx="12" cy="12" r="7.5" fill="#CC0000"/>
                            <circle cx="12" cy="12" r="5" fill="white"/>
                            <circle cx="12" cy="12" r="2.5" fill="#CC0000"/>
                          </svg>
                        ),
                      },
                      {
                        merchant: 'Apple',
                        category: 'Tech',
                        amount: '-$2,399.00',
                        date: 'Yesterday',
                        color: 'bg-[#333333]',
                        icon: (
                          <svg viewBox="0 0 384 512" className="w-3.5 h-3.5" fill="white">
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                          </svg>
                        ),
                      },
                      {
                        merchant: 'Netflix',
                        category: 'Entertainment',
                        amount: '-$15.99',
                        date: 'Oct 1',
                        color: 'bg-[#e50914]',
                        icon: (
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="white">
                            <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24h-4.715zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/>
                          </svg>
                        ),
                      },
                      {
                        merchant: 'Spotify',
                        category: 'Entertainment',
                        amount: '-$11.99',
                        date: 'Sep 30',
                        color: 'bg-[#1DB954]',
                        icon: (
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                          </svg>
                        ),
                      },
                    ].map((tx, i) => (
                      <div key={i} className="px-8 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-full ${tx.color} flex items-center justify-center shadow-sm`}>
                            {tx.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-secondary">{tx.merchant}</p>
                            <p className="text-xs text-stone-text/50">{tx.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${tx.amount.startsWith('+') ? 'text-emerald-600' : 'text-secondary'}`}>{tx.amount}</p>
                          <p className="text-xs text-stone-text/40">{tx.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Feature 2: Reflections */}
          <div className="py-24 md:py-32 border-t border-secondary/[0.06]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              {/* Mock UI — left on desktop */}
              <Reveal className="lg:col-span-7 order-2 lg:order-1">
                <div className="bg-surface-dark rounded-2xl border border-secondary/[0.06] overflow-hidden">
                  <div ref={barsRef} className="p-8 md:p-10 space-y-8">
                    <div>
                      <span className="text-xs text-stone-text/40 tracking-wide">October 2025</span>
                      <h3 className="font-serif text-2xl text-secondary mt-1">Monthly reflection</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-stone-text/50">Income</p>
                        <p className="text-xl font-serif text-secondary">$5,800</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-stone-text/50">Spending</p>
                        <p className="text-xl font-serif text-secondary">$4,320</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-stone-text/50">Saved</p>
                        <p className="text-xl font-serif text-emerald-600">$1,480</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      {[
                        { name: 'Shelter', amount: '$1,250', width: '29%', color: 'bg-secondary/60' },
                        { name: 'Tech', amount: '$2,399', width: '55%', color: 'bg-primary' },
                        { name: 'Nourishment', amount: '$420', width: '10%', color: 'bg-primary/50' },
                        { name: 'Other', amount: '$251', width: '6%', color: 'bg-secondary/20' },
                      ].map((cat, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-text">{cat.name}</span>
                            <span className="text-sm text-secondary font-medium">{cat.amount}</span>
                          </div>
                          <div className="w-full h-1.5 bg-secondary/[0.06] rounded-full overflow-hidden">
                            <div
                              className={`h-full ${cat.color} rounded-full transition-all duration-700 ease-out`}
                              style={{ width: barsVisible ? cat.width : '0%', transitionDelay: `${i * 100}ms` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={200} className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                <span className="text-xs text-primary font-medium tracking-[0.15em] uppercase">Reflections</span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-secondary leading-[1.15]">
                  See the shape of your financial life
                </h2>
                <p className="text-base md:text-lg text-stone-text font-light leading-relaxed">
                  Monthly summaries that read like a story, not a spreadsheet. Understand where your money flows and whether it aligns with what matters to you.
                </p>
              </Reveal>
            </div>
          </div>

          {/* Feature 3: Intention — text only, editorial */}
          <div className="py-24 md:py-32 border-t border-secondary/[0.06]">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <Reveal>
                <span className="text-xs text-primary font-medium tracking-[0.15em] uppercase">Intention Setting</span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-secondary leading-[1.15] mt-4">
                  Not a budget. An intention.
                </h2>
                <p className="text-base md:text-lg text-stone-text font-light leading-relaxed mt-4">
                  Budgets feel like restrictions. Intentions feel like alignment. During onboarding, you'll set a financial intention — a north star that guides your Fincurio experience. It's not about perfection; it's about awareness.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <div className="pt-4">
                  <div className="inline-block bg-surface-dark rounded-2xl border border-secondary/[0.06] px-10 py-6">
                    <p className="text-xs text-stone-text/40 mb-2 tracking-wide">Your intention</p>
                    <p className="font-serif text-xl md:text-2xl text-secondary italic">"Spend on what grows me, save for what frees me."</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-32 md:py-40 px-6 md:px-12 lg:px-20 bg-secondary overflow-hidden">
        {/* Subtle texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <Reveal className="lg:col-span-7">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white/90 leading-[1.1]">
                Your money deserves<br />
                more than a spreadsheet.
              </h2>
            </Reveal>
            <Reveal delay={200} className="lg:col-span-5 lg:flex lg:justify-end">
              <div className="space-y-6">
                <button
                  onClick={() => navigate('/signin')}
                  className="group flex items-center gap-3 px-10 py-5 bg-white text-secondary rounded-full text-base font-medium tracking-wide hover:bg-background-light transition-colors"
                >
                  <span>Start your journey</span>
                  <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:translate-x-0.5">arrow_forward</span>
                </button>
                <p className="text-sm text-white/30 tracking-wide">
                  Free forever for core features. No credit card.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative py-16 px-6 md:px-12 lg:px-20 bg-secondary border-t border-white/[0.05]">
        <Reveal fade className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 text-center md:text-left">
            <div className="md:col-span-5 flex flex-col items-center md:items-start">
              <Logo className="h-8" showText={true} textClassName="text-white/80" variant="light" />
              <p className="text-white/30 text-sm leading-relaxed mt-4 max-w-sm">
                A space for intentional financial living. Built with the belief that how you relate to money shapes how you relate to life.
              </p>
            </div>

            <div className="md:col-span-2 md:col-start-8">
              <h4 className="text-white/50 text-xs tracking-[0.15em] uppercase mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-white/30 hover:text-white/70 transition-colors">Features</button></li>
                <li><button onClick={() => document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' })} className="text-white/30 hover:text-white/70 transition-colors">Philosophy</button></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-white/50 text-xs tracking-[0.15em] uppercase mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-white/30 hover:text-white/70 transition-colors">Privacy</a></li>
                <li><a href="#" className="text-white/30 hover:text-white/70 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex items-center justify-center">
            <p className="text-white/20 text-xs tracking-wide">© 2026 Fincurio. Wealth is a mindset.</p>
          </div>
        </Reveal>
      </footer>
    </div>
  );
};

export default Landing;
