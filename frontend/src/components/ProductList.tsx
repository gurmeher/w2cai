//ProductList.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';
import SortDropdown, { SortOption } from './SortDropdown';

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

type ProductListProps = {
  searchTerm?: string;
  defaultSort?: SortOption;
  showSort?: boolean;
};

export default function ProductList({ searchTerm = '', defaultSort = 'popular', showSort = true}: ProductListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>(defaultSort);
  const pageSize = 20;

  const loadItems = useCallback(async (pageToLoad: number, reset = false) => {
    setLoading(true);

    const from = (pageToLoad - 1) * pageSize;
    const to = from + pageSize - 1;

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
        post_item_links (
          posts (
            id,
            title,
            permalink,
            subreddit,
            upvotes,
            created_utc
          )
        )
      `);

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

    if (error) {
      console.error('Load error:', error);
    } else {
      if (data.length < pageSize) {
        setHasMore(false);
      }
      setItems(prev => reset ? data : [...prev, ...data]);
    }

    setLoading(false);
  }, [searchTerm, sortOption]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    loadItems(1, true);
  }, [searchTerm, sortOption, loadItems]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadItems(nextPage);
  };

  const handleSortChange = (newSortOption: SortOption) => {
    setSortOption(newSortOption);
  };

  return (
    <>
      {showSort && (
        <SortDropdown 
          value={sortOption}
          onChange={handleSortChange}
          className="mb-2 mx-auto max-w-4xl"
        />
      )}

      {loading && page === 1 ? (
        <div className="flex justify-center items-center mt-10" role="status">
          <svg
            aria-hidden="true"
            className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-400 fill-indigo-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 
              100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 
              0.59082C77.6142 0.59082 100 22.9766 100 
              50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 
              91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 
              50.5908C90.9186 27.9921 72.5987 9.67226 50 
              9.67226C27.4013 9.67226 9.08144 27.9921 
              9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 
              97.0079 33.5539C95.2932 28.8227 92.871 
              24.3692 89.8167 20.348C85.8452 15.1192 80.8826 
              10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 
              1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 
              0.446843 41.7345 1.27873C39.2613 1.69328 37.813 
              4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 
              10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 
              9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 
              12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 
              21.5619 82.5849 25.841C84.9175 28.9121 86.7997 
              32.2913 88.1811 35.8758C89.083 38.2158 91.5421 
              39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="flex justify-center items-center mt-10">
          <p className="text-gray-500">
            No results found matching &quot;{searchTerm}&quot;
          </p>
        </div>
      ) : (
        <>
          <div className="py-3 grid grid-cols-1 gap-5 mx-auto max-w-4xl">
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
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="cursor-pointer rounded-md shadow-xs bg-gray-200 hover:bg-gray-300 transition-colors px-12.5 py-3.5 
                  text-md font-bold text-black focus-visible:outline-2 
                  focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {loading ? 'Loading...' : 'See More'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}