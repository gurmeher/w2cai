'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import Header from '@/components/Header';
import Polygon1 from '@/components/Polygon1';
import Polygon2 from '@/components/Polygon2';

//supabase stuff
type Item = {
  id: number;
  name: string;
  product_url: string;
};

export default function Home() {
  //no clue what these do, was in starter code
  const [items, setItems] = useState<Item[]>([]);
  //const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // This effect loads initial items from the Supabase database
  // It fetches items ordered by the date they were first seen, in descending order
  useEffect(() => {
    const loadInitialItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('id, name, product_url')
        .order('first_seen_utc', { ascending: false });

      if (error) {
        console.error('Initial load error:', error); // If there's an error, it logs the error to the console

      } else {
        setItems(data || []); // If the data is successfully fetched, it updates the items state with the fetched data
      }
    };

    loadInitialItems();
  }, []);

  //actual showed elements
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="relative isolate px-6 pt-12 lg:px-8">
        <Polygon1 />
        <Polygon2 />
        
        <div className="mx-auto max-w-4xl py-32 sm:py-30 lg:py-30 text-left">
          <h1 className="text-center pr-0 lg:pr-50 mb-2 text-5xl font-semibold tracking-tight text-left text-gray-900 sm:text-7xl">
            Discover Trending Finds from Reddit
          </h1>

          <p className="mt-2 mb-10 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 text-left">
            W2Cai uses AI to organize links from top subreddits, so you don’t have to.
          </p>

          <SearchBar onResults={setItems} />
          
          
          <div className="py-8 grid grid-cols-1 gap-5 mt-4 mx-auto max-w-4xl">
            {items.map((item) => (
              <ProductCard key={item.id} name={item.name} url={item.product_url} />
            ))}
          </div>
        </div>
    
      </div>
    </div>
  );
}