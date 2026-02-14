import React, { useState, useRef, useEffect } from 'react';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-6 h-6 rounded-full text-xs font-serif italic flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-primary/15 text-primary'
            : 'bg-stone-300/50 text-stone-500 hover:bg-primary/10 hover:text-primary'
        }`}
        style={{
          boxShadow: open
            ? '0 0 10px rgba(230, 80, 27, 0.3), 0 0 4px rgba(230, 80, 27, 0.15)'
            : '0 0 6px rgba(0, 0, 0, 0.06)',
        }}
        aria-label="More information"
      >
        i
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 fade-in-up" style={{ animationDuration: '0.2s' }}>
          <div className="w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-stone-900/8 border border-stone-200/60 px-5 py-4 text-left">
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-l border-t border-stone-200/60 rotate-45"></div>
            <p className="text-[13px] leading-relaxed text-stone-600 tracking-[-0.01em]">{text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
