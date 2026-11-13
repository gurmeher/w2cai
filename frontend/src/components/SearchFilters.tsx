// components/SearchFilters.tsx
// One line of plain-text controls shown inside the expanded search box:
//   Popular  Latest  ·  All types ⌄  ·  All time ⌄
'use client';

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CATEGORY_OPTIONS, DATE_OPTIONS, SORT_OPTIONS } from '@/lib/filters';

type Option = { value: string; label: string };

// Shared text style: quiet gray text, light background on hover, darker when selected
const item = 'h-8 cursor-pointer rounded-full px-3 text-sm whitespace-nowrap hover:bg-black/5 hover:text-gray-900';

function TextSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Option[] }) {
  const selected = options.find((o) => o.value === value) ?? options[0];
  const active = value !== options[0].value;

  return (
    <Listbox value={value} onChange={onChange}>
      <ListboxButton aria-label={label} className={`${item} inline-flex items-center gap-1 focus:outline-none data-open:bg-black/5 ${active ? 'font-medium text-accent' : 'text-gray-500'}`}>
        {selected.label}
        <svg aria-hidden="true" className="h-3 w-3 opacity-60" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </ListboxButton>
      <ListboxOptions
        anchor={{ to: 'bottom start', gap: 6 }}
        className="z-50 min-w-40 rounded-2xl bg-white/75 p-1.5 backdrop-blur-[16px] shadow-[0_0_1px_rgba(0,0,0,0.12),0_12px_40px_rgba(0,0,0,0.16)] focus:outline-none"
      >
        {options.map((option) => (
          <ListboxOption
            key={option.value}
            value={option.value}
            className="cursor-pointer rounded-xl px-3 py-1.5 text-sm text-gray-600 data-focus:bg-black/5 data-focus:text-gray-900 data-selected:font-medium data-selected:text-gray-900"
          >
            {option.label}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}

const Dot = () => <span aria-hidden="true" className="px-1 text-gray-300">·</span>;

type SearchFiltersProps = {
  sort: string;
  onSortChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
};

export default function SearchFilters(props: SearchFiltersProps) {
  const categoryOptions = [{ value: 'all', label: 'All types' }, ...CATEGORY_OPTIONS.slice(1)];

  return (
    <div className="flex items-center overflow-x-auto">
      {/* Segmented switch: gray track, selected option is a raised white pill */}
      <div role="radiogroup" aria-label="Sort" className="flex shrink-0 items-center rounded-full bg-black/[0.06] p-0.5">
        {SORT_OPTIONS.map((option) => {
          const selected = option.value === props.sort;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => props.onSortChange(option.value)}
              className={`h-7 cursor-pointer rounded-full px-3 text-sm whitespace-nowrap ${
                selected ? 'bg-white font-medium text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <Dot />
      <TextSelect label="Product type" value={props.category} onChange={props.onCategoryChange} options={categoryOptions} />
      <Dot />
      <TextSelect label="Posted within" value={props.dateRange} onChange={props.onDateRangeChange} options={DATE_OPTIONS} />
    </div>
  );
}
