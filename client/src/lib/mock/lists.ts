import type { List, Tier } from '@/types';

const tierConfig: Tier[] = [
  { value: 'S', label: 'S', score: 7, order: 1 },
  { value: 'A', label: 'A', score: 6, order: 2 },
  { value: 'B', label: 'B', score: 5, order: 3 },
  { value: 'C', label: 'C', score: 4, order: 4 },
  { value: 'D', label: 'D', score: 3, order: 5 },
  { value: 'E', label: 'E', score: 2, order: 6 },
  { value: 'F', label: 'F', score: 1, order: 7 },
];

export const f1List: List = {
  id: 'f1-2026',
  name: 'F1 Driver Tier List 2026',
  description:
    'Rank current F1 drivers based on form, racecraft, and consistency.',
  isLocked: false,
  isVisible: true,
  startTime: '2026-03-01T00:00:00.000Z',
  endTime: '2026-12-31T23:59:59.000Z',
  tiers: tierConfig,
};

export const votingLists: List[] = [
  f1List,
  {
    id: 'f1-midfield-2026',
    name: 'F1 Midfield Mastery 2026',
    description: 'How do the midfield drivers stack up this season?',
    isLocked: false,
    isVisible: true,
    tiers: tierConfig,
    startTime: '2026-04-01T00:00:00.000Z',
    endTime: '2026-08-31T23:59:59.000Z',
  },
  {
    id: 'f1-legend-vote',
    name: 'All-Time F1 Legends',
    description: 'Community event. Opens next week.',
    isLocked: true,
    isVisible: true,
    tiers: tierConfig,
  },
];
