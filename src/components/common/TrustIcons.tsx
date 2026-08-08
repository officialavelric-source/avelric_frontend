/* Line-art trust-strip icons — shared between OrderSummary, FreeShippingBar
   and the site Footer so those rows read as one designed system instead of
   OS-dependent emoji. */

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

export function TruckIcon({ className = base }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="1" y="6" width="13" height="10" rx="1.5" />
      <path d="M14 10h4l3.5 3.5V16h-7.5" />
      <circle cx="6" cy="18.5" r="1.8" />
      <circle cx="17.5" cy="18.5" r="1.8" />
    </svg>
  );
}

export function ReturnIcon({ className = base }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

export function CashIcon({ className = base }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function LockIcon({ className = base }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function ShieldCheckIcon({ className = base }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
