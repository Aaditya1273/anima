export default function PairDetailLoading() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-28">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="h-4 w-28 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-3 h-12 w-1/2 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-2 h-5 w-36 animate-pulse rounded bg-[var(--color-border)]" />
        </div>
      </div>

      {/* Cards */}
      <div className="mt-8 grid gap-6">
        <div className="h-36 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-28 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-28 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />

        {/* Row of 3 small cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-28 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
          <div className="h-28 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
          <div className="h-28 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        </div>
      </div>
    </main>
  )
}
