
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SignInProps {
  onSignIn: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn();
    navigate('/onboarding');
  };

  return (
    <div className="w-full min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-[120px] pointer-events-none opacity-30 dark:opacity-10"></div>
      
      <div className="w-full max-w-2xl flex flex-col items-center z-10">
        <div className="mb-12 opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-4xl">savings</span>
            <span className="text-xl font-medium tracking-wide text-gray-800 dark:text-gray-200">Fincurio</span>
          </div>
        </div>

        <div className="text-center mb-16 space-y-4 max-w-lg">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-tight tracking-tight text-gray-900 dark:text-white">
            Welcome back to your reflection.
          </h1>
          <p className="text-gray-500 dark:text-stone-text text-lg font-light">
            Clarity in finance begins here.
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full max-w-md flex flex-col gap-8">
          <div className="relative flex items-center group">
            <span className="absolute left-6 text-gray-400 dark:text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">mail</span>
            <input 
              type="email" 
              required
              placeholder="name@example.com"
              className="w-full h-16 bg-white dark:bg-surface-dark border-none rounded-full py-4 pl-14 pr-6 text-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>

          <div className="relative flex items-center group">
            <span className="absolute left-6 text-gray-400 dark:text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">lock</span>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full h-16 bg-white dark:bg-surface-dark border-none rounded-full py-4 pl-14 pr-6 text-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
            <button type="button" className="absolute right-6 text-gray-400 dark:text-gray-500">
              <span className="material-symbols-outlined text-xl">visibility_off</span>
            </button>
          </div>

          <button 
            type="submit"
            className="w-full h-16 rounded-full bg-primary hover:bg-[#b0132e] text-white text-lg font-medium tracking-wide shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>Enter Fincurio</span>
            <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
          </button>

          <div className="flex justify-between items-center gap-4 mt-8 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-primary transition-colors">Create an account</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">Forgot password?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
