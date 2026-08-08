export default function Icon({ path, label, className = "h-[19px] w-[19px]" }: { path: string; label: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className} role="img" aria-label={label}>
      <path d={path} />
    </svg>
  );
}
