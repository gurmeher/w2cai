type ProductCardProps = {
  name: string;
  url: string;
};

export default function ProductCard({ name, url }: ProductCardProps) {
  return (
    <div className="border-2 p-4 rounded hover:shadow transition-shadow">
      <h2 className="text-lg font-bold text-black">{name}</h2>
      <a href={url} className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" target="_blank" rel="noopener noreferrer">
        See More
      </a>
    </div>
  );
}