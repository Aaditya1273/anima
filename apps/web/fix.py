import re

with open('/home/bajrangi/Wins/Aegis-Vault/apps/web/components/sections/section2/V1Opener.tsx', 'r') as f:
    content = f.read()

# Remove the LAYERS array and imports
content = re.sub(r"import \{ V2Identity \}.*?\]\n", "", content, flags=re.DOTALL)

# Bring back ChapterPanel
chapter_panel_code = """
function ChapterPanel({
  ch,
  index,
  total,
  progress,
}: {
  ch: Chapter
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const { opacity, y } = usePanelStyle(progress, index, total)

  const panelStart = index / total
  const numeralStage = useStageReveal(progress, [panelStart + 0.005, panelStart + 0.025])
  const headlineStage = useStageReveal(progress, [panelStart + 0.022, panelStart + 0.048])
  const bodyStage = useStageReveal(progress, [panelStart + 0.042, panelStart + 0.075])

  return (
    <motion.article
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center"
    >
      <motion.div style={numeralStage} className="font-display font-light">
        <span
          style={{
            fontVariationSettings: '"opsz" 144, "SOFT" 0, "WONK" 0',
            fontSize: 'clamp(34px, 3.4vw, 52px)',
            lineHeight: 1,
            color: 'var(--color-ink-3)',
          }}
        >
          {ch.numeral}
        </span>
      </motion.div>
      <motion.h3 style={headlineStage} className="font-display mt-8 font-light">
        <span
          style={{
            fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0',
            fontSize: 'clamp(36px, 4.2vw, 60px)',
            lineHeight: 1.04,
            letterSpacing: '-0.02em',
            color: 'var(--color-ink)',
          }}
        >
          {ch.headline}
        </span>
      </motion.h3>
      <motion.p style={bodyStage} className="font-body mt-7 max-w-[44ch]">
        <span style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--color-ink-2)' }}>
          {ch.body}
        </span>
      </motion.p>
    </motion.article>
  )
}
"""

content = re.sub(r"function LayerPanel\(\{.*?\}\) \{.*?\}\n", chapter_panel_code, content, flags=re.DOTALL)

# Replace LAYERS.map back to CHAPTERS.map in V1Opener
new_jsx = """
        {/* Full-width fading mockups (to be implemented later) */}
        
        {/* Constrained layout for Trio and Run panels */}
        <div className="relative z-20 mx-auto w-full max-w-[var(--container-wrap)] px-6 sm:px-10 pointer-events-none">
          <div className="relative h-[72vh] w-full md:w-[58%] lg:w-[52%] pointer-events-auto">
            <TrioPanel index={0} total={PANEL_COUNT} progress={progress} />
            {CHAPTERS.map((ch, i) => (
              <ChapterPanel
                key={ch.numeral}
                ch={ch}
                index={i + 1}
                total={PANEL_COUNT}
                progress={progress}
              />
            ))}
            <RunPanel index={CHAPTERS.length + 1} total={PANEL_COUNT} progress={progress} />
          </div>
        </div>
"""
content = re.sub(r"\{/\* Full-width fading mockups \*/\}.*?</div>\n        </div>", new_jsx.strip(), content, flags=re.DOTALL)

# Replace LAYERS.map back to CHAPTERS.map in StackedFallback
fallback_jsx = """
        {CHAPTERS.map(ch => (
          <article key={ch.numeral}>
            <div
              className="font-display font-light"
              style={{
                fontVariationSettings: '"opsz" 144, "SOFT" 0, "WONK" 0',
                fontSize: 'clamp(34px, 3.4vw, 52px)',
                lineHeight: 1,
                color: 'var(--color-ink-3)',
              }}
            >
              {ch.numeral}
            </div>
            <h3
              className="font-display mt-6 font-light"
              style={{
                fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0',
                fontSize: 'clamp(36px, 4.2vw, 60px)',
                lineHeight: 1.04,
                letterSpacing: '-0.02em',
                color: 'var(--color-ink)',
              }}
            >
              {ch.headline}
            </h3>
            <p
              className="font-body mt-6 max-w-[44ch]"
              style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--color-ink-2)' }}
            >
              {ch.body}
            </p>
          </article>
        ))}
"""
content = re.sub(r"\{LAYERS\.map\(\(Layer, i\) => \(\n\s*<Layer key=\{i\} />\n\s*\)\)\}", fallback_jsx.strip(), content)

with open('/home/bajrangi/Wins/Aegis-Vault/apps/web/components/sections/section2/V1Opener.tsx', 'w') as f:
    f.write(content)
