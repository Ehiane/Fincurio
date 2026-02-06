import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await register({ email, password, firstName, lastName });
        navigate('/onboarding');
      } else {
        await login({ email, password });
        // Check if user has completed onboarding by checking if they have preferences
        navigate('/app/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
            {isSignUp ? 'Begin your financial reflection.' : 'Welcome back to your reflection.'}
          </h1>
          <p className="text-gray-500 dark:text-stone-text text-lg font-light">
            Clarity in finance begins here.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {isSignUp && (
            <>
              <div className="relative flex items-center group">
                <span className="absolute left-6 text-gray-400 dark:text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">person</span>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full h-16 bg-white dark:bg-surface-dark border-none rounded-full py-4 pl-14 pr-6 text-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
              </div>

              <div className="relative flex items-center group">
                <span className="absolute left-6 text-gray-400 dark:text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">person</span>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full h-16 bg-white dark:bg-surface-dark border-none rounded-full py-4 pl-14 pr-6 text-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
              </div>
            </>
          )}

          <div className="relative flex items-center group">
            <span className="absolute left-6 text-gray-400 dark:text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-16 bg-white dark:bg-surface-dark border-none rounded-full py-4 pl-14 pr-6 text-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>

          <div className="relative flex items-center group">
            <span className="absolute left-6 text-gray-400 dark:text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">lock</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-16 bg-white dark:bg-surface-dark border-none rounded-full py-4 pl-14 pr-6 text-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 rounded-full bg-primary hover:bg-[#b0132e] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-lg font-medium tracking-wide shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>{loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Enter Fincurio')}</span>
            {!loading && (
              <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            )}
          </button>

          <div className="flex justify-center items-center gap-4 mt-8 text-sm text-gray-500 dark:text-gray-400">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="hover:text-primary transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
