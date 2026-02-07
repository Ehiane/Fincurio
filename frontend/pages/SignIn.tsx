import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';
import { authApi } from '../src/api/auth.api';
import Logo from '../src/components/Logo';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordRequirements = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One digit', met: /\d/.test(password) },
    { label: 'One special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password) },
  ], [password]);

  const passwordStrength = useMemo(() => {
    const metCount = passwordRequirements.filter(r => r.met).length;
    if (password.length === 0) return { level: 0, label: '', color: '' };
    if (metCount <= 1) return { level: 1, label: 'Weak', color: 'bg-red-400' };
    if (metCount === 2) return { level: 2, label: 'Fair', color: 'bg-orange-400' };
    if (metCount === 3) return { level: 3, label: 'Good', color: 'bg-yellow-400' };
    return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
  }, [password, passwordRequirements]);

  const allRequirementsMet = passwordRequirements.every(r => r.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isForgotPassword) {
        // Send password reset email
        const response = await authApi.forgotPassword({ email });
        setSuccess(response.message);
        setEmail('');

        // Switch back to login mode after 5 seconds
        setTimeout(() => {
          setIsForgotPassword(false);
          setSuccess('');
        }, 5000);
      } else if (isSignUp) {
        if (!allRequirementsMet) {
          setError('Password does not meet all requirements');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
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

  const insights = [
    { icon: 'auto_graph', text: 'Track spending patterns with reflective insights' },
    { icon: 'edit_note', text: 'Journal your financial decisions and intentions' },
    { icon: 'psychology', text: 'Build mindful money habits over time' },
  ];

  return (
    <div className="w-full min-h-screen bg-background-light flex relative overflow-hidden">
      {/* Left Panel — Brand Side */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative bg-gradient-to-br from-[#280905] via-[#3a1410] to-[#1a0604] flex-col justify-between p-12 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-white/5 rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/[0.03] rounded-full pointer-events-none"></div>

        {/* Top — Logo & back to landing */}
        <div className="relative z-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group mb-8"
          >
            <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span className="text-sm font-light tracking-wide">Back to home</span>
          </button>
          <Logo className="h-10" showText={true} textClassName="text-white/90" variant="light" />
        </div>

        {/* Middle — Brand message */}
        <div className="relative z-10 space-y-8">
          <h2 className="font-serif text-3xl xl:text-4xl font-normal leading-snug text-white/90">
            Where finance meets<br />
            <span className="italic text-primary">intention.</span>
          </h2>
          <p className="text-white/50 text-base font-light leading-relaxed max-w-sm">
            Fincurio isn't just another finance app. It's a space for reflection, clarity, and purposeful financial living.
          </p>

          <div className="space-y-5 pt-4">
            {insights.map((item, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                  <span className="material-symbols-outlined text-lg text-primary/80">{item.icon}</span>
                </div>
                <p className="text-white/60 text-sm font-light leading-relaxed pt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — Quote */}
        <div className="relative z-10">
          <div className="border-t border-white/10 pt-6">
            <p className="text-white/40 text-xs font-light italic leading-relaxed">
              "The art is not in making money, but in keeping it, and growing it with intention."
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-[120px] pointer-events-none opacity-20"></div>

        {/* Mobile: back to landing link */}
        <button
          onClick={() => navigate('/')}
          className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-stone-text hover:text-primary transition-colors group z-20"
        >
          <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span className="text-sm font-light">Home</span>
        </button>

        <div className="w-full max-w-md flex flex-col items-center z-10">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 opacity-80 hover:opacity-100 transition-opacity">
            <Logo className="h-10" showText={true} />
          </div>

          <div className="text-center mb-10 md:mb-12 space-y-3 w-full">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-tight tracking-tight text-secondary">
              {isForgotPassword ? 'Reset your password.' : isSignUp ? 'Start your journey.' : 'Welcome back.'}
            </h1>
            <p className="text-stone-text text-sm sm:text-base font-light">
              {isForgotPassword
                ? 'Enter your email to receive a password reset link.'
                : isSignUp
                  ? 'Create your Fincurio account to begin.'
                  : 'Sign in to continue your financial reflection.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-800 text-sm">
                {success}
              </div>
            )}

            {isSignUp && !isForgotPassword && (
              <div className="flex gap-3">
                <div className="relative flex items-center group flex-1">
                  <span className="absolute left-5 text-stone-text/60 material-symbols-outlined text-xl transition-colors group-focus-within:text-primary pointer-events-none">person</span>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full h-14 bg-surface-dark border-none rounded-full py-4 pl-14 pr-5 text-base text-secondary placeholder:text-stone-text/40 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  />
                </div>
                <div className="relative flex items-center group flex-1">
                  <span className="absolute left-5 text-stone-text/60 material-symbols-outlined text-xl transition-colors group-focus-within:text-primary pointer-events-none">person</span>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full h-14 bg-surface-dark border-none rounded-full py-4 pl-14 pr-5 text-base text-secondary placeholder:text-stone-text/40 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            <div className="relative flex items-center group">
              <span className="absolute left-5 text-stone-text/60 material-symbols-outlined text-xl transition-colors group-focus-within:text-primary pointer-events-none">mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-14 bg-surface-dark border-none rounded-full py-4 pl-14 pr-5 text-base text-secondary placeholder:text-stone-text/40 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>

            {!isForgotPassword && (
              <div className="relative flex items-center group">
                <span className="absolute left-5 text-stone-text/60 material-symbols-outlined text-xl transition-colors group-focus-within:text-primary pointer-events-none">lock</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 bg-surface-dark border-none rounded-full py-4 pl-14 pr-14 text-base text-secondary placeholder:text-stone-text/40 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 text-stone-text/50 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            )}

            {/* Password strength & requirements (sign-up only) */}
            {isSignUp && password.length > 0 && (
              <div className="-mt-2 px-2 space-y-3">
                {/* Strength bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-text/60">Password strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.level <= 1 ? 'text-red-500' :
                      passwordStrength.level === 2 ? 'text-orange-500' :
                      passwordStrength.level === 3 ? 'text-yellow-600' :
                      'text-emerald-600'
                    }`}>{passwordStrength.label}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= passwordStrength.level ? passwordStrength.color : 'bg-stone-300/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Requirements checklist */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm transition-colors duration-200 ${
                        req.met ? 'text-emerald-500' : 'text-stone-text/30'
                      }`}>
                        {req.met ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className={`text-xs transition-colors duration-200 ${
                        req.met ? 'text-stone-text/80' : 'text-stone-text/40'
                      }`}>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm password (sign-up only) */}
            {isSignUp && (
              <div className="relative flex items-center group">
                <span className="absolute left-5 text-stone-text/60 material-symbols-outlined text-xl transition-colors group-focus-within:text-primary pointer-events-none">lock</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className={`w-full h-14 bg-surface-dark border-none rounded-full py-4 pl-14 pr-14 text-base text-secondary placeholder:text-stone-text/40 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm ${
                    confirmPassword.length > 0 && password !== confirmPassword ? 'ring-2 ring-red-300/50' : ''
                  }`}
                />
                {confirmPassword.length > 0 && (
                  <span className={`absolute right-5 material-symbols-outlined text-lg ${
                    password === confirmPassword ? 'text-emerald-500' : 'text-red-400'
                  }`}>
                    {password === confirmPassword ? 'check_circle' : 'error'}
                  </span>
                )}
              </div>
            )}

            {!isSignUp && !isForgotPassword && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs text-primary/80 hover:text-primary hover:underline transition-all"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-full bg-primary hover:bg-[#c9431a] disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-base font-medium tracking-wide shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group mt-2"
            >
              <span>{loading ? 'Loading...' : (isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Enter Fincurio')}</span>
              {!loading && (
                <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
              )}
            </button>

            <div className="flex justify-center items-center gap-4 mt-6 text-sm text-stone-text/70">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
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
    </div>
  );
};

export default SignIn;
