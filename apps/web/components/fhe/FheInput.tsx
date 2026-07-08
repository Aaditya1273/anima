'use client'

import { useState, type InputHTMLAttributes } from 'react'

type Props = {
  /** Label for the input */
  label: string
  /** Placeholder text */
  placeholder?: string
  /** Token symbol suffix */
  symbol?: string
  /** Called when the user confirms the amount (Phase 3: encrypts via SDK first) */
  onConfirm?: (amount: string) => void
  /** Whether the operation is pending */
  isPending?: boolean
  /** HTML input type */
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  /** Error message */
  error?: string | null
}

export function FheInput({
  label,
  placeholder = '0.00',
  symbol,
  onConfirm,
  isPending = false,
  type = 'number',
  error,
}: Props) {
  const [value, setValue] = useState('')

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex flex-1 items-center">
          <input
            type={type}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            disabled={isPending}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 font-mono text-[14px] text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-ink-2)] disabled:cursor-wait disabled:opacity-60"
          />
          {symbol ? (
            <span className="pointer-events-none absolute right-3 font-mono text-[12px] text-[var(--color-ink-3)]">
              {symbol}
            </span>
          ) : null}
        </div>
        {onConfirm ? (
          <button
            type="button"
            onClick={() => {
              if (value) onConfirm(value)
              setValue('')
            }}
            disabled={!value || isPending}
            className="shrink-0 rounded-lg bg-[var(--color-ink)] px-4 py-2 text-[13px] font-medium text-[var(--color-cream)] transition-all hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
          >
            {isPending ? 'Encrypting…' : 'Confirm'}
          </button>
        ) : null}
      </div>
      {error ? (
        <span className="font-mono text-[11px] text-red-500">{error}</span>
      ) : null}
    </div>
  )
}