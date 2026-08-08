export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-[3/4] rounded-[3px] border border-softblack/10 bg-beige" />
      <div className="pt-4">
        <div className="h-[10px] w-16 rounded-[2px] bg-beige" />
        <div className="mt-2 h-[16px] w-3/4 rounded-[2px] bg-beige" />
        <div className="mt-2 h-[13px] w-20 rounded-[2px] bg-beige" />
        <div className="mt-2 h-[15px] w-24 rounded-[2px] bg-beige" />
        <div className="mt-2 h-3 w-3 rounded-full bg-beige" />
      </div>
    </div>
  );
}
