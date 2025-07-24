//i genuinely dont know how alot of this works
import { forwardRef } from 'react';

type ProductModalProps = {
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

const ProductModal = forwardRef<HTMLDialogElement, ProductModalProps>(
  ({ id, name, url, first_seen_utc, reddit_posts }, ref) => {
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
        className="fixed inset-0 m-auto backdrop rounded-lg shadow-xl max-w-lg w-full p-0 border-0" //backdrop was made in globals.css
        onClick={(e) => {
          if (ref && 'current' in ref && e.target === ref.current) { // Close modal when clicking outside content
            closeModal();
          }
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
            <button
              onClick={closeModal}
              className="cursor-pointer text-gray-400 hover:text-gray-600 text-2xl font-bold" // Close button
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
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
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  Reddit Posts
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  {reddit_posts.map((post) => (
                    <li key={post.id}>
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
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
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                First Seen
              </h3>
              <p className="">{formattedDate} ({daysAgo} {daysText} ago)</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                Item ID
              </h3>
              <p className="text-gray-900">#{id}</p>
            </div>

            </div>

          <div className="mt-6 flex gap-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer rounded-md shadow-xs bg-indigo-600 hover:bg-indigo-800 transition-colors px-3.5 py-2.5 
                text-sm font-bold text-white focus-visible:outline-2 
                focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Visit Product
            </a>
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
