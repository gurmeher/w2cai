//components/ProductCard.tsx
import { useRef } from 'react';
import ProductModal from './ProductModal';
import Image from 'next/image';
import { activityStatus, ActivityStatus, lastPostedText, monthlyCounts } from '@/lib/activity';

export type ProductCardProps = {
  id: number;
  name: string;
  url: string;
  first_seen_utc: number;
  image_url?: string;
  price?: number;
  reddit_posts?: {
    id: number;
    title: string;
    permalink: string;
    subreddit: string;
    upvotes: number;
    created_utc: number;
  }[];
  anchor?: number | null; // newest post date in the database, used as "now" for activity
  siteBoost?: number; // how much busier the whole site was in the last 30 days (see lib/activity)
};

// Tiny gray line of posts per month over the past year (12 points, oldest on the left)
function Sparkline({ counts, colorClass }: { counts: number[]; colorClass: string }) {
  const peak = Math.max(3, ...counts); // so one or two posts don't look like a spike
  const pts = counts.map((c, i) => [1 + (i * 44) / 11, 17 - (c / peak) * 15] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [endX, endY] = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 46 18" className={`h-[18px] w-[46px] flex-none overflow-visible ${colorClass}`} aria-hidden="true">
      <path d={`${line} L45 18 L1 18 Z`} fill="currentColor" opacity={0.15} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={endX} cy={endY} r={2} fill="currentColor" />
    </svg>
  );
}

// Price in the heading's style (Geist, bold, tight); the ¥ sits smaller and lighter so the number leads
function Price({ price }: { price: number }) {
  return (
    <span className="font-sans text-[22px] font-bold leading-none tracking-tighter text-gray-900 tabular-nums md:text-2xl">
      <span className="mr-[0.08em] align-[0.28em] text-[0.6em] font-semibold text-gray-500">¥</span>
      {price.toLocaleString('en-US')}
    </span>
  );
}

// Chip and line color per status. Trending warm orange, New black, Steady neutral gray, Cooling off muted slate.
const STATUS_STYLE: Record<ActivityStatus, { chip: string; line: string; arrow?: 'up' | 'down' }> = {
  Trending: { chip: 'bg-[#e8590c]/14 text-[#b8440a]', line: 'text-[#e8590c]', arrow: 'up' },
  New: { chip: 'bg-gray-900 text-white', line: 'text-gray-900' },
  Steady: { chip: 'bg-[#6b6f76]/14 text-[#45484e]', line: 'text-[#6b6f76]' },
  'Cooling off': { chip: 'bg-[#5b7083]/15 text-[#3d4f60]', line: 'text-[#5b7083]', arrow: 'down' },
};

export default function ProductCard({ id, name, url, image_url, first_seen_utc, reddit_posts, price, anchor, siteBoost }: ProductCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mentions = reddit_posts?.length ?? 0;

  // Reddit activity from the post dates (line only if there are posts in the past year)
  const dates = reddit_posts?.map((p) => p.created_utc) ?? [];
  const now = anchor ?? Date.now() / 1000;
  const counts = monthlyCounts(dates, now);
  const status = activityStatus(dates, now, siteBoost);
  const lastPosted = lastPostedText(dates, now);
  const style = status ? STATUS_STYLE[status] : null;

  return (
    <>
      {/* The whole card opens the details popup */}
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="group cursor-pointer text-left font-sans rounded-xl bg-white p-2 ring-1 ring-black/5
          shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-shadow
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {image_url ? (
            <Image src={image_url} alt={name} fill sizes="(min-width: 768px) 280px, 50vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl" aria-hidden="true">📦</div>
          )}

        </div>

        {/* Hierarchy: price (biggest, heading style) → name → activity strip (small, quiet) */}
        <div className="px-2 pb-2 pt-3">
          <h2 className="line-clamp-2 text-[16.5px] font-semibold leading-[1.3] tracking-[-0.01em] text-gray-900">{name}</h2>
          <div className="mt-2.5">
            {price != null ? <Price price={price} /> : <span className="text-sm font-medium text-gray-400">Price TBD</span>}
          </div>

          {/* Reddit activity strip: line, post count, status and when it was last posted */}
          {mentions > 0 && (
            <div className="-mx-4 -mb-4 mt-3.5 space-y-[7px] border-t border-black/5 px-3 pb-3 pt-2.5 sm:px-3.5">
              <div className="flex items-center gap-2.5">
                {counts && <Sparkline counts={counts} colorClass={style?.line ?? 'text-gray-400'} />}
                <span className="whitespace-nowrap text-[13px] text-gray-500">
                  <b className="font-bold text-gray-900 tabular-nums">{mentions}</b> {mentions === 1 ? 'post' : 'posts'}
                </span>
                <span className="ml-auto hidden whitespace-nowrap text-[13px] font-semibold text-gray-900 sm:inline">See posts</span>
              </div>
              {(status || lastPosted) && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                  {status && style && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-bold leading-[1.45] ${style.chip}`}>
                      {style.arrow && (
                        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden="true">
                          <path fill="currentColor" d={style.arrow === 'up' ? 'M5 1l4 5H6v3H4V6H1z' : 'M5 9L1 4h3V1h2v3h3z'} />
                        </svg>
                      )}
                      {status}
                    </span>
                  )}
                  {lastPosted && <span>last posted {lastPosted}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </button>

      <ProductModal
        ref={dialogRef}
        id={id}
        name={name}
        url={url}
        first_seen_utc={first_seen_utc}
        price={price}
        image_url={image_url}
        reddit_posts={reddit_posts}
      />
    </>
  );
}
