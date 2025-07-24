export type ProductCardProps = {
  id: number;
  name: string;
  url: string;
  first_seen_utc: number;
};

export default function ProductCard({ id, name, url, first_seen_utc }: ProductCardProps) {
  const daysAgo = Math.floor((Date.now() - first_seen_utc * 1000) / 86400000); //math to calculate days ago
  const daysText = daysAgo === 1 ? "day" : "days"; // variable to change day/days

  return (
    <div className="border-2 p-4 rounded hover:shadow transition-shadow">
      <div className="flex items-center">
        <h2 className="text-lg font-bold text-black">{name}</h2>
        <h2 className="font-bold text-gray-400 ml-auto">Added {daysAgo} {daysText} ago</h2>
      </div>
      
      <a
        href={url}
        className="rounded-md shadow-xs bg-indigo-600 hover:bg-gray-800 transition-colors px-3.5 py-2.5 
        text-sm font-bold text-white focus-visible:outline-2 
        focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        target="_blank"
        rel="noopener noreferrer"
      >
        See More
      </a>
    </div>
  );
}