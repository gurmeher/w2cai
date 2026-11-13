//components/ProductCard.tsx
import { useRef } from 'react';
import ProductModal from './ProductModal';
import Image from 'next/image';

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
};

// "today", "3d ago", "5mo ago", "1y ago"
function timeAgo(utcSeconds: number) {
  const days = Math.floor((Date.now() - utcSeconds * 1000) / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CNY', currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0 }).format(price);

export default function ProductCard({ id, name, url, image_url, first_seen_utc, reddit_posts, price }: ProductCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mentions = reddit_posts?.length ?? 0;
  const isNew = Date.now() - first_seen_utc * 1000 < 7 * 86400000;

  return (
    <>
      {/* The whole card opens the details popup */}
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="group cursor-pointer text-left rounded-2xl bg-white p-2 ring-1 ring-black/5
          shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-glow-start/15 to-glow-end/15">
          {image_url ? (
            <Image src={image_url} alt={name} fill sizes="(min-width: 768px) 280px, 50vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl" aria-hidden="true">📦</div>
          )}

          {isNew && (
            <span className="absolute left-2 top-2 rounded-full bg-lime-300 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-black">
              New
            </span>
          )}
          {mentions > 0 && (
            <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-gray-900 backdrop-blur">
              🔥 {mentions}
            </span>
          )}
        </div>

        <div className="px-2 pb-2 pt-3">
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900">{name}</h2>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className={price != null ? 'text-lg font-extrabold tracking-tight text-gray-900' : 'text-sm font-medium text-gray-400'}>
              {price != null ? formatPrice(price) : 'Price TBD'}
            </span>
            <span className="text-xs font-medium text-gray-400">{timeAgo(first_seen_utc)}</span>
          </div>
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
