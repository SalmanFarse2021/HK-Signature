export default function Skeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 rounded bg-gray-200/70 dark:bg-slate-700/60" />
      ))}
    </div>
  );
}

