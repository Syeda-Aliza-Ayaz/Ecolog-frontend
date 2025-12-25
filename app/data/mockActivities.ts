export type Activity = {
  id: number;
  category: 'Transport' | 'Food' | 'Energy' | 'Waste';
  details: string;
  co2: number; // in kg
  date: string; // YYYY-MM-DD
  createdAt: string;
};

export const mockActivities: Activity[] = [
  {
    id: 1,
    category: 'Transport',
    details: 'Drove 20km to office',
    co2: 4.2,
    date: '2025-12-23',
    createdAt: '2025-12-23T10:30:00Z',
  },
  {
    id: 2,
    category: 'Food',
    details: 'Beef burger lunch',
    co2: 3.8,
    date: '2025-12-23',
    createdAt: '2025-12-23T13:15:00Z',
  },
  {
    id: 3,
    category: 'Energy',
    details: 'Used AC for 4 hours',
    co2: 1.6,
    date: '2025-12-22',
    createdAt: '2025-12-22T20:00:00Z',
  },
  {
    id: 4,
    category: 'Transport',
    details: 'Bus ride home (10km)',
    co2: 0.8,
    date: '2025-12-22',
    createdAt: '2025-12-22T18:30:00Z',
  },
  {
    id: 5,
    category: 'Food',
    details: 'Vegan salad',
    co2: 0.5,
    date: '2025-12-21',
    createdAt: '2025-12-21T12:00:00Z',
  },
  {
    id: 6,
    category: 'Waste',
    details: 'Recycled plastic & paper',
    co2: -0.3, // negative = saved
    date: '2025-12-21',
    createdAt: '2025-12-21T09:00:00Z',
  },
];