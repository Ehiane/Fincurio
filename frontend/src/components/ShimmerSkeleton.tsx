import React from 'react';

interface ShimmerSkeletonProps {
  variant: 'dashboard' | 'journal' | 'reflections';
}

const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({ variant }) => {
  if (variant === 'dashboard') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 space-y-10">
        {/* Hero balance area */}
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="shimmer rounded-lg h-4 w-32" />
          <div className="shimmer rounded-lg h-12 w-64" />
          <div className="shimmer rounded-lg h-4 w-48 mt-2" />
        </div>
        {/* Chart area */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="shimmer rounded-lg h-6 w-28" />
            <div className="flex gap-3">
              <div className="shimmer rounded-full h-4 w-16" />
              <div className="shimmer rounded-full h-4 w-16" />
            </div>
          </div>
          <div className="shimmer rounded-2xl h-64 md:h-80 w-full" />
        </div>
        {/* Recent activity */}
        <div className="space-y-4 rounded-2xl border border-stone-200/40 p-6">
          <div className="flex justify-between mb-6">
            <div className="shimmer rounded-lg h-6 w-32" />
            <div className="shimmer rounded-lg h-4 w-24" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-3">
              <div className="flex gap-4 items-center">
                <div className="shimmer rounded-lg h-4 w-14" />
                <div className="shimmer rounded-lg h-5 w-32" />
              </div>
              <div className="shimmer rounded-lg h-5 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'journal') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 lg:py-16 space-y-10">
        {/* Header */}
        <div className="flex flex-col gap-3 max-w-lg">
          <div className="shimmer rounded-lg h-10 w-72" />
          <div className="shimmer rounded-lg h-4 w-56" />
        </div>
        {/* Date group label */}
        <div className="shimmer rounded-lg h-4 w-20" />
        {/* Transaction rows */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-6 border-b border-stone-200/40">
            <div className="flex items-center gap-5">
              <div className="shimmer rounded-full h-12 w-12 hidden sm:block" />
              <div className="flex flex-col gap-2">
                <div className="shimmer rounded-lg h-5 w-36" />
                <div className="shimmer rounded-full h-5 w-20" />
              </div>
            </div>
            <div className="shimmer rounded-lg h-7 w-24" />
          </div>
        ))}
      </div>
    );
  }

  // reflections
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 lg:py-16 space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="shimmer rounded-lg h-10 w-64" />
        <div className="shimmer rounded-lg h-5 w-80" />
        <div className="shimmer rounded-full h-9 w-36 mt-2" />
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-stone-200/40 p-6 flex flex-col gap-3">
            <div className="shimmer rounded-lg h-3 w-16" />
            <div className="shimmer rounded-lg h-8 w-28" />
          </div>
        ))}
      </div>
      {/* Category breakdown */}
      <div className="space-y-4">
        <div className="shimmer rounded-lg h-4 w-40 border-b border-stone-200/40 pb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-[18px] border border-stone-200/40 p-5 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="shimmer rounded-full h-12 w-12" />
              <div className="flex flex-col gap-2">
                <div className="shimmer rounded-lg h-5 w-24" />
                <div className="shimmer rounded-lg h-3 w-20" />
              </div>
            </div>
            <div className="shimmer rounded-lg h-7 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShimmerSkeleton;
