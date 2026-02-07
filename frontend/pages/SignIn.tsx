import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';
import { authApi } from '../src/api/auth.api';
import Logo from '../src/components/Logo';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isResetPassword) {
        // Validate passwords match
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        // Reset password
        const response = await authApi.resetPassword({ email, newPassword: password });
        setSuccess(response.message);
        setPassword('');
        setConfirmPassword('');

        // Switch back to login mode after 2 seconds
        setTimeout(() => {
          setIsResetPassword(false);
          setSuccess('');
        }, 2000);
      } else if (isSignUp) {
        await register({ email, password, firstName, lastName });
        navigate('/onboarding');
      } else {
        await login({ email, password });
        navigate('/app/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background-light flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-[120px] pointer-events-none opacity-30 dark:opacity-10"></div>

      <div className="w-full max-w-2xl flex flex-col items-center z-10">
        <div className="mb-12 opacity-80 hover:opacity-100 transition-opacity">
          <Logo className="h-12" showText={true} />
        </div>

        <div className="text-center mb-12 md:mb-16 space-y-4 max-w-lg px-4">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-normal leading-tight tracking-tight text-gray-900 text-secondary">
            {isResetPassword ? 'Reset your password.' : isSignUp ? 'Begin your financial reflection.' : 'Welcome back to your reflection.'}
          </h1>
          <p className="text-gray-500 text-stone-text text-base sm:text-base md:text-lg font-light">
            {isResetPassword ? 'Enter your email and new password.' : 'Clarity in finance begins here.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-8">
          {error && (
            <div className="bg-red-50 bg-red-50 border border-red-200 border-red-200 rounded-2xl p-4 text-red-800 text-red-800 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 bg-green-50 border border-green-200 border-green-200 rounded-2xl p-4 text-green-800 text-green-800 text-sm">
              {success}
            </div>
          )}

          {isSignUp && !isResetPassword && (
            <>
              <div className="relative flex items-center group">
                <span className="absolute left-6 text-gray-400 text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">person</span>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full h-16 bg-white bg-surface-dark border-none rounded-full py-4 pl-14 pr-6 text-lg text-gray-900 text-secondary placeholder:text-gray-400  focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
              </div>

              <div className="relative flex items-center group">
                <span className="absolute left-6 text-gray-400 text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">person</span>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full h-16 bg-white bg-surface-dark border-none rounded-full py-4 pl-14 pr-6 text-lg text-gray-900 text-secondary placeholder:text-gray-400  focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
              </div>
            </>
          )}

          <div className="relative flex items-center group">
            <span className="absolute left-6 text-gray-400 text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-16 bg-white bg-surface-dark border-none rounded-full py-4 pl-14 pr-6 text-lg text-gray-900 text-secondary placeholder:text-gray-400  focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>

          <div className="relative flex items-center group">
            <span className="absolute left-6 text-gray-400 text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">lock</span>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isResetPassword ? "New password" : "••••••••"}
              className="w-full h-16 bg-white bg-surface-dark border-none rounded-full py-4 pl-14 pr-14 text-lg text-gray-900 text-secondary placeholder:text-gray-400  focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 text-gray-400 text-gray-500 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {isResetPassword && (
            <div className="relative flex items-center group">
              <span className="absolute left-6 text-gray-400 text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">lock</span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-16 bg-white bg-surface-dark border-none rounded-full py-4 pl-14 pr-14 text-lg text-gray-900 text-secondary placeholder:text-gray-400  focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>
          )}

          {!isSignUp && !isResetPassword && (
            <div className="flex justify-end -mt-4">
              <button
                type="button"
                onClick={() => setIsResetPassword(true)}
                className="text-sm text-primary hover:underline transition-all"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 rounded-full bg-primary hover:bg-[#b0132e] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-lg font-medium tracking-wide shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>{loading ? 'Loading...' : (isResetPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Enter Fincurio')}</span>
            {!loading && (
              <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            )}
          </button>

          <div className="flex justify-center items-center gap-4 mt-8 text-sm text-gray-500 text-gray-400">
            {isResetPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsResetPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="hover:text-primary transition-colors"
              >
                Back to sign in
              </button>
            ) : (
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
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
