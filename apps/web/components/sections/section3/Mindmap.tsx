'use client'

import { CONTRACTS, addressUrl, truncate } from '@/lib/chainscan'
import { CONTRACTS_META, SNAPSHOT_TAKEN_AT, TVS_BREAKDOWN } from '@/lib/snapshot'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

const NODES = [
  {
    id: 'payroll',
    label: 'AnimaPayroll',
    sub: 'Confidential Vault · ERC-7984',
    x: 590,
    y: 80,
    role: 'contract',
    address: CONTRACTS_META.animaPayroll.address,
  },
  {
    id: 'fhevm',
    label: 'Zama FHEVM',
    sub: 'euint64 · ebool · FHE ops',
    x: 130,
    y: 220,
    role: 'infra',
  },
  {
    id: 'sepolia',
    label: 'Ethereum Sepolia',
    sub: 'chainId 11155111',
    x: 1050,
    y: 220,
    role: 'infra',
  },
  {
    id: 'registry',
    label: 'AnimaRegistryRouter',
    sub: 'Wrapper Registry · Bounty',
    x: 200,
    y: 540,
    role: 'contract',
    address: CONTRACTS_META.animaRegistryRouter.address,
  },
  {
    id: 'disperse',
    label: 'AnimaDisperse',
    sub: 'Distribution Engine · TokenOps',
    x: 980,
    y: 540,
    role: 'contract',
    address: CONTRACTS_META.animaDisperse.address,
  },
  {
    id: 'morpho',
    label: 'Morpho',
    sub: 'cPrime USDC · composability',
    x: 70,
    y: 420,
    role: 'external',
  },
  {
    id: 'tokenops',
    label: 'TokenOps SDK',
    sub: 'confidential airdrops',
    x: 1110,
    y: 420,
    role: 'external',
  },
  {
    id: 'relayer',
    label: 'Zama Relayer',
    sub: 'EIP-712 decrypt proxy',
    x: 60,
    y: 60,
    role: 'infra',
  },
  {
    id: 'fheSdk',
    label: '@zama-fhe/react-sdk',
    sub: 'client-side encryption',
    x: 1120,
    y: 60,
    role: 'external',
  },
] as const

const EDGES: Array<{ from: string; to: string; particle: string }> = [
  { from: 'anima', to: 'payroll', particle: 'hex' },
  { from: 'anima', to: 'fhevm', particle: 'hex' },
  { from: 'anima', to: 'sepolia', particle: 'cursor' },
  { from: 'anima', to: 'registry', particle: 'envelope' },
  { from: 'anima', to: 'disperse', particle: 'gavel' },
  { from: 'payroll', to: 'morpho', particle: 'envelope' },
  { from: 'disperse', to: 'tokenops', particle: 'gavel' },
  { from: 'relayer', to: 'anima', particle: 'cursor' },
  { from: 'fheSdk', to: 'anima', particle: 'cursor' },
]

const ANIMA_POS = { x: 590, y: 320 }

