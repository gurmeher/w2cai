// components/SortDropdown.tsx
'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

export type SortOption = 'latest' | 'popular';

type SortDropdownProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
};

const sortOptions = {
  popular: 'Popular',
  latest: 'Latest',
};

export default function SortDropdown({ value, onChange, className = '' }: SortDropdownProps) {
  const handleSelect = (option: SortOption) => {
    onChange(option);
  };

  return (
    <div className={`flex justify-start items-center ${className}`}>
      <label className="mr-2 text-sm font-bold text-gray-800">
        Sort By:
      </label>
      <Menu as="div" className="relative inline-block">
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50">
          {sortOptions[value]}
          <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
        </MenuButton>
        <MenuItems
          transition
          className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
        >
          <div className="py-1">
            <MenuItem>
              <button
                onClick={() => handleSelect('popular')}
                className={`block w-full px-4 py-2 text-left text-sm font-bold data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden ${
                  value === 'popular' ? 'bg-purple-100 text-gray-900 font-bold' : 'text-gray-700'
                }`}
              >
                Popular
              </button>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => handleSelect('latest')}
                className={`block w-full px-4 py-2 text-left text-sm font-bold data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden ${
                  value === 'latest' ? 'bg-purple-100 text-gray-900 font-bold' : 'text-gray-700'
                }`}
              >
                Latest
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}