const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
);

export default function Loading() {
  return (
    <div className="h-[100dvh] w-full bg-[#0b0f17] text-white flex flex-col">
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative">
          <Skeleton className="absolute inset-0" />
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative">
          <Skeleton className="absolute inset-0" />
        </div>
      </div>

      <div className="px-4 py-4 border-t border-white/10 flex items-center justify-center gap-3">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    </div>
  );
}
