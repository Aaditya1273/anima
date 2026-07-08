// Section 4 · Closing CTA — confidential finance

import { ClosingCta } from './section4/ClosingCta'

export function Section4() {
  return (
    <section
      id="section-closing"
      className="relative flex min-h-screen items-center bg-[var(--color-cream)] py-[var(--section-py)]"
    >
      <div className="mx-auto w-full max-w-[var(--container-wrap)] px-6 sm:px-8">
        <ClosingCta />
      </div>
    </section>
  )
}
