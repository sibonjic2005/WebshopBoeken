export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-8 w-32 rounded bg-zinc-200" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-zinc-100" />
        ))}
      </div>
    </div>
  );
}
