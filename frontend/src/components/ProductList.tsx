//ProductList.tsx

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';
import { DATE_RANGES, DateRange, SortOption } from '@/lib/filters';

export type Item = {
  id: number;
  name: string;
  product_url: string;
  image_url?: string;
  price?: number;
  first_seen_utc: number;
  reddit_mentions?: number;
  post_item_links?: {
    posts: {
      id: number;
      title: string;
      permalink: string;
      subreddit: string;
      upvotes: number;
      created_utc: number;
    }[];
  }[];
};

// Filters are owned by the page (they're shown inside the search box)
type ProductListProps = {
  searchTerm?: string;
  sortOption?: SortOption;
  category?: string;      // 'all' or one of CATEGORIES
  dateRange?: DateRange;  // 'all' or a DATE_RANGES value
};

export default function ProductList({ searchTerm = '', sortOption = 'popular', category = 'all', dateRange = 'all' }: ProductListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;
  // Each load gets an id; responses from older loads are ignored so a slow
  // earlier request can't overwrite results after the filters change
  const latestRequest = useRef(0);

  const loadItems = useCallback(async (pageToLoad: number, reset = false) => {
    const requestId = ++latestRequest.current;
    setLoading(true);

    const from = (pageToLoad - 1) * pageSize;
    const to = from + pageSize - 1;

    // With a date range, use inner joins so only items with a post in that range come back
    // (and only those in-range posts are listed on the item)
    const days = DATE_RANGES.find((r) => r.value === dateRange)?.days ?? null;
    const join = days ? '!inner' : '';

    let query = supabase
      .from('items')
      .select(`
        id,
        name,
        product_url,
        image_url,
        price,
        first_seen_utc,
        reddit_mentions,
        post_item_links${join} (
          posts${join} (
            id,
            title,
            permalink,
            subreddit,
            upvotes,
            created_utc
          )
        )
      `);

    if (days) {
      const cutoff = Date.now() / 1000 - days * 86400;
      query = query.gte('post_item_links.posts.created_utc', cutoff);
    }

    // Items can have up to two categories; match if either is the chosen one
    if (category !== 'all') {
      query = query.contains('categories', [category]);
    }

    // Apply sorting
    if (sortOption === 'latest') {
      query = query.order('first_seen_utc', { ascending: false });
    } else {
      query = query.order('reddit_mentions', { ascending: false });
    }

    // Apply range for pagination
    query = query.range(from, to);

    // Apply name filter if present
    if (searchTerm.trim()) {
      query = query.ilike('name', `%${searchTerm.trim()}%`);
    }

    const { data, error } = await query;
    if (requestId !== latestRequest.current) return; // a newer load has started

    if (error) {
      console.error('Load error:', error);
    } else {
      if (data.length < pageSize) {
        setHasMore(false);
      }
      setItems(prev => (reset ? data : [...prev, ...data]) as Item[]);
    }

    setLoading(false);
  }, [searchTerm, sortOption, category, dateRange]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    loadItems(1, true);
  }, [loadItems]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadItems(nextPage);
  };

  return (
    <>
      {loading && page === 1 ? (
        // Loading: skeleton cards shaped like the real ones, pulsing in a staggered wave
        <div className="py-3 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mx-auto max-w-4xl" role="status">
          <span className="sr-only">Loading...</span>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rounded-xl bg-white p-2 ring-1 ring-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <div
                className="aspect-square rounded-lg bg-gray-100 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
              <div className="mx-2 mt-3 h-3.5 w-3/4 rounded-full bg-black/5 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
              <div className="mx-2 mt-2 mb-2 h-4 w-1/3 rounded-full bg-black/5 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex justify-center items-center mt-10">
          <p className="text-gray-500">
            {searchTerm ? <>No results found matching &quot;{searchTerm}&quot;</> : 'Nothing here for these filters yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="py-3 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mx-auto max-w-4xl">
            {items.map(item => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                url={item.product_url}
                image_url={item.image_url}
                first_seen_utc={item.first_seen_utc}
                reddit_posts={item.post_item_links?.flatMap(link => link.posts) ?? []}
                price={item.price}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              {/* Soft gray pill: faint top highlight and a light shadow, no blur */}
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="h-11 cursor-pointer rounded-full bg-gray-100 px-8 text-sm font-semibold text-gray-900 transition-colors
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.06)]
                  hover:bg-gray-200
                  disabled:cursor-default disabled:text-gray-400
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                {loading ? 'Loading…' : 'See more'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}