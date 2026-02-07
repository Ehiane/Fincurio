import React, { useState } from 'react';
import { authApi } from '../src/api/auth.api';
import { useAuth } from '../src/hooks/useAuth';

const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dismissed, setDismissed] = useState(false);

  // Don't show if user is verified or banner is dismissed
  if (!user || user.isEmailVerified || dismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await authApi.resendVerification({ email: user.email });
      setMessage(response.message);

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <span className="material-symbols-outlined text-primary text-2xl">mark_email_unread</span>
          <div className="flex-1">
            <p className="text-secondary font-medium text-sm">
              Please verify your email address
            </p>
            {message ? (
              <p className="text-stone-text text-xs mt-1">{message}</p>
            ) : (
              <p className="text-stone-text text-xs mt-1">
                Check your inbox for a verification link, or click below to resend.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-primary hover:bg-[#c9431a] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-300 shadow-sm"
          >
            {loading ? 'Sending...' : 'Resend Email'}
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-2 rounded-full hover:bg-stone-200 transition-colors"
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined text-stone-text text-lg">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
