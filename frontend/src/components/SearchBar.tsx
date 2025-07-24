'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Item = {
  id: number;
  name: string;
  product_url: string;
  first_seen_utc: number;
};

type Props = {
  onResults: (items: Item[]) => void;
};

export default function SearchBar({ onResults }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    let query = supabase
      .from('items')
      .select('id, name, product_url, first_seen_utc')
      .order('first_seen_utc', { ascending: false });

    if (searchTerm.trim()) {
      query = query.ilike('name', `%${searchTerm.trim()}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Search error:', error);
      onResults([]);
    } else {
      onResults(data || []);
    }
  };

  return (
    <form
      className="relative w-full max-w-4xl mx-auto"
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="What are you looking for?"
        className="border-2 border-gray-300 px-5 py-5 pr-12 rounded-full w-full focus:outline-none bg-white hover:shadow transition-shadow text-gray-900"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-700 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-800 transition-colors"
        aria-label="Search"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  );
}
