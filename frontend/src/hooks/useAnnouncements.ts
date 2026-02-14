import { useMemo, useState, useCallback } from 'react';
import announcements, { Announcement } from '../data/announcements';

const STORAGE_KEY = 'lastSeenAnnouncementId';

export interface UseAnnouncementsReturn {
  /** Announcements the user hasn't seen yet (newest first) */
  unseen: Announcement[];
  /** Whether the modal should be visible */
  showModal: boolean;
  /** Call to dismiss — saves latest ID and closes modal */
  dismiss: () => void;
}

export function useAnnouncements(): UseAnnouncementsReturn {
  const [dismissed, setDismissed] = useState(false);

  const unseen = useMemo(() => {
    if (announcements.length === 0) return [];

    const lastSeenId = localStorage.getItem(STORAGE_KEY);

    // First-time user — never seen any announcement
    if (!lastSeenId) return announcements;

    // Find the index of the last-seen announcement
    const lastSeenIndex = announcements.findIndex((a) => a.id === lastSeenId);

    // If the stored ID no longer exists in the list, show everything
    if (lastSeenIndex === -1) return announcements;

    // If the last-seen is already the newest, nothing new
    if (lastSeenIndex === 0) return [];

    // Return everything newer than the last-seen
    return announcements.slice(0, lastSeenIndex);
  }, []);

  const showModal = unseen.length > 0 && !dismissed;

  const dismiss = useCallback(() => {
    if (announcements.length > 0) {
      localStorage.setItem(STORAGE_KEY, announcements[0].id);
    }
    setDismissed(true);
  }, []);

  return { unseen, showModal, dismiss };
}
