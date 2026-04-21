const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800/60 ${className}`} />
);

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start lg:justify-between">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        <div className="grid gap-6 border-t border-gray-100 p-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, colIdx) => (
            <div key={`col-${colIdx}`} className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              {Array.from({ length: 3 }).map((__, cardIdx) => (
                <Skeleton key={`card-${colIdx}-${cardIdx}`} className="h-36 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
