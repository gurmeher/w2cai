'use client'

import { useState } from 'react';
import Header from '@/components/Header';
import Polygon1 from '@/components/Polygon1';
import Polygon2 from '@/components/Polygon2';
import SearchBar from '@/components/SearchBar';
import ProductList from '@/components/ProductList';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="relative isolate px-6 pt-12 lg:px-8">
        <Polygon1 />
        <Polygon2 />

        <div className="mx-auto max-w-4xl py-15 lg:py-25 text-left">
          <h1 className="text-center mb-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-sans">
            Search
          </h1>
          <div className="mb-5">
            <SearchBar onSearch={(term) => setSearchTerm(term)} />
          </div>

          <ProductList searchTerm={searchTerm} defaultSort="latest" />
        </div>
      </div>
    </div>
  );
}
