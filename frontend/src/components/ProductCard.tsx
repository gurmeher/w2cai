//components/ProductCard.tsx
import { useRef } from 'react';
import ProductModal from './ProductModal';
import Price from './Price';
import Image from 'next/image';
import { activityStatus, lastPostedText, monthlyCounts } from '@/lib/activity';
import { Sparkline, StatusChip, lineColor } from './Activity';

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

export default function ProductCard({ id, name, url, image_url, first_seen_utc, reddit_posts, price, anchor, siteBoost }: ProductCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mentions = reddit_posts?.length ?? 0;

  // Reddit activity from the post dates (line only if there are posts in the past year)
  const dates = reddit_posts?.map((p) => p.created_utc) ?? [];
  const now = anchor ?? Date.now() / 1000;
  const counts = monthlyCounts(dates, now);
  const status = activityStatus(dates, now, siteBoost);
  const lastPosted = lastPostedText(dates, now);

  return (
    <>
      {/* The whole card opens the details popup */}
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="group cursor-pointer text-left font-sans rounded-xl bg-white p-2 ring-1 ring-black/5
          shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-shadow
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
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
                {counts && <Sparkline counts={counts} colorClass={lineColor(status)} />}
                <span className="whitespace-nowrap text-[13px] text-gray-500">
                  <b className="font-bold text-gray-900 tabular-nums">{mentions}</b> {mentions === 1 ? 'post' : 'posts'}
                </span>
                <span className="ml-auto hidden whitespace-nowrap text-[13px] font-semibold text-gray-900 sm:inline">See posts</span>
              </div>
              {(status || lastPosted) && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                  {status && <StatusChip status={status} />}
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
        activity={{ counts, status, lastPosted }}
      />
    </>
  );
}
