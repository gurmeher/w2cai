// Price in the heading's style (Geist, bold, tight); the ¥ sits smaller and lighter so the number leads.
// Used on the product cards and in the item popup. Pass a text size via className.
export default function Price({ price, className = 'text-[22px] md:text-2xl' }: { price: number; className?: string }) {
  return (
    <span className={`font-sans font-bold leading-none tracking-tighter text-gray-900 tabular-nums ${className}`}>
      <span className="mr-[0.08em] align-[0.28em] text-[0.6em] font-semibold text-gray-500">¥</span>
      {price.toLocaleString('en-US')}
    </span>
  );
}
