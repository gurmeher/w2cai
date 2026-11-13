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
          <li>
            <Link
              href="/contact"
              className="hover:underline me-6"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>

      {/* Bottom section with logo and copyright */}
      <div className="w-full mx-auto max-w-screen-xl px-6 pb-6 md:flex md:items-center md:justify-between">
        {/* Copyright */}
        <span className="text-xs text-gray-500 mb-4">
          © {new Date().getFullYear()} W2Cai. All rights reserved.
        </span>

        {/* Center logo */}
        <div className="flex justify-center mb-4">
            <Image
                alt="W2Cai Logo"
                src="/w2cai_logo.svg"
                className="h-auto w-12"
                width={48}
                height={12}
            />
        </div>

        {/* Right side links */}
        <div className="flex space-x-4 text-xs text-gray-500 mb-4">
          <Link href="/tos" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;