// ProductModal.tsx
// The item popup that opens when a product card is clicked.
// Desktop: photo and details side by side, then the Reddit posts across the full width below.
// Phones: one column in a sheet pinned to the bottom of the screen, with the store button stuck to its bottom edge.
// Native <dialog> handles Esc, focus trapping and the dimmed backdrop; clicking the backdrop closes it.
'use client';

import { forwardRef, useState } from 'react';
import Image from 'next/image';
import Price from './Price';
import { Sparkline, StatusChip, lineColor } from './Activity';
import type { ActivityStatus } from '@/lib/activity';

type RedditPost = {
  id: number;
  title: string;
  permalink: string;
  subreddit: string;
  upvotes: number;
  created_utc: number;
};

type ProductModalProps = {
  id: number;
  name: string;
  url: string;
  first_seen_utc: number;
  image_url?: string;
  price?: number;
  reddit_posts?: RedditPost[];
  activity: { counts: number[] | null; status: ActivityStatus | null; lastPosted: string | null }; // computed by the card
};

const POSTS_SHOWN = 8; // posts listed before "Show all"

// "Taobao", "Weidian", ... from the product link, for the button label
function storeName(url: string) {
  try {
    const host = new URL(url).hostname;
    if (host.endsWith('taobao.com')) return 'Taobao';
    if (host.endsWith('weidian.com')) return 'Weidian';
    if (host.endsWith('yupoo.com')) return 'Yupoo';
    if (host.endsWith('1688.com')) return '1688';
  } catch {}
  return 'store';
}

const formatUpvotes = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`);
const formatDate = (utc: number) =>
  new Date(utc * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const focusRing = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900';

const ProductModal = forwardRef<HTMLDialogElement, ProductModalProps>(
  ({ id, name, url, first_seen_utc, image_url, price, reddit_posts, activity }, ref) => {
    const [showAll, setShowAll] = useState(false);
    const [copied, setCopied] = useState(false);

    const posts = [...(reddit_posts ?? [])].sort((a, b) => b.created_utc - a.created_utc); // newest first
    const visiblePosts = showAll ? posts : posts.slice(0, POSTS_SHOWN);
    const store = storeName(url);

    const closeModal = () => {
      if (ref && 'current' in ref && ref.current) ref.current.close();
    };

    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {}
    };

    // "Copy link" is the main black pill (people usually paste the link into an agent site);
    // "View on Taobao" is the gray secondary button
    const storeButtons = (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={copyLink}
          className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black md:flex-none ${focusRing}`}
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {copied ? <path d="M3 8.5l3 3 7-7" /> : <><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 5.5V4A1.5 1.5 0 009 2.5H4A1.5 1.5 0 002.5 4v5A1.5 1.5 0 004 10.5h1.5" /></>}
          </svg>
          <span aria-live="polite">{copied ? 'Copied' : 'Copy link'}</span>
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-200 ${focusRing}`}
        >
          View on {store}
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 11L11 5M6 5h5v5" />
          </svg>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    );

    return (
      <dialog
        ref={ref}
        aria-labelledby={`product-${id}-name`}
        className="fixed inset-0 m-auto w-full max-w-[832px] overflow-y-auto overscroll-contain rounded-2xl bg-white p-0 font-sans text-gray-900
          shadow-[0_12px_48px_rgba(0,0,0,0.18)] ring-1 ring-black/5 md:max-h-[85vh]
          max-md:mb-0 max-md:max-h-[90svh] max-md:max-w-none max-md:rounded-b-none"
        onClick={(e) => {
          if (ref && 'current' in ref && e.target === ref.current) closeModal(); // clicked the backdrop
        }}
      >
        {/* Close: gray circle like the phone menu button; outline only for keyboard focus.
            Sits in a zero-height sticky row so it stays put while the popup scrolls. */}
        <div className="sticky top-0 z-10 flex h-0 justify-end">
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className={`mr-3 mt-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#f2f2f2]/90 text-gray-700 backdrop-blur hover:bg-[#e8e8e8] ${focusRing}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Top: photo (378px on desktop) | details, centered vertically beside it */}
        <div className="grid gap-4 p-3 md:grid-cols-[378px_minmax(0,1fr)] md:items-center md:gap-7 md:p-5">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
            {image_url ? (
              <Image src={image_url} alt={name} fill sizes="(min-width: 768px) 378px, 100vw" className="object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
                Image unavailable, see the Reddit posts
              </div>
            )}
          </div>

          <div className="flex flex-col px-2 pt-2 md:px-0 md:py-4">
            <h2 id={`product-${id}-name`} className="text-2xl font-bold leading-tight tracking-tight text-balance md:pr-12">
              {name}
            </h2>
            <div className="mt-3">
              {price != null ? (
                <Price price={price} className="text-[28px]" />
              ) : (
                <span className="text-sm text-gray-500">Price unavailable, see the product link</span>
              )}
            </div>

            {/* Same activity strip as the card: line, post count, status, last posted */}
            {posts.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                {/* Graph, post count and status side by side; last posted on the line below */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                  {activity.counts && <Sparkline counts={activity.counts} colorClass={lineColor(activity.status)} sizeClass="h-6 w-[60px]" />}
                  <span>
                    <b className="font-bold text-gray-900 tabular-nums">{posts.length}</b> {posts.length === 1 ? 'post' : 'posts'}
                  </span>
                  {activity.status && <StatusChip status={activity.status} />}
                </div>
                {activity.lastPosted && <p className="mt-2.5 text-[13px]">Last posted {activity.lastPosted}</p>}
              </div>
            )}

            {/* On desktop the buttons sit here; on phones they move to the sticky bar at the bottom */}
            <div className="mt-6 hidden md:block">{storeButtons}</div>
          </div>
        </div>

        {/* Reddit posts across the full width, two columns on desktop */}
        {posts.length > 0 && (
          <section className="mx-3 border-t border-black/5 px-2 pb-2 pt-5 md:mx-5 md:px-0">
            <h3 className="text-base font-bold tracking-tight">
              Reddit posts <span className="font-semibold text-gray-400 tabular-nums">· {posts.length}</span>
            </h3>
            <ul className="mt-2 grid gap-x-6 md:grid-cols-2">
              {visiblePosts.map((post) => (
                <li key={post.id} className="border-b border-black/5">
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group block rounded-lg py-3 ${focusRing}`}
                  >
                    <span className="line-clamp-2 text-sm font-medium leading-snug text-gray-900 group-hover:underline">
                      {post.title}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      r/{post.subreddit} · ▲ {formatUpvotes(post.upvotes)} · {formatDate(post.created_utc)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            {posts.length > POSTS_SHOWN && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className={`mt-4 cursor-pointer rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-200 ${focusRing}`}
              >
                {showAll ? 'Show fewer' : `Show all ${posts.length}`}
              </button>
            )}
          </section>
        )}

        <p className="px-5 pb-5 pt-4 text-xs text-gray-400 md:px-5">First seen {formatDate(first_seen_utc)}</p>

        {/* Phones: store button always reachable at the bottom of the sheet */}
        <div className="sticky bottom-0 border-t border-black/5 bg-white/90 p-3 backdrop-blur md:hidden">{storeButtons}</div>
      </dialog>
    );
  }
);

ProductModal.displayName = 'ProductModal';

export default ProductModal;
