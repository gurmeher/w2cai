//components/ProductCard.tsx
import { useRef } from 'react';
import ProductModal from './ProductModal';
import Image from 'next/image';

export type ProductCardProps = {
  id: number;
  name: string;
  url: string;
  first_seen_utc: number;
  image_url?: string;
  reddit_posts?: {
    id: number;
    title: string;
    permalink: string;
    subreddit: string;
    upvotes: number;
    created_utc: number;
  }[];
};

export default function ProductCard({ id, name, url, image_url, first_seen_utc, reddit_posts }: ProductCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  const daysAgo = Math.floor((Date.now() - first_seen_utc * 1000) / 86400000);
  const daysText = daysAgo === 1 ? "day" : "days";

  const openModal = () => {
    dialogRef.current?.showModal();
  };

  const subreddit = reddit_posts?.[0]?.subreddit;

  return (
    <>
      <div className="border-2 border-gray-200 p-4 rounded hover:shadow transition-shadow flex justify-between">
        {/* Left side: Name, subreddit, button */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-black">{name}</h2>
            {subreddit && (
              <div className="mt-1 mb-4 inline-block rounded-full bg-purple-100 text-gray-800 text-xs font-bold px-3 py-1">
                r/{subreddit}
              </div>
            )}
          </div>

          <button
            onClick={openModal}
            className="mt-auto cursor-pointer rounded-md shadow-xs bg-indigo-600 hover:bg-indigo-800 transition-colors px-3.5 py-2.5 w-25
            text-sm font-bold text-white focus-visible:outline-2 
            focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            See Info
          </button>
        </div>

        {/* Right side: Days ago and image */}
        <div className="flex flex-col items-end ml-4 flex-shrink-0">
          <div className="text-gray-400 font-bold mb-2 whitespace-nowrap">
            {daysAgo} {daysText} ago
          </div>
          {image_url ? (
            <Image
              src={image_url}
              alt={name}
              className="w-30 h-30 lg:w-40 lg:h-40 object-cover rounded"
              width={100}
              height={100}
            />
          ) : ( 
            <div className="w-30 h-30 lg:w-40 lg:h-40 rounded bg-white" />
          )}

        </div>
      </div>


      <ProductModal
        ref={dialogRef}
        id={id}
        name={name}
        url={url}
        first_seen_utc={first_seen_utc}
        image_url={image_url}
        reddit_posts={reddit_posts}
      />
    </>
  );
}