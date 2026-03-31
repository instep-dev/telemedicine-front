const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800/60 ${className}`} />
);

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-11 w-full max-w-xs" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-36" />
            <Skeleton className="h-11 w-24" />
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1100px] px-6 py-5">
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
