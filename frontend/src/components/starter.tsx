'use client'

import Header from '@/components/Header';
import Polygon1 from '@/components/Polygon1';
import Polygon2 from '@/components/Polygon2';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="relative isolate px-6 pt-12 lg:px-8">
        <Polygon1 />
        <Polygon2 />

        <div className="mx-auto max-w-4xl py-15 lg:py-25 text-left">
          <h1 className="text-center mb-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-sans">
            header
          </h1>
          
        </div>
      </div>
      <Footer />
    </div>
  );
}
