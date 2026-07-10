export default function ClaimLoading() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-28">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="h-4 w-36 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-3 h-12 w-1/2 animate-pulse rounded bg-[var(--color-border)]" />
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        <div className="h-44 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-32 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-40 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        <div className="h-20 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
      </div>
    </main>
  )
}
