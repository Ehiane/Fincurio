import React from 'react';
import Logo from '../src/components/Logo';

const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background-light relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 -right-24 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="w-full px-6 py-5 md:px-12 md:py-6 z-10">
        <a href="/" className="hover:opacity-80 transition-opacity inline-block">
          <Logo className="h-10 md:h-12" showText={true} />
        </a>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 z-10">
        <div className="flex flex-col items-center gap-6 text-center max-w-lg fade-in-up">
          {/* Icon */}
          <div className="w-24 h-24 rounded-full bg-blue-50 border border-blue-200/60 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-blue-400/70" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
              engineering
            </span>
          </div>

          {/* Message */}
          <h1 className="font-serif font-light text-2xl md:text-3xl text-secondary">
            We'll be right back
          </h1>
          <p className="text-stone-text text-sm md:text-base font-light leading-relaxed max-w-sm">
            Fincurio is undergoing scheduled maintenance to improve your experience. We'll be back shortly.
          </p>

          {/* Status hint */}
          <div className="flex items-center gap-2 mt-2 px-4 py-2.5 bg-white/60 backdrop-blur-sm rounded-full border border-stone-300/60">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-sm text-stone-text font-light">Maintenance in progress</span>
          </div>

          {/* Action */}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 rounded-full border border-stone-300/60 bg-white/60 backdrop-blur-sm text-secondary text-sm font-medium hover:border-primary/50 hover:shadow-md transition-all duration-300"
          >
            Check again
          </button>
        </div>
      </main>
    </div>
  );
};

export default Maintenance;
