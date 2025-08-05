//this is for what pops up when you press see more on the producct card
import { forwardRef } from 'react';
import Image from 'next/image';

type ProductModalProps = {
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

const ProductModal = forwardRef<HTMLDialogElement, ProductModalProps>(
  ({ id, name, url, first_seen_utc, image_url, price, reddit_posts }, ref) => {
    const daysAgo = Math.floor((Date.now() - first_seen_utc * 1000) / 86400000);
    const daysText = daysAgo === 1 ? "day" : "days";

    const formattedDate = new Date(first_seen_utc * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const closeModal = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.close();
      }
    };

    return (
      <dialog
        ref={ref}
        className="fixed inset-0 m-auto backdrop rounded-2xl shadow-xl max-w-lg w-full p-0 border border-gray-400" //backdrop was made in globals.css
        onClick={(e) => {
          if (ref && 'current' in ref && e.target === ref.current) { // Close modal when clicking outside content
            closeModal();
          }
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="mt-2 text-2xl font-bold text-gray-900">{name}</h2>
            <button
              onClick={closeModal}
              className="cursor-pointer text-gray-400 hover:text-gray-600 text-2xl font-bold" // Close button
            >
              ×
            </button>
          </div>

          {/* Image */}
          {image_url ? (
            <Image
              src={image_url}
              alt={name}
              className="mt-4 w-full max-h-120 object-cover rounded mb-4 mx-auto"
              width={720}
              height={720}
            />
          ) : (
            <div className="mb-3 mt-2 w-full max-h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm h-40 font-bold">
              Image unavailable, see reddit or use agent
            </div>
          )}

          {/* Title
          <h2 className="mb-2 text-xl lg:text-2xl font-bold text-gray-800">
            {name}
          </h2> */}

          <div>
            {price != null ? (
              <div className="inline-block text-xl lg:text-xl font-bold tracking-tight text-gray-800 bg-purple-100 px-3 py-1 rounded-md mb-3">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CNY' }).format(price)}
              </div>
            ) : (
              <div className="text-sm mb-2 lg:text-lg font-medium text-gray-400 italic">
                Price unavailable, see link or use agent
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Raw Product Link
              </h3>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline break-all"
              >
                {url}
              </a>
            </div>

            {reddit_posts && reddit_posts.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Reddit Posts
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  {reddit_posts.map((post) => (
                    <li key={post.id}>
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline break-all"
                      >
                        {post.title} ({post.subreddit})
                      </a>
                      <p className="text-xs text-gray-500">
                        {new Date(post.created_utc * 1000).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                First Seen
              </h3>
              <p className="">{formattedDate} ({daysAgo} {daysText} ago)</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Item ID
              </h3>
              <p className="text-gray-900">#{id}</p>
            </div>

            </div>

          <div className="mt-6 flex gap-3">
            {/*<a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer rounded-md shadow-xs bg-indigo-600 hover:bg-indigo-800 transition-colors px-3.5 py-2.5 
                text-sm font-bold text-white focus-visible:outline-2 
                focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Visit Product
            </a> */}
            <button
              onClick={closeModal}
              className="cursor-pointer rounded-md shadow-xs bg-gray-200 hover:bg-gray-300 transition-colors px-3.5 py-2.5 
                text-sm font-bold text-black focus-visible:outline-2 
                focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    );
  }
);

ProductModal.displayName = 'ProductModal';

export default ProductModal;