export function Mindmap() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="relative">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <div className="kicker mb-3">System · Architecture</div>
          <h2 className="font-display max-w-[680px] text-[clamp(40px,5.4vw,72px)] font-light leading-[1.02] tracking-[-0.018em] text-[var(--color-ink)]">
            Encrypted, <span className="font-italic-serif italic">proven</span>.
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-2)]">
            Every line on this graph is a deployed contract. Not a demo, not a mockup — live on
            Ethereum Sepolia, verified on Etherscan, processing encrypted transactions.
          </p>
        </div>
        <span className="font-mono inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-1.5 text-[10.5px] tracking-[0.04em] text-[var(--color-ink-3)]">
          ↻ Snapshot · {new Date(SNAPSHOT_TAKEN_AT).toUTCString().replace('GMT', 'UTC')}
        </span>
      </div>

      <div className="relative aspect-[1180/640] w-full overflow-hidden rounded-[16px] border border-[var(--color-border-strong)] bg-[var(--color-cream)] shadow-[0_30px_80px_-50px_rgba(40,28,18,0.4)]">
        <Image
          src="/aurelia/cloud-islands.png"
          alt=""
          fill
          aria-hidden
          priority
          quality={70}
          sizes="100vw"
          className="object-cover opacity-[0.16]"
          style={{ filter: 'blur(70px) saturate(0.8)', transform: 'scale(1.15)' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--color-cream)]/85 via-[var(--color-cream)]/55 to-[var(--color-cream)]/85" />

        <svg
          role="img"
          aria-label="Anima on-chain architecture: three deployed contracts connected to Zama FHEVM, Ethereum Sepolia, and external integrations."
          viewBox="0 0 1180 640"
          className="absolute inset-0 h-full w-full"
        >
          <title>Anima on-chain architecture</title>
          <desc>
            Anima contracts at the center connected to AnimaPayroll, AnimaRegistryRouter,
            AnimaDisperse, Zama FHEVM co-processor, Ethereum Sepolia, Morpho vault,
            TokenOps SDK, Zama Relayer, and @zama-fhe/react-sdk.
          </desc>
          <defs>
            <radialGradient id="alivePulse" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0.18" />
              <stop offset="60%" stopColor="var(--color-ink)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0" />
            </radialGradient>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 8 5 L 0 10 z" fill="var(--color-ink-2)" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map((edge, i) => {
            const fromPos =
              edge.from === 'anima' ? ANIMA_POS : NODES.find(n => n.id === edge.from)!
            const toPos = edge.to === 'anima' ? ANIMA_POS : NODES.find(n => n.id === edge.to)!
            const isActive =
              !hovered ||
              hovered === edge.from ||
              hovered === edge.to ||
              (hovered === 'anima' && (edge.from === 'anima' || edge.to === 'anima'))
            const path = curvedPath(fromPos.x, fromPos.y, toPos.x, toPos.y)
            return (
              <g
                key={`${edge.from}-${edge.to}-${i}`}
                opacity={isActive ? 1 : 0.18}
                style={{ transition: 'opacity 0.3s' }}
              >
                <motion.path
                  d={path}
                  stroke="var(--color-ink-2)"
                  strokeWidth="1.6"
                  strokeDasharray="4 7"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1.2, delay: 0.4 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                />
                <Particle path={path} kind={edge.particle} delay={i * 0.7} />
              </g>
            )
          })}

          {/* Anima center node */}
          <g
            onMouseEnter={() => setHovered('anima')}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            <motion.circle
              cx={ANIMA_POS.x}
              cy={ANIMA_POS.y}
              r={140}
              fill="url(#alivePulse)"
              animate={{ r: [128, 142, 128] }}
              transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            />
            <motion.rect
              x={ANIMA_POS.x - 130}
              y={ANIMA_POS.y - 78}
              rx={14}
              ry={14}
              width={260}
              height={156}
              fill="var(--color-cream-warm)"
              stroke="var(--color-ink)"
              strokeWidth="1.4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            />
            <foreignObject
              x={ANIMA_POS.x - 130}
              y={ANIMA_POS.y - 78}
              width={260}
              height={156}
              className="pointer-events-none"
            >
              <div className="flex h-full flex-col gap-1 px-5 py-3 text-[11px] text-[var(--color-ink)]">
                <div className="font-mono flex items-center justify-between text-[9.5px] tracking-[0.04em] text-[var(--color-ink-3)]">
                  <span>TVS: {TVS_BREAKDOWN.total.toLocaleString()} USDC</span>
                  <AlivePulseDot />
                </div>
                <div className="font-display mt-0.5 text-[18px] font-medium leading-none text-[var(--color-ink)]">
                  anima
                </div>
                <div className="font-mono text-[10px] text-[var(--color-ink-2)]">
                  Ethereum Sepolia · Zama FHE
                </div>
                <div className="font-mono mt-auto grid grid-cols-3 gap-1 text-[10px]">
                  <Pill label="Vault" value={truncate(CONTRACTS_META.animaPayroll.address, 4, 4)} />
                  <Pill label="Router" value={truncate(CONTRACTS_META.animaRegistryRouter.address, 4, 4)} />
                  <Pill label="Disperse" value={truncate(CONTRACTS_META.animaDisperse.address, 4, 4)} />
                </div>
              </div>
            </foreignObject>
          </g>

          {/* Surrounding nodes */}
          {NODES.map(node => {
            const displayLabel = node.role === 'contract'
              ? `${node.label}\n${truncate(node.address!, 6, 4)}`
              : node.label
            return (
              <g
                key={node.id}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                opacity={hovered && hovered !== node.id && hovered !== 'anima' ? 0.45 : 1}
                style={{ transition: 'opacity 0.3s', cursor: 'pointer' }}
              >
                <NodeShape node={{ ...node, label: displayLabel }} />
              </g>
            )
          })}
        </svg>

        <div className="pointer-events-none absolute bottom-3 right-4 flex items-center gap-2 text-[11px] text-[var(--color-ink-3)]">
          <a
            href={addressUrl(CONTRACTS.AnimaPayroll)}
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto font-mono text-[var(--color-ink-2)] underline-offset-2 hover:text-[var(--color-ink)] hover:underline"
          >
            verify on Etherscan ↗
          </a>
        </div>
      </div>

      <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-[var(--color-ink-2)]">
        Every line on this graph is a deployed contract. Not a demo — live on Sepolia.
      </p>
    </div>
  )
}

