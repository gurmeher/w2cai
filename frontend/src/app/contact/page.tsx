'use client'

import Header from '@/components/Header';
import Polygon1 from '@/components/Polygon1';
import Polygon2 from '@/components/Polygon2';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="relative isolate px-6 pt-12 lg:px-8">
        <Polygon1 />
        <Polygon2 />

        <div className="mx-auto max-w-6xl py-15 lg:py-25 text-left">
          <h1 className="text-center mb-5 text-4xl font-bold tracking-tight text-gray-900 font-sans">
            Contact Us
          </h1>
            <p className="text-md font-md text-gray-800 sm:text-xl/8">
                Feedback, bugs, questions, or just want to say hi?
            </p>
            <Link href="mailto:w2cai.com@gmail.com" className="text-lg text-indigo-600 font-bold hover:underline">w2cai.com@gmail.com</Link>
            <p className="text-md font-md text-gray-800 sm:text-xl/8">
                <br />Join the discussion on Reddit: 
            </p>
            <Link href="https://www.reddit.com/user/is3fiddy/" className="text-lg text-indigo-600 font-bold hover:underline">u/is3fiddy</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
