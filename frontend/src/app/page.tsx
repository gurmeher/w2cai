'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductList from '@/components/ProductList';
import SearchBar from '@/components/SearchBar';
import Header from '@/components/Header';
import Polygon1 from '@/components/Polygon1';
import Polygon2 from '@/components/Polygon2';

//supabase stuff
type Item = {
  id: number;
  name: string;
  product_url: string;
  first_seen_utc: number;
  post_item_links?: {
    posts: {
      id: number;
      title: string;
      permalink: string;
      subreddit: string;
      upvotes: number;
      created_utc: number;
    }[]; // ← this was the issue (make it an array)
  }[];
};


export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20; // Number of items to load per page
  //const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // This effect loads initial items from the Supabase database
  // It fetches items ordered by the date they were first seen, in descending order
  const loadItems = async (pageToLoad: number) => {
    setLoading(true);

    const from = (pageToLoad - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('items')
      .select(`
        id,
        name,
        product_url,
        first_seen_utc,
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
      `)
      .order('first_seen_utc', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Load error:', error);
    } else {
      if (data.length < pageSize) {
        setHasMore(false);
      }
      setItems(prev => [...prev, ...data]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadItems(1); // Initial load
  }, []);

  //actual showed elements
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="relative isolate px-6 pt-12 lg:px-8">
        <Polygon1 />
        <Polygon2 />
        
        <div className="mx-auto max-w-4xl py-20 lg:py-30">
          <h1 className="text-center mb-5 text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl font-sans">
            Discover Trending Finds from Reddit
          </h1>

          <p className="mt-2 mb-5 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 text-center">
            W2Cai uses AI to organize links from top subreddits, so you don’t have to rely on limited, manual spreadsheets.
          </p>

          <div className="flex items-center justify-center gap-x-6">
              <a
                href="/search"
                className="cursor-pointer rounded-md shadow-xs bg-indigo-600 hover:bg-indigo-800 transition-colors px-3.5 py-2.5 
                text-sm font-bold text-white focus-visible:outline-2 
                focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 animate-gradient-x">
                Start searching
              </a>
              <a href="https://www.reddit.com/user/is3fiddy/" className="text-sm/6 font-semibold text-gray-900">
                Join the discussion <span aria-hidden="true">→</span>
              </a>
            </div>

          {/* <SearchBar onResults={setItems} /> */}
          <h2 className="text-2xl font-bold mt-20 text-gray-900">
            Latest Finds
          </h2>
          
          <ProductList />

        </div>

      </div>
    </div>
  );
}