/**
 * Site logo (purple "-m" mark on a transparent background, works on both themes).
 * Source: public/muLogo-purple.png → optimized copy at public/logo-purple.webp (384×200).
 * Size it with a height class on `className` (defaults to 24px tall); width follows the aspect ratio.
 */
export default function Logo({ className = "h-6" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo-purple.webp" alt="" aria-hidden="true" width={384} height={200} className={`block w-auto shrink-0 ${className}`} />
  );
}
