export default function PosterBanner({ className = "" }: { className?: string }) {
  return (
    <section aria-label="Special Offers" className={`w-full overflow-hidden ${className}`}>
      {/* Mobile poster */}
      <img
        src="/Poster-ForMobile.png"
        alt="Special offer and discount poster"
        loading="lazy"
        className="block h-auto w-full md:hidden"
      />
      {/* Desktop & tablet poster */}
      <img
        src="/poster.png"
        alt="Special offer and discount poster"
        loading="lazy"
        className="hidden h-auto w-full md:block"
      />
    </section>
  );
}
