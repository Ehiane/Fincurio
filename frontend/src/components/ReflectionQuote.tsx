import React, { useState, useEffect } from 'react';

const QUOTES = [
  "Reviewing your story\u2026",
  "Every transaction tells a chapter.",
  "Clarity begins with observation.",
  "Your money, reflected.",
  "Gathering the threads of your finances\u2026",
  "Patterns emerge from patience.",
  "The ledger holds no judgments.",
  "Numbers become insight with attention.",
  "Composing your financial portrait\u2026",
  "Understanding starts here.",
];

const ReflectionQuote: React.FC = () => {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * QUOTES.length)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 md:py-32 gap-6">
      <p
        key={index}
        className="font-serif italic text-stone-400 text-lg md:text-xl text-center quote-fade"
      >
        {QUOTES[index]}
      </p>
      <div className="h-[2px] w-12 bg-primary rounded-full accent-breathe" />
    </div>
  );
};

export default ReflectionQuote;
