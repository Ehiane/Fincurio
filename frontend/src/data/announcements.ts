export interface Announcement {
  /** Unique slug — used as the localStorage marker, e.g. "2026-02-14-onboarding-v2" */
  id: string;
  /** ISO date string for display & sorting (newest first) */
  date: string;
  /** Short headline */
  title: string;
  /** One-liner description */
  description: string;
  /** Badge colour & label */
  type: 'feature' | 'improvement' | 'fix';
  /** Material Symbols icon name */
  icon: string;
}

/**
 * Add new announcements at the TOP of this array.
 * The first entry is treated as the "latest" and drives the unseen check.
 */
const announcements: Announcement[] = [
  {
    id: '2026-02-14-savings-goals',
    date: '2026-02-14',
    title: 'Savings Goals & Contributions',
    description:
      'Set savings targets with planned monthly contributions, log contributions as their own transaction type, and track your progress — all from the new Goals page.',
    type: 'feature',
    icon: 'savings',
  },
  {
    id: '2026-02-14-onboarding-v2',
    date: '2026-02-14',
    title: 'New Onboarding Experience',
    description:
      'Set up your income, taxes, deductions, and preferences in a guided 8-step flow — so your dashboard feels personalised from day one.',
    type: 'feature',
    icon: 'rocket_launch',
  },
  {
    id: '2026-02-14-error-pages',
    date: '2026-02-14',
    title: 'Friendlier Error Pages',
    description:
      'Custom-designed pages for 404, 500, session expired, forbidden, and maintenance — so you always know what happened and what to do next.',
    type: 'improvement',
    icon: 'error_outline',
  },
  {
    id: '2026-02-12-security-hardening',
    date: '2026-02-12',
    title: 'Security Hardening',
    description:
      'Added rate limiting, security headers, and improved token handling to keep your data safe.',
    type: 'improvement',
    icon: 'shield',
  },
  {
    id: '2026-02-07-email-verification',
    date: '2026-02-07',
    title: 'Email Verification',
    description:
      'Verify your email address to secure your account. Look for the banner at the top of the page.',
    type: 'feature',
    icon: 'mark_email_read',
  },
  {
    id: '2026-02-07-custom-categories',
    date: '2026-02-07',
    title: 'Custom Categories',
    description:
      'Create your own spending and income categories to match the way you actually think about money.',
    type: 'feature',
    icon: 'category',
  },
];

export default announcements;
