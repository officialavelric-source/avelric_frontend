const ITEMS = [
  {
    t: "Same-day delivery in Tricity & Kharar",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 7h11v9H3z" />
        <path d="M14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17.5" cy="18" r="1.6" />
      </svg>
    ),
  },
  {
    t: "7-day easy returns",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 11a9 9 0 1 1 2.6 6.3" />
        <path d="M3 5v6h6" />
      </svg>
    ),
  },
  {
    t: "COD available across India",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
        <circle cx="12" cy="12" r="2.6" />
      </svg>
    ),
  },
  {
    t: "Quality-checked twice",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

export default function USPStrip() {
  return (
    <div className="border-b border-softblack/10 bg-ivory">
      <div className="mx-auto grid max-w-7xl grid-cols-2 px-3 sm:px-6 md:grid-cols-4">
        {ITEMS.map((item, idx) => (
          <div
            key={item.t}
            className={`flex items-center justify-center gap-2 px-2.5 sm:px-3 py-3 text-center text-[10.5px] sm:text-[11.5px] text-softblack/80 md:py-3.5 ${
              idx % 2 === 1 ? "border-l border-softblack/10 md:border-l-0" : ""
            } ${idx >= 2 ? "border-t border-softblack/10 md:border-t-0" : ""} ${
              idx > 0 ? "md:border-l md:border-softblack/10" : ""
            }`}
          >
            <span className="shrink-0 text-softblack/60">{item.icon}</span>
            <span className="leading-tight">{item.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
