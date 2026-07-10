export default function RegistryLoading() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-32 pt-28">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="h-4 w-28 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-3 h-12 w-3/4 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-[var(--color-border)]" />
        </div>
        <div className="hidden h-16 w-36 shrink-0 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] sm:block" />
      </div>

      {/* Table skeleton */}
      <div className="mt-8 space-y-3">
        <div className="h-14 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-14 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-14 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-14 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
      </div>

      {/* Faucet + Info grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="h-36 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-36 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
      </div>
    </main>
  )
}
