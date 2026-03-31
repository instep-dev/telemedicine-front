const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800/60 ${className}`} />
);

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-4 w-56" />
          <Skeleton className="mt-4 h-24 w-full" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-4 w-48" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-3 h-4 w-44" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
