'use client'

import { Streamdown } from 'streamdown'
import type { MermaidOptions } from 'streamdown'

// Streaming markdown for assistant replies, ported from pragma-v2-stable's
// Streamdown wrapper but restyled to anima's editorial "literary cream" palette
// (--color-* tokens, Geist Mono code, no terracotta, no red/green). Dark mode is
// driven by the `.dark` ancestor class (same as the rest of the app) so theme
// switches don't re-render and lose scroll. Mermaid is always rendered light and
// CSS-inverted in dark, matching the pragma approach.

interface MarkdownRendererProps {
  content: string
  isAnimating?: boolean
}

function preprocessContent(content: string): string {
  let cleaned = content.replace(/\r\n/g, '\n')
  // Drop agent-internal bracketed addresses + quote-id HTML comments.
  cleaned = cleaned.replace(/\[0x[a-fA-F0-9]{40,}\]/g, '')
  cleaned = cleaned.replace(/<!--QUOTE_ID:[^>]+-->/g, '')
  return cleaned
}

const mermaidOptions: MermaidOptions = {
  config: {
    theme: 'default',
    themeVariables: {
      primaryColor: '#f2f1ee',
      primaryTextColor: '#100f09',
      primaryBorderColor: '#100f09',
      lineColor: '#525251',
      secondaryColor: '#f0e8d6',
      tertiaryColor: '#fbfbf9',
      background: '#f9f8f6',
      mainBkg: '#fbfbf9',
      titleColor: '#100f09',
    },
  },
}

export function MarkdownRenderer({ content, isAnimating = false }: MarkdownRendererProps) {
  return (
    <div className="anima-md max-w-none break-words">
        <Streamdown
          isAnimating={isAnimating}
          mermaid={mermaidOptions}
          components={{
            // Never override pre/code (would double Mermaid containers) — CSS only.
            h1: ({ children }) => (
              <p
                className="mb-2 mt-5 font-display text-[20px] font-medium leading-tight text-[var(--color-ink)] first:mt-0"
                style={{ fontVariationSettings: '"opsz" 28, "SOFT" 24, "WONK" 0' }}
              >
                {children}
              </p>
            ),
            h2: ({ children }) => (
              <p
                className="mb-2 mt-4 font-display text-[17px] font-medium leading-snug text-[var(--color-ink)] first:mt-0"
                style={{ fontVariationSettings: '"opsz" 22, "SOFT" 24, "WONK" 0' }}
              >
                {children}
              </p>
            ),
            h3: ({ children }) => (
              <p className="mb-1.5 mt-3 font-semibold text-[15px] text-[var(--color-ink)] first:mt-0">
                {children}
              </p>
            ),
            p: ({ children }) => <p className="mb-2 leading-[1.72] last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="mb-2 ml-5 list-disc space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="mb-2 ml-5 list-decimal space-y-1">{children}</ol>,
            li: ({ children }) => <li className="leading-[1.6]">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="my-2 border-l-2 border-[var(--color-border-strong)] pl-3 text-[var(--color-ink-2)] italic">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-ink)] underline decoration-[var(--color-border-strong)] underline-offset-[3px] transition hover:decoration-[var(--color-ink)]"
              >
                {children}
              </a>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-[var(--color-ink)]">{children}</strong>
            ),
            em: ({ children }) => <span className="text-[var(--color-ink-2)]">{children}</span>,
            hr: () => <hr className="my-3 h-px border-none bg-[var(--color-border)]" />,
            // Tables: one clean editorial frame. Overriding the table family
            // replaces Streamdown's default table block (which ships a
            // copy/download/fullscreen toolbar AND its own bordered wrapper) so
            // we don't get a double-bordered box. A single hairline frame, a
            // tinted header, and divide-y row separators.
            table: ({ children }) => (
              <div className="my-3 overflow-x-auto rounded-[10px] border border-[var(--color-border)]">
                <table className="w-full border-collapse font-mono text-[12.5px] [font-feature-settings:'tnum'_1]">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="border-b border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-ink)_4%,transparent)]">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-[var(--color-border)]">{children}</tbody>
            ),
            th: ({ children }) => (
              <th className="px-3.5 py-2 text-left font-semibold text-[var(--color-ink)]">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3.5 py-2 text-left text-[var(--color-ink-2)]">{children}</td>
            ),
          }}
        >
          {preprocessContent(content)}
        </Streamdown>
    </div>
  )
}
