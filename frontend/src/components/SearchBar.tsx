// SearchBar.tsx

'use client';

import { useState, useEffect } from 'react';

type Props = {
  onSearch: (term: string) => void;
  onReset: () => void;
  searchTerm: string;
};

export default function SearchBar({ onSearch, onReset, searchTerm }: Props) {
  const [inputValue, setInputValue] = useState(searchTerm);

  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue.trim());
  };

  const handleReset = () => {
    setInputValue('');
    onReset();
  };

  return (
    // Floating pill: translucent white + blur, soft wide shadow that deepens on focus
    <form
      className="relative w-full max-w-4xl mx-auto mb-4 flex items-center rounded-[32px] p-3
        bg-white/75 backdrop-blur-[16px]
        shadow-[0_0_1px_rgba(0,0,0,0.12),0_12px_64px_rgba(0,0,0,0.2)]
        focus-within:shadow-[0_0_1px_rgba(0,0,0,0.12),0_12px_64px_rgba(0,0,0,0.24)]"
      onSubmit={handleSubmit}
    >
      {/* Search icon doubles as the submit button (Enter also submits) */}
      <button
        type="submit"
        aria-label="Search"
        className="cursor-pointer absolute left-6 top-1/2 -translate-y-1/2 text-black/55 hover:text-black/80"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <line x1="20" y1="20" x2="16" y2="16" />
        </svg>
      </button>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="What are you looking for?"
        aria-label="Search products"
        className="h-10 w-full bg-transparent pl-[46px] pr-12 text-base leading-[22px] text-black placeholder:text-black/50 focus:outline-none"
      />

      {inputValue && (
        <button
          type="button"
          onClick={handleReset}
          aria-label="Clear search"
          className="cursor-pointer absolute right-6 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-black/60 hover:bg-black/15 hover:text-black/80"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" viewBox="0 0 24 24">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      )}
    </form>
  );
}
