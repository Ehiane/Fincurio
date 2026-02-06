
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-background-light dark:bg-background-dark flex flex-col transition-colors duration-300 relative overflow-hidden">
      <header className="w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <span className="material-symbols-outlined text-[32px]">savings</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight hidden md:block">Fincurio</h2>
        </div>
        
        <div className="absolute left-1/2 top-8 -translate-x-1/2 hidden md:flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-full border border-gray-200 dark:border-white/10">
          <span className="text-sm font-medium opacity-60">Step 1 of 3</span>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-white/20"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-white/20"></div>
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

        <div className="w-full max-w-3xl flex flex-col items-center gap-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight text-[#181112] dark:text-[#f3ebec]">
            What is your primary intention for your finances this year?
          </h1>

          <div className="w-full max-w-xl mt-4 md:mt-8 relative group">
            <div className="w-full pb-2 border-b border-gray-300 dark:border-white/20 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:w-0 group-focus-within:after:w-full after:transition-all after:duration-500">
              <input 
                autoFocus
                type="text" 
                placeholder="I want to feel..."
                className="w-full bg-transparent border-none p-0 text-2xl md:text-3xl lg:text-4xl text-center placeholder:text-gray-400 dark:placeholder:text-white/20 focus:ring-0 text-primary font-serif italic"
              />
            </div>
            <p className="mt-4 text-sm md:text-base text-gray-500 dark:text-gray-400 font-light">
              Focus on a feeling, like 'security', 'freedom', or 'calm'.
            </p>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <button 
              onClick={() => navigate('/app/dashboard')}
              className="group flex items-center justify-center gap-3 bg-primary hover:bg-red-700 text-white pl-8 pr-6 py-4 rounded-full transition-all duration-300 shadow-lg hover:pr-8"
            >
              <span className="text-lg font-medium">Continue</span>
              <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            </button>
            <div className="text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1.5 hidden md:flex">
              <span>Press</span>
              <kbd className="px-2 py-0.5 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-white/5 font-sans text-[10px]">Enter</kbd>
              <span>to continue</span>
            </div>
          </div>
        </div>
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
