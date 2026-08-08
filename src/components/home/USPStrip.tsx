const ITEMS = [
  {
    t: "Free shipping above ₹2,499",
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
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-softblack/10 px-6 md:grid-cols-4 md:divide-y-0">
        {ITEMS.map((item) => (
          <div key={item.t} className="flex items-center justify-center gap-2.5 px-3 py-3.5 text-center text-[11.5px] text-softblack/80 md:py-3">
            <span className="text-softblack/60">{item.icon}</span>
            {item.t}
          </div>
        ))}
      </div>
    </div>
  );
}
