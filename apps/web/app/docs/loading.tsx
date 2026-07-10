export default function DocsLoading() {
  return (
    <main className="mx-auto w-full max-w-[var(--container-wrap)] px-6 pb-32 pt-28">
      {/* Sidebar + content skeleton */}
      <div className="flex gap-12">
        <div className="hidden w-56 shrink-0 space-y-2 md:block">
          <div className="h-4 w-32 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-6 h-3 w-28 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="h-3 w-20 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="h-3 w-32 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-6 h-3 w-24 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="h-3 w-28 animate-pulse rounded bg-[var(--color-border)]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="h-10 w-2/3 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-[var(--color-border)]" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-[var(--color-border)]" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-border)]" />
            <div className="h-4 w-full animate-pulse rounded bg-[var(--color-border)]" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-[var(--color-border)]" />
          </div>
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-[var(--color-border)]" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--color-border)]" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-[var(--color-border)]" />
          </div>
        </div>
      </div>
    </main>
  )
}
