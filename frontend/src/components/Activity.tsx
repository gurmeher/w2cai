// Activity.tsx
// Small pieces that show an item's Reddit activity, shared by the product card and the item popup:
// the 12-month sparkline and the status chip (Trending / Popular / New / Steady / Cooling off).
import type { ActivityStatus } from '@/lib/activity';

// Chip and line color per status. Trending warm orange, Popular rose, New black, Steady neutral gray, Cooling off muted slate.
export const STATUS_STYLE: Record<ActivityStatus, { chip: string; line: string; arrow?: 'up' | 'down' }> = {
  Trending: { chip: 'bg-[#e8590c]/14 text-[#b8440a]', line: 'text-[#e8590c]', arrow: 'up' },
  New: { chip: 'bg-gray-900 text-white', line: 'text-gray-900' },
  Popular: { chip: 'bg-[#e64980]/13 text-[#b02a5b]', line: 'text-[#e64980]' },
  Steady: { chip: 'bg-[#6b6f76]/14 text-[#45484e]', line: 'text-[#6b6f76]' },
  'Cooling off': { chip: 'bg-[#5b7083]/15 text-[#3d4f60]', line: 'text-[#5b7083]', arrow: 'down' },
};

// Line color for a status (gray when there's no status)
export const lineColor = (status: ActivityStatus | null) => (status ? STATUS_STYLE[status].line : 'text-gray-400');

// Tiny line of posts per month over the past year (12 points, oldest on the left)
// sizeClass sets the drawn size (the card uses the default; the popup draws it bigger)
export function Sparkline({ counts, colorClass, sizeClass = 'h-[18px] w-[46px]' }: { counts: number[]; colorClass: string; sizeClass?: string }) {
  const peak = Math.max(3, ...counts); // so one or two posts don't look like a spike
  const pts = counts.map((c, i) => [1 + (i * 44) / 11, 17 - (c / peak) * 15] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [endX, endY] = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 46 18" className={`${sizeClass} flex-none overflow-visible ${colorClass}`} aria-hidden="true">
      <path d={`${line} L45 18 L1 18 Z`} fill="currentColor" opacity={0.15} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={endX} cy={endY} r={2} fill="currentColor" />
    </svg>
  );
}

// Rounded status label, with an up/down arrow for Trending and Cooling off
export function StatusChip({ status }: { status: ActivityStatus }) {
  const style = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-bold leading-[1.45] ${style.chip}`}>
      {style.arrow && (
        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden="true">
          <path fill="currentColor" d={style.arrow === 'up' ? 'M5 1l4 5H6v3H4V6H1z' : 'M5 9L1 4h3V1h2v3h3z'} />
        </svg>
      )}
      {status}
    </span>
  );
}