function curvedPath(x1: number, y1: number, x2: number, y2: number) {
  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  const ox = (y2 - y1) * 0.18
  const oy = (x1 - x2) * 0.18
  return `M ${x1} ${y1} Q ${cx + ox} ${cy + oy} ${x2} ${y2}`
}

function Particle({ path, kind, delay }: { path: string; kind: string; delay: number }) {
  const id = `path-${kind}-${delay.toFixed(2).replace('.', '_')}`
  return (
    <g aria-hidden>
      <path id={id} d={path} fill="none" stroke="none" />
      <text
        fontSize="14"
        fill="var(--color-ink)"
        fontFamily="var(--font-mono), 'Geist Mono', monospace"
      >
        <textPath href={`#${id}`} startOffset="0%">
          <animate
            attributeName="startOffset"
            from="0%"
            to="100%"
            dur="2.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          {kind === 'hex' ? '◇' : kind === 'envelope' ? '✉' : kind === 'gavel' ? '⚖' : '›'}
        </textPath>
      </text>
    </g>
  )
}

function NodeShape({ node }: { node: { id: string; label: string; sub: string; x: number; y: number; role: string; address?: string } }) {
  const w = 180
  const h = 64
  const isContract = node.role === 'contract'
  const fill = isContract ? 'var(--color-cream-warm)' : node.role === 'infra' ? 'var(--color-cream)' : 'var(--color-paper)'
  const stroke = isContract ? 'var(--color-ink)' : 'var(--color-ink-2)'
  return (
    <>
      <motion.rect
        x={node.x - w / 2}
        y={node.y - h / 2}
        rx={isContract ? 8 : 32}
        ry={isContract ? 8 : 32}
        width={w}
        height={h}
        fill={fill}
        stroke={stroke}
        strokeWidth="1"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <foreignObject x={node.x - w / 2} y={node.y - h / 2} width={w} height={h}>
        <div className="flex h-full flex-col items-center justify-center px-3 py-2 text-center">
          <span className="font-display text-[13px] leading-none text-[var(--color-ink)]">
            {node.label.split('\n')[0]}
          </span>
          {(node.label.split('\n').length > 1) ? (
            <span className="font-mono mt-0.5 text-[9px] tracking-[0.04em] text-[var(--color-ink-3)]">
              {node.label.split('\n')[1]}
            </span>
          ) : (
            <span className="font-mono mt-1 text-[10px] tracking-[0.04em] text-[var(--color-ink-3)]">
              {node.sub}
            </span>
          )}
        </div>
      </foreignObject>
    </>
  )
}

function AlivePulseDot() {
  return (
    <motion.span
      animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.4, 1] }}
      transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      className="inline-flex items-center gap-1 text-[var(--color-ink)]"
    >
      <span className="block h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]" />
      live
    </motion.span>
  )
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-cream)]/55 px-1.5 py-1 text-center">
      <div className="text-[8.5px] tracking-[0.04em] text-[var(--color-ink-3)]">{label}</div>
      <div className="text-[10.5px] text-[var(--color-ink)]">{value}</div>
    </div>
  )
}
