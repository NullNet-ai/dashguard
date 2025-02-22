export default function Skeleton() {
  return (
    <div className="w-full max-w-full animate-pulse space-y-4 p-4">
      {/* Search bar skeleton */}
      <div className="mb-4 h-10 rounded-md bg-slate-200"></div>

      {/* List skeleton items */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-md bg-slate-200 p-4"
          >
            <div className="mx-2 h-4 w-1/4 rounded-md bg-slate-300"></div>
            <div className="mx-2 h-4 w-1/4 rounded-md bg-slate-300"></div>
            <div className="mx-2 h-4 w-1/4 rounded-md bg-slate-300"></div>
            <div className="mx-2 h-4 w-1/4 rounded-md bg-slate-300"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
