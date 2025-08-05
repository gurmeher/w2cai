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
  price?: number;
  reddit_posts?: {
    id: number;
    title: string;
    permalink: string;
    subreddit: string;
    upvotes: number;
    created_utc: number;
  }[];
};

export default function ProductCard({ id, name, url, image_url, first_seen_utc, reddit_posts, price }: ProductCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  const daysAgo = Math.floor((Date.now() - first_seen_utc * 1000) / 86400000);
  const daysText = daysAgo === 1 ? "day" : "days";

  const openModal = () => {
    dialogRef.current?.showModal();
  };

  const subreddit = reddit_posts?.[0]?.subreddit;
  const redditMentions = reddit_posts?.length ?? 0;

  return (
    <>
      <div className="border border-gray-200 bg-white rounded-2xl p-4 flex justify-between items-stretch shadow-sm hover:shadow-md transition-shadow">
        {/* Left side: Name, subreddit, button */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-black">{name}</h2>
            {subreddit && (
              <div className="mt-1 inline-block rounded-full bg-purple-100 text-gray-800 text-xs font-bold px-3 py-1">
                🔗 {redditMentions} Reddit {redditMentions === 1 ? 'Mention' : 'Mentions'}
              </div>
            )}

            {price != null ? (
              <div className="mt-2 lg:mt-2 text-xl mb-2 lg:text-2xl font-bold tracking-tight text-gray-800">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CNY' }).format(price)}
              </div>
            ) : (
              <div className="mt-2 lg:mt-4 text-sm mb-2 lg:text-lg font-medium text-gray-400 italic">
                Price unavailable, see link or use agent
              </div>
            )}


          </div>

          <button
            onClick={openModal}
            className="mt-auto cursor-pointer rounded-md shadow-xs bg-indigo-600 hover:bg-indigo-800 transition-all px-3.5 py-2.5 w-25
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
              className="w-30 h-30 lg:w-40 lg:h-40 object-cover rounded-lg border"
              width={100}
              height={100}
            />
          ) : ( 
            <div className="w-30 h-30 lg:w-40 lg:h-40 rounded-lg border bg-white" />
          )}

        </div>
      </div>


      <ProductModal
        ref={dialogRef}
        id={id}
        name={name}
        url={url}
        first_seen_utc={first_seen_utc}
        price={price}
        image_url={image_url}
        reddit_posts={reddit_posts}
      />
    </>
  );
}