function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-[#e0dbd5] ${className}`} />;
}

export function BookCardSkeleton() {
  return (
    <div className="w-40 shrink-0 overflow-hidden rounded-lg bg-card">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-2 p-2.5">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="mb-3 flex rounded-lg bg-card p-3">
      <Skeleton className="h-[100px] w-[70px] rounded-sm" />
      <div className="ml-3 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-[90%]" />
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  );
}
