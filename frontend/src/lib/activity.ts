// Reddit activity for a product card, computed from the dates of the posts that mention it.
// "now" (the anchor) is the newest post date in the whole database, so stale data still reads
// sensibly until the next scrape. All times are unix seconds.

const DAY = 86400;
const MONTH = 30.44 * DAY;

export type ActivityStatus = 'New' | 'Trending' | 'Cooling off' | 'Steady';

// Posts per month over the 12 months before the anchor, oldest first.
// Returns null when there are no posts in that year (then no line is drawn).
export function monthlyCounts(dates: number[], anchor: number): number[] | null {
  const counts = new Array(12).fill(0);
  for (const t of dates) {
    const monthsAgo = Math.floor((anchor - t) / MONTH);
    if (monthsAgo >= 0 && monthsAgo < 12) counts[11 - monthsAgo]++;
  }
  return counts.some((c) => c > 0) ? counts : null;
}

// First matching rule wins: New → Trending → Cooling off → Steady. Null = no status shown.
// siteBoost = how much busier the whole site's last 30 days were than its usual month
// (the scraper reads recent posts, so recent months are naturally fuller). An item is only
// "Trending" if it picked up more than the site did overall.
export function activityStatus(dates: number[], anchor: number, siteBoost = 1): ActivityStatus | null {
  if (dates.length === 0) return null;
  const ages = dates.map((t) => anchor - t);
  const inLast = (days: number) => ages.filter((a) => a >= 0 && a < days * DAY).length;

  if (Math.max(...ages) < 30 * DAY) return 'New'; // first post was in the last 30 days

  const last30 = inLast(30);
  const usualPerMonth = (inLast(365) - last30) / 11; // the year before this month
  if (last30 >= 3 && last30 >= 2 * Math.max(1, siteBoost) * usualPerMonth) return 'Trending';

  if (dates.length >= 3 && inLast(90) === 0) return 'Cooling off';
  if (inLast(365) > 0) return 'Steady';
  return null;
}

// "today", "3 days ago", "2 weeks ago", "4 months ago", "1 year ago"
export function lastPostedText(dates: number[], anchor: number): string | null {
  if (dates.length === 0) return null;
  const days = Math.max(0, Math.floor((anchor - Math.max(...dates)) / DAY));
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'} ago`;
  if (days < 1) return 'today';
  if (days < 14) return plural(days, 'day');
  if (days < 60) return plural(Math.floor(days / 7), 'week');
  if (days < 365) return plural(Math.floor(days / 30), 'month');
  return plural(Math.floor(days / 365), 'year');
}
