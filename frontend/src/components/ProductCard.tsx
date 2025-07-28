//components/ProductCard.tsx
import { useRef } from 'react';
import ProductModal from './ProductModal';

export type ProductCardProps = {
  id: number;
  name: string;
  url: string;
  first_seen_utc: number;
  reddit_posts?: {
    id: number;
    title: string;
    permalink: string;
    subreddit: string;
    upvotes: number;
    created_utc: number;
  }[];
};

export default function ProductCard({ id, name, url, first_seen_utc, reddit_posts }: ProductCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  const daysAgo = Math.floor((Date.now() - first_seen_utc * 1000) / 86400000);
  const daysText = daysAgo === 1 ? "day" : "days";

  const openModal = () => {
    dialogRef.current?.showModal();
  };

  const subreddit = reddit_posts?.[0]?.subreddit;

  return (
    <>
      <div className="border-2 border-gray-200 p-4 rounded hover:shadow transition-shadow">
        <div>
          <div className="flex items-center">
          <h2 className="text-lg font-bold text-black">{name}</h2>
          <h2 className="font-bold text-gray-400 ml-auto whitespace-nowrap ">{daysAgo} {daysText} ago</h2>
        </div>
        {subreddit && (
          <div className="mt-1 mb-8 inline-block rounded-full bg-purple-100 text-gray-800 text-xs font-bold px-3 py-1">
            r/{subreddit}
          </div>
        )}
      </div>

      <button
          onClick={openModal}
          className="cursor-pointer rounded-md shadow-xs bg-indigo-600 hover:bg-indigo-800 transition-colors px-3.5 py-2.5 
          text-sm font-bold text-white focus-visible:outline-2 
          focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          See Info
        </button>
      </div>

      <ProductModal
        ref={dialogRef}
        id={id}
        name={name}
        url={url}
        first_seen_utc={first_seen_utc}
        reddit_posts={reddit_posts}
      />
    </>
  );
}