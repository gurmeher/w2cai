'use client';

// Site header: logo on the left. On desktop the links sit inline on the right (underline on hover);
// on phones they move into an Airbnb-style round "three lines" button that opens a dropdown card.

import Link from 'next/link';
import Image from 'next/image';
import { Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

// Menu rows, grouped; a thin divider goes between groups
const MENU_GROUPS = [
  [
    { name: 'Home', href: '/' },
    { name: 'Contact', href: '/contact' },
  ],
  [{ name: 'Follow us on TikTok', href: 'https://www.tiktok.com/@w2cai.com', external: true }],
];

export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
        <Link href="/" className="-m-1.5 p-1.5">
          <span className="sr-only">W2Cai</span>
          <Image alt="W2Cai Logo" src="/w2cai_logo.svg" className="h-auto w-18" width={72} height={16} />
        </Link>

        {/* Desktop: plain inline links */}
        <div className="hidden items-center gap-x-8 md:flex">
          {MENU_GROUPS.flat().map((item) => (
            <Link
              key={item.name}
              href={item.href}
              {...('external' in item && item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="text-sm font-semibold text-gray-900 underline-offset-4 hover:underline"
            >
              {'external' in item && item.external ? 'TikTok' : item.name}
            </Link>
          ))}
        </div>

        {/* Phones: three-line menu */}
        <div className="md:hidden">
        <Menu>
          {/* 40px light-gray circle with three lines, like Airbnb's */}
          <MenuButton
            aria-label="Main navigation menu"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#f2f2f2] text-[#222] hover:bg-[#ebebeb] focus:outline-none data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-gray-900"
          >
            <svg aria-hidden="true" viewBox="0 0 32 32" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3}>
              <path d="M2 16h28M2 24h28M2 8h28" />
            </svg>
          </MenuButton>

          {/* Dropdown card: white, 12px corners, soft shadow, 36px rows */}
          <MenuItems
            anchor={{ to: 'bottom end', gap: 12 }}
            className="z-50 w-60 rounded-xl bg-white py-3 shadow-[0_2px_16px_rgba(0,0,0,0.12)] focus:outline-none"
          >
            {MENU_GROUPS.map((group, g) => (
              <Fragment key={g}>
                {g > 0 && <div className="mx-6 my-2 h-px bg-[#ddd]" />}
                {group.map((item) => (
                  <MenuItem key={item.name}>
                    <Link
                      href={item.href}
                      {...('external' in item && item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="block px-6 py-[9px] text-sm leading-[18px] text-[#222] data-focus:bg-[#f7f7f7]"
                    >
                      {item.name}
                    </Link>
                  </MenuItem>
                ))}
              </Fragment>
            ))}
          </MenuItems>
        </Menu>
        </div>
      </nav>
    </header>
  );
}
