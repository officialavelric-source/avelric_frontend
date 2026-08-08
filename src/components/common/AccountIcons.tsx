/* Line-art icons for the Account sidebar/stat cards — same visual language
   as TrustIcons, kept separate since these map to account concepts (nav
   sections, stat types) rather than checkout trust signals. */

const base = "h-[18px] w-[18px] shrink-0";
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

export function GridIcon({ className = base }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export function BoxIcon({ className = base }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M21 7.5v9l-9 5-9-5v-9l9-5 9 5z" />
      <path d="M3 7.5l9 5 9-5" />
      <path d="M12 12.5V21.5" />
    </svg>
  );
}

export function HeartIcon({ className = base }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12 20.5s-7.5-4.7-9.6-9.2C.9 8 2.7 4.5 6.2 4.5c2 0 3.5 1.1 4.3 2.6L12 8.6l1.5-1.5c.8-1.5 2.3-2.6 4.3-2.6 3.5 0 5.3 3.5 3.8 6.8-2.1 4.5-9.6 9.2-9.6 9.2Z" />
    </svg>
  );
}

export function MapPinIcon({ className = base }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function UserIcon({ className = base }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

export function CoinIcon({ className = base }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </svg>
  );
}
