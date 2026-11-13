// Filter options for the product list.
// CATEGORIES must match CATEGORIES in backend/scraper.py (what GPT picks from).

export const CATEGORIES = [
  'Shirts', // t-shirts, polos, long sleeves, button-ups
  'Pants',
  'Shorts',
  'Outerwear', // hoodies, sweaters, jackets
  'Shoes',
  'Accessories',
  'Other',
] as const;

// Only count items mentioned in a Reddit post within this many days (null = all time)
export const DATE_RANGES = [
  { value: 'all', label: 'All time', days: null },
  { value: '7d', label: 'Past week', days: 7 },
  { value: '30d', label: 'Past month', days: 30 },
  { value: '90d', label: 'Past 3 months', days: 90 },
  { value: '180d', label: 'Past 6 months', days: 180 },
  { value: '365d', label: 'Past year', days: 365 },
] as const;

export type DateRange = (typeof DATE_RANGES)[number]['value'];

// Chip options for the search panel (first option = "no filter")
export const CATEGORY_OPTIONS = [{ value: 'all', label: 'All' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))];
export const DATE_OPTIONS = DATE_RANGES.map(({ value, label }) => ({ value, label }));

export type SortOption = 'popular' | 'latest';
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Popular' },
  { value: 'latest', label: 'Latest' },
];
