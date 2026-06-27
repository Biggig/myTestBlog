export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-6">
      <div className="h-4 w-16 bg-muted rounded" />
      <div className="h-10 w-3/4 bg-muted rounded" />
      <div className="flex gap-3">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-4 w-16 bg-muted rounded" />
      </div>
      <div className="space-y-3 mt-8">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-5/6 bg-muted rounded" />
        <div className="h-4 w-4/6 bg-muted rounded" />
      </div>
    </div>
  );
}
