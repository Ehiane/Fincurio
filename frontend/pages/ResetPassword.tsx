import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../src/api/auth.api';
import Logo from '../src/components/Logo';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full min-h-screen bg-background-light flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-dark border border-stone-200 rounded-2xl p-12 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-red-600 text-4xl">error</span>
          </div>
          <h1 className="font-serif text-2xl font-normal text-secondary mb-2">
            Invalid Reset Link
          </h1>
          <p className="text-stone-text mb-8">
            This password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate('/signin')}
            className="w-full h-14 rounded-full bg-primary hover:bg-[#b0132e] text-white text-base font-medium tracking-wide shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full min-h-screen bg-background-light flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-[120px] pointer-events-none opacity-30"></div>

        <div className="w-full max-w-2xl flex flex-col items-center z-10">
          <div className="mb-12 opacity-80 hover:opacity-100 transition-opacity">
            <Logo className="h-12" showText={true} />
          </div>

          <div className="w-full max-w-md bg-surface-dark border border-stone-200 rounded-2xl p-12 shadow-sm">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
              </div>
              <div className="text-center">
                <h1 className="font-serif text-2xl font-normal text-secondary mb-2">
                  Password Reset Successfully
                </h1>
                <p className="text-stone-text mb-6">
                  Your password has been changed. You can now sign in with your new password.
                </p>
                <p className="text-sm text-stone-text">
                  Redirecting you to sign in...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background-light flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-[120px] pointer-events-none opacity-30"></div>

      <div className="w-full max-w-2xl flex flex-col items-center z-10">
        <div className="mb-12 opacity-80 hover:opacity-100 transition-opacity">
          <Logo className="h-12" showText={true} />
        </div>

        <div className="text-center mb-12 space-y-4 max-w-lg px-4">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-normal leading-tight tracking-tight text-secondary">
            Create a new password.
          </h1>
          <p className="text-stone-text text-base sm:text-base md:text-lg font-light">
            Choose a strong password to secure your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="relative flex items-center group">
            <span className="absolute left-6 text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">lock</span>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full h-16 bg-surface-dark border-none rounded-full py-4 pl-14 pr-14 text-lg text-secondary placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 text-gray-500 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          <div className="relative flex items-center group">
            <span className="absolute left-6 text-gray-500 material-symbols-outlined transition-colors group-focus-within:text-primary">lock</span>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full h-16 bg-surface-dark border-none rounded-full py-4 pl-14 pr-14 text-lg text-secondary placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 rounded-full bg-primary hover:bg-[#b0132e] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-lg font-medium tracking-wide shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
            {!loading && (
              <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            )}
          </button>

          <div className="flex justify-center items-center gap-4 mt-8 text-sm text-gray-400">
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="hover:text-primary transition-colors"
            >
              Back to sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
