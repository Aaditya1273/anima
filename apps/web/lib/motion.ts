// Shared motion vocabulary for the console surface. One ease + one duration
// scale so hovers, entrances, and menu transitions read as one hand instead of
// a pile of ad-hoc literals. Pair with <MotionConfig reducedMotion="user"> at
// the console root so framer auto-suppresses transform/opacity entrances.
export const EASE = [0.22, 1, 0.36, 1] as const

export const DUR = {
  xfast: 0.15,
  fast: 0.2,
  base: 0.3,
  slow: 0.45,
} as const
