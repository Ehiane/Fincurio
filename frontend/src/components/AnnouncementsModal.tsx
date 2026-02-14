import React from 'react';
import { Announcement } from '../data/announcements';
import { useAnnouncements } from '../hooks/useAnnouncements';

const typeBadge: Record<Announcement['type'], { label: string; className: string }> = {
  feature: { label: 'New', className: 'bg-emerald-100 text-emerald-700' },
  improvement: { label: 'Improved', className: 'bg-sky-100 text-sky-700' },
  fix: { label: 'Fixed', className: 'bg-amber-100 text-amber-700' },
};

const AnnouncementsModal: React.FC = () => {
  const { unseen, showModal, dismiss } = useAnnouncements();

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-secondary/40 backdrop-blur-sm animate-fade-in"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-primary text-3xl">campaign</span>
            <h2 className="font-serif text-2xl text-secondary">What's New</h2>
          </div>
          <p className="text-stone-text text-sm">
            Here's what we've been working on since your last visit.
          </p>
        </div>

        {/* Announcements list */}
        <div className="px-8 pb-4 max-h-[50vh] overflow-y-auto">
          <div className="space-y-5">
            {unseen.map((item) => {
              const badge = typeBadge[item.type];
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-secondary">{item.title}</h3>
                    <p className="text-xs text-stone-text mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-stone-100 flex justify-end">
          <button
            onClick={dismiss}
            className="px-6 py-2.5 rounded-full bg-primary hover:bg-[#c9431a] text-white text-sm font-medium transition-all duration-300 shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsModal;
