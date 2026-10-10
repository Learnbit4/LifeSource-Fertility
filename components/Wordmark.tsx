// Placeholder text wordmark. Swap for the real SVG logo (the supplied JPEG is raster, white on black).
export default function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`font-display text-2xl font-semibold tracking-tight ${className}`}>supsperm<span className="text-emerald">.com</span></span>;
}
