// SearchBar.tsx
// Floating search pill (modeled on Shop's). Clicking into it grows the same box
// downward, over the page, to show `children` (the sort + filter chips).
// Closes on Esc, on search, or when clicking outside.

'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

type Props = {
  onSearch: (term: string) => void;
  onReset: () => void;
  searchTerm: string;
  children?: ReactNode; // shown when the box is expanded
};

export default function SearchBar({ onSearch, onReset, searchTerm, children }: Props) {
  const [inputValue, setInputValue] = useState(searchTerm);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Collapse when clicking outside the box (the filter menus render outside it, so ignore those)
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (boxRef.current?.contains(target) || target.closest('[role="listbox"]')) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue.trim());
    setOpen(false);
  };

  const handleReset = () => {
    setInputValue('');
    onReset();
  };

  const expanded = Boolean(children) && open;

  return (
    // The outer div holds the pill's height so the open box floats over the page instead of pushing it down
    <div className="relative w-full max-w-4xl mx-auto mb-3 h-16">
    {/* Soft accent-colored glow behind the box, so the frosted glass has color to blur */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-[25%] -inset-y-2 -z-10 rounded-full bg-gradient-to-r from-glow-start to-glow-end opacity-[0.12] blur-3xl" />
    <div
      ref={boxRef}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      // Like Shop's: a bit narrower when closed, smoothly widens (and grows down) when opened.
      // Frosted glass: translucent white + strong blur/saturation, a bright edge and a top highlight.
      className={`absolute left-1/2 top-0 z-30 -translate-x-1/2 rounded-[32px] border border-white/70 p-3 backdrop-blur-[20px] backdrop-saturate-150
        transition-[width,background-color,box-shadow] duration-[192ms] ease-out motion-reduce:transition-none
        ${expanded
          ? 'w-full bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_1px_rgba(0,0,0,0.12),0_12px_64px_rgba(0,0,0,0.24)]'
          : 'w-[88%] bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_1px_rgba(0,0,0,0.12),0_12px_64px_rgba(0,0,0,0.2)]'}`}
    >
      <form className="relative flex items-center" onSubmit={handleSubmit}>
        {/* Search icon doubles as the submit button (Enter also submits) */}
        <button
          type="submit"
          aria-label="Search"
          className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 text-black/55 hover:text-black/80"
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
          onFocus={() => setOpen(true)}
          placeholder="What are you looking for?"
          aria-label="Search products"
          aria-expanded={expanded}
          className="h-10 w-full bg-transparent pl-[46px] pr-12 text-base leading-[22px] text-black placeholder:text-black/50 focus:outline-none"
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleReset}
            aria-label="Clear search"
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-black/60 hover:bg-black/15 hover:text-black/80"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" viewBox="0 0 24 24">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        )}
      </form>

      {/* Grows open like Shop's: animates grid row height 0 → auto, with a fade */}
      {children && (
        <div
          inert={!expanded}
          className={`grid transition-[grid-template-rows,opacity] duration-[192ms] ease-out motion-reduce:transition-none ${
            expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="pt-2">{children}</div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
