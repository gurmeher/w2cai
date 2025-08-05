import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white">
      {/* Horizontal line */}
      <div className="border-t border-gray-300 mx-8"></div>
      
      {/* Footer content */}
      <div className="w-full mx-auto max-w-screen-xl p-6 md:flex md:items-center md:justify-between">
        {/* Left side - Navigation links */}
        <ul className="flex flex-wrap items-center text-sm text-gray-600">
          <li>
            <Link
              href="/"
              className="hover:underline me-6"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/search"
              className="hover:underline me-6"
            >
              Search
            </Link>
          </li>
          <li>
            <Link
              href="/faqs"
              className="hover:underline me-6"
            >
              FAQs
            </Link>
          </li>
        </ul>

        {/* Right side - Social icons */}
        <div className="flex items-center space-x-4">
          {/* <Link 
            href="#" 
            className="text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="YouTube"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </Link> */}
        </div>
      </div>

      {/* Bottom section with logo and copyright */}
      <div className="w-full mx-auto max-w-screen-xl px-6 pb-6 md:flex md:items-center md:justify-between">
        {/* Copyright */}
        <span className="text-xs text-gray-500 mb-4 md:mb-0">
          © {new Date().getFullYear()} W2Cai. All rights reserved.
        </span>

        {/* Center logo */}
        <div className="flex justify-center mb-4 md:mb-0">
            <Image
                alt="W2Cai Logo"
                src="/w2cai_logo.svg"
                className="h-auto w-12"
                width={48}
                height={12}
            />
        </div>

        {/* Right side links */}
        <div className="flex space-x-4 text-xs text-gray-500">
          <Link href="#" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="#" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;