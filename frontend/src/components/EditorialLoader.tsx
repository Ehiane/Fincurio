import React, { useState, useEffect, useRef } from 'react';
import ShimmerSkeleton from './ShimmerSkeleton';
import ReflectionQuote from './ReflectionQuote';

interface EditorialLoaderProps {
  variant: 'dashboard' | 'journal' | 'reflections';
  isLoading: boolean;
  children: React.ReactNode;
}

const SHIMMER_THRESHOLD = 1500; // ms before showing quotes
const FLASH_GUARD = 100; // ms — skip loader entirely for cache hits

const EditorialLoader: React.FC<EditorialLoaderProps> = ({
  variant,
  isLoading,
  children,
}) => {
  const [phase, setPhase] = useState<'hidden' | 'shimmer' | 'quote' | 'done'>(
    isLoading ? 'hidden' : 'done'
  );
  const flashTimer = useRef<number>();
  const quoteTimer = useRef<number>();

  useEffect(() => {
    if (isLoading) {
      // Start with hidden — only show shimmer after flash guard delay
      setPhase('hidden');

      flashTimer.current = window.setTimeout(() => {
        setPhase('shimmer');

        // After shimmer threshold, transition to quote
        quoteTimer.current = window.setTimeout(() => {
          setPhase('quote');
        }, SHIMMER_THRESHOLD);
      }, FLASH_GUARD);
    } else {
      // Loading finished — clear all timers, go to done
      clearTimeout(flashTimer.current);
      clearTimeout(quoteTimer.current);
      setPhase('done');
    }

    return () => {
      clearTimeout(flashTimer.current);
      clearTimeout(quoteTimer.current);
    };
  }, [isLoading]);

  if (phase === 'done') {
    return <>{children}</>;
  }

  if (phase === 'hidden') {
    // Within flash guard — render nothing to avoid flicker on cache hits
    return null;
  }

  return (
    <div className="relative min-h-[60vh]">
      {/* Shimmer layer */}
      <div
        className="transition-opacity duration-400"
        style={{ opacity: phase === 'shimmer' ? 1 : 0 }}
      >
        <ShimmerSkeleton variant={variant} />
      </div>

      {/* Quote layer */}
      {phase === 'quote' && (
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-400">
          <ReflectionQuote />
        </div>
      )}
    </div>
  );
};

export default EditorialLoader;
