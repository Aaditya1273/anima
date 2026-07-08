// Section 3 · Architecture mindmap — live contracts on Ethereum Sepolia + Zama FHEVM

import { Mindmap } from './section3/Mindmap'
import { Mindmap as MindmapMobile } from './section3/MindmapMobile'

export function Section3() {
  return (
    <section
      id="section-sovereignty"
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-[var(--color-cream)] py-[var(--section-py)]"
    >
      <div className="mx-auto w-full max-w-[var(--container-wrap)] px-6 sm:px-8">
        <div className="hidden md:block">
          <Mindmap />
        </div>
        <div className="md:hidden">
          <MindmapMobile />
        </div>
      </div>
    </section>
  )
}
