export default function ConsoleLoading() {
  return (
    <div className="mx-auto w-full max-w-[var(--container-wrap)] px-6 pb-32 pt-28 sm:px-8 sm:pt-32">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="h-4 w-28 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-3 h-12 w-1/2 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-[var(--color-border)]" />
        </div>
      </div>

      {/* Metrics row */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-32 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-32 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-32 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
      </div>

      {/* Tvs section */}
      <div className="mt-8 space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-[var(--color-border)]" />
        <div className="h-44 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
      </div>

      {/* Nav cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        ))}
      </div>
    </div>
  )
}
