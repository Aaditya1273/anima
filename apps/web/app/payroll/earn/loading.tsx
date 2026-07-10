export default function EarnLoading() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-28">
      <div className="h-4 w-36 animate-pulse rounded bg-[var(--color-border)]" />
      <div className="mt-3 h-12 w-3/4 animate-pulse rounded bg-[var(--color-border)]" />
      <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-[var(--color-border)]" />

      {/* How it works skeleton */}
      <div className="mt-8 h-32 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />

      {/* Balance cards */}
      <div className="mt-8 grid gap-6">
        <div className="h-44 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-44 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-28 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
      </div>
    </main>
  )
}
