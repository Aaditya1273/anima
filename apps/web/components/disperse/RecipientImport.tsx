'use client'

import { ShieldBadge } from '@/components/fhe/ConfidentialAmount'
import { type DragEvent, useCallback, useRef, useState } from 'react'

export type RecipientItem = { address: string; amount: string }

type Props = {
  recipients: RecipientItem[]
  onRecipientsChange: (recipients: RecipientItem[]) => void
}

export function RecipientImport({ recipients, onRecipientsChange }: Props) {
  const [addressInput, setAddressInput] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const csvRef = useRef<HTMLInputElement>(null)

  function addRecipient() {
    if (!addressInput || !amountInput) return
    onRecipientsChange([...recipients, { address: addressInput, amount: amountInput }])
    setAddressInput('')
    setAmountInput('')
  }

  function removeRecipient(i: number) {
    onRecipientsChange(recipients.filter((_, idx) => idx !== i))
  }

  const handleCsvFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = e => {
        const text = (e.target?.result as string) ?? ''
        const rows = text
          .split('\n')
          .map(r => r.trim())
          .filter(r => r && !r.startsWith('#'))
        const parsed: RecipientItem[] = []
        for (const row of rows) {
          const [addr, amt] = row.split(',')
          if (addr?.startsWith('0x') && amt && Number(amt) > 0) {
            parsed.push({ address: addr.trim(), amount: amt.trim() })
          }
        }
        if (parsed.length > 0) {
          onRecipientsChange([...recipients, ...parsed])
        }
      }
      reader.readAsText(file)
    },
    [recipients, onRecipientsChange],
  )

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleCsvFile(file)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleCsvFile(file)
    e.target.value = ''
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
      <h2 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">
        Add recipients
      </h2>
      <p className="mt-1 text-[13px] text-[var(--color-ink-2)]">
        Each amount is FHE-encrypted by the TokenOps SDK before it reaches the chain. The full
        recipient list is never revealed on-chain.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
            Address (0x...)
          </label>
          <input
            type="text"
            value={addressInput}
            onChange={e => setAddressInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') addRecipient()
            }}
            placeholder="0x..."
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 font-mono text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink-2)]"
          />
        </div>
        <div className="w-full sm:w-36">
          <label className="block font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
            Amount
          </label>
          <input
            type="number"
            value={amountInput}
            onChange={e => setAmountInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') addRecipient()
            }}
            placeholder="0.00"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 font-mono text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink-2)]"
          />
        </div>
        <button
          type="button"
          onClick={addRecipient}
          disabled={!addressInput || !amountInput}
          className="rounded-lg bg-[var(--color-ink)] px-4 py-2 text-[13px] font-medium text-[var(--color-cream)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* CSV import */}
      <div
        className="mt-3 cursor-pointer rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-center transition-colors hover:border-[var(--color-ink-3)]"
        onClick={() => csvRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={csvRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={handleFileSelect}
        />
        <span className="text-[13px] text-[var(--color-ink-3)]">
          Drop CSV or click to import — one row per line:{' '}
          <code className="font-mono">0xAddress,amount</code>
        </span>
      </div>

      {/* Recipient list */}
      {recipients.length > 0 ? (
        <div className="mt-4 space-y-1.5">
          {recipients.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <ShieldBadge />
                <span className="truncate font-mono text-[12px] text-[var(--color-ink-2)]">
                  {r.address.slice(0, 6)}…{r.address.slice(-4)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px] text-[var(--color-ink)]">{r.amount}</span>
                <button
                  type="button"
                  onClick={() => removeRecipient(i)}
                  className="text-[11px] text-[var(--color-ink-3)] hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onRecipientsChange([])}
            className="mt-1 text-[12px] text-[var(--color-ink-3)] hover:text-red-500"
          >
            Clear all
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-6 text-center">
          <span className="text-[13px] text-[var(--color-ink-3)]">No recipients yet</span>
        </div>
      )}
    </div>
  )
}
