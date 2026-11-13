'use client'

import { useState } from 'react';
import ProductList from '@/components/ProductList';
import SearchBar from '@/components/SearchBar';
import SearchFilters from '@/components/SearchFilters';
import Image from 'next/image';
import { RedditTile, PlatformTile } from '@/components/HeroTiles';
import Header from '@/components/Header';
import Polygon1 from '@/components/Polygon1';
import Polygon2 from '@/components/Polygon2';
import Footer from '@/components/Footer';
import { DATE_OPTIONS, DateRange, SortOption } from '@/lib/filters';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<SortOption>('popular');
  const [category, setCategory] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');

  // Shown under the search box when it's closed, so active filters aren't hidden
  const activeFilters = [
    sort === 'latest' && 'Latest',
    category !== 'all' && category,
    dateRange !== 'all' && DATE_OPTIONS.find((o) => o.value === dateRange)?.label,
  ].filter(Boolean);

  const clearFilters = () => {
    setSort('popular');
    setCategory('all');
    setDateRange('all');
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="relative isolate px-6 pt-12 lg:px-8">
        <Polygon1 />
        <Polygon2 />

        <div className="mx-auto max-w-4xl pb-20">
          {/* Hero sits centered in the first ~70% of the screen (like cal.com); cards peek in below */}
          <section className="flex min-h-[72svh] flex-col justify-center pt-20 sm:pt-28">
          <h1 className="text-center text-[2rem] sm:text-[3.25rem] lg:-mx-32 lg:text-[4.25rem] font-bold tracking-tighter leading-[1.12] text-gray-900 font-sans">
            <span className="block text-balance">The faster way <RedditTile /> to source</span>
            <span className="block text-balance">
              fashion{' '}
              {/* Photo tile: two dot-effect photos (pre-rendered once) that slowly cross-fade, like cal.com's */}
              <span aria-hidden="true" className="relative -top-[0.06em] mx-[0.08em] inline-block h-[0.85em] w-[1.4em] overflow-hidden rounded-[0.2em] align-middle bg-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
                <Image src="/hero/jacket-dithered.png" alt="" fill unoptimized priority className="object-cover [image-rendering:pixelated]" />
                <Image src="/hero/sneakers-dithered.png" alt="" fill unoptimized priority className="object-cover opacity-0 motion-safe:animate-crossfade [image-rendering:pixelated]" />
              </span>{' '}
              from <PlatformTile />
            </span>
          </h1>

          <p className="mt-4 mb-10 text-center font-[Arial,Helvetica,sans-serif] text-base font-normal text-gray-500 sm:text-lg">
            Search the finds everyone’s already talking about
          </p>

          <SearchBar
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            onReset={() => setSearchTerm('')}
          >
            <SearchFilters
              sort={sort}
              onSortChange={(v) => setSort(v as SortOption)}
              category={category}
              onCategoryChange={setCategory}
              dateRange={dateRange}
              onDateRangeChange={(v) => setDateRange(v as DateRange)}
            />
          </SearchBar>

          <div className="h-5 px-4 text-xs text-gray-500">
            {activeFilters.length > 0 && (
              <>
                {activeFilters.join(' · ')}
                <button type="button" onClick={clearFilters} className="ml-2 cursor-pointer font-semibold text-gray-900 hover:underline">
                  Clear
                </button>
              </>
            )}
          </div>
          </section>

          <ProductList searchTerm={searchTerm} sortOption={sort} category={category} dateRange={dateRange} />

        </div>

      </div>
      <Footer />
    </div>
  );
}
