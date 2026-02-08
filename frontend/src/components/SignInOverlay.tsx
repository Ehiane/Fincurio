import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface SignInOverlayProps {
  visible: boolean;
}

const WELCOME_LINES = [
  "Welcome back.",
  "Let's see where you stand.",
  "Your money, understood.",
  "Ready when you are.",
  "Good to see you again.",
];

const SignInOverlay: React.FC<SignInOverlayProps> = ({ visible }) => {
  const [phase, setPhase] = useState<'hidden' | 'entering' | 'visible' | 'exiting'>('hidden');
  const [mounted, setMounted] = useState(false);
  const [line] = useState(() =>
    WELCOME_LINES[Math.floor(Math.random() * WELCOME_LINES.length)]
  );

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setPhase('entering');
      const t = setTimeout(() => setPhase('visible'), 50);
      return () => clearTimeout(t);
    } else if (mounted) {
      setPhase('exiting');
      const t = setTimeout(() => {
        setPhase('hidden');
        setMounted(false);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (phase === 'hidden') return null;

  const showing = phase === 'visible';
  const hiding = phase === 'exiting';

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-secondary transition-opacity duration-500"
      style={{ opacity: phase === 'entering' || hiding ? 0 : 1 }}
    >
      {/* Logo */}
      <div
        className="mb-8 transition-all duration-700 ease-out"
        style={{
          opacity: showing ? 1 : 0,
          transform: showing ? 'translateY(0)' : 'translateY(8px)',
          transitionDelay: hiding ? '0ms' : '200ms',
        }}
      >
        <Logo className="h-10" showText={false} variant="light" />
      </div>

      {/* Welcome text */}
      <p
        className="font-serif italic text-white/60 text-lg md:text-xl tracking-wide transition-all duration-700 ease-out"
        style={{
          opacity: showing ? 1 : 0,
          transform: showing ? 'translateY(0)' : 'translateY(12px)',
          transitionDelay: hiding ? '0ms' : '400ms',
        }}
      >
        {line}
      </p>

      {/* Breathing accent line */}
      <div
        className="mt-6 h-[2px] w-10 bg-primary rounded-full accent-breathe transition-all duration-700 ease-out"
        style={{
          opacity: showing ? 1 : 0,
          transitionDelay: hiding ? '0ms' : '600ms',
        }}
      />
    </div>
  );
};

export default SignInOverlay;
