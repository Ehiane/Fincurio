import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../src/components/Logo';

const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col bg-background-light relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-24 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="w-full px-6 py-5 md:px-12 md:py-6 z-10">
        <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity">
          <Logo className="h-10 md:h-12" showText={true} />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 z-10">
        <div className="flex flex-col items-center gap-6 text-center max-w-lg fade-in-up">
          {/* Large 403 */}
          <div className="relative">
            <span className="font-serif text-[120px] md:text-[160px] font-light leading-none text-stone-300/60 select-none">
              403
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl md:text-6xl text-primary/60" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                lock
              </span>
            </div>
          </div>

          {/* Message */}
          <h1 className="font-serif font-light text-2xl md:text-3xl text-secondary -mt-4">
            Access denied
          </h1>
          <p className="text-stone-text text-sm md:text-base font-light leading-relaxed max-w-sm">
            You don't have permission to view this page. If you think this is a mistake, try signing in again.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-full border border-stone-300/60 bg-white/60 backdrop-blur-sm text-secondary text-sm font-medium hover:border-primary/50 hover:shadow-md transition-all duration-300"
            >
              Go back
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="px-6 py-3 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Sign in
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Forbidden;
