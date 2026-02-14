import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../src/components/Logo';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col bg-background-light relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="w-full px-6 py-5 md:px-12 md:py-6 z-10">
        <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity">
          <Logo className="h-10 md:h-12" showText={true} />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 z-10">
        <div className="flex flex-col items-center gap-6 text-center max-w-lg fade-in-up">
          {/* Large 404 */}
          <div className="relative">
            <span className="font-serif text-[120px] md:text-[160px] font-light leading-none text-stone-300/60 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl md:text-6xl text-primary/60" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                explore_off
              </span>
            </div>
          </div>

          {/* Message */}
          <h1 className="font-serif font-light text-2xl md:text-3xl text-secondary -mt-4">
            Page not found
          </h1>
          <p className="text-stone-text text-sm md:text-base font-light leading-relaxed max-w-sm">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
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
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Return home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
