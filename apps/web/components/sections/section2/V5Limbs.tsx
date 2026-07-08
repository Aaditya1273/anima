'use client'

import { TOTAL_FHE_OPS, FHE_OPS_CATALOG } from '@/lib/snapshot'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { LayerHeader } from './V2Identity'

export function V5Limbs() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <section
      id="layer-limbs"
      className="relative flex min-h-screen items-center overflow-hidden py-[var(--section-py)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-ink-3) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative mx-auto w-full max-w-[var(--container-wrap)] px-6 sm:px-8">
        <LayerHeader idx="04" title="FHE Operations" pill={`${TOTAL_FHE_OPS} primitives · 5 categories`} />
        <div className="mb-10 grid items-baseline gap-8 lg:grid-cols-12">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(36px,5vw,68px)] font-light leading-[1.04] tracking-[-0.018em] text-[var(--color-ink)] lg:col-span-7"
          >
            The contract decides. FHE <span className="font-italic-serif italic">just executes</span>.
          </motion.h2>
          <p className="max-w-md text-[15px] leading-relaxed text-[var(--color-ink-2)] lg:col-span-5">
            Every FHE primitive is a tool in the co-processor toolbox. No plaintext touches the
            EVM. Arithmetic runs homomorphically. Permissions are explicit via FHE.allow. 
            Every operation is auditable on-chain — the inputs are encrypted, the operation itself
            is transparent.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          transition={{ staggerChildren: 0.04 }}
          className="space-y-5"
        >
          {FHE_OPS_CATALOG.map(cat => (
            <motion.div
              key={cat.category}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              transition={{ staggerChildren: 0.025 }}
              onMouseEnter={() => setActiveCategory(cat.category)}
              onMouseLeave={() => setActiveCategory(null)}
              className="grid grid-cols-12 items-baseline gap-4"
              style={{
                opacity: activeCategory && activeCategory !== cat.category ? 0.32 : 1,
                transition: 'opacity 0.25s',
              }}
            >
              <div className="font-mono col-span-12 text-[10.5px] tracking-[0.04em] text-[var(--color-ink-2)] sm:col-span-2">
                {cat.category} <span className="text-[var(--color-ink-3)]">/{cat.ops.length}</span>
              </div>
              <div className="col-span-12 flex flex-wrap gap-1.5 sm:col-span-10">
                {cat.ops.map(t => (
                  <ToolChip key={t.name} name={t.name} desc={t.desc} />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-12 text-[13px] text-[var(--color-ink-2)]"
        >
          {TOTAL_FHE_OPS} FHE primitives. No plaintext. Every operation verified by ZKPoK.
        </motion.p>
      </div>
    </section>
  )
}

function ToolChip({ name, desc }: { name: string; desc: string }) {
  return (
    <motion.span
      variants={{
        hidden: { opacity: 0, y: 10, scale: 0.92 },
        show: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      whileHover={{ y: -2, scale: 1.03 }}
      title={desc}
      className="font-mono inline-flex cursor-default items-center rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-1.5 text-[11.5px] text-[var(--color-ink)] shadow-[0_2px_4px_-2px_rgba(26,20,16,0.08)] transition-shadow hover:shadow-[0_4px_10px_-3px_rgba(26,20,16,0.18)]"
    >
      {name}
    </motion.span>
  )
}
