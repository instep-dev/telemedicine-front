const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800/60 ${className}`} />
);

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-56" />
      <Skeleton className="h-4 w-64" />
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-4 h-10 w-full" />
      </div>
    </div>
  );
}
