const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800/60 ${className}`} />
);

export default function Loading() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-4 h-56 w-full" />
        </div>
      </div>

      <div className="col-span-12 xl:col-span-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-4 h-64 w-full" />
        </div>
      </div>

      <div className="col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-4 h-64 w-full" />
        </div>
      </div>

      <div className="col-span-12 xl:col-span-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-4 h-60 w-full" />
        </div>
      </div>

      <div className="col-span-12 xl:col-span-7">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
