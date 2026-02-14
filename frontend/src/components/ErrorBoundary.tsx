import React, { Component, ErrorInfo, ReactNode } from 'react';
import Logo from './Logo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col bg-background-light relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-1/4 -right-32 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/3 -left-24 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Header */}
          <header className="w-full px-6 py-5 md:px-12 md:py-6 z-10">
            <a href="/" className="hover:opacity-80 transition-opacity inline-block">
              <Logo className="h-10 md:h-12" showText={true} />
            </a>
          </header>

          {/* Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 z-10">
            <div className="flex flex-col items-center gap-6 text-center max-w-lg fade-in-up">
              {/* Icon */}
              <div className="relative">
                <span className="font-serif text-[120px] md:text-[160px] font-light leading-none text-stone-300/60 select-none">
                  500
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl md:text-6xl text-red-400/60" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                    heart_broken
                  </span>
                </div>
              </div>

              {/* Message */}
              <h1 className="font-serif font-light text-2xl md:text-3xl text-secondary -mt-4">
                Something broke
              </h1>
              <p className="text-stone-text text-sm md:text-base font-light leading-relaxed max-w-sm">
                An unexpected error occurred. Try refreshing the page — if the problem persists, our team is on it.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 rounded-full border border-stone-300/60 bg-white/60 backdrop-blur-sm text-secondary text-sm font-medium hover:border-primary/50 hover:shadow-md transition-all duration-300"
                >
                  Refresh page
                </button>
                <a
                  href="/"
                  className="px-6 py-3 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Return home
                </a>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
