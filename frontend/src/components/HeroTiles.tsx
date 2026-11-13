// components/HeroTiles.tsx
// Small "mini UI" tiles that sit inline in the hero headline (inspired by cal.com's hero).
// Everything is sized in em, so the tiles scale with the heading's font size.
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// Shared tile shell: white card ~0.85x the text height, centered on the line
const tile =
  'relative -top-[0.06em] mx-[0.08em] inline-flex h-[0.85em] items-center gap-[0.14em] rounded-[0.2em] bg-white px-[0.16em] align-middle tracking-normal ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.06)]';

// Small text inside tiles: scales with the heading but never drops below a readable size
const small = 'text-[max(0.21em,10px)] leading-[1.25]';

// Where the finds come from: a mini Reddit post card (title + subreddit and upvotes)
export function RedditTile() {
  return (
    <span aria-hidden="true" className={tile}>
      <span className="flex h-[0.5em] w-[0.5em] shrink-0 items-center justify-center rounded-full bg-[#ff4500]">
        <svg className="h-[55%] w-[55%] text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4l8 9h-5v7H9v-7H4z" />
        </svg>
      </span>
      <span className="flex flex-col text-left">
        <span className={`${small} font-semibold text-gray-900`}>W2C this jacket?</span>
        <span className={`${small} font-medium text-gray-500`}>Reddit · ▲ 1.2k</span>
      </span>
    </span>
  );
}

// Where you buy: logo + name roll up to the next platform every few seconds.
// Official app icons in public/platforms/ (taobao.png from taobao.com; weidian.png and 1688.png from the App Store).
const PLATFORMS = [
  { name: 'Taobao', icon: '/platforms/taobao.png' },
  { name: 'Weidian', icon: '/platforms/weidian.png' },
  { name: '1688', icon: '/platforms/1688.png' },
];
// First platform repeated at the end, so the roll can loop without rolling backwards
const ROWS = [...PLATFORMS, PLATFORMS[0]];
const ROLL_MS = 400;

export function PlatformTile() {
  const [row, setRow] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setRow((r) => r + 1), 2400);
    return () => clearInterval(timer);
  }, []);

  // Once the roll lands on the repeated first row, jump back to the real one (no animation)
  useEffect(() => {
    if (row !== PLATFORMS.length) return;
    const reset = setTimeout(() => setRow(0), ROLL_MS);
    return () => clearTimeout(reset);
  }, [row]);

  // Soft roll: short ease-out slide, and rows fade so only the current one is fully visible
  const animated = row !== 0;
  const motion = 'duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)]';

  return (
    <>
      <span className="sr-only">Taobao, Weidian and 1688</span>
      {/* The tile is as wide as its widest row, so the heading never shifts */}
      <span aria-hidden="true" className={tile}>
        <span className="block h-[0.5em] overflow-hidden">
          <span
            className={`flex flex-col ${animated ? `transition-transform ${motion}` : ''}`}
            style={{ transform: `translateY(-${row * 0.5}em)` }}
          >
            {ROWS.map((platform, i) => (
              <span
                key={i}
                className={`flex h-[0.5em] shrink-0 items-center gap-[0.14em] ${animated ? `transition-opacity ${motion}` : ''} ${i === row ? 'opacity-100' : 'opacity-0'}`}
              >
                <Image src={platform.icon} alt="" width={64} height={64} unoptimized priority={i === 0} className="h-[0.5em] w-[0.5em] rounded-[0.12em]" />
                <span className="text-[max(0.3em,13px)] font-semibold leading-none text-gray-900">{platform.name}</span>
              </span>
            ))}
          </span>
        </span>
      </span>
    </>
  );
}
