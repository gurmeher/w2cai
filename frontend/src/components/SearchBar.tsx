'use client';

import { useState } from 'react';

type Props = {
  onSearch: (term: string) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  return (
    <form
      className="relative w-full max-w-4xl mx-auto"
      onSubmit={handleSubmit}
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
        className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-700 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-indigo-900 transition-colors"
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
