'use client'

type Props = {
  cliffDays: number
  linearDays: number
  onCliffChange: (days: number) => void
  onLinearChange: (days: number) => void
}

export function VestingSchedule({ cliffDays, linearDays, onCliffChange, onLinearChange }: Props) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div>
        <label className="block font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
          Cliff (days)
        </label>
        <input
          type="number"
          value={cliffDays}
          onChange={e => onCliffChange(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 font-mono text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink-2)]"
        />
      </div>
      <div>
        <label className="block font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
          Linear vesting (days)
        </label>
        <input
          type="number"
          value={linearDays}
          onChange={e => onLinearChange(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 font-mono text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink-2)]"
        />
      </div>
      <p className="col-span-2 text-[13px] text-[var(--color-ink-3)]">
        Cliff + linear schedule encoded in AnimaDisperse.VestingSchedule. The claimable fraction is
        computed on-chain via{' '}
        <code className="font-mono">FHE.shr(FHE.mul(allocation, fraction), 20)</code> — never
        revealed.
      </p>
    </div>
  )
}
