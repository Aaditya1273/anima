export default function PayrollViewsLoading() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-32 pt-28">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="h-4 w-36 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-3 h-12 w-3/4 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-3 h-5 w-1/2 animate-pulse rounded bg-[var(--color-border)]" />
        </div>
      </div>

      {/* Role selector */}
      <div className="mt-8 flex gap-2">
        <div className="h-10 w-36 animate-pulse rounded-full bg-[var(--color-border)]" />
        <div className="h-10 w-28 animate-pulse rounded-full bg-[var(--color-border)]" />
        <div className="h-10 w-40 animate-pulse rounded-full bg-[var(--color-border)]" />
      </div>

      {/* Grid */}
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-56 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
          <div className="h-40 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        </div>
        <div className="space-y-4">
          <div className="h-36 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
          <div className="h-24 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        </div>
      </div>
    </main>
  )
}
