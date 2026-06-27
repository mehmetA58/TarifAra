export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 animate-pulse">
      <div className="aspect-video bg-stone-200 dark:bg-stone-700" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-stone-200 dark:bg-stone-700 rounded-full w-3/4" />
        <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded-full w-1/2" />
      </div>
    </div>
  )
}

export function SkeletonText({ className = '' }: { className?: string }) {
  return (
    <div className={`h-4 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse ${className}`} />
  )
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-stone-200 dark:bg-stone-700 rounded-xl animate-pulse ${className}`} />
  )
}
