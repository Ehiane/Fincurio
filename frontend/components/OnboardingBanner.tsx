import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';

const OnboardingBanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if onboarding is complete or banner is dismissed
  if (!user || user.hasCompletedOnboarding || dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <span className="material-symbols-outlined text-amber-600 text-2xl">rocket_launch</span>
          <div className="flex-1">
            <p className="text-secondary font-medium text-sm">
              Finish setting up your account
            </p>
            <p className="text-stone-text text-xs mt-1">
              Complete onboarding to unlock budgeting tools, income tracking, and personalised insights.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/onboarding')}
            className="px-4 py-2 rounded-full bg-primary hover:bg-[#c9431a] text-white text-sm font-medium transition-all duration-300 shadow-sm"
          >
            Continue Setup
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

export default OnboardingBanner;
