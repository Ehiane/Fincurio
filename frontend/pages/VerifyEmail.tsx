import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../src/api/auth.api';
import Logo from '../src/components/Logo';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        if (mounted) {
          setStatus('error');
          setMessage('Invalid verification link. Please check your email and try again.');
        }
        return;
      }

      try {
        const response = await authApi.verifyEmail(token);

        if (!mounted) return;

        if (response.success) {
          setStatus('success');
          setMessage(response.message);

          // Redirect to sign in after 3 seconds
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.message);
        }
      } catch (err: any) {
        if (!mounted) return;
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Please try again.');
      }
    };

    verifyEmail();

    return () => {
      mounted = false;
    };
  }, [searchParams, navigate]);

  return (
    <div className="w-full min-h-screen bg-background-light flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-[120px] pointer-events-none opacity-30"></div>

      <div className="w-full max-w-2xl flex flex-col items-center z-10">
        <div className="mb-12 opacity-80 hover:opacity-100 transition-opacity">
          <Logo className="h-12" showText={true} />
        </div>

        <div className="w-full max-w-md bg-surface-dark border border-stone-200 rounded-2xl p-12 shadow-sm">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
              <div className="text-center">
                <h1 className="font-serif text-2xl font-normal text-secondary mb-2">
                  Verifying your email...
                </h1>
                <p className="text-stone-text">
                  Please wait while we verify your account.
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
              </div>
              <div className="text-center">
                <h1 className="font-serif text-2xl font-normal text-secondary mb-2">
                  Email Verified!
                </h1>
                <p className="text-stone-text mb-6">
                  {message || 'Your email has been successfully verified.'}
                </p>
                <p className="text-sm text-stone-text">
                  Redirecting you to sign in...
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 text-4xl">error</span>
              </div>
              <div className="text-center">
                <h1 className="font-serif text-2xl font-normal text-secondary mb-2">
                  Verification Failed
                </h1>
                <p className="text-stone-text mb-8">
                  {message}
                </p>
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full h-14 rounded-full bg-primary hover:bg-[#b0132e] text-white text-base font-medium tracking-wide shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <span>Back to Sign In</span>
                  <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
